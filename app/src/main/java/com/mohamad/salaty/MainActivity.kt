package com.mohamad.salaty

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import com.mohamad.salaty.core.designsystem.theme.SalatyTheme
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

    override fun onCreate(savedInstanceState: Bundle?) {
        // Enable edge-to-edge before super.onCreate()
        enableEdgeToEdge()
        super.onCreate(savedInstanceState)

        setContent {
            val themeSettings by viewModel.themeSettings.collectAsState()

            SalatyApp(
                themeMode = themeSettings.themeMode,
                dynamicColors = themeSettings.dynamicColors
            )
        }
    }
}

/**
 * Root composable that applies theme settings.
 *
 * @param themeMode The theme mode: "system", "light", or "dark"
 * @param dynamicColors Whether to use Material You dynamic colors
 */
@Composable
private fun SalatyApp(
    themeMode: String,
    dynamicColors: Boolean
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
            SalatyNavHost()
        }
    }
}
