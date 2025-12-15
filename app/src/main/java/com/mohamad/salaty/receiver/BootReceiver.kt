package com.mohamad.salaty.receiver

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import com.mohamad.salaty.core.data.notification.PrayerNotificationScheduler
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch
import timber.log.Timber
import javax.inject.Inject

/**
 * BroadcastReceiver that reschedules prayer notifications after device boot.
 *
 * WorkManager persists scheduled work across reboots, but this receiver ensures
 * notifications are re-calculated with the latest prayer times.
 */
@AndroidEntryPoint
class BootReceiver : BroadcastReceiver() {

    @Inject
    lateinit var notificationScheduler: PrayerNotificationScheduler

    private val receiverScope = CoroutineScope(SupervisorJob() + Dispatchers.IO)

    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == Intent.ACTION_BOOT_COMPLETED) {
            Timber.d("Boot completed, rescheduling prayer notifications")

            val pendingResult = goAsync()

            receiverScope.launch {
                try {
                    notificationScheduler.rescheduleAllNotifications()
                    Timber.d("Prayer notifications rescheduled after boot")
                } catch (e: Exception) {
                    Timber.e(e, "Failed to reschedule notifications after boot")
                } finally {
                    pendingResult.finish()
                }
            }
        }
    }
}
