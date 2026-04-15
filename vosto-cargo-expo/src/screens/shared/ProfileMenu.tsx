import {
    Camera,
    ChevronDown,
    ChevronRight,
    MapPin,
    Plus,
    Star,
} from 'lucide-react-native';
import React, { useContext } from 'react';
import { ScrollView, Switch, Text, TouchableOpacity, View } from 'react-native';
import AppContext from '../../context/AppContext';
import { MOCK_USER } from '../../data/mockUser';
import styles from '../../styles/appStyles';

export default function ProfileMenu() {
  const {
    navigate,
    currentUser,
    currentUserId,
    role,
    language,
    theme,
    isDark,
    saveTheme,
    gpsActive,
    saveCurrentLocation,
    logout,
  } = useContext(AppContext);

  const userName = currentUser?.name || MOCK_USER.name;
  const userRating = currentUser?.rating || MOCK_USER.rating;
  const userId = currentUserId || MOCK_USER.id;
  const companyName = currentUser?.company?.name || MOCK_USER.company.name;
  const currentLanguageLabel =
    language === 'ru'
      ? 'русский'
      : language === 'en'
        ? 'English'
        : language;

  return (
    <ScrollView contentContainerStyle={styles.scrollPadding} showsVerticalScrollIndicator={false}>
      <View style={[styles.row, styles.justifyBetween, styles.itemsStart, styles.mb8, styles.pt4]}>
        <View style={styles.row}>
          <View style={styles.profileAvatarContainer}>
            <View style={styles.profileAvatarMock}>
              <Text style={styles.profileAvatarText}>D</Text>
            </View>
            <View style={styles.cameraBadge}>
              <Camera size={12} color="white" />
            </View>
          </View>
          <View style={styles.ml4}>
            <Text style={[styles.profileName, isDark && styles.textWhite]}>{userName}</Text>
            <View style={styles.row}>
              <Text style={styles.textGraySm}>{role} </Text>
              <ChevronDown size={14} color="#6b7280" />
            </View>
          </View>
        </View>

        <View style={styles.ratingBadge}>
          <Star size={14} color="white" fill="white" />
          <Text style={styles.ratingText}> {userRating}</Text>
        </View>
      </View>

      <View style={styles.idTag}>
        <Text style={styles.idTagText}>Ваш ID: {userId}</Text>
      </View>

      <View style={[styles.card, styles.rounded3xl, isDark && styles.cardDark]}>
        <View style={[styles.row, styles.mb4]}>
          <View style={styles.companyLogo}>
            <Text style={styles.companyLogoText}>monumfo</Text>
          </View>
          <View style={styles.ml3}>
            <Text style={[styles.fontBold, isDark && styles.textWhite]}>Ваша компания</Text>
            <Text style={styles.textGraySm}>{companyName}</Text>
          </View>
        </View>
        <TouchableOpacity style={[styles.btnBlue, styles.row, styles.justifyCenter]}>
          <Text style={styles.btnTextWhite}>Изменить компанию </Text>
          <Plus size={16} color="white" />
        </TouchableOpacity>
      </View>

      <View style={[styles.card, styles.row, styles.justifyBetween, styles.itemsCenter, isDark && styles.cardDark]}>
        <View style={styles.row}>
          <MapPin size={20} color="#3b82f6" />
          <Text style={[styles.fontMedium, styles.ml2, isDark && styles.textWhite]}>
            Геопозиция
          </Text>
        </View>
        <Switch
          value={gpsActive}
          onValueChange={saveCurrentLocation}
          trackColor={{ false: '#d1d5db', true: '#3b82f6' }}
        />
      </View>

      <View style={[styles.card, isDark && styles.cardDark]}>
        <Text style={[styles.sectionTitle, isDark && styles.textWhite]}>Настройки</Text>
        <View>
          <TouchableOpacity style={styles.settingsItem}>
            <Text style={[styles.fontMedium, isDark && styles.textWhite]}>Конфиденциальность</Text>
            <ChevronRight size={20} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingsItem} onPress={() => navigate('Language')}>
            <Text style={[styles.fontMedium, isDark && styles.textWhite]}>Язык</Text>
            <View style={styles.row}>
              <Text style={styles.textGraySm}>{currentLanguageLabel} </Text>
              <ChevronRight size={20} color="#9ca3af" />
            </View>
          </TouchableOpacity>

          <View style={styles.settingsItemNoBorder}>
            <Text style={[styles.fontMedium, isDark && styles.textWhite]}>Тёмная тема</Text>
            <Switch
              value={theme === 'dark'}
              onValueChange={(value) => saveTheme(value ? 'dark' : 'light')}
              trackColor={{ false: '#d1d5db', true: '#3b82f6' }}
            />
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.btnDanger} onPress={logout}>
        <Text style={styles.btnDangerText}>Выйти</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
