package com.mohamad.salaty.core.data.preferences

import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import com.mohamad.salaty.core.domain.model.CalculationMethod
import com.mohamad.salaty.core.domain.model.Madhab
import com.mohamad.salaty.core.domain.model.PrayerName
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import javax.inject.Inject
import javax.inject.Singleton

/**
 * User preferences data class containing all app settings.
 */
data class UserPreferences(
    // Location
    val selectedLocationId: Long? = null,

    // Calculation
    val calculationMethod: CalculationMethod = CalculationMethod.MUSLIM_WORLD_LEAGUE,
    val madhab: Madhab = Madhab.SHAFI,
    val highLatitudeRule: String = "middle_of_the_night",

    // Adjustments (minutes)
    val fajrAdjustment: Int = 0,
    val sunriseAdjustment: Int = 0,
    val dhuhrAdjustment: Int = 0,
    val asrAdjustment: Int = 0,
    val maghribAdjustment: Int = 0,
    val ishaAdjustment: Int = 0,

    // Notifications
    val notificationsEnabled: Boolean = true,
    val fajrNotificationEnabled: Boolean = true,
    val sunriseNotificationEnabled: Boolean = false,
    val dhuhrNotificationEnabled: Boolean = true,
    val asrNotificationEnabled: Boolean = true,
    val maghribNotificationEnabled: Boolean = true,
    val ishaNotificationEnabled: Boolean = true,
    val notificationMinutesBefore: Int = 0,
    val notificationSound: String = "default",
    val notificationVibrate: Boolean = true,

    // Appearance
    val themeMode: String = "system",
    val dynamicColors: Boolean = true,
    val language: String = "en",
    val timeFormat24h: Boolean = false,

    // App state
    val onboardingCompleted: Boolean = false,
    val firstLaunchDate: Long? = null
) {
    fun getAdjustment(prayerName: PrayerName): Int = when (prayerName) {
        PrayerName.FAJR -> fajrAdjustment
        PrayerName.SUNRISE -> sunriseAdjustment
        PrayerName.DHUHR -> dhuhrAdjustment
        PrayerName.ASR -> asrAdjustment
        PrayerName.MAGHRIB -> maghribAdjustment
        PrayerName.ISHA -> ishaAdjustment
    }

    fun isNotificationEnabled(prayerName: PrayerName): Boolean = when (prayerName) {
        PrayerName.FAJR -> fajrNotificationEnabled
        PrayerName.SUNRISE -> sunriseNotificationEnabled
        PrayerName.DHUHR -> dhuhrNotificationEnabled
        PrayerName.ASR -> asrNotificationEnabled
        PrayerName.MAGHRIB -> maghribNotificationEnabled
        PrayerName.ISHA -> ishaNotificationEnabled
    }
}

/**
 * Repository for managing user preferences using DataStore.
 */
