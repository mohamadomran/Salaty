# Salaty - Islamic Prayer Times App

A modern React Native application for displaying accurate Islamic prayer times, Qibla direction, and daily salat tracking. Built with Material Design 3 Expressive theme.

## Features

### ✅ Implemented
- **Prayer Times Display**: Shows all 5 daily prayers (Fajr, Dhuhr, Asr, Maghrib, Isha)
- **Multiple Calculation Methods**: Support for 10 calculation methods including Umm Al-Qura (Makkah)
- **Location Services**: Automatic location detection with permission handling
- **Current & Next Prayer**: Highlights the current prayer and shows countdown to next prayer
- **Sunrise & Sunset Times**: Additional Islamic times displayed
- **12/24 Hour Format**: Time display in 12-hour format with AM/PM
- **Material Design 3 Expressive**: Modern UI with enhanced shapes, colors, and typography
- **Cross-Platform**: Works on both iOS and Android

### 🚧 Planned Features

#### Phase 1: Prayer Tracking System
- [ ] Daily prayer tracking with checkboxes
- [ ] Mark prayers as completed/missed
- [ ] Add notes to each prayer
- [ ] Custom prayer management (Taraweeh, Qiyam, Witr, Sunnah)
- [ ] Weekly prayer overview

#### Phase 2: Statistics & History
- [ ] Monthly prayer completion statistics
- [ ] Streak tracking (current & best)
- [ ] Per-prayer breakdown charts
- [ ] Historical data view
- [ ] Export statistics

#### Phase 3: Qibla Compass
- [ ] Live compass pointing to Kaaba
- [ ] Distance to Kaaba display
- [ ] Calibration instructions
- [ ] Haptic feedback when aligned

#### Phase 4: Notifications
- [ ] Prayer time notifications
- [ ] Adhan sound playback
- [ ] Reminder notifications (5 min before)
- [ ] Customizable notification settings

#### Phase 5: Navigation & Settings
- [ ] Bottom tab navigation
- [ ] Calculation method selection
- [ ] Madhab selection (Shafi'i/Hanafi)
- [ ] Time format toggle (12/24 hour)
- [ ] Dark mode support
- [ ] Language selection

## Tech Stack

- **React Native**: 0.82.1
- **TypeScript**: 5.8.3
- **React Native Paper**: 5.14.5 (Material Design 3)
- **React Navigation**: 7.x
- **Adhan**: 4.4.3 (Prayer time calculations)
- **Geolocation Service**: 5.3.1

## Project Structure

```
src/
├── components/       # Reusable UI components
├── features/         # Feature-specific code
├── hooks/           # Custom React hooks (useLocation)
├── navigation/      # Navigation configuration
├── services/        # Business logic services
│   ├── location/    # Location & permissions
│   ├── prayer/      # Prayer time calculations
│   └── storage/     # AsyncStorage wrapper
├── theme/           # Material 3 Expressive theme
│   ├── colors.ts    # Color tokens
│   ├── typography.ts # Typography system
│   ├── shapes.ts    # Shape configurations
│   └── index.ts     # Main theme export
└── types/           # TypeScript type definitions
```

## Getting Started

### Prerequisites

- Node.js 20+
- React Native development environment setup
- For iOS: Xcode and CocoaPods
- For Android: Android Studio and JDK 17+

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Salaty
```

2. Install dependencies:
```bash
npm install
```

3. For iOS, install CocoaPods dependencies:
```bash
cd ios && pod install && cd ..
```

### Running the App

#### iOS
```bash
npm run ios
```

#### Android
```bash
# Make sure JAVA_HOME is set to JDK 17
export JAVA_HOME=$(/usr/libexec/java_home)
npm run android
```

#### Metro Bundler
If not already running:
```bash
npm start
```

## Configuration

### Prayer Calculation Methods

The app supports the following calculation methods:
- Muslim World League
- Egyptian General Authority
- University of Islamic Sciences, Karachi
- **Umm Al-Qura, Makkah** (Default)
- Dubai
- Moonsighting Committee
- ISNA (North America)
- Kuwait
- Qatar
- Singapore

### Madhab Settings

Choose between:
- **Shafi'i** (Default) - Asr when shadow equals object length
- **Hanafi** - Asr when shadow equals twice object length

## Design

The app follows **Material Design 3 Expressive** guidelines with:
- Enhanced rounded corners (24px for cards)
- Bold typography for emphasis
- Teal primary color (#006A6A) for Islamic theme
- Prayer-specific colors (green for active, orange for upcoming)
- Smooth animations and transitions

See `DESIGN_MOCKUPS.md` for detailed UI mockups.

## Troubleshooting

### Android Build Issues

If you encounter build errors:
```bash
cd android && ./gradlew clean && cd ..
npm run android
```

### iOS Permission Issues

Make sure location permissions are properly configured in `Info.plist`:
- `NSLocationWhenInUseUsageDescription`
- `NSLocationAlwaysAndWhenInUseUsageDescription`

### Metro Bundler Cache

Clear Metro cache if you experience issues:
```bash
npm start -- --reset-cache
```

## Contributing

This is an active development project. Contributions are welcome!

## License

[Add your license here]

## Acknowledgments

- Prayer time calculations powered by [Adhan](https://github.com/batoulapps/adhan-js)
- Design inspired by Material Design 3 Expressive
- Islamic prayer time standards from various Islamic authorities
