import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Camera,
  ChevronDown,
  ChevronRight,
  Save,
  Star,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import React, { useContext, useEffect, useState } from 'react';
import { Image, Platform, ScrollView, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { saveNameRequest, updateCompanyRequest, uploadProfilePhotoRequest } from '../../api/users';
import BottomSheet from '../../components/BottomSheet';
import AppContext from '../../context/AppContext';
import { MOCK_USER } from '../../data/mockUser';
import styles from '../../styles/appStyles';
import { t } from '../../utils/i18n';

const COMPANY_FIELDS = [
  { key: 'name', labelKey: 'company.name' },
  { key: 'inn', labelKey: 'company.inn', keyboardType: 'number-pad' },
  { key: 'ogrn', labelKey: 'company.ogrn', keyboardType: 'number-pad' },
  { key: 'profile', labelKey: 'company.profile', multiline: true },
  { key: 'country', labelKey: 'company.country' },
  { key: 'city', labelKey: 'company.city' },
  { key: 'email', labelKey: 'company.email', keyboardType: 'email-address' },
  { key: 'website', labelKey: 'company.website', keyboardType: 'url' },
  { key: 'manager', labelKey: 'company.manager' },
  { key: 'phone', labelKey: 'company.phone', keyboardType: 'phone-pad' },
  { key: 'jobTitle', labelKey: 'company.jobTitle' },
  { key: 'department', labelKey: 'company.department' },
];

const COMPANY_STEPS = [
  {
    titleKey: 'company.stepBase',
    fields: ['name', 'inn', 'ogrn', 'profile'],
  },
  {
    titleKey: 'company.stepContacts',
    fields: ['country', 'city', 'email', 'phone', 'website'],
  },
  {
    titleKey: 'company.stepTeam',
    fields: ['manager', 'jobTitle', 'department'],
  },
];

const buildCompanyForm = (company: any = {}) =>
  COMPANY_FIELDS.reduce<Record<string, string>>((acc, field) => {
    acc[field.key] = String(company?.[field.key] || '');
    return acc;
  }, {});

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
    showToast,
    updateCurrentUser,
    logout,
  } = useContext(AppContext);

  const userName = currentUser?.name || '';
  const userRating = currentUser?.rating || MOCK_USER.rating;
  const userId = currentUserId || MOCK_USER.id;
  const [profileName, setProfileName] = useState(userName);
  const [companyForm, setCompanyForm] = useState(() => buildCompanyForm(currentUser?.company));
  const [companyModalOpen, setCompanyModalOpen] = useState(false);
  const [companyStep, setCompanyStep] = useState(0);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState('');
  const [isSavingName, setIsSavingName] = useState(false);
  const [isSavingCompany, setIsSavingCompany] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  useEffect(() => {
    setProfileName(userName);
    setCompanyForm(buildCompanyForm(currentUser?.company));
  }, [userName, currentUser?.company]);

  const currentLanguageLabel =
    language === 'ru'
      ? 'Русский'
      : language === 'en'
        ? 'English'
        : language === 'kk'
          ? 'Қазақша'
          : language;

  const savedCompany = currentUser?.company || {};
  const hasCompany = COMPANY_FIELDS.some((field) => Boolean(String(savedCompany?.[field.key] || '').trim()));
  const currentCompanyStep = COMPANY_STEPS[companyStep];
  const companyName = String(savedCompany?.name || '').trim();
  const companyLocation = [savedCompany?.city, savedCompany?.country].filter(Boolean).join(', ');
  const avatarUrl =
    profilePhotoPreview ||
    (typeof currentUser?.avatar === 'string' && currentUser.avatar.startsWith('http')
      ? currentUser.avatar
      : '');

  const saveProfileName = async () => {
    const nextName = profileName.trim();

    if (!currentUserId || !nextName) {
      showToast('Укажите имя');
      return;
    }

    try {
      setIsSavingName(true);
      const data = await saveNameRequest({ userId: currentUserId, name: nextName });
      updateCurrentUser?.(data?.user || { name: nextName });
      showToast('Имя сохранено');
    } catch (error: any) {
      console.log('SAVE NAME ERROR:', error?.response?.data || error?.message || error);
      showToast('Не удалось сохранить имя');
    } finally {
      setIsSavingName(false);
    }
  };

  const updateCompanyField = (key: string, value: string) => {
    setCompanyForm((prev) => ({ ...prev, [key]: value }));
  };

  const openCompanyModal = () => {
    setCompanyForm(buildCompanyForm(currentUser?.company));
    setCompanyStep(0);
    setCompanyModalOpen(true);
  };

  const pickProfilePhoto = async () => {
    if (!currentUserId) {
      showToast('Нет пользователя');
      return;
    }

    const doc = (globalThis as any).document;

    if (Platform.OS === 'web' && doc) {
      const input = doc.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = async () => {
        const file = input.files?.[0];
        if (!file) return;

        const localPreview = URL.createObjectURL(file);
        setProfilePhotoPreview(localPreview);

        try {
          setIsUploadingPhoto(true);
          const data = await uploadProfilePhotoRequest(currentUserId, file);
          updateCurrentUser?.(data?.user || {});
          if (data?.user?.avatar?.startsWith?.('http')) {
            setProfilePhotoPreview(data.user.avatar);
          }
          showToast('Фото профиля обновлено');
        } catch (error: any) {
          console.log('UPLOAD PROFILE PHOTO ERROR:', error?.response?.data || error?.message || error);
          showToast('Не удалось загрузить фото');
        } finally {
          setIsUploadingPhoto(false);
        }
      };
      input.click();
      return;
    }

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      showToast('Разрешите доступ к фото');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });

    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];
    const fileName = asset.fileName || `profile-${currentUserId}.jpg`;
    const mimeType = asset.mimeType || 'image/jpeg';
    const file = {
      uri: asset.uri,
      name: fileName,
      type: mimeType,
    };

    setProfilePhotoPreview(asset.uri);

    try {
      setIsUploadingPhoto(true);
      const data = await uploadProfilePhotoRequest(currentUserId, file);
      updateCurrentUser?.(data?.user || {});
      if (data?.user?.avatar?.startsWith?.('http')) {
        setProfilePhotoPreview(data.user.avatar);
      }
      showToast('Фото профиля обновлено');
    } catch (error: any) {
      console.log('UPLOAD PROFILE PHOTO ERROR:', error?.response?.data || error?.message || error);
      showToast('Не удалось загрузить фото');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const saveCompany = async () => {
    const nextCompany = COMPANY_FIELDS.reduce<Record<string, string>>((acc, field) => {
      acc[field.key] = companyForm[field.key]?.trim() || '';
      return acc;
    }, {});

    if (!currentUserId) {
      showToast('Нет пользователя');
      return;
    }

    try {
      setIsSavingCompany(true);
      const data = await updateCompanyRequest({
        userId: currentUserId,
        ...nextCompany,
      });
      updateCurrentUser?.(
        data?.user || {
          company: {
            ...(currentUser?.company || {}),
            ...nextCompany,
          },
        }
      );
      showToast('Компания сохранена');
      setCompanyModalOpen(false);
    } catch (error: any) {
      console.log('SAVE COMPANY ERROR:', error?.response?.data || error?.message || error);
      showToast('Не удалось сохранить компанию');
    } finally {
      setIsSavingCompany(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.scrollPadding}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={[styles.row, styles.justifyBetween, styles.itemsStart, styles.mb8, styles.pt4]}>
        <View style={[styles.row, styles.flex1]}>
          <TouchableOpacity
            style={styles.profileAvatarContainer}
            onPress={pickProfilePhoto}
            activeOpacity={0.85}
            disabled={isUploadingPhoto}
          >
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.profileAvatarImage} />
            ) : (
              <View style={styles.profileAvatarMock}>
                <Text style={styles.profileAvatarText}>{profileName.trim()[0]?.toUpperCase() || 'D'}</Text>
              </View>
            )}
            <View style={styles.cameraBadge}>
              <Camera size={12} color="white" />
            </View>
          </TouchableOpacity>
          <View style={styles.ml4}>
            <View style={styles.profileEditRow}>
              <TextInput
                style={[styles.profileNameInput, isDark && styles.inputDark]}
                value={profileName}
                onChangeText={setProfileName}
                placeholder={t('menu.name', language)}
                placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
                returnKeyType="done"
                onSubmitEditing={saveProfileName}
              />
              <TouchableOpacity
                style={[styles.profileSaveButton, isSavingName && styles.btnDisabled]}
                onPress={saveProfileName}
                disabled={isSavingName}
              >
                <Save size={16} color="white" />
              </TouchableOpacity>
            </View>
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
            <Building2 size={20} color="white" />
          </View>
          <View style={[styles.ml3, styles.flex1]}>
            <Text style={[styles.fontBold, isDark && styles.textWhite]}>{t('menu.yourCompany', language)}</Text>
            <Text style={[styles.textGraySm, styles.mt1]} numberOfLines={1}>
              {hasCompany ? companyName || t('company.noName', language) : t('company.empty', language)}
            </Text>
            {hasCompany && Boolean(companyLocation) && (
              <Text style={styles.textGrayXs} numberOfLines={1}>{companyLocation}</Text>
            )}
          </View>
        </View>
        <TouchableOpacity
          style={[styles.btnBlue, styles.row, styles.justifyCenter]}
          onPress={openCompanyModal}
        >
          <Text style={styles.btnTextWhite}>{hasCompany ? t('menu.changeCompany', language) : t('menu.addCompany', language)}</Text>
          <ChevronRight size={16} color="white" style={styles.ml2} />
        </TouchableOpacity>
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

      <BottomSheet
        visible={companyModalOpen}
        onClose={() => setCompanyModalOpen(false)}
        title={hasCompany ? t('menu.changeCompany', language) : t('menu.addCompany', language)}
        subtitle={`${companyStep + 1}/3 · ${t(currentCompanyStep.titleKey, language)}`}
      >
        <View style={styles.companyStepRow}>
          {COMPANY_STEPS.map((step, index) => (
            <View
              key={step.titleKey}
              style={[
                styles.companyStepDot,
                index <= companyStep && styles.companyStepDotActive,
              ]}
            />
          ))}
        </View>

        <Text style={[styles.sectionTitle, isDark && styles.textWhite]}>
          {t(currentCompanyStep.titleKey, language)}
        </Text>

        {currentCompanyStep.fields.map((key) => {
          const field = COMPANY_FIELDS.find((item) => item.key === key);
          if (!field) return null;

          return (
            <View key={field.key} style={styles.companyField}>
              <Text style={[styles.inputLabel, isDark && { color: '#9ca3af' }]}>
                {t(field.labelKey, language)}
              </Text>
              <TextInput
                style={[
                  styles.input,
                  styles.mb0,
                  field.multiline && styles.companyTextArea,
                  isDark && styles.inputDark,
                ]}
                value={companyForm[field.key]}
                onChangeText={(value) => updateCompanyField(field.key, value)}
                placeholder={t(field.labelKey, language)}
                placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
                keyboardType={field.keyboardType as any}
                multiline={field.multiline}
                textAlignVertical={field.multiline ? 'top' : undefined}
              />
            </View>
          );
        })}

        <View style={[styles.row, styles.mt4]}>
          {companyStep > 0 && (
            <TouchableOpacity
              style={[styles.btnGray, styles.flex1, styles.mr2, isDark && styles.btnGrayDark]}
              onPress={() => setCompanyStep((step) => Math.max(0, step - 1))}
            >
              <View style={[styles.row, styles.justifyCenter]}>
                <ArrowLeft size={16} color={isDark ? '#f9fafb' : '#111827'} />
                <Text style={[styles.btnTextBlack, styles.ml1, isDark && styles.textWhite]}>
                  {t('common.back', language)}
                </Text>
              </View>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.btnBlue, styles.flex1, isSavingCompany && styles.btnDisabled]}
            onPress={() => {
              if (companyStep < COMPANY_STEPS.length - 1) {
                setCompanyStep((step) => step + 1);
              } else {
                saveCompany();
              }
            }}
            disabled={isSavingCompany}
          >
            <View style={[styles.row, styles.justifyCenter]}>
              <Text style={styles.btnTextWhite}>
                {companyStep < COMPANY_STEPS.length - 1
                  ? t('common.next', language)
                  : isSavingCompany
                    ? t('menu.saving', language)
                    : t('common.save', language)}
              </Text>
              {companyStep < COMPANY_STEPS.length - 1 ? (
                <ArrowRight size={16} color="white" style={styles.ml1} />
              ) : (
                <Save size={16} color="white" style={styles.ml1} />
              )}
            </View>
          </TouchableOpacity>
        </View>
      </BottomSheet>
    </ScrollView>
  );
}
