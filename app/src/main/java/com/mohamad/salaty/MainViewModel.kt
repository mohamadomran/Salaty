package com.mohamad.salaty

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.mohamad.salaty.core.data.preferences.SalatyPreferences
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import javax.inject.Inject

/**
 * Main app UI state including theme and onboarding status.
 */
data class MainUiState(
    val themeMode: String = "system",
    val dynamicColors: Boolean = true,
    val onboardingCompleted: Boolean? = null // null = loading
)

/**
 * Theme settings state for the app.
 */
data class ThemeSettings(
    val themeMode: String = "system",
    val dynamicColors: Boolean = true
)

/**
 * Main ViewModel for app-wide settings like theme.
 *
 * This ViewModel is scoped to MainActivity and provides theme settings
 * that need to be applied at the root composable level.
 */
@HiltViewModel
class MainViewModel @Inject constructor(
    salatyPreferences: SalatyPreferences
) : ViewModel() {

    /**
     * Main UI state including theme and onboarding status.
     * Uses WhileSubscribed to stop collecting when the app goes to background.
     */
    val uiState: StateFlow<MainUiState> = salatyPreferences.userPreferences
        .map { prefs ->
            MainUiState(
                themeMode = prefs.themeMode,
                dynamicColors = prefs.dynamicColors,
                onboardingCompleted = prefs.onboardingCompleted
            )
        }
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5_000),
            initialValue = MainUiState()
        )

    /**
     * Theme settings flow that emits current theme configuration.
     * Uses WhileSubscribed to stop collecting when the app goes to background.
     */
    val themeSettings: StateFlow<ThemeSettings> = salatyPreferences.userPreferences
        .map { prefs ->
            ThemeSettings(
                themeMode = prefs.themeMode,
                dynamicColors = prefs.dynamicColors
            )
        }
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5_000),
            initialValue = ThemeSettings()
        )
}
