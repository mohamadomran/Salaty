package com.mohamad.salaty.core.data.database.entity

import androidx.room.Entity
import androidx.room.PrimaryKey
import com.mohamad.salaty.core.domain.model.PrayerName
import java.time.LocalDateTime

/**
 * Entity representing Qada (makeup prayer) counts.
 * Tracks how many prayers need to be made up for each prayer type.
 */
@Entity(tableName = "qada_counts")
data class QadaCountEntity(
    @PrimaryKey
    val prayerName: PrayerName,
    val count: Int = 0,
    val updatedAt: LocalDateTime = LocalDateTime.now()
)
