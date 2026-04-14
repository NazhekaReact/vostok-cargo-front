import { Briefcase, ChevronDown, Search, Truck } from 'lucide-react-native';
import React, { useContext, useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import BottomSheet from '../../components/BottomSheet';
import OrderCard from '../../components/OrderCard';
import AppContext from '../../context/AppContext';
import styles from '../../styles/appStyles';

export default function LogisticianDashboard() {
  const { navigate, orders, showToast } = useContext(AppContext);
  const [tab, setTab] = useState('search');
  const [bidOrder, setBidOrder] = useState<any>(null);
  const [bidAmount, setBidAmount] = useState('25000');
  const [bidComment, setBidComment] = useState('бензин подорожал');
  const [assignOrder, setAssignOrder] = useState<any>(null);

  const searchOrders = orders.filter((o: any) =>
    ['PUBLISHED', 'NEGOTIATION'].includes(o.status)
  );

  const workOrders = orders.filter(
    (o: any) => !['PUBLISHED', 'NEGOTIATION', 'DELIVERED'].includes(o.status)
  );

  return (
    <View style={styles.flex1}>
      <ScrollView contentContainerStyle={styles.scrollPadding} showsVerticalScrollIndicator={false}>
        <View style={[styles.row, styles.justifyBetween, styles.mb6]}>
          <Text style={styles.screenTitleNoMargin}>Кабинет Логиста</Text>
          <TouchableOpacity style={styles.iconBtnBlue} onPress={() => navigate('Fleet')}>
            <Truck size={20} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabBtn, tab === 'search' && styles.tabBtnActive]}
            onPress={() => setTab('search')}
          >
            <Search size={16} color={tab === 'search' ? '#000' : '#6b7280'} />
            <Text style={[styles.tabBtnText, tab === 'search' && styles.tabBtnTextActive]}>
              Биржа
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, tab === 'work' && styles.tabBtnActive]}
            onPress={() => setTab('work')}
          >
            <Briefcase size={16} color={tab === 'work' ? '#000' : '#6b7280'} />
            <Text style={[styles.tabBtnText, tab === 'work' && styles.tabBtnTextActive]}>
              В работе
            </Text>
          </TouchableOpacity>
        </View>

        {tab === 'search' &&
          searchOrders.map((o: any) => (
            <OrderCard
              key={o._id}
              order={o}
              actionButton={
                <TouchableOpacity style={styles.btnLightBlue} onPress={() => setBidOrder(o)}>
                  <Text style={styles.btnLightBlueText}>Сделать ставку</Text>
                </TouchableOpacity>
              }
            />
          ))}

        {tab === 'work' &&
          workOrders.map((o: any) => (
            <OrderCard
              key={o._id}
              order={o}
              onClick={() => navigate('OrderDetails', { id: o._id })}
              actionButton={
                o.status === 'APPROVED' ? (
                  <TouchableOpacity style={styles.btnGreen} onPress={() => setAssignOrder(o)}>
                    <Text style={styles.btnTextWhite}>Назначить машину</Text>
                  </TouchableOpacity>
                ) : null
              }
            />
          ))}
      </ScrollView>

      <BottomSheet visible={!!bidOrder} onClose={() => setBidOrder(null)}>
        <TextInput
          style={styles.inputLarge}
          value={bidAmount}
          onChangeText={setBidAmount}
          placeholder="Сумма"
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          value={bidComment}
          onChangeText={setBidComment}
          placeholder="Комментарий"
        />
        <View style={[styles.row, styles.mt4]}>
          <TouchableOpacity
            style={[styles.btnBlue, styles.flex1, styles.mr2]}
            onPress={() => {
              showToast('Ставка отправлена');
              setBidOrder(null);
            }}
          >
            <Text style={styles.btnTextWhite}>Отправить</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btnGray, styles.flex1]}
            onPress={() => setBidOrder(null)}
          >
            <Text style={styles.btnTextBlack}>Отмена</Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>

      <BottomSheet
        visible={!!assignOrder}
        onClose={() => setAssignOrder(null)}
        title="Назначение на рейс"
        subtitle="Астана → Астана"
      >
        <Text style={styles.inputLabel}>Выберите машину</Text>
        <TouchableOpacity style={styles.selectMock}>
          <Text style={styles.selectMockText}>
            HYUNDAI (000DID01) — Водитель: ChilDrake
          </Text>
          <ChevronDown size={20} color="#9ca3af" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btnBlue, styles.mt4]}
          onPress={() => {
            showToast('Машина назначена');
            setAssignOrder(null);
          }}
        >
          <Text style={styles.btnTextWhite}>Назначить</Text>
        </TouchableOpacity>
      </BottomSheet>
    </View>
  );
}