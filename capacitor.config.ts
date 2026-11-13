import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.slotpilot.app',
  appName: 'SlotPilot',
  webDir: 'dist',
  ios: {
    // Keep page content (including the fixed header) out from under the
    // status bar / Dynamic Island and the home indicator.
    contentInset: 'always',
  },
};

export default config;
