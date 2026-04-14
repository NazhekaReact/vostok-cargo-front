import { ChevronLeft } from 'lucide-react-native';
import React, { useContext } from 'react';
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import AppContext from '../../context/AppContext';
import styles from '../../styles/appStyles';

export default function LanguageSelector() {
  const { navigate, showToast } = useContext(AppContext);

  const langs = [
    { code: 'en', name: 'English', native: 'English' },
    { code: 'tj', name: 'Таджикский', native: 'Тоҷикӣ' },
    { code: 'uz', name: 'Узбекский', native: "O'zbekcha" },
    { code: 'tr', name: 'Турецкий', native: 'Türkçe' },
    { code: 'zh', name: 'Китайский', native: '中文' },
    { code: 'ru', name: 'Русский', native: 'Русский' },
  ];

  return (
    <View style={styles.langContainer}>
      <SafeAreaView>
        <View style={styles.langHeader}>
          <TouchableOpacity onPress={() => navigate('Menu')}>
            <ChevronLeft size={28} color="white" />
          </TouchableOpacity>
          <Text style={styles.langTitle}>Выберите язык</Text>
        </View>
      </SafeAreaView>

      <View style={styles.langContent}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {langs.map(l => (
            <TouchableOpacity
              key={l.code}
              style={[styles.langCard, l.code === 'ru' && styles.langCardActive]}
              onPress={() => {
                showToast('Язык изменен');
                navigate('Menu');
              }}
            >
              <View>
                <Text style={styles.langName}>{l.name}</Text>
                <Text style={styles.langNative}>{l.native}</Text>
              </View>

              <View
                style={[styles.radioCircle, l.code === 'ru' && styles.radioCircleActive]}
              >
                {l.code === 'ru' && <View style={styles.radioDot} />}
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}