import { Home, Map as MapIcon, MoreHorizontal, Plus, Truck } from 'lucide-react-native';

export function getNavItems(role: string, language: string = 'ru') {
  const labels: Record<string, Record<string, string>> = {
    Home: { ru: 'Главная', en: 'Home', kk: 'Басты' },
    Fleet: { ru: 'Машины', en: 'Fleet', kk: 'Көліктер' },
    Create: { ru: 'Создать', en: 'Create', kk: 'Жасау' },
    Tracker: { ru: 'Карта', en: 'Map', kk: 'Карта' },
    Menu: { ru: 'Меню', en: 'Menu', kk: 'Мәзір' },
  };

  return [
    { id: 'Home', icon: Home, label: labels.Home[language] || labels.Home.ru, roles: ['CUSTOMER', 'LOGISTICIAN', 'DRIVER'] },
    { id: 'Fleet', icon: Truck, label: labels.Fleet[language] || labels.Fleet.ru, roles: ['LOGISTICIAN'] },
    { id: 'Create', icon: Plus, label: labels.Create[language] || labels.Create.ru, roles: ['CUSTOMER'] },
    { id: 'Tracker', icon: MapIcon, label: labels.Tracker[language] || labels.Tracker.ru, roles: ['CUSTOMER', 'LOGISTICIAN', 'DRIVER'] },
    { id: 'Menu', icon: MoreHorizontal, label: labels.Menu[language] || labels.Menu.ru, roles: ['CUSTOMER', 'LOGISTICIAN', 'DRIVER'] },
  ].filter(item => item.roles.includes(role));
}