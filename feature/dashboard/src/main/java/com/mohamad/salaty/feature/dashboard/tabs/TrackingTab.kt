package com.mohamad.salaty.feature.dashboard.tabs

import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.slideInHorizontally
import androidx.compose.animation.slideOutHorizontally
import androidx.compose.animation.togetherWith
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.KeyboardArrowLeft
import androidx.compose.material.icons.automirrored.filled.KeyboardArrowRight
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Schedule
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.mohamad.salaty.core.designsystem.component.SalatyCard
import com.mohamad.salaty.core.designsystem.component.SalatyElevatedCard
import com.mohamad.salaty.core.designsystem.localizedName
import com.mohamad.salaty.core.domain.model.PrayerName
import com.mohamad.salaty.core.domain.model.PrayerStatus
import com.mohamad.salaty.feature.dashboard.PrayerTrackingItem
import com.mohamad.salaty.feature.dashboard.R
import com.mohamad.salaty.feature.dashboard.TrackingState
import java.time.LocalDate
import java.time.format.DateTimeFormatter

@Composable
fun TrackingTab(
    state: TrackingState,
    onPreviousDay: () -> Unit,
    onNextDay: () -> Unit,
    onStatusChange: (PrayerName, PrayerStatus) -> Unit,
    modifier: Modifier = Modifier
) {
    val isToday = state.selectedDate == LocalDate.now()
    val progress = state.completionPercentage / 100f

    Column(
        modifier = modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Date Navigation
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(onClick = onPreviousDay) {
                Icon(
                    imageVector = Icons.AutoMirrored.Filled.KeyboardArrowLeft,
                    contentDescription = stringResource(R.string.tracking_previous_day),
                    tint = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }

            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text(
                    text = if (isToday) stringResource(R.string.tracking_today)
                    else state.selectedDate.format(DateTimeFormatter.ofPattern("EEEE")),
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.SemiBold,
                    color = MaterialTheme.colorScheme.onBackground
                )
                Text(
                    text = state.selectedDate.format(DateTimeFormatter.ofPattern("MMMM d, yyyy")),
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }

            IconButton(
                onClick = onNextDay,
                enabled = !isToday
            ) {
                Icon(
                    imageVector = Icons.AutoMirrored.Filled.KeyboardArrowRight,
                    contentDescription = stringResource(R.string.tracking_next_day),
                    tint = if (isToday) {
                        MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.3f)
                    } else {
                        MaterialTheme.colorScheme.onSurfaceVariant
                    }
                )
            }
        }

        // Progress Card
        SalatyElevatedCard(modifier = Modifier.fillMaxWidth()) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(20.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = stringResource(
                            if (isToday) R.string.tracking_todays_progress
                            else R.string.tracking_days_progress
                        ),
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.SemiBold
                    )
                    Text(
                        text = "${state.completionPercentage.toInt()}%",
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.primary
                    )
                }

                Spacer(modifier = Modifier.height(12.dp))

                LinearProgressIndicator(
                    progress = { progress },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(8.dp),
                    color = MaterialTheme.colorScheme.primary,
                    trackColor = MaterialTheme.colorScheme.primaryContainer,
                )

                Spacer(modifier = Modifier.height(8.dp))

                Text(
                    text = stringResource(
                        R.string.tracking_prayers_completed,
                        state.prayedCount,
                        state.totalCount
                    ),
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }

        // Prayer List with slide animation
        AnimatedContent(
            targetState = state.selectedDate to state.prayers,
            transitionSpec = {
                val direction = if (targetState.first > initialState.first) 1 else -1
                slideInHorizontally { direction * it } togetherWith
                    slideOutHorizontally { -direction * it }
            },
            label = "prayer_list_animation"
        ) { (_, prayers) ->
            SalatyCard(modifier = Modifier.fillMaxWidth()) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Text(
                        text = stringResource(R.string.tracking_prayers_section),
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.SemiBold,
                        modifier = Modifier.padding(bottom = 8.dp)
                    )

                    prayers.forEach { prayer ->
                        PrayerTrackingRow(
                            prayerName = prayer.prayerName.localizedName(),
                            status = prayer.status,
                            onStatusChange = { newStatus ->
                                onStatusChange(prayer.prayerName, newStatus)
                            }
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun PrayerTrackingRow(
    prayerName: String,
    status: PrayerStatus,
    onStatusChange: (PrayerStatus) -> Unit
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(
            text = prayerName,
            style = MaterialTheme.typography.titleMedium,
            color = MaterialTheme.colorScheme.onSurface
        )

        Row(
            horizontalArrangement = Arrangement.spacedBy(4.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Prayed (on time)
            FilterChip(
                selected = status == PrayerStatus.PRAYED,
                onClick = {
                    onStatusChange(
                        if (status == PrayerStatus.PRAYED) PrayerStatus.PENDING
                        else PrayerStatus.PRAYED
                    )
                },
                label = {
                    Text(
                        stringResource(R.string.tracking_status_done),
                        style = MaterialTheme.typography.labelSmall
                    )
                },
                leadingIcon = if (status == PrayerStatus.PRAYED) {
                    {
                        Icon(
                            imageVector = Icons.Default.Check,
                            contentDescription = null,
                            modifier = Modifier.size(14.dp)
                        )
                    }
                } else null,
                colors = FilterChipDefaults.filterChipColors(
                    selectedContainerColor = MaterialTheme.colorScheme.primaryContainer,
                    selectedLabelColor = MaterialTheme.colorScheme.onPrimaryContainer
                ),
                modifier = Modifier.height(32.dp)
            )

            // Prayed Late
            FilterChip(
                selected = status == PrayerStatus.PRAYED_LATE,
                onClick = {
                    onStatusChange(
                        if (status == PrayerStatus.PRAYED_LATE) PrayerStatus.PENDING
                        else PrayerStatus.PRAYED_LATE
                    )
                },
                label = {
                    Text(
                        stringResource(R.string.tracking_status_late),
                        style = MaterialTheme.typography.labelSmall
                    )
                },
                leadingIcon = if (status == PrayerStatus.PRAYED_LATE) {
                    {
                        Icon(
                            imageVector = Icons.Default.Schedule,
                            contentDescription = null,
                            modifier = Modifier.size(14.dp)
                        )
                    }
                } else null,
                colors = FilterChipDefaults.filterChipColors(
                    selectedContainerColor = MaterialTheme.colorScheme.tertiaryContainer,
                    selectedLabelColor = MaterialTheme.colorScheme.onTertiaryContainer
                ),
                modifier = Modifier.height(32.dp)
            )

            // Missed
            FilterChip(
                selected = status == PrayerStatus.MISSED,
                onClick = {
                    onStatusChange(
                        if (status == PrayerStatus.MISSED) PrayerStatus.PENDING
                        else PrayerStatus.MISSED
                    )
                },
                label = {
                    Text(
                        stringResource(R.string.tracking_status_miss),
                        style = MaterialTheme.typography.labelSmall
                    )
                },
                leadingIcon = if (status == PrayerStatus.MISSED) {
                    {
                        Icon(
                            imageVector = Icons.Default.Close,
                            contentDescription = null,
                            modifier = Modifier.size(14.dp)
                        )
                    }
                } else null,
                colors = FilterChipDefaults.filterChipColors(
                    selectedContainerColor = MaterialTheme.colorScheme.errorContainer,
                    selectedLabelColor = MaterialTheme.colorScheme.onErrorContainer
                ),
                modifier = Modifier.height(32.dp)
            )
        }
    }
}
