import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.aitarotreader.app',
  appName: 'AI Tarot Reader',
  webDir: 'out',
  server: {
    url: 'https://ai-tarot-reader-delta.vercel.app/app/home',
    cleartext: false,
    androidScheme: 'https',
  },
  plugins: {
    CapacitorCookies: {
      enabled: true,
    },
    CapacitorHttp: {
      enabled: true,
    },
  },
};

export default config;
