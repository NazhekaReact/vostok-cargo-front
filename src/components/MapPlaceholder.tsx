import { Truck } from 'lucide-react-native';
import React from 'react';
import { Text, View } from 'react-native';
import styles from '../styles/appStyles';

export default function MapPlaceholder() {
  return (
    <View style={styles.mapPlaceholder}>
      <View style={styles.mapCenter}>
        <View style={styles.mapPing} />
        <View style={styles.mapPin}>
          <Truck size={14} color="white" />
        </View>
      </View>
      <View style={styles.mapAttribution}>
        <Text style={styles.mapAttributionText}>
          Leaflet | © OpenStreetMap contributors
        </Text>
      </View>
    </View>
  );
}