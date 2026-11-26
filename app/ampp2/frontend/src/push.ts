import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { pushApi } from './api';

const CHANNEL_ID = 'alerts';

async function ensureAndroidChannel() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: 'Plant alerts',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
  });
}

export async function registerPush() {
  try {
    console.log('PUSH: proceeding on', Platform.OS);
    await ensureAndroidChannel();
    const { status } = await Notifications.requestPermissionsAsync();
    console.log('PUSH: permission status', status);
    if (status !== 'granted') return;
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    console.log('PUSH: requesting token, projectId=', projectId);
    const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    console.log('EXPO PUSH TOKEN:', token);
    const platform = Platform.OS;
    await pushApi.register({ deviceToken: token, platform });
  } catch (e) { console.log('PUSH ERROR:', e); }
}

export function setupNotificationHandlers(navigate: (tab: string) => void) {
  ensureAndroidChannel().catch((e) => console.log('PUSH CHANNEL ERROR:', e));
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
  const sub = Notifications.addNotificationResponseReceivedListener(() => { navigate('notifications'); });
  return () => sub.remove();
}