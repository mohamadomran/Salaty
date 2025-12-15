package com.mohamad.salaty.core.data.database.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import com.mohamad.salaty.core.data.database.entity.QadaCountEntity
import com.mohamad.salaty.core.domain.model.PrayerName
import kotlinx.coroutines.flow.Flow

/**
 * Data Access Object for Qada (makeup prayer) counts.
 */
@Dao
interface QadaCountDao {

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(qadaCount: QadaCountEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(qadaCounts: List<QadaCountEntity>)

    @Update
    suspend fun update(qadaCount: QadaCountEntity)

    @Query("UPDATE qada_counts SET count = count + :delta, updatedAt = :updatedAt WHERE prayerName = :prayerName")
    suspend fun incrementCount(prayerName: PrayerName, delta: Int, updatedAt: String)

    @Query("UPDATE qada_counts SET count = CASE WHEN count - :delta < 0 THEN 0 ELSE count - :delta END, updatedAt = :updatedAt WHERE prayerName = :prayerName")
    suspend fun decrementCount(prayerName: PrayerName, delta: Int, updatedAt: String)

    @Query("UPDATE qada_counts SET count = :count, updatedAt = :updatedAt WHERE prayerName = :prayerName")
    suspend fun setCount(prayerName: PrayerName, count: Int, updatedAt: String)

    @Query("SELECT * FROM qada_counts WHERE prayerName = :prayerName")
    suspend fun getQadaCount(prayerName: PrayerName): QadaCountEntity?

    @Query("SELECT * FROM qada_counts ORDER BY prayerName")
    fun getAllQadaCounts(): Flow<List<QadaCountEntity>>

    @Query("SELECT SUM(count) FROM qada_counts")
    fun getTotalQadaCount(): Flow<Int?>

    @Query("DELETE FROM qada_counts")
    suspend fun deleteAll()
}
