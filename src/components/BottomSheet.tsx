import React, { useContext } from 'react';
import { KeyboardAvoidingView, Modal, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import AppContext from '../context/AppContext';
import styles from '../styles/appStyles';

export default function BottomSheet({
  visible,
  onClose,
  title,
  children,
  subtitle,
}: any) {
  const { isDark } = useContext(AppContext);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.bottomSheetKeyboard}
        >
          <TouchableOpacity activeOpacity={1} style={[styles.bottomSheetContainer, isDark && styles.bottomSheetContainerDark]}>
            <View style={styles.bottomSheetHandle} />
            {title && <Text style={[styles.bottomSheetTitle, isDark && styles.textWhite]}>{title}</Text>}
            {subtitle && <Text style={styles.bottomSheetSubtitle}>{subtitle}</Text>}
            <ScrollView
              style={styles.bottomSheetContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {children}
            </ScrollView>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </TouchableOpacity>
    </Modal>
  );
}
