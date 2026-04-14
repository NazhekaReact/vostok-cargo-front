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
  const { navigate } = useContext(AppContext);

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
            <Text style={styles.profileName}>{MOCK_USER.name}</Text>
            <View style={styles.row}>
              <Text style={styles.textGraySm}>Заказчик </Text>
              <ChevronDown size={14} color="#6b7280" />
            </View>
          </View>
        </View>

        <View style={styles.ratingBadge}>
          <Star size={14} color="white" fill="white" />
          <Text style={styles.ratingText}> {MOCK_USER.rating}</Text>
        </View>
      </View>

      <View style={styles.idTag}>
        <Text style={styles.idTagText}>Ваш ID: {MOCK_USER.id}</Text>
      </View>

      <View style={[styles.card, styles.rounded3xl]}>
        <View style={[styles.row, styles.mb4]}>
          <View style={styles.companyLogo}>
            <Text style={styles.companyLogoText}>monumfo</Text>
          </View>
          <View style={styles.ml3}>
            <Text style={styles.fontBold}>Ваша компания</Text>
            <Text style={styles.textGraySm}>{MOCK_USER.company.name}</Text>
          </View>
        </View>
        <TouchableOpacity style={[styles.btnBlue, styles.row, styles.justifyCenter]}>
          <Text style={styles.btnTextWhite}>Изменить компанию </Text>
          <Plus size={16} color="white" />
        </TouchableOpacity>
      </View>

      <View style={[styles.card, styles.row, styles.justifyBetween, styles.itemsCenter]}>
        <View style={styles.row}>
          <MapPin size={20} color="#3b82f6" />
          <Text style={[styles.fontMedium, styles.ml2]}>Геопозиция</Text>
        </View>
        <Switch
          value={true}
          onValueChange={() => {}}
          trackColor={{ false: '#d1d5db', true: '#3b82f6' }}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Настройки</Text>
        <View>
          <TouchableOpacity style={styles.settingsItem}>
            <Text style={styles.fontMedium}>Конфиденциальность</Text>
            <ChevronRight size={20} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingsItem} onPress={() => navigate('Language')}>
            <Text style={styles.fontMedium}>Язык</Text>
            <View style={styles.row}>
              <Text style={styles.textGraySm}>русский </Text>
              <ChevronRight size={20} color="#9ca3af" />
            </View>
          </TouchableOpacity>

          <View style={styles.settingsItemNoBorder}>
            <Text style={styles.fontMedium}>Тёмная тема</Text>
            <Switch
              value={false}
              onValueChange={() => {}}
              trackColor={{ false: '#d1d5db', true: '#3b82f6' }}
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}