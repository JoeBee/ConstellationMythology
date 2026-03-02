# Heavenly Guidance - Deployment Guide

**Current Version:** 1.0.3  
**App ID:** bcjj.Heavenly.Myths  
**App Name:** Heavenly Guidance

---

## 🚀 Quick Deployment Checklist

- [ ] Update version numbers (already done: 1.0.3)
- [ ] Build Angular/Ionic web assets
- [ ] Sync Capacitor projects
- [ ] Build Android APK/AAB
- [ ] Upload to Google Play Console
- [ ] Build iOS app in Xcode
- [ ] Upload to App Store Connect

---

## 📋 Prerequisites

### Required Software
- [x] Node.js (already installed)
- [x] npm (already installed)
- [ ] Android Studio (for Android builds)
- [ ] Xcode (for iOS builds - Mac only)
- [ ] Java JDK 17+ (for Android)

### Required Accounts
- [ ] Google Play Console Account (Developer account)
- [ ] Apple Developer Account (for iOS)

### Required Files
- [ ] Android signing keystore (`key.properties` file)
- [ ] iOS signing certificates and provisioning profiles

---

## 🔧 STEP 1: Prepare Your Environment

### Install Dependencies (if needed)
```powershell
npm install
```

### Verify Capacitor CLI
```powershell
npx cap --version
# Should show version 7.2.0
```

---

## 🏗️ STEP 2: Build the Web Assets

### Build for Production
```powershell
npm run build
```

This creates optimized files in the `www/` directory.

### Verify Build Output
```powershell
dir www
# Should see index.html and bundled JS/CSS files
```

---

## 📱 STEP 3: Android Deployment

### A. Sync Capacitor Android Project
```powershell
npx cap sync android
```

This copies the web build to the Android project and updates plugins.

### B. Open Android Studio
```powershell
npx cap open android
```

Or manually open: `android/` folder in Android Studio

### C. Build Release APK/AAB

#### Option 1: Using Android Studio (Recommended)
1. In Android Studio, go to **Build → Generate Signed Bundle / APK**
2. Select **Android App Bundle (AAB)** for Play Store
3. Create or select your signing key:
   - Key store path: (your keystore file location)
   - Key alias: (from your key.properties)
   - Passwords: (from your key.properties)
4. Select **release** build variant
5. Click **Finish**

#### Option 2: Using Command Line
```powershell
cd android
./gradlew bundleRelease
# Or for APK:
./gradlew assembleRelease
cd ..
```

### D. Locate Built Files
- **AAB (for Play Store)**: `android/app/build/outputs/bundle/release/app-release.aab`
- **APK (for testing)**: `android/app/build/outputs/apk/release/app-release.apk`

### E. Upload to Google Play Console

