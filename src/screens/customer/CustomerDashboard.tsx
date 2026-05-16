import { ArrowRight } from 'lucide-react-native';
import React, { useCallback, useContext } from 'react';
import { Platform, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from '../../components/MapViewCompat';
import OrderCard from '../../components/OrderCard';
import AppContext from '../../context/AppContext';
import styles from '../../styles/appStyles';
import { t } from '../../utils/i18n';
import { buildMapRegion, getLocationCoordinate, getPointCoordinate } from '../../utils/mapUtils';
import { getRouteLabel, getRoutePoint } from '../../utils/orderData';

export default function CustomerDashboard() {
  const { navigate, orders, loadOrders, loadingOrders, isDark, language } = useContext(AppContext);
  const refreshOrders = useCallback(() => {
    loadOrders?.();
  }, [loadOrders]);
  const active = orders.find((o: any) =>
    ['APPROVED', 'ASSIGNED', 'AT_PICKUP', 'IN_TRANSIT', 'AT_DROP'].includes(o.status)
  );

  const fromPoint = getRoutePoint(active, 'from');
  const toPoint = getRoutePoint(active, 'to');
  const fromCoordinate = getPointCoordinate(fromPoint);
  const toCoordinate = getPointCoordinate(toPoint);
  const driverCoordinate = getLocationCoordinate(active?.executor?.driver?.location);
  const hasCoords = Boolean(fromCoordinate || toCoordinate || driverCoordinate);
  const mapRegion = buildMapRegion([fromCoordinate, toCoordinate, driverCoordinate]);

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
      <Text style={[styles.screenTitle, isDark && styles.textWhite]}>{t('customer.myOrders', language)}</Text>

      {/* Карточка активной перевозки с картой */}
      {active && (
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => navigate('OrderDetails', { id: active._id })}
        >
          <View style={[styles.card, isDark && styles.cardDark, { padding: 0, overflow: 'hidden' }]}>
            {/* Мини-карта */}
            <View style={{ height: 140, borderTopLeftRadius: 16, borderTopRightRadius: 16, overflow: 'hidden' }}>
              {hasCoords ? (
                <MapView
                  style={{ flex: 1 }}
                  provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
                  initialRegion={mapRegion}
                  scrollEnabled={false}
                  zoomEnabled={false}
                  pitchEnabled={false}
                  rotateEnabled={false}
                >
                  {fromCoordinate && (
                    <Marker
                      coordinate={fromCoordinate}
                      pinColor="#22c55e"
                    />
                  )}
                  {toCoordinate && (
                    <Marker
                      coordinate={toCoordinate}
                      pinColor="#ef4444"
                    />
                  )}
                  {driverCoordinate && (
                    <Marker
                      coordinate={driverCoordinate}
                      title="Ваш водитель"
                      description="Текущее местоположение"
                      pinColor="#3b82f6"
                    />
                  )}
                </MapView>
              ) : (
                <View style={[styles.darkCardMap, { height: '100%', marginBottom: 0, borderRadius: 0 }]}>
                  <View style={styles.pulseDotWrapper}>
                    <View style={styles.pulseDotBg} />
                    <View style={styles.pulseDot} />
                  </View>
                </View>
              )}
            </View>

            {/* Инфо под картой */}
            <View style={{ padding: 16 }}>
              <View style={styles.row}>
                <View style={styles.greenDot} />
                <Text style={[styles.fontBold, isDark && styles.textWhite]}>
                  {t('customer.inTransit', language)}
                </Text>
              </View>
              <View style={[styles.row, styles.mt3]}>
                <Text style={styles.textGraySm}>
                  {getRouteLabel(active, 'from', '—')}
                </Text>
                <ArrowRight size={14} color="#9ca3af" style={{ marginHorizontal: 8 }} />
                <Text style={styles.textGraySm}>
                  {getRouteLabel(active, 'to', '—')}
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      )}

      {/* Остальные заказы */}
      {orders
        .filter((o: any) => !['IN_TRANSIT', 'AT_PICKUP', 'AT_DROP'].includes(o.status))
        .map((o: any) => (
          <OrderCard
            key={o._id}
            order={o}
            onClick={() => navigate('OrderDetails', { id: o._id })}
            actionButton={
              <TouchableOpacity
                style={[styles.btnBlue, styles.row, styles.justifyCenter]}
                onPress={() => navigate('OrderDetails', { id: o._id })}
              >
                <Text style={styles.btnTextWhite}>{t('customer.goToOrder', language)}</Text>
                <ArrowRight size={16} color="white" style={styles.ml2} />
              </TouchableOpacity>
            }
          />
        ))}
    </ScrollView>
  );
}
