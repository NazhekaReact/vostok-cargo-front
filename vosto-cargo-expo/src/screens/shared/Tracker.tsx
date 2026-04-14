import React from 'react';
import { ScrollView, Text } from 'react-native';
import MapPlaceholder from '../../components/MapPlaceholder';
import styles from '../../styles/appStyles';

export default function Tracker() {
  return (
    <ScrollView contentContainerStyle={styles.scrollPadding}>
      <Text style={styles.screenTitle}>Карта</Text>
      <MapPlaceholder />
      <Text style={[styles.textGraySm, styles.mt4, { textAlign: 'center' }]}>
        Интеграция с react-native-maps
      </Text>
    </ScrollView>
  );
}