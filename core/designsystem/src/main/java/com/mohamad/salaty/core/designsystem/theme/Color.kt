package com.mohamad.salaty.core.designsystem.theme

import androidx.compose.ui.graphics.Color

/**
 * Salaty Color Palette - Material Design 3
 *
 * Generated using Material Theme Builder with Teal as primary color.
 * Following official M3 color roles from https://m3.material.io/styles/color
 */

// ============================================================================
// PRIMARY COLORS - Teal (Islamic Theme)
// ============================================================================

// Light Theme
val Teal10 = Color(0xFF002020)
val Teal20 = Color(0xFF003737)
val Teal25 = Color(0xFF004545)
val Teal30 = Color(0xFF004F4F)
val Teal35 = Color(0xFF005C5C)
val Teal40 = Color(0xFF006A6A)  // Primary Light
val Teal50 = Color(0xFF008585)
val Teal60 = Color(0xFF00A1A1)
val Teal70 = Color(0xFF00BEBE)
val Teal80 = Color(0xFF4CDADA)  // Primary Dark
val Teal90 = Color(0xFF6FF7F7)
val Teal95 = Color(0xFFB2FCFC)
val Teal99 = Color(0xFFE6FFFE)

// ============================================================================
// SECONDARY COLORS - Deep Blue-Gray
// ============================================================================

val Secondary10 = Color(0xFF0D1F23)
val Secondary20 = Color(0xFF233438)
val Secondary25 = Color(0xFF2E3F43)
val Secondary30 = Color(0xFF394A4E)
val Secondary35 = Color(0xFF45565A)
val Secondary40 = Color(0xFF516266)
val Secondary50 = Color(0xFF6A7B7F)
val Secondary60 = Color(0xFF839599)
val Secondary70 = Color(0xFF9DAFB3)
val Secondary80 = Color(0xFFB8CBCF)
val Secondary90 = Color(0xFFD4E7EB)
val Secondary95 = Color(0xFFE2F5F9)
val Secondary99 = Color(0xFFF5FDFB)

// ============================================================================
// TERTIARY COLORS - Gold (Accent)
// ============================================================================

val Gold10 = Color(0xFF231B00)
val Gold20 = Color(0xFF3B2F00)
val Gold25 = Color(0xFF483900)
val Gold30 = Color(0xFF554400)
val Gold35 = Color(0xFF635000)
val Gold40 = Color(0xFF725C00)  // Tertiary Light
val Gold50 = Color(0xFF8E7400)
val Gold60 = Color(0xFFAB8D00)
val Gold70 = Color(0xFFC9A600)
val Gold80 = Color(0xFFE7C100)  // Tertiary Dark
val Gold90 = Color(0xFFFFE15E)
val Gold95 = Color(0xFFFFF0B5)
val Gold99 = Color(0xFFFFFBFF)

// ============================================================================
// NEUTRAL COLORS
// ============================================================================

val Neutral10 = Color(0xFF191C1C)
val Neutral20 = Color(0xFF2D3131)
val Neutral25 = Color(0xFF383C3C)
val Neutral30 = Color(0xFF444747)
val Neutral35 = Color(0xFF4F5353)
val Neutral40 = Color(0xFF5B5F5F)
val Neutral50 = Color(0xFF747878)
val Neutral60 = Color(0xFF8E9191)
val Neutral70 = Color(0xFFA8ACAC)
val Neutral80 = Color(0xFFC4C7C7)
val Neutral90 = Color(0xFFE0E3E3)
val Neutral95 = Color(0xFFEFF1F1)
val Neutral99 = Color(0xFFFAFDFD)

// Neutral Variant
val NeutralVariant10 = Color(0xFF141D1E)
val NeutralVariant20 = Color(0xFF293233)
val NeutralVariant25 = Color(0xFF343D3E)
val NeutralVariant30 = Color(0xFF3F4849)
val NeutralVariant35 = Color(0xFF4B5455)
val NeutralVariant40 = Color(0xFF576061)
val NeutralVariant50 = Color(0xFF6F797A)
val NeutralVariant60 = Color(0xFF899393)
val NeutralVariant70 = Color(0xFFA3ADAE)
val NeutralVariant80 = Color(0xFFBFC8C9)
val NeutralVariant90 = Color(0xFFDBE4E5)
val NeutralVariant95 = Color(0xFFE9F2F3)
val NeutralVariant99 = Color(0xFFF6FEFF)

// ============================================================================
// ERROR COLORS
// ============================================================================

val Error10 = Color(0xFF410002)
val Error20 = Color(0xFF690005)
val Error30 = Color(0xFF93000A)
val Error40 = Color(0xFFBA1A1A)
val Error80 = Color(0xFFFFB4AB)
val Error90 = Color(0xFFFFDAD6)

// ============================================================================
// EXTENDED COLORS - Prayer Status
// ============================================================================

object PrayerStatusColors {
    val Completed = Color(0xFF00C853)
    val CompletedContainer = Color(0xFFB9F6CA)
    val OnCompletedContainer = Color(0xFF00391A)

    val Delayed = Color(0xFFFFA726)
    val DelayedContainer = Color(0xFFFFE0B2)
    val OnDelayedContainer = Color(0xFF4E2600)

    val Missed = Color(0xFFFF5252)
    val MissedContainer = Color(0xFFFFCDD2)
    val OnMissedContainer = Color(0xFF5F0016)

    val Pending = Color(0xFF9E9E9E)
    val PendingContainer = Color(0xFFE0E0E0)
    val OnPendingContainer = Color(0xFF1F1F1F)
}

// ============================================================================
// PRAYER TIME COLORS (for visual distinction)
// ============================================================================

object PrayerTimeColors {
    val Fajr = Color(0xFF3F51B5)       // Indigo - Dawn
    val Sunrise = Color(0xFFFF9800)   // Orange - Sunrise
    val Dhuhr = Color(0xFFFFEB3B)     // Yellow - Noon
    val Asr = Color(0xFFFF5722)       // Deep Orange - Afternoon
    val Maghrib = Color(0xFF9C27B0)   // Purple - Sunset
    val Isha = Color(0xFF1A237E)      // Dark Blue - Night
}
