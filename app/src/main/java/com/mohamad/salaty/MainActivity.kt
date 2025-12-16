package com.mohamad.salaty

import android.app.LocaleManager
import android.os.Build
import android.os.Bundle
import android.os.LocaleList
import android.util.Log
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatDelegate
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.core.os.LocaleListCompat
import com.mohamad.salaty.core.designsystem.theme.SalatyTheme
import com.mohamad.salaty.feature.onboarding.OnboardingScreen
import com.mohamad.salaty.navigation.SalatyNavHost
import dagger.hilt.android.AndroidEntryPoint

/**
 * Main Activity
 *
 * Single-activity architecture with Jetpack Compose navigation.
 * Uses edge-to-edge display for modern Android experience.
 * Applies theme settings from user preferences.
 */
@AndroidEntryPoint
class MainActivity : ComponentActivity() {

    private val viewModel: MainViewModel by viewModels()
    private var lastAppliedLanguage: String? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        // Switch from splash theme to regular theme
        setTheme(R.style.Theme_Salaty)
        // Enable edge-to-edge before super.onCreate()
        enableEdgeToEdge()
        super.onCreate(savedInstanceState)

        setContent {
            val uiState by viewModel.uiState.collectAsState()

            // Apply locale when language preference changes
            // Only apply after preferences are loaded (onboardingCompleted != null)
            LaunchedEffect(uiState.language, uiState.onboardingCompleted) {
                if (uiState.onboardingCompleted != null) {
                    applyLocale(uiState.language)
                }
            }

            SalatyApp(
                themeMode = uiState.themeMode,
                dynamicColors = uiState.dynamicColors,
                onboardingCompleted = uiState.onboardingCompleted
            )
        }
    }

    private fun applyLocale(language: String) {
        // Skip if already applied (prevents recreation loop)
        if (language == lastAppliedLanguage) {
            Log.d("Salaty", "Locale already applied: $language")
            return
        }

        Log.d("Salaty", "Applying locale: $language (previous: $lastAppliedLanguage)")
        lastAppliedLanguage = language

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            // Use LocaleManager directly for API 33+
            val localeManager = getSystemService(LocaleManager::class.java)
            val currentLocales = localeManager.applicationLocales
            val currentLanguage = if (!currentLocales.isEmpty) {
                currentLocales.get(0)?.language
            } else null

            if (currentLanguage != language) {
                Log.d("Salaty", "Setting system locale via LocaleManager: $language")
                localeManager.applicationLocales = LocaleList.forLanguageTags(language)
            }
        } else {
            // Use AppCompatDelegate for older APIs
            val localeList = LocaleListCompat.forLanguageTags(language)
            AppCompatDelegate.setApplicationLocales(localeList)
        }
    }
}

/**
 * Root composable that applies theme settings and handles onboarding.
 *
 * @param themeMode The theme mode: "system", "light", or "dark"
 * @param dynamicColors Whether to use Material You dynamic colors
 * @param onboardingCompleted Whether onboarding has been completed (null = loading)
 */
@Composable
private fun SalatyApp(
    themeMode: String,
    dynamicColors: Boolean,
    onboardingCompleted: Boolean?
) {
    // Determine if dark theme should be used based on mode
    val darkTheme = when (themeMode) {
        "light" -> false
        "dark" -> true
        else -> isSystemInDarkTheme() // "system" or any other value
    }

    SalatyTheme(
        darkTheme = darkTheme,
        dynamicColor = dynamicColors
    ) {
        Surface(
            modifier = Modifier.fillMaxSize(),
            color = MaterialTheme.colorScheme.background
        ) {
            when (onboardingCompleted) {
                null -> {
                    // Loading state - show nothing or splash
                }
                false -> {
                    OnboardingScreen(
                        onComplete = { /* State will update automatically */ }
                    )
                }
                true -> {
                    SalatyNavHost()
                }
            }
        }
    }
}
