import 'dotenv/config';

export default ({ config }) => {
  return {
    ...config,
    ios: {
      ...config.ios,
      // Let Expo/EAS handle the GoogleService-Info.plist injection
      googleServicesFile: './GoogleService-Info.plist',
    },
    extra: {
      // Attempt to read from EAS secrets first, fallback to local .env
      API_KEY: process.env.API_KEY,
      AUTH_DOMAIN: process.env.AUTH_DOMAIN,
      PROJECT_ID: process.env.PROJECT_ID,
      STORAGE_BUCKET: process.env.STORAGE_BUCKET,
      MESSAGE_SENDER_ID: process.env.MESSAGE_SENDER_ID,
      APP_ID: process.env.APP_ID,
      ...config.extra, // preserve any other extra values
    },
  };
};
