import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'bcjj.Heavenly.Myths',
  appName: 'Heavenly Guidance',
  webDir: 'www',
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000, // Display splash for 3 seconds
      launchAutoHide: true,
      // backgroundColor: "#ffffffff", // Optional: Set background color
      androidSplashResourceName: "splash", // Explicitly set resource name
      androidScaleType: "CENTER_CROP", // Adjust how splash image scales
      showSpinner: false, // Optional: Hide spinner if not desired
      splashFullScreen: true, // Optional: Use fullscreen splash
      splashImmersive: true, // Optional: Use immersive mode
    }
  },
  android: {
    icon: {
      foreground: 'resources/icon.png',
      background: '#FFFFFF'
    }
  },
  ios: {
    icon: {
      foreground: 'resources/icon.png',
      background: '#FFFFFF'
    }
  }
};

export default config;
