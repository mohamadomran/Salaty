package com.mohamad.salaty.widget

import android.content.Context
import androidx.glance.appwidget.GlanceAppWidgetManager
import androidx.glance.appwidget.updateAll
import androidx.hilt.work.HiltWorker
import androidx.work.CoroutineWorker
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import androidx.work.WorkerParameters
import dagger.assisted.Assisted
import dagger.assisted.AssistedInject
import timber.log.Timber
import java.util.concurrent.TimeUnit

/**
 * Worker that periodically updates prayer widgets.
 *
 * Widgets are updated:
 * - Every 30 minutes via periodic work
 * - On app start
 * - When settings change
 */
@HiltWorker
class WidgetUpdateWorker @AssistedInject constructor(
    @Assisted private val context: Context,
    @Assisted workerParams: WorkerParameters
) : CoroutineWorker(context, workerParams) {

    override suspend fun doWork(): Result {
        return try {
            Timber.d("Updating prayer widgets")

            // Update all widget instances
            CompactPrayerWidget().updateAll(context)
            FullPrayerWidget().updateAll(context)

            Timber.d("Prayer widgets updated successfully")
            Result.success()
        } catch (e: Exception) {
            Timber.e(e, "Failed to update widgets")
            Result.retry()
        }
    }

    companion object {
        private const val WORK_NAME = "widget_update_worker"

        /**
         * Schedule periodic widget updates.
         */
        fun schedule(context: Context) {
            val workRequest = PeriodicWorkRequestBuilder<WidgetUpdateWorker>(
                30, TimeUnit.MINUTES
            ).build()

            WorkManager.getInstance(context).enqueueUniquePeriodicWork(
                WORK_NAME,
                ExistingPeriodicWorkPolicy.KEEP,
                workRequest
            )
            Timber.d("Widget update worker scheduled")
        }

        /**
         * Trigger immediate widget update.
         */
        suspend fun updateNow(context: Context) {
            try {
                CompactPrayerWidget().updateAll(context)
                FullPrayerWidget().updateAll(context)
            } catch (e: Exception) {
                Timber.e(e, "Failed to update widgets immediately")
            }
        }
    }
}
