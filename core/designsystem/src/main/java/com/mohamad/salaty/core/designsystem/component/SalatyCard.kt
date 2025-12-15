package com.mohamad.salaty.core.designsystem.component

import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ElevatedCard
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedCard
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.mohamad.salaty.core.designsystem.theme.SalatyShapeTokens

/**
 * Salaty Card Components - Material Design 3
 *
 * Following M3 guidelines from https://m3.material.io/components/cards
 *
 * Card variants:
 * - Filled (SalatyCard): Uses tonal color, no shadow
 * - Elevated (SalatyElevatedCard): Subtle shadow elevation
 * - Outlined (SalatyOutlinedCard): Border with transparent fill
 */

/**
 * Default filled card using tonal elevation (M3 style)
 *
 * Uses surfaceContainerHigh for visual hierarchy without shadows.
 */
@Composable
fun SalatyCard(
    modifier: Modifier = Modifier,
    containerColor: Color = MaterialTheme.colorScheme.surfaceContainerHigh,
    contentColor: Color = MaterialTheme.colorScheme.onSurface,
    content: @Composable ColumnScope.() -> Unit
) {
    Card(
        modifier = modifier.fillMaxWidth(),
        shape = SalatyShapeTokens.PrayerCard,
        colors = CardDefaults.cardColors(
            containerColor = containerColor,
            contentColor = contentColor
        ),
        elevation = CardDefaults.cardElevation(
            defaultElevation = 0.dp // M3 tonal elevation (no shadow)
        ),
        content = content
    )
}

/**
 * Elevated card with subtle shadow for emphasis
 */
@Composable
fun SalatyElevatedCard(
    modifier: Modifier = Modifier,
    onClick: (() -> Unit)? = null,
    containerColor: Color = MaterialTheme.colorScheme.surfaceContainerLow,
    contentColor: Color = MaterialTheme.colorScheme.onSurface,
    content: @Composable ColumnScope.() -> Unit
) {
    if (onClick != null) {
        ElevatedCard(
            onClick = onClick,
            modifier = modifier.fillMaxWidth(),
            shape = SalatyShapeTokens.PrayerCard,
            colors = CardDefaults.elevatedCardColors(
                containerColor = containerColor,
                contentColor = contentColor
            ),
            elevation = CardDefaults.elevatedCardElevation(
                defaultElevation = 1.dp,
                pressedElevation = 0.dp,
                hoveredElevation = 2.dp
            ),
            content = content
        )
    } else {
        ElevatedCard(
            modifier = modifier.fillMaxWidth(),
            shape = SalatyShapeTokens.PrayerCard,
            colors = CardDefaults.elevatedCardColors(
                containerColor = containerColor,
                contentColor = contentColor
            ),
            elevation = CardDefaults.elevatedCardElevation(
                defaultElevation = 1.dp
            ),
            content = content
        )
    }
}

/**
 * Outlined card with border for subtle separation
 */
@Composable
fun SalatyOutlinedCard(
    modifier: Modifier = Modifier,
    onClick: (() -> Unit)? = null,
    content: @Composable ColumnScope.() -> Unit
) {
    if (onClick != null) {
        OutlinedCard(
            onClick = onClick,
            modifier = modifier.fillMaxWidth(),
            shape = SalatyShapeTokens.PrayerCard,
            colors = CardDefaults.outlinedCardColors(
                containerColor = MaterialTheme.colorScheme.surface,
                contentColor = MaterialTheme.colorScheme.onSurface
            ),
            content = content
        )
    } else {
        OutlinedCard(
            modifier = modifier.fillMaxWidth(),
            shape = SalatyShapeTokens.PrayerCard,
            colors = CardDefaults.outlinedCardColors(
                containerColor = MaterialTheme.colorScheme.surface,
                contentColor = MaterialTheme.colorScheme.onSurface
            ),
            content = content
        )
    }
}

/**
 * Prayer times card with special styling
 */
@Composable
fun PrayerTimesCard(
    modifier: Modifier = Modifier,
    content: @Composable ColumnScope.() -> Unit
) {
    SalatyCard(
        modifier = modifier.padding(horizontal = 16.dp),
        containerColor = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.3f),
        content = content
    )
}
