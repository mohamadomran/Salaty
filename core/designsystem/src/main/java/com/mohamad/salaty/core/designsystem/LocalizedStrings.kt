package com.mohamad.salaty.core.designsystem

import android.content.Context
import androidx.compose.runtime.Composable
import androidx.compose.ui.res.stringResource
import com.mohamad.salaty.core.domain.model.CalculationMethod
import com.mohamad.salaty.core.domain.model.HighLatitudeRule
import com.mohamad.salaty.core.domain.model.Madhab
import com.mohamad.salaty.core.domain.model.PrayerName
import com.mohamad.salaty.core.domain.model.PrayerStatus

/**
 * Localized String Helpers
 *
 * Composable functions to get localized display names for domain enums.
 * Use these instead of the static displayName properties in domain models.
 */

// ============================================================================
// PRAYER NAMES
// ============================================================================

/**
 * Get localized display name for a prayer
 */
@Composable
fun PrayerName.localizedName(): String = stringResource(
    when (this) {
        PrayerName.FAJR -> R.string.prayer_fajr
        PrayerName.SUNRISE -> R.string.prayer_sunrise
        PrayerName.DHUHR -> R.string.prayer_dhuhr
        PrayerName.ASR -> R.string.prayer_asr
        PrayerName.MAGHRIB -> R.string.prayer_maghrib
        PrayerName.ISHA -> R.string.prayer_isha
    }
)

/**
 * Get localized display name for a prayer status
 */
@Composable
fun PrayerStatus.localizedName(): String = stringResource(
    when (this) {
        PrayerStatus.PENDING -> R.string.prayer_status_pending
        PrayerStatus.PRAYED -> R.string.prayer_status_prayed
        PrayerStatus.PRAYED_LATE -> R.string.prayer_status_prayed_late
        PrayerStatus.MISSED -> R.string.prayer_status_missed
    }
)

// ============================================================================
// CALCULATION SETTINGS
// ============================================================================

/**
 * Get localized display name for calculation method
 */
@Composable
fun CalculationMethod.localizedName(): String = stringResource(
    when (this) {
        CalculationMethod.MUSLIM_WORLD_LEAGUE -> R.string.calculation_method_mwl
        CalculationMethod.EGYPTIAN -> R.string.calculation_method_egyptian
        CalculationMethod.KARACHI -> R.string.calculation_method_karachi
        CalculationMethod.UMM_AL_QURA -> R.string.calculation_method_umm_al_qura
        CalculationMethod.DUBAI -> R.string.calculation_method_dubai
        CalculationMethod.QATAR -> R.string.calculation_method_qatar
        CalculationMethod.KUWAIT -> R.string.calculation_method_kuwait
        CalculationMethod.MOONSIGHTING_COMMITTEE -> R.string.calculation_method_moonsighting
        CalculationMethod.SINGAPORE -> R.string.calculation_method_singapore
        CalculationMethod.TURKEY -> R.string.calculation_method_turkey
        CalculationMethod.TEHRAN -> R.string.calculation_method_tehran
        CalculationMethod.NORTH_AMERICA -> R.string.calculation_method_isna
    }
)

/**
 * Get localized description for calculation method
 */
@Composable
fun CalculationMethod.localizedDescription(): String = stringResource(
    when (this) {
        CalculationMethod.MUSLIM_WORLD_LEAGUE -> R.string.calculation_method_mwl_desc
        CalculationMethod.EGYPTIAN -> R.string.calculation_method_egyptian_desc
        CalculationMethod.KARACHI -> R.string.calculation_method_karachi_desc
        CalculationMethod.UMM_AL_QURA -> R.string.calculation_method_umm_al_qura_desc
        CalculationMethod.DUBAI -> R.string.calculation_method_dubai_desc
        CalculationMethod.QATAR -> R.string.calculation_method_qatar_desc
        CalculationMethod.KUWAIT -> R.string.calculation_method_kuwait_desc
        CalculationMethod.MOONSIGHTING_COMMITTEE -> R.string.calculation_method_moonsighting_desc
        CalculationMethod.SINGAPORE -> R.string.calculation_method_singapore_desc
        CalculationMethod.TURKEY -> R.string.calculation_method_turkey_desc
        CalculationMethod.TEHRAN -> R.string.calculation_method_tehran_desc
        CalculationMethod.NORTH_AMERICA -> R.string.calculation_method_isna_desc
    }
)

/**
 * Get localized display name for madhab
 */
@Composable
fun Madhab.localizedName(): String = stringResource(
    when (this) {
        Madhab.SHAFI -> R.string.madhab_shafi
        Madhab.HANAFI -> R.string.madhab_hanafi
    }
)

/**
 * Get localized description for madhab
 */
@Composable
fun Madhab.localizedDescription(): String = stringResource(
    when (this) {
        Madhab.SHAFI -> R.string.madhab_shafi_desc
        Madhab.HANAFI -> R.string.madhab_hanafi_desc
    }
)

/**
 * Get localized display name for high latitude rule
 */
@Composable
fun HighLatitudeRule.localizedName(): String = stringResource(
    when (this) {
        HighLatitudeRule.MIDDLE_OF_THE_NIGHT -> R.string.high_lat_middle_of_night
        HighLatitudeRule.SEVENTH_OF_THE_NIGHT -> R.string.high_lat_seventh_of_night
        HighLatitudeRule.TWILIGHT_ANGLE -> R.string.high_lat_twilight_angle
    }
)

/**
 * Get localized description for high latitude rule
 */
@Composable
fun HighLatitudeRule.localizedDescription(): String = stringResource(
    when (this) {
        HighLatitudeRule.MIDDLE_OF_THE_NIGHT -> R.string.high_lat_middle_of_night_desc
        HighLatitudeRule.SEVENTH_OF_THE_NIGHT -> R.string.high_lat_seventh_of_night_desc
        HighLatitudeRule.TWILIGHT_ANGLE -> R.string.high_lat_twilight_angle_desc
    }
)

// ============================================================================
// NON-COMPOSE CONTEXT-BASED HELPERS
// ============================================================================

/**
 * Get localized display name for a prayer (for non-Compose code like Services/Workers)
 */
fun PrayerName.getLocalizedName(context: Context): String = context.getString(
    when (this) {
        PrayerName.FAJR -> R.string.prayer_fajr
        PrayerName.SUNRISE -> R.string.prayer_sunrise
        PrayerName.DHUHR -> R.string.prayer_dhuhr
        PrayerName.ASR -> R.string.prayer_asr
        PrayerName.MAGHRIB -> R.string.prayer_maghrib
        PrayerName.ISHA -> R.string.prayer_isha
    }
)
