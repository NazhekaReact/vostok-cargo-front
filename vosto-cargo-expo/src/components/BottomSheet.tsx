import React from 'react';
import { Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import styles from '../styles/appStyles';

export default function BottomSheet({
  visible,
  onClose,
  title,
  children,
  subtitle,
}: any) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} style={styles.bottomSheetContainer}>
          <View style={styles.bottomSheetHandle} />
          {title && <Text style={styles.bottomSheetTitle}>{title}</Text>}
          {subtitle && <Text style={styles.bottomSheetSubtitle}>{subtitle}</Text>}
          <ScrollView style={styles.bottomSheetContent} showsVerticalScrollIndicator={false}>
            {children}
          </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}