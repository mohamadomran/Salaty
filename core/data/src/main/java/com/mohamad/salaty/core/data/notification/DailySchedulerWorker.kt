package com.mohamad.salaty.core.data.notification

import android.content.Context
import androidx.hilt.work.HiltWorker
import androidx.work.CoroutineWorker
import androidx.work.ExistingWorkPolicy
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.WorkManager
import androidx.work.WorkerParameters
import dagger.assisted.Assisted
import dagger.assisted.AssistedInject
import timber.log.Timber
import java.time.Duration
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.LocalTime
import java.util.concurrent.TimeUnit

/**
 * Worker that runs daily at midnight to schedule next day's notifications.
 *
 * This ensures notifications are always scheduled even if the app isn't opened.
 * After completing its work, it reschedules itself for the next midnight.
 */
@HiltWorker
class DailySchedulerWorker @AssistedInject constructor(
    @Assisted private val context: Context,
    @Assisted workerParams: WorkerParameters,
    private val notificationScheduler: PrayerNotificationScheduler
) : CoroutineWorker(context, workerParams) {

    override suspend fun doWork(): Result {
        return try {
            Timber.d("Daily scheduler running - scheduling tomorrow's notifications")

            // Schedule today's remaining + tomorrow's notifications
            notificationScheduler.scheduleNotifications()
            notificationScheduler.scheduleTomorrowNotifications()

            // Reschedule this worker for next midnight
            scheduleNextRun(context)

            Timber.d("Daily scheduling complete")
            Result.success()
        } catch (e: Exception) {
            Timber.e(e, "Daily scheduler failed")
            Result.retry()
        }
    }

    companion object {
        private const val WORK_NAME = "daily_scheduler_worker"

        /**
         * Schedule the daily worker to run at next midnight.
         */
        fun scheduleNextRun(context: Context) {
            val now = LocalDateTime.now()
            val nextMidnight = LocalDateTime.of(
                LocalDate.now().plusDays(1),
                LocalTime.of(0, 5) // 12:05 AM to avoid exact midnight edge cases
            )

            val delay = Duration.between(now, nextMidnight)

            val workRequest = OneTimeWorkRequestBuilder<DailySchedulerWorker>()
                .setInitialDelay(delay.toMillis(), TimeUnit.MILLISECONDS)
                .build()

            WorkManager.getInstance(context).enqueueUniqueWork(
                WORK_NAME,
                ExistingWorkPolicy.REPLACE,
                workRequest
            )

            Timber.d("Daily scheduler scheduled for $nextMidnight (${delay.toHours()}h ${delay.toMinutesPart()}m)")
        }

        /**
         * Initialize daily scheduler on app start.
         */
        fun initialize(context: Context) {
            scheduleNextRun(context)
        }
    }
}
