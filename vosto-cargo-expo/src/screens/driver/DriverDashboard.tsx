import { Camera, CheckCircle2, MapPin, Navigation } from 'lucide-react-native';
import React, { useContext, useState } from 'react';
import { ScrollView, Switch, Text, TouchableOpacity, View } from 'react-native';
import { updateDriverOrderStatusRequest } from '../../api/driver';
import OrderCard from '../../components/OrderCard';
import AppContext from '../../context/AppContext';
import styles from '../../styles/appStyles';

export default function DriverDashboard() {
  const { navigate, orders, showToast, loadOrders } = useContext(AppContext);
  const [gpsActive, setGpsActive] = useState(false);
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
      <Text style={styles.screenTitle}>Панель водителя</Text>

      <View style={[styles.card, styles.row, styles.justifyBetween, styles.itemsCenter]}>
        <View style={styles.row}>
          <View style={styles.iconBoxGray}>
            <Navigation size={20} color="#6b7280" />
          </View>
          <View style={styles.ml3}>
            <Text style={styles.fontBold}>GPS Трансляция</Text>
            <Text style={styles.textGrayXs}>
              {gpsActive ? 'Трансляция активна' : 'Трансляция выключена'}
            </Text>
          </View>
        </View>

        <View style={styles.row}>
          {!gpsActive && (
            <TouchableOpacity
              style={styles.btnSmallBlue}
              onPress={() => showToast('GPS Симуляция')}
            >
              <Text style={styles.btnSmallBlueText}>Тест GPS</Text>
            </TouchableOpacity>
          )}

          <View style={styles.ml2}>
            <Switch
              value={gpsActive}
              onValueChange={setGpsActive}
              trackColor={{ false: '#d1d5db', true: '#3b82f6' }}
            />
          </View>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Текущий рейс</Text>

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
                {isSubmitting ? 'Обновляю...' : 'Прибыл на погрузку'}
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
                {isSubmitting ? 'Обновляю...' : 'Начать рейс'}
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
                {isSubmitting ? 'Обновляю...' : 'Прибыл на выгрузку'}
              </Text>
            </TouchableOpacity>
          )}

          {activeOrder.status === 'AT_DROP' && (
            <View style={styles.podBox}>
              <View style={styles.cameraIconBox}>
                <Camera size={24} color="#3b82f6" />
              </View>
              <Text style={styles.podText}>Загрузить фотоотчет (PoD)</Text>
              <TouchableOpacity
                style={styles.btnGreen}
                onPress={() => updateStatus('DELIVERED', 'Рейс завершен')}
                disabled={isSubmitting}
              >
                <CheckCircle2 size={18} color="white" />
                <Text style={styles.btnTextWhite}>
                  {isSubmitting ? 'Обновляю...' : ' Завершить рейс'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      ) : (
        <Text style={styles.emptyText}>Нет активного рейса</Text>
      )}

      <Text style={styles.sectionTitle}>Все заказы</Text>

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
