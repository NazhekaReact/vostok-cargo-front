import React from 'react';
import { Text, View } from 'react-native';
import styles from '../styles/appStyles';

export default function Toast({ message, visible }: any) {
  if (!visible) return null;

  return (
    <View style={styles.toastContainer}>
      <Text style={styles.toastText}>{message}</Text>
    </View>
  );
}