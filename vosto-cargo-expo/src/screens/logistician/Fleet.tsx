import {
    ChevronDown,
    ChevronLeft,
    MessageCircle,
    Plus,
    Trash2,
    Truck,
    User,
} from 'lucide-react-native';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import {
  addDriverRequest,
  addVehicleRequest,
  assignDriverToVehicleRequest,
  getDriversRequest,
  getVehiclesRequest,
} from '../../api/fleet';
import BottomSheet from '../../components/BottomSheet';
import AppContext from '../../context/AppContext';
import { MOCK_DRIVERS } from '../../data/mockDrivers';
import { MOCK_VEHICLES } from '../../data/mockVehicles';
import styles from '../../styles/appStyles';

export default function Fleet() {
  const { navigate, showToast, currentUserId } = useContext(AppContext);
  const [tab, setTab] = useState('cars');
  const [addCarModal, setAddCarModal] = useState(false);
  const [addDriverModal, setAddDriverModal] = useState(false);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [brand, setBrand] = useState('Volvo FH');
  const [plateNumber, setPlateNumber] = useState('A 777 AA 777');
  const [vehicleType, setVehicleType] = useState('TRUCK_20T');
  const [weight, setWeight] = useState('20000');
  const [volume, setVolume] = useState('82');
  const [telegramId, setTelegramId] = useState('706284378');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const visibleVehicles = vehicles.length ? vehicles : MOCK_VEHICLES;
  const visibleDrivers = drivers.length ? drivers : MOCK_DRIVERS;

  const loadFleet = useCallback(async () => {
    if (!currentUserId) return;

    try {
      const [vehiclesData, driversData] = await Promise.all([
        getVehiclesRequest(currentUserId),
        getDriversRequest(currentUserId),
      ]);
      setVehicles(Array.isArray(vehiclesData) ? vehiclesData : []);
      setDrivers(Array.isArray(driversData) ? driversData : []);
    } catch (error: any) {
      console.log('FLEET LOAD ERROR:', error?.response?.data || error?.message || error);
      showToast('Не удалось загрузить автопарк');
    }
  }, [currentUserId, showToast]);

  const onAddVehicle = async () => {
    if (!currentUserId) {
      showToast('Нужен логист для сохранения');
      return;
    }

    try {
      setIsSubmitting(true);
      await addVehicleRequest({
        ownerId: currentUserId,
        brand: brand.trim(),
        plateNumber: plateNumber.trim(),
        type: vehicleType,
        capacity: {
          weight: Number(weight) || 0,
          volume: Number(volume) || 0,
        },
      });
      showToast('Машина сохранена');
      setAddCarModal(false);
      await loadFleet();
    } catch (error: any) {
      console.log('ADD VEHICLE ERROR:', error?.response?.data || error?.message || error);
      showToast('Не удалось сохранить машину');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onAddDriver = async () => {
    if (!currentUserId) {
      showToast('Нужен логист для добавления');
      return;
    }

    try {
      setIsSubmitting(true);
      await addDriverRequest({
        logisticianId: currentUserId,
        telegramId: telegramId.trim(),
      });
      showToast('Водитель добавлен');
      setAddDriverModal(false);
      await loadFleet();
    } catch (error: any) {
      console.log('ADD DRIVER ERROR:', error?.response?.data || error?.message || error);
      showToast('Не удалось добавить водителя');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onAssignFirstDriver = async (vehicleId: string) => {
    const driverId = drivers[0]?._id;
    if (!vehicleId || !driverId) {
      showToast('Сначала добавьте водителя');
      return;
    }

    try {
      await assignDriverToVehicleRequest({ vehicleId, driverId });
      showToast('Водитель закреплен');
      await loadFleet();
    } catch (error: any) {
      console.log('ASSIGN DRIVER ERROR:', error?.response?.data || error?.message || error);
      showToast('Не удалось закрепить водителя');
    }
  };

  useEffect(() => {
    loadFleet();
  }, [loadFleet]);

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
          visibleVehicles.map(v => (
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
                  onPress={() => onAssignFirstDriver(v._id)}
                >
                  <Text style={styles.btnLightBlueTextSm}>Изменить</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}

        {tab === 'drivers' &&
          visibleDrivers.map(d => (
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
        <TextInput style={styles.input} placeholder="Volvo FH" value={brand} onChangeText={setBrand} />

        <Text style={styles.inputLabel}>Гос. номер</Text>
        <TextInput
          style={styles.input}
          placeholder="A 777 AA 777"
          value={plateNumber}
          onChangeText={setPlateNumber}
        />

        <Text style={styles.inputLabel}>Тип кузова</Text>
        <TouchableOpacity
          style={styles.selectMock}
          onPress={() => setVehicleType(vehicleType === 'TRUCK_20T' ? 'TRUCK_10T' : 'TRUCK_20T')}
        >
          <Text style={styles.selectMockText}>
            {vehicleType === 'TRUCK_20T' ? 'Фура 20т' : 'Грузовик 10т'}
          </Text>
          <ChevronDown size={20} color="#9ca3af" />
        </TouchableOpacity>

        <View style={[styles.row, styles.mt3]}>
          <View style={[styles.flex1, styles.mr2]}>
            <Text style={styles.inputLabel}>Вес (кг)</Text>
            <TextInput
              style={styles.input}
              value={weight}
              onChangeText={setWeight}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.flex1}>
            <Text style={styles.inputLabel}>Объем (м³)</Text>
            <TextInput
              style={styles.input}
              value={volume}
              onChangeText={setVolume}
              keyboardType="numeric"
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.btnBlue, styles.mt4]}
          onPress={onAddVehicle}
          disabled={isSubmitting}
        >
          <Text style={styles.btnTextWhite}>
            {isSubmitting ? 'Сохраняю...' : 'Сохранить'}
          </Text>
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
            value={telegramId}
            onChangeText={setTelegramId}
          />
          <TouchableOpacity style={styles.btnBlue} onPress={onAddDriver} disabled={isSubmitting}>
            <Text style={styles.btnTextWhite}>
              {isSubmitting ? 'Добавляю...' : 'Добавить'}
            </Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>
    </View>
  );
}
