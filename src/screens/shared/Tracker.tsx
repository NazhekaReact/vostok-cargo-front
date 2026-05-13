import React, { useContext } from 'react';
import { ScrollView, Text } from 'react-native';
import MapPlaceholder from '../../components/MapPlaceholder';
import AppContext from '../../context/AppContext';
import styles from '../../styles/appStyles';
import { t } from '../../utils/i18n';

export default function Tracker() {
  const { isDark, language } = useContext(AppContext);

  return (
    <ScrollView contentContainerStyle={styles.scrollPadding}>
      <Text style={[styles.screenTitle, isDark && styles.textWhite]}>{t('tracker.title', language)}</Text>
      <MapPlaceholder />
      <Text style={[styles.textGraySm, styles.mt4, { textAlign: 'center' }]}>
        {t('tracker.integration', language)}
      </Text>
    </ScrollView>
  );
}