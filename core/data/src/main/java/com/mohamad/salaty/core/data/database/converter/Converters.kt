package com.mohamad.salaty.core.data.database.converter

import androidx.room.TypeConverter
import com.mohamad.salaty.core.domain.model.PrayerName
import com.mohamad.salaty.core.domain.model.PrayerStatus
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

/**
 * Room type converters for complex types.
 * Converts between database-storable types and domain types.
 */
class Converters {

    private val dateFormatter = DateTimeFormatter.ISO_LOCAL_DATE
    private val dateTimeFormatter = DateTimeFormatter.ISO_LOCAL_DATE_TIME

    // LocalDate converters
    @TypeConverter
    fun fromLocalDate(date: LocalDate?): String? {
        return date?.format(dateFormatter)
    }

    @TypeConverter
    fun toLocalDate(dateString: String?): LocalDate? {
        return dateString?.let { LocalDate.parse(it, dateFormatter) }
    }

    // LocalDateTime converters
    @TypeConverter
    fun fromLocalDateTime(dateTime: LocalDateTime?): String? {
        return dateTime?.format(dateTimeFormatter)
    }

    @TypeConverter
    fun toLocalDateTime(dateTimeString: String?): LocalDateTime? {
        return dateTimeString?.let { LocalDateTime.parse(it, dateTimeFormatter) }
    }

    // PrayerName enum converter
    @TypeConverter
    fun fromPrayerName(prayerName: PrayerName): String {
        return prayerName.name
    }

    @TypeConverter
    fun toPrayerName(name: String): PrayerName {
        return PrayerName.valueOf(name)
    }

    // PrayerStatus enum converter
    @TypeConverter
    fun fromPrayerStatus(status: PrayerStatus): String {
        return status.name
    }

    @TypeConverter
    fun toPrayerStatus(name: String): PrayerStatus {
        return PrayerStatus.valueOf(name)
    }
}
