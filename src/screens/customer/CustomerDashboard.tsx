import { ArrowRight } from 'lucide-react-native';
import React, { useContext } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import OrderCard from '../../components/OrderCard';
import AppContext from '../../context/AppContext';
import styles from '../../styles/appStyles';
import { t } from '../../utils/i18n';

export default function CustomerDashboard() {
  const { navigate, orders, isDark, language } = useContext(AppContext);
  const active = orders.find((o: any) => o.status === 'IN_TRANSIT');

  return (
    <ScrollView contentContainerStyle={styles.scrollPadding} showsVerticalScrollIndicator={false}>
      <Text style={[styles.screenTitle, isDark && styles.textWhite]}>{t('customer.myOrders', language)}</Text>

      {active && (
        <TouchableOpacity
          style={styles.darkCard}
          activeOpacity={0.9}
          onPress={() => navigate('OrderDetails', { id: active._id })}
        >
          <View style={styles.darkCardMap}>
            <View style={styles.pulseDotWrapper}>
              <View style={styles.pulseDotBg} />
              <View style={styles.pulseDot} />
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.greenDot} />
            <Text style={styles.darkCardText}>{t('customer.inTransit', language)}</Text>
          </View>
        </TouchableOpacity>
      )}

      {orders
        .filter((o: any) => o.status !== 'IN_TRANSIT')
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