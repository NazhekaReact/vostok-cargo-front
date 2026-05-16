import { Camera, CheckCircle2, MapPin, Navigation } from 'lucide-react-native';
import React, { useCallback, useContext, useState } from 'react';
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { updateDriverOrderStatusRequest } from '../../api/driver';
import OrderCard from '../../components/OrderCard';
import AppContext from '../../context/AppContext';
import styles from '../../styles/appStyles';
import { t } from '../../utils/i18n';
import { openRouteIn2gis } from '../../utils/navigation';
import { getRoutePoint } from '../../utils/orderData';

export default function DriverDashboard() {
  const { navigate, orders, showToast, loadOrders, loadingOrders, isDark, language } = useContext(AppContext);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const refreshOrders = useCallback(() => {
    loadOrders?.();
  }, [loadOrders]);

  const activeOrder = orders.find((o: any) =>
    ['ASSIGNED', 'AT_PICKUP', 'IN_TRANSIT', 'AT_DROP'].includes(o.status)
  );

  const routeTargetPoint = activeOrder ? getRoutePoint(activeOrder, 'to') : null;
  const routeButtonLabel = t('driver.routeToDrop', language);

  const updateStatus = async (status: string, successMessage: string) => {
    if (!activeOrder?._id) return;

    try {
      setIsSubmitting(true);
      await updateDriverOrderStatusRequest(activeOrder._id, status);
      showToast(successMessage);
      await loadOrders?.();
    } catch (error: any) {
      console.log('DRIVER STATUS ERROR:', error?.response?.data || error?.message || error);
      showToast('Не удалось обновить статус');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openExternalRoute = async () => {
    if (!routeTargetPoint) {
      showToast(t('driver.routeUnavailable', language));
      return;
    }

    const opened = await openRouteIn2gis(routeTargetPoint);
    if (!opened) {
      showToast(t('driver.routeUnavailable', language));
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.scrollPadding}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={Boolean(loadingOrders)}
          onRefresh={refreshOrders}
          tintColor="#3b82f6"
          colors={['#3b82f6']}
        />
      }
    >
      <Text style={[styles.screenTitle, isDark && styles.textWhite]}>{t('driver.title', language)}</Text>

      <Text style={[styles.sectionTitle, isDark && styles.textWhite]}>{t('driver.currentTrip', language)}</Text>

      {activeOrder ? (
        <View style={styles.mb6}>
          <OrderCard
            order={activeOrder}
            onClick={() => navigate('OrderDetails', { id: activeOrder._id })}
          />

          <TouchableOpacity
            style={[styles.btnBlue, styles.mb2]}
            onPress={openExternalRoute}
            activeOpacity={0.9}
          >
            <View style={styles.row}>
              <Navigation size={18} color="white" />
              <Text style={styles.btnTextWhite}> {routeButtonLabel}</Text>
            </View>
          </TouchableOpacity>

          {activeOrder.status === 'ASSIGNED' && (
            <TouchableOpacity
              style={styles.btnOrange}
              onPress={() => updateStatus('AT_PICKUP', 'Прибытие отмечено')}
              disabled={isSubmitting}
            >
              <MapPin size={18} color="white" />
              <Text style={styles.btnTextWhite}>
                {isSubmitting ? t('driver.updating', language) : ` ${t('driver.arrivedPickup', language)}`}
              </Text>
            </TouchableOpacity>
          )}

          {activeOrder.status === 'AT_PICKUP' && (
            <TouchableOpacity
              style={styles.btnOrange}
              onPress={() => updateStatus('IN_TRANSIT', 'Рейс начат')}
              disabled={isSubmitting}
            >
              <Navigation size={18} color="white" />
              <Text style={styles.btnTextWhite}>
                {isSubmitting ? t('driver.updating', language) : ` ${t('driver.startTrip', language)}`}
              </Text>
            </TouchableOpacity>
          )}

          {activeOrder.status === 'IN_TRANSIT' && (
            <TouchableOpacity
              style={styles.btnOrange}
              onPress={() => updateStatus('AT_DROP', 'Прибытие на выгрузку отмечено')}
              disabled={isSubmitting}
            >
              <MapPin size={18} color="white" />
              <Text style={styles.btnTextWhite}>
                {isSubmitting ? t('driver.updating', language) : ` ${t('driver.arrivedDrop', language)}`}
              </Text>
            </TouchableOpacity>
          )}

          {activeOrder.status === 'AT_DROP' && (
            <View style={[styles.podBox, isDark && styles.podBoxDark]}>
              <View style={styles.cameraIconBox}>
                <Camera size={24} color="#3b82f6" />
              </View>
              <Text style={styles.podText}>{t('driver.uploadPod', language)}</Text>
              <TouchableOpacity
                style={styles.btnGreen}
                onPress={() => updateStatus('DELIVERED', 'Рейс завершен')}
                disabled={isSubmitting}
              >
                <CheckCircle2 size={18} color="white" />
                <Text style={styles.btnTextWhite}>
                  {isSubmitting ? t('driver.updating', language) : ` ${t('driver.finishTrip', language)}`}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      ) : (
        <Text style={styles.emptyText}>{t('driver.noTrip', language)}</Text>
      )}

      <Text style={[styles.sectionTitle, isDark && styles.textWhite]}>{t('driver.allOrders', language)}</Text>

      {orders
        .filter((o: any) => o.status === 'DELIVERED')
        .map((o: any) => (
          <OrderCard
            key={o._id}
            order={o}
            onClick={() => navigate('OrderDetails', { id: o._id })}
          />
        ))}
    </ScrollView>
  );
}
