package com.mohamad.salaty.core.designsystem.theme

import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Shapes
import androidx.compose.ui.unit.dp

/**
 * Salaty Shapes - Material Design 3
 *
 * Official M3 Shape Scale from https://m3.material.io/styles/shape
 *
 * Shape categories and their use cases:
 * - Extra Small (4dp): Chips, small elements
 * - Small (8dp): Buttons, text fields
 * - Medium (12dp): Cards, dialogs
 * - Large (16dp): Large cards, FABs
 * - Extra Large (28dp): Bottom sheets, large surfaces
 */

val SalatyShapes = Shapes(
    // Extra Small - Chips, badges, small interactive elements
    extraSmall = RoundedCornerShape(4.dp),

    // Small - Buttons, text fields, small cards
    small = RoundedCornerShape(8.dp),

    // Medium - Cards, dialogs, menus
    medium = RoundedCornerShape(12.dp),

    // Large - Large cards, navigation drawers
    large = RoundedCornerShape(16.dp),

    // Extra Large - Bottom sheets, modal surfaces, FABs
    extraLarge = RoundedCornerShape(28.dp)
)

/**
 * Custom shape values for specific components
 */
object SalatyShapeTokens {
    // Prayer card - slightly larger for emphasis
    val PrayerCard = RoundedCornerShape(20.dp)

    // Status badge - pill shape
    val StatusBadge = RoundedCornerShape(50)

    // Bottom navigation indicator
    val NavigationIndicator = RoundedCornerShape(16.dp)

    // Countdown timer container
    val CountdownContainer = RoundedCornerShape(24.dp)

    // Settings section
    val SettingsSection = RoundedCornerShape(16.dp)
}
