import {
    ArrowRight,
    Calendar,
    ChevronLeft,
    MessageSquare,
    Navigation,
    Send,
    User,
} from 'lucide-react-native';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { Dimensions, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { acceptBidRequest, counterBidRequest } from '../../api/bids';
import AppContext from '../../context/AppContext';
import styles from '../../styles/appStyles';
import { t } from '../../utils/i18n';

export default function OrderDetails() {
  const { navigate, orders, role, showToast, params, loadOrders, isDark, language, currentUserId } = useContext(AppContext);
  const order =
    orders.find((o: any) => o._id === params?.id) ||
    orders.find((o: any) => o.status === 'IN_TRANSIT') ||
    orders[0];

  const [counterAmount, setCounterAmount] = useState('');
  const [counterComment, setCounterComment] = useState('');
  const [counterBidId, setCounterBidId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [driverLocation, setDriverLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const mapRef = useRef<MapView>(null);

  const fromCoords = order?.route?.from?.coordinates;
  const toCoords = order?.route?.to?.coordinates;

  // Socket для реального трекинга водителя
  useEffect(() => {
    if (!order?._id || !['IN_TRANSIT', 'AT_DROP', 'AT_PICKUP'].includes(order?.status)) return;

    // Если есть координаты executora (водителя) — показываем
    if (order?.executor?.driver?.location) {
      setDriverLocation({
        latitude: order.executor.driver.location.latitude,
        longitude: order.executor.driver.location.longitude,
      });
    }
  }, [order?._id, order?.status, order?.executor?.driver?.location]);

  const onAcceptBid = async (bidId: string) => {
    if (!order?._id || !bidId) return;

    try {
      setIsSubmitting(true);
      await acceptBidRequest(order._id, bidId);
      showToast('Предложение принято');
      await loadOrders?.();
      navigate('Home');
    } catch (error: any) {
      console.log('ACCEPT BID ERROR:', error?.response?.data || error?.message || error);
      showToast('Не удалось принять предложение');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onCounterBid = async (bidId: string) => {
    if (!order?._id || !bidId || !counterAmount.trim()) {
      showToast('Укажите сумму');
      return;
    }

    try {
      setIsSubmitting(true);
      await counterBidRequest(order._id, bidId, {
        amount: Number(counterAmount),
        comment: counterComment.trim() || undefined,
      });
      showToast('Контрпредложение отправлено');
      setCounterBidId(null);
      setCounterAmount('');
      setCounterComment('');
      await loadOrders?.();
    } catch (error: any) {
      console.log('COUNTER BID ERROR:', error?.response?.data || error?.message || error);
      showToast('Не удалось отправить контрпредложение');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Фильтруем ставки: показываем только актуальные PENDING
  const pendingBids = order?.bids?.filter((b: any) => b.status === 'PENDING') || [];
  // Полная история ставок для чата
  const allBids = order?.bids || [];

  const hasMap = (fromCoords?.lat && fromCoords?.lng) || (toCoords?.lat && toCoords?.lng);

  const getMapRegion = () => {
    if (driverLocation) {
      return {
        latitude: driverLocation.latitude,
        longitude: driverLocation.longitude,
        latitudeDelta: 2,
        longitudeDelta: 2,
      };
    }
    if (fromCoords?.lat && toCoords?.lat) {
      const midLat = (fromCoords.lat + toCoords.lat) / 2;
      const midLng = (fromCoords.lng + toCoords.lng) / 2;
      const deltaLat = Math.abs(fromCoords.lat - toCoords.lat) * 1.5 || 2;
      const deltaLng = Math.abs(fromCoords.lng - toCoords.lng) * 1.5 || 2;
      return { latitude: midLat, longitude: midLng, latitudeDelta: deltaLat, longitudeDelta: deltaLng };
    }
    if (fromCoords?.lat) {
      return { latitude: fromCoords.lat, longitude: fromCoords.lng, latitudeDelta: 2, longitudeDelta: 2 };
    }
    // Default: Астана
    return { latitude: 51.1282, longitude: 71.4304, latitudeDelta: 5, longitudeDelta: 5 };
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollPadding} showsVerticalScrollIndicator={false}>
      <View style={[styles.row, styles.mb6]}>
        <TouchableOpacity onPress={() => navigate('Home')} style={styles.mr3}>
          <ChevronLeft size={28} color={isDark ? '#f9fafb' : '#000'} />
        </TouchableOpacity>
        <Text style={[styles.screenTitleNoMargin, isDark && styles.textWhite]}>{t('order.details', language)}</Text>
      </View>

      {/* Маршрут */}
      <View style={[styles.card, isDark && styles.cardDark]}>
        <View style={[styles.row, styles.justifyBetween, styles.mb4]}>
          <View style={styles.flex1}>
            <Text style={[styles.textGrayXs]}>{t('order.from', language)}</Text>
            <Text style={[styles.textLgBold, isDark && styles.textWhite]}>{order?.route?.from?.city || t('order.notSpecified', language)}</Text>
          </View>
          <View style={styles.routeDivider}>
            <View style={[styles.routeDividerLine, isDark && { backgroundColor: '#374151' }]} />
            <View style={[styles.routeDividerIcon, isDark && { backgroundColor: '#1f2937' }]}>
              <ArrowRight size={14} color="#9ca3af" />
            </View>
          </View>
          <View style={[styles.flex1, styles.itemsEnd]}>
            <Text style={[styles.textGrayXs]}>{t('order.to', language)}</Text>
            <Text style={[styles.textLgBold, isDark && styles.textWhite]}>{order?.route?.to?.city || t('order.notSpecified', language)}</Text>
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.row, styles.mr4]}>
            <Calendar size={14} color="#6b7280" />
            <Text style={styles.textGraySm}> {order?.createdAt ? new Date(order.createdAt).toLocaleDateString('ru-RU') : '—'}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: '#dcfce7' }]}>
            <Text style={[styles.statusBadgeText, { color: '#15803d' }]}>
              {order?.status || t('order.unknown', language)}
            </Text>
          </View>
        </View>
      </View>

      {/* Груз */}
      <View style={[styles.card, isDark && styles.cardDark]}>
        <Text style={[styles.sectionTitle, isDark && styles.textWhite]}>{t('order.cargo', language)}</Text>
        <View style={[styles.rowWrap]}>
          <View style={styles.halfCol}>
            <Text style={styles.textGrayXs}>{t('order.description', language)}</Text>
            <Text style={[styles.textMedium, isDark && styles.textWhite]}>{order?.cargoDetails?.description || '—'}</Text>
          </View>
          <View style={styles.halfCol}>
            <Text style={styles.textGrayXs}>{t('order.weight', language)}</Text>
            <Text style={[styles.textMedium, isDark && styles.textWhite]}>{order?.cargoDetails?.weight || 0} т</Text>
          </View>
          <View style={styles.halfCol}>
            <Text style={styles.textGrayXs}>{t('order.volume', language)}</Text>
            <Text style={[styles.textMedium, isDark && styles.textWhite]}>{order?.cargoDetails?.volume || 0} м³</Text>
          </View>
          <View style={styles.halfCol}>
            <Text style={styles.textGrayXs}>{t('order.customerPrice', language)}</Text>
            <Text style={styles.textBlueBold}>
              {order?.pricing?.customerOffer
                ? `${order.pricing.customerOffer} ₽`
                : t('order.negotiable', language)}
            </Text>
          </View>
        </View>
      </View>

      {/* Торги — Заказчик видит ставки + может торговаться */}
      {order?.bids && order.bids.length > 0 && role === 'CUSTOMER' && (
        <View style={styles.mb4}>
          <Text style={[styles.sectionTitle, isDark && styles.textWhite]}>
            {t('order.bids', language)} ({pendingBids.length})
          </Text>

          {/* История переговоров */}
          {allBids.length > 1 && (
            <View style={[styles.card, isDark && styles.cardDark, styles.mb4]}>
              <View style={[styles.row, styles.mb2]}>
                <MessageSquare size={16} color="#6b7280" />
                <Text style={[styles.textGraySm, styles.ml2]}>История торгов</Text>
              </View>
              {allBids
                .filter((b: any) => b.status !== 'PENDING')
                .map((b: any, idx: number) => (
                <View key={b._id || idx} style={{
                  paddingVertical: 6,
                  borderBottomWidth: idx < allBids.length - 1 ? 1 : 0,
                  borderBottomColor: isDark ? '#374151' : '#f3f4f6',
                }}>
                  <View style={[styles.row, styles.justifyBetween]}>
                    <Text style={[{ fontSize: 12, color: '#9ca3af' }]}>
                      {b.logistician?.name || 'Логист'}
                    </Text>
                    <Text style={{
                      fontSize: 12,
                      color: b.status === 'ACCEPTED' ? '#22c55e' :
                             b.status === 'REJECTED' ? '#ef4444' :
                             b.status === 'COUNTER_OFFER' ? '#f59e0b' : '#6b7280',
                      fontWeight: 'bold',
                    }}>
                      {b.amount} ₽ — {
                        b.status === 'COUNTER_OFFER' ? 'Контрпредл.' :
                        b.status === 'ACCEPTED' ? 'Принято' :
                        b.status === 'REJECTED' ? 'Отклонено' : b.status
                      }
                    </Text>
                  </View>
                  {b.comment && (
                    <Text style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{b.comment}</Text>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* Актуальные ставки с кнопками */}
          {pendingBids.map((b: any) => (
            <View key={b._id} style={[styles.card, isDark && styles.cardDark]}>
              <View style={[styles.row, styles.justifyBetween, styles.mb2]}>
                <View style={styles.row}>
                  <User size={16} color={isDark ? '#f9fafb' : '#000'} />
                  <Text style={[styles.fontBold, styles.ml1, isDark && styles.textWhite]}>
                    {b.logistician?.name || 'Логист'}
                  </Text>
                </View>
                <Text style={styles.textBlueBold}>{b.amount} ₽</Text>
              </View>

              {b.comment && (
                <View style={[styles.commentBox, isDark && styles.commentBoxDark]}>
                  <Text style={styles.textGraySm}>{b.comment}</Text>
                </View>
              )}

              {/* Кнопки: Принять + Контрпредложение */}
              <View style={[styles.row, { gap: 8 }]}>
                <TouchableOpacity
                  style={[styles.btnGreen, { flex: 1 }]}
                  onPress={() => onAcceptBid(b._id)}
                  disabled={isSubmitting}
                >
                  <Text style={styles.btnTextWhite}>
                    {isSubmitting ? 'Подождите...' : t('order.accept', language)}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.btnLightBlue, { flex: 1, marginTop: 0 }]}
                  onPress={() => setCounterBidId(counterBidId === b._id ? null : b._id)}
                >
                  <Text style={styles.btnLightBlueText}>Торговаться</Text>
                </TouchableOpacity>
              </View>

              {/* Форма контрпредложения */}
              {counterBidId === b._id && (
                <View style={[{ marginTop: 12, padding: 12, backgroundColor: isDark ? '#111827' : '#f9fafb', borderRadius: 12 }]}>
                  <Text style={[styles.inputLabel, isDark && { color: '#9ca3af' }]}>Ваша цена</Text>
                  <TextInput
                    style={[styles.inputLarge, isDark && styles.inputDark]}
                    value={counterAmount}
                    onChangeText={setCounterAmount}
                    placeholder="Введите сумму"
                    placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
                    keyboardType="numeric"
                  />
                  <TextInput
                    style={[styles.input, isDark && styles.inputDark]}
                    value={counterComment}
                    onChangeText={setCounterComment}
                    placeholder="Комментарий (необязательно)"
                    placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
                  />
                  <TouchableOpacity
                    style={[styles.btnBlue, { flexDirection: 'row', gap: 6 }]}
                    onPress={() => onCounterBid(b._id)}
                    disabled={isSubmitting}
                  >
                    <Send size={16} color="white" />
                    <Text style={styles.btnTextWhite}>
                      {isSubmitting ? 'Отправка...' : 'Отправить предложение'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Исполнитель */}
      {order?.executor?.logistician && (
        <View style={[styles.card, isDark && styles.cardDark]}>
          <Text style={[styles.sectionTitle, isDark && styles.textWhite]}>{t('order.executor', language)}</Text>
          <View style={[styles.row, styles.justifyBetween, styles.mb4]}>
            <Text style={styles.textGraySm}>{t('order.logistician', language)}</Text>
            <Text style={[styles.fontMedium, isDark && styles.textWhite]}>
              {order.executor.logistician?.name || t('order.notSpecified', language)}
            </Text>
          </View>
          {order.executor.vehicle && (
            <>
              <Text style={styles.textGrayXs}>{t('order.vehicle', language)}</Text>
              <Text style={[styles.fontMedium, isDark && styles.textWhite]}>
                {order.executor.vehicle?.brand || 'Не указана'} (
                {order.executor.vehicle?.plateNumber || '—'})
              </Text>
            </>
          )}
          {order.executor.driver && (
            <View style={styles.mt3}>
              <Text style={styles.textGrayXs}>Водитель</Text>
              <Text style={[styles.fontMedium, isDark && styles.textWhite]}>
                {order.executor.driver?.name || '—'}
              </Text>
            </View>
          )}
          {order.pricing?.finalPrice && (
            <View style={styles.mt3}>
              <Text style={styles.textGrayXs}>Итоговая цена</Text>
              <Text style={[styles.textBlueBold, { fontSize: 18 }]}>
                {order.pricing.finalPrice} ₽
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Карта — для всех ролей при наличии маршрута или активной перевозке */}
      {(hasMap || ['IN_TRANSIT', 'AT_DROP', 'AT_PICKUP', 'ASSIGNED'].includes(order?.status)) && (
        <View style={[styles.card, isDark && styles.cardDark]}>
          <View style={[styles.row, styles.mb4]}>
            <Navigation size={18} color="#3b82f6" />
            <Text style={[styles.sectionTitle, styles.ml2, styles.mb0, isDark && styles.textWhite]}>
              {['IN_TRANSIT', 'AT_DROP'].includes(order?.status) ? t('order.tracking', language) : 'Маршрут'}
            </Text>
          </View>
          <View style={{ height: 220, borderRadius: 16, overflow: 'hidden' }}>
            <MapView
              ref={mapRef}
              style={{ flex: 1 }}
              provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
              initialRegion={getMapRegion()}
              showsUserLocation={role === 'DRIVER'}
              showsMyLocationButton={role === 'DRIVER'}
            >
              {fromCoords?.lat && fromCoords?.lng && (
                <Marker
                  coordinate={{ latitude: fromCoords.lat, longitude: fromCoords.lng }}
                  title="Погрузка"
                  description={order?.route?.from?.city || ''}
                  pinColor="#22c55e"
                />
              )}
              {toCoords?.lat && toCoords?.lng && (
                <Marker
                  coordinate={{ latitude: toCoords.lat, longitude: toCoords.lng }}
                  title="Выгрузка"
                  description={order?.route?.to?.city || ''}
                  pinColor="#ef4444"
                />
              )}
              {driverLocation && (
                <Marker
                  coordinate={driverLocation}
                  title="Водитель"
                  pinColor="#3b82f6"
                />
              )}
              {fromCoords?.lat && toCoords?.lat && (
                <Polyline
                  coordinates={[
                    { latitude: fromCoords.lat, longitude: fromCoords.lng },
                    ...(driverLocation ? [driverLocation] : []),
                    { latitude: toCoords.lat, longitude: toCoords.lng },
                  ]}
                  strokeColor="#3b82f6"
                  strokeWidth={3}
                  lineDashPattern={[10, 5]}
                />
              )}
            </MapView>
          </View>
          {fromCoords?.lat && toCoords?.lat && (
            <View style={[styles.row, styles.justifyBetween, styles.mt3]}>
              <Text style={styles.textGrayXs}>🟢 {order?.route?.from?.city}</Text>
              <Text style={styles.textGrayXs}>🔴 {order?.route?.to?.city}</Text>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}
