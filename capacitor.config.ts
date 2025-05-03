
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.e68949139eb342239a2d4fc2a1de2b43',
  appName: 'dreamweaver-ai-journal',
  webDir: 'dist',
  server: {
    url: 'https://e6894913-9eb3-4223-9a2d-4fc2a1de2b43.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  ios: {
    contentInset: 'always'
  },
  android: {
    backgroundColor: "#1A1F2C"
  }
};

export default config;
