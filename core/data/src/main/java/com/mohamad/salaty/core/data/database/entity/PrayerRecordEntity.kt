package com.mohamad.salaty.core.data.database.entity

import androidx.room.Entity
import androidx.room.PrimaryKey
import com.mohamad.salaty.core.domain.model.PrayerName
import com.mohamad.salaty.core.domain.model.PrayerStatus
import java.time.LocalDate
import java.time.LocalDateTime

/**
 * Entity representing a single prayer record in the database.
 * Each row represents one prayer (e.g., Fajr on 2024-01-15).
 */
@Entity(tableName = "prayer_records")
data class PrayerRecordEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val date: LocalDate,
    val prayerName: PrayerName,
    val status: PrayerStatus,
    val prayedAt: LocalDateTime? = null,
    val notes: String? = null,
    val qadaCompleted: Boolean = false,  // Track if missed prayer was made up
    val createdAt: LocalDateTime = LocalDateTime.now(),
    val updatedAt: LocalDateTime = LocalDateTime.now()
)
