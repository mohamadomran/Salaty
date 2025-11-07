# 🕌 Salaty - Islamic Prayer Times App

A modern React Native application for accurate Islamic prayer times, Qibla direction, and daily salat tracking. Built with Material Design 3 Expressive theme and offline-first architecture.

## ✨ Features

### 🎯 Core Functionality

- **Accurate Prayer Times**: All 5 daily prayers (Fajr, Dhuhr, Asr, Maghrib, Isha) with precise calculations
- **10 Calculation Methods**: Including Umm Al-Qura (Makkah), Muslim World League, and more
- **Location-Based**: Automatic location detection with manual override options
- **Real-Time Updates**: Current and next prayer detection with countdown timers
- **Madhab Support**: Shafi'i and Hanafi jurisprudence for Asr calculation

### 📊 Prayer Tracking System

- **Daily Checklist**: Interactive checkboxes for all 5 prayers with status management
- **Smart Status Tracking**: Pending → Completed → Delayed → Missed
- **Progress Statistics**: Real-time completion rates and daily summaries
- **Historical Data**: Persistent storage with export/import functionality
- **Pull-to-Refresh**: Quick data synchronization

### 🎨 Design & UX

- **Material Design 3 Expressive**: Modern, elevated design with Islamic theming
- **Dynamic Theming**: Light/Dark/Auto modes with seamless transitions
- **Responsive Layout**: Optimized for both iOS and Android devices
- **Accessibility**: Screen reader support and high contrast options
- **Smooth Animations**: Spring-based transitions and micro-interactions

### ⚙️ Settings & Customization

- **Prayer Calculation**: Method selector with 10+ calculation options
- **Time Formats**: 12/24 hour display toggle
- **Sunrise/Sunset**: Optional display of additional Islamic times
- **Theme Preferences**: Full theme control with persistence
- **Notification Settings**: Customizable prayer alerts (UI ready)

## 🛠 Tech Stack

### Core Technologies

- **React Native**: 0.82.1 - Cross-platform mobile framework
- **TypeScript**: 5.8.3 - Type-safe development
- **React Native Paper**: 5.14.5 - Material Design 3 components
- **React Navigation**: 7.x - Navigation system
- **TanStack Query**: 5.90.7 - Data fetching and caching

### Specialized Libraries

- **Adhan**: 4.4.3 - Islamic prayer time calculations
- **React Native Geolocation**: 5.3.1 - Location services
- **AsyncStorage**: 1.24.0 - Local data persistence
- **React Native Vector Icons**: 10.3.0 - Icon system
- **React Native Calendars**: 1.1313.0 - Calendar components
- **React Native Reanimated**: 4.1.3 - Smooth animations

### Development Tools

- **ESLint**: Code quality and consistency
- **Prettier**: Code formatting
- **Jest**: Unit testing
- **Detox**: End-to-end testing
- **TypeScript**: Static type checking

## 📱 Screens

### 🏠 Home Screen

- Current location display with coordinates
- Next prayer countdown with time remaining
- Complete daily prayer schedule
- Sunrise/sunset times (toggleable)
- Current prayer indicators (NOW/NEXT labels)
- Settings summary display

### ✅ Tracking Screen

- Today's prayer checklist with interactive checkboxes
- Real-time progress statistics
- Status cycling (Pending → Completed → Delayed → Missed)
- Pull-to-refresh functionality
- Export/import backup options

### 🧭 Qibla Screen

- Compass integration for Qibla direction
- Distance to Kaaba display
- Calibration instructions
- Haptic feedback when aligned

### ⚙️ Settings Screen

