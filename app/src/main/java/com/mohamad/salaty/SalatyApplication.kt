package com.mohamad.salaty

import android.app.Application
import dagger.hilt.android.HiltAndroidApp
import timber.log.Timber

/**
 * Salaty Application
 *
 * Main application class with Hilt dependency injection.
 */
@HiltAndroidApp
class SalatyApplication : Application() {

    override fun onCreate() {
        super.onCreate()

        // Initialize Timber for logging
        if (BuildConfig.DEBUG) {
            Timber.plant(Timber.DebugTree())
        }

        Timber.d("Salaty Application initialized")
    }
}
