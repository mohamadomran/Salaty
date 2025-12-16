package com.mohamad.salaty.core.data.notification

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import androidx.core.app.NotificationManagerCompat
import com.mohamad.salaty.core.data.repository.PrayerRepository
import com.mohamad.salaty.core.domain.model.PrayerName
import com.mohamad.salaty.core.domain.model.PrayerStatus
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch
import java.time.LocalDate
import javax.inject.Inject

/**
 * Broadcast receiver to handle "Mark as Prayed" action from notifications.
 *
 * When the user taps the action button on a prayer notification,
 * this receiver marks the prayer as completed and dismisses the notification.
 */
@AndroidEntryPoint
class MarkPrayerReceiver : BroadcastReceiver() {

    @Inject
    lateinit var prayerRepository: PrayerRepository

    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.IO)

    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action != ACTION_MARK_PRAYED) return

        val prayerNameString = intent.getStringExtra(EXTRA_PRAYER_NAME) ?: return
        val dateString = intent.getStringExtra(EXTRA_DATE) ?: return
        val notificationId = intent.getIntExtra(EXTRA_NOTIFICATION_ID, -1)

        val prayerName = try {
            PrayerName.valueOf(prayerNameString)
        } catch (e: IllegalArgumentException) {
            return
        }

        val date = try {
            LocalDate.parse(dateString)
        } catch (e: Exception) {
            LocalDate.now()
        }

        // Mark prayer as completed
        scope.launch {
            prayerRepository.updatePrayerStatus(
                date = date,
                prayerName = prayerName,
                status = PrayerStatus.PRAYED
            )
        }

        // Dismiss the notification
        if (notificationId != -1) {
            NotificationManagerCompat.from(context).cancel(notificationId)
        }
    }

    companion object {
        const val ACTION_MARK_PRAYED = "com.mohamad.salaty.ACTION_MARK_PRAYED"
        const val EXTRA_PRAYER_NAME = "prayer_name"
        const val EXTRA_DATE = "date"
        const val EXTRA_NOTIFICATION_ID = "notification_id"

        /**
         * Create an intent to mark a prayer as completed.
         */
        fun createIntent(
            context: Context,
            prayerName: PrayerName,
            date: LocalDate,
            notificationId: Int
        ): Intent {
            return Intent(context, MarkPrayerReceiver::class.java).apply {
                action = ACTION_MARK_PRAYED
                putExtra(EXTRA_PRAYER_NAME, prayerName.name)
                putExtra(EXTRA_DATE, date.toString())
                putExtra(EXTRA_NOTIFICATION_ID, notificationId)
            }
        }
    }
}
