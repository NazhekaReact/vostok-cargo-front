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
import { t } from '../../utils/i18n';

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
      ? 'Русский'
      : language === 'en'
        ? 'English'
        : language === 'kk'
          ? 'Қазақша'
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

      <View style={[styles.idTag, isDark && { backgroundColor: '#374151' }]}>
        <Text style={styles.idTagText}>{t('menu.yourId', language)} {userId}</Text>
      </View>

      <View style={[styles.card, styles.rounded3xl, isDark && styles.cardDark]}>
        <View style={[styles.row, styles.mb4]}>
          <View style={styles.companyLogo}>
            <Text style={styles.companyLogoText}>monumfo</Text>
          </View>
          <View style={styles.ml3}>
            <Text style={[styles.fontBold, isDark && styles.textWhite]}>{t('menu.yourCompany', language)}</Text>
            <Text style={styles.textGraySm}>{companyName}</Text>
          </View>
        </View>
        <TouchableOpacity style={[styles.btnBlue, styles.row, styles.justifyCenter]}>
          <Text style={styles.btnTextWhite}>{t('menu.changeCompany', language)}</Text>
          <Plus size={16} color="white" />
        </TouchableOpacity>
      </View>

      <View style={[styles.card, styles.row, styles.justifyBetween, styles.itemsCenter, isDark && styles.cardDark]}>
        <View style={styles.row}>
          <MapPin size={20} color="#3b82f6" />
          <Text style={[styles.fontMedium, styles.ml2, isDark && styles.textWhite]}>
            {t('menu.geolocation', language)}
          </Text>
        </View>
        <Switch
          value={gpsActive}
          onValueChange={saveCurrentLocation}
          trackColor={{ false: '#d1d5db', true: '#3b82f6' }}
        />
      </View>

      <View style={[styles.card, isDark && styles.cardDark]}>
        <Text style={[styles.sectionTitle, isDark && styles.textWhite]}>{t('menu.settings', language)}</Text>
        <View>
          <TouchableOpacity style={[styles.settingsItem, isDark && { borderBottomColor: '#374151' }]} onPress={() => navigate('Privacy')}>
            <Text style={[styles.fontMedium, isDark && styles.textWhite]}>{t('menu.privacy', language)}</Text>
            <ChevronRight size={20} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.settingsItem, isDark && { borderBottomColor: '#374151' }]} onPress={() => navigate('Language')}>
            <Text style={[styles.fontMedium, isDark && styles.textWhite]}>{t('menu.language', language)}</Text>
            <View style={styles.row}>
              <Text style={styles.textGraySm}>{currentLanguageLabel} </Text>
              <ChevronRight size={20} color="#9ca3af" />
            </View>
          </TouchableOpacity>

          <View style={styles.settingsItemNoBorder}>
            <Text style={[styles.fontMedium, isDark && styles.textWhite]}>{t('menu.darkTheme', language)}</Text>
            <Switch
              value={theme === 'dark'}
              onValueChange={(value) => saveTheme(value ? 'dark' : 'light')}
              trackColor={{ false: '#d1d5db', true: '#3b82f6' }}
            />
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.btnDanger} onPress={logout}>
        <Text style={styles.btnDangerText}>{t('menu.logout', language)}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
