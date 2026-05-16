import * as Location from 'expo-location';
import { Clock3, LocateFixed, MapPin, RefreshCw, Truck } from 'lucide-react-native';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import api from '../../api/client';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from '../../components/MapViewCompat';
import AppContext from '../../context/AppContext';
import styles from '../../styles/appStyles';
import { t } from '../../utils/i18n';
import {
  Coordinate,
  buildMapRegion,
  focusMapOnCoordinate,
  getLocationCoordinate,
  getPointCoordinate,
  resolvePointCoordinate,
} from '../../utils/mapUtils';
import { getRouteLabel, getRoutePoint } from '../../utils/orderData';

const trackedOrderStatuses = ['APPROVED', 'ASSIGNED', 'AT_PICKUP', 'IN_TRANSIT', 'AT_DROP'];
const driverOrderStatuses = ['ASSIGNED', 'AT_PICKUP', 'IN_TRANSIT', 'AT_DROP'];

const formatLastUpdate = (updatedAt?: string | Date) => {
  if (!updatedAt) return 'гео еще нет';

  const date = new Date(updatedAt);
  if (Number.isNaN(date.getTime())) return 'гео еще нет';

  const diffMs = Date.now() - date.getTime();
  const minutes = Math.max(0, Math.floor(diffMs / 60000));

  if (minutes < 1) return 'только что';
  if (minutes < 60) return `${minutes} мин назад`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ч назад`;

  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function Tracker() {
  const {
    isDark,
    language,
    role,
    currentUserId,
    orders,
    showToast,
    loadOrders,
    navigate,
  } = useContext(AppContext);
  const [userLocation, setUserLocation] = useState<Coordinate | null>(null);
  const [resolvedRoute, setResolvedRoute] = useState<{ from: Coordinate | null; to: Coordinate | null }>({
    from: null,
    to: null,
  });
  const [fleetLocations, setFleetLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(role === 'LOGISTICIAN');
  const mapRef = useRef<any>(null);
  const manualFocusUntilRef = useRef(0);

  const currentOrder = useMemo(() => {
    const statuses = role === 'DRIVER' ? driverOrderStatuses : trackedOrderStatuses;
    return orders.find((order: any) => statuses.includes(order.status)) || null;
  }, [orders, role]);

  const fromPoint = useMemo(() => getRoutePoint(currentOrder, 'from'), [currentOrder]);
  const toPoint = useMemo(() => getRoutePoint(currentOrder, 'to'), [currentOrder]);
  const fromCoordinate = getPointCoordinate(fromPoint) || resolvedRoute.from;
  const toCoordinate = getPointCoordinate(toPoint) || resolvedRoute.to;
  const routeCoordinates = useMemo(
    () => [fromCoordinate, toCoordinate].filter(Boolean) as Coordinate[],
    [fromCoordinate, toCoordinate]
  );
  const customerDriver = role === 'CUSTOMER' ? currentOrder?.executor?.driver : null;
  const customerDriverCoordinate = getLocationCoordinate(customerDriver?.location);
  const ownLocationPinColor = isDark ? '#fbbf24' : '#111827';

  const fleetDriversWithLocation = useMemo(
    () =>
      fleetLocations
        .map((driver: any) => ({
          ...driver,
          coordinate: getLocationCoordinate(driver.location),
        }))
        .filter((driver: any) => Boolean(driver.coordinate)),
    [fleetLocations]
  );

  const visibleCoordinates = useMemo(() => {
    const nextCoordinates = [...routeCoordinates];

    if (userLocation) {
      nextCoordinates.push(userLocation);
    }

    if (role === 'CUSTOMER' && customerDriverCoordinate) {
      nextCoordinates.push(customerDriverCoordinate);
    }

    if (role === 'LOGISTICIAN') {
      nextCoordinates.push(...fleetDriversWithLocation.map((driver: any) => driver.coordinate));
    }

    return nextCoordinates;
  }, [customerDriverCoordinate, fleetDriversWithLocation, role, routeCoordinates, userLocation]);

  const mapRegion = useMemo(() => buildMapRegion(visibleCoordinates), [visibleCoordinates]);

  useEffect(() => {
    let isMounted = true;

    const resolveRouteCoordinates = async () => {
      const [nextFrom, nextTo] = await Promise.all([
        resolvePointCoordinate(fromPoint),
        resolvePointCoordinate(toPoint),
      ]);

      if (isMounted) {
        setResolvedRoute({ from: nextFrom, to: nextTo });
      }
    };

    if (currentOrder?._id) {
      resolveRouteCoordinates();
    } else {
      setResolvedRoute({ from: null, to: null });
    }

    return () => {
      isMounted = false;
    };
  }, [currentOrder?._id, fromPoint, toPoint]);

  const readCurrentLocation = useCallback(
    async (focusOnMap = false) => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          if (focusOnMap) showToast('Разрешите доступ к геопозиции');
          return null;
        }

        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        const nextLocation = {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        };

        setUserLocation(nextLocation);

        if (currentUserId && role === 'DRIVER') {
          await api.post('/save-location', {
            userId: currentUserId,
            orderId: currentOrder?._id,
            location: {
              ...nextLocation,
              heading: loc.coords.heading,
              speed: loc.coords.speed,
            },
          });
          await loadOrders?.();
        }

        if (focusOnMap) {
          manualFocusUntilRef.current = Date.now() + 2000;
          focusMapOnCoordinate(mapRef, nextLocation);
        }

        return nextLocation;
      } catch (err: any) {
        console.log('Location error:', err?.response?.data || err?.message || err);
        if (focusOnMap) showToast('Не удалось определить геопозицию');
        return null;
      }
    },
    [currentOrder?._id, currentUserId, loadOrders, role, showToast]
  );

  const loadFleetLocations = useCallback(async () => {
    if (role !== 'LOGISTICIAN' || !currentUserId) return;

    try {
      setLoading(true);
      const { data } = await api.get('/api/v1/fleet/locations', {
        params: { logisticianId: currentUserId },
      });
      setFleetLocations(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.log('Fleet locations error:', err?.response?.data || err?.message);
      showToast('Не удалось загрузить водителей');
    } finally {
      setLoading(false);
    }
  }, [currentUserId, role, showToast]);

  useEffect(() => {
    if (role === 'LOGISTICIAN') {
      loadFleetLocations();
      return;
    }

    setLoading(false);
  }, [loadFleetLocations, role]);

  useEffect(() => {
    if (role) {
      readCurrentLocation(true);
    }
  }, [readCurrentLocation, role]);

  useEffect(() => {
    if (visibleCoordinates.length) {
      if (Date.now() < manualFocusUntilRef.current) return;
      if (userLocation) return;
      mapRef.current?.animateToRegion?.(mapRegion, 600);
    }
  }, [mapRegion, userLocation, visibleCoordinates.length]);

  const refreshTracker = useCallback(async () => {
    try {
      setLoading(true);

      if (role === 'LOGISTICIAN') {
        await loadFleetLocations();
      }

      if (role) {
        await readCurrentLocation(false);
      }

      await loadOrders?.();
      showToast('Обновлено');
    } finally {
      setLoading(false);
    }
  }, [loadFleetLocations, loadOrders, readCurrentLocation, role, showToast]);

  const focusOnUserLocation = useCallback(() => {
    readCurrentLocation(true);
  }, [readCurrentLocation]);

  const orderTitle = currentOrder
    ? `${getRouteLabel(currentOrder, 'from', '—')} → ${getRouteLabel(currentOrder, 'to', '—')}`
    : 'Нет текущего заказа';

  return (
    <View style={styles.flex1}>
      <View style={[styles.row, styles.justifyBetween, styles.trackerHeader]}>
        <Text style={[styles.screenTitleNoMargin, isDark && styles.textWhite]}>{t('tracker.title', language)}</Text>
        <TouchableOpacity
          style={styles.iconBtnBlue}
          onPress={refreshTracker}
          disabled={loading}
        >
          <RefreshCw size={20} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.trackerMapWrap}>
        <MapView
          ref={mapRef}
          style={{ flex: 1 }}
          provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
          initialRegion={mapRegion}
          showsUserLocation={false}
          showsMyLocationButton={false}
        >
          {routeCoordinates.length === 2 && (
            <Polyline
              coordinates={routeCoordinates}
              strokeColor="#3b82f6"
              strokeWidth={4}
            />
          )}

          {fromCoordinate && (
            <Marker
              coordinate={fromCoordinate}
              title={`Погрузка: ${getRouteLabel(currentOrder, 'from', '')}`}
              pinColor="#22c55e"
            />
          )}

          {toCoordinate && (
            <Marker
              coordinate={toCoordinate}
              title={`Выгрузка: ${getRouteLabel(currentOrder, 'to', '')}`}
              pinColor="#ef4444"
            />
          )}

          {userLocation && (
            <Marker
              coordinate={userLocation}
              title="Вы здесь"
              description="Ваше местоположение"
              pinColor={ownLocationPinColor}
            />
          )}

          {role === 'CUSTOMER' && customerDriverCoordinate && (
            <Marker
              coordinate={customerDriverCoordinate}
              title={customerDriver?.name || 'Ваш водитель'}
              description={`Обновлено: ${formatLastUpdate(customerDriver?.location?.updatedAt)}`}
              pinColor="#3b82f6"
            />
          )}

          {role === 'LOGISTICIAN' &&
            fleetDriversWithLocation.map((driver: any) => (
              <Marker
                key={driver._id}
                coordinate={driver.coordinate}
                title={driver.name || 'Водитель'}
                description={`Обновлено: ${formatLastUpdate(driver.location?.updatedAt)}`}
                pinColor="#3b82f6"
              />
            ))}
        </MapView>

        <TouchableOpacity
          style={styles.mapLocateButton}
          onPress={focusOnUserLocation}
          activeOpacity={0.85}
        >
          <LocateFixed size={22} color="#2563eb" />
        </TouchableOpacity>

        {loading && (
          <View style={styles.trackerLoadingOverlay} pointerEvents="none">
            <ActivityIndicator size="large" color="#3b82f6" />
          </View>
        )}
      </View>

      <View style={[styles.trackerPanel, isDark && styles.trackerPanelDark]}>
        <TouchableOpacity
          style={styles.trackerCurrentRow}
          activeOpacity={currentOrder ? 0.8 : 1}
          onPress={() => currentOrder && navigate('OrderDetails', { id: currentOrder._id })}
        >
          <View style={styles.trackerIconCircle}>
            <MapPin size={18} color="#3b82f6" />
          </View>
          <View style={styles.flex1}>
            <Text style={[styles.trackerPanelLabel, isDark && { color: '#9ca3af' }]}>Текущий заказ</Text>
            <Text
              style={[styles.trackerPanelTitle, isDark && styles.textWhite]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {orderTitle}
            </Text>
            {currentOrder && (
              <Text style={styles.textGrayXs}>Статус: {currentOrder.status}</Text>
            )}
          </View>
        </TouchableOpacity>

        {role === 'CUSTOMER' && currentOrder && (
          <View style={styles.trackerDriverStatus}>
            <Clock3 size={14} color="#9ca3af" />
            <Text style={styles.textGrayXs}>
              {' '}
              {customerDriver
                ? `${customerDriver.name || 'Ваш водитель'}: ${formatLastUpdate(customerDriver.location?.updatedAt)}`
                : 'Водитель еще не назначен'}
            </Text>
          </View>
        )}

        {role === 'LOGISTICIAN' && (
          <View style={styles.mt3}>
            <View style={[styles.row, styles.justifyBetween, styles.mb2]}>
              <View style={styles.row}>
                <Truck size={16} color="#3b82f6" />
                <Text style={[styles.trackerPanelLabel, styles.ml1, isDark && { color: '#9ca3af' }]}>
                  Водители ({fleetLocations.length})
                </Text>
              </View>
              <Text style={styles.textGrayXs}>синие метки на карте</Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.trackerDriverScroller}
            >
              {fleetLocations.map((driver: any) => {
                const hasLocation = Boolean(getLocationCoordinate(driver.location));
                const vehicle = driver.driverProfile?.currentVehicle;

                return (
                  <View
                    key={driver._id}
                    style={[styles.trackerDriverChip, isDark && styles.trackerDriverChipDark]}
                  >
                    <View
                      style={[
                        styles.trackerDriverDot,
                        { backgroundColor: hasLocation ? '#22c55e' : '#9ca3af' },
                      ]}
                    />
                    <Text style={[styles.trackerDriverName, isDark && styles.textWhite]} numberOfLines={1}>
                      {driver.name || 'Водитель'}
                    </Text>
                    <Text style={styles.trackerDriverUpdate} numberOfLines={1}>
                      {formatLastUpdate(driver.location?.updatedAt)}
                    </Text>
                    {vehicle && (
                      <Text style={styles.textGrayXs} numberOfLines={1}>
                        {vehicle.brand} {vehicle.plateNumber}
                      </Text>
                    )}
                  </View>
                );
              })}

              {!fleetLocations.length && (
                <Text style={styles.emptyText}>Водителей пока нет</Text>
              )}
            </ScrollView>
          </View>
        )}

        <View style={styles.trackerLegend}>
          <View style={styles.row}>
            <View style={[styles.trackerLegendDot, { backgroundColor: '#22c55e' }]} />
            <Text style={styles.textGrayXs}>Погрузка</Text>
          </View>
          <View style={styles.row}>
            <View style={[styles.trackerLegendDot, { backgroundColor: '#ef4444' }]} />
            <Text style={styles.textGrayXs}>Выгрузка</Text>
          </View>
          <View style={styles.row}>
            <View style={[styles.trackerLegendDot, { backgroundColor: ownLocationPinColor }]} />
            <Text style={styles.textGrayXs}>Вы</Text>
          </View>
          {role !== 'DRIVER' && (
            <View style={styles.row}>
              <View style={[styles.trackerLegendDot, { backgroundColor: '#3b82f6' }]} />
              <Text style={styles.textGrayXs}>
                {role === 'CUSTOMER' ? 'Ваш водитель' : 'Водители'}
              </Text>
            </View>
          )}
          {role === 'DRIVER' && (
            <View style={styles.row}>
              <View style={[styles.trackerLegendDot, { backgroundColor: '#3b82f6' }]} />
              <Text style={styles.textGrayXs}>
                Маршрут
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}
