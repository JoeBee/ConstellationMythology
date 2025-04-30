import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'Heavenly Myths',
  webDir: 'www',
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000, // Display splash for 3 seconds
      launchAutoHide: true,
      // backgroundColor: "#ffffffff", // Optional: Set background color
      // androidSplashResourceName: "splash", // Should default correctly
      // androidScaleType: "CENTER_CROP", // Optional: Adjust how splash image scales
      showSpinner: false, // Optional: Hide spinner if not desired
      splashFullScreen: true, // Optional: Use fullscreen splash
      splashImmersive: true, // Optional: Use immersive mode
    }
  }
};

export default config;
