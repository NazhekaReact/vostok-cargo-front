import { Briefcase, ChevronDown, Search, Truck } from 'lucide-react-native';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { placeBidRequest } from '../../api/bids';
import { assignOrderRequest, getDriversRequest, getVehiclesRequest } from '../../api/fleet';
import BottomSheet from '../../components/BottomSheet';
import OrderCard from '../../components/OrderCard';
import AppContext from '../../context/AppContext';
import styles from '../../styles/appStyles';
import { t } from '../../utils/i18n';
import { getRouteLabel } from '../../utils/orderData';

const getEntityId = (value: any) => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return value._id || value.id || '';
};

const getAcceptedBidLogisticianId = (order: any) => {
  const acceptedBid = order?.bids?.find((bid: any) => bid.status === 'ACCEPTED');
  return getEntityId(acceptedBid?.logistician);
};

const getOrderLogisticianId = (order: any) =>
  getEntityId(order?.executor?.logistician) || getAcceptedBidLogisticianId(order);

const isOpenForExchange = (order: any) =>
  ['PUBLISHED', 'NEGOTIATION'].includes(order?.status) && !getOrderLogisticianId(order);

const isMyWorkOrder = (order: any, logisticianId?: string) =>
  Boolean(logisticianId) &&
  getOrderLogisticianId(order) === logisticianId &&
  !['PUBLISHED', 'NEGOTIATION', 'DELIVERED'].includes(order?.status);

