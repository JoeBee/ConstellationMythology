# Changelog - Heavenly Guidance

All notable changes to this project will be documented in this file.

---

## [1.0.3] - 2026-03-02

### Changed
- Updated Google Gemini AI model from deprecated version to `gemini-2.0-flash`
- Updated API endpoint to use current Gemini API version
- Version bumps: Android versionCode 2→3, versionName 1.0.2→1.0.3

### Technical
- Updated package.json version to 1.0.3
- Updated android/app/build.gradle version
- Prepared for redeployment to Google Play Store and Apple App Store

### Notes
- **Action Required**: Google Gemini API migration (Gemini 3 Pro Preview deprecated March 9, 2026)
- **Status**: Ready for deployment
- **Deployment Guide**: See DEPLOYMENT-GUIDE.md

---

## [1.0.2] - [Previous Date]

### Added
- Android release to Google Play Store

### Details
- Application ID: bcjj.Heavenly.Myths
- Version Code: 2
- Version Name: 1.0.2

---

## [1.0.0] - [Initial Release]

### Added
- iOS release to Apple App Store
- Android initial release
- Constellation identification and mythology
- Astrological information and zodiac signs
- Google AI-powered horoscope generation
- Text-to-speech narration
- Location-based constellation viewing
- Splash screen and custom app icons

### Features
- **Constellation Tab**: View and learn about constellations with mythology
- **Astrology Tab**: Zodiac sign information and characteristics
- **Heavenly Guidance Tab**: AI-generated personalized horoscopes
- **Myth Tab**: Detailed mythological stories

### Technical Stack
- Ionic Framework 8.0
- Angular 19.0
- Capacitor 7.2
- Google Gemini AI (gemini-2.0-flash)
- Astronomy Engine 2.1.19
- Text-to-Speech Plugin

### Plugins & Capabilities
- @capacitor/geolocation - Location services
- @capacitor-community/text-to-speech - Audio narration
- @capacitor/device - Device information
- @capacitor/haptics - Haptic feedback
- @capacitor/preferences - Local storage

---

## Upcoming / Planned

### Features
- [ ] Backend API proxy for secure API key management
- [ ] User accounts and profiles
- [ ] Daily horoscope notifications
- [ ] Constellation AR viewer
- [ ] Social sharing features
- [ ] Multiple language support
- [ ] Dark mode improvements
- [ ] Offline mode for cached content

### Technical Improvements
- [ ] CI/CD pipeline setup
- [ ] Automated testing
- [ ] API key security improvements
- [ ] Performance optimizations
- [ ] Crash reporting integration
- [ ] Analytics integration

---

## Version Schema

**Format**: `MAJOR.MINOR.PATCH`

- **MAJOR**: Significant changes, new major features
- **MINOR**: New features, enhancements
- **PATCH**: Bug fixes, minor updates

**Android Version Code**: Incremental integer (1, 2, 3, ...)
**iOS Build Number**: Incremental integer or matches version code

---

## Deployment History

| Version | Date | Android | iOS | Status | Notes |
|---------|------|---------|-----|--------|-------|
| 1.0.3 | 2026-03-02 | ✅ Ready | ✅ Ready | Pending | Gemini API migration |
| 1.0.2 | - | ✅ Released | - | Live | - |
| 1.0.0 | - | ✅ Released | ✅ Released | Live | Initial release |

---

## Migration Notes

### Gemini API Migration (March 2026)

**Issue**: Google announced deprecation of Gemini 3 Pro Preview (effective March 9, 2026)

**Action Taken**:
- Updated to `gemini-2.0-flash` model
- Changed API endpoint to current version
- Tested compatibility with existing prompt structure
- Maintained backward compatibility with response parsing

**API Endpoint Changes**:
- **Old**: `gemini-3-pro-preview` (deprecated)
- **New**: `gemini-2.0-flash` (current)

**Impact**: 
- ✅ No breaking changes in response format
- ✅ Improved performance with newer model
- ✅ Better AI-generated horoscope quality

---

## Contact & Support

- **Developer**: LaLunaMagnifica@bcjj.com
- **App ID**: bcjj.Heavenly.Myths
- **Play Store**: [Your Play Store URL]
- **App Store**: [Your App Store URL]

---

**Last Updated**: 2026-03-02
