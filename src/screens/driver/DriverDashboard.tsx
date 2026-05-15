import { Camera, CheckCircle2, MapPin, Navigation } from 'lucide-react-native';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { Platform, ScrollView, Switch, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { updateDriverOrderStatusRequest } from '../../api/driver';
import { saveLocationRequest } from '../../api/users';
import OrderCard from '../../components/OrderCard';
import AppContext from '../../context/AppContext';
import styles from '../../styles/appStyles';
import { t } from '../../utils/i18n';

export default function DriverDashboard() {
  const { navigate, orders, showToast, loadOrders, gpsActive, saveCurrentLocation, isDark, language, currentUserId } = useContext(AppContext);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [driverLocation, setDriverLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);

  const activeOrder = orders.find((o: any) =>
    ['ASSIGNED', 'AT_PICKUP', 'IN_TRANSIT', 'AT_DROP'].includes(o.status)
  );

  // Запрашиваем и стримим GPS
  useEffect(() => {
    if (!gpsActive) {
      if (locationSubscription.current) {
        locationSubscription.current.remove();
        locationSubscription.current = null;
      }
      return;
    }

    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          showToast('GPS разрешение не получено');
          return;
        }

        // Получаем начальную позицию
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        setDriverLocation({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });

        // Подписка на обновления каждые 10 сек / 50м
        locationSubscription.current = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 10000,
            distanceInterval: 50,
          },
          (location) => {
            const newLoc = {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            };
            setDriverLocation(newLoc);

            // Отправляем на сервер
            if (currentUserId) {
              saveLocationRequest({
                userId: currentUserId,
                location: {
                  ...newLoc,
                  heading: location.coords.heading,
                  speed: location.coords.speed,
                },
              }).catch((err: any) => console.log('GPS save error:', err?.message));
            }
          }
        );
      } catch (err: any) {
        console.log('GPS error:', err);
        showToast('Ошибка GPS');
      }
    })();

    return () => {
      if (locationSubscription.current) {
        locationSubscription.current.remove();
        locationSubscription.current = null;
      }
    };
  }, [gpsActive, currentUserId]);

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

  const fromCoords = activeOrder?.route?.from?.coordinates;
  const toCoords = activeOrder?.route?.to?.coordinates;

  const mapRegion = driverLocation
    ? { ...driverLocation, latitudeDelta: 0.5, longitudeDelta: 0.5 }
    : { latitude: 51.1282, longitude: 71.4304, latitudeDelta: 5, longitudeDelta: 5 };

  return (
    <ScrollView contentContainerStyle={styles.scrollPadding} showsVerticalScrollIndicator={false}>
      <Text style={[styles.screenTitle, isDark && styles.textWhite]}>{t('driver.title', language)}</Text>

      {/* GPS Toggle */}
      <View style={[styles.card, styles.row, styles.justifyBetween, styles.itemsCenter, isDark && styles.cardDark]}>
        <View style={styles.row}>
          <View style={[styles.iconBoxGray, isDark && styles.iconBoxGrayDark]}>
            <Navigation size={20} color={gpsActive ? '#22c55e' : '#6b7280'} />
          </View>
          <View style={styles.ml3}>
            <Text style={[styles.fontBold, isDark && styles.textWhite]}>{t('driver.gps', language)}</Text>
            <Text style={styles.textGrayXs}>
              {gpsActive ? t('driver.gpsActive', language) : t('driver.gpsOff', language)}
            </Text>
            {driverLocation && gpsActive && (
              <Text style={{ fontSize: 10, color: '#3b82f6', marginTop: 2 }}>
                {driverLocation.latitude.toFixed(4)}, {driverLocation.longitude.toFixed(4)}
              </Text>
            )}
          </View>
        </View>

        <Switch
          value={gpsActive}
          onValueChange={saveCurrentLocation}
          trackColor={{ false: '#d1d5db', true: '#22c55e' }}
          thumbColor={gpsActive ? '#fff' : '#f4f4f5'}
        />
      </View>

      {/* Мини-карта водителя */}
      {gpsActive && driverLocation && (
        <View style={[styles.card, isDark && styles.cardDark, { padding: 0, overflow: 'hidden' }]}>
          <View style={{ height: 180, borderRadius: 16, overflow: 'hidden' }}>
            <MapView
              style={{ flex: 1 }}
              provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
              region={mapRegion}
              showsUserLocation
              showsMyLocationButton={false}
            >
              {driverLocation && (
                <Marker coordinate={driverLocation} title="Вы здесь" pinColor="#3b82f6" />
              )}
              {fromCoords?.lat && (
                <Marker
                  coordinate={{ latitude: fromCoords.lat, longitude: fromCoords.lng }}
                  title="Погрузка"
                  pinColor="#22c55e"
                />
              )}
              {toCoords?.lat && (
                <Marker
                  coordinate={{ latitude: toCoords.lat, longitude: toCoords.lng }}
                  title="Выгрузка"
                  pinColor="#ef4444"
                />
              )}
            </MapView>
          </View>
        </View>
      )}

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
