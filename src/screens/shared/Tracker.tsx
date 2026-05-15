import { ChevronLeft, Navigation, RefreshCw, Truck } from 'lucide-react-native';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Platform, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import api from '../../api/client';
import AppContext from '../../context/AppContext';
import styles from '../../styles/appStyles';
import { t } from '../../utils/i18n';

export default function Tracker() {
  const { isDark, language, role, currentUserId, orders, showToast } = useContext(AppContext);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [fleetLocations, setFleetLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef<MapView>(null);

  // Получаем текущую геолокацию
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          setUserLocation({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          });
        }
      } catch (err) {
        console.log('Location error:', err);
      }
    })();
  }, []);

  // Логист: загружаем позиции автопарка
  const loadFleetLocations = async () => {
    if (role !== 'LOGISTICIAN' || !currentUserId) return;

    try {
      setLoading(true);
      const { data } = await api.get('/api/v1/fleet/locations', {
        params: { logisticianId: currentUserId },
      });
      setFleetLocations(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.log('Fleet locations error:', err?.response?.data || err?.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFleetLocations();
    setLoading(false);
  }, [role, currentUserId]);

  // Собираем маркеры из заказов (точки маршрутов)
  const orderMarkers = orders
    .filter((o: any) => o?.route?.from?.coordinates?.lat || o?.route?.to?.coordinates?.lat)
    .flatMap((o: any) => {
      const markers = [];
      if (o.route?.from?.coordinates?.lat) {
        markers.push({
          id: `${o._id}-from`,
          latitude: o.route.from.coordinates.lat,
          longitude: o.route.from.coordinates.lng,
          title: `Погрузка: ${o.route.from.city || ''}`,
          color: '#22c55e',
          type: 'pickup',
        });
      }
      if (o.route?.to?.coordinates?.lat) {
        markers.push({
          id: `${o._id}-to`,
          latitude: o.route.to.coordinates.lat,
          longitude: o.route.to.coordinates.lng,
          title: `Выгрузка: ${o.route.to.city || ''}`,
          color: '#ef4444',
          type: 'drop',
        });
      }
      return markers;
    });

  const defaultRegion = userLocation
    ? { ...userLocation, latitudeDelta: 5, longitudeDelta: 5 }
    : { latitude: 51.1282, longitude: 71.4304, latitudeDelta: 10, longitudeDelta: 10 };

  return (
    <View style={styles.flex1}>
      {/* Header */}
      <View style={[styles.row, styles.justifyBetween, { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 }]}>
        <Text style={[styles.screenTitleNoMargin, isDark && styles.textWhite]}>{t('tracker.title', language)}</Text>
        <TouchableOpacity
          style={styles.iconBtnBlue}
          onPress={() => {
            loadFleetLocations();
            showToast('Обновлено');
          }}
        >
          <RefreshCw size={20} color="white" />
        </TouchableOpacity>
      </View>

      {/* Map */}
      <View style={{ flex: 1, margin: 16, borderRadius: 16, overflow: 'hidden' }}>
        <MapView
          ref={mapRef}
          style={{ flex: 1 }}
          provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
          initialRegion={defaultRegion}
          showsUserLocation
          showsMyLocationButton
        >
          {/* Маркеры маршрутов заказов */}
          {orderMarkers.map((m: any) => (
            <Marker
              key={m.id}
              coordinate={{ latitude: m.latitude, longitude: m.longitude }}
              title={m.title}
              pinColor={m.color}
            />
          ))}

          {/* Маркеры автопарка (логист) */}
          {fleetLocations
            .filter((v: any) => v.location?.latitude && v.location?.longitude)
            .map((v: any) => (
            <Marker
              key={v._id}
              coordinate={{ latitude: v.location.latitude, longitude: v.location.longitude }}
              title={v.name || 'Водитель'}
              description={v.vehicle?.plateNumber || ''}
              pinColor="#3b82f6"
            />
          ))}
        </MapView>

        {loading && (
          <View style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            justifyContent: 'center', alignItems: 'center',
            backgroundColor: 'rgba(255,255,255,0.5)',
          }}>
            <ActivityIndicator size="large" color="#3b82f6" />
          </View>
        )}
      </View>

      {/* Legend */}
      <View style={[styles.row, { justifyContent: 'center', paddingBottom: 100, gap: 16 }]}>
        <View style={styles.row}>
          <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#22c55e', marginRight: 4 }} />
          <Text style={styles.textGrayXs}>Погрузка</Text>
        </View>
        <View style={styles.row}>
          <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#ef4444', marginRight: 4 }} />
          <Text style={styles.textGrayXs}>Выгрузка</Text>
        </View>
        {role === 'LOGISTICIAN' && (
          <View style={styles.row}>
            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#3b82f6', marginRight: 4 }} />
            <Text style={styles.textGrayXs}>Водители</Text>
          </View>
        )}
      </View>
    </View>
  );
}