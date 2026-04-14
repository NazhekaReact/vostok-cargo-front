import {
    ArrowRight,
    Calendar,
    ChevronLeft,
    Navigation,
    User,
} from 'lucide-react-native';
import React, { useContext } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import MapPlaceholder from '../../components/MapPlaceholder';
import AppContext from '../../context/AppContext';
import styles from '../../styles/appStyles';

export default function OrderDetails() {
  const { navigate, orders, role, showToast } = useContext(AppContext);
  const order = orders.find((o: any) => o.status === 'IN_TRANSIT') || orders[0];

  return (
    <ScrollView contentContainerStyle={styles.scrollPadding} showsVerticalScrollIndicator={false}>
      <View style={[styles.row, styles.mb6]}>
        <TouchableOpacity onPress={() => navigate('Home')} style={styles.mr3}>
          <ChevronLeft size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.screenTitleNoMargin}>Детали заказа</Text>
      </View>

      <View style={styles.card}>
        <View style={[styles.row, styles.justifyBetween, styles.mb4]}>
          <View style={styles.flex1}>
            <Text style={styles.textGrayXs}>Откуда</Text>
            <Text style={styles.textLgBold}>{order?.route?.from?.city || 'Не указано'}</Text>
          </View>
          <View style={styles.routeDivider}>
            <View style={styles.routeDividerLine} />
            <View style={styles.routeDividerIcon}>
              <ArrowRight size={14} color="#9ca3af" />
            </View>
          </View>
          <View style={[styles.flex1, styles.itemsEnd]}>
            <Text style={styles.textGrayXs}>Куда</Text>
            <Text style={styles.textLgBold}>{order?.route?.to?.city || 'Не указано'}</Text>
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.row, styles.mr4]}>
            <Calendar size={14} color="#6b7280" />
            <Text style={styles.textGraySm}> 14.03.2026</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: '#dcfce7' }]}>
            <Text style={[styles.statusBadgeText, { color: '#15803d' }]}>
              {order?.status || 'Неизвестно'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Груз</Text>
        <View style={styles.rowWrap}>
          <View style={styles.halfCol}>
            <Text style={styles.textGrayXs}>Описание</Text>
            <Text style={styles.textMedium}>{order?.cargoDetails?.description || '—'}</Text>
          </View>
          <View style={styles.halfCol}>
            <Text style={styles.textGrayXs}>Вес</Text>
            <Text style={styles.textMedium}>{order?.cargoDetails?.weight || 0} т</Text>
          </View>
          <View style={styles.halfCol}>
            <Text style={styles.textGrayXs}>Объем</Text>
            <Text style={styles.textMedium}>{order?.cargoDetails?.volume || 0} м³</Text>
          </View>
          <View style={styles.halfCol}>
            <Text style={styles.textGrayXs}>Цена заказчика</Text>
            <Text style={styles.textBlueBold}>
              {order?.pricing?.customerOffer
                ? `${order.pricing.customerOffer} ₽`
                : 'Договорная'}
            </Text>
          </View>
        </View>
      </View>

      {order?.bids && role === 'CUSTOMER' && (
        <View style={styles.mb4}>
          <Text style={styles.sectionTitle}>Предложения ({order.bids.length})</Text>
          {order.bids.map((b: any) => (
            <View key={b._id} style={styles.card}>
              <View style={[styles.row, styles.justifyBetween, styles.mb2]}>
                <View style={styles.row}>
                  <User size={16} color="#000" />
                  <Text style={[styles.fontBold, styles.ml1]}>
                    {b.logistician?.name || 'Логист'}
                  </Text>
                </View>
                <Text style={styles.textBlueBold}>{b.amount} ₽</Text>
              </View>

              <View style={styles.commentBox}>
                <Text style={styles.textGraySm}>{b.comment}</Text>
              </View>

              <TouchableOpacity
                style={styles.btnGreen}
                onPress={() => showToast('Предложение принято')}
              >
                <Text style={styles.btnTextWhite}>Принять</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {order?.executor && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Исполнитель</Text>
          <View style={[styles.row, styles.justifyBetween, styles.mb4]}>
            <Text style={styles.textGraySm}>Логист:</Text>
            <Text style={styles.fontMedium}>
              {order.executor.logistician?.name || 'Не указано'}
            </Text>
          </View>
          <Text style={styles.textGrayXs}>Машина</Text>
          <Text style={styles.fontMedium}>
            {order.executor.vehicle?.brand || 'Не указана'} (
            {order.executor.vehicle?.plateNumber || '—'})
          </Text>
        </View>
      )}

      {['IN_TRANSIT', 'AT_DROP'].includes(order?.status) && (
        <View style={styles.card}>
          <View style={[styles.row, styles.mb4]}>
            <Navigation size={18} color="#3b82f6" />
            <Text style={[styles.sectionTitle, styles.ml2, styles.mb0]}>
              Отслеживание на карте
            </Text>
          </View>
          <MapPlaceholder />
        </View>
      )}
    </ScrollView>
  );
}