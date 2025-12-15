package com.mohamad.salaty.core.domain.model

/**
 * Settings Domain Models
 *
 * User preferences and app configuration.
 */

// ============================================================================
// CALCULATION METHODS
// ============================================================================

/**
 * Prayer time calculation methods
 *
 * Different Islamic organizations use different formulas for calculating prayer times,
 * particularly Fajr and Isha angles.
 */
enum class CalculationMethod(
    val displayName: String,
    val description: String
) {
    MUSLIM_WORLD_LEAGUE(
        displayName = "Muslim World League",
        description = "Fajr: 18°, Isha: 17°"
    ),
    EGYPTIAN(
        displayName = "Egyptian General Authority",
        description = "Fajr: 19.5°, Isha: 17.5°"
    ),
    KARACHI(
        displayName = "University of Islamic Sciences, Karachi",
        description = "Fajr: 18°, Isha: 18°"
    ),
    UMM_AL_QURA(
        displayName = "Umm al-Qura University, Makkah",
        description = "Fajr: 18.5°, Isha: 90 min after Maghrib"
    ),
    DUBAI(
        displayName = "Dubai",
        description = "Fajr: 18.2°, Isha: 18.2°"
    ),
    QATAR(
        displayName = "Qatar",
        description = "Fajr: 18°, Isha: 90 min after Maghrib"
    ),
    KUWAIT(
        displayName = "Kuwait",
        description = "Fajr: 18°, Isha: 17.5°"
    ),
    MOONSIGHTING_COMMITTEE(
        displayName = "Moonsighting Committee",
        description = "Fajr: 18°, Isha: 18°"
    ),
    SINGAPORE(
        displayName = "Singapore",
        description = "Fajr: 20°, Isha: 18°"
    ),
    TURKEY(
        displayName = "Turkey (Diyanet)",
        description = "Fajr: 18°, Isha: 17°"
    ),
    TEHRAN(
        displayName = "Tehran",
        description = "Fajr: 17.7°, Isha: 14°"
    ),
    NORTH_AMERICA(
        displayName = "ISNA (North America)",
        description = "Fajr: 15°, Isha: 15°"
    );

    companion object {
        val DEFAULT = MUSLIM_WORLD_LEAGUE
    }
}

// ============================================================================
// MADHAB (SCHOOL OF JURISPRUDENCE)
// ============================================================================

/**
 * Islamic schools of jurisprudence for Asr calculation
 */
enum class Madhab(
    val displayName: String,
    val description: String
) {
    SHAFI(
        displayName = "Shafi'i",
        description = "Shadow factor: 1 (Standard)"
    ),
    HANAFI(
        displayName = "Hanafi",
        description = "Shadow factor: 2 (Later Asr time)"
    );

    companion object {
        val DEFAULT = SHAFI
    }
}

// ============================================================================
// HIGH LATITUDE RULE
// ============================================================================

/**
 * Rules for calculating prayer times at high latitudes
 * where the sun may not set or rise
 */
enum class HighLatitudeRule(
    val displayName: String,
    val description: String
) {
    MIDDLE_OF_THE_NIGHT(
        displayName = "Middle of the Night",
        description = "Fajr and Isha split night in half"
    ),
    SEVENTH_OF_THE_NIGHT(
        displayName = "Seventh of the Night",
        description = "Fajr/Isha are 1/7 of night from sunrise/sunset"
    ),
    TWILIGHT_ANGLE(
        displayName = "Twilight Angle",
        description = "Uses the twilight angle based method"
    );

    companion object {
        val DEFAULT = MIDDLE_OF_THE_NIGHT
    }
}

// ============================================================================
// APP SETTINGS
// ============================================================================

/**
 * Complete app settings model
 */
data class AppSettings(
    // Prayer calculation
    val calculationMethod: CalculationMethod = CalculationMethod.DEFAULT,
    val madhab: Madhab = Madhab.DEFAULT,
    val highLatitudeRule: HighLatitudeRule = HighLatitudeRule.DEFAULT,

    // Display
    val use24HourFormat: Boolean = false,
    val showSunriseSunset: Boolean = true,
    val language: String = "en",

    // Notifications
    val notificationsEnabled: Boolean = true,
    val reminderMinutesBefore: Int = 10,
    val vibrateEnabled: Boolean = true,

    // Theme
    val themeMode: ThemeMode = ThemeMode.SYSTEM,
    val useDynamicColor: Boolean = true,

    // App state
    val onboardingCompleted: Boolean = false,
    val appVersion: String = "1.0.0"
)

/**
 * Theme mode options
 */
enum class ThemeMode {
    LIGHT,
    DARK,
    SYSTEM
}

// ============================================================================
// NOTIFICATION SETTINGS
// ============================================================================

/**
 * Per-prayer notification settings
 */
data class PrayerNotificationSettings(
    val prayerName: PrayerName,
    val enabled: Boolean = true,
    val reminderMinutes: Int = 10,
    val soundEnabled: Boolean = true,
    val vibrateEnabled: Boolean = true
)

/**
 * Complete notification preferences
 */
data class NotificationPreferences(
    val globalEnabled: Boolean = true,
    val defaultReminderMinutes: Int = 10,
    val perPrayerSettings: Map<PrayerName, PrayerNotificationSettings> = PrayerName.ordered.associateWith {
        PrayerNotificationSettings(prayerName = it)
    }
)
