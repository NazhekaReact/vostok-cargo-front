import { Camera, CheckCircle2, MapPin, Navigation } from 'lucide-react-native';
import React, { useContext, useState } from 'react';
import { ScrollView, Switch, Text, TouchableOpacity, View } from 'react-native';
import { updateDriverOrderStatusRequest } from '../../api/driver';
import OrderCard from '../../components/OrderCard';
import AppContext from '../../context/AppContext';
import styles from '../../styles/appStyles';
import { t } from '../../utils/i18n';

export default function DriverDashboard() {
  const { navigate, orders, showToast, loadOrders, gpsActive, saveCurrentLocation, isDark, language } = useContext(AppContext);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeOrder = orders.find((o: any) =>
    ['ASSIGNED', 'AT_PICKUP', 'IN_TRANSIT', 'AT_DROP'].includes(o.status)
  );

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

  return (
    <ScrollView contentContainerStyle={styles.scrollPadding} showsVerticalScrollIndicator={false}>
      <Text style={[styles.screenTitle, isDark && styles.textWhite]}>{t('driver.title', language)}</Text>

      <View style={[styles.card, styles.row, styles.justifyBetween, styles.itemsCenter, isDark && styles.cardDark]}>
        <View style={styles.row}>
          <View style={[styles.iconBoxGray, isDark && styles.iconBoxGrayDark]}>
            <Navigation size={20} color="#6b7280" />
          </View>
          <View style={styles.ml3}>
            <Text style={[styles.fontBold, isDark && styles.textWhite]}>{t('driver.gps', language)}</Text>
            <Text style={styles.textGrayXs}>
              {gpsActive ? t('driver.gpsActive', language) : t('driver.gpsOff', language)}
            </Text>
          </View>
        </View>

        <View style={styles.row}>
          {!gpsActive && (
            <TouchableOpacity
              style={styles.btnSmallBlue}
              onPress={() => showToast('GPS Симуляция')}
            >
              <Text style={styles.btnSmallBlueText}>{t('driver.testGps', language)}</Text>
            </TouchableOpacity>
          )}

          <View style={styles.ml2}>
            <Switch
              value={gpsActive}
              onValueChange={saveCurrentLocation}
              trackColor={{ false: '#d1d5db', true: '#3b82f6' }}
            />
          </View>
        </View>
      </View>

      <Text style={[styles.sectionTitle, isDark && styles.textWhite]}>{t('driver.currentTrip', language)}</Text>

      {activeOrder ? (
        <View style={styles.mb6}>
          <OrderCard
            order={activeOrder}
            onClick={() => navigate('OrderDetails', { id: activeOrder._id })}
          />

          {activeOrder.status === 'ASSIGNED' && (
            <TouchableOpacity
              style={styles.btnOrange}
              onPress={() => updateStatus('AT_PICKUP', 'Прибытие отмечено')}
              disabled={isSubmitting}
            >
              <MapPin size={18} color="white" />
              <Text style={styles.btnTextWhite}>
                {isSubmitting ? t('driver.updating', language) : t('driver.arrivedPickup', language)}
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
                {isSubmitting ? t('driver.updating', language) : t('driver.startTrip', language)}
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
                {isSubmitting ? t('driver.updating', language) : t('driver.arrivedDrop', language)}
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
