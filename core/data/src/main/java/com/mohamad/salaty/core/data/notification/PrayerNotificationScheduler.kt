package com.mohamad.salaty.core.data.notification

import android.content.Context
import androidx.work.Data
import androidx.work.ExistingWorkPolicy
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.WorkManager
import com.mohamad.salaty.core.data.preferences.SalatyPreferences
import com.mohamad.salaty.core.data.repository.PrayerRepository
import com.mohamad.salaty.core.domain.model.DailyPrayerTimes
import com.mohamad.salaty.core.domain.model.PrayerName
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.first
import java.time.Duration
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter
import java.util.concurrent.TimeUnit
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Schedules prayer notifications using WorkManager.
 *
 * This scheduler calculates the delay for each prayer and creates OneTimeWorkRequests
 * that will fire at the appropriate times. It should be called:
 * - When the app starts
 * - When notification settings change
 * - After device boot (via BootReceiver)
 * - At midnight to schedule the next day's notifications
 */
@Singleton
class PrayerNotificationScheduler @Inject constructor(
    @ApplicationContext private val context: Context,
    private val prayerRepository: PrayerRepository,
    private val preferences: SalatyPreferences
) {
    private val workManager = WorkManager.getInstance(context)
    private val timeFormatter12h = DateTimeFormatter.ofPattern("h:mm a")
    private val timeFormatter24h = DateTimeFormatter.ofPattern("HH:mm")

    /**
     * Schedule notifications for today's remaining prayers.
     * Called when app starts or settings change.
     */
    suspend fun scheduleNotifications() {
        val prefs = preferences.userPreferences.first()

        // Check if notifications are globally enabled
        if (!prefs.notificationsEnabled) {
            cancelAllNotifications()
            return
        }

        // Get today's prayer times
        val prayerTimes = prayerRepository.getTodayPrayerTimes() ?: return

        // Schedule each prayer that hasn't passed yet
        val now = LocalDateTime.now()
        val minutesBefore = prefs.notificationMinutesBefore
        val use24h = prefs.timeFormat24h

        PrayerName.obligatory.forEach { prayer ->
            if (prefs.isNotificationEnabled(prayer)) {
                schedulePrayerNotification(
                    prayer = prayer,
                    prayerTimes = prayerTimes,
                    now = now,
                    minutesBefore = minutesBefore,
                    use24h = use24h
                )
            } else {
                cancelPrayerNotification(prayer)
            }
        }
    }

    /**
     * Schedule notification for a specific prayer.
     */
    private fun schedulePrayerNotification(
        prayer: PrayerName,
        prayerTimes: DailyPrayerTimes,
        now: LocalDateTime,
        minutesBefore: Int,
        use24h: Boolean
    ) {
        val prayerTime = prayerTimes.getTime(prayer)
        val notificationTime = prayerTime.minusMinutes(minutesBefore.toLong())

        // Skip if notification time has already passed
        if (notificationTime.isBefore(now)) {
            return
        }

        // Calculate delay until notification
        val delay = Duration.between(now, notificationTime)

        // Format the prayer time for display
        val timeString = if (use24h) {
            prayerTime.format(timeFormatter24h)
        } else {
            prayerTime.format(timeFormatter12h)
        }

        // Create input data for the worker
        val inputData = Data.Builder()
            .putString(PrayerNotificationWorker.KEY_PRAYER_NAME, prayer.name)
            .putString(PrayerNotificationWorker.KEY_PRAYER_TIME, timeString)
            .build()

        // Create the work request
        val workRequest = OneTimeWorkRequestBuilder<PrayerNotificationWorker>()
            .setInitialDelay(delay.toMillis(), TimeUnit.MILLISECONDS)
            .setInputData(inputData)
            .addTag(NOTIFICATION_WORK_TAG)
            .build()

        // Schedule the work
        workManager.enqueueUniqueWork(
            PrayerNotificationWorker.getWorkName(prayer),
            ExistingWorkPolicy.REPLACE,
            workRequest
        )
    }

    /**
     * Schedule notifications for tomorrow's prayers.
     * Should be called at midnight or late evening.
     */
    suspend fun scheduleTomorrowNotifications() {
        val prefs = preferences.userPreferences.first()

        if (!prefs.notificationsEnabled) {
            return
        }

        val tomorrow = LocalDate.now().plusDays(1)
        val tomorrowPrayerTimes = prayerRepository.getPrayerTimes(tomorrow) ?: return

        val now = LocalDateTime.now()
        val minutesBefore = prefs.notificationMinutesBefore
        val use24h = prefs.timeFormat24h

        PrayerName.obligatory.forEach { prayer ->
            if (prefs.isNotificationEnabled(prayer)) {
                schedulePrayerNotification(
                    prayer = prayer,
                    prayerTimes = tomorrowPrayerTimes,
                    now = now,
                    minutesBefore = minutesBefore,
                    use24h = use24h
                )
            }
        }
    }

    /**
     * Cancel notification for a specific prayer.
     */
    fun cancelPrayerNotification(prayer: PrayerName) {
        workManager.cancelUniqueWork(PrayerNotificationWorker.getWorkName(prayer))
    }

    /**
     * Cancel all scheduled prayer notifications.
     */
    fun cancelAllNotifications() {
        workManager.cancelAllWorkByTag(NOTIFICATION_WORK_TAG)
    }

    /**
     * Reschedule all notifications.
     * Useful after settings change or device boot.
     */
    suspend fun rescheduleAllNotifications() {
        cancelAllNotifications()
        scheduleNotifications()
    }

    companion object {
        const val NOTIFICATION_WORK_TAG = "prayer_notification"
    }
}
