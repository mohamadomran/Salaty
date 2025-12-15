package com.mohamad.salaty.widget

import com.mohamad.salaty.core.data.database.dao.LocationDao
import com.mohamad.salaty.core.data.prayer.PrayerTimeCalculator
import com.mohamad.salaty.core.data.preferences.SalatyPreferences
import dagger.hilt.EntryPoint
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent

/**
 * Hilt entry point for widget access to dependencies.
 *
 * Widgets cannot use standard Hilt injection, so we use entry points
 * to access the necessary dependencies.
 */
@EntryPoint
@InstallIn(SingletonComponent::class)
interface WidgetEntryPoint {
    fun locationDao(): LocationDao
    fun prayerTimeCalculator(): PrayerTimeCalculator
    fun salatyPreferences(): SalatyPreferences
}
