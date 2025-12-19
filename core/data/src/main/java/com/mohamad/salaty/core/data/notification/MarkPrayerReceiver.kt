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
 * Broadcast receiver to handle prayer status actions from notifications.
 *
 * When the user taps an action button on a prayer notification,
 * this receiver marks the prayer with the appropriate status and dismisses the notification.
 */
@AndroidEntryPoint
class MarkPrayerReceiver : BroadcastReceiver() {

    @Inject
    lateinit var prayerRepository: PrayerRepository

    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.IO)

    override fun onReceive(context: Context, intent: Intent) {
        val action = intent.action ?: return
        if (action != ACTION_MARK_PRAYED && action != ACTION_MARK_MISSED) return

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

        // Determine status based on action
        val status = when (action) {
            ACTION_MARK_PRAYED -> PrayerStatus.PRAYED
            ACTION_MARK_MISSED -> PrayerStatus.MISSED
            else -> return
        }

        // Update prayer status
        scope.launch {
            prayerRepository.updatePrayerStatus(
                date = date,
                prayerName = prayerName,
                status = status
            )
        }

        // Dismiss the notification
        if (notificationId != -1) {
            NotificationManagerCompat.from(context).cancel(notificationId)
        }
    }

    companion object {
        const val ACTION_MARK_PRAYED = "com.mohamad.salaty.ACTION_MARK_PRAYED"
        const val ACTION_MARK_MISSED = "com.mohamad.salaty.ACTION_MARK_MISSED"
        const val EXTRA_PRAYER_NAME = "prayer_name"
        const val EXTRA_DATE = "date"
        const val EXTRA_NOTIFICATION_ID = "notification_id"

        /**
         * Create an intent to mark a prayer as prayed.
         */
        fun createPrayedIntent(
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

        /**
         * Create an intent to mark a prayer as missed.
         */
        fun createMissedIntent(
            context: Context,
            prayerName: PrayerName,
            date: LocalDate,
            notificationId: Int
        ): Intent {
            return Intent(context, MarkPrayerReceiver::class.java).apply {
                action = ACTION_MARK_MISSED
                putExtra(EXTRA_PRAYER_NAME, prayerName.name)
                putExtra(EXTRA_DATE, date.toString())
                putExtra(EXTRA_NOTIFICATION_ID, notificationId)
            }
        }

        /**
         * @deprecated Use createPrayedIntent instead
         */
        @Deprecated("Use createPrayedIntent instead", ReplaceWith("createPrayedIntent(context, prayerName, date, notificationId)"))
        fun createIntent(
            context: Context,
            prayerName: PrayerName,
            date: LocalDate,
            notificationId: Int
        ): Intent = createPrayedIntent(context, prayerName, date, notificationId)
    }
}
