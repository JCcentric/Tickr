import 'dotenv/config';

export default ({ config }) => {
  const isEasBuild = !!process.env.EAS_BUILD; // true only during EAS cloud builds

  return {
    ...config,
    ios: {
      ...config.ios,

      // ✅ LOCAL BUILD = real file path
      // ✅ EAS BUILD  = still use real file path (EAS injects the file automatically)
      googleServicesFile: "./GoogleService-Info.plist",
    },

    extra: {
      API_KEY: process.env.API_KEY,
      AUTH_DOMAIN: process.env.AUTH_DOMAIN,
      PROJECT_ID: process.env.PROJECT_ID,
      STORAGE_BUCKET: process.env.STORAGE_BUCKET,
      MESSAGE_SENDER_ID: process.env.MESSAGE_SENDER_ID,
      APP_ID: process.env.APP_ID,
      ...config.extra,
    },
  };
};