@Singleton
class SalatyPreferences @Inject constructor(
    private val dataStore: DataStore<Preferences>
) {

    val userPreferences: Flow<UserPreferences> = dataStore.data.map { prefs ->
        UserPreferences(
            selectedLocationId = prefs[PreferencesKeys.SELECTED_LOCATION_ID],
            calculationMethod = prefs[PreferencesKeys.CALCULATION_METHOD]?.let {
                runCatching { CalculationMethod.valueOf(it) }.getOrNull()
            } ?: CalculationMethod.MUSLIM_WORLD_LEAGUE,
            madhab = prefs[PreferencesKeys.MADHAB]?.let {
                runCatching { Madhab.valueOf(it) }.getOrNull()
            } ?: Madhab.SHAFI,
            highLatitudeRule = prefs[PreferencesKeys.HIGH_LATITUDE_RULE] ?: "middle_of_the_night",
            fajrAdjustment = prefs[PreferencesKeys.FAJR_ADJUSTMENT] ?: 0,
            sunriseAdjustment = prefs[PreferencesKeys.SUNRISE_ADJUSTMENT] ?: 0,
            dhuhrAdjustment = prefs[PreferencesKeys.DHUHR_ADJUSTMENT] ?: 0,
            asrAdjustment = prefs[PreferencesKeys.ASR_ADJUSTMENT] ?: 0,
            maghribAdjustment = prefs[PreferencesKeys.MAGHRIB_ADJUSTMENT] ?: 0,
            ishaAdjustment = prefs[PreferencesKeys.ISHA_ADJUSTMENT] ?: 0,
            notificationsEnabled = prefs[PreferencesKeys.NOTIFICATIONS_ENABLED] ?: true,
            fajrNotificationEnabled = prefs[PreferencesKeys.FAJR_NOTIFICATION_ENABLED] ?: true,
            sunriseNotificationEnabled = prefs[PreferencesKeys.SUNRISE_NOTIFICATION_ENABLED] ?: false,
            dhuhrNotificationEnabled = prefs[PreferencesKeys.DHUHR_NOTIFICATION_ENABLED] ?: true,
            asrNotificationEnabled = prefs[PreferencesKeys.ASR_NOTIFICATION_ENABLED] ?: true,
            maghribNotificationEnabled = prefs[PreferencesKeys.MAGHRIB_NOTIFICATION_ENABLED] ?: true,
            ishaNotificationEnabled = prefs[PreferencesKeys.ISHA_NOTIFICATION_ENABLED] ?: true,
            notificationMinutesBefore = prefs[PreferencesKeys.NOTIFICATION_MINUTES_BEFORE] ?: 0,
            notificationSound = prefs[PreferencesKeys.NOTIFICATION_SOUND] ?: "default",
            notificationVibrate = prefs[PreferencesKeys.NOTIFICATION_VIBRATE] ?: true,
            themeMode = prefs[PreferencesKeys.THEME_MODE] ?: "system",
            dynamicColors = prefs[PreferencesKeys.DYNAMIC_COLORS] ?: true,
            language = prefs[PreferencesKeys.LANGUAGE] ?: "en",
            timeFormat24h = prefs[PreferencesKeys.TIME_FORMAT_24H] ?: false,
            onboardingCompleted = prefs[PreferencesKeys.ONBOARDING_COMPLETED] ?: false,
            firstLaunchDate = prefs[PreferencesKeys.FIRST_LAUNCH_DATE]
        )
    }

    // Location
    suspend fun setSelectedLocation(locationId: Long) {
        dataStore.edit { prefs ->
            prefs[PreferencesKeys.SELECTED_LOCATION_ID] = locationId
        }
    }

    // Calculation settings
    suspend fun setCalculationMethod(method: CalculationMethod) {
        dataStore.edit { prefs ->
            prefs[PreferencesKeys.CALCULATION_METHOD] = method.name
        }
    }

    suspend fun setMadhab(madhab: Madhab) {
        dataStore.edit { prefs ->
            prefs[PreferencesKeys.MADHAB] = madhab.name
        }
    }

    suspend fun setHighLatitudeRule(rule: String) {
        dataStore.edit { prefs ->
            prefs[PreferencesKeys.HIGH_LATITUDE_RULE] = rule
        }
    }

    // Adjustments
    suspend fun setPrayerAdjustment(prayerName: PrayerName, minutes: Int) {
        dataStore.edit { prefs ->
            val key = when (prayerName) {
                PrayerName.FAJR -> PreferencesKeys.FAJR_ADJUSTMENT
                PrayerName.SUNRISE -> PreferencesKeys.SUNRISE_ADJUSTMENT
                PrayerName.DHUHR -> PreferencesKeys.DHUHR_ADJUSTMENT
                PrayerName.ASR -> PreferencesKeys.ASR_ADJUSTMENT
                PrayerName.MAGHRIB -> PreferencesKeys.MAGHRIB_ADJUSTMENT
                PrayerName.ISHA -> PreferencesKeys.ISHA_ADJUSTMENT
            }
            prefs[key] = minutes
        }
    }

    // Notifications
    suspend fun setNotificationsEnabled(enabled: Boolean) {
        dataStore.edit { prefs ->
            prefs[PreferencesKeys.NOTIFICATIONS_ENABLED] = enabled
        }
    }

    suspend fun setPrayerNotificationEnabled(prayerName: PrayerName, enabled: Boolean) {
        dataStore.edit { prefs ->
            val key = when (prayerName) {
                PrayerName.FAJR -> PreferencesKeys.FAJR_NOTIFICATION_ENABLED
                PrayerName.SUNRISE -> PreferencesKeys.SUNRISE_NOTIFICATION_ENABLED
                PrayerName.DHUHR -> PreferencesKeys.DHUHR_NOTIFICATION_ENABLED
                PrayerName.ASR -> PreferencesKeys.ASR_NOTIFICATION_ENABLED
                PrayerName.MAGHRIB -> PreferencesKeys.MAGHRIB_NOTIFICATION_ENABLED
                PrayerName.ISHA -> PreferencesKeys.ISHA_NOTIFICATION_ENABLED
            }
            prefs[key] = enabled
        }
    }

    suspend fun setNotificationMinutesBefore(minutes: Int) {
        dataStore.edit { prefs ->
            prefs[PreferencesKeys.NOTIFICATION_MINUTES_BEFORE] = minutes
        }
    }

    suspend fun setNotificationSound(sound: String) {
        dataStore.edit { prefs ->
            prefs[PreferencesKeys.NOTIFICATION_SOUND] = sound
        }
    }

    suspend fun setNotificationVibrate(vibrate: Boolean) {
        dataStore.edit { prefs ->
            prefs[PreferencesKeys.NOTIFICATION_VIBRATE] = vibrate
        }
    }

    // Appearance
    suspend fun setThemeMode(mode: String) {
        dataStore.edit { prefs ->
            prefs[PreferencesKeys.THEME_MODE] = mode
        }
    }

    suspend fun setDynamicColors(enabled: Boolean) {
        dataStore.edit { prefs ->
            prefs[PreferencesKeys.DYNAMIC_COLORS] = enabled
        }
    }

    suspend fun setLanguage(language: String) {
        dataStore.edit { prefs ->
            prefs[PreferencesKeys.LANGUAGE] = language
        }
    }

    suspend fun setTimeFormat24h(is24h: Boolean) {
        dataStore.edit { prefs ->
            prefs[PreferencesKeys.TIME_FORMAT_24H] = is24h
        }
    }

    // App state
    suspend fun setOnboardingCompleted(completed: Boolean) {
        dataStore.edit { prefs ->
            prefs[PreferencesKeys.ONBOARDING_COMPLETED] = completed
        }
    }

    suspend fun setFirstLaunchDate(timestamp: Long) {
        dataStore.edit { prefs ->
            prefs[PreferencesKeys.FIRST_LAUNCH_DATE] = timestamp
        }
    }
}
