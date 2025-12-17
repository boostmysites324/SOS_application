import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sos.application',
  appName: 'SOSApplication',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true
  },
  android: {
    allowMixedContent: true
  }
};

export default config;
