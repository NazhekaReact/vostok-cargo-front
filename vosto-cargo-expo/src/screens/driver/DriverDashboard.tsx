import { Camera, CheckCircle2, MapPin, Navigation } from 'lucide-react-native';
import React, { useContext, useState } from 'react';
import { ScrollView, Switch, Text, TouchableOpacity, View } from 'react-native';
import OrderCard from '../../components/OrderCard';
import AppContext from '../../context/AppContext';
import styles from '../../styles/appStyles';

export default function DriverDashboard() {
  const { navigate, orders, showToast } = useContext(AppContext);
  const [gpsActive, setGpsActive] = useState(false);

  const activeOrder = orders.find((o: any) =>
    ['ASSIGNED', 'IN_TRANSIT', 'AT_DROP'].includes(o.status)
  );

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
              onPress={() => showToast('Статус обновлен')}
            >
              <MapPin size={18} color="white" />
              <Text style={styles.btnTextWhite}>Прибыл на погрузку</Text>
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
                onPress={() => showToast('Рейс завершен')}
              >
                <CheckCircle2 size={18} color="white" />
                <Text style={styles.btnTextWhite}> Завершить рейс</Text>
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