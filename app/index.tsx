import * as SystemUI from 'expo-system-ui';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { getOrdersRequest } from '../src/api/orders';
import { saveThemeRequest } from '../src/api/users';
import Toast from '../src/components/Toast';
import AppContext from '../src/context/AppContext';
import { getNavItems } from '../src/navigation/navItems';
import { renderScreen } from '../src/navigation/renderScreen';
import AuthScreen from '../src/screens/auth/AuthScreen';
import {
  startDriverBackgroundLocation,
  stopDriverBackgroundLocation,
} from '../src/services/backgroundLocation';
import styles from '../src/styles/appStyles';
import { getRouteLabel, normalizeOrder } from '../src/utils/orderData';

const customerTrackedStatuses = ['APPROVED', 'ASSIGNED', 'AT_PICKUP', 'IN_TRANSIT', 'AT_DROP', 'DELIVERED'];
const driverTrackedStatuses = ['ASSIGNED', 'AT_PICKUP', 'IN_TRANSIT', 'AT_DROP'];

const customerStatusToast: Record<string, string> = {
  APPROVED: 'Заказ принят логистом',
  ASSIGNED: 'Водитель назначен на заказ',
  AT_PICKUP: 'Водитель прибыл на погрузку',
  IN_TRANSIT: 'Водитель начал рейс',
  AT_DROP: 'Водитель прибыл на выгрузку',
  DELIVERED: 'Заказ доставлен',
};

const getCustomerOrderStatusToast = (order: any) => {
  const message = customerStatusToast[order?.status];
  if (!message) return '';

  const route = `${getRouteLabel(order, 'from', '—')} → ${getRouteLabel(order, 'to', '—')}`;
  return `${message}: ${route}`;
};

const getUserId = (value: any) => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return value._id || value.id || '';
};

const getLogisticianBidSnapshot = (orders: any[], logisticianId: string) => {
  return orders.reduce((acc: Record<string, any>, order: any) => {
    const ownBid = order?.bids?.find((bid: any) => getUserId(bid?.logistician) === logisticianId);
    if (!ownBid) return acc;

    acc[order._id] = {
      bidId: ownBid._id,
      status: ownBid.status,
      route: `${getRouteLabel(order, 'from', '—')} → ${getRouteLabel(order, 'to', '—')}`,
    };
    return acc;
  }, {});
};

const getLogisticianBidToast = (
  previousBids: Record<string, any>,
  nextBids: Record<string, any>,
  orders: any[]
) => {
  for (const order of orders) {
    const previousBid = previousBids[order?._id];
    const nextBid = nextBids[order?._id];

    if (!previousBid || !nextBid || previousBid.status === nextBid.status) continue;

    if (nextBid.status === 'ACCEPTED') {
      return `Заказчик принял вашу ставку: ${nextBid.route}`;
    }

    if (nextBid.status === 'REJECTED') {
      return `Заказчик отклонил вашу ставку: ${nextBid.route}`;
    }
  }

  const disappearedRejectedBid = Object.values(previousBids).find((bid: any) => (
    bid.status === 'PENDING' && !Object.values(nextBids).some((nextBid: any) => nextBid.bidId === bid.bidId)
  ));

  if (disappearedRejectedBid) {
    return `Заказчик выбрал другое предложение: ${disappearedRejectedBid.route}`;
  }

  return '';
};

