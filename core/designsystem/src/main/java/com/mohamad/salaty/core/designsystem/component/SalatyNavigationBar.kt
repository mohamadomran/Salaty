package com.mohamad.salaty.core.designsystem.component

import androidx.compose.foundation.layout.RowScope
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.dp
import com.mohamad.salaty.core.designsystem.theme.SpacingTokens

/**
 * Salaty Navigation Bar - Material Design 3
 *
 * Following M3 guidelines from https://m3.material.io/components/navigation-bar
 *
 * Features:
 * - 5 destinations maximum (Home, Tracking, Qada, Statistics, Settings)
 * - Icon + Label for each destination
 * - Active state with indicator pill
 * - Edge-to-edge support
 */

/**
 * Main navigation bar component
 */
@Composable
fun SalatyNavigationBar(
    modifier: Modifier = Modifier,
    content: @Composable RowScope.() -> Unit
) {
    NavigationBar(
        modifier = modifier
            .fillMaxWidth()
            .height(SpacingTokens.BottomNavHeight),
        containerColor = MaterialTheme.colorScheme.surfaceContainer,
        contentColor = MaterialTheme.colorScheme.onSurface,
        tonalElevation = 0.dp, // M3 uses tonal color, not shadow
        windowInsets = WindowInsets(0, 0, 0, 0), // Handle insets in scaffold
        content = content
    )
}

/**
 * Navigation bar item with M3 styling
 */
@Composable
fun RowScope.SalatyNavigationBarItem(
    selected: Boolean,
    onClick: () -> Unit,
    icon: ImageVector,
    label: String,
    modifier: Modifier = Modifier,
    selectedIcon: ImageVector = icon,
    enabled: Boolean = true,
    alwaysShowLabel: Boolean = true
) {
    NavigationBarItem(
        selected = selected,
        onClick = onClick,
        icon = {
            Icon(
                imageVector = if (selected) selectedIcon else icon,
                contentDescription = label
            )
        },
        modifier = modifier,
        enabled = enabled,
        label = if (alwaysShowLabel) {
            { Text(text = label, style = MaterialTheme.typography.labelMedium) }
        } else null,
        alwaysShowLabel = alwaysShowLabel,
        colors = NavigationBarItemDefaults.colors(
            selectedIconColor = MaterialTheme.colorScheme.onPrimaryContainer,
            selectedTextColor = MaterialTheme.colorScheme.onSurface,
            indicatorColor = MaterialTheme.colorScheme.primaryContainer,
            unselectedIconColor = MaterialTheme.colorScheme.onSurfaceVariant,
            unselectedTextColor = MaterialTheme.colorScheme.onSurfaceVariant
        )
    )
}

/**
 * Data class for navigation destinations
 */
data class NavigationDestination(
    val route: String,
    val icon: ImageVector,
    val selectedIcon: ImageVector,
    val label: String
)