export default function LogisticianDashboard() {
  const { navigate, orders, showToast, currentUserId, currentUser, loadOrders, loadingOrders, isDark, language } = useContext(AppContext);
  const [tab, setTab] = useState('search');
  const [bidOrder, setBidOrder] = useState<any>(null);
  const [bidAmount, setBidAmount] = useState('');
  const [bidComment, setBidComment] = useState('');
  const [assignOrder, setAssignOrder] = useState<any>(null);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const searchOrders = orders.filter(isOpenForExchange);

  const workOrders = orders.filter((order: any) => isMyWorkOrder(order, currentUserId));

  const selectedVehicle = vehicles.find((vehicle: any) => vehicle._id === selectedVehicleId);
  const selectedDriver = drivers.find((driver: any) => driver._id === selectedDriverId);

  const loadFleet = useCallback(async () => {
    if (!currentUserId) return;

    try {
      const [vehiclesData, driversData] = await Promise.all([
        getVehiclesRequest(currentUserId),
        getDriversRequest(currentUserId),
      ]);
      const nextVehicles = Array.isArray(vehiclesData) ? vehiclesData : [];
      const nextDrivers = Array.isArray(driversData) ? driversData : [];

      setVehicles(nextVehicles);
      setDrivers(nextDrivers);
      setSelectedVehicleId((prev: string) => prev || nextVehicles[0]?._id || '');
      setSelectedDriverId((prev: string) => prev || nextDrivers[0]?._id || '');
    } catch (error: any) {
      console.log('loadFleet error:', error?.response?.data || error?.message);
    }
  }, [currentUserId]);

  const refreshDashboard = useCallback(async () => {
    await Promise.all([
      loadOrders?.(),
      loadFleet(),
    ]);
  }, [loadFleet, loadOrders]);

  const onPlaceBid = async () => {
    if (!bidOrder?._id) {
      showToast('Выберите заказ');
      return;
    }

    if (!currentUserId) {
      showToast('Нет логиста для ставки');
      return;
    }

    try {
      setIsSubmitting(true);
      await placeBidRequest(bidOrder._id, {
        amount: Number(bidAmount) || 0,
        comment: bidComment,
        logisticianId: currentUserId,
        logisticianName: currentUser?.name,
      });
      showToast('Ставка отправлена');
      setBidOrder(null);
      await loadOrders?.();
    } catch (error: any) {
      console.log('PLACE BID ERROR:', error?.response?.data || error?.message || error);
      showToast('Не удалось отправить ставку');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onAssignOrder = async () => {
    if (!assignOrder?._id || (!selectedVehicleId && !selectedDriverId)) {
      showToast('Выберите машину или водителя');
      return;
    }

    try {
      setIsSubmitting(true);
      await assignOrderRequest(assignOrder._id, {
        vehicleId: selectedVehicleId || undefined,
        driverId: selectedDriverId || undefined,
      });
      showToast('Машина назначена');
      setAssignOrder(null);
      await loadOrders?.();
    } catch (error: any) {
      console.log('ASSIGN ORDER ERROR:', error?.response?.data || error?.message || error);
      showToast('Не удалось назначить');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    loadFleet();
  }, [loadFleet]);

  return (
    <View style={styles.flex1}>
      <ScrollView
        contentContainerStyle={styles.scrollPadding}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={Boolean(loadingOrders)}
            onRefresh={refreshDashboard}
            tintColor="#3b82f6"
            colors={['#3b82f6']}
          />
        }
      >
        <View style={[styles.row, styles.justifyBetween, styles.mb6]}>
          <Text style={[styles.screenTitleNoMargin, isDark && styles.textWhite]}>{t('logist.title', language)}</Text>
          <TouchableOpacity style={styles.iconBtnBlue} onPress={() => navigate('Fleet')}>
            <Truck size={20} color="white" />
          </TouchableOpacity>
        </View>

        <View style={[styles.tabContainer, isDark && styles.tabContainerDark]}>
          <TouchableOpacity
            style={[styles.tabBtn, tab === 'search' && styles.tabBtnActive, tab === 'search' && isDark && styles.tabBtnActiveDark]}
            onPress={() => setTab('search')}
          >
            <Search size={16} color={tab === 'search' ? (isDark ? '#f9fafb' : '#000') : '#6b7280'} />
            <Text style={[styles.tabBtnText, tab === 'search' && styles.tabBtnTextActive, isDark && { color: '#9ca3af' }, tab === 'search' && isDark && styles.textWhite]}>
              {t('logist.exchange', language)}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, tab === 'work' && styles.tabBtnActive, tab === 'work' && isDark && styles.tabBtnActiveDark]}
            onPress={() => setTab('work')}
          >
            <Briefcase size={16} color={tab === 'work' ? (isDark ? '#f9fafb' : '#000') : '#6b7280'} />
            <Text style={[styles.tabBtnText, tab === 'work' && styles.tabBtnTextActive, isDark && { color: '#9ca3af' }, tab === 'work' && isDark && styles.textWhite]}>
              {t('logist.inWork', language)}
            </Text>
          </TouchableOpacity>
        </View>

        {tab === 'search' &&
          searchOrders.map((o: any) => (
            <OrderCard
              key={o._id}
              order={o}
              actionButton={
                <TouchableOpacity style={styles.btnLightBlue} onPress={() => setBidOrder(o)}>
                  <Text style={styles.btnLightBlueText}>{t('logist.placeBid', language)}</Text>
                </TouchableOpacity>
              }
            />
          ))}

        {tab === 'work' &&
          workOrders.map((o: any) => (
            <OrderCard
              key={o._id}
              order={o}
              onClick={() => navigate('OrderDetails', { id: o._id })}
              actionButton={
                o.status === 'APPROVED' ? (
                  <TouchableOpacity style={styles.btnGreen} onPress={() => setAssignOrder(o)}>
                    <Text style={styles.btnTextWhite}>{t('logist.assignVehicle', language)}</Text>
                  </TouchableOpacity>
                ) : null
              }
            />
          ))}
      </ScrollView>

      <BottomSheet visible={!!bidOrder} onClose={() => setBidOrder(null)}>
        <TextInput
          style={[styles.inputLarge, isDark && styles.inputDark]}
          value={bidAmount}
          onChangeText={setBidAmount}
          placeholder={t('logist.amount', language)}
          placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
          keyboardType="numeric"
        />
        <TextInput
          style={[styles.input, isDark && styles.inputDark]}
          value={bidComment}
          onChangeText={setBidComment}
          placeholder={t('logist.comment', language)}
          placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
        />
        <View style={[styles.row, styles.mt4]}>
          <TouchableOpacity
            style={[styles.btnBlue, styles.flex1, styles.mr2]}
            onPress={onPlaceBid}
            disabled={isSubmitting}
          >
            <Text style={styles.btnTextWhite}>
              {isSubmitting ? t('logist.sending', language) : t('logist.send', language)}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btnGray, styles.flex1, isDark && styles.btnGrayDark]}
            onPress={() => setBidOrder(null)}
          >
            <Text style={[styles.btnTextBlack, isDark && styles.textWhite]}>{t('logist.cancel', language)}</Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>

      <BottomSheet
        visible={!!assignOrder}
        onClose={() => setAssignOrder(null)}
        title={t('logist.assignTitle', language)}
        subtitle={
          assignOrder
            ? `${getRouteLabel(assignOrder, 'from', '—')} → ${getRouteLabel(assignOrder, 'to', '—')}`
            : undefined
        }
      >
        <Text style={[styles.inputLabel, isDark && { color: '#9ca3af' }]}>{t('logist.selectVehicle', language)}</Text>
        <TouchableOpacity
          style={[styles.selectMock, isDark && styles.selectMockDark]}
          onPress={() => {
            if (vehicles.length < 2) return;
            const currentIndex = vehicles.findIndex((vehicle: any) => vehicle._id === selectedVehicleId);
            const nextVehicle = vehicles[(currentIndex + 1) % vehicles.length];
            setSelectedVehicleId(nextVehicle?._id || '');
            setSelectedDriverId(nextVehicle?.currentDriver?._id || selectedDriverId);
          }}
        >
          <Text style={[styles.selectMockText, isDark && styles.selectMockTextDark]}>
            {selectedVehicle
              ? `${selectedVehicle.brand} (${selectedVehicle.plateNumber})`
              : t('logist.noVehicles', language)}
          </Text>
          <ChevronDown size={20} color="#9ca3af" />
        </TouchableOpacity>
        <Text style={[styles.inputLabel, styles.mt3, isDark && { color: '#9ca3af' }]}>{t('logist.selectDriver', language)}</Text>
        <TouchableOpacity
          style={[styles.selectMock, isDark && styles.selectMockDark]}
          onPress={() => {
            if (drivers.length < 2) return;
            const currentIndex = drivers.findIndex((driver: any) => driver._id === selectedDriverId);
            const nextDriver = drivers[(currentIndex + 1) % drivers.length];
            setSelectedDriverId(nextDriver?._id || '');
          }}
        >
          <Text style={[styles.selectMockText, isDark && styles.selectMockTextDark]}>
            {selectedDriver ? selectedDriver.name : t('logist.noDrivers', language)}
          </Text>
          <ChevronDown size={20} color="#9ca3af" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btnBlue, styles.mt4]}
          onPress={onAssignOrder}
          disabled={isSubmitting}
        >
          <Text style={styles.btnTextWhite}>
            {isSubmitting ? t('logist.assigning', language) : t('logist.assign', language)}
          </Text>
        </TouchableOpacity>
      </BottomSheet>
    </View>
  );
}
