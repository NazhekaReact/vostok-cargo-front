import {
    ArrowRight,
    Calendar,
    ChevronLeft,
    Navigation,
    User,
} from 'lucide-react-native';
import React, { useContext } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { acceptBidRequest } from '../../api/bids';
import MapPlaceholder from '../../components/MapPlaceholder';
import AppContext from '../../context/AppContext';
import styles from '../../styles/appStyles';
import { t } from '../../utils/i18n';

export default function OrderDetails() {
  const { navigate, orders, role, showToast, params, loadOrders, isDark, language } = useContext(AppContext);
  const order =
    orders.find((o: any) => o._id === params?.id) ||
    orders.find((o: any) => o.status === 'IN_TRANSIT') ||
    orders[0];

  const onAcceptBid = async (bidId: string) => {
    if (!order?._id || !bidId) return;

    try {
      await acceptBidRequest(order._id, bidId);
      showToast('Предложение принято');
      await loadOrders?.();
      navigate('Home');
    } catch (error: any) {
      console.log('ACCEPT BID ERROR:', error?.response?.data || error?.message || error);
      showToast('Не удалось принять предложение');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollPadding} showsVerticalScrollIndicator={false}>
      <View style={[styles.row, styles.mb6]}>
        <TouchableOpacity onPress={() => navigate('Home')} style={styles.mr3}>
          <ChevronLeft size={28} color={isDark ? '#f9fafb' : '#000'} />
        </TouchableOpacity>
        <Text style={[styles.screenTitleNoMargin, isDark && styles.textWhite]}>{t('order.details', language)}</Text>
      </View>

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
            <Text style={styles.textGraySm}> 14.03.2026</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: '#dcfce7' }]}>
            <Text style={[styles.statusBadgeText, { color: '#15803d' }]}>
              {order?.status || t('order.unknown', language)}
            </Text>
          </View>
        </View>
      </View>

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

      {order?.bids && role === 'CUSTOMER' && (
        <View style={styles.mb4}>
          <Text style={[styles.sectionTitle, isDark && styles.textWhite]}>{t('order.bids', language)} ({order.bids.length})</Text>
          {order.bids.map((b: any) => (
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

              <View style={[styles.commentBox, isDark && styles.commentBoxDark]}>
                <Text style={styles.textGraySm}>{b.comment}</Text>
              </View>

              <TouchableOpacity
                style={styles.btnGreen}
                onPress={() => onAcceptBid(b._id)}
              >
                <Text style={styles.btnTextWhite}>{t('order.accept', language)}</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {order?.executor && (
        <View style={[styles.card, isDark && styles.cardDark]}>
          <Text style={[styles.sectionTitle, isDark && styles.textWhite]}>{t('order.executor', language)}</Text>
          <View style={[styles.row, styles.justifyBetween, styles.mb4]}>
            <Text style={styles.textGraySm}>{t('order.logistician', language)}</Text>
            <Text style={[styles.fontMedium, isDark && styles.textWhite]}>
              {order.executor.logistician?.name || t('order.notSpecified', language)}
            </Text>
          </View>
          <Text style={styles.textGrayXs}>{t('order.vehicle', language)}</Text>
          <Text style={[styles.fontMedium, isDark && styles.textWhite]}>
            {order.executor.vehicle?.brand || 'Не указана'} (
            {order.executor.vehicle?.plateNumber || '—'})
          </Text>
        </View>
      )}

      {['IN_TRANSIT', 'AT_DROP'].includes(order?.status) && (
        <View style={[styles.card, isDark && styles.cardDark]}>
          <View style={[styles.row, styles.mb4]}>
            <Navigation size={18} color="#3b82f6" />
            <Text style={[styles.sectionTitle, styles.ml2, styles.mb0, isDark && styles.textWhite]}>
              {t('order.tracking', language)}
            </Text>
          </View>
          <MapPlaceholder />
        </View>
      )}
    </ScrollView>
  );
}
