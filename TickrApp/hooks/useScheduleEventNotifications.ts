import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';

export function useScheduleEventNotifications(eventTitle: string, eventDateString: string) {
    useEffect(() => {
        if (!eventDateString) return;

        (async () => {
            //Ask user for notification permission
            const { status } = await Notifications.requestPermissionsAsync();
            if (status !== 'granted') return;

            // Parse event date and time
            const eventDate = new Date(eventDateString);
            eventDate.setHours(0, 0, 0, 0);

            // Declare notifications dates and set fire to 9 AM
            const weekNotification = new Date(eventDate.getTime() - 7 * 24 * 60 * 60 * 1000);
            weekNotification.setHours(9, 0, 0, 0);

            const dayNotification = new Date(eventDate.getTime() - 1 * 24 * 60 * 60 * 1000);
            dayNotification.setHours(9, 0, 0, 0);
            
            //For debugging purposes only
            //const testNotificationTime = new Date(Date.now() + 45 * 1000);

            const now = new Date();

            await Notifications.cancelAllScheduledNotificationsAsync();

            // Schedule week before notification
            if (weekNotification > now) {
                await Notifications.scheduleNotificationAsync({
                    content: {
                        title: `${eventTitle}: One Week Away!`,
                        body: `Your event on ${eventDate.toDateString()} is 7 days away.`,
                    },
                    trigger: {
                        type: Notifications.SchedulableTriggerInputTypes.DATE,
                        date: weekNotification,
                    },
                });
            }

            // Schedule day before notification
            if (dayNotification > now) {
                await Notifications.scheduleNotificationAsync({
                    content: {
                        title: `${eventTitle}: Tomorrow!`,
                        body: `Your event on ${eventDate.toDateString()} is tomorrow.`,
                    },
                    trigger: {
                        type: Notifications.SchedulableTriggerInputTypes.DATE,
                        date: dayNotification,
                    },
                });
            }

            // Schedule test notification
            /*await Notifications.scheduleNotificationAsync({
                content: {
                    title: `Test Notification for ${eventTitle}`,
                    body: `This is a test notification scheduled 15 seconds from now.`,
                },
                trigger: {
                    type: Notifications.SchedulableTriggerInputTypes.DATE,
                    date: testNotificationTime,
                },
            });*/


        })();
    }, [eventTitle, eventDateString]);
}

