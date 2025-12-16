# Salaty - Prayer Times & Tracking

<p align="center">
  <img src="app/src/main/res/mipmap-xxxhdpi/ic_launcher_round.png" width="120" alt="Salaty Logo"/>
</p>

<p align="center">
  <strong>A beautiful, privacy-focused Islamic prayer times app for Android</strong>
</p>

<p align="center">
  <a href="https://github.com/mohamad/SalatyAndroid/releases"><img src="https://img.shields.io/github/v/release/mohamad/SalatyAndroid?style=flat-square" alt="Release"/></a>
  <a href="https://github.com/mohamad/SalatyAndroid/blob/main/LICENSE"><img src="https://img.shields.io/github/license/mohamad/SalatyAndroid?style=flat-square" alt="License"/></a>
  <a href="https://github.com/mohamad/SalatyAndroid/stargazers"><img src="https://img.shields.io/github/stars/mohamad/SalatyAndroid?style=flat-square" alt="Stars"/></a>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#screenshots">Screenshots</a> •
  <a href="#download">Download</a> •
  <a href="#building">Building</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#contributing">Contributing</a>
</p>

---

## Features

- **Accurate Prayer Times** - Calculate prayer times based on your location using multiple calculation methods (Muslim World League, ISNA, Egypt, Umm Al-Qura, and more)
- **Prayer Tracking** - Log your daily prayers and track your consistency
- **Qibla Compass** - Find the direction to Mecca with a smooth, sensor-fused compass
- **Home Screen Widgets** - Compact and full-size widgets showing prayer times
- **Prayer Notifications** - Get notified when it's time to pray
- **Qada Management** - Track and manage your makeup prayers
- **Statistics & Streaks** - View your prayer history and maintain your streak
- **Quick Actions** - Mark prayers as completed directly from notifications
- **Dark Mode** - Full dark theme support
- **Multilingual** - Available in English and Arabic

## Privacy First

Salaty respects your privacy:
- **No ads** - Ever
- **No tracking** - No analytics or telemetry
- **No account required** - Works completely offline
- **Local storage only** - All data stays on your device
- **Open source** - Verify the code yourself

Read our full [Privacy Policy](PRIVACY_POLICY.md).

## Screenshots

<p align="center">
  <i>Screenshots coming soon</i>
</p>

<!--
<p align="center">
  <img src="fastlane/metadata/android/en-US/images/phoneScreenshots/1.png" width="200"/>
  <img src="fastlane/metadata/android/en-US/images/phoneScreenshots/2.png" width="200"/>
  <img src="fastlane/metadata/android/en-US/images/phoneScreenshots/3.png" width="200"/>
</p>
-->

## Download

### GitHub Releases
Download the latest APK from [GitHub Releases](https://github.com/mohamad/SalatyAndroid/releases).

### Play Store
*Coming soon*

### F-Droid
*Coming soon*

## Building

### Prerequisites
- Android Studio Hedgehog (2023.1.1) or newer
- JDK 17
- Android SDK 34

### Build Debug APK
```bash
./gradlew assembleDebug
```

### Build Release APK
Create a `keystore.properties` file in the project root:
```properties
storeFile=your-keystore.jks
storePassword=your-store-password
keyAlias=your-key-alias
keyPassword=your-key-password
```

Then build:
```bash
./gradlew assembleRelease
```

### Run Tests
```bash
./gradlew test
```

## Tech Stack

| Category | Technology |
|----------|------------|
| Language | Kotlin 2.1 |
| UI | Jetpack Compose + Material 3 |
| Architecture | Multi-module, MVVM, Clean Architecture |
| DI | Hilt |
| Database | Room |
| Preferences | DataStore |
| Background Work | WorkManager |
| Prayer Calculation | [Adhan](https://github.com/batoulapps/adhan-java) by Batoul Apps |
| Date/Time | kotlinx-datetime |

## Project Structure

```
app/                    # Main application module
core/
  ├── common/          # Shared utilities
  ├── data/            # Data layer (Room, DataStore, repositories)
  ├── designsystem/    # UI components, theme
  └── domain/          # Domain models
feature/
  ├── home/            # Prayer times display
  ├── tracking/        # Daily prayer tracking
  ├── qada/            # Makeup prayers
  ├── statistics/      # Prayer history & stats
  ├── settings/        # App settings
  ├── compass/         # Qibla compass
  └── onboarding/      # First-run setup
```

## Calculation Methods

Salaty supports the following prayer time calculation methods:

- Muslim World League
- Islamic Society of North America (ISNA)
- Egyptian General Authority of Survey
- Umm Al-Qura University, Makkah
- University of Islamic Sciences, Karachi
- Institute of Geophysics, University of Tehran
- Shia Ithna-Ashari, Leva Institute, Qum
- Gulf Region
- Kuwait
- Qatar
- Singapore
- Turkey (Diyanet)

Both **Shafi** and **Hanafi** madhabs are supported for Asr calculation.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Adhan](https://github.com/batoulapps/adhan-java) - Prayer time calculation library by Batoul Apps
- All contributors and users of this app

---

<p align="center">
  Made with ❤️ for the Muslim community
</p>
