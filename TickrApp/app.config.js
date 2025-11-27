import fs from 'fs';
import path from 'path';

export default ({ config }) => {
  const plistPath = path.resolve(__dirname, 'GoogleService-Info.plist');

  if (process.env.GOOGLE_SERVICES_PLIST) {
    console.log('Writing GoogleService-Info.plist from EAS secret');
    fs.writeFileSync(plistPath, process.env.GOOGLE_SERVICES_PLIST, { encoding: 'utf8' });
  } else {
    console.warn('GOOGLE_SERVICES_PLIST environment variable not found!');
  }

  return {
    ...config,
    ios: {
      ...config.ios,
      googleServicesFile: './GoogleService-Info.plist',
    },
  };
};
