import React, { useEffect, useState } from 'react';
import { SafeAreaView, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import Toast from '../src/components/Toast';
import AppContext from '../src/context/AppContext';
import { MOCK_ORDERS } from '../src/data/mockOrders';
import { getNavItems } from '../src/navigation/navItems';
import { renderScreen } from '../src/navigation/renderScreen';
import styles from '../src/styles/appStyles';

export default function Index() {
  const [role, setRole] = useState('CUSTOMER');
  const [currentScreen, setCurrentScreen] = useState('Home');
  const [screenParams, setScreenParams] = useState({});
  const [toastMsg, setToastMsg] = useState('');

  const navigate = (screen: string, params = {}) => {
    setCurrentScreen(screen);
    setScreenParams(params);
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2500);
  };

  useEffect(() => {
    navigate('Home');
  }, [role]);

  const navItems = getNavItems(role);

  return (
    <AppContext.Provider
      value={{
        role,
        navigate,
        orders: MOCK_ORDERS,
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

        <View style={styles.flex1}>{renderScreen(currentScreen, role)}</View>

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
  );
}