package com.mohamad.salaty.core.designsystem.theme

import android.app.Activity
import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.dynamicDarkColorScheme
import androidx.compose.material3.dynamicLightColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

/**
 * Salaty Theme - Material Design 3
 *
 * Implements the official M3 theming system from https://m3.material.io/
 *
 * Features:
 * - Dynamic Color (Material You) support on Android 12+
 * - Light and Dark theme variants
 * - Custom Islamic-themed color palette as fallback
 * - Edge-to-edge support
 */

// ============================================================================
// LIGHT COLOR SCHEME
// ============================================================================

private val LightColorScheme = lightColorScheme(
    // Primary
    primary = Teal40,
    onPrimary = Color.White,
    primaryContainer = Teal90,
    onPrimaryContainer = Teal10,

    // Secondary
    secondary = Secondary40,
    onSecondary = Color.White,
    secondaryContainer = Secondary90,
    onSecondaryContainer = Secondary10,

    // Tertiary (Gold Accent)
    tertiary = Gold40,
    onTertiary = Color.White,
    tertiaryContainer = Gold90,
    onTertiaryContainer = Gold10,

    // Error
    error = Error40,
    onError = Color.White,
    errorContainer = Error90,
    onErrorContainer = Error10,

    // Background & Surface
    background = Neutral99,
    onBackground = Neutral10,
    surface = Neutral99,
    onSurface = Neutral10,
    surfaceVariant = NeutralVariant90,
    onSurfaceVariant = NeutralVariant30,

    // Outline
    outline = NeutralVariant50,
    outlineVariant = NeutralVariant80,

    // Inverse
    inverseSurface = Neutral20,
    inverseOnSurface = Neutral95,
    inversePrimary = Teal80,

    // Surface containers (M3 Expressive)
    surfaceContainer = Neutral95,
    surfaceContainerHigh = Neutral90,
    surfaceContainerHighest = Neutral90,
    surfaceContainerLow = Neutral99,
    surfaceContainerLowest = Color.White,

    // Scrim
    scrim = Color.Black
)

// ============================================================================
// DARK COLOR SCHEME
// ============================================================================

private val DarkColorScheme = darkColorScheme(
    // Primary
    primary = Teal80,
    onPrimary = Teal20,
    primaryContainer = Teal30,
    onPrimaryContainer = Teal90,

    // Secondary
    secondary = Secondary80,
    onSecondary = Secondary20,
    secondaryContainer = Secondary30,
    onSecondaryContainer = Secondary90,

    // Tertiary (Gold Accent)
    tertiary = Gold80,
    onTertiary = Gold20,
    tertiaryContainer = Gold30,
    onTertiaryContainer = Gold90,

    // Error
    error = Error80,
    onError = Error20,
    errorContainer = Error30,
    onErrorContainer = Error90,

    // Background & Surface
    background = Neutral10,
    onBackground = Neutral90,
    surface = Neutral10,
    onSurface = Neutral90,
    surfaceVariant = NeutralVariant30,
    onSurfaceVariant = NeutralVariant80,

    // Outline
    outline = NeutralVariant60,
    outlineVariant = NeutralVariant30,

    // Inverse
    inverseSurface = Neutral90,
    inverseOnSurface = Neutral20,
    inversePrimary = Teal40,

    // Surface containers (M3 Expressive)
    surfaceContainer = Neutral20,
    surfaceContainerHigh = Neutral25,
    surfaceContainerHighest = Neutral30,
    surfaceContainerLow = Neutral10,
    surfaceContainerLowest = Neutral10,

    // Scrim
    scrim = Color.Black
)

// ============================================================================
// THEME COMPOSABLE
// ============================================================================

/**
 * Salaty Material Theme
 *
 * @param darkTheme Whether to use dark theme. Defaults to system setting.
 * @param dynamicColor Whether to use dynamic color (Material You). Defaults to true on Android 12+.
 * @param content The content to be themed.
 */
@Composable
fun SalatyTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    dynamicColor: Boolean = true,
    content: @Composable () -> Unit
) {
    val colorScheme = when {
        // Dynamic color is available on Android 12+ (API 31+)
        dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
            val context = LocalContext.current
            if (darkTheme) dynamicDarkColorScheme(context)
            else dynamicLightColorScheme(context)
        }
        // Fallback to our custom color schemes
        darkTheme -> DarkColorScheme
        else -> LightColorScheme
    }

    // Update system bars
    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as Activity).window
            // Make status bar transparent for edge-to-edge
            window.statusBarColor = Color.Transparent.toArgb()
            window.navigationBarColor = Color.Transparent.toArgb()
            // Set system bar icons color based on theme
            WindowCompat.getInsetsController(window, view).apply {
                isAppearanceLightStatusBars = !darkTheme
                isAppearanceLightNavigationBars = !darkTheme
            }
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = SalatyTypography,
        shapes = SalatyShapes,
        content = content
    )
}

// ============================================================================
// THEME MODE ENUM
// ============================================================================

/**
 * Theme mode options for settings
 */
enum class ThemeMode {
    LIGHT,
    DARK,
    SYSTEM
}
