import * as Location from 'expo-location';

export type Coordinate = {
  latitude: number;
  longitude: number;
};

const toNumber = (value: any) => {
  if (value === undefined || value === null || value === '') return undefined;
  const parsed = Number(String(value).replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : undefined;
};

const cleanText = (value: any) => (typeof value === 'string' ? value.trim() : '');

const normalizePlaceName = (value: any) =>
  cleanText(value)
    .toLowerCase()
    .replace(/[.,]/g, ' ')
    .replace(/\s+/g, ' ');

const cityCoordinates: Record<string, Coordinate> = {
  'алматы': { latitude: 43.238949, longitude: 76.889709 },
  'алмата': { latitude: 43.238949, longitude: 76.889709 },
  'almaty': { latitude: 43.238949, longitude: 76.889709 },
  'астана': { latitude: 51.128201, longitude: 71.430429 },
  'нур-султан': { latitude: 51.128201, longitude: 71.430429 },
  'нурсултан': { latitude: 51.128201, longitude: 71.430429 },
  'nur-sultan': { latitude: 51.128201, longitude: 71.430429 },
  'astana': { latitude: 51.128201, longitude: 71.430429 },
  'шымкент': { latitude: 42.341685, longitude: 69.590101 },
  'shymkent': { latitude: 42.341685, longitude: 69.590101 },
  'караганда': { latitude: 49.804683, longitude: 73.109383 },
  'қарағанды': { latitude: 49.804683, longitude: 73.109383 },
  'karaganda': { latitude: 49.804683, longitude: 73.109383 },
  'актобе': { latitude: 50.283933, longitude: 57.16703 },
  'ақтөбе': { latitude: 50.283933, longitude: 57.16703 },
  'aktobe': { latitude: 50.283933, longitude: 57.16703 },
  'тараз': { latitude: 42.898371, longitude: 71.397989 },
  'taraz': { latitude: 42.898371, longitude: 71.397989 },
  'павлодар': { latitude: 52.287303, longitude: 76.967402 },
  'pavlodar': { latitude: 52.287303, longitude: 76.967402 },
  'усть-каменогорск': { latitude: 49.948968, longitude: 82.628301 },
  'өскемен': { latitude: 49.948968, longitude: 82.628301 },
  'oskemen': { latitude: 49.948968, longitude: 82.628301 },
  'семей': { latitude: 50.411116, longitude: 80.2275 },
  'semey': { latitude: 50.411116, longitude: 80.2275 },
  'атырау': { latitude: 47.094495, longitude: 51.923837 },
  'atyrau': { latitude: 47.094495, longitude: 51.923837 },
  'костанай': { latitude: 53.219808, longitude: 63.635423 },
  'қостанай': { latitude: 53.219808, longitude: 63.635423 },
  'kostanay': { latitude: 53.219808, longitude: 63.635423 },
  'кызылорда': { latitude: 44.847918, longitude: 65.499894 },
  'қызылорда': { latitude: 44.847918, longitude: 65.499894 },
  'kyzylorda': { latitude: 44.847918, longitude: 65.499894 },
  'уральск': { latitude: 51.227821, longitude: 51.386543 },
  'орал': { latitude: 51.227821, longitude: 51.386543 },
  'uralsk': { latitude: 51.227821, longitude: 51.386543 },
  'петропавловск': { latitude: 54.87279, longitude: 69.143 },
  'petropavlovsk': { latitude: 54.87279, longitude: 69.143 },
  'актау': { latitude: 43.641097, longitude: 51.198511 },
  'ақтау': { latitude: 43.641097, longitude: 51.198511 },
  'aktau': { latitude: 43.641097, longitude: 51.198511 },
  'кокшетау': { latitude: 53.283897, longitude: 69.39694 },
  'көкшетау': { latitude: 53.283897, longitude: 69.39694 },
  'kokshetau': { latitude: 53.283897, longitude: 69.39694 },
  'туркестан': { latitude: 43.29733, longitude: 68.25175 },
  'түркістан': { latitude: 43.29733, longitude: 68.25175 },
  'turkestan': { latitude: 43.29733, longitude: 68.25175 },
};

export const getKnownCityCoordinate = (...values: any[]): Coordinate | null => {
  for (const value of values) {
    const placeName = normalizePlaceName(value);
    if (!placeName) continue;

    if (cityCoordinates[placeName]) return cityCoordinates[placeName];

    const cityName = Object.keys(cityCoordinates).find((name) => placeName.includes(name));
    if (cityName) return cityCoordinates[cityName];
  }

  return null;
};

export const defaultMapRegion = {
  latitude: 51.1282,
  longitude: 71.4304,
  latitudeDelta: 10,
  longitudeDelta: 10,
};

export const getLocationCoordinate = (location: any): Coordinate | null => {
  const latitude = toNumber(location?.latitude);
  const longitude = toNumber(location?.longitude);

  if (latitude === undefined || longitude === undefined) return null;
  return { latitude, longitude };
};

export const getPointCoordinate = (point: any): Coordinate | null => {
  const latitude = toNumber(point?.coordinates?.lat ?? point?.lat ?? point?.latitude);
  const longitude = toNumber(
    point?.coordinates?.lng ??
      point?.coordinates?.lon ??
      point?.lng ??
      point?.lon ??
      point?.longitude
  );

  if (latitude === undefined || longitude === undefined) return null;
  return { latitude, longitude };
};

export const resolvePointCoordinate = async (point: any): Promise<Coordinate | null> => {
  const existingCoordinate = getPointCoordinate(point);
  if (existingCoordinate) return existingCoordinate;

  const knownCityCoordinate = getKnownCityCoordinate(
    point?.city,
    point?.label,
    point?.address,
    point?.displayName,
    point?.name
  );
  if (knownCityCoordinate) return knownCityCoordinate;

  const query =
    cleanText(point?.address) ||
    cleanText(point?.label) ||
    cleanText(point?.city) ||
    cleanText(point?.displayName) ||
    cleanText(point?.name);

  if (!query) return null;

  try {
    const [result] = await Location.geocodeAsync(query);
    if (!result) return null;

    return {
      latitude: result.latitude,
      longitude: result.longitude,
    };
  } catch (error) {
    console.log('Route geocode error:', error);
    return null;
  }
};

export const buildMapRegion = (coordinates: (Coordinate | null | undefined)[]) => {
  const points = coordinates.filter(Boolean) as Coordinate[];
  if (!points.length) return defaultMapRegion;

  if (points.length === 1) {
    return {
      ...points[0],
      latitudeDelta: 0.08,
      longitudeDelta: 0.08,
    };
  }

  const latitudes = points.map((point) => point.latitude);
  const longitudes = points.map((point) => point.longitude);
  const minLat = Math.min(...latitudes);
  const maxLat = Math.max(...latitudes);
  const minLng = Math.min(...longitudes);
  const maxLng = Math.max(...longitudes);

  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: Math.max((maxLat - minLat) * 1.6, 0.08),
    longitudeDelta: Math.max((maxLng - minLng) * 1.6, 0.08),
  };
};

export const focusMapOnCoordinate = (mapRef: any, coordinate: Coordinate, zoom = 15) => {
  const region = {
    ...coordinate,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  mapRef.current?.animateToRegion?.(region, 600);
  mapRef.current?.animateCamera?.(
    {
      center: coordinate,
      zoom,
    },
    { duration: 600 }
  );
};
