import 'dotenv/config';

export default ({ config }) => {
  // Determine plist path based on environment
  const googlePlist = process.env.GOOGLE_SERVICE_PLIST
    ? '@GOOGLE_SERVICE_PLIST' // Use EAS secret during cloud build
    : './GoogleService-Info.plist'; // Use local file for local builds

  return {
    ...config,
    ios: {
      ...config.ios,
      // Use the correct Google plist depending on environment
      googleServicesPlist: googlePlist,
    },
    extra: {
      // Firebase config: try EAS first, fallback to local .env
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
