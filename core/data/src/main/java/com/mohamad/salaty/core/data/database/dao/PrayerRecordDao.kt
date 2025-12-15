package com.mohamad.salaty.core.data.database.dao

import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import com.mohamad.salaty.core.data.database.entity.PrayerRecordEntity
import com.mohamad.salaty.core.domain.model.PrayerName
import com.mohamad.salaty.core.domain.model.PrayerStatus
import kotlinx.coroutines.flow.Flow
import java.time.LocalDate

/**
 * Data Access Object for prayer records.
 * All queries return Flow for reactive UI updates.
 */
@Dao
interface PrayerRecordDao {

    // Insert operations
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(record: PrayerRecordEntity): Long

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(records: List<PrayerRecordEntity>)

    // Update operations
    @Update
    suspend fun update(record: PrayerRecordEntity)

    @Query("UPDATE prayer_records SET status = :status, updatedAt = :updatedAt WHERE date = :date AND prayerName = :prayerName")
    suspend fun updateStatus(date: LocalDate, prayerName: PrayerName, status: PrayerStatus, updatedAt: String)

    // Delete operations
    @Delete
    suspend fun delete(record: PrayerRecordEntity)

    @Query("DELETE FROM prayer_records WHERE date = :date")
    suspend fun deleteByDate(date: LocalDate)

    // Query operations - Single day
    @Query("SELECT * FROM prayer_records WHERE date = :date ORDER BY prayerName")
    fun getRecordsByDate(date: LocalDate): Flow<List<PrayerRecordEntity>>

    @Query("SELECT * FROM prayer_records WHERE date = :date AND prayerName = :prayerName LIMIT 1")
    suspend fun getRecord(date: LocalDate, prayerName: PrayerName): PrayerRecordEntity?

    // Query operations - Date range
    @Query("SELECT * FROM prayer_records WHERE date BETWEEN :startDate AND :endDate ORDER BY date DESC, prayerName")
    fun getRecordsByDateRange(startDate: LocalDate, endDate: LocalDate): Flow<List<PrayerRecordEntity>>

    // Statistics queries
    @Query("SELECT COUNT(*) FROM prayer_records WHERE status = :status AND date BETWEEN :startDate AND :endDate")
    fun getCountByStatus(status: PrayerStatus, startDate: LocalDate, endDate: LocalDate): Flow<Int>

    @Query("SELECT COUNT(*) FROM prayer_records WHERE date BETWEEN :startDate AND :endDate")
    fun getTotalCount(startDate: LocalDate, endDate: LocalDate): Flow<Int>

    @Query("""
        SELECT COUNT(*) FROM prayer_records
        WHERE status = 'PRAYED' AND date BETWEEN :startDate AND :endDate
    """)
    fun getPrayedCount(startDate: LocalDate, endDate: LocalDate): Flow<Int>

    @Query("""
        SELECT COUNT(*) FROM prayer_records
        WHERE status = 'PRAYED_LATE' AND date BETWEEN :startDate AND :endDate
    """)
    fun getPrayedLateCount(startDate: LocalDate, endDate: LocalDate): Flow<Int>

    @Query("""
        SELECT COUNT(*) FROM prayer_records
        WHERE status = 'MISSED' AND date BETWEEN :startDate AND :endDate
    """)
    fun getMissedCount(startDate: LocalDate, endDate: LocalDate): Flow<Int>

    // Streak calculations
    @Query("""
        SELECT date FROM prayer_records
        WHERE status = 'PRAYED'
        GROUP BY date
        HAVING COUNT(*) = 5
        ORDER BY date DESC
    """)
    fun getPerfectDays(): Flow<List<LocalDate>>

    // Recent records for home screen
    @Query("SELECT * FROM prayer_records ORDER BY date DESC, prayerName LIMIT :limit")
    fun getRecentRecords(limit: Int = 35): Flow<List<PrayerRecordEntity>>
}
