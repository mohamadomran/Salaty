package com.mohamad.salaty.core.data.notification

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import com.mohamad.salaty.core.domain.model.PrayerName
import dagger.hilt.android.qualifiers.ApplicationContext
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Helper class for creating and displaying prayer notifications.
 *
 * Handles notification channel creation (required for Android 8.0+) and
 * provides methods to show prayer time notifications.
 */
@Singleton
class NotificationHelper @Inject constructor(
    @ApplicationContext private val context: Context
) {
    companion object {
        const val CHANNEL_ID_PRAYER = "prayer_notifications"
        const val CHANNEL_NAME_PRAYER = "Prayer Times"
        const val CHANNEL_DESCRIPTION_PRAYER = "Notifications for prayer times"

        const val NOTIFICATION_ID_BASE = 1000
    }

    init {
        createNotificationChannels()
    }

    /**
     * Create notification channels for Android 8.0+.
     */
    private fun createNotificationChannels() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID_PRAYER,
                CHANNEL_NAME_PRAYER,
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = CHANNEL_DESCRIPTION_PRAYER
                enableVibration(true)
                enableLights(true)
            }

            val notificationManager = context.getSystemService(NotificationManager::class.java)
            notificationManager.createNotificationChannel(channel)
        }
    }

    /**
     * Show a prayer notification.
     *
     * @param prayer The prayer name
     * @param timeString The formatted time string (e.g., "5:30 AM")
     * @param vibrate Whether to vibrate
     */
    fun showPrayerNotification(
        prayer: PrayerName,
        timeString: String,
        vibrate: Boolean = true
    ) {
        val notificationId = NOTIFICATION_ID_BASE + prayer.ordinal

        // Create intent to open app when notification is tapped
        val intent = getLaunchIntent()
        val pendingIntent = PendingIntent.getActivity(
            context,
            notificationId,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val prayerDisplayName = PrayerName.displayName(prayer)
        val prayerArabicName = PrayerName.arabicName(prayer)

        val notification = NotificationCompat.Builder(context, CHANNEL_ID_PRAYER)
            .setSmallIcon(android.R.drawable.ic_lock_idle_alarm)
            .setContentTitle("$prayerDisplayName ($prayerArabicName)")
            .setContentText("It's time for $prayerDisplayName prayer • $timeString")
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setCategory(NotificationCompat.CATEGORY_ALARM)
            .setAutoCancel(true)
            .setContentIntent(pendingIntent)
            .apply {
                if (vibrate) {
                    setVibrate(longArrayOf(0, 500, 200, 500))
                }
            }
            .build()

        try {
            NotificationManagerCompat.from(context).notify(notificationId, notification)
        } catch (e: SecurityException) {
            // Notification permission not granted
        }
    }

    /**
     * Cancel a specific prayer notification.
     */
    fun cancelPrayerNotification(prayer: PrayerName) {
        val notificationId = NOTIFICATION_ID_BASE + prayer.ordinal
        NotificationManagerCompat.from(context).cancel(notificationId)
    }

    /**
     * Cancel all prayer notifications.
     */
    fun cancelAllPrayerNotifications() {
        PrayerName.obligatory.forEach { prayer ->
            cancelPrayerNotification(prayer)
        }
    }

    /**
     * Get the launch intent for the main activity.
     */
    private fun getLaunchIntent(): Intent {
        return context.packageManager.getLaunchIntentForPackage(context.packageName)
            ?: Intent()
    }
}
