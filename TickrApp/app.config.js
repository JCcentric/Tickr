import fs from 'fs';
import path from 'path';

export default ({ config }) => {
  const plistPath = path.resolve(__dirname, 'GoogleService-Info.plist');

  if (!fs.existsSync(plistPath) && process.env.GOOGLE_SERVICES_PLIST) {
    console.log('Injecting GoogleService-Info.plist from EAS secret');
    fs.writeFileSync(plistPath, process.env.GOOGLE_SERVICES_PLIST, { encoding: 'utf8' });
  }

  return {
    ...config,
    ios: {
      ...config.ios,
      googleServicesFile: './GoogleService-Info.plist',
    },
  };
};
