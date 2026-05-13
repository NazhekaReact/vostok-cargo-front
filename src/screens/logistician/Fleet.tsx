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
import styles from '../../styles/appStyles';
import { t } from '../../utils/i18n';

export default function Fleet() {
  const { navigate, showToast, currentUserId, isDark, language } = useContext(AppContext);
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
      showToast('Нет логиста для сохранения');
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
      showToast('Нет логиста для добавления');
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

    if (!currentUserId) {
      showToast('Нет логиста для закрепления');
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
              <ChevronLeft size={28} color={isDark ? '#f9fafb' : '#000'} />
            </TouchableOpacity>
            <Text style={[styles.screenTitleNoMargin, isDark && styles.textWhite]}>{t('fleet.title', language)}</Text>
          </View>

          <TouchableOpacity
            style={styles.iconBtnBlue}
            onPress={() => (tab === 'cars' ? setAddCarModal(true) : setAddDriverModal(true))}
          >
            <Plus size={20} color="white" />
          </TouchableOpacity>
        </View>

        <View style={[styles.tabContainer, isDark && styles.tabContainerDark]}>
          <TouchableOpacity
            style={[styles.tabBtn, tab === 'cars' && styles.tabBtnActive, tab === 'cars' && isDark && styles.tabBtnActiveDark]}
            onPress={() => setTab('cars')}
          >
            <Text style={[styles.tabBtnText, tab === 'cars' && styles.tabBtnTextActive, isDark && { color: '#9ca3af' }, tab === 'cars' && isDark && styles.textWhite]}>
              {t('fleet.cars', language)}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, tab === 'drivers' && styles.tabBtnActive, tab === 'drivers' && isDark && styles.tabBtnActiveDark]}
            onPress={() => setTab('drivers')}
          >
            <Text style={[styles.tabBtnText, tab === 'drivers' && styles.tabBtnTextActive, isDark && { color: '#9ca3af' }, tab === 'drivers' && isDark && styles.textWhite]}>
              {t('fleet.drivers', language)}
            </Text>
          </TouchableOpacity>
        </View>

        {tab === 'cars' &&
          vehicles.map(v => (
            <View key={v._id} style={[styles.card, isDark && styles.cardDark]}>
              <TouchableOpacity style={styles.deleteBtnAbs}>
                <Trash2 size={16} color="#f87171" />
              </TouchableOpacity>

              <View style={[styles.row, styles.mb4]}>
                <View style={[styles.iconBoxBlue, isDark && styles.iconBoxBlueDark]}>
                  <Truck size={20} color="#3b82f6" />
                </View>

                <View style={styles.ml3}>
                  <Text style={[styles.fontBold, isDark && styles.textWhite]}>{v.brand}</Text>
                  <View style={[styles.plateTag, isDark && styles.plateTagDark]}>
                    <Text style={styles.plateTagText}>{v.plateNumber}</Text>
                  </View>
                </View>
              </View>

              <View style={[styles.detailsGrid, isDark && styles.detailsGridDark]}>
                <View style={styles.detailsCol}>
                  <Text style={styles.textGrayXs}>{t('fleet.type', language)}</Text>
                  <Text style={[styles.fontMedium, isDark && styles.textWhite]}>{t('fleet.truck20', language)}</Text>
                </View>
                <View style={styles.detailsCol}>
                  <Text style={styles.textGrayXs}>{t('fleet.capacity', language)}</Text>
                  <Text style={[styles.fontMedium, isDark && styles.textWhite]}>
                    {v.capacity?.weight ? v.capacity.weight / 1000 : 0} т
                  </Text>
                </View>
                <View style={styles.detailsCol}>
                  <Text style={styles.textGrayXs}>{t('fleet.volume', language)}</Text>
                  <Text style={[styles.fontMedium, isDark && styles.textWhite]}>{v.capacity?.volume || 0} м³</Text>
                </View>
              </View>

              <View style={[styles.cardFooter, isDark && { borderTopColor: '#374151' }]}>
                <View style={styles.row}>
                  <User size={16} color="#9ca3af" />
                  <Text
                    style={[
                      styles.ml1,
                      v.currentDriver ? [styles.fontMedium, isDark && styles.textWhite] : styles.textGraySmItalic,
                    ]}
                  >
                    {v.currentDriver ? v.currentDriver.name : t('fleet.noDriver', language)}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.btnLightBlueSm}
                  onPress={() => onAssignFirstDriver(v._id)}
                >
                  <Text style={styles.btnLightBlueTextSm}>{t('fleet.change', language)}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}

        {tab === 'cars' && !vehicles.length && (
          <Text style={styles.emptyText}>{t('fleet.noCars', language)}</Text>
        )}

        {tab === 'drivers' &&
          drivers.map(d => (
            <View key={d._id} style={[styles.card, styles.row, styles.justifyBetween, isDark && styles.cardDark]}>
              <View style={styles.row}>
                <View style={styles.avatarOrange}>
                  <User size={24} color="#ea580c" />
                </View>
                <View style={styles.ml3}>
                  <Text style={[styles.fontBold, isDark && styles.textWhite]}>{d.name}</Text>
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

        {tab === 'drivers' && !drivers.length && (
          <Text style={styles.emptyText}>{t('fleet.noDrivers', language)}</Text>
        )}
      </ScrollView>

      <BottomSheet
        visible={addCarModal}
        onClose={() => setAddCarModal(false)}
        title={t('fleet.addVehicle', language)}
      >
        <Text style={[styles.inputLabel, isDark && { color: '#9ca3af' }]}>{t('fleet.brand', language)}</Text>
        <TextInput style={[styles.input, isDark && styles.inputDark]} placeholder="Volvo FH" placeholderTextColor={isDark ? '#6b7280' : undefined} value={brand} onChangeText={setBrand} />

        <Text style={[styles.inputLabel, isDark && { color: '#9ca3af' }]}>{t('fleet.plateNumber', language)}</Text>
        <TextInput
          style={[styles.input, isDark && styles.inputDark]}
          placeholder="A 777 AA 777"
          placeholderTextColor={isDark ? '#6b7280' : undefined}
          value={plateNumber}
          onChangeText={setPlateNumber}
        />

        <Text style={[styles.inputLabel, isDark && { color: '#9ca3af' }]}>{t('fleet.bodyType', language)}</Text>
        <TouchableOpacity
          style={[styles.selectMock, isDark && styles.selectMockDark]}
          onPress={() => setVehicleType(vehicleType === 'TRUCK_20T' ? 'TRUCK_10T' : 'TRUCK_20T')}
        >
          <Text style={[styles.selectMockText, isDark && styles.selectMockTextDark]}>
            {vehicleType === 'TRUCK_20T' ? t('fleet.truck20', language) : t('fleet.truck10', language)}
          </Text>
          <ChevronDown size={20} color="#9ca3af" />
        </TouchableOpacity>

        <View style={[styles.row, styles.mt3]}>
          <View style={[styles.flex1, styles.mr2]}>
            <Text style={[styles.inputLabel, isDark && { color: '#9ca3af' }]}>{t('fleet.weightKg', language)}</Text>
            <TextInput
              style={[styles.input, isDark && styles.inputDark]}
              value={weight}
              onChangeText={setWeight}
              keyboardType="numeric"
              placeholderTextColor={isDark ? '#6b7280' : undefined}
            />
          </View>
          <View style={styles.flex1}>
            <Text style={[styles.inputLabel, isDark && { color: '#9ca3af' }]}>{t('fleet.volumeM3', language)}</Text>
            <TextInput
              style={[styles.input, isDark && styles.inputDark]}
              value={volume}
              onChangeText={setVolume}
              keyboardType="numeric"
              placeholderTextColor={isDark ? '#6b7280' : undefined}
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.btnBlue, styles.mt4]}
          onPress={onAddVehicle}
          disabled={isSubmitting}
        >
          <Text style={styles.btnTextWhite}>
            {isSubmitting ? t('fleet.saving', language) : t('fleet.save', language)}
          </Text>
        </TouchableOpacity>
      </BottomSheet>

      <BottomSheet
        visible={addDriverModal}
        onClose={() => setAddDriverModal(false)}
        title={t('fleet.addDriver', language)}
      >
        <View style={styles.row}>
          <TextInput
            style={[styles.input, styles.flex1, styles.mr2, styles.mb0, isDark && styles.inputDark]}
            placeholder="Telegram ID"
            placeholderTextColor={isDark ? '#6b7280' : undefined}
            value={telegramId}
            onChangeText={setTelegramId}
          />
          <TouchableOpacity style={styles.btnBlue} onPress={onAddDriver} disabled={isSubmitting}>
            <Text style={styles.btnTextWhite}>
              {isSubmitting ? t('fleet.adding', language) : t('fleet.add', language)}
            </Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>
    </View>
  );
}
