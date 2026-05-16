import * as Location from 'expo-location';
import { Linking } from 'react-native';
import { Coordinate, resolvePointCoordinate } from './mapUtils';

const formatCoordinate = (value: number) => value.toFixed(6);

const citySlugMap: Record<string, string> = {
  'алматы': 'almaty',
  'алмата': 'almaty',
  'almaty': 'almaty',
  'астана': 'astana',
  'нур-султан': 'astana',
  'нурсултан': 'astana',
  'nur-sultan': 'astana',
  'astana': 'astana',
  'шымкент': 'shymkent',
  'shymkent': 'shymkent',
  'караганда': 'karaganda',
  'қарағанды': 'karaganda',
  'karaganda': 'karaganda',
  'актобе': 'aktobe',
  'ақтөбе': 'aktobe',
  'aktobe': 'aktobe',
  'тараз': 'taraz',
  'taraz': 'taraz',
  'павлодар': 'pavlodar',
  'pavlodar': 'pavlodar',
  'усть-каменогорск': 'ust-kamenogorsk',
  'өскемен': 'ust-kamenogorsk',
  'oskemen': 'ust-kamenogorsk',
  'семей': 'semey',
  'semey': 'semey',
  'атырау': 'atyrau',
  'atyrau': 'atyrau',
  'костанай': 'kostanay',
  'қостанай': 'kostanay',
  'kostanay': 'kostanay',
  'кызылорда': 'kyzylorda',
  'қызылорда': 'kyzylorda',
  'kyzylorda': 'kyzylorda',
  'уральск': 'uralsk',
  'орал': 'uralsk',
  'uralsk': 'uralsk',
  'петропавловск': 'petropavlovsk',
  'petropavlovsk': 'petropavlovsk',
  'актау': 'aktau',
  'ақтау': 'aktau',
  'aktau': 'aktau',
  'кокшетау': 'kokshetau',
  'көкшетау': 'kokshetau',
  'kokshetau': 'kokshetau',
  'туркестан': 'turkestan',
  'түркістан': 'turkestan',
  'turkestan': 'turkestan',
};

const getPointCitySlug = (point: any) => {
  const city = String(point?.city || point?.label || point?.address || '')
    .trim()
    .toLowerCase();

  const exactSlug = citySlugMap[city];
  if (exactSlug) return exactSlug;

  const matchingCity = Object.keys(citySlugMap).find((name) => city.includes(name));
  return matchingCity ? citySlugMap[matchingCity] : 'almaty';
};

async function readCurrentCoordinate() {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return null;

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  } catch (error) {
    console.log('Current route location error:', error);
    return null;
  }
}

const buildRouteUrl = (scheme: 'dgis' | 'https', from: Coordinate | null, to: Coordinate, citySlug: string) => {
  const prefix = scheme === 'dgis' ? 'dgis://2gis.ru' : `https://2gis.kz/${citySlug}`;
  const targetPart = `/to/${formatCoordinate(to.longitude)},${formatCoordinate(to.latitude)}`;

  if (!from) {
    return `${prefix}/routeSearch/rsType/car${targetPart}`;
  }

  return `${prefix}/routeSearch/rsType/car/from/${formatCoordinate(from.longitude)},${formatCoordinate(from.latitude)}${targetPart}`;
};

const buildNavigationUrl = (scheme: 'dgis' | 'https', to: Coordinate) => {
  const prefix = scheme === 'dgis' ? 'dgis://2gis.ru' : 'https://2gis.ru';
  return `${prefix}/routeSearch/to/${formatCoordinate(to.longitude)},${formatCoordinate(to.latitude)}/go`;
};

export async function openRouteIn2gis(point: any, originCoordinate?: Coordinate | null) {
  const [destinationCoordinate, fallbackOriginCoordinate] = await Promise.all([
    resolvePointCoordinate(point),
    originCoordinate === undefined ? readCurrentCoordinate() : Promise.resolve(originCoordinate ?? null),
  ]);

  if (!destinationCoordinate) return false;

  const citySlug = getPointCitySlug(point);
  const appNavigationUrl = buildNavigationUrl('dgis', destinationCoordinate);
  const webNavigationUrl = buildNavigationUrl('https', destinationCoordinate);
  const appUrl = buildRouteUrl('dgis', fallbackOriginCoordinate, destinationCoordinate, citySlug);
  const webUrl = buildRouteUrl('https', fallbackOriginCoordinate, destinationCoordinate, citySlug);

  try {
    console.log('2GIS navigation URL:', webNavigationUrl);
    await Linking.openURL(webNavigationUrl);
    return true;
  } catch (navigationWebError) {
    console.log('2GIS navigation web open error:', navigationWebError);
  }

  try {
    console.log('2GIS app navigation URL:', appNavigationUrl);
    await Linking.openURL(appNavigationUrl);
    return true;
  } catch (navigationAppError) {
    console.log('2GIS navigation app open error:', navigationAppError);
  }

  try {
    console.log('2GIS route URL:', appUrl);
    await Linking.openURL(appUrl);
    return true;
  } catch (appError) {
    console.log('2GIS app route open error:', appError);
  }

  try {
    console.log('2GIS web route URL:', webUrl);
    await Linking.openURL(webUrl);
    return true;
  } catch (webError) {
    console.log('2GIS open error:', webError);
    return false;
  }
}
