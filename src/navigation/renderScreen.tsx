import React from 'react';
import { Text, View } from 'react-native';
import CreateOrder from '../screens/customer/CreateOrder';
import CustomerDashboard from '../screens/customer/CustomerDashboard';
import DriverDashboard from '../screens/driver/DriverDashboard';
import Fleet from '../screens/logistician/Fleet';
import LogisticianDashboard from '../screens/logistician/LogisticianDashboard';
import LanguageSelector from '../screens/shared/LanguageSelector';
import OrderDetails from '../screens/shared/OrderDetails';
import Privacy from '../screens/shared/Privacy';
import ProfileMenu from '../screens/shared/ProfileMenu';
import Tracker from '../screens/shared/Tracker';
import styles from '../styles/appStyles';

export function renderScreen(currentScreen: string, role: string) {
  switch (currentScreen) {
    case 'Home':
      return role === 'CUSTOMER' ? (
        <CustomerDashboard />
      ) : role === 'LOGISTICIAN' ? (
        <LogisticianDashboard />
      ) : (
        <DriverDashboard />
      );

    case 'OrderDetails':
      return <OrderDetails />;

    case 'Create':
      return <CreateOrder />;

    case 'Fleet':
      return <Fleet />;

    case 'Menu':
      return <ProfileMenu />;

    case 'Language':
      return <LanguageSelector />;

    case 'Privacy':
      return <Privacy />;

    case 'Tracker':
      return <Tracker />;

    default:
      return (
        <View style={[styles.flex1, styles.justifyCenter, styles.itemsCenter]}>
          <Text>404</Text>
        </View>
      );
  }
}