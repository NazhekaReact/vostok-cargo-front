import { Home, Map as MapIcon, MoreHorizontal, Plus, Truck } from 'lucide-react-native';

export function getNavItems(role: string) {
  return [
    { id: 'Home', icon: Home, label: 'Главная', roles: ['CUSTOMER', 'LOGISTICIAN', 'DRIVER'] },
    { id: 'Fleet', icon: Truck, label: 'Машины', roles: ['LOGISTICIAN'] },
    { id: 'Create', icon: Plus, label: 'Создать', roles: ['CUSTOMER'] },
    { id: 'Tracker', icon: MapIcon, label: 'Карта', roles: ['CUSTOMER', 'LOGISTICIAN', 'DRIVER'] },
    { id: 'Menu', icon: MoreHorizontal, label: 'Меню', roles: ['CUSTOMER', 'LOGISTICIAN', 'DRIVER'] },
  ].filter(item => item.roles.includes(role));
}