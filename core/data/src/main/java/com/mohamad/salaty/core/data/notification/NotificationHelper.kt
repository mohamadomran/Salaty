package com.mohamad.salaty.core.data.notification

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import com.mohamad.salaty.core.designsystem.getLocalizedName
import com.mohamad.salaty.core.domain.model.PrayerName
import dagger.hilt.android.qualifiers.ApplicationContext
import java.time.LocalDate
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Supported notification sound options.
 */
enum class NotificationSoundOption(val key: String, val displayName: String) {
    DEFAULT("default", "Default"),
    SILENT("silent", "Silent");

    companion object {
        fun fromKey(key: String): NotificationSoundOption {
            return entries.find { it.key == key } ?: DEFAULT
        }
    }
}

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
        const val CHANNEL_ID_PRAYER_PREFIX = "prayer_notifications_"
        const val CHANNEL_NAME_PRAYER = "Prayer Times"
        const val CHANNEL_DESCRIPTION_PRAYER = "Notifications for prayer times"

        const val NOTIFICATION_ID_BASE = 1000

        // Channel IDs for each sound option
        fun getChannelId(soundOption: NotificationSoundOption): String {
            return "$CHANNEL_ID_PRAYER_PREFIX${soundOption.key}"
        }
    }

    init {
        createNotificationChannels()
    }

    /**
     * Create notification channels for each sound option (Android 8.0+).
     * Each sound requires a separate channel because channel settings are immutable.
     */
    private fun createNotificationChannels() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val notificationManager = context.getSystemService(NotificationManager::class.java)

            NotificationSoundOption.entries.forEach { soundOption ->
                val channelId = getChannelId(soundOption)
                val channelName = when (soundOption) {
                    NotificationSoundOption.DEFAULT -> "Prayer Times"
                    NotificationSoundOption.SILENT -> "Prayer Times (Silent)"
                }

                val channel = NotificationChannel(
                    channelId,
                    channelName,
                    NotificationManager.IMPORTANCE_HIGH
                ).apply {
                    description = CHANNEL_DESCRIPTION_PRAYER
                    enableLights(true)

                    when (soundOption) {
                        NotificationSoundOption.SILENT -> {
                            setSound(null, null)
                            enableVibration(false)
                        }
                        NotificationSoundOption.DEFAULT -> {
                            enableVibration(true)
                        }
                    }
                }

                notificationManager.createNotificationChannel(channel)
            }
        }
    }

    /**
     * Show a prayer notification.
     *
     * @param prayer The prayer name
     * @param timeString The formatted time string (e.g., "5:30 AM")
     * @param vibrate Whether to vibrate
     * @param soundOption The sound option to use (determines notification channel)
     */
    fun showPrayerNotification(
        prayer: PrayerName,
        timeString: String,
        vibrate: Boolean = true,
        soundOption: NotificationSoundOption = NotificationSoundOption.DEFAULT
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

        // Create "Mark as Prayed" action
        val markPrayedIntent = MarkPrayerReceiver.createIntent(
            context = context,
            prayerName = prayer,
            date = LocalDate.now(),
            notificationId = notificationId
        )
        val markPrayedPendingIntent = PendingIntent.getBroadcast(
            context,
            notificationId + 100, // Use different request code
            markPrayedIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val prayerDisplayName = prayer.getLocalizedName(context)
        val prayerArabicName = PrayerName.arabicName(prayer)

        // Use the appropriate channel based on sound option
        val channelId = getChannelId(soundOption)

        val notification = NotificationCompat.Builder(context, channelId)
            .setSmallIcon(android.R.drawable.ic_lock_idle_alarm)
            .setContentTitle("$prayerDisplayName ($prayerArabicName)")
            .setContentText("It's time for $prayerDisplayName prayer • $timeString")
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setCategory(NotificationCompat.CATEGORY_ALARM)
            .setAutoCancel(true)
            .setContentIntent(pendingIntent)
            .addAction(
                android.R.drawable.ic_menu_send,
                "Mark as Prayed",
                markPrayedPendingIntent
            )
            .apply {
                if (vibrate && soundOption != NotificationSoundOption.SILENT) {
                    setVibrate(longArrayOf(0, 500, 200, 500))
                }
                // For pre-Android O, set sound explicitly
                if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
                    if (soundOption == NotificationSoundOption.SILENT) {
                        setSound(null)
                    }
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
