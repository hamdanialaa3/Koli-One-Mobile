import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { logger } from './logger-service';
import { auth, db } from './firebase';
import { doc, updateDoc } from 'firebase/firestore';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export class NotificationService {
    /**
     * Register for push notifications and return the token
     * Also stores the token in user's Firestore document for Cloud Functions
     */
    static async registerForPushNotificationsAsync(): Promise<string | undefined> {
        let token;

        if (Platform.OS === 'web') return;

        if (Device.isDevice) {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;

            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }

            if (finalStatus !== 'granted') {
                logger.warn('Failed to get push token for push notification');
                return;
            }

            // Project configuration for EAS
            const projectId = Constants.expoConfig?.extra?.eas?.projectId || Constants.easConfig?.projectId;

            token = (await Notifications.getExpoPushTokenAsync({
                projectId
            })).data;

            logger.info('Push Token', { token });

            // Store token in Firestore for Cloud Functions access
            const currentUser = auth.currentUser;
            if (currentUser && token) {
                try {
                    const userRef = doc(db, 'users', currentUser.uid);
                    await updateDoc(userRef, {
                        expoPushToken: token,
                        lastTokenUpdate: new Date().toISOString()
                    });
                    logger.info('Expo push token saved to Firestore');
                } catch (error) {
                    logger.error('Error saving token to Firestore', error);
                }
            }
        } else {
            logger.warn('Must use physical device for Push Notifications');
        }

        if (Platform.OS === 'android') {
            Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF231F7C',
            });

            // Create price-alerts channel for TASK-07
            Notifications.setNotificationChannelAsync('price-alerts', {
                name: 'Price Alerts',
                importance: Notifications.AndroidImportance.HIGH,
                vibrationPattern: [0, 500, 250, 500],
                lightColor: '#00FF00',
                sound: 'default',
                enableVibrate: true,
                showBadge: true
            });
        }

        return token;
    }

    /**
     * Listen for incoming notifications
     */
    static addNotificationReceivedListener(callback: (notification: Notifications.Notification) => void) {
        return Notifications.addNotificationReceivedListener(callback);
    }

    /**
     * Listen for interaction with notifications
     */
    static addNotificationResponseReceivedListener(callback: (response: Notifications.NotificationResponse) => void) {
        return Notifications.addNotificationResponseReceivedListener(callback);
    }
}
