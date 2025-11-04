# Salaty - Islamic Prayer Times App

A modern React Native application for displaying accurate Islamic prayer times, Qibla direction, and daily salat tracking. Built with Material Design 3 Expressive theme and offline-first architecture.

## ✨ Features

### ✅ Currently Implemented

#### Navigation & Structure
- **Bottom Tab Navigation**: Material 3 styled tabs (Home, Tracking, Qibla, Settings)
- **Cross-Platform**: Works seamlessly on iOS and Android

#### Prayer Times (Home Screen)
- **Accurate Prayer Times**: All 5 daily prayers (Fajr, Dhuhr, Asr, Maghrib, Isha)
- **10 Calculation Methods**: Including Umm Al-Qura (Makkah) as default
- **Current & Next Prayer**: Automatic detection with countdown timer
- **Sunrise & Sunset**: Additional Islamic times
- **12-Hour Format**: Time display with AM/PM
- **Location Services**: Automatic location detection with permission handling
- **5-Minute Caching**: Optimized battery usage

#### Prayer Tracking System
- **Daily Checklist**: Interactive checkboxes for all 5 prayers
- **Status Management**: Pending, Completed, Missed, Delayed
- **Today's Statistics**: Completion rate and counts
- **Pull-to-Refresh**: Update tracking data
- **Local Storage**: AsyncStorage persistence
- **Export/Import**: Backup functionality ready

