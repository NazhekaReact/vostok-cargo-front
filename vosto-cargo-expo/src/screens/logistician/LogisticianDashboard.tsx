import { Briefcase, ChevronDown, Search, Truck } from 'lucide-react-native';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { placeBidRequest } from '../../api/bids';
import { assignOrderRequest, getDriversRequest, getVehiclesRequest } from '../../api/fleet';
import BottomSheet from '../../components/BottomSheet';
import OrderCard from '../../components/OrderCard';
import AppContext from '../../context/AppContext';
import styles from '../../styles/appStyles';

export default function LogisticianDashboard() {
  const { navigate, orders, showToast, currentUserId, currentUser, loadOrders } = useContext(AppContext);
  const [tab, setTab] = useState('search');
  const [bidOrder, setBidOrder] = useState<any>(null);
  const [bidAmount, setBidAmount] = useState('25000');
  const [bidComment, setBidComment] = useState('бензин подорожал');
  const [assignOrder, setAssignOrder] = useState<any>(null);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const searchOrders = orders.filter((o: any) =>
    ['PUBLISHED', 'NEGOTIATION'].includes(o.status)
  );

  const workOrders = orders.filter(
    (o: any) => !['PUBLISHED', 'NEGOTIATION', 'DELIVERED'].includes(o.status)
  );

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
      <ScrollView contentContainerStyle={styles.scrollPadding} showsVerticalScrollIndicator={false}>
        <View style={[styles.row, styles.justifyBetween, styles.mb6]}>
          <Text style={styles.screenTitleNoMargin}>Кабинет Логиста</Text>
          <TouchableOpacity style={styles.iconBtnBlue} onPress={() => navigate('Fleet')}>
            <Truck size={20} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabBtn, tab === 'search' && styles.tabBtnActive]}
            onPress={() => setTab('search')}
          >
            <Search size={16} color={tab === 'search' ? '#000' : '#6b7280'} />
            <Text style={[styles.tabBtnText, tab === 'search' && styles.tabBtnTextActive]}>
              Биржа
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, tab === 'work' && styles.tabBtnActive]}
            onPress={() => setTab('work')}
          >
            <Briefcase size={16} color={tab === 'work' ? '#000' : '#6b7280'} />
            <Text style={[styles.tabBtnText, tab === 'work' && styles.tabBtnTextActive]}>
              В работе
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
                  <Text style={styles.btnLightBlueText}>Сделать ставку</Text>
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
                    <Text style={styles.btnTextWhite}>Назначить машину</Text>
                  </TouchableOpacity>
                ) : null
              }
            />
          ))}
      </ScrollView>

      <BottomSheet visible={!!bidOrder} onClose={() => setBidOrder(null)}>
        <TextInput
          style={styles.inputLarge}
          value={bidAmount}
          onChangeText={setBidAmount}
          placeholder="Сумма"
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          value={bidComment}
          onChangeText={setBidComment}
          placeholder="Комментарий"
        />
        <View style={[styles.row, styles.mt4]}>
          <TouchableOpacity
            style={[styles.btnBlue, styles.flex1, styles.mr2]}
            onPress={onPlaceBid}
            disabled={isSubmitting}
          >
            <Text style={styles.btnTextWhite}>
              {isSubmitting ? 'Отправка...' : 'Отправить'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btnGray, styles.flex1]}
            onPress={() => setBidOrder(null)}
          >
            <Text style={styles.btnTextBlack}>Отмена</Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>

      <BottomSheet
        visible={!!assignOrder}
        onClose={() => setAssignOrder(null)}
        title="Назначение на рейс"
        subtitle="Астана → Астана"
      >
        <Text style={styles.inputLabel}>Выберите машину</Text>
        <TouchableOpacity
          style={styles.selectMock}
          onPress={() => {
            if (vehicles.length < 2) return;
            const currentIndex = vehicles.findIndex((vehicle: any) => vehicle._id === selectedVehicleId);
            const nextVehicle = vehicles[(currentIndex + 1) % vehicles.length];
            setSelectedVehicleId(nextVehicle?._id || '');
            setSelectedDriverId(nextVehicle?.currentDriver?._id || selectedDriverId);
          }}
        >
          <Text style={styles.selectMockText}>
            {selectedVehicle
              ? `${selectedVehicle.brand} (${selectedVehicle.plateNumber})`
              : 'Машин пока нет'}
          </Text>
          <ChevronDown size={20} color="#9ca3af" />
        </TouchableOpacity>
        <Text style={[styles.inputLabel, styles.mt3]}>Выберите водителя</Text>
        <TouchableOpacity
          style={styles.selectMock}
          onPress={() => {
            if (drivers.length < 2) return;
            const currentIndex = drivers.findIndex((driver: any) => driver._id === selectedDriverId);
            const nextDriver = drivers[(currentIndex + 1) % drivers.length];
            setSelectedDriverId(nextDriver?._id || '');
          }}
        >
          <Text style={styles.selectMockText}>
            {selectedDriver ? selectedDriver.name : 'Водителей пока нет'}
          </Text>
          <ChevronDown size={20} color="#9ca3af" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btnBlue, styles.mt4]}
          onPress={onAssignOrder}
          disabled={isSubmitting}
        >
          <Text style={styles.btnTextWhite}>
            {isSubmitting ? 'Назначаю...' : 'Назначить'}
          </Text>
        </TouchableOpacity>
      </BottomSheet>
    </View>
  );
}
