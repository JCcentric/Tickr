import fs from 'fs';
import path from 'path';

export default ({ config }) => {
  // Path where Xcode expects the file
  const iosPlistPath = path.resolve(__dirname, 'ios', 'TICKR', 'GoogleService-Info.plist');

  if (!fs.existsSync(iosPlistPath)) {
    if (process.env.GOOGLE_SERVICES_PLIST) {
      console.log('Writing GoogleService-Info.plist to ios/TICKR from EAS secret');
      fs.writeFileSync(iosPlistPath, process.env.GOOGLE_SERVICES_PLIST, { encoding: 'utf8' });
    } else {
      console.warn('GoogleService-Info.plist not found locally and GOOGLE_SERVICES_PLIST not set!');
    }
  }

  return {
    ...config,
    ios: {
      ...config.ios,
      // Point Expo to the copied plist in ios folder
      googleServicesFile: './ios/TICKR/GoogleService-Info.plist',
    },
  };
};
