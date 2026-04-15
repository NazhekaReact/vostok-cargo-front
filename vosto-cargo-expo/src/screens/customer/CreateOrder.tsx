import { ArrowRight, Star } from 'lucide-react-native';
import React, { useContext, useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { parseOrderRequest } from '../../api/ai';
import { createOrderRequest } from '../../api/orders';
import AppContext from '../../context/AppContext';
import styles from '../../styles/appStyles';

export default function CreateOrder() {
  const { showToast, loadOrders, navigate, currentUserId } = useContext(AppContext);

  const [tab, setTab] = useState('ai');
  const [aiText, setAiText] = useState(
    'Нужно перевезти 5 тонн кирпича из Москвы в Тулу завтра. Бюджет 20000р.'
  );

  const [fromCity, setFromCity] = useState('Москва');
  const [fromAddress, setFromAddress] = useState('ул. Ленина, 10');

  const [toCity, setToCity] = useState('Тула');
  const [toAddress, setToAddress] = useState('ул. Центральная, 25');

  const [cargoDescription, setCargoDescription] = useState('кирпич');
  const [weight, setWeight] = useState('5000');
  const [volume, setVolume] = useState('');
  const [price, setPrice] = useState('20000');
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
      setFromCity(parsedRoute.from || '');
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
          },
          to: {
            city: toCity.trim(),
            address: toAddress.trim(),
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
    <ScrollView contentContainerStyle={styles.scrollPadding} showsVerticalScrollIndicator={false}>
      <Text style={styles.screenTitle}>Новый заказ</Text>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabBtn, tab === 'manual' && styles.tabBtnActive]}
          onPress={() => setTab('manual')}
        >
          <Text style={[styles.tabBtnText, tab === 'manual' && styles.tabBtnTextActive]}>
            Вручную
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, tab === 'ai' && styles.tabBtnActive]}
          onPress={() => setTab('ai')}
        >
          <Star size={16} color={tab === 'ai' ? '#3b82f6' : '#6b7280'} />
          <Text style={[styles.tabBtnText, tab === 'ai' && { color: '#3b82f6' }]}>
            {' '}
            AI Помощник
          </Text>
        </TouchableOpacity>
      </View>

      {tab === 'ai' && (
        <View style={styles.aiBox}>
          <View style={[styles.row, styles.mb2]}>
            <Star size={18} color="#2563eb" />
            <Text style={styles.aiTitle}>Умное заполнение</Text>
          </View>

          <Text style={styles.aiSubtitle}>
            Просто опишите, что и куда нужно отвезти. ИИ сам заполнит форму.
          </Text>

          <TextInput
            style={styles.aiInput}
            value={aiText}
            onChangeText={setAiText}
            multiline
            textAlignVertical="top"
          />

          <TouchableOpacity
            style={[styles.btnBlue, styles.row, styles.justifyCenter]}
            onPress={onParseOrder}
            disabled={isParsing}
          >
            <Text style={styles.btnTextWhite}>
              {isParsing ? 'Распознаю...' : 'Заполнить форму '}
            </Text>
            <ArrowRight size={16} color="white" style={styles.ml1} />
          </TouchableOpacity>
        </View>
      )}

      {tab === 'manual' && (
        <View>
          <View style={styles.mb6}>
            <Text style={styles.sectionTitle}>Маршрут</Text>

            <TextInput
              style={styles.input}
              placeholder="Город отправления"
              value={fromCity}
              onChangeText={setFromCity}
            />

            <TextInput
              style={styles.input}
              placeholder="Адрес отправления"
              value={fromAddress}
              onChangeText={setFromAddress}
            />

            <TextInput
              style={[styles.input, styles.mt3]}
              placeholder="Город доставки"
              value={toCity}
              onChangeText={setToCity}
            />

            <TextInput
              style={styles.input}
              placeholder="Адрес доставки"
              value={toAddress}
              onChangeText={setToAddress}
            />
          </View>

          <View style={styles.mb6}>
            <Text style={styles.sectionTitle}>Груз</Text>

            <TextInput
              style={styles.input}
              placeholder="Описание груза"
              value={cargoDescription}
              onChangeText={setCargoDescription}
            />

            <View style={[styles.row, styles.mt3]}>
              <TextInput
                style={[styles.input, styles.flex1, styles.mr2]}
                placeholder="Вес (кг)"
                keyboardType="numeric"
                value={weight}
                onChangeText={setWeight}
              />

              <TextInput
                style={[styles.input, styles.flex1]}
                placeholder="Объем (м³)"
                keyboardType="numeric"
                value={volume}
                onChangeText={setVolume}
              />
            </View>
          </View>

          <View style={styles.mb6}>
            <Text style={styles.sectionTitle}>Детали</Text>

            <TextInput
              style={styles.inputLarge}
              placeholder="Предлагаемая цена"
              keyboardType="numeric"
              value={price}
              onChangeText={setPrice}
            />
          </View>

          <TouchableOpacity style={styles.btnBlueShadow} onPress={onCreateOrder}>
            <Text style={styles.btnTextWhiteLg}>
              {isSubmitting ? 'Создание...' : 'Создать'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}
