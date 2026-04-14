import { ArrowRight, Star } from 'lucide-react-native';
import React, { useContext, useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AppContext from '../../context/AppContext';
import styles from '../../styles/appStyles';

export default function CreateOrder() {
  const { showToast } = useContext(AppContext);
  const [tab, setTab] = useState('ai');
  const [aiText, setAiText] = useState(
    'Нужно перевезти 5 тонн кирпича из Москвы в Тулу завтра. Бюджет 20000р.'
  );

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
            onPress={() => {
              showToast('Данные распознаны!');
              setTab('manual');
            }}
          >
            <Text style={styles.btnTextWhite}>Заполнить форму </Text>
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
              placeholder="Откуда: Город, улица, дом"
              defaultValue="Москва"
            />
            <TextInput
              style={[styles.input, styles.mt3]}
              placeholder="Куда: Город, улица, дом"
              defaultValue="Тула"
            />
          </View>

          <View style={styles.mb6}>
            <Text style={styles.sectionTitle}>Груз</Text>
            <TextInput
              style={styles.input}
              placeholder="Описание: Строительные материалы"
              defaultValue="кирпич"
            />
            <View style={[styles.row, styles.mt3]}>
              <TextInput
                style={[styles.input, styles.flex1, styles.mr2]}
                placeholder="Вес (кг)"
                keyboardType="numeric"
                defaultValue="5000"
              />
              <TextInput
                style={[styles.input, styles.flex1]}
                placeholder="Объем (м³)"
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.mb6}>
            <Text style={styles.sectionTitle}>Детали</Text>
            <TextInput
              style={styles.inputLarge}
              placeholder="Предлагаемая цена (₽)"
              keyboardType="numeric"
              defaultValue="20000"
            />
          </View>

          <TouchableOpacity
            style={styles.btnBlueShadow}
            onPress={() => showToast('Заказ создан!')}
          >
            <Text style={styles.btnTextWhiteLg}>Создать</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}