package com.mohamad.salaty.core.data.repository

import com.mohamad.salaty.core.data.database.dao.LocationDao
import com.mohamad.salaty.core.data.database.dao.PrayerRecordDao
import com.mohamad.salaty.core.data.database.dao.QadaCountDao
import com.mohamad.salaty.core.data.database.entity.LocationEntity
import com.mohamad.salaty.core.data.database.entity.PrayerRecordEntity
import com.mohamad.salaty.core.data.database.entity.QadaCountEntity
import com.mohamad.salaty.core.data.prayer.PrayerTimeCalculator
import com.mohamad.salaty.core.data.preferences.SalatyPreferences
import com.mohamad.salaty.core.data.preferences.UserPreferences
import com.mohamad.salaty.core.domain.model.DailyPrayerTimes
import com.mohamad.salaty.core.domain.model.PrayerName
import com.mohamad.salaty.core.domain.model.PrayerStatus
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.flatMapLatest
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.flow.map
import java.time.LocalDate
import java.time.LocalDateTime
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Main repository for prayer-related data operations.
 * Coordinates between Room database, DataStore preferences, and prayer time calculations.
 */
@Singleton
class PrayerRepository @Inject constructor(
    private val prayerRecordDao: PrayerRecordDao,
    private val qadaCountDao: QadaCountDao,
    private val locationDao: LocationDao,
    private val prayerTimeCalculator: PrayerTimeCalculator,
    private val preferences: SalatyPreferences
) {

    // ============================================================================
    // PRAYER TIMES
    // ============================================================================

    /**
     * Get prayer times for today based on saved location and preferences.
     */
    suspend fun getTodayPrayerTimes(): DailyPrayerTimes? {
        val location = locationDao.getDefaultLocation() ?: return null
        val prefs = preferences.userPreferences.first()

        return prayerTimeCalculator.calculatePrayerTimes(
            latitude = location.latitude,
            longitude = location.longitude,
            date = LocalDate.now(),
            timezone = location.timezone,
            preferences = prefs
        )
    }

    /**
     * Get prayer times for a specific date.
     */
    suspend fun getPrayerTimes(date: LocalDate): DailyPrayerTimes? {
        val location = locationDao.getDefaultLocation() ?: return null
        val prefs = preferences.userPreferences.first()

        return prayerTimeCalculator.calculatePrayerTimes(
            latitude = location.latitude,
            longitude = location.longitude,
            date = date,
            timezone = location.timezone,
            preferences = prefs
        )
    }

    /**
     * Get current and next prayer.
     */
    suspend fun getCurrentAndNextPrayer(): Pair<PrayerName?, PrayerName?> {
        val location = locationDao.getDefaultLocation()
            ?: return Pair(null, null)
        val prefs = preferences.userPreferences.first()

        return prayerTimeCalculator.getCurrentAndNextPrayer(
            latitude = location.latitude,
            longitude = location.longitude,
            timezone = location.timezone,
            preferences = prefs
        )
    }

    /**
     * Get seconds until next prayer.
     */
    suspend fun getSecondsUntilNextPrayer(): Long? {
        val location = locationDao.getDefaultLocation() ?: return null
        val prefs = preferences.userPreferences.first()

        return prayerTimeCalculator.getTimeUntilNextPrayer(
            latitude = location.latitude,
            longitude = location.longitude,
            timezone = location.timezone,
            preferences = prefs
        )
    }

    // ============================================================================
    // PRAYER RECORDS
    // ============================================================================

    /**
     * Get prayer records for today.
     */
    fun getTodayRecords(): Flow<List<PrayerRecordEntity>> {
        return prayerRecordDao.getRecordsByDate(LocalDate.now())
    }

    /**
     * Get prayer records for a specific date.
     */
    fun getRecordsByDate(date: LocalDate): Flow<List<PrayerRecordEntity>> {
        return prayerRecordDao.getRecordsByDate(date)
    }

    /**
     * Get prayer records for a date range.
     */
    fun getRecordsByDateRange(startDate: LocalDate, endDate: LocalDate): Flow<List<PrayerRecordEntity>> {
        return prayerRecordDao.getRecordsByDateRange(startDate, endDate)
    }

    /**
     * Update prayer status.
     */
    suspend fun updatePrayerStatus(date: LocalDate, prayerName: PrayerName, status: PrayerStatus) {
        val existingRecord = prayerRecordDao.getRecord(date, prayerName)

        if (existingRecord != null) {
            prayerRecordDao.updateStatus(
                date = date,
                prayerName = prayerName,
                status = status,
                updatedAt = LocalDateTime.now().toString()
            )
        } else {
            prayerRecordDao.insert(
                PrayerRecordEntity(
                    date = date,
                    prayerName = prayerName,
                    status = status,
                    prayedAt = if (status == PrayerStatus.PRAYED || status == PrayerStatus.PRAYED_LATE) {
                        LocalDateTime.now()
                    } else null
                )
            )
        }
    }

    /**
     * Create records for a new day (for all obligatory prayers).
     */
    suspend fun initializeDayRecords(date: LocalDate) {
        val existingRecords = prayerRecordDao.getRecordsByDate(date).first()
        val existingPrayers = existingRecords.map { it.prayerName }.toSet()

        val newRecords = PrayerName.obligatory
            .filter { it !in existingPrayers }
            .map { prayer ->
                PrayerRecordEntity(
                    date = date,
                    prayerName = prayer,
                    status = PrayerStatus.PENDING
                )
            }

        if (newRecords.isNotEmpty()) {
            prayerRecordDao.insertAll(newRecords)
        }
    }

    // ============================================================================
    // STATISTICS
    // ============================================================================

    /**
     * Get prayed count for a date range.
     */
    fun getPrayedCount(startDate: LocalDate, endDate: LocalDate): Flow<Int> {
        return prayerRecordDao.getPrayedCount(startDate, endDate)
    }

    /**
     * Get missed count for a date range.
     */
    fun getMissedCount(startDate: LocalDate, endDate: LocalDate): Flow<Int> {
        return prayerRecordDao.getMissedCount(startDate, endDate)
    }

    /**
     * Get total prayer count for a date range.
     */
    fun getTotalCount(startDate: LocalDate, endDate: LocalDate): Flow<Int> {
        return prayerRecordDao.getTotalCount(startDate, endDate)
    }

    /**
     * Get list of perfect days (all 5 prayers prayed on time).
     */
    fun getPerfectDays(): Flow<List<LocalDate>> {
        return prayerRecordDao.getPerfectDays()
    }

    // ============================================================================
    // QADA (MAKEUP PRAYERS)
    // ============================================================================

    /**
     * Get all Qada counts.
     */
    fun getAllQadaCounts(): Flow<List<QadaCountEntity>> {
        return qadaCountDao.getAllQadaCounts()
    }

    /**
     * Get total Qada count.
     */
    fun getTotalQadaCount(): Flow<Int> {
        return qadaCountDao.getTotalQadaCount().map { it ?: 0 }
    }

    /**
     * Increment Qada count for a prayer.
     */
    suspend fun incrementQada(prayerName: PrayerName, count: Int = 1) {
        val existing = qadaCountDao.getQadaCount(prayerName)
        if (existing != null) {
            qadaCountDao.incrementCount(prayerName, count, LocalDateTime.now().toString())
        } else {
            qadaCountDao.insert(QadaCountEntity(prayerName = prayerName, count = count))
        }
    }

    /**
     * Decrement Qada count for a prayer.
     */
    suspend fun decrementQada(prayerName: PrayerName, count: Int = 1) {
        qadaCountDao.decrementCount(prayerName, count, LocalDateTime.now().toString())
    }

    /**
     * Set Qada count for a prayer.
     */
    suspend fun setQadaCount(prayerName: PrayerName, count: Int) {
        val existing = qadaCountDao.getQadaCount(prayerName)
        if (existing != null) {
            qadaCountDao.setCount(prayerName, count, LocalDateTime.now().toString())
        } else {
            qadaCountDao.insert(QadaCountEntity(prayerName = prayerName, count = count))
        }
    }

    // ============================================================================
    // LOCATIONS
    // ============================================================================

    /**
     * Get all saved locations.
     */
    fun getAllLocations(): Flow<List<LocationEntity>> {
        return locationDao.getAllLocations()
    }

    /**
     * Get default location.
     */
    fun getDefaultLocation(): Flow<LocationEntity?> {
        return locationDao.getDefaultLocationFlow()
    }

    /**
     * Save a new location.
     */
    suspend fun saveLocation(
        name: String,
        latitude: Double,
        longitude: Double,
        timezone: String,
        setAsDefault: Boolean = false
    ): Long {
        if (setAsDefault) {
            locationDao.clearDefaultLocation()
        }

        return locationDao.insert(
            LocationEntity(
                name = name,
                latitude = latitude,
                longitude = longitude,
                timezone = timezone,
                isDefault = setAsDefault
            )
        )
    }

    /**
     * Set a location as default.
     */
    suspend fun setDefaultLocation(locationId: Long) {
        locationDao.clearDefaultLocation()
        locationDao.setDefaultLocation(locationId)
    }

    /**
     * Delete a location.
     */
    suspend fun deleteLocation(locationId: Long) {
        locationDao.deleteById(locationId)
    }

    // ============================================================================
    // PREFERENCES
    // ============================================================================

    /**
     * Get user preferences flow.
     */
    val userPreferences: Flow<UserPreferences> = preferences.userPreferences
}
