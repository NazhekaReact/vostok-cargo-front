import { ChevronLeft } from 'lucide-react-native';
import React, { useContext } from 'react';
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { saveLanguageRequest } from '../../api/users';
import AppContext from '../../context/AppContext';
import styles from '../../styles/appStyles';
import { t } from '../../utils/i18n';

export default function LanguageSelector() {
  const { navigate, showToast, language, setLanguage, currentUserId, isDark } = useContext(AppContext);

  const langs = [
    { code: 'ru', name: 'Русский', native: 'Русский' },
    { code: 'en', name: 'English', native: 'English' },
    { code: 'kk', name: 'Қазақша', native: 'Қазақ тілі' },
  ];

  const onSelectLanguage = async (code: string) => {
    if (!currentUserId) {
      showToast('Нет пользователя для сохранения языка');
      return;
    }

    try {
      await saveLanguageRequest({ userId: currentUserId, language: code });
      setLanguage(code);
      showToast(code === 'ru' ? 'Язык изменен' : code === 'en' ? 'Language changed' : 'Тіл өзгертілді');
    } catch (error: any) {
      console.log('SAVE LANGUAGE ERROR:', error?.response?.data || error?.message || error);
      showToast('Бэк не сохранил язык');
      return;
    }

    navigate('Menu');
  };

  return (
    <View style={[styles.langContainer, isDark && styles.langContainerDark]}>
      <SafeAreaView>
        <View style={styles.langHeader}>
          <TouchableOpacity onPress={() => navigate('Menu')}>
            <ChevronLeft size={28} color="white" />
          </TouchableOpacity>
          <Text style={styles.langTitle}>{t('lang.title', language)}</Text>
        </View>
      </SafeAreaView>

      <View style={[styles.langContent, isDark && styles.appContainerDark]}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {langs.map(l => (
            <TouchableOpacity
              key={l.code}
              style={[
                styles.langCard,
                isDark && styles.cardDark,
                l.code === language && styles.langCardActive,
              ]}
              onPress={() => onSelectLanguage(l.code)}
            >
              <View>
                <Text style={[styles.langName, isDark && styles.textWhite]}>{l.name}</Text>
                <Text style={styles.langNative}>{l.native}</Text>
              </View>

              <View
                style={[styles.radioCircle, l.code === language && styles.radioCircleActive]}
              >
                {l.code === language && <View style={styles.radioDot} />}
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}
