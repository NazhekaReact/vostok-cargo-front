import React, { useCallback, useEffect, useState } from 'react';
import { StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { getOrdersRequest } from '../src/api/orders';
import { saveLocationRequest, saveThemeRequest } from '../src/api/users';
import Toast from '../src/components/Toast';
import AppContext from '../src/context/AppContext';
import { getNavItems } from '../src/navigation/navItems';
import { renderScreen } from '../src/navigation/renderScreen';
import AuthScreen from '../src/screens/auth/AuthScreen';
import styles from '../src/styles/appStyles';

export default function Index() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentScreen, setCurrentScreen] = useState('Home');
  const [screenParams, setScreenParams] = useState({});
  const [toastMsg, setToastMsg] = useState('');
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [language, setLanguage] = useState('ru');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [gpsActive, setGpsActive] = useState(false);

  const navigate = (screen: string, params = {}) => {
    setCurrentScreen(screen);
    setScreenParams(params);
  };

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2500);
  }, []);

  const role = currentUser?.role || '';
  const currentUserId = currentUser?._id;

  const loadOrders = useCallback(async () => {
    if (!currentUserId || !role) {
      setOrders([]);
      return;
    }

    try {
      setLoadingOrders(true);
      const params = { role, userId: currentUserId };
      const data = await getOrdersRequest(params);
      console.log('ORDERS:', data);

      setOrders(Array.isArray(data) ? data : data.orders || []);
    } catch (error: any) {
      console.log('loadOrders error:', error?.response?.data || error?.message);
      showToast('Не удалось загрузить заказы');
    } finally {
      setLoadingOrders(false);
    }
  }, [currentUserId, role, showToast]);

  useEffect(() => {
    navigate('Home');
  }, [role]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    if (currentUser?.language) {
      setLanguage(currentUser.language);
    }

    if (currentUser?.theme) {
      setTheme(currentUser.theme);
    }
  }, [currentUser?._id, currentUser?.language, currentUser?.theme]);

  const navItems = getNavItems(role, language);
  const isDark = theme === 'dark';

  const handleAuth = (user: any) => {
    setCurrentUser(user);
    setLanguage(user.language || 'ru');
    setTheme(user.theme || 'light');
    setCurrentScreen('Home');
  };

  const logout = () => {
    setCurrentUser(null);
    setOrders([]);
    setGpsActive(false);
    setCurrentScreen('Home');
    showToast('Вы вышли');
  };

  const saveTheme = async (nextTheme: 'light' | 'dark') => {
    const previousTheme = theme;

    if (!currentUserId) {
      showToast('Нет пользователя для сохранения темы');
      return;
    }

    try {
      setTheme(nextTheme);
      await saveThemeRequest({ userId: currentUserId, theme: nextTheme });
      showToast('Тема сохранена');
    } catch (error: any) {
      console.log('SAVE THEME ERROR:', error?.response?.data || error?.message || error);
      setTheme(previousTheme);
      showToast('Бэк не сохранил тему');
    }
  };

  const saveCurrentLocation = async (isEnabled: boolean) => {
    if (!isEnabled) {
      showToast('GPS выключен');
      setGpsActive(false);
      return;
    }

    if (!currentUserId) {
      showToast('Нет пользователя для GPS');
      return;
    }

    try {
      const ExpoLocation = require('expo-location');
      const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        showToast('GPS разрешение не получено');
        setGpsActive(false);
        return;
      }

      const loc = await ExpoLocation.getCurrentPositionAsync({
        accuracy: ExpoLocation.Accuracy.High,
      });

      const location = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        heading: loc.coords.heading,
        speed: loc.coords.speed,
      };

      await saveLocationRequest({ userId: currentUserId, location });
      setGpsActive(true);
      showToast('GPS включен');
    } catch (error: any) {
      console.log('SAVE LOCATION ERROR:', error?.response?.data || error?.message || error);
      setGpsActive(false);
      showToast('Ошибка GPS');
    }
  };

  return (
    <SafeAreaProvider>
      <AppContext.Provider
        value={{
          role,
          currentUser,
          currentUserId,
          language,
          setLanguage,
          theme,
          isDark,
          saveTheme,
          gpsActive,
          saveCurrentLocation,
          logout,
          navigate,
          orders,
          setOrders,
          loadOrders,
          loadingOrders,
          showToast,
          params: screenParams,
        }}
      >
        <SafeAreaView style={[styles.appContainer, isDark && styles.appContainerDark]}>
          <StatusBar
            barStyle={isDark ? 'light-content' : 'dark-content'}
            backgroundColor={isDark ? '#111827' : '#f9fafb'}
          />

          {!currentUser ? (
            <AuthScreen onAuth={handleAuth} showToast={showToast} />
          ) : (
            <View style={styles.flex1}>
              {renderScreen(currentScreen, role)}
            </View>
          )}

          {currentUser && !['Language', 'Privacy'].includes(currentScreen) && (
            <View style={[styles.bottomNav, isDark && styles.bottomNavDark]}>
              {navItems.map((item: any) => {
                const Icon = item.icon;
                const isActive =
                  currentScreen === item.id ||
                  (item.id === 'Home' && currentScreen === 'OrderDetails');

                const color = isActive ? '#3b82f6' : '#9ca3af';

                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.navItem, isActive && styles.navItemActive]}
                    onPress={() => navigate(item.id)}
                  >
                    <Icon size={24} color={color} strokeWidth={isActive ? 2.5 : 2} />
                    <Text style={[styles.navLabel, { color }]}>{item.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          <Toast message={toastMsg} visible={!!toastMsg} />
        </SafeAreaView>
      </AppContext.Provider>
    </SafeAreaProvider>
  );
}
