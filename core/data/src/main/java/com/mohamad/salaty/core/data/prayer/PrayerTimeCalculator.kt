package com.mohamad.salaty.core.data.prayer

import com.batoulapps.adhan2.CalculationMethod
import com.batoulapps.adhan2.CalculationParameters
import com.batoulapps.adhan2.Coordinates
import com.batoulapps.adhan2.HighLatitudeRule
import com.batoulapps.adhan2.Madhab
import com.batoulapps.adhan2.Prayer
import com.batoulapps.adhan2.PrayerAdjustments
import com.batoulapps.adhan2.PrayerTimes
import com.batoulapps.adhan2.data.DateComponents
import com.mohamad.salaty.core.data.preferences.UserPreferences
import com.mohamad.salaty.core.domain.model.DailyPrayerTimes
import com.mohamad.salaty.core.domain.model.PrayerName
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.ZoneId
import javax.inject.Inject
import javax.inject.Singleton
import kotlin.time.ExperimentalTime
import com.mohamad.salaty.core.domain.model.CalculationMethod as DomainCalculationMethod
import com.mohamad.salaty.core.domain.model.Madhab as DomainMadhab

/**
 * Calculator for Islamic prayer times using the Adhan library.
 */
@Singleton
@OptIn(ExperimentalTime::class)
class PrayerTimeCalculator @Inject constructor() {

    /**
     * Calculate prayer times for a specific date and location.
     */
    fun calculatePrayerTimes(
        latitude: Double,
        longitude: Double,
        date: LocalDate,
        timezone: String,
        preferences: UserPreferences
    ): DailyPrayerTimes {
        val coordinates = Coordinates(latitude, longitude)
        val dateComponents = DateComponents(date.year, date.monthValue, date.dayOfMonth)
        val parameters = buildCalculationParameters(preferences)
        val zone = ZoneId.of(timezone)

        val prayerTimes = PrayerTimes(coordinates, dateComponents, parameters)

        return DailyPrayerTimes(
            date = date,
            fajr = prayerTimes.fajr.toJavaLocalDateTime(zone),
            sunrise = prayerTimes.sunrise.toJavaLocalDateTime(zone),
            dhuhr = prayerTimes.dhuhr.toJavaLocalDateTime(zone),
            asr = prayerTimes.asr.toJavaLocalDateTime(zone),
            maghrib = prayerTimes.maghrib.toJavaLocalDateTime(zone),
            isha = prayerTimes.isha.toJavaLocalDateTime(zone)
        )
    }

    /**
     * Get the current prayer and next prayer based on time.
     */
    fun getCurrentAndNextPrayer(
        latitude: Double,
        longitude: Double,
        timezone: String,
        preferences: UserPreferences,
        currentTime: LocalDateTime = LocalDateTime.now()
    ): Pair<PrayerName?, PrayerName?> {
        val coordinates = Coordinates(latitude, longitude)
        val date = currentTime.toLocalDate()
        val dateComponents = DateComponents(date.year, date.monthValue, date.dayOfMonth)
        val parameters = buildCalculationParameters(preferences)
        val zone = ZoneId.of(timezone)

        val prayerTimes = PrayerTimes(coordinates, dateComponents, parameters)
        val kotlinInstant = currentTime.atZone(zone).toInstant().toKotlinInstant()

        val currentPrayer = prayerTimes.currentPrayer(kotlinInstant)
        val nextPrayer = prayerTimes.nextPrayer(kotlinInstant)

        return Pair(
            currentPrayer?.toDomainPrayer(),
            nextPrayer?.toDomainPrayer()
        )
    }

