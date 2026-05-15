import { ArrowRight, Navigation } from 'lucide-react-native';
import React, { useContext, useEffect, useState } from 'react';
import { Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import OrderCard from '../../components/OrderCard';
import AppContext from '../../context/AppContext';
import styles from '../../styles/appStyles';
import { t } from '../../utils/i18n';

export default function CustomerDashboard() {
  const { navigate, orders, isDark, language } = useContext(AppContext);
  const active = orders.find((o: any) =>
    ['IN_TRANSIT', 'AT_PICKUP', 'AT_DROP'].includes(o.status)
  );

  const fromCoords = active?.route?.from?.coordinates;
  const toCoords = active?.route?.to?.coordinates;
  const hasCoords = fromCoords?.lat || toCoords?.lat;

  const getRegion = () => {
    if (fromCoords?.lat && toCoords?.lat) {
      return {
        latitude: (fromCoords.lat + toCoords.lat) / 2,
        longitude: (fromCoords.lng + toCoords.lng) / 2,
        latitudeDelta: Math.abs(fromCoords.lat - toCoords.lat) * 1.5 || 2,
        longitudeDelta: Math.abs(fromCoords.lng - toCoords.lng) * 1.5 || 2,
      };
    }
    return { latitude: 51.1282, longitude: 71.4304, latitudeDelta: 5, longitudeDelta: 5 };
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollPadding} showsVerticalScrollIndicator={false}>
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
                  initialRegion={getRegion()}
                  scrollEnabled={false}
                  zoomEnabled={false}
                  pitchEnabled={false}
                  rotateEnabled={false}
                >
                  {fromCoords?.lat && (
                    <Marker
                      coordinate={{ latitude: fromCoords.lat, longitude: fromCoords.lng }}
                      pinColor="#22c55e"
                    />
                  )}
                  {toCoords?.lat && (
                    <Marker
                      coordinate={{ latitude: toCoords.lat, longitude: toCoords.lng }}
                      pinColor="#ef4444"
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
                  {active.route?.from?.city || '—'}
                </Text>
                <ArrowRight size={14} color="#9ca3af" style={{ marginHorizontal: 8 }} />
                <Text style={styles.textGraySm}>
                  {active.route?.to?.city || '—'}
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