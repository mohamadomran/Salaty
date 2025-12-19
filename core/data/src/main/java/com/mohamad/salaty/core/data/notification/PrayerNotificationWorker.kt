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
 * This worker is scheduled to run at specific prayer times or as reminders before prayer.
 * It checks user preferences before showing the notification.
 *
 * Input data required:
 * - PRAYER_NAME: The name of the prayer (e.g., "FAJR")
 * - PRAYER_TIME: The formatted time string (e.g., "5:30 AM")
 * - IS_REMINDER: Whether this is a reminder (before prayer) or the actual prayer time
 * - MINUTES_BEFORE: How many minutes before prayer (only for reminders)
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
        const val KEY_IS_REMINDER = "is_reminder"
        const val KEY_MINUTES_BEFORE = "minutes_before"

        /**
         * Generate a unique work name for a prayer notification.
         * @param prayer The prayer name
         * @param isReminder Whether this is a reminder notification (before prayer time)
         */
        fun getWorkName(prayer: PrayerName, isReminder: Boolean = false): String {
            val suffix = if (isReminder) "_reminder" else ""
            return "prayer_notification_${prayer.name}$suffix"
        }
    }

    override suspend fun doWork(): Result {
        val prayerNameString = inputData.getString(KEY_PRAYER_NAME) ?: return Result.failure()
        val prayerTimeString = inputData.getString(KEY_PRAYER_TIME) ?: return Result.failure()
        val isReminder = inputData.getBoolean(KEY_IS_REMINDER, false)
        val minutesBefore = inputData.getInt(KEY_MINUTES_BEFORE, 0)

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

        // Get sound option from preferences
        val soundOption = NotificationSoundOption.fromKey(prefs.notificationSound)

        // Show the notification
        notificationHelper.showPrayerNotification(
            prayer = prayerName,
            timeString = prayerTimeString,
            vibrate = prefs.notificationVibrate,
            soundOption = soundOption,
            isReminder = isReminder,
            minutesBefore = minutesBefore
        )

        return Result.success()
    }
}