export default function Index() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentScreen, setCurrentScreen] = useState('Home');
  const [screenParams, setScreenParams] = useState({});
  const [toast, setToast] = useState({ id: 0, message: '' });
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [language, setLanguage] = useState('ru');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const previousOrderStatusesRef = useRef<Record<string, string>>({});
  const previousLogisticianBidsRef = useRef<Record<string, any>>({});
  const hasLoadedOrdersRef = useRef(false);
  const activeBackgroundLocationKeyRef = useRef('');

  const navigate = (screen: string, params = {}) => {
    setCurrentScreen(screen);
    setScreenParams(params);
  };

  const showToast = useCallback((msg: string) => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }

    setToast({ id: Date.now(), message: msg });
    toastTimerRef.current = setTimeout(() => {
      setToast((current) => ({ ...current, message: '' }));
    }, 3200);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const role = currentUser?.role || '';
  const currentUserId = currentUser?._id;

  const loadOrders = useCallback(async (options?: { silent?: boolean }) => {
    if (!currentUserId || !role) {
      setOrders([]);
      previousOrderStatusesRef.current = {};
      previousLogisticianBidsRef.current = {};
      hasLoadedOrdersRef.current = false;
      return;
    }

    const isSilent = Boolean(options?.silent);

    try {
      if (!isSilent) setLoadingOrders(true);
      const params = { role, userId: currentUserId };
      const data = await getOrdersRequest(params);
      console.log('ORDERS:', data);

      const nextOrders = Array.isArray(data) ? data : data.orders || [];
      const normalizedOrders = nextOrders.map(normalizeOrder);

      if (role === 'CUSTOMER' && hasLoadedOrdersRef.current) {
        const changedOrder = normalizedOrders.find((order: any) => {
          const previousStatus = previousOrderStatusesRef.current[order?._id];
          return (
            previousStatus &&
            previousStatus !== order?.status &&
            customerTrackedStatuses.includes(order?.status)
          );
        });

        const toastMessage = getCustomerOrderStatusToast(changedOrder);
        if (toastMessage) showToast(toastMessage);
      }

      if (role === 'LOGISTICIAN' && hasLoadedOrdersRef.current) {
        const nextBids = getLogisticianBidSnapshot(normalizedOrders, currentUserId);
        const toastMessage = getLogisticianBidToast(
          previousLogisticianBidsRef.current,
          nextBids,
          normalizedOrders
        );
        if (toastMessage) showToast(toastMessage);
        previousLogisticianBidsRef.current = nextBids;
      }

      previousOrderStatusesRef.current = normalizedOrders.reduce((acc: Record<string, string>, order: any) => {
        if (order?._id && order?.status) acc[order._id] = order.status;
        return acc;
      }, {});
      if (role === 'LOGISTICIAN' && !hasLoadedOrdersRef.current) {
        previousLogisticianBidsRef.current = getLogisticianBidSnapshot(normalizedOrders, currentUserId);
      }
      hasLoadedOrdersRef.current = true;
      setOrders(normalizedOrders);
    } catch (error: any) {
      console.log('loadOrders error:', error?.response?.data || error?.message);
      if (!isSilent) showToast('Не удалось загрузить заказы');
    } finally {
      if (!isSilent) setLoadingOrders(false);
    }
  }, [currentUserId, role, showToast]);

  useEffect(() => {
    navigate('Home');
  }, [role]);

  useEffect(() => {
    previousOrderStatusesRef.current = {};
    previousLogisticianBidsRef.current = {};
    hasLoadedOrdersRef.current = false;
  }, [currentUserId, role]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    if (!currentUserId || !['CUSTOMER', 'LOGISTICIAN'].includes(role)) return undefined;

    const interval = setInterval(() => {
      loadOrders({ silent: true });
    }, 2000);

    return () => clearInterval(interval);
  }, [currentUserId, loadOrders, role]);

  useEffect(() => {
    if (role !== 'DRIVER' || !currentUserId) {
      activeBackgroundLocationKeyRef.current = '';
      stopDriverBackgroundLocation().catch(() => {});
      return;
    }

    const activeDriverOrder = orders.find((order: any) => driverTrackedStatuses.includes(order.status));
    const nextKey = activeDriverOrder?._id ? `${currentUserId}:${activeDriverOrder._id}` : '';

    if (!activeDriverOrder?._id) {
      activeBackgroundLocationKeyRef.current = '';
      stopDriverBackgroundLocation().catch(() => {});
      return;
    }

    if (activeBackgroundLocationKeyRef.current === nextKey) return;
    activeBackgroundLocationKeyRef.current = nextKey;

    startDriverBackgroundLocation({
      driverId: currentUserId,
      orderId: activeDriverOrder._id,
    }).catch((error: any) => {
      console.log('Start background location error:', error?.message || error);
      activeBackgroundLocationKeyRef.current = '';
    });
  }, [currentUserId, orders, role]);

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
  const appBackground = isDark ? '#111827' : '#f9fafb';

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(appBackground).catch(() => {});
  }, [appBackground]);

  const handleAuth = (user: any) => {
    setCurrentUser(user);
    setLanguage(user.language || 'ru');
    setTheme(user.theme || 'light');
    setCurrentScreen('Home');
  };

  const logout = () => {
    stopDriverBackgroundLocation().catch(() => {});
    setCurrentUser(null);
    setOrders([]);
    setCurrentScreen('Home');
    showToast('Вы вышли');
  };

  const updateCurrentUser = useCallback((nextUser: any) => {
    if (!nextUser) return;
    setCurrentUser((prev: any) => ({
      ...(prev || {}),
      ...nextUser,
      company: nextUser.company
        ? { ...(prev?.company || {}), ...nextUser.company }
        : prev?.company,
    }));
  }, []);

  const saveTheme = async (nextTheme: 'light' | 'dark') => {
    const previousTheme = theme;

    if (!currentUserId) {
      showToast('Нет пользователя для сохранения темы');
      return;
    }

    try {
      setTheme(nextTheme);
      const data = await saveThemeRequest({ userId: currentUserId, theme: nextTheme });
      updateCurrentUser(data?.user || { theme: nextTheme });
      showToast('Тема сохранена');
    } catch (error: any) {
      console.log('SAVE THEME ERROR:', error?.response?.data || error?.message || error);
      setTheme(previousTheme);
      showToast('Бэк не сохранил тему');
    }
  };

  return (
    <SafeAreaProvider style={[styles.appContainer, isDark && styles.appContainerDark]}>
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
          setCurrentUser,
          updateCurrentUser,
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
        <View style={[styles.appContainer, isDark && styles.appContainerDark]}>
          <StatusBar
            barStyle={isDark ? 'light-content' : 'dark-content'}
            backgroundColor="transparent"
            translucent
          />

          <KeyboardAvoidingView
            style={styles.flex1}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
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
          </KeyboardAvoidingView>

          <Toast key={toast.id} message={toast.message} visible={!!toast.message} isDark={isDark} />
        </View>
      </AppContext.Provider>
    </SafeAreaProvider>
  );
}
