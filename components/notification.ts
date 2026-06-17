import * as Notifications from 'expo-notifications';

export const scheduleCheckInReminder = async () => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Attendance Reminder',
      body: 'It is time for check in.',
    },
    trigger: {
    type: Notifications.SchedulableTriggerInputTypes.DAILY,
    hour: 7,
    minute: 45,
  },
  });
};