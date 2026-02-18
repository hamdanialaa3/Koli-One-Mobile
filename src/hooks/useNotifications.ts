import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { NotificationService } from '../services/NotificationService';
import { updatePushToken } from '../services/userService';
import { useRouter } from 'expo-router';

export function useNotifications(userId?: string) {
    const notificationListener = useRef<Notifications.Subscription>(undefined);
    const responseListener = useRef<Notifications.Subscription>(undefined);
    const router = useRouter();

    useEffect(() => {
        // 1. Register for token
        NotificationService.registerForPushNotificationsAsync().then(token => {
            if (token && userId) {
                updatePushToken(userId, token);
            }
        });

        if (Platform.OS !== 'web') {
            // 2. Foreground listener
            notificationListener.current = NotificationService.addNotificationReceivedListener(notification => {
                // Foreground notifications are handled by the notification UI
            });

            // 3. Interaction listener
            responseListener.current = NotificationService.addNotificationResponseReceivedListener(response => {
                const data = response.notification.request.content.data;
                if (data?.url) {
                    // Handle deep link logic within the app
                    router.push(data.url as any);
                }
            });
        }

        return () => {
            notificationListener.current?.remove();
            responseListener.current?.remove();
        };
    }, [userId]);
}
