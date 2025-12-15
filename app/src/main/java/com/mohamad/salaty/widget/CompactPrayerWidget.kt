package com.mohamad.salaty.widget

import android.content.Context
import androidx.compose.runtime.Composable
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.glance.GlanceId
import androidx.glance.GlanceModifier
import androidx.glance.GlanceTheme
import androidx.glance.action.actionStartActivity
import androidx.glance.action.clickable
import androidx.glance.appwidget.GlanceAppWidget
import androidx.glance.appwidget.GlanceAppWidgetReceiver
import androidx.glance.appwidget.provideContent
import androidx.glance.background
import androidx.glance.layout.Alignment
import androidx.glance.layout.Column
import androidx.glance.layout.Row
import androidx.glance.layout.Spacer
import androidx.glance.layout.fillMaxSize
import androidx.glance.layout.fillMaxWidth
import androidx.glance.layout.height
import androidx.glance.layout.padding
import androidx.glance.layout.width
import androidx.glance.text.FontWeight
import androidx.glance.text.Text
import androidx.glance.text.TextStyle
import com.mohamad.salaty.MainActivity
import com.mohamad.salaty.core.domain.model.PrayerName
import dagger.hilt.android.EntryPointAccessors
import kotlinx.coroutines.flow.first
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter
import java.time.temporal.ChronoUnit

/**
 * Compact Prayer Widget (2x1)
 *
 * Shows the next prayer name, time, and countdown.
 */
class CompactPrayerWidget : GlanceAppWidget() {

    override suspend fun provideGlance(context: Context, id: GlanceId) {
        val widgetData = getWidgetData(context)

        provideContent {
            GlanceTheme {
                CompactWidgetContent(widgetData)
            }
        }
    }

    private suspend fun getWidgetData(context: Context): WidgetData {
        return try {
            val entryPoint = EntryPointAccessors.fromApplication(
                context.applicationContext,
                WidgetEntryPoint::class.java
            )

            val locationDao = entryPoint.locationDao()
            val calculator = entryPoint.prayerTimeCalculator()
            val preferences = entryPoint.salatyPreferences()

            // Get user preferences
            val prefs = preferences.userPreferences.first()
            val locationId = prefs.selectedLocationId

            // Get location
            val location = if (locationId != null) {
                locationDao.getLocationById(locationId)
            } else {
                locationDao.getDefaultLocation()
            }

            if (location == null) {
                return WidgetData.NoLocation
            }

            // Calculate prayer times
            val today = LocalDate.now()
            val prayerTimes = calculator.calculatePrayerTimes(
                latitude = location.latitude,
                longitude = location.longitude,
                date = today,
                timezone = location.timezone,
                preferences = prefs
            )

            // Find next prayer
            val now = LocalDateTime.now()
            val nextPrayer = findNextPrayer(prayerTimes, now)

            if (nextPrayer != null) {
                val minutesUntil = ChronoUnit.MINUTES.between(now, nextPrayer.second)
                WidgetData.Success(
                    prayerName = nextPrayer.first,
                    prayerTime = nextPrayer.second,
                    minutesUntil = minutesUntil
                )
            } else {
                // All prayers passed, get first prayer for tomorrow
                val tomorrowPrayers = calculator.calculatePrayerTimes(
                    latitude = location.latitude,
                    longitude = location.longitude,
                    date = today.plusDays(1),
                    timezone = location.timezone,
                    preferences = prefs
                )
                val fajrTomorrow = PrayerName.FAJR to tomorrowPrayers.fajr
                val minutesUntil = ChronoUnit.MINUTES.between(now, fajrTomorrow.second)

                WidgetData.Success(
                    prayerName = fajrTomorrow.first,
                    prayerTime = fajrTomorrow.second,
                    minutesUntil = minutesUntil
                )
            }
        } catch (e: Exception) {
            WidgetData.Error(e.message ?: "Error loading prayer times")
        }
    }

    private fun findNextPrayer(
        times: com.mohamad.salaty.core.domain.model.DailyPrayerTimes,
        now: LocalDateTime
    ): Pair<PrayerName, LocalDateTime>? {
        val prayers = listOf(
            PrayerName.FAJR to times.fajr,
            PrayerName.SUNRISE to times.sunrise,
            PrayerName.DHUHR to times.dhuhr,
            PrayerName.ASR to times.asr,
            PrayerName.MAGHRIB to times.maghrib,
            PrayerName.ISHA to times.isha
        )

        return prayers.firstOrNull { it.second.isAfter(now) }
    }
}

sealed class WidgetData {
    data class Success(
        val prayerName: PrayerName,
        val prayerTime: LocalDateTime,
        val minutesUntil: Long
    ) : WidgetData()

    data object NoLocation : WidgetData()
    data class Error(val message: String) : WidgetData()
}

@Composable
private fun CompactWidgetContent(data: WidgetData) {
    Column(
        modifier = GlanceModifier
            .fillMaxSize()
            .background(GlanceTheme.colors.widgetBackground)
            .clickable(actionStartActivity<MainActivity>())
            .padding(12.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        when (data) {
            is WidgetData.Success -> {
                Row(
                    modifier = GlanceModifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(modifier = GlanceModifier.defaultWeight()) {
                        Text(
                            text = data.prayerName.displayName,
                            style = TextStyle(
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Medium,
                                color = GlanceTheme.colors.onSurface
                            )
                        )
                        Spacer(modifier = GlanceModifier.height(2.dp))
                        Text(
                            text = data.prayerTime.format(DateTimeFormatter.ofPattern("h:mm a")),
                            style = TextStyle(
                                fontSize = 20.sp,
                                fontWeight = FontWeight.Bold,
                                color = GlanceTheme.colors.primary
                            )
                        )
                    }

                    Spacer(modifier = GlanceModifier.width(8.dp))

                    Column(horizontalAlignment = Alignment.End) {
                        Text(
                            text = formatCountdown(data.minutesUntil),
                            style = TextStyle(
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Medium,
                                color = GlanceTheme.colors.secondary
                            )
                        )
                    }
                }
            }
            is WidgetData.NoLocation -> {
                Text(
                    text = "Set location in app",
                    style = TextStyle(
                        fontSize = 12.sp,
                        color = GlanceTheme.colors.onSurface
                    )
                )
            }
            is WidgetData.Error -> {
                Text(
                    text = "Tap to refresh",
                    style = TextStyle(
                        fontSize = 12.sp,
                        color = GlanceTheme.colors.error
                    )
                )
            }
        }
    }
}

private val PrayerName.displayName: String
    get() = when (this) {
        PrayerName.FAJR -> "Fajr"
        PrayerName.SUNRISE -> "Sunrise"
        PrayerName.DHUHR -> "Dhuhr"
        PrayerName.ASR -> "Asr"
        PrayerName.MAGHRIB -> "Maghrib"
        PrayerName.ISHA -> "Isha"
    }

private fun formatCountdown(minutes: Long): String {
    return when {
        minutes < 1 -> "Now"
        minutes < 60 -> "${minutes}m"
        else -> {
            val hours = minutes / 60
            val mins = minutes % 60
            if (mins > 0) "${hours}h ${mins}m" else "${hours}h"
        }
    }
}

/**
 * Receiver for Compact Prayer Widget.
 */
class CompactPrayerWidgetReceiver : GlanceAppWidgetReceiver() {
    override val glanceAppWidget: GlanceAppWidget = CompactPrayerWidget()
}
