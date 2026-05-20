/** @type {import('expo/config').ExpoConfig} */
module.exports = () => {
  const base = require('./app.json').expo;
  return {
    expo: {
      ...base,
      version: '1.1.5',
      plugins: [
        [
          'expo-notifications',
          {
            icon: './assets/icon.png',
            color: '#C9A962',
            sounds: [],
            enableBackgroundRemoteNotifications: true,
          },
        ],
        'expo-background-fetch',
      ],
      extra: {
        pushApiUrl: process.env.EXPO_PUBLIC_PUSH_API_URL ?? 'https://atcapital.fr',
        eas: {
          projectId:
            process.env.EXPO_PUBLIC_EAS_PROJECT_ID ?? base.extra?.eas?.projectId,
        },
      },
    },
  };
};
