package com.mohamad.salaty.core.data.database.entity

import androidx.room.Entity
import androidx.room.PrimaryKey
import java.time.LocalDateTime

/**
 * Entity representing saved locations for prayer time calculations.
 */
@Entity(tableName = "saved_locations")
data class LocationEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val name: String,
    val latitude: Double,
    val longitude: Double,
    val timezone: String,
    val isDefault: Boolean = false,
    val createdAt: LocalDateTime = LocalDateTime.now()
)
