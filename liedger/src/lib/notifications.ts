import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { colors } from '@/theme';

/**
 * Local reminders. The hero use case ("before you meet X" briefings) is
 * scheduled here. iOS caps pending local notifications at 64, so keep the
 * active set small and re-roll on app open.
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function ensureNotificationPermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const req = await Notifications.requestPermissionsAsync();
  return req.granted;
}

async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync('briefings', {
    name: 'Briefings',
    importance: Notifications.AndroidImportance.HIGH,
    lightColor: colors.primary,
  });
}

/**
 * Schedule a "before you meet X" briefing at a specific time.
 * Returns the notification id (store it if you want to cancel later).
 */
export async function scheduleBriefing(params: {
  personName: string;
  body: string;
  at: Date;
}): Promise<string | null> {
  const ok = await ensureNotificationPermission();
  if (!ok) return null;
  await ensureAndroidChannel();

  return Notifications.scheduleNotificationAsync({
    content: {
      title: `Before you see ${params.personName}`,
      body: params.body,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: params.at,
      channelId: 'briefings',
    },
  });
}

export async function cancelBriefing(id: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(id);
}
