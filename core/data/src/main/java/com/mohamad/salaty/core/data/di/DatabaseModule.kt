package com.mohamad.salaty.core.data.di

import android.content.Context
import androidx.room.Room
import com.mohamad.salaty.core.data.database.SalatyDatabase
import com.mohamad.salaty.core.data.database.dao.LocationDao
import com.mohamad.salaty.core.data.database.dao.PrayerRecordDao
import com.mohamad.salaty.core.data.database.dao.QadaCountDao
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

/**
 * Hilt module providing Room database and DAO dependencies.
 */
@Module
@InstallIn(SingletonComponent::class)
object DatabaseModule {

    @Provides
    @Singleton
    fun provideSalatyDatabase(
        @ApplicationContext context: Context
    ): SalatyDatabase {
        return Room.databaseBuilder(
            context,
            SalatyDatabase::class.java,
            SalatyDatabase.DATABASE_NAME
        )
            .fallbackToDestructiveMigration()
            .build()
    }

    @Provides
    @Singleton
    fun providePrayerRecordDao(database: SalatyDatabase): PrayerRecordDao {
        return database.prayerRecordDao()
    }

    @Provides
    @Singleton
    fun provideQadaCountDao(database: SalatyDatabase): QadaCountDao {
        return database.qadaCountDao()
    }

    @Provides
    @Singleton
    fun provideLocationDao(database: SalatyDatabase): LocationDao {
        return database.locationDao()
    }
}
