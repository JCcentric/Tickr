import fs from 'fs';
import path from 'path';
import 'dotenv/config';

export default ({ config }) => {
  // Path where the plist will live before prebuild
  const plistPath = path.resolve(__dirname, 'GoogleService-Info.plist');

  // Write plist from EAS secret if available
  if (process.env.GOOGLE_SERVICES_PLIST) {
    console.log('Writing GoogleService-Info.plist from EAS secret');
    fs.writeFileSync(plistPath, process.env.GOOGLE_SERVICES_PLIST, { encoding: 'utf8' });
  } else if (!fs.existsSync(plistPath)) {
    console.warn('GoogleService-Info.plist not found and GOOGLE_SERVICES_PLIST env variable not set!');
  }

  return {
    ...config,
    ios: {
      ...config.ios,
      googleServicesFile: './GoogleService-Info.plist', // always points to root
    },
    extra: {
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
