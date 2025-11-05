# Salaty - Development Roadmap & Design

## 📋 Project Status

### ✅ Completed Features

#### Phase B: Navigation System

- [x] Bottom tab navigation with Material 3 styling
- [x] Four main tabs: Home, Tracking, Qibla, Settings
- [x] Tab icons with active/inactive states
- [x] Tested on both iOS and Android
- [x] Floating pill-style navbar design
- [x] Vibrant teal accent colors (#00BFA5)
- [x] Dynamic theming support (light/dark modes)
- [x] Elevated navbar with proper shadows
- [x] 20px spacing from screen edges

#### Phase A: Prayer Tracking System

- [x] Prayer tracking data models (PrayerStatus, DailyPrayerRecord, etc.)
- [x] TrackingService with local storage (AsyncStorage)
- [x] PrayerCheckbox component with status cycling
- [x] StatsCard component for progress display
- [x] TrackingScreen with:
  - Today's prayer checklist
  - Real-time status updates
  - Completion statistics
  - Pull-to-refresh
  - Material 3 styling
- [x] Export/import functionality for backups

#### Foundation Features

- [x] Prayer times calculation (10 methods including Umm Al-Qura)
- [x] Location services with caching
- [x] Current & next prayer detection
- [x] 12/24-hour time format toggle
- [x] Material Design 3 Expressive theme
- [x] Cross-platform support (iOS & Android)
- [x] TypeScript with strict typing (4,171+ lines of code)
- [x] Icon system (react-native-vector-icons)
- [x] Path aliases with Babel module resolver

#### Settings Screen Implementation

- [x] Full Settings screen UI
- [x] Calculation method selector (10 methods)
- [x] Madhab selector (Shafi'i/Hanafi) for Asr calculation
- [x] Time format toggle (12/24 hour)
- [x] Sunrise/sunset display toggle
- [x] Theme mode selector with full functionality
- [x] Theme persistence across app reloads
- [x] Light/Dark/Auto theme modes
- [x] Theme context with loading state (no flash)
- [x] Notification preferences (UI ready, functionality pending)
- [x] About section with app version
- [x] Reset to defaults functionality
- [x] Persistent settings with AsyncStorage
- [x] All settings changes persist across reloads

#### Home Screen Features

- [x] Location display with coordinates
- [x] Next prayer countdown with time remaining
- [x] Full prayer schedule (all 5 prayers)
- [x] Prayer time display with user's preferred format
- [x] Sunrise/sunset times (toggleable in settings)
- [x] Current prayer indicator (NOW label)
- [x] Next prayer indicator (NEXT label)
- [x] Current settings summary display
- [x] Material Design cards with proper styling
- [x] Icon-based UI (no emojis)
- [x] Dynamic theming support
- [x] Proper bottom padding for floating navbar
- [x] Fixed infinite refresh loop issue

#### Services Architecture

- [x] LocationService - GPS with permissions & caching
- [x] PrayerService - Adhan library integration
- [x] TrackingService - Prayer tracking with AsyncStorage
- [x] SettingsService - User preferences management
- [x] StorageService - Generic AsyncStorage wrapper
- [x] AlAdhanService - API integration for prayer calculations

#### Theme System

- [x] ThemeContext for global theme management
- [x] Light and Dark theme definitions
- [x] Auto theme mode (follows system preference)
- [x] Theme persistence with AsyncStorage
- [x] Loading state to prevent theme flash
- [x] Dynamic theme switching across all screens
- [x] react-native-paper theming integration
- [x] Expressive color palette with prayer-specific colors

---

## 🚧 Upcoming Features

### Priority 1: Core Functionality Improvements

#### 1.1 Prayer Calculation Enhancements

- [x] Add calculation method selector in Settings (10 methods available)
- [x] Implement Shafi'i/Hanafi madhab for Asr calculation
- [x] Add the ability to switch between Calculation Methods
- [ ] Add prayer calculation API integration as fallback
- [ ] Fetch calculation methods dynamically from API

#### 1.2 Hijri Calendar

- [ ] Create Hijri calendar view/component
- [ ] Display current Hijri date on Home screen
- [ ] Monthly Hijri calendar page
- [ ] Important Islamic dates highlighting
- [ ] Ramadan and special months indicators

#### 1.3 Offline-First Architecture

- [ ] Implement offline data persistence strategy
- [ ] Cache prayer times for 30+ days ahead
- [ ] Download prayer times on first launch (with internet)
- [ ] Offline mode indicator in UI
- [ ] Sync when internet available
- [ ] Handle edge cases (timezone changes, location changes)

### Priority 2: Cloud Backup & Sync

- [ ] Research Google Cloud Storage API for Android
- [ ] Research iCloud integration for iOS
- [ ] Implement automatic backup system:
  - Daily prayer records
  - Custom prayers
  - Preferences
  - Statistics
- [ ] Add manual backup/restore UI
- [ ] Conflict resolution strategy
- [ ] Backup status indicators

### Priority 3: Qibla Compass (Phase C)

- [ ] Implement compass sensor integration
- [ ] Calculate Qibla direction from location
- [ ] Create animated compass UI
- [ ] Add distance to Kaaba display
- [ ] Implement calibration instructions
- [ ] Add haptic feedback when aligned
- [ ] Handle sensor availability/permissions

### Priority 4: Notifications System

- [ ] Set up notification permissions
- [ ] Schedule prayer time notifications
- [ ] Add Adhan sound playback
- [ ] Implement reminder notifications (customizable minutes before)
- [ ] Create notification settings UI
- [ ] Add custom notification sounds
- [ ] Handle notification actions (mark as prayed)

### Priority 5: Statistics & History

- [ ] Create statistics calculation service
- [ ] Build monthly stats view
- [ ] Implement streak calculations (current & best)
- [ ] Create per-prayer breakdown charts
- [ ] Add historical data view (scrollable list)
- [ ] Export statistics feature
- [ ] Weekly/monthly reports

### Priority 6: Settings Screen

- [x] Build Settings screen UI
- [x] Calculation method selector
- [x] Madhab selector (Shafi'i/Hanafi)
- [x] Time format toggle (12/24 hour)
- [x] Sunrise/sunset display toggle
- [x] About section with app version
- [x] Reset to defaults functionality
- [x] Dark mode toggle (fully implemented with Light/Dark/Auto)
- [x] Theme persistence across reloads
- [ ] Notification preferences (UI ready, needs implementation)
- [ ] Language selection (future i18n)

### Priority 7: Custom Prayers Management

- [ ] Add custom prayer modal/form
- [ ] Predefined custom prayers (Taraweeh, Qiyam, Witr, etc.)
- [ ] Rakaat counter for custom prayers
- [ ] Schedule custom prayers
- [ ] Track custom prayer completion
- [ ] Custom prayer statistics

### Priority 8: Enhanced UX

- [x] Pull-to-refresh on Tracking screen
- [ ] Add onboarding flow for first launch
- [ ] Implement splash screen
- [ ] Add loading states/skeletons
- [ ] Error handling improvements
- [ ] Empty states design
- [ ] Pull-to-refresh on Home and Settings screens
- [ ] Accessibility improvements (screen readers, contrast)

---

## 🎨 Design Mockups

### Material Design 3 Expressive Theme

**Color Palette:**

- Primary: Teal (#006A6A) - Islamic theme
- Background: White (#FAFDFD) / Dark (#191C1C)
- Prayer Active: Green (#00C853)
- Prayer Upcoming: Orange (#FFA726)
- Prayer Completed: Teal (#4CDADA)
- Prayer Missed: Red (#FF5252)
- Qibla Gold: (#FFD700)

**Typography Hierarchy:**

- Display Large (48px, Bold): Countdown timers
- Headline Large (32px, Bold): Prayer names
- Title Large (22px, Semibold): Card titles
- Body Large (16px, Regular): Content

**Design Elements:**

- Large rounded cards (24px corners)
- Bold typography for prayer names
- Spring animations on card appearance
- Elevated shadows on active cards
- Color-coded status indicators

---

### Screen 1: Home Screen (Prayer Times) ✅

```
┌─────────────────────────────────────┐
│  ☰  Salaty            🔔  ⚙️       │
├─────────────────────────────────────┤
│  📍 Location Name                   │
│  🕋 29 Jumada Al-Thani 1447        │ Hijri date
│                                     │
│  ╭──────────────────────────────╮  │
│  │   Next Prayer: Dhuhr         │  │
│  │   ⏰ 12:15 PM                │  │
│  │   ⏱️  In 2 hours 34 minutes  │  │
│  ╰──────────────────────────────╯  │
│                                     │
│  ╭─ Today's Prayers ──────────╮   │
│  │  🌅 Fajr       5:23 AM  ✓  │   │
│  │  ☀️  Sunrise    6:45 AM     │   │
│  │  🌤️  Dhuhr     12:15 PM  ⏰ │   │
│  │  🌥️  Asr        3:42 PM     │   │
│  │  🌆 Maghrib    6:18 PM     │   │
│  │  🌙 Isha       7:48 PM     │   │
│  ╰─────────────────────────────╯   │
│                                     │
│  ╭─ Quick Stats ──────────────╮   │
│  │  Today: 1/5  📊 20%        │   │
│  │  Streak: 🔥 7 days         │   │
│  ╰─────────────────────────────╯   │
│                                     │
├─────────────────────────────────────┤
│  🏠  ✓  🧭  ⚙️                     │
└─────────────────────────────────────┘
```

**Status:** ✅ Fully implemented with:
- Location display (lat/long)
- Next prayer card with countdown
- Complete prayer schedule (5 daily prayers)
- Sunrise/sunset times (toggleable)
- Prayer status indicators (NOW/NEXT)
- Current settings summary
- Material icons (no emojis)

---

### Screen 2: Prayer Tracking ✅

```
┌─────────────────────────────────────┐
│  Today's Prayers                    │
├─────────────────────────────────────┤
│  📅 Tuesday, November 4, 2025      │
│                                     │
│  ╭──────────────────────────────╮  │
│  │ Today's Progress             │  │
│  │ Completed: 1  Rate: 20%      │  │
│  │ Missed: 0                    │  │
│  ╰──────────────────────────────╯  │
│                                     │
│  ╭──────────────────────────────╮  │
│  │ Prayer Checklist             │  │
│  │                              │  │
│  │ ☑️ Fajr        5:23 AM       │  │
│  │ ☐ Dhuhr       12:15 PM       │  │
│  │ ☐ Asr          3:42 PM       │  │
│  │ ☐ Maghrib      6:18 PM       │  │
│  │ ☐ Isha         7:48 PM       │  │
│  ╰──────────────────────────────╯  │
│                                     │
│  [📊 Statistics]                   │ FAB
│                                     │
├─────────────────────────────────────┤
│  🏠  ✓  🧭  ⚙️                     │
└─────────────────────────────────────┘
```

**Status:** ✅ Fully implemented with:
- Prayer checklist with interactive checkboxes
- Status cycling (Pending → Completed → Delayed → Missed)
- Today's progress statistics
- Pull-to-refresh
- Real-time updates
- Material Design styling

**Future Enhancements:**

- Add notes to each prayer
- Custom prayers section
- Weekly calendar view

---

### Screen 3: Qibla Compass (TODO)

```
┌─────────────────────────────────────┐
│  Qibla Direction                    │
├─────────────────────────────────────┤
│  📍 Your Location                   │
│  Distance to Kaaba: 2,543 km       │
│                                     │
│         ╭─────────────╮            │
│        ╱       N       ╲           │
│       │       ↑         │          │
│      │                   │         │
│     │          🕋         │        │
│     │        ←─┘          │        │
│      │                   │         │
│       │                 │          │
│        ╲               ╱           │
│         ╰─────────────╯            │
│                                     │
│         📐 284° NW                 │
│                                     │
│  ╭──────────────────────────────╮  │
│  │  ℹ️  Calibration:            │  │
│  │  • Hold phone flat           │  │
│  │  • Move away from metal      │  │
│  │  • Rotate in figure-8        │  │
│  ╰──────────────────────────────╯  │
│                                     │
├─────────────────────────────────────┤
│  🏠  ✓  🧭  ⚙️                     │
└─────────────────────────────────────┘
```

**Status:** Placeholder screen

---

### Screen 4: Statistics (Future)

```
┌─────────────────────────────────────┐
│  Prayer Statistics                  │
├─────────────────────────────────────┤
│  ╭──────────────────────────────╮  │
│  │   This Month                 │  │
│  │   128 / 150  (85%)          │  │
│  │   ████████████░░░            │  │
│  │                              │  │
│  │   🔥 Current Streak: 7 days │  │
│  │   🏆 Best Streak: 23 days   │  │
│  ╰──────────────────────────────╯  │
│                                     │
│  ╭─ Prayer Breakdown ──────────╮   │
│  │  Fajr    ████████░░  28/30  │   │
│  │  Dhuhr   ██████████  30/30  │   │
│  │  Asr     █████████░  29/30  │   │
│  │  Maghrib █████████░  29/30  │   │
│  │  Isha    ████████░░  27/30  │   │
│  ╰──────────────────────────────╯   │
│                                     │
│  ╭─ Recent History ────────────╮   │
│  │  Nov 4  ✓ ✓ ✓ ✓ ✓  5/5     │   │
│  │  Nov 3  ✓ ✓ ✓ ✓ ✗  4/5     │   │
│  │  Nov 2  ✓ ✓ ✓ ✓ ✓  5/5     │   │
│  ╰──────────────────────────────╯   │
│                                     │
├─────────────────────────────────────┤
│  🏠  ✓  🧭  ⚙️                     │
└─────────────────────────────────────┘
```

---

### Screen 5: Settings ✅

```
┌─────────────────────────────────────┐
│  Settings                           │
├─────────────────────────────────────┤
│  ⚙️ Prayer Calculation             │
│  ╭──────────────────────────────╮  │
│  │ Method: [Umm Al-Qura] ▼     │  │
│  │ Madhab: ◉ Shafi'i ○ Hanafi  │  │
│  ╰──────────────────────────────╯  │
│                                     │
│  🔔 Notifications                  │
│  ╭──────────────────────────────╮  │
│  │ ✓ Prayer time notifications  │  │
│  │ ✓ Adhan sound                │  │
│  │ ✓ Reminder (15 min before)   │  │
│  ╰──────────────────────────────╯  │
│                                     │
│  🕰️ Display                       │
│  ╭──────────────────────────────╮  │
│  │ Time: ◉ 12-hour ○ 24-hour   │  │
│  │ ✓ Show sunrise/sunset        │  │
│  ╰──────────────────────────────╯  │
│                                     │
│  📱 App                            │
│  ╭──────────────────────────────╮  │
│  │ 🌙 Dark mode: Auto           │  │
│  │ 📍 Location: Auto-detect     │  │
│  │ ☁️  Backup: iCloud/Google    │  │
│  ╰──────────────────────────────╯  │
│                                     │
│  ℹ️  About - Version 1.0.0         │
│                                     │
├─────────────────────────────────────┤
│  🏠  ✓  🧭  ⚙️                     │
└─────────────────────────────────────┘
```

**Status:** ✅ Fully implemented with:
- Prayer calculation method selector (10 methods)
- Madhab selector (Shafi'i/Hanafi)
- Time format toggle (12h/24h)
- Sunrise/sunset display toggle
- Theme mode selector (Light/Dark/Auto - fully functional)
- Theme persistence with no flash on startup
- Notification settings (UI ready, functionality pending)
- About section with version
- Reset to defaults
- All settings persist to AsyncStorage
- Dynamic theming support

---

### Screen 6: Hijri Calendar (TODO)

```
┌─────────────────────────────────────┐
│  Islamic Calendar                   │
├─────────────────────────────────────┤
│  🕋 Jumada Al-Thani 1447           │
│                                     │
│  ╭──────────────────────────────╮  │
│  │  Sun Mon Tue Wed Thu Fri Sat │  │
│  │   27  28  29  30   1   2   3 │  │
│  │    4   5   6   7   8   9  10 │  │
│  │   11  12  13  14  15  16  17 │  │
│  │   18  19  20  21  22  23  24 │  │
│  │   25  26 [27] 28  29  30   1 │  │
│  ╰──────────────────────────────╯  │
│                                     │
│  ╭─ Today ─────────────────────╮   │
│  │  29 Jumada Al-Thani 1447    │   │
│  │  November 4, 2025           │   │
│  ╰──────────────────────────────╯   │
│                                     │
│  ╭─ Important Dates ───────────╮   │
│  │  📅 1 Ramadan: March 1      │   │
│  │  🌙 Eid Al-Fitr: March 31   │   │
│  │  🕋 Eid Al-Adha: June 7     │   │
│  ╰──────────────────────────────╯   │
│                                     │
├─────────────────────────────────────┤
│  🏠  ✓  🧭  ⚙️                     │
└─────────────────────────────────────┘
```

---

## 🎯 User Flows

### First Launch (Offline-First)

1. Splash screen with Salaty logo
2. Check internet connection
3. If online:
   - Request location permission
   - Download prayer times for 30+ days
   - Cache calculation data
   - Select calculation method & madhab
4. If offline:
   - Show error: "Internet required for first launch"
   - Retry button
5. Navigate to Home screen

### Daily Usage

1. Open app (works offline)
2. View next prayer time
3. Navigate to Tracking tab
4. Tap checkbox to mark prayer as completed
5. View statistics

### Prayer Time Flow

1. Notification appears at prayer time
2. Tap notification → Opens app
3. Auto-scrolls to current prayer in Tracking
4. Quick checkbox to mark completed

---

## 📐 Technical Specifications

### Offline-First Requirements

- Cache prayer times for minimum 30 days ahead
- Store calculation method parameters locally
- Download data on first launch (internet required)
- Update cache when location changes significantly
- Background sync when internet available
- Clear cache strategy (keep last 7 days, future 30 days)

### Prayer Calculation

- Primary: Local calculation using Adhan library
- Fallback: API for verification/comparison
- Methods: 10 calculation methods supported
- Madhab: Shafi'i and Hanafi for Asr
- Manual adjustments: +/- 15 minutes per prayer

### Cloud Backup Format

```json
{
  "version": "1.0",
  "lastSync": "2025-11-04T12:00:00Z",
  "dailyRecords": {
    "2025-11-04": {
      /* DailyPrayerRecord */
    }
  },
  "preferences": {
    /* TrackingPreferences */
  },
  "statistics": {
    /* Calculated stats */
  }
}
```

---

## 🔄 Migration Notes

### From DESIGN_MOCKUPS.md

All design mockups and specifications have been migrated into this file. The separate DESIGN_MOCKUPS.md file can now be deleted.

---

## 📝 Notes

- All checkboxes in TODO items use `[ ]` for pending and `[x]` for completed
- Priority 1 items should be completed before Phase C (Qibla)
- Offline-first architecture is critical for prayer times app
- Cloud backup should sync only when on WiFi (user preference)
- Hijri calendar should be prominently displayed on Home screen
