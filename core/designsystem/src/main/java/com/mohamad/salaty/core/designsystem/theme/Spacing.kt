package com.mohamad.salaty.core.designsystem.theme

import androidx.compose.runtime.Immutable
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp

/**
 * Salaty Spacing System
 *
 * Consistent spacing values following Material Design 3 guidelines.
 * Uses a 4dp base unit for alignment with the Material grid.
 */

@Immutable
data class SalatySpacing(
    /** 4dp - Minimal spacing */
    val extraSmall: Dp = 4.dp,

    /** 8dp - Small spacing */
    val small: Dp = 8.dp,

    /** 12dp - Medium-small spacing */
    val mediumSmall: Dp = 12.dp,

    /** 16dp - Default/Medium spacing */
    val medium: Dp = 16.dp,

    /** 20dp - Medium-large spacing */
    val mediumLarge: Dp = 20.dp,

    /** 24dp - Large spacing */
    val large: Dp = 24.dp,

    /** 32dp - Extra large spacing */
    val extraLarge: Dp = 32.dp,

    /** 40dp - Huge spacing */
    val huge: Dp = 40.dp,

    /** 48dp - Massive spacing */
    val massive: Dp = 48.dp
)

/**
 * Default spacing values
 */
val LocalSpacing = staticCompositionLocalOf { SalatySpacing() }

/**
 * Common spacing combinations
 */
object SpacingTokens {
    // Screen padding
    val ScreenHorizontalPadding = 16.dp
    val ScreenVerticalPadding = 24.dp

    // Card content padding
    val CardPadding = 16.dp
    val CardInnerSpacing = 12.dp

    // List item spacing
    val ListItemVerticalPadding = 12.dp
    val ListItemHorizontalPadding = 16.dp
    val ListItemSpacing = 8.dp

    // Section spacing
    val SectionSpacing = 24.dp
    val SectionHeaderBottomPadding = 8.dp

    // Button spacing
    val ButtonSpacing = 12.dp
    val ButtonContentPadding = 16.dp

    // Icon spacing
    val IconTextSpacing = 8.dp
    val IconSize = 24.dp
    val IconSizeSmall = 20.dp
    val IconSizeLarge = 32.dp

    // Bottom navigation
    val BottomNavHeight = 80.dp
    val BottomNavItemSpacing = 4.dp
}
