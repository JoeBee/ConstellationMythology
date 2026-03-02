# 🎯 How to Redeploy Heavenly Guidance

## ⚡ FASTEST WAY (Recommended)

**Just run this command:**

```powershell
.\deploy.ps1
```

This automated script will:
1. Install dependencies
2. Build web assets
3. Sync Capacitor projects
4. Open Android Studio and/or Xcode for you

---

## 🔄 What I've Already Done For You

✅ **Updated version numbers to 1.0.3**
- `android/app/build.gradle`: versionCode 2 → 3, versionName 1.0.2 → 1.0.3
- `package.json`: version 0.0.1 → 1.0.3

✅ **Created deployment documentation**
- `DEPLOYMENT-GUIDE.md` - Complete step-by-step guide
- `QUICK-DEPLOY.md` - Quick reference card
- `deploy.ps1` - Automated deployment script
- `CHANGELOG.md` - Version history tracker

---

## 📱 Quick Deployment Steps

### For Android (Google Play Store)

1. **Run the script**:
   ```powershell
   .\deploy.ps1
   ```
   Choose option **2** (Android only)

2. **In Android Studio** (will open automatically):
   - Build → Generate Signed Bundle / APK
   - Select "Android App Bundle" (AAB)
   - Use your signing key
   - Select "release"
   - Click Finish

3. **Upload to Play Store**:
   - Go to [Google Play Console](https://play.google.com/console)
   - Find "Heavenly Guidance"
   - Production → Create new release
   - Upload the AAB file from: `android/app/build/outputs/bundle/release/app-release.aab`
   - Add release notes and submit

### For iOS (Apple App Store)

1. **Run the script**:
   ```powershell
   .\deploy.ps1
   ```
   Choose option **3** (iOS only) - requires macOS

2. **In Xcode** (will open automatically):
   - Update version to 1.0.3 and build number to 3
   - Select "Any iOS Device"
   - Product → Archive
   - Distribute App → App Store Connect

3. **Submit in App Store Connect**:
   - Go to [App Store Connect](https://appstoreconnect.apple.com)
   - Find "Heavenly Guidance"
   - Add version 1.0.3
   - Select uploaded build and submit for review

---

## 📝 Release Notes to Use

```
Version 1.0.3

✨ What's New:
- Updated to Gemini 2.0 Flash AI model for improved horoscope generation
- Performance improvements and stability enhancements
- Bug fixes and optimizations

🔧 Technical Updates:
- Updated API endpoints
- Improved error handling
- Enhanced compatibility
```

---

## ⚠️ Important Notes

### 1. **API Key Security**
Your Google AI API key is currently hardcoded. After deployment, restrict it:
- Go to [Google Cloud Console](https://console.cloud.google.com)
- Navigate to APIs & Services → Credentials
- Edit your API key and add restrictions for package `bcjj.Heavenly.Myths`

### 2. **Android Signing**
Make sure you have your `android/key.properties` file with:
```properties
storePassword=YOUR_STORE_PASSWORD
keyPassword=YOUR_KEY_PASSWORD
keyAlias=YOUR_KEY_ALIAS
storeFile=../path/to/your-keystore.jks
```

### 3. **Testing**
Before submitting to stores, test the release build on a physical device to ensure:
- App launches correctly
- Google AI horoscope generation works
- All features function properly

---

## 🆘 Need Help?

1. **Check the guides**:
   - `DEPLOYMENT-GUIDE.md` - Full detailed guide with troubleshooting
   - `QUICK-DEPLOY.md` - Quick reference card

2. **Common issues**:
   - Build fails? Run `npm install` first
   - Gradle errors? Clean with `cd android && ./gradlew clean`
   - iOS signing issues? Enable "Automatically manage signing" in Xcode

3. **Contact**: LaLunaMagnifica@bcjj.com

---

## ✅ Deployment Checklist

Before deploying:
- [x] Version numbers updated (done: 1.0.3)
- [ ] Release notes prepared (template above)
- [ ] Signing keys available
- [ ] Test app locally
- [ ] Check API key restrictions

After deploying:
- [ ] Monitor Play Console / App Store Connect for review status
- [ ] Check crash reports
- [ ] Monitor user reviews
- [ ] Verify API usage in Google Cloud Console

---

## 🚀 Ready to Deploy?

**Start here**: Run `.\deploy.ps1` and follow the prompts!

Good luck with your deployment! 🎉