- Prayer calculation method selector (10 methods)
- Madhab selector (Shafi'i/Hanafi)
- Time format toggle (12/24 hour)
- Theme mode selector (Light/Dark/Auto)
- Sunrise/sunset display toggle
- About section with version information

## 🚀 Getting Started

### Prerequisites

- **Node.js**: 20+
- **React Native CLI**: Global installation
- **iOS Development** (macOS only):
  - Xcode 15+
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
# or
yarn install
```

3. **iOS: Install CocoaPods dependencies**:

```bash
cd ios && pod install && cd ..
```

### Running the App

1. **Start Metro Bundler**:

```bash
npm start
# or
yarn start
```

2. **Run on iOS**:

```bash
npm run ios
# or
yarn ios
```

3. **Run on Android**:

```bash
npm run android
# or
yarn android
```

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── settings/        # Settings-specific components
│   ├── tracking/        # Prayer tracking components
│   └── index.ts         # Component exports
├── contexts/           # React contexts
│   ├── AppContext.tsx  # Global app state
│   └── ThemeContext.tsx # Theme management
├── hooks/              # Custom React hooks
├── navigation/         # Navigation configuration
├── screens/            # Main app screens
├── services/           # Business logic and APIs
│   ├── api/           # External API services
│   ├── cache/         # Data caching
│   ├── location/      # Location services
│   ├── prayer/        # Prayer calculations
│   ├── settings/      # Settings management
│   ├── statistics/    # Statistics calculations
│   ├── storage/       # Local storage
│   ├── sync/          # Data synchronization
│   └── tracking/      # Prayer tracking logic
├── theme/             # Theme configuration
├── types/             # TypeScript type definitions
└── utils/             # Utility functions
```

## 🎨 Design System

### Color Palette

- **Primary**: Teal (#006A6A) - Islamic theme
- **Background**: White (#FAFDFD) / Dark (#191C1C)
- **Prayer Completed**: Green (#00C853)
- **Prayer Upcoming**: Orange (#FFA726)
- **Prayer Missed**: Red (#FF5252)
- **Qibla Gold**: (#FFD700)

### Typography

- **Display Large**: 48px, Bold - Countdown timers
- **Headline Large**: 32px, Bold - Prayer names
- **Title Large**: 22px, Semibold - Card titles
- **Body Large**: 16px, Regular - Content text

### Design Principles

- **Large Rounded Corners**: 24px for modern card design
- **Bold Typography**: Enhanced readability for prayer names
- **Color-Coded Status**: Visual feedback for prayer states
- **Smooth Animations**: Spring-based transitions
- **Elevated Cards**: Material Design depth and hierarchy

## ⚙️ Configuration

### Prayer Calculation Methods

1. **Umm Al-Qura, Makkah** (Default)
2. Muslim World League
3. Egyptian General Authority
4. University of Islamic Sciences, Karachi
5. Dubai
6. Moonsighting Committee
7. ISNA (Islamic Society of North America)
8. Kuwait
9. Qatar
10. Singapore

### Madhab Settings

- **Shafi'i** (Default): Asr when shadow = object length
- **Hanafi**: Asr when shadow = 2× object length

## 🧪 Testing

### Unit Tests

```bash
npm test
# or
yarn test
```

### End-to-End Tests

```bash
# Build and run iOS tests
npm run build:e2e:ios
npm run test:e2e:ios

# Build and run Android tests
npm run build:e2e:android
npm run test:e2e:android
```

## 🐛 Troubleshooting

### Common Issues

**Metro bundler issues**:

```bash
npm run clean:cache
npm start -- --reset-cache
```

**iOS build errors**:

```bash
cd ios && rm -rf build && pod install && cd ..
npm run ios
```

**Android build errors**:

```bash
cd android && ./gradlew clean && cd ..
npm run android
```

**Java version issues**:

```bash
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
```

## 📋 Development Roadmap

See [TODO.md](./TODO.md) for the complete development roadmap and upcoming features:

### 🚧 Priority 1: Core Improvements

- [ ] Hijri calendar integration
- [ ] Offline-first architecture (30+ days caching)
- [ ] Prayer calculation API fallback

### 🚧 Priority 2: Cloud Features

- [ ] Google Cloud Storage backup (Android)
- [ ] iCloud backup (iOS)
- [ ] Automatic sync functionality

### 🚧 Priority 3: Enhanced Features

- [ ] Qibla compass implementation
- [ ] Prayer notifications with Adhan
- [ ] Statistics and history tracking
- [ ] Custom prayers management

## 📄 License

[Add your license here]

## 🙏 Acknowledgments

- **Prayer Calculations**: [Adhan JavaScript Library](https://github.com/batoulapps/adhan-js)
- **Design System**: Material Design 3 Expressive
- **Islamic Standards**: Various Islamic authorities worldwide
- **Icon Library**: Material Design Icons

---

**Version**: 0.0.1
**Last Updated**: November 2025
**Status**: Active Development
