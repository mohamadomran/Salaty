package com.mohamad.salaty.core.data.database

import androidx.room.Database
import androidx.room.RoomDatabase
import androidx.room.TypeConverters
import com.mohamad.salaty.core.data.database.converter.Converters
import com.mohamad.salaty.core.data.database.dao.LocationDao
import com.mohamad.salaty.core.data.database.dao.PrayerRecordDao
import com.mohamad.salaty.core.data.database.dao.QadaCountDao
import com.mohamad.salaty.core.data.database.entity.LocationEntity
import com.mohamad.salaty.core.data.database.entity.PrayerRecordEntity
import com.mohamad.salaty.core.data.database.entity.QadaCountEntity

/**
 * Main Room database for the Salaty app.
 *
 * Contains tables for:
 * - Prayer records (daily prayer tracking)
 * - Qada counts (makeup prayer counts)
 * - Saved locations (for prayer time calculations)
 */
@Database(
    entities = [
        PrayerRecordEntity::class,
        QadaCountEntity::class,
        LocationEntity::class
    ],
    version = 1,
    exportSchema = true
)
@TypeConverters(Converters::class)
abstract class SalatyDatabase : RoomDatabase() {

    abstract fun prayerRecordDao(): PrayerRecordDao
    abstract fun qadaCountDao(): QadaCountDao
    abstract fun locationDao(): LocationDao

    companion object {
        const val DATABASE_NAME = "salaty_database"
    }
}
