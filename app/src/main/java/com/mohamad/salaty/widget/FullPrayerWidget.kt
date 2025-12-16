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
import com.mohamad.salaty.core.domain.model.DailyPrayerTimes
import com.mohamad.salaty.core.domain.model.PrayerName
import dagger.hilt.android.EntryPointAccessors
import kotlinx.coroutines.flow.first
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

/**
 * Full Prayer Widget (4x2)
 *
 * Shows all prayer times with the next prayer highlighted.
 */
class FullPrayerWidget : GlanceAppWidget() {

    override suspend fun provideGlance(context: Context, id: GlanceId) {
        val widgetData = getFullWidgetData(context)

        provideContent {
            GlanceTheme {
                FullWidgetContent(widgetData)
            }
        }
    }

    private suspend fun getFullWidgetData(context: Context): FullWidgetData {
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
                return FullWidgetData.NoLocation
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

            val now = LocalDateTime.now()
            val nextPrayer = findNextPrayer(prayerTimes, now)

            FullWidgetData.Success(
                locationName = location.name,
                prayerTimes = prayerTimes,
                nextPrayer = nextPrayer,
                use24h = prefs.timeFormat24h
            )
        } catch (e: Exception) {
            FullWidgetData.Error(e.message ?: "Error loading prayer times")
        }
    }

    private fun findNextPrayer(
        times: DailyPrayerTimes,
        now: LocalDateTime
    ): PrayerName? {
        val prayers = listOf(
            PrayerName.FAJR to times.fajr,
            PrayerName.SUNRISE to times.sunrise,
            PrayerName.DHUHR to times.dhuhr,
            PrayerName.ASR to times.asr,
            PrayerName.MAGHRIB to times.maghrib,
            PrayerName.ISHA to times.isha
        )

        return prayers.firstOrNull { it.second.isAfter(now) }?.first
    }
}

sealed class FullWidgetData {
    data class Success(
        val locationName: String,
        val prayerTimes: DailyPrayerTimes,
        val nextPrayer: PrayerName?,
        val use24h: Boolean = false
    ) : FullWidgetData()

    data object NoLocation : FullWidgetData()
    data class Error(val message: String) : FullWidgetData()
}

@Composable
private fun FullWidgetContent(data: FullWidgetData) {
    Column(
        modifier = GlanceModifier
            .fillMaxSize()
            .background(GlanceTheme.colors.widgetBackground)
            .clickable(actionStartActivity<MainActivity>())
            .padding(12.dp)
    ) {
        when (data) {
            is FullWidgetData.Success -> {
                // Header with location
                Text(
                    text = data.locationName,
                    style = TextStyle(
                        fontSize = 12.sp,
                        color = GlanceTheme.colors.onSurfaceVariant
                    )
                )

                Spacer(modifier = GlanceModifier.height(8.dp))

                // Prayer times grid - 2 columns
                Row(modifier = GlanceModifier.fillMaxWidth()) {
                    // Left column
                    Column(modifier = GlanceModifier.defaultWeight()) {
                        PrayerTimeRow(
                            name = "Fajr",
                            time = data.prayerTimes.fajr,
                            isNext = data.nextPrayer == PrayerName.FAJR,
                            use24h = data.use24h
                        )
                        Spacer(modifier = GlanceModifier.height(4.dp))
                        PrayerTimeRow(
                            name = "Sunrise",
                            time = data.prayerTimes.sunrise,
                            isNext = data.nextPrayer == PrayerName.SUNRISE,
                            use24h = data.use24h
                        )
                        Spacer(modifier = GlanceModifier.height(4.dp))
                        PrayerTimeRow(
                            name = "Dhuhr",
                            time = data.prayerTimes.dhuhr,
                            isNext = data.nextPrayer == PrayerName.DHUHR,
                            use24h = data.use24h
                        )
                    }

                    Spacer(modifier = GlanceModifier.width(16.dp))

                    // Right column
                    Column(modifier = GlanceModifier.defaultWeight()) {
                        PrayerTimeRow(
                            name = "Asr",
                            time = data.prayerTimes.asr,
                            isNext = data.nextPrayer == PrayerName.ASR,
                            use24h = data.use24h
                        )
                        Spacer(modifier = GlanceModifier.height(4.dp))
                        PrayerTimeRow(
                            name = "Maghrib",
                            time = data.prayerTimes.maghrib,
                            isNext = data.nextPrayer == PrayerName.MAGHRIB,
                            use24h = data.use24h
                        )
                        Spacer(modifier = GlanceModifier.height(4.dp))
                        PrayerTimeRow(
                            name = "Isha",
                            time = data.prayerTimes.isha,
                            isNext = data.nextPrayer == PrayerName.ISHA,
                            use24h = data.use24h
                        )
                    }
                }
            }
            is FullWidgetData.NoLocation -> {
                Column(
                    modifier = GlanceModifier.fillMaxSize(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = "Set location in app",
                        style = TextStyle(
                            fontSize = 14.sp,
                            color = GlanceTheme.colors.onSurface
                        )
                    )
                }
            }
            is FullWidgetData.Error -> {
                Column(
                    modifier = GlanceModifier.fillMaxSize(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = "Tap to refresh",
                        style = TextStyle(
                            fontSize = 14.sp,
                            color = GlanceTheme.colors.error
                        )
                    )
                }
            }
        }
    }
}

@Composable
private fun PrayerTimeRow(
    name: String,
    time: LocalDateTime,
    isNext: Boolean,
    use24h: Boolean = false
) {
    Row(
        modifier = GlanceModifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(
            text = name,
            style = TextStyle(
                fontSize = 12.sp,
                fontWeight = if (isNext) FontWeight.Bold else FontWeight.Normal,
                color = if (isNext) GlanceTheme.colors.primary else GlanceTheme.colors.onSurface
            ),
            modifier = GlanceModifier.defaultWeight()
        )

        Text(
            text = time.format(DateTimeFormatter.ofPattern(if (use24h) "HH:mm" else "h:mm a")),
            style = TextStyle(
                fontSize = 12.sp,
                fontWeight = if (isNext) FontWeight.Bold else FontWeight.Normal,
                color = if (isNext) GlanceTheme.colors.primary else GlanceTheme.colors.onSurfaceVariant
            )
        )
    }
}

/**
 * Receiver for Full Prayer Widget.
 */
class FullPrayerWidgetReceiver : GlanceAppWidgetReceiver() {
    override val glanceAppWidget: GlanceAppWidget = FullPrayerWidget()
}
