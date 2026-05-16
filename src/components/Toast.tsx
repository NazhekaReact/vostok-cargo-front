import { AlertCircle, CheckCircle2, Info, TriangleAlert } from 'lucide-react-native';
import React, { useEffect, useRef } from 'react';
import { Animated, Text, View } from 'react-native';
import styles from '../styles/appStyles';

const getToastTone = (message = '') => {
  const text = message.toLowerCase();

  if (
    text.includes('не удалось') ||
    text.includes('ошибка') ||
    text.includes('не сохранил') ||
    text.includes('не вернул') ||
    text.includes('не найден')
  ) {
    return {
      type: 'error',
      title: 'Нужно проверить',
      accent: '#ef4444',
      background: '#fef2f2',
      text: '#7f1d1d',
      icon: AlertCircle,
    };
  }

  if (
    text.includes('укажите') ||
    text.includes('выберите') ||
    text.includes('заполните') ||
    text.includes('обязател') ||
    text.includes('разрешите') ||
    text.includes('нет ') ||
    text.includes('сначала') ||
    text.includes('отклонил') ||
    text.includes('другое предложение')
  ) {
    return {
      type: 'warning',
      title: 'Внимание',
      accent: '#f59e0b',
      background: '#fffbeb',
      text: '#78350f',
      icon: TriangleAlert,
    };
  }

  if (
    text.includes('сохран') ||
    text.includes('создан') ||
    text.includes('вход выполнен') ||
    text.includes('обновлено') ||
    text.includes('добавлен') ||
    text.includes('назнач') ||
    text.includes('закреплен') ||
    text.includes('принят') ||
    text.includes('отправлен') ||
    text.includes('изменен') ||
    text.includes('заверш') ||
    text.includes('доставлен') ||
    text.includes('отмечено') ||
    text.includes('рейс начат') ||
    text.includes('водитель прибыл') ||
    text.includes('водитель начал')
  ) {
    return {
      type: 'success',
      title: 'Готово',
      accent: '#22c55e',
      background: '#f0fdf4',
      text: '#14532d',
      icon: CheckCircle2,
    };
  }

  return {
    type: 'info',
    title: 'Vostok Cargo',
    accent: '#3b82f6',
    background: '#eff6ff',
    text: '#1e3a8a',
    icon: Info,
  };
};

export default function Toast({ message, visible, isDark }: any) {
  const translateY = useRef(new Animated.Value(-24)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: visible ? 0 : -24,
        useNativeDriver: true,
        damping: 18,
        stiffness: 220,
      }),
      Animated.timing(opacity, {
        toValue: visible ? 1 : 0,
        duration: visible ? 180 : 120,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, translateY, visible]);

  if (!visible) return null;

  const tone = getToastTone(message);
  const Icon = tone.icon;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.toastContainer,
        isDark && styles.toastContainerDark,
        {
          opacity,
          transform: [{ translateY }],
          borderLeftColor: tone.accent,
          backgroundColor: isDark ? '#111827' : tone.background,
        },
      ]}
    >
      <View style={[styles.toastIconWrap, { backgroundColor: tone.accent }]}>
        <Icon size={18} color="white" />
      </View>
      <View style={styles.toastContent}>
        <Text style={[styles.toastTitle, isDark && styles.textWhite]}>{tone.title}</Text>
        <Text
          style={[styles.toastText, { color: isDark ? '#d1d5db' : tone.text }]}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {message}
        </Text>
      </View>
    </Animated.View>
  );
}
