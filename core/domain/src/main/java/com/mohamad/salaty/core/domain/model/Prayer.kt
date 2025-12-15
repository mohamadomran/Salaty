package com.mohamad.salaty.core.domain.model

import java.time.LocalDate
import java.time.LocalDateTime
import java.time.LocalTime

/**
 * Prayer Domain Models
 *
 * Core domain entities for prayer times and tracking.
 */

// ============================================================================
// PRAYER NAME ENUM
// ============================================================================

/**
 * Prayer times including sunrise (not a prayer but important for calculations)
 */
enum class PrayerName {
    FAJR,
    SUNRISE,
    DHUHR,
    ASR,
    MAGHRIB,
    ISHA;

    companion object {
        /**
         * Get display name for a prayer
         */
        fun displayName(prayer: PrayerName): String = when (prayer) {
            FAJR -> "Fajr"
            SUNRISE -> "Sunrise"
            DHUHR -> "Dhuhr"
            ASR -> "Asr"
            MAGHRIB -> "Maghrib"
            ISHA -> "Isha"
        }

        /**
         * Get Arabic name for a prayer
         */
        fun arabicName(prayer: PrayerName): String = when (prayer) {
            FAJR -> "الفجر"
            SUNRISE -> "الشروق"
            DHUHR -> "الظهر"
            ASR -> "العصر"
            MAGHRIB -> "المغرب"
            ISHA -> "العشاء"
        }

        /**
         * All prayers in order (including sunrise)
         */
        val ordered = listOf(FAJR, SUNRISE, DHUHR, ASR, MAGHRIB, ISHA)

        /**
         * Only obligatory prayers (excluding sunrise)
         */
        val obligatory = listOf(FAJR, DHUHR, ASR, MAGHRIB, ISHA)
    }
}

// ============================================================================
// PRAYER STATUS
// ============================================================================

/**
 * Status of a prayer (for tracking)
 */
enum class PrayerStatus {
    /** Not yet prayed */
    PENDING,

    /** Prayed on time */
    PRAYED,

    /** Prayed after the time passed (still within valid window) */
    PRAYED_LATE,

    /** Not prayed, time has passed */
    MISSED;

    companion object {
        fun displayName(status: PrayerStatus): String = when (status) {
            PENDING -> "Pending"
            PRAYED -> "Prayed"
            PRAYED_LATE -> "Prayed Late"
            MISSED -> "Missed"
        }
    }
}

// ============================================================================
// PRAYER TIMES
// ============================================================================

/**
 * Prayer times for a specific day
 */
data class PrayerTimes(
    val date: LocalDate,
    val fajr: LocalTime,
    val sunrise: LocalTime,
    val dhuhr: LocalTime,
    val asr: LocalTime,
    val maghrib: LocalTime,
    val isha: LocalTime,
    val hijriDate: HijriDate? = null
) {
    /**
     * Get the time for a specific prayer
     */
    fun getTime(prayer: PrayerName): LocalTime = when (prayer) {
        PrayerName.FAJR -> fajr
        PrayerName.SUNRISE -> sunrise
        PrayerName.DHUHR -> dhuhr
        PrayerName.ASR -> asr
        PrayerName.MAGHRIB -> maghrib
        PrayerName.ISHA -> isha
    }

    /**
     * Get all prayer times as a map
     */
    fun toMap(): Map<PrayerName, LocalTime> = mapOf(
        PrayerName.FAJR to fajr,
        PrayerName.SUNRISE to sunrise,
        PrayerName.DHUHR to dhuhr,
        PrayerName.ASR to asr,
        PrayerName.MAGHRIB to maghrib,
        PrayerName.ISHA to isha
    )
}

/**
 * Daily prayer times with full LocalDateTime (used for calculations)
 */
data class DailyPrayerTimes(
    val date: LocalDate,
    val fajr: LocalDateTime,
    val sunrise: LocalDateTime,
    val dhuhr: LocalDateTime,
    val asr: LocalDateTime,
    val maghrib: LocalDateTime,
    val isha: LocalDateTime
) {
    /**
     * Get the time for a specific prayer
     */
    fun getTime(prayer: PrayerName): LocalDateTime = when (prayer) {
        PrayerName.FAJR -> fajr
        PrayerName.SUNRISE -> sunrise
        PrayerName.DHUHR -> dhuhr
        PrayerName.ASR -> asr
        PrayerName.MAGHRIB -> maghrib
        PrayerName.ISHA -> isha
    }

    /**
     * Convert to PrayerTimes with LocalTime only
     */
    fun toPrayerTimes(hijriDate: HijriDate? = null): PrayerTimes = PrayerTimes(
        date = date,
        fajr = fajr.toLocalTime(),
        sunrise = sunrise.toLocalTime(),
        dhuhr = dhuhr.toLocalTime(),
        asr = asr.toLocalTime(),
        maghrib = maghrib.toLocalTime(),
        isha = isha.toLocalTime(),
        hijriDate = hijriDate
    )
}

/**
 * Hijri (Islamic) date representation
 */
data class HijriDate(
    val day: Int,
    val month: Int,
    val year: Int,
    val monthName: String,
    val monthNameArabic: String
) {
    /**
     * Formatted display string
     */
    fun formatted(): String = "$day $monthName $year AH"

    /**
     * Arabic formatted display string
     */
    fun formattedArabic(): String = "$day $monthNameArabic $year هـ"
}

// ============================================================================
// PRAYER RECORD
// ============================================================================

/**
 * Record of a single prayer (status and metadata)
 */
data class PrayerRecord(
    val prayerName: PrayerName,
    val status: PrayerStatus,
    val completedAt: LocalDateTime? = null,
    val notes: String? = null,
    val wasDelayed: Boolean = false
)

/**
 * Daily prayer tracking record
 */
data class DailyPrayerRecord(
    val date: LocalDate,
    val prayers: Map<PrayerName, PrayerRecord>,
    val notes: String? = null,
    val updatedAt: LocalDateTime = LocalDateTime.now()
) {
    /**
     * Get prayed count (on time or late)
     */
    val prayedCount: Int
        get() = prayers.values.count {
            it.status == PrayerStatus.PRAYED || it.status == PrayerStatus.PRAYED_LATE
        }

    /**
     * Get completion percentage
     */
    val completionPercentage: Float
        get() = (prayedCount.toFloat() / 5f) * 100f

    /**
     * Check if all prayers are completed
     */
    val isComplete: Boolean
        get() = prayedCount == 5

    companion object {
        /**
         * Create an empty record for a date
         */
        fun empty(date: LocalDate): DailyPrayerRecord = DailyPrayerRecord(
            date = date,
            prayers = PrayerName.ordered.associateWith { prayer ->
                PrayerRecord(
                    prayerName = prayer,
                    status = PrayerStatus.PENDING
                )
            }
        )
    }
}

// ============================================================================
// NEXT PRAYER INFO
// ============================================================================

/**
 * Information about the next upcoming prayer
 */
data class NextPrayerInfo(
    val prayer: PrayerName,
    val time: LocalTime,
    val remainingTime: java.time.Duration,
    val isCurrentPrayer: Boolean = false
)
