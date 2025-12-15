# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Salaty is an Islamic prayer tracking Android app built with Kotlin, Jetpack Compose, and modern Android architecture. It calculates prayer times using the Adhan library, tracks daily prayers, manages Qada (makeup prayers), and sends prayer notifications.

## Build Commands

```bash
# Build the project
./gradlew assembleDebug

# Run unit tests
./gradlew test

# Run specific module tests
./gradlew :core:data:test
./gradlew :feature:home:test

# Clean build
./gradlew clean assembleDebug

# Install to connected device
./gradlew installDebug
```

## Architecture

### Multi-Module Structure

```
app/                    # Main application module, MainActivity, navigation
core/
  common/              # Shared utilities
  data/                # Data layer: Room DB, DataStore, repositories
  designsystem/        # UI components, theme, colors, typography
  domain/              # Domain models (pure Kotlin, no Android deps)
feature/
  home/                # Home screen with prayer times, next prayer countdown
  tracking/            # Daily prayer tracking
  qada/                # Makeup prayer management
  statistics/          # Prayer statistics and history
  settings/            # App settings, calculation method, notifications
  onboarding/          # First-run setup
```

### Key Patterns

**Dependency Injection**: Hilt for DI. Modules in `core/data/di/`.

**Database**: Room with entities in `core/data/database/entity/`, DAOs in `dao/`. Three tables:
- `PrayerRecordEntity` - Daily prayer status (PENDING, PRAYED, PRAYED_LATE, MISSED)
- `QadaCountEntity` - Makeup prayer counts per prayer type
- `LocationEntity` - Saved locations for prayer time calculations

**Preferences**: DataStore in `SalatyPreferences`. Keys in `PreferencesKeys.kt`.

**Prayer Calculation**: Uses `batoulapps.adhan2` library. `PrayerTimeCalculator` wraps it, supporting 12 calculation methods and both Shafi/Hanafi madhabs.

**Notifications**: WorkManager-based via `PrayerNotificationScheduler`. Scheduled at app start and rescheduled via `BootReceiver`.

### Data Flow

1. `PrayerRepository` is the single source of truth
2. Repository coordinates between Room DAOs, DataStore, and PrayerTimeCalculator
3. ViewModels observe repository flows and expose UI state
4. Screens consume state via `collectAsStateWithLifecycle()`

### Navigation

`SalatyNavHost` uses Jetpack Navigation Compose with bottom navigation. Routes defined in `Screen` sealed class.

## Domain Models

Located in `core/domain/model/`:
- `PrayerName` enum: FAJR, SUNRISE, DHUHR, ASR, MAGHRIB, ISHA
- `PrayerStatus` enum: PENDING, PRAYED, PRAYED_LATE, MISSED
- `PrayerTimes` / `DailyPrayerTimes` - Calculated prayer times for a date
- `HijriDate` - Islamic calendar date
- `CalculationMethod`, `Madhab`, `HighLatitudeRule` - Prayer calculation settings

## Tech Stack

- Kotlin 2.1, Java 17
- Jetpack Compose with Material 3
- Hilt for DI
- Room for database
- DataStore for preferences
- WorkManager for notifications
- Adhan2 for prayer time calculations
- kotlinx-datetime for time handling
- Core library desugaring for java.time on API < 26
