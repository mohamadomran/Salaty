package com.mohamad.salaty.core.data.preferences

import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.intPreferencesKey
import androidx.datastore.preferences.core.longPreferencesKey
import androidx.datastore.preferences.core.stringPreferencesKey

/**
 * Keys for DataStore preferences.
 */
object PreferencesKeys {
    // Location
    val SELECTED_LOCATION_ID = longPreferencesKey("selected_location_id")

    // Calculation settings
    val CALCULATION_METHOD = stringPreferencesKey("calculation_method")
    val MADHAB = stringPreferencesKey("madhab")
    val HIGH_LATITUDE_RULE = stringPreferencesKey("high_latitude_rule")

    // Manual adjustments (in minutes)
    val FAJR_ADJUSTMENT = intPreferencesKey("fajr_adjustment")
    val SUNRISE_ADJUSTMENT = intPreferencesKey("sunrise_adjustment")
    val DHUHR_ADJUSTMENT = intPreferencesKey("dhuhr_adjustment")
    val ASR_ADJUSTMENT = intPreferencesKey("asr_adjustment")
    val MAGHRIB_ADJUSTMENT = intPreferencesKey("maghrib_adjustment")
    val ISHA_ADJUSTMENT = intPreferencesKey("isha_adjustment")

    // Notifications
    val NOTIFICATIONS_ENABLED = booleanPreferencesKey("notifications_enabled")
    val FAJR_NOTIFICATION_ENABLED = booleanPreferencesKey("fajr_notification_enabled")
    val SUNRISE_NOTIFICATION_ENABLED = booleanPreferencesKey("sunrise_notification_enabled")
    val DHUHR_NOTIFICATION_ENABLED = booleanPreferencesKey("dhuhr_notification_enabled")
    val ASR_NOTIFICATION_ENABLED = booleanPreferencesKey("asr_notification_enabled")
    val MAGHRIB_NOTIFICATION_ENABLED = booleanPreferencesKey("maghrib_notification_enabled")
    val ISHA_NOTIFICATION_ENABLED = booleanPreferencesKey("isha_notification_enabled")
    val NOTIFICATION_MINUTES_BEFORE = intPreferencesKey("notification_minutes_before")
    val NOTIFICATION_SOUND = stringPreferencesKey("notification_sound")
    val NOTIFICATION_VIBRATE = booleanPreferencesKey("notification_vibrate")

    // Appearance
    val THEME_MODE = stringPreferencesKey("theme_mode") // "system", "light", "dark"
    val DYNAMIC_COLORS = booleanPreferencesKey("dynamic_colors")
    val LANGUAGE = stringPreferencesKey("language")
    val TIME_FORMAT_24H = booleanPreferencesKey("time_format_24h")

    // App state
    val ONBOARDING_COMPLETED = booleanPreferencesKey("onboarding_completed")
    val FIRST_LAUNCH_DATE = longPreferencesKey("first_launch_date")
}
