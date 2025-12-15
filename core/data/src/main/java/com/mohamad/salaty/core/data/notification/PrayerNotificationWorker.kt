package com.mohamad.salaty.core.data.notification

import android.content.Context
import androidx.hilt.work.HiltWorker
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.mohamad.salaty.core.data.preferences.SalatyPreferences
import com.mohamad.salaty.core.domain.model.PrayerName
import dagger.assisted.Assisted
import dagger.assisted.AssistedInject
import kotlinx.coroutines.flow.first

/**
 * WorkManager Worker that displays a prayer notification.
 *
 * This worker is scheduled to run at specific prayer times.
 * It checks user preferences before showing the notification.
 *
 * Input data required:
 * - PRAYER_NAME: The name of the prayer (e.g., "FAJR")
 * - PRAYER_TIME: The formatted time string (e.g., "5:30 AM")
 */
@HiltWorker
class PrayerNotificationWorker @AssistedInject constructor(
    @Assisted private val context: Context,
    @Assisted private val workerParams: WorkerParameters,
    private val notificationHelper: NotificationHelper,
    private val preferences: SalatyPreferences
) : CoroutineWorker(context, workerParams) {

    companion object {
        const val KEY_PRAYER_NAME = "prayer_name"
        const val KEY_PRAYER_TIME = "prayer_time"

        /**
         * Generate a unique work name for a prayer notification.
         */
        fun getWorkName(prayer: PrayerName): String {
            return "prayer_notification_${prayer.name}"
        }
    }

    override suspend fun doWork(): Result {
        val prayerNameString = inputData.getString(KEY_PRAYER_NAME) ?: return Result.failure()
        val prayerTimeString = inputData.getString(KEY_PRAYER_TIME) ?: return Result.failure()

        val prayerName = try {
            PrayerName.valueOf(prayerNameString)
        } catch (e: IllegalArgumentException) {
            return Result.failure()
        }

        // Check if notifications are enabled
        val prefs = preferences.userPreferences.first()
        if (!prefs.notificationsEnabled) {
            return Result.success()
        }

        // Check if this specific prayer notification is enabled
        if (!prefs.isNotificationEnabled(prayerName)) {
            return Result.success()
        }

        // Show the notification
        notificationHelper.showPrayerNotification(
            prayer = prayerName,
            timeString = prayerTimeString,
            vibrate = prefs.notificationVibrate
        )

        return Result.success()
    }
}
