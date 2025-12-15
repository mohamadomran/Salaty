package com.mohamad.salaty

import android.app.Application
import androidx.hilt.work.HiltWorkerFactory
import androidx.work.Configuration
import com.mohamad.salaty.core.data.notification.DailySchedulerWorker
import com.mohamad.salaty.core.data.notification.PrayerNotificationScheduler
import com.mohamad.salaty.widget.WidgetUpdateWorker
import dagger.hilt.android.HiltAndroidApp
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch
import timber.log.Timber
import javax.inject.Inject

/**
 * Salaty Application
 *
 * Main application class with Hilt dependency injection and WorkManager configuration.
 */
@HiltAndroidApp
class SalatyApplication : Application(), Configuration.Provider {

    @Inject
    lateinit var workerFactory: HiltWorkerFactory

    @Inject
    lateinit var notificationScheduler: PrayerNotificationScheduler

    private val applicationScope = CoroutineScope(SupervisorJob() + Dispatchers.Main)

    override fun onCreate() {
        super.onCreate()

        // Initialize Timber for logging
        if (BuildConfig.DEBUG) {
            Timber.plant(Timber.DebugTree())
        }

        Timber.d("Salaty Application initialized")

        // Schedule prayer notifications
        applicationScope.launch {
            try {
                notificationScheduler.scheduleNotifications()
                Timber.d("Prayer notifications scheduled")
            } catch (e: Exception) {
                Timber.e(e, "Failed to schedule prayer notifications")
            }
        }

        // Initialize daily scheduler for midnight rescheduling
        DailySchedulerWorker.initialize(this)

        // Schedule periodic widget updates
        WidgetUpdateWorker.schedule(this)
    }

    override val workManagerConfiguration: Configuration
        get() = Configuration.Builder()
            .setWorkerFactory(workerFactory)
            .build()
}
