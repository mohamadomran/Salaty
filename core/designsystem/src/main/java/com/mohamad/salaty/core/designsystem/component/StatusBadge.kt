package com.mohamad.salaty.core.designsystem.component

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AccessTime
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Schedule
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.dp
import com.mohamad.salaty.core.designsystem.theme.PrayerStatusColors
import com.mohamad.salaty.core.designsystem.theme.SalatyShapeTokens

/**
 * Prayer Status Badge - Material Design 3
 *
 * Displays the prayer status with appropriate color coding.
 * Uses M3 tonal color system for status indication.
 */

enum class PrayerStatus {
    PENDING,
    COMPLETED,
    DELAYED,
    MISSED
}

/**
 * Status badge showing prayer completion status
 */
@Composable
fun PrayerStatusBadge(
    status: PrayerStatus,
    modifier: Modifier = Modifier,
    showIcon: Boolean = true,
    showLabel: Boolean = true
) {
    val (backgroundColor, contentColor, icon, label) = when (status) {
        PrayerStatus.PENDING -> StatusBadgeData(
            backgroundColor = PrayerStatusColors.PendingContainer,
            contentColor = PrayerStatusColors.OnPendingContainer,
            icon = Icons.Default.Schedule,
            label = "Pending"
        )
        PrayerStatus.COMPLETED -> StatusBadgeData(
            backgroundColor = PrayerStatusColors.CompletedContainer,
            contentColor = PrayerStatusColors.OnCompletedContainer,
            icon = Icons.Default.Check,
            label = "Completed"
        )
        PrayerStatus.DELAYED -> StatusBadgeData(
            backgroundColor = PrayerStatusColors.DelayedContainer,
            contentColor = PrayerStatusColors.OnDelayedContainer,
            icon = Icons.Default.AccessTime,
            label = "Delayed"
        )
        PrayerStatus.MISSED -> StatusBadgeData(
            backgroundColor = PrayerStatusColors.MissedContainer,
            contentColor = PrayerStatusColors.OnMissedContainer,
            icon = Icons.Default.Close,
            label = "Missed"
        )
    }

    Surface(
        modifier = modifier,
        shape = SalatyShapeTokens.StatusBadge,
        color = backgroundColor,
        contentColor = contentColor
    ) {
        Row(
            modifier = Modifier.padding(
                horizontal = if (showLabel) 12.dp else 8.dp,
                vertical = 6.dp
            ),
            horizontalArrangement = Arrangement.spacedBy(6.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            if (showIcon) {
                Icon(
                    imageVector = icon,
                    contentDescription = label,
                    modifier = Modifier.size(16.dp)
                )
            }
            if (showLabel) {
                Text(
                    text = label,
                    style = MaterialTheme.typography.labelMedium
                )
            }
        }
    }
}

/**
 * Compact status indicator (icon only)
 */
@Composable
fun StatusIndicator(
    status: PrayerStatus,
    modifier: Modifier = Modifier
) {
    val color = when (status) {
        PrayerStatus.PENDING -> PrayerStatusColors.Pending
        PrayerStatus.COMPLETED -> PrayerStatusColors.Completed
        PrayerStatus.DELAYED -> PrayerStatusColors.Delayed
        PrayerStatus.MISSED -> PrayerStatusColors.Missed
    }

    Box(
        modifier = modifier
            .size(12.dp)
            .background(color, CircleShape)
    )
}

/**
 * Large status badge for prominent display
 */
@Composable
fun LargeStatusBadge(
    status: PrayerStatus,
    modifier: Modifier = Modifier
) {
    val (backgroundColor, contentColor, icon, label) = when (status) {
        PrayerStatus.PENDING -> StatusBadgeData(
            backgroundColor = PrayerStatusColors.PendingContainer,
            contentColor = PrayerStatusColors.OnPendingContainer,
            icon = Icons.Default.Schedule,
            label = "Pending"
        )
        PrayerStatus.COMPLETED -> StatusBadgeData(
            backgroundColor = PrayerStatusColors.CompletedContainer,
            contentColor = PrayerStatusColors.OnCompletedContainer,
            icon = Icons.Default.Check,
            label = "Completed"
        )
        PrayerStatus.DELAYED -> StatusBadgeData(
            backgroundColor = PrayerStatusColors.DelayedContainer,
            contentColor = PrayerStatusColors.OnDelayedContainer,
            icon = Icons.Default.AccessTime,
            label = "Delayed"
        )
        PrayerStatus.MISSED -> StatusBadgeData(
            backgroundColor = PrayerStatusColors.MissedContainer,
            contentColor = PrayerStatusColors.OnMissedContainer,
            icon = Icons.Default.Close,
            label = "Missed"
        )
    }

    Surface(
        modifier = modifier,
        shape = MaterialTheme.shapes.medium,
        color = backgroundColor,
        contentColor = contentColor
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 16.dp, vertical = 12.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                imageVector = icon,
                contentDescription = label,
                modifier = Modifier.size(24.dp)
            )
            Text(
                text = label,
                style = MaterialTheme.typography.titleMedium
            )
        }
    }
}

private data class StatusBadgeData(
    val backgroundColor: Color,
    val contentColor: Color,
    val icon: ImageVector,
    val label: String
)
