# 🚀 Quick Deployment Reference Card

## Version Info
- **Current Version**: 1.0.3
- **Version Code**: 3 (Android)
- **App ID**: bcjj.Heavenly.Myths
- **App Name**: Heavenly Guidance

---

## ⚡ Quick Deploy Commands

```powershell
# Automated deployment (recommended)
.\deploy.ps1

# Manual step-by-step
npm install                  # 1. Install dependencies
npm run build               # 2. Build web assets
npx cap sync android        # 3a. Sync Android
npx cap sync ios            # 3b. Sync iOS
npx cap open android        # 4a. Open Android Studio
npx cap open ios            # 4b. Open Xcode
```

---

## 📱 Android Release Steps

1. **Build**: Run `.\deploy.ps1` or manual commands above
2. **Android Studio**: Build → Generate Signed Bundle / APK
3. **Select**: Android App Bundle (AAB) for Play Store
4. **Sign**: Use your keystore (key.properties)
5. **Build Variant**: Release
6. **Locate**: `android/app/build/outputs/bundle/release/app-release.aab`
7. **Upload**: Google Play Console → Production → Create Release

**Play Console URL**: https://play.google.com/console

---

## 🍎 iOS Release Steps

1. **Build**: Run `.\deploy.ps1` or manual commands above
2. **Xcode**: Open `ios/App/App.xcworkspace`
3. **Version**: Update to 1.0.3 (General tab)
4. **Archive**: Product → Archive (target: Any iOS Device)
5. **Distribute**: Organizer → Distribute App → App Store Connect
6. **Submit**: App Store Connect → Add Build → Submit for Review

**App Store Connect URL**: https://appstoreconnect.apple.com

---

## 📋 Pre-Deployment Checklist

- [ ] All code changes committed (if using git)
- [ ] Version numbers updated (already done: 1.0.3)
- [ ] Release notes prepared
- [ ] App tested locally
- [ ] API keys verified
- [ ] Signing keys available (Android keystore, iOS certificates)

---

## 🔧 Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| `www folder not found` | Run `npm run build` |
| `key.properties not found` | Create in `android/` folder with signing info |
| Android build fails | `cd android && ./gradlew clean && cd ..` |
| Capacitor sync errors | Delete `android/app/src/main/assets` and re-sync |
| iOS signing issues | Enable "Automatically manage signing" in Xcode |

---

## 📁 Important File Locations

```
Project Root
├── deploy.ps1                          ← Run this to deploy
├── DEPLOYMENT-GUIDE.md                 ← Full detailed guide
├── package.json                        ← Version: 1.0.3
├── src/
│   └── environments/
│       ├── environment.ts              ← Dev config
│       └── environment.prod.ts         ← Production config (API key)
├── www/                                ← Built web assets
├── android/
│   ├── key.properties                  ← Signing keys (create if missing)
│   └── app/build/outputs/
│       ├── bundle/release/
│       │   └── app-release.aab        ← Upload to Play Store
│       └── apk/release/
│           └── app-release.apk        ← Test installation
└── ios/
    └── App/
        └── App.xcworkspace             ← Open in Xcode (NOT .xcodeproj)
```

---

## 🔑 Android Signing (key.properties)

Create `android/key.properties`:
```properties
storePassword=YOUR_STORE_PASSWORD
keyPassword=YOUR_KEY_PASSWORD
keyAlias=YOUR_KEY_ALIAS
storeFile=../path/to/your-keystore.jks
```

---

## 📝 Release Notes Template

```
Version 1.0.3

What's New:
✨ Updated to Gemini 2.0 Flash AI model for improved horoscope generation
🔧 Performance improvements and bug fixes
🌟 Enhanced stability

Technical Updates:
- Updated API endpoints
- Improved error handling
- Updated dependencies
```

---

## 🌐 Online Resources

- **Play Console**: https://play.google.com/console
- **App Store Connect**: https://appstoreconnect.apple.com
- **Google Cloud Console**: https://console.cloud.google.com
- **Capacitor Docs**: https://capacitorjs.com/docs
- **Ionic Docs**: https://ionicframework.com/docs

---

## 📞 Contact & Support

- **Developer Email**: LaLunaMagnifica@bcjj.com
- **App Package**: bcjj.Heavenly.Myths
- **Project**: ConstellationMythology

---

## ⏱️ Estimated Timeline

| Task | Time |
|------|------|
| Build & Sync | 5-10 min |
| Android AAB Generation | 5-10 min |
| iOS Archive | 10-15 min |
| Upload to Stores | 5 min each |
| Review by Google/Apple | 1-3 days |

---

## ⚠️ Security Reminder

**Your Google AI API key is exposed in the code!**

Quick fix:
1. Go to: https://console.cloud.google.com
2. Navigate to: APIs & Services → Credentials
3. Edit your API key: `AIzaSyCSR2Nf9a3zY8YF-P6fI0ssWqWMIHtjSKE`
4. Add restrictions:
   - Application restrictions: Android/iOS apps
   - Add package: `bcjj.Heavenly.Myths`
   - Add SHA-1 fingerprint (Android)

---

**Last Updated**: March 2, 2026
**Next Deployment**: [TBD]
