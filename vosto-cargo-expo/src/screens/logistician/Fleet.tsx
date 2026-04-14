import {
    ChevronDown,
    ChevronLeft,
    MessageCircle,
    Plus,
    Trash2,
    Truck,
    User,
} from 'lucide-react-native';
import React, { useContext, useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import BottomSheet from '../../components/BottomSheet';
import AppContext from '../../context/AppContext';
import { MOCK_DRIVERS } from '../../data/mockDrivers';
import { MOCK_VEHICLES } from '../../data/mockVehicles';
import styles from '../../styles/appStyles';

export default function Fleet() {
  const { navigate, showToast } = useContext(AppContext);
  const [tab, setTab] = useState('cars');
  const [addCarModal, setAddCarModal] = useState(false);
  const [addDriverModal, setAddDriverModal] = useState(false);

  return (
    <View style={styles.flex1}>
      <ScrollView contentContainerStyle={styles.scrollPadding} showsVerticalScrollIndicator={false}>
        <View style={[styles.row, styles.justifyBetween, styles.mb6]}>
          <View style={styles.row}>
            <TouchableOpacity onPress={() => navigate('Home')} style={styles.mr3}>
              <ChevronLeft size={28} color="#000" />
            </TouchableOpacity>
            <Text style={styles.screenTitleNoMargin}>Мой автопарк</Text>
          </View>

          <TouchableOpacity
            style={styles.iconBtnBlue}
            onPress={() => (tab === 'cars' ? setAddCarModal(true) : setAddDriverModal(true))}
          >
            <Plus size={20} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabBtn, tab === 'cars' && styles.tabBtnActive]}
            onPress={() => setTab('cars')}
          >
            <Text style={[styles.tabBtnText, tab === 'cars' && styles.tabBtnTextActive]}>
              Машины
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, tab === 'drivers' && styles.tabBtnActive]}
            onPress={() => setTab('drivers')}
          >
            <Text style={[styles.tabBtnText, tab === 'drivers' && styles.tabBtnTextActive]}>
              Водители
            </Text>
          </TouchableOpacity>
        </View>

        {tab === 'cars' &&
          MOCK_VEHICLES.map(v => (
            <View key={v._id} style={styles.card}>
              <TouchableOpacity style={styles.deleteBtnAbs}>
                <Trash2 size={16} color="#f87171" />
              </TouchableOpacity>

              <View style={[styles.row, styles.mb4]}>
                <View style={styles.iconBoxBlue}>
                  <Truck size={20} color="#3b82f6" />
                </View>

                <View style={styles.ml3}>
                  <Text style={styles.fontBold}>{v.brand}</Text>
                  <View style={styles.plateTag}>
                    <Text style={styles.plateTagText}>{v.plateNumber}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.detailsGrid}>
                <View style={styles.detailsCol}>
                  <Text style={styles.textGrayXs}>Тип</Text>
                  <Text style={styles.fontMedium}>Фура 20т</Text>
                </View>
                <View style={styles.detailsCol}>
                  <Text style={styles.textGrayXs}>Г/П</Text>
                  <Text style={styles.fontMedium}>
                    {v.capacity?.weight ? v.capacity.weight / 1000 : 0} т
                  </Text>
                </View>
                <View style={styles.detailsCol}>
                  <Text style={styles.textGrayXs}>Объем</Text>
                  <Text style={styles.fontMedium}>{v.capacity?.volume || 0} м³</Text>
                </View>
              </View>

              <View style={styles.cardFooter}>
                <View style={styles.row}>
                  <User size={16} color="#9ca3af" />
                  <Text
                    style={[
                      styles.ml1,
                      v.currentDriver ? styles.fontMedium : styles.textGraySmItalic,
                    ]}
                  >
                    {v.currentDriver ? v.currentDriver.name : 'Нет водителя'}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.btnLightBlueSm}
                  onPress={() => showToast('Открыто назначение')}
                >
                  <Text style={styles.btnLightBlueTextSm}>Изменить</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}

        {tab === 'drivers' &&
          MOCK_DRIVERS.map(d => (
            <View key={d._id} style={[styles.card, styles.row, styles.justifyBetween]}>
              <View style={styles.row}>
                <View style={styles.avatarOrange}>
                  <User size={24} color="#ea580c" />
                </View>
                <View style={styles.ml3}>
                  <Text style={styles.fontBold}>{d.name}</Text>
                  <View style={[styles.row, styles.mt1]}>
                    <MessageCircle size={12} color="#9ca3af" />
                    <Text style={styles.textGrayXs}> {d.telegramId}</Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity style={styles.p2}>
                <Trash2 size={18} color="#f87171" />
              </TouchableOpacity>
            </View>
          ))}
      </ScrollView>

      <BottomSheet
        visible={addCarModal}
        onClose={() => setAddCarModal(false)}
        title="Добавить машину"
      >
        <Text style={styles.inputLabel}>Марка и модель</Text>
        <TextInput style={styles.input} placeholder="Volvo FH" />

        <Text style={styles.inputLabel}>Гос. номер</Text>
        <TextInput style={styles.input} placeholder="A 777 AA 777" />

        <Text style={styles.inputLabel}>Тип кузова</Text>
        <TouchableOpacity style={styles.selectMock}>
          <Text style={styles.selectMockText}>Фура 20т</Text>
          <ChevronDown size={20} color="#9ca3af" />
        </TouchableOpacity>

        <View style={[styles.row, styles.mt3]}>
          <View style={[styles.flex1, styles.mr2]}>
            <Text style={styles.inputLabel}>Вес (кг)</Text>
            <TextInput style={styles.input} defaultValue="20000" keyboardType="numeric" />
          </View>
          <View style={styles.flex1}>
            <Text style={styles.inputLabel}>Объем (м³)</Text>
            <TextInput style={styles.input} defaultValue="82" keyboardType="numeric" />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.btnBlue, styles.mt4]}
          onPress={() => {
            showToast('Сохранено');
            setAddCarModal(false);
          }}
        >
          <Text style={styles.btnTextWhite}>Сохранить</Text>
        </TouchableOpacity>
      </BottomSheet>

      <BottomSheet
        visible={addDriverModal}
        onClose={() => setAddDriverModal(false)}
        title="Добавить водителя"
      >
        <View style={styles.row}>
          <TextInput
            style={[styles.input, styles.flex1, styles.mr2, styles.mb0]}
            placeholder="Telegram ID"
            defaultValue="706284378"
          />
          <TouchableOpacity style={styles.btnBlue} onPress={() => showToast('Поиск...')}>
            <Text style={styles.btnTextWhite}>Поиск</Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>
    </View>
  );
}