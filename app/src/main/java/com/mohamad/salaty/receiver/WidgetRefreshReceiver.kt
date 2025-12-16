package com.mohamad.salaty.receiver

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import com.mohamad.salaty.widget.WidgetUpdateWorker
import timber.log.Timber

/**
 * Broadcast receiver to trigger widget refresh.
 *
 * This allows any module to request a widget refresh by sending a broadcast
 * with action ACTION_REFRESH_WIDGETS.
 */
class WidgetRefreshReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == ACTION_REFRESH_WIDGETS) {
            Timber.d("Widget refresh broadcast received")
            WidgetUpdateWorker.scheduleImmediateUpdate(context)
        }
    }

    companion object {
        const val ACTION_REFRESH_WIDGETS = "com.mohamad.salaty.REFRESH_WIDGETS"

        /**
         * Send a broadcast to refresh widgets.
         * Can be called from any module.
         */
        fun refreshWidgets(context: Context) {
            val intent = Intent(ACTION_REFRESH_WIDGETS)
            intent.setPackage(context.packageName)
            context.sendBroadcast(intent)
        }
    }
}