1. Go to [Google Play Console](https://play.google.com/console)
2. Select **Heavenly Guidance** app
3. Navigate to **Release → Production**
4. Click **Create new release**
5. Upload the AAB file
6. Add release notes (see template below)
7. Review and roll out

#### Release Notes Template
```
Version 1.0.3

✨ Updates:
- Updated to Gemini 2.0 Flash AI model
- Performance improvements
- Bug fixes

🔧 Technical:
- Updated dependencies
- Improved API stability
```

---

## 🍎 STEP 4: iOS Deployment

### A. Sync Capacitor iOS Project
```powershell
npx cap sync ios
```

### B. Open Xcode
```powershell
npx cap open ios
```

Or manually open: `ios/App/App.xcworkspace` (NOT .xcodeproj)

### C. Update Version Number in Xcode
1. Select the project in Xcode
2. Go to **General** tab
3. Update **Version** to `1.0.3`
4. Update **Build** to a higher number (e.g., `3`)

### D. Configure Signing
1. Select your Team in the **Signing & Capabilities** tab
2. Ensure **Automatically manage signing** is checked
3. Or manually select your provisioning profile

### E. Build for App Store
1. Select **Any iOS Device** as the build target
2. Go to **Product → Archive**
3. Wait for archive to complete
4. In Organizer window:
   - Click **Distribute App**
   - Select **App Store Connect**
   - Follow the upload wizard

### F. Submit in App Store Connect

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Select **Heavenly Guidance**
3. Go to **App Store** tab
4. Click **+ Version or Platform**
5. Create version **1.0.3**
6. Fill in:
   - What's New in This Version (release notes)
   - Screenshots (if changed)
   - Description (if changed)
7. Select the uploaded build
8. Submit for Review

---

## 🔑 STEP 5: Environment Variables & Security

### ⚠️ CRITICAL: API Key Security Issue

Your Google AI API key is currently hardcoded in the app. For better security:

#### Option 1: Restrict API Key (Quick Fix)
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services → Credentials**
3. Find your API key: `AIzaSyCSR2Nf9a3zY8YF-P6fI0ssWqWMIHtjSKE`
4. Click **Edit** and add restrictions:
   - **Application restrictions**: Android apps / iOS apps
   - Add your app's package name: `bcjj.Heavenly.Myths`
   - Add your app's SHA-1 fingerprint (Android)

#### Option 2: Use Backend Proxy (Best Practice)
Consider creating a backend service to proxy API requests. This keeps your API key secure on the server.

---

## 📝 Testing Before Release

### Test the Release Build Locally

#### Android
```powershell
# Install on connected device
adb install android/app/build/outputs/apk/release/app-release.apk
```

#### iOS
1. Archive and distribute with **Ad Hoc** or **Development** signing
2. Install via Xcode on connected device

### What to Test
- [ ] App launches without crashes
- [ ] Zodiac sign selection works
- [ ] Horoscope generation (Google AI) works
- [ ] Text-to-speech narration works
- [ ] Location services work
- [ ] Constellation view works
- [ ] All tabs navigate correctly

---

## 🛠️ Troubleshooting

### Android Build Issues

**Problem**: `key.properties not found`
```powershell
# Create key.properties in android/ folder:
# android/key.properties
storePassword=YOUR_STORE_PASSWORD
keyPassword=YOUR_KEY_PASSWORD
keyAlias=YOUR_KEY_ALIAS
storeFile=path/to/your/keystore.jks
```

**Problem**: Build fails with "SDK not found"
- Open Android Studio
- Go to **Tools → SDK Manager**
- Install required SDK versions

**Problem**: Gradle errors
```powershell
cd android
./gradlew clean
cd ..
```

### iOS Build Issues

**Problem**: "No signing certificate found"
- Ensure you have a valid Apple Developer account
- Go to **Xcode → Preferences → Accounts**
- Add your Apple ID and download certificates

**Problem**: "Provisioning profile doesn't match"
- Enable **Automatically manage signing** in Xcode
- Or create a new provisioning profile in Apple Developer portal

### Capacitor Sync Issues

**Problem**: "www folder not found"
```powershell
npm run build
npx cap sync
```

**Problem**: Plugins not working
```powershell
npx cap sync
# Then rebuild in Android Studio / Xcode
```

---

## 📊 Version History

| Version | Date | Platform | Notes |
|---------|------|----------|-------|
| 1.0.3 | 2026-03-02 | Android/iOS | Updated AI model, bug fixes |
| 1.0.2 | - | Android | Previous release |
| 1.0 | - | iOS | Initial iOS release |

---

## 📞 Support

- **Developer Email**: LaLunaMagnifica@bcjj.com
- **App Package**: bcjj.Heavenly.Myths
- **Google Play**: [Your Play Store URL]
- **App Store**: [Your App Store URL]

---

## 🎯 Post-Deployment Checklist

After successful deployment:

- [ ] Monitor crash reports in Play Console / App Store Connect
- [ ] Check user reviews and ratings
- [ ] Monitor API usage in Google Cloud Console
- [ ] Verify analytics (if configured)
- [ ] Update privacy policy if needed
- [ ] Update app screenshots if UI changed
- [ ] Announce update on social media / website

---

## 🔄 Quick Commands Reference

```powershell
# Full rebuild and deploy workflow
npm install                    # Install dependencies
npm run build                  # Build web assets
npx cap sync                   # Sync to native projects
npx cap open android           # Open Android Studio
npx cap open ios               # Open Xcode

# Individual platform syncs
npx cap sync android           # Sync Android only
npx cap sync ios               # Sync iOS only

# Update Capacitor
npm install @capacitor/core@latest @capacitor/cli@latest
npm install @capacitor/android@latest @capacitor/ios@latest
npx cap sync

# Generate app icons
npm run generate-icons
```

---

## 📚 Additional Resources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Ionic Framework Documentation](https://ionicframework.com/docs)
- [Google Play Console Help](https://support.google.com/googleplay/android-developer)
- [App Store Connect Help](https://developer.apple.com/app-store-connect/)
- [Android Studio Download](https://developer.android.com/studio)
- [Xcode Download](https://developer.apple.com/xcode/)

---

**Last Updated**: March 2, 2026  
**Next Review**: [Set reminder for next update]
