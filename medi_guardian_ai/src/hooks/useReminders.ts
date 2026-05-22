import { useEffect, useRef } from 'react';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { useAppStore } from '../store/useAppStore';

// Configure how notifications should behave when the app is running in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export function useReminders() {
  const medicines = useAppStore(state => state.medicines);
  const notificationListener = useRef<Notifications.EventSubscription>();
  const responseListener = useRef<Notifications.EventSubscription>();

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => {
      if (token) {
        console.log('Notification Token:', token);
      }
    });

    // Handle notifications that are received while the app is foregrounded
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Received notification:', notification);
    });

    // Handle user interaction with a notification
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('User interacted with notification:', response);
      // Here you could navigate to a specific screen if needed
    });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  // Sync notifications whenever the medicines list changes
  useEffect(() => {
    scheduleMedicineReminders();
  }, [medicines]);

  const scheduleMedicineReminders = async () => {
    if (Platform.OS === 'web') {
      return;
    }

    // 1. Cancel all previously scheduled notifications
    await Notifications.cancelAllScheduledNotificationsAsync();

    // 2. Schedule new ones for each medicine
    for (const medicine of medicines) {
      if (!medicine.time) continue;

      const [hourStr, minuteStr] = medicine.time.split(':');
      const hour = parseInt(hourStr, 10);
      const minute = parseInt(minuteStr, 10);

      if (isNaN(hour) || isNaN(minute)) continue;

      await Notifications.scheduleNotificationAsync({
        content: {
          title: `Time for your ${medicine.name} 💊`,
          body: `Please take your scheduled ${medicine.dosage} dose. ${medicine.instruction}`,
          sound: true,
          data: { medicineId: medicine.id },
        },
        trigger: {
          hour,
          minute,
          repeats: true,
          type: 'calendar'
        } as Notifications.CalendarTriggerInput,
      });
    }
  };
}

async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
      sound: true, // Explicitly enable the default notification sound
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.warn('Failed to get push token for push notification!');
      return;
    }
    // Learn more about projectId: https://docs.expo.dev/push-notifications/push-notifications-setup/#configure-projectid
    // token = (await Notifications.getExpoPushTokenAsync()).data;
  } else {
    console.warn('Must use physical device for Push Notifications');
  }

  return token;
}