#### Design System
- **Material Design 3 Expressive**: Enhanced shapes, colors, and typography
- **Islamic Theme**: Teal primary color (#006A6A)
- **Color-Coded Status**:
  - Green: Completed prayers
  - Orange: Delayed prayers
  - Red: Missed prayers
  - Gray: Pending prayers
- **24px Rounded Corners**: Modern card design
- **Bold Typography**: Enhanced readability

### 📋 See [TODO.md](./TODO.md) for Complete Roadmap

Key upcoming features:
- Prayer calculation API integration & Shafi'i madhab for Asr
- Hijri calendar display
- Offline-first architecture (cache 30+ days)
- Cloud backup (Google Cloud & iCloud)
- Qibla compass
- Prayer notifications with Adhan
- Statistics & history tracking
- Full settings screen

## 🛠 Tech Stack

- **React Native**: 0.82.1
- **TypeScript**: 5.8.3
- **React Native Paper**: 5.14.5 (Material Design 3)
- **React Navigation**: 7.x (Bottom Tabs)
- **Adhan**: 4.4.3 (Prayer time calculations)
- **React Native Geolocation Service**: 5.3.1
- **AsyncStorage**: 2.1.0 (Local storage)

## 📁 Project Structure

```
src/
├── components/
│   └── tracking/         # Prayer tracking UI components
├── hooks/
│   └── useLocation.ts    # Location permission hook
├── navigation/
│   ├── TabNavigator.tsx  # Bottom tab navigation
│   └── types.ts          # Navigation type definitions
├── screens/
│   ├── HomeScreen.tsx    # Prayer times display
│   ├── TrackingScreen.tsx # Prayer tracking
│   ├── QiblaScreen.tsx   # Qibla compass (placeholder)
│   └── SettingsScreen.tsx # Settings (placeholder)
├── services/
│   ├── location/         # LocationService (singleton)
│   ├── prayer/           # PrayerService (Adhan wrapper)
│   ├── storage/          # StorageService (AsyncStorage wrapper)
│   └── tracking/         # TrackingService (prayer tracking)
├── theme/
│   ├── colors.ts         # Material 3 color tokens
│   ├── typography.ts     # Typography system
│   ├── shapes.ts         # Shape configurations
│   └── index.ts          # Main theme export
└── types/
    ├── prayer.ts         # Prayer-related types
    ├── location.ts       # Location types
    └── tracking.ts       # Tracking types
```

## 🚀 Getting Started

### Prerequisites

- **Node.js**: 20+
- **React Native CLI**: Global installation
- **iOS Development**:
  - macOS with Xcode 15+
  - CocoaPods 1.11+
- **Android Development**:
  - Android Studio
  - JDK 17+
  - Android SDK 33+

### Installation

1. **Clone the repository**:
```bash
git clone <repository-url>
cd Salaty
```

2. **Install dependencies**:
```bash
npm install
```

3. **iOS: Install CocoaPods dependencies**:
```bash
cd ios && pod install && cd ..
```

### Running the App

#### Start Metro Bundler
```bash
npm start
```

#### iOS
```bash
npm run ios
```

Or open `ios/Salaty.xcworkspace` in Xcode and run.

#### Android
```bash
# Set JAVA_HOME to JDK 17
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
npm run android
```

## ⚙️ Configuration

### Prayer Calculation Methods (10 Available)

The app currently supports:
1. **Umm Al-Qura, Makkah** (Default) ⭐
2. Muslim World League
3. Egyptian General Authority
4. University of Islamic Sciences, Karachi
5. Dubai
6. Moonsighting Committee
7. ISNA (Islamic Society of North America)
8. Kuwait
9. Qatar
10. Singapore

*Note: Method selection UI coming in Settings screen.*

### Madhab Settings

- **Shafi'i** (Default): Asr when shadow = object length
- **Hanafi**: Asr when shadow = 2× object length

*Note: Currently using Shafi'i. Selector UI coming soon.*

### Time Format

- Currently: **12-hour format** with AM/PM
- Future: Toggle between 12/24 hour in Settings

## 🎨 Design Philosophy

Salaty follows **Material Design 3 Expressive** principles:

- **Teal Islamic Theme**: Primary color #006A6A
- **Large Rounded Corners**: 24px for cards
- **Bold Typography**: Emphasized prayer names and times
- **Color-Coded Status**: Visual feedback for prayer states
- **Smooth Animations**: Spring-based transitions
- **Elevated Cards**: Depth and hierarchy

See [TODO.md](./TODO.md) for detailed design mockups and specifications.

## 🐛 Troubleshooting

### iOS Issues

**Build Errors:**
```bash
cd ios && rm -rf build && pod install && cd ..
npm run ios
```

**Permission Errors:**
Check `ios/Salaty/Info.plist` contains:
- `NSLocationWhenInUseUsageDescription`
- `NSLocationAlwaysAndWhenInUseUsageDescription`

### Android Issues

**Build Errors:**
```bash
cd android && ./gradlew clean && cd ..
npm run android
```

**Java Version:**
```bash
# Check Java version
java -version  # Should be 17.x

# Set JAVA_HOME
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
```

### General Issues

**Clear Metro Cache:**
```bash
npm start -- --reset-cache
```

**Reset Everything:**
```bash
# Clean all caches
rm -rf node_modules ios/Pods ios/build android/build
npm install
cd ios && pod install && cd ..
```

## 📱 Supported Platforms

- **iOS**: 13.0+
- **Android**: API 21+ (Android 5.0+)

## 🔐 Permissions

The app requires:

- **Location (iOS & Android)**: For accurate prayer time calculations
- **Notifications (iOS & Android)**: For prayer time alerts *(coming soon)*

## 🤝 Contributing

This is an active development project. See [TODO.md](./TODO.md) for the roadmap.

To contribute:
1. Check TODO.md for open tasks
2. Create a feature branch
3. Follow Material 3 design guidelines
4. Test on both iOS and Android
5. Submit a pull request

## 📄 License

[Add your license here]

## 🙏 Acknowledgments

- Prayer time calculations: [Adhan JavaScript Library](https://github.com/batoulapps/adhan-js)
- Design inspiration: Material Design 3 Expressive
- Islamic standards: Various Islamic authorities worldwide

---

**Current Version**: 1.0.0-beta
**Last Updated**: November 2025
**Status**: Active Development

For detailed feature roadmap and design mockups, see [TODO.md](./TODO.md)