    /**
     * Get time remaining until the next prayer.
     */
    fun getTimeUntilNextPrayer(
        latitude: Double,
        longitude: Double,
        timezone: String,
        preferences: UserPreferences,
        currentTime: LocalDateTime = LocalDateTime.now()
    ): Long? {
        val coordinates = Coordinates(latitude, longitude)
        val date = currentTime.toLocalDate()
        val dateComponents = DateComponents(date.year, date.monthValue, date.dayOfMonth)
        val parameters = buildCalculationParameters(preferences)
        val zone = ZoneId.of(timezone)

        val prayerTimes = PrayerTimes(coordinates, dateComponents, parameters)
        val javaInstant = currentTime.atZone(zone).toInstant()
        val kotlinInstant = javaInstant.toKotlinInstant()
        val nextPrayer = prayerTimes.nextPrayer(kotlinInstant)

        return nextPrayer?.let { prayer ->
            val nextTime = prayerTimes.timeForPrayer(prayer)
            nextTime?.let {
                val nextTimeMillis = it.toEpochMilliseconds()
                val currentMillis = javaInstant.toEpochMilli()
                (nextTimeMillis - currentMillis) / 1000 // seconds
            }
        }
    }

    private fun buildCalculationParameters(preferences: UserPreferences): CalculationParameters {
        val method = when (preferences.calculationMethod) {
            DomainCalculationMethod.MUSLIM_WORLD_LEAGUE -> CalculationMethod.MUSLIM_WORLD_LEAGUE
            DomainCalculationMethod.EGYPTIAN -> CalculationMethod.EGYPTIAN
            DomainCalculationMethod.KARACHI -> CalculationMethod.KARACHI
            DomainCalculationMethod.UMM_AL_QURA -> CalculationMethod.UMM_AL_QURA
            DomainCalculationMethod.DUBAI -> CalculationMethod.DUBAI
            DomainCalculationMethod.MOONSIGHTING_COMMITTEE -> CalculationMethod.MOON_SIGHTING_COMMITTEE
            DomainCalculationMethod.NORTH_AMERICA -> CalculationMethod.NORTH_AMERICA
            DomainCalculationMethod.KUWAIT -> CalculationMethod.KUWAIT
            DomainCalculationMethod.QATAR -> CalculationMethod.QATAR
            DomainCalculationMethod.SINGAPORE -> CalculationMethod.SINGAPORE
            DomainCalculationMethod.TURKEY -> CalculationMethod.TURKEY
            // TEHRAN is not in Adhan2, use MWL as fallback
            DomainCalculationMethod.TEHRAN -> CalculationMethod.MUSLIM_WORLD_LEAGUE
        }

        val adjustments = PrayerAdjustments(
            fajr = preferences.fajrAdjustment,
            sunrise = preferences.sunriseAdjustment,
            dhuhr = preferences.dhuhrAdjustment,
            asr = preferences.asrAdjustment,
            maghrib = preferences.maghribAdjustment,
            isha = preferences.ishaAdjustment
        )

        return method.parameters.copy(
            madhab = when (preferences.madhab) {
                DomainMadhab.SHAFI -> Madhab.SHAFI
                DomainMadhab.HANAFI -> Madhab.HANAFI
            },
            highLatitudeRule = when (preferences.highLatitudeRule) {
                "middle_of_the_night" -> HighLatitudeRule.MIDDLE_OF_THE_NIGHT
                "seventh_of_the_night" -> HighLatitudeRule.SEVENTH_OF_THE_NIGHT
                "twilight_angle" -> HighLatitudeRule.TWILIGHT_ANGLE
                else -> HighLatitudeRule.MIDDLE_OF_THE_NIGHT
            },
            prayerAdjustments = adjustments
        )
    }

    private fun Prayer.toDomainPrayer(): PrayerName? = when (this) {
        Prayer.FAJR -> PrayerName.FAJR
        Prayer.SUNRISE -> PrayerName.SUNRISE
        Prayer.DHUHR -> PrayerName.DHUHR
        Prayer.ASR -> PrayerName.ASR
        Prayer.MAGHRIB -> PrayerName.MAGHRIB
        Prayer.ISHA -> PrayerName.ISHA
        Prayer.NONE -> null
    }

    private fun kotlin.time.Instant.toJavaLocalDateTime(zone: ZoneId): LocalDateTime {
        val javaInstant = java.time.Instant.ofEpochMilli(this.toEpochMilliseconds())
        return LocalDateTime.ofInstant(javaInstant, zone)
    }

    private fun java.time.Instant.toKotlinInstant(): kotlin.time.Instant {
        return kotlin.time.Instant.fromEpochMilliseconds(this.toEpochMilli())
    }
}
