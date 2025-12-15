package com.mohamad.salaty.core.data.database.dao

import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import com.mohamad.salaty.core.data.database.entity.LocationEntity
import kotlinx.coroutines.flow.Flow

/**
 * Data Access Object for saved locations.
 */
@Dao
interface LocationDao {

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(location: LocationEntity): Long

    @Update
    suspend fun update(location: LocationEntity)

    @Delete
    suspend fun delete(location: LocationEntity)

    @Query("SELECT * FROM saved_locations WHERE id = :id")
    suspend fun getLocationById(id: Long): LocationEntity?

    @Query("SELECT * FROM saved_locations WHERE isDefault = 1 LIMIT 1")
    suspend fun getDefaultLocation(): LocationEntity?

    @Query("SELECT * FROM saved_locations WHERE isDefault = 1 LIMIT 1")
    fun getDefaultLocationFlow(): Flow<LocationEntity?>

    @Query("SELECT * FROM saved_locations ORDER BY isDefault DESC, name ASC")
    fun getAllLocations(): Flow<List<LocationEntity>>

    @Query("UPDATE saved_locations SET isDefault = 0")
    suspend fun clearDefaultLocation()

    @Query("UPDATE saved_locations SET isDefault = 1 WHERE id = :id")
    suspend fun setDefaultLocation(id: Long)

    @Query("DELETE FROM saved_locations WHERE id = :id")
    suspend fun deleteById(id: Long)
}
