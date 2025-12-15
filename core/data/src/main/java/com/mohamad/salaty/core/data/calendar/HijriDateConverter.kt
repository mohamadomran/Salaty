package com.mohamad.salaty.core.data.calendar

import com.mohamad.salaty.core.domain.model.HijriDate
import java.time.LocalDate
import javax.inject.Inject
import javax.inject.Singleton
import kotlin.math.floor

/**
 * Converts Gregorian dates to Hijri (Islamic) dates.
 *
 * Uses the astronomical calculation method based on Julian Day Numbers.
 * This provides a good approximation of the Islamic calendar, though actual
 * dates may vary by 1-2 days based on moon sighting in different regions.
 */
@Singleton
class HijriDateConverter @Inject constructor() {

    companion object {
        // Hijri month names in English
        private val HIJRI_MONTHS = listOf(
            "Muharram",      // 1
            "Safar",         // 2
            "Rabi' al-Awwal",// 3
            "Rabi' al-Thani",// 4
            "Jumada al-Ula", // 5
            "Jumada al-Thani",// 6
            "Rajab",         // 7
            "Sha'ban",       // 8
            "Ramadan",       // 9
            "Shawwal",       // 10
            "Dhu al-Qi'dah", // 11
            "Dhu al-Hijjah"  // 12
        )

        // Hijri month names in Arabic
        private val HIJRI_MONTHS_ARABIC = listOf(
            "محرم",          // 1
            "صفر",           // 2
            "ربيع الأول",    // 3
            "ربيع الثاني",   // 4
            "جمادى الأولى",  // 5
            "جمادى الآخرة",  // 6
            "رجب",           // 7
            "شعبان",         // 8
            "رمضان",         // 9
            "شوال",          // 10
            "ذو القعدة",     // 11
            "ذو الحجة"       // 12
        )

        // Hijri epoch in Julian Day Number (July 16, 622 CE Julian)
        private const val HIJRI_EPOCH = 1948439.5

        // Average days in a Hijri month
        private const val HIJRI_MONTH_DAYS = 29.530588853
    }

    /**
     * Convert a Gregorian date to Hijri date.
     */
    fun toHijri(date: LocalDate): HijriDate {
        val jd = gregorianToJulian(date.year, date.monthValue, date.dayOfMonth)
        return julianToHijri(jd)
    }

    /**
     * Convert a Gregorian date to Hijri date.
     */
    fun toHijri(year: Int, month: Int, day: Int): HijriDate {
        val jd = gregorianToJulian(year, month, day)
        return julianToHijri(jd)
    }

    /**
     * Convert Gregorian date to Julian Day Number.
     */
    private fun gregorianToJulian(year: Int, month: Int, day: Int): Double {
        var y = year
        var m = month

        if (m <= 2) {
            y -= 1
            m += 12
        }

        val a = floor(y / 100.0)
        val b = 2 - a + floor(a / 4.0)

        return floor(365.25 * (y + 4716)) +
                floor(30.6001 * (m + 1)) +
                day + b - 1524.5
    }

    /**
     * Convert Julian Day Number to Hijri date.
     */
    private fun julianToHijri(jd: Double): HijriDate {
        val l = floor(jd - HIJRI_EPOCH + 0.5) + 1
        val n = floor((l - 1) / 10631.0)
        val l2 = l - 10631 * n + 354
        val j = (floor((10985 - l2) / 5316.0) * floor(50 * l2 / 17719.0) +
                floor(l2 / 5670.0) * floor(43 * l2 / 15238.0))
        val l3 = l2 - floor((30 - j) / 15.0) * floor(17719 * j / 50.0) -
                floor(j / 16.0) * floor(15238 * j / 43.0) + 29
        val month = floor(24 * l3 / 709.0).toInt()
        val day = (l3 - floor(709 * month / 24.0)).toInt()
        val year = (30 * n + j - 30).toInt()

        return HijriDate(
            day = day,
            month = month,
            year = year,
            monthName = getMonthName(month),
            monthNameArabic = getMonthNameArabic(month)
        )
    }

    /**
     * Get the English name of a Hijri month (1-12).
     */
    fun getMonthName(month: Int): String {
        return HIJRI_MONTHS.getOrElse(month - 1) { "Unknown" }
    }

    /**
     * Get the Arabic name of a Hijri month (1-12).
     */
    fun getMonthNameArabic(month: Int): String {
        return HIJRI_MONTHS_ARABIC.getOrElse(month - 1) { "غير معروف" }
    }

    /**
     * Get today's Hijri date.
     */
    fun today(): HijriDate {
        return toHijri(LocalDate.now())
    }
}
