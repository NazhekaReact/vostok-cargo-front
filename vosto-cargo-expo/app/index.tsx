import React, { useCallback, useEffect, useState } from 'react';
import { StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { getOrdersRequest } from '../src/api/orders';
import { getUsersRequest } from '../src/api/users';
import Toast from '../src/components/Toast';
import AppContext from '../src/context/AppContext';
import { getNavItems } from '../src/navigation/navItems';
import { renderScreen } from '../src/navigation/renderScreen';
import styles from '../src/styles/appStyles';

export default function Index() {
  const [role, setRole] = useState('CUSTOMER');
  const [currentScreen, setCurrentScreen] = useState('Home');
  const [screenParams, setScreenParams] = useState({});
  const [toastMsg, setToastMsg] = useState('');
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [users, setUsers] = useState<any[]>([]);

  const navigate = (screen: string, params = {}) => {
    setCurrentScreen(screen);
    setScreenParams(params);
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2500);
  };

  const loadOrders = useCallback(async () => {
    try {
      setLoadingOrders(true);
      const currentUser = users.find((user: any) => user.role === role);
      const params = currentUser?._id ? { role, userId: currentUser._id } : {};
      const data = await getOrdersRequest(params);
      console.log('ORDERS:', data);

      setOrders(Array.isArray(data) ? data : data.orders || []);
    } catch (error: any) {
      console.log('loadOrders error:', error?.response?.data || error?.message);
      showToast('Не удалось загрузить заказы');
    } finally {
      setLoadingOrders(false);
    }
  }, [role, users]);

  const loadUsers = useCallback(async () => {
    try {
      const data = await getUsersRequest();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.log('loadUsers error:', error?.response?.data || error?.message);
    }
  }, []);

  useEffect(() => {
    navigate('Home');
  }, [role]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const navItems = getNavItems(role);
  const currentUser = users.find((user: any) => user.role === role);

  return (
    <SafeAreaProvider>
      <AppContext.Provider
        value={{
          role,
          currentUser,
          currentUserId: currentUser?._id,
          users,
          navigate,
          orders,
          setOrders,
          loadOrders,
          loadingOrders,
          showToast,
          params: screenParams,
        }}
      >
        <SafeAreaView style={styles.appContainer}>
          <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />

          <View style={styles.devBar}>
            <Text style={styles.devBarTitle}>DEV:</Text>

            <View style={styles.row}>
              <TouchableOpacity
                style={[styles.devBtn, styles.mr2, role === 'CUSTOMER' && styles.devBtnActive]}
                onPress={() => setRole('CUSTOMER')}
              >
                <Text style={styles.devBtnText}>Заказчик</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.devBtn, styles.mr2, role === 'LOGISTICIAN' && styles.devBtnActive]}
                onPress={() => setRole('LOGISTICIAN')}
              >
                <Text style={styles.devBtnText}>Логист</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.devBtn, role === 'DRIVER' && styles.devBtnActive]}
                onPress={() => setRole('DRIVER')}
              >
                <Text style={styles.devBtnText}>Водитель</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.flex1}>
            {renderScreen(currentScreen, role)}
          </View>

          {!['Language'].includes(currentScreen) && (
            <View style={styles.bottomNav}>
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
