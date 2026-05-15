import { ArrowRight, MapPin, Star } from 'lucide-react-native';
import React, { useContext, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { parseOrderRequest } from '../../api/ai';
import { createOrderRequest } from '../../api/orders';
import AddressAutocomplete from '../../components/AddressAutocomplete';
import AppContext from '../../context/AppContext';
import styles from '../../styles/appStyles';
import { t } from '../../utils/i18n';

export default function CreateOrder() {
  const { showToast, loadOrders, navigate, currentUserId, isDark, language } = useContext(AppContext);

  const [tab, setTab] = useState('ai');
  const [aiText, setAiText] = useState(
    'Нужно перевезти 5 тонн кирпича из Москвы в Тулу завтра. Бюджет 20000р.'
  );

  const [fromCity, setFromCity] = useState('');
  const [fromAddress, setFromAddress] = useState('');
  const [fromLat, setFromLat] = useState('');
  const [fromLon, setFromLon] = useState('');

  const [toCity, setToCity] = useState('');
  const [toAddress, setToAddress] = useState('');
  const [toLat, setToLat] = useState('');
  const [toLon, setToLon] = useState('');

  const [cargoDescription, setCargoDescription] = useState('');
  const [weight, setWeight] = useState('');
  const [volume, setVolume] = useState('');
  const [price, setPrice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isParsing, setIsParsing] = useState(false);

  const onParseOrder = async () => {
    try {
      setIsParsing(true);
      const data = await parseOrderRequest(aiText);
      const parsedCargo = data?.cargo || {};
      const parsedRoute = data?.route || {};
      const estimatedPrice = data?.estimatedPrice || {};

      setCargoDescription(parsedCargo.description || aiText);
      setWeight(String(parsedCargo.weight || ''));
      setVolume(String(parsedCargo.volume || ''));
      setFromAddress(parsedRoute.from || '');
      setFromCity(parsedRoute.from || '');
      setToAddress(parsedRoute.to || '');
      setToCity(parsedRoute.to || '');
      setPrice(String(estimatedPrice.max || estimatedPrice.min || ''));

      showToast('Данные распознаны');
      setTab('manual');
    } catch (error: any) {
      console.log('AI PARSE ERROR:', error?.response?.data || error?.message || error);
      showToast('Не удалось распознать текст');
    } finally {
      setIsParsing(false);
    }
  };

  const onCreateOrder = async () => {
    if (!fromAddress.trim() || !toAddress.trim()) {
      showToast('Выберите адреса из предложенных вариантов');
      return;
    }

    try {
      setIsSubmitting(true);

      const normalizedCargo = {
        description: cargoDescription.trim(),
        weight: Number(weight) || 0,
        volume: Number(volume) || 0,
      };

      const payload = {
        route: {
          from: {
            city: fromCity.trim(),
            address: fromAddress.trim(),
            lat: fromLat,
            lon: fromLon,
          },
          to: {
            city: toCity.trim(),
            address: toAddress.trim(),
            lat: toLat,
            lon: toLon,
          },
        },

        // для новой структуры фронта
        cargoDetails: normalizedCargo,

        // для совместимости со старым бэком
        cargo: normalizedCargo,

        pricing: {
          customerOffer: Number(price) || 0,
        },
        customerId: currentUserId,
      };

      console.log('CREATE ORDER PAYLOAD:', payload);

      const data = await createOrderRequest(payload);
      console.log('CREATE ORDER OK:', data);

      showToast('Заказ создан');
      await loadOrders?.();
      navigate?.('Home');
    } catch (error: any) {
      console.log(
        'CREATE ORDER ERROR:',
        error?.response?.data || error?.message || error
      );
      showToast('Не удалось создать заказ');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.scrollPadding}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={[styles.screenTitle, isDark && styles.textWhite]}>{t('create.title', language)}</Text>

      <View style={[styles.tabContainer, isDark && styles.tabContainerDark]}>
        <TouchableOpacity
          style={[styles.tabBtn, tab === 'manual' && styles.tabBtnActive, tab === 'manual' && isDark && styles.tabBtnActiveDark]}
          onPress={() => setTab('manual')}
        >
          <Text style={[styles.tabBtnText, tab === 'manual' && styles.tabBtnTextActive, isDark && { color: '#9ca3af' }, tab === 'manual' && isDark && styles.textWhite]}>
            {t('create.manual', language)}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, tab === 'ai' && styles.tabBtnActive, tab === 'ai' && isDark && styles.tabBtnActiveDark]}
          onPress={() => setTab('ai')}
        >
          <Star size={16} color={tab === 'ai' ? '#3b82f6' : '#6b7280'} />
          <Text style={[styles.tabBtnText, tab === 'ai' && { color: '#3b82f6' }]}>
            {' '}
            {t('create.aiHelper', language)}
          </Text>
        </TouchableOpacity>
      </View>

      {tab === 'ai' && (
        <View style={[styles.aiBox, isDark && styles.aiBoxDark]}>
          <View style={[styles.row, styles.mb2]}>
            <Star size={18} color="#2563eb" />
            <Text style={styles.aiTitle}>{t('create.smartFill', language)}</Text>
          </View>

          <Text style={styles.aiSubtitle}>
            {t('create.smartFillHint', language)}
          </Text>

          <TextInput
            style={[styles.aiInput, isDark && styles.inputDark]}
            value={aiText}
            onChangeText={setAiText}
            multiline
            textAlignVertical="top"
            placeholderTextColor={isDark ? '#6b7280' : undefined}
          />

          <TouchableOpacity
            style={[styles.btnBlue, styles.row, styles.justifyCenter]}
            onPress={onParseOrder}
            disabled={isParsing}
          >
            <Text style={styles.btnTextWhite}>
              {isParsing ? t('create.parsing', language) : t('create.fillForm', language)}
            </Text>
            <ArrowRight size={16} color="white" style={styles.ml1} />
          </TouchableOpacity>
        </View>
      )}

      {tab === 'manual' && (
        <View>
          <View style={[styles.mb6, { zIndex: 20 }]}>
            <Text style={[styles.sectionTitle, isDark && styles.textWhite]}>{t('create.route', language)}</Text>

            {/* ── Откуда (From) ── */}
            <View style={[localStyles.addressGroup, isDark && localStyles.addressGroupDark]}>
              <View style={localStyles.addressLabel}>
                <View style={[localStyles.dot, { backgroundColor: '#22c55e' }]} />
                <Text style={[localStyles.addressLabelText, isDark && styles.textWhite]}>
                  {t('create.fromCity', language)}
                </Text>
              </View>
              <View style={{ zIndex: 12 }}>
                <AddressAutocomplete
                  placeholder={`🔍 ${t('create.fromAddress', language)}`}
                  value={fromAddress}
                  onChangeText={(text) => {
                    setFromAddress(text);
                    setFromCity('');
                    setFromLat('');
                    setFromLon('');
                  }}
                  onSelect={(item) => {
                    setFromAddress(item.displayName);
                    setFromCity(item.city);
                    setFromLat(item.lat);
                    setFromLon(item.lon);
                  }}
                />
              </View>
              {fromCity ? (
                <View style={localStyles.selectedTag}>
                  <MapPin size={12} color="#22c55e" />
                  <Text style={localStyles.selectedTagText}>
                    {fromCity}
                  </Text>
                </View>
              ) : null}
            </View>

            {/* ── Куда (To) ── */}
            <View style={[localStyles.addressGroup, isDark && localStyles.addressGroupDark, { zIndex: 9 }]}>
              <View style={localStyles.addressLabel}>
                <View style={[localStyles.dot, { backgroundColor: '#ef4444' }]} />
                <Text style={[localStyles.addressLabelText, isDark && styles.textWhite]}>
                  {t('create.toCity', language)}
                </Text>
              </View>
              <View style={{ zIndex: 11 }}>
                <AddressAutocomplete
                  placeholder={`🔍 ${t('create.toAddress', language)}`}
                  value={toAddress}
                  onChangeText={(text) => {
                    setToAddress(text);
                    setToCity('');
                    setToLat('');
                    setToLon('');
                  }}
                  onSelect={(item) => {
                    setToAddress(item.displayName);
                    setToCity(item.city);
                    setToLat(item.lat);
                    setToLon(item.lon);
                  }}
                />
              </View>
              {toCity ? (
                <View style={localStyles.selectedTag}>
                  <MapPin size={12} color="#ef4444" />
                  <Text style={localStyles.selectedTagText}>
                    {toCity}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>

          <View style={styles.mb6}>
            <Text style={[styles.sectionTitle, isDark && styles.textWhite]}>{t('create.cargo', language)}</Text>

            <TextInput
              style={[styles.input, isDark && styles.inputDark]}
              placeholder={t('create.cargoDesc', language)}
              placeholderTextColor={isDark ? '#6b7280' : undefined}
              value={cargoDescription}
              onChangeText={setCargoDescription}
            />

            <View style={[styles.row, styles.mt3]}>
              <TextInput
                style={[styles.input, styles.flex1, styles.mr2, isDark && styles.inputDark]}
                placeholder={t('create.weight', language)}
                placeholderTextColor={isDark ? '#6b7280' : undefined}
                keyboardType="numeric"
                value={weight}
                onChangeText={setWeight}
              />

              <TextInput
                style={[styles.input, styles.flex1, isDark && styles.inputDark]}
                placeholder={t('create.volume', language)}
                placeholderTextColor={isDark ? '#6b7280' : undefined}
                keyboardType="numeric"
                value={volume}
                onChangeText={setVolume}
              />
            </View>
          </View>

          <View style={styles.mb6}>
            <Text style={[styles.sectionTitle, isDark && styles.textWhite]}>{t('create.details', language)}</Text>

            <TextInput
              style={[styles.inputLarge, isDark && styles.inputDark]}
              placeholder={t('create.price', language)}
              placeholderTextColor={isDark ? '#6b7280' : undefined}
              keyboardType="numeric"
              value={price}
              onChangeText={setPrice}
            />
          </View>

          <TouchableOpacity style={styles.btnBlueShadow} onPress={onCreateOrder}>
            <Text style={styles.btnTextWhiteLg}>
              {isSubmitting ? t('create.submitting', language) : t('create.submit', language)}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const localStyles = StyleSheet.create({
  addressGroup: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  addressGroupDark: {
    backgroundColor: '#1f2937',
    borderColor: '#374151',
  },
  addressLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  addressLabelText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  selectedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  selectedTagText: {
    fontSize: 12,
    color: '#16a34a',
    fontWeight: '600',
    marginLeft: 4,
  },
});

