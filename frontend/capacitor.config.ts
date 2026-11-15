import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.aitarotreader.app',
  appName: 'AI Tarot Reader',
  webDir: 'out',
  server: {
    androidScheme: 'https',
  },
};

export default config;
