import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { Platform } from 'react-native';
import api from '../api/client';

export const DRIVER_LOCATION_TASK = 'vostok-cargo-driver-location';

type DriverLocationTaskOptions = {
  driverId: string;
  orderId?: string;
};

const isNative = Platform.OS === 'ios' || Platform.OS === 'android';

TaskManager.defineTask(DRIVER_LOCATION_TASK, async ({ data, error, executionInfo }: any) => {
  if (error) {
    console.log('Background location task error:', error.message || error);
    return;
  }

  const location = data?.locations?.[0];
  const options = (executionInfo?.taskOptions || {}) as DriverLocationTaskOptions;
  if (!location?.coords || !options.driverId) return;

  try {
    await api.post('/save-location', {
      userId: options.driverId,
      orderId: options.orderId,
      location: {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        heading: location.coords.heading,
        speed: location.coords.speed,
      },
    });
  } catch (requestError: any) {
    console.log('Background location save error:', requestError?.response?.data || requestError?.message);
  }
});

export async function startDriverBackgroundLocation({ driverId, orderId }: DriverLocationTaskOptions) {
  if (!isNative || !driverId) return false;

  const foregroundPermission = await Location.requestForegroundPermissionsAsync();
  if (foregroundPermission.status !== 'granted') return false;

  const backgroundAvailable = await Location.isBackgroundLocationAvailableAsync();
  if (!backgroundAvailable) return false;

  const backgroundPermission = await Location.requestBackgroundPermissionsAsync();
  if (backgroundPermission.status !== 'granted') return false;

  const alreadyStarted = await Location.hasStartedLocationUpdatesAsync(DRIVER_LOCATION_TASK);
  if (alreadyStarted) {
    await Location.stopLocationUpdatesAsync(DRIVER_LOCATION_TASK);
  }

  await Location.startLocationUpdatesAsync(DRIVER_LOCATION_TASK, {
    accuracy: Location.Accuracy.High,
    activityType: Location.ActivityType.AutomotiveNavigation,
    distanceInterval: 50,
    timeInterval: 15000,
    deferredUpdatesDistance: 100,
    deferredUpdatesInterval: 30000,
    pausesUpdatesAutomatically: false,
    showsBackgroundLocationIndicator: true,
    foregroundService: {
      notificationTitle: 'Vostok Cargo',
      notificationBody: 'Геопозиция водителя активна для текущего заказа',
      notificationColor: '#3b82f6',
    },
    driverId,
    orderId,
  } as Location.LocationTaskOptions);

  return true;
}

export async function stopDriverBackgroundLocation() {
  if (!isNative) return;

  const started = await Location.hasStartedLocationUpdatesAsync(DRIVER_LOCATION_TASK);
  if (started) {
    await Location.stopLocationUpdatesAsync(DRIVER_LOCATION_TASK);
  }
}
