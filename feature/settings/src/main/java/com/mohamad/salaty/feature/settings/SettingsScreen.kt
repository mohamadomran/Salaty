package com.mohamad.salaty.feature.settings

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.expandVertically
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.shrinkVertically
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.selection.selectable
import androidx.compose.foundation.selection.selectableGroup
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AccessTime
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Calculate
import androidx.compose.material.icons.filled.DarkMode
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.ExpandLess
import androidx.compose.material.icons.filled.ExpandMore
import androidx.compose.material.icons.filled.LightMode
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.MyLocation
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.NotificationsActive
import androidx.compose.material.icons.filled.Remove
import androidx.compose.material.icons.filled.Schedule
import androidx.compose.material.icons.filled.SettingsBrightness
import androidx.compose.material.icons.filled.Translate
import androidx.compose.material.icons.filled.Tune
import androidx.compose.material.icons.filled.Vibration
import androidx.compose.material.icons.filled.VolumeUp
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.RadioButton
import androidx.compose.material3.Snackbar
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import kotlinx.coroutines.launch
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import android.Manifest
import com.mohamad.salaty.feature.settings.R
import androidx.hilt.navigation.compose.hiltViewModel
import com.google.accompanist.permissions.ExperimentalPermissionsApi
import com.google.accompanist.permissions.isGranted
import com.google.accompanist.permissions.rememberPermissionState
import com.google.accompanist.permissions.shouldShowRationale
import com.mohamad.salaty.core.data.database.entity.LocationEntity
import com.mohamad.salaty.core.data.preferences.UserPreferences
import com.mohamad.salaty.core.designsystem.component.SalatyCard
import com.mohamad.salaty.core.designsystem.localizedName
import com.mohamad.salaty.core.domain.model.CalculationMethod
import com.mohamad.salaty.core.domain.model.HighLatitudeRule
import com.mohamad.salaty.core.domain.model.Madhab
import com.mohamad.salaty.core.domain.model.PrayerName
import java.util.TimeZone

/**
 * Settings Screen - App Configuration
 *
 * Manage app settings and preferences.
 * Material Design 3 Expressive UI with inline accordions.
 */
@OptIn(ExperimentalPermissionsApi::class)
@Composable
fun SettingsScreen(
    modifier: Modifier = Modifier,
    viewModel: SettingsViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()

    when {
        uiState.isLoading -> {
            LoadingContent(modifier)
        }
        else -> {
            SettingsContent(
                uiState = uiState,
                viewModel = viewModel,
                modifier = modifier
            )
        }
    }
}

@Composable
private fun LoadingContent(modifier: Modifier = Modifier) {
    Box(
        modifier = modifier.fillMaxSize(),
        contentAlignment = Alignment.Center
    ) {
        CircularProgressIndicator(
            color = MaterialTheme.colorScheme.primary
        )
    }
}

@OptIn(ExperimentalPermissionsApi::class)
@Composable
private fun SettingsContent(
    uiState: SettingsUiState,
    viewModel: SettingsViewModel,
    modifier: Modifier = Modifier
) {
    // Location permission state
    val locationPermissionState = rememberPermissionState(
        Manifest.permission.ACCESS_FINE_LOCATION
    )

    // Snackbar for error messages
    val snackbarHostState = remember { SnackbarHostState() }
    val scope = rememberCoroutineScope()

    // Show error in snackbar
    LaunchedEffect(uiState.error) {
        uiState.error?.let { error ->
            scope.launch {
                snackbarHostState.showSnackbar(error)
                viewModel.clearError()
            }
        }
    }

    // Expanded states for inline accordions
    var calculationMethodExpanded by remember { mutableStateOf(false) }
    var madhabExpanded by remember { mutableStateOf(false) }
    var highLatitudeExpanded by remember { mutableStateOf(false) }
    var adjustmentsExpanded by remember { mutableStateOf(false) }
    var notificationSettingsExpanded by remember { mutableStateOf(false) }
    var notificationSoundExpanded by remember { mutableStateOf(false) }
    var languageExpanded by remember { mutableStateOf(false) }
    var themeExpanded by remember { mutableStateOf(false) }

    // Dialog states (only for complex dialogs)
    var showLocationDialog by remember { mutableStateOf(false) }
    var showAddLocationDialog by remember { mutableStateOf(false) }
    var showPermissionRationaleDialog by remember { mutableStateOf(false) }

    Box(modifier = modifier.fillMaxSize()) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Header
            Text(
                text = stringResource(R.string.settings_title),
                style = MaterialTheme.typography.headlineMedium,
                color = MaterialTheme.colorScheme.onBackground
            )

            // Location Section
            SettingsSection(title = stringResource(R.string.settings_section_location)) {
                SettingsClickableItem(
                    icon = Icons.Default.LocationOn,
                    title = stringResource(R.string.settings_current_location),
                    subtitle = uiState.currentLocation?.name ?: stringResource(R.string.settings_location_not_set),
                    onClick = { showLocationDialog = true }
                )
            }

            // Prayer Calculation Section
            SettingsSection(title = stringResource(R.string.settings_section_prayer_calculation)) {
                // Calculation Method - Expandable
                SettingsExpandableItem(
                    icon = Icons.Default.Calculate,
                    title = stringResource(R.string.settings_calculation_method),
                    subtitle = uiState.preferences.calculationMethod.displayName,
                    expanded = calculationMethodExpanded,
                    onToggle = { calculationMethodExpanded = !calculationMethodExpanded }
                ) {
                    Column(
                        modifier = Modifier
                            .selectableGroup()
                            .padding(start = 40.dp, end = 16.dp, bottom = 8.dp)
                    ) {
                        CalculationMethod.entries.forEach { method ->
                            RadioOptionRow(
                                text = method.displayName,
                                description = method.description,
                                selected = method == uiState.preferences.calculationMethod,
                                onClick = {
                                    viewModel.setCalculationMethod(method)
                                    calculationMethodExpanded = false
                                }
                            )
                        }
                    }
                }

                HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f))

                // Madhab - Expandable
                SettingsExpandableItem(
                    icon = Icons.Default.Schedule,
                    title = stringResource(R.string.settings_madhab),
                    subtitle = uiState.preferences.madhab.displayName,
                    expanded = madhabExpanded,
                    onToggle = { madhabExpanded = !madhabExpanded }
                ) {
                    Column(
                        modifier = Modifier
                            .selectableGroup()
                            .padding(start = 40.dp, end = 16.dp, bottom = 8.dp)
                    ) {
                        Madhab.entries.forEach { madhab ->
                            RadioOptionRow(
                                text = madhab.displayName,
                                description = madhab.description,
                                selected = madhab == uiState.preferences.madhab,
                                onClick = {
                                    viewModel.setMadhab(madhab)
                                    madhabExpanded = false
                                }
                            )
                        }
                    }
                }

                HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f))

                // High Latitude Rule - Expandable
                val currentHighLatRule = HighLatitudeRule.entries.find {
                    it.name.lowercase() == uiState.preferences.highLatitudeRule
                } ?: HighLatitudeRule.MIDDLE_OF_THE_NIGHT

                SettingsExpandableItem(
                    icon = Icons.Default.MyLocation,
                    title = stringResource(R.string.settings_high_latitude_rule),
                    subtitle = currentHighLatRule.displayName,
                    expanded = highLatitudeExpanded,
                    onToggle = { highLatitudeExpanded = !highLatitudeExpanded }
                ) {
                    Column(
                        modifier = Modifier
                            .selectableGroup()
                            .padding(start = 40.dp, end = 16.dp, bottom = 8.dp)
                    ) {
                        HighLatitudeRule.entries.forEach { rule ->
                            RadioOptionRow(
                                text = rule.displayName,
                                description = rule.description,
                                selected = rule == currentHighLatRule,
                                onClick = {
                                    viewModel.setHighLatitudeRule(rule)
                                    highLatitudeExpanded = false
                                }
                            )
                        }
                    }
                }

                HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f))

                // Time Adjustments - Expandable
                SettingsExpandableItem(
                    icon = Icons.Default.Tune,
                    title = stringResource(R.string.settings_time_adjustments),
                    subtitle = stringResource(R.string.settings_time_adjustments_subtitle),
                    expanded = adjustmentsExpanded,
                    onToggle = { adjustmentsExpanded = !adjustmentsExpanded }
                ) {
                    Column(
                        modifier = Modifier.padding(start = 40.dp, end = 16.dp, bottom = 8.dp),
                        verticalArrangement = Arrangement.spacedBy(4.dp)
                    ) {
                        Text(
                            text = stringResource(R.string.settings_adjustments_description),
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            modifier = Modifier.padding(bottom = 8.dp)
                        )

                        PrayerName.ordered.forEach { prayer ->
                            val currentAdjustment = uiState.preferences.getAdjustment(prayer)
                            AdjustmentRow(
                                prayerName = prayer.localizedName(),
                                adjustment = currentAdjustment,
                                onIncrease = { viewModel.setPrayerAdjustment(prayer, currentAdjustment + 1) },
                                onDecrease = { viewModel.setPrayerAdjustment(prayer, currentAdjustment - 1) }
                            )
                        }
                    }
                }
            }

            // Notifications Section
            SettingsSection(title = stringResource(R.string.settings_section_notifications)) {
                SettingsSwitchItem(
                    icon = Icons.Default.Notifications,
                    title = stringResource(R.string.settings_prayer_notifications),
                    subtitle = stringResource(R.string.settings_prayer_notifications_subtitle),
                    checked = uiState.preferences.notificationsEnabled,
                    onCheckedChange = viewModel::setNotificationsEnabled
                )

                if (uiState.preferences.notificationsEnabled) {
                    HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f))

                    // Per-Prayer Notifications - Expandable
                    SettingsExpandableItem(
                        icon = Icons.Default.NotificationsActive,
                        title = stringResource(R.string.settings_per_prayer_settings),
                        subtitle = stringResource(R.string.settings_per_prayer_settings_subtitle),
                        expanded = notificationSettingsExpanded,
                        onToggle = { notificationSettingsExpanded = !notificationSettingsExpanded }
                    ) {
                        Column(
                            modifier = Modifier.padding(start = 40.dp, end = 16.dp, bottom = 8.dp),
                            verticalArrangement = Arrangement.spacedBy(4.dp)
                        ) {
                            PrayerName.ordered.forEach { prayer ->
                                val isEnabled = uiState.preferences.isNotificationEnabled(prayer)
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(vertical = 4.dp),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text(
                                        text = prayer.localizedName(),
                                        style = MaterialTheme.typography.bodyLarge
                                    )
                                    Switch(
                                        checked = isEnabled,
                                        onCheckedChange = { viewModel.setPrayerNotificationEnabled(prayer, it) }
                                    )
                                }
                            }
                        }
                    }

                    HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f))

                    // Notification Sound - Expandable
                    val currentSoundLabel = when (uiState.preferences.notificationSound) {
                        "silent" -> stringResource(R.string.settings_sound_silent)
                        else -> stringResource(R.string.settings_sound_default)
                    }

                    SettingsExpandableItem(
                        icon = Icons.Default.VolumeUp,
                        title = stringResource(R.string.settings_notification_sound),
                        subtitle = currentSoundLabel,
                        expanded = notificationSoundExpanded,
                        onToggle = { notificationSoundExpanded = !notificationSoundExpanded }
                    ) {
                        Column(
                            modifier = Modifier
                                .selectableGroup()
                                .padding(start = 40.dp, end = 16.dp, bottom = 8.dp)
                        ) {
                            val soundOptions = listOf(
                                "default" to stringResource(R.string.settings_sound_default),
                                "silent" to stringResource(R.string.settings_sound_silent)
                            )
                            soundOptions.forEach { (key, label) ->
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .selectable(
                                            selected = key == uiState.preferences.notificationSound,
                                            onClick = {
                                                viewModel.setNotificationSound(key)
                                                notificationSoundExpanded = false
                                            },
                                            role = Role.RadioButton
                                        )
                                        .padding(vertical = 8.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    RadioButton(
                                        selected = key == uiState.preferences.notificationSound,
                                        onClick = null
                                    )
                                    Spacer(modifier = Modifier.width(12.dp))
                                    Text(
                                        text = label,
                                        style = MaterialTheme.typography.bodyLarge
                                    )
                                }
                            }
                        }
                    }

                    HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f))

                    SettingsSwitchItem(
                        icon = Icons.Default.Vibration,
                        title = stringResource(R.string.settings_vibrate),
                        subtitle = stringResource(R.string.settings_vibrate_subtitle),
                        checked = uiState.preferences.notificationVibrate,
                        onCheckedChange = viewModel::setNotificationVibrate
                    )
                }
            }

            // Display Section
            SettingsSection(title = stringResource(R.string.settings_section_display)) {
                // Language - Expandable
                SettingsExpandableItem(
                    icon = Icons.Default.Translate,
                    title = stringResource(R.string.settings_language),
                    subtitle = when (uiState.preferences.language) {
                        "ar" -> stringResource(R.string.settings_language_arabic)
                        else -> stringResource(R.string.settings_language_english)
                    },
                    expanded = languageExpanded,
                    onToggle = { languageExpanded = !languageExpanded }
                ) {
                    Column(
                        modifier = Modifier
                            .selectableGroup()
                            .padding(start = 40.dp, end = 16.dp, bottom = 8.dp)
                    ) {
                        val languages = listOf(
                            "en" to stringResource(R.string.settings_language_english),
                            "ar" to stringResource(R.string.settings_language_arabic)
                        )
                        languages.forEach { (code, label) ->
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .selectable(
                                        selected = code == uiState.preferences.language,
                                        onClick = {
                                            viewModel.setLanguage(code)
                                            languageExpanded = false
                                        },
                                        role = Role.RadioButton
                                    )
                                    .padding(vertical = 8.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                RadioButton(
                                    selected = code == uiState.preferences.language,
                                    onClick = null
                                )
                                Spacer(modifier = Modifier.width(12.dp))
                                Text(
                                    text = label,
                                    style = MaterialTheme.typography.bodyLarge
                                )
                            }
                        }
                    }
                }

                HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f))

                // Theme - Expandable
                SettingsExpandableItem(
                    icon = when (uiState.preferences.themeMode) {
                        "light" -> Icons.Default.LightMode
                        "dark" -> Icons.Default.DarkMode
                        else -> Icons.Default.SettingsBrightness
                    },
                    title = stringResource(R.string.settings_theme),
                    subtitle = when (uiState.preferences.themeMode) {
                        "light" -> stringResource(R.string.settings_theme_light)
                        "dark" -> stringResource(R.string.settings_theme_dark)
                        else -> stringResource(R.string.settings_theme_system)
                    },
                    expanded = themeExpanded,
                    onToggle = { themeExpanded = !themeExpanded }
                ) {
                    Column(
                        modifier = Modifier
                            .selectableGroup()
                            .padding(start = 40.dp, end = 16.dp, bottom = 8.dp)
                    ) {
                        val themes = listOf(
                            Triple("system", stringResource(R.string.settings_theme_system), Icons.Default.SettingsBrightness),
                            Triple("light", stringResource(R.string.settings_theme_light), Icons.Default.LightMode),
                            Triple("dark", stringResource(R.string.settings_theme_dark), Icons.Default.DarkMode)
                        )
                        themes.forEach { (value, label, icon) ->
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .selectable(
                                        selected = value == uiState.preferences.themeMode,
                                        onClick = {
                                            viewModel.setThemeMode(value)
                                            themeExpanded = false
                                        },
                                        role = Role.RadioButton
                                    )
                                    .padding(vertical = 8.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                RadioButton(
                                    selected = value == uiState.preferences.themeMode,
                                    onClick = null
                                )
                                Spacer(modifier = Modifier.width(12.dp))
                                Icon(
                                    imageVector = icon,
                                    contentDescription = null,
                                    tint = MaterialTheme.colorScheme.onSurfaceVariant,
                                    modifier = Modifier.size(20.dp)
                                )
                                Spacer(modifier = Modifier.width(12.dp))
                                Text(
                                    text = label,
                                    style = MaterialTheme.typography.bodyLarge
                                )
                            }
                        }
                    }
                }

                HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f))

                SettingsSwitchItem(
                    icon = Icons.Default.DarkMode,
                    title = stringResource(R.string.settings_dynamic_colors),
                    subtitle = stringResource(R.string.settings_dynamic_colors_subtitle),
                    checked = uiState.preferences.dynamicColors,
                    onCheckedChange = viewModel::setDynamicColors
                )

                HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f))

                SettingsSwitchItem(
                    icon = Icons.Default.AccessTime,
                    title = stringResource(R.string.settings_24hour_format),
                    subtitle = stringResource(R.string.settings_24hour_format_subtitle),
                    checked = uiState.preferences.timeFormat24h,
                    onCheckedChange = viewModel::setTimeFormat24h
                )
            }

            // About Section
            SettingsSection(title = stringResource(R.string.settings_section_about)) {
                SettingsInfoItem(
                    title = stringResource(R.string.settings_version),
                    subtitle = "1.0.0"
                )
            }

            Spacer(modifier = Modifier.height(16.dp))
        }

        // Snackbar for error messages
        SnackbarHost(
            hostState = snackbarHostState,
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .padding(16.dp)
        )
    }

    // Dialogs (only complex ones that need dialogs)
    if (showLocationDialog) {
        LocationDialog(
            locations = uiState.locations,
            currentLocation = uiState.currentLocation,
            isDetectingLocation = uiState.isDetectingLocation,
            onLocationSelected = {
                viewModel.setDefaultLocation(it.id)
                showLocationDialog = false
            },
            onDetectLocation = {
                if (locationPermissionState.status.isGranted) {
                    viewModel.detectLocation()
                } else if (locationPermissionState.status.shouldShowRationale) {
                    showPermissionRationaleDialog = true
                } else {
                    locationPermissionState.launchPermissionRequest()
                }
            },
            onAddLocation = {
                showLocationDialog = false
                showAddLocationDialog = true
            },
            onDeleteLocation = viewModel::deleteLocation,
            onDismiss = { showLocationDialog = false }
        )
    }

    if (showPermissionRationaleDialog) {
        AlertDialog(
            onDismissRequest = { showPermissionRationaleDialog = false },
            title = { Text(stringResource(R.string.settings_permission_title)) },
            text = {
                Text(stringResource(R.string.settings_permission_message))
            },
            confirmButton = {
                TextButton(
                    onClick = {
                        showPermissionRationaleDialog = false
                        locationPermissionState.launchPermissionRequest()
                    }
                ) {
                    Text(stringResource(R.string.settings_grant_permission))
                }
            },
            dismissButton = {
                TextButton(onClick = { showPermissionRationaleDialog = false }) {
                    Text(stringResource(R.string.settings_cancel))
                }
            }
        )
    }

    if (showAddLocationDialog) {
        val initialLocationCount = remember { uiState.locations.size }

        AddLocationDialog(
            isSearching = uiState.isDetectingLocation,
            onSearch = { locationName ->
                viewModel.searchAndSaveLocation(locationName)
            },
            onDismiss = { showAddLocationDialog = false }
        )

        // Close dialog when search succeeds (location count increases)
        LaunchedEffect(uiState.locations.size) {
            if (uiState.locations.size > initialLocationCount) {
                showAddLocationDialog = false
            }
        }
    }
}

// ============================================================================
// DIALOGS (Complex flows that need modal interaction)
// ============================================================================

@Composable
private fun LocationDialog(
    locations: List<LocationEntity>,
    currentLocation: LocationEntity?,
    isDetectingLocation: Boolean,
    onLocationSelected: (LocationEntity) -> Unit,
    onDetectLocation: () -> Unit,
    onAddLocation: () -> Unit,
    onDeleteLocation: (Long) -> Unit,
    onDismiss: () -> Unit
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text(stringResource(R.string.settings_locations_title)) },
        text = {
            Column {
                // Detect Location Button
                Button(
                    onClick = onDetectLocation,
                    enabled = !isDetectingLocation,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    if (isDetectingLocation) {
                        CircularProgressIndicator(
                            modifier = Modifier.size(18.dp),
                            color = MaterialTheme.colorScheme.onPrimary,
                            strokeWidth = 2.dp
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(stringResource(R.string.settings_detecting))
                    } else {
                        Icon(
                            imageVector = Icons.Default.MyLocation,
                            contentDescription = null,
                            modifier = Modifier.size(18.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(stringResource(R.string.settings_detect_location))
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))
                HorizontalDivider()
                Spacer(modifier = Modifier.height(8.dp))

                if (locations.isEmpty()) {
                    Text(
                        text = stringResource(R.string.settings_no_locations),
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        textAlign = TextAlign.Center,
                        modifier = Modifier.padding(vertical = 16.dp)
                    )
                } else {
                    Text(
                        text = stringResource(R.string.settings_saved_locations),
                        style = MaterialTheme.typography.labelMedium,
                        color = MaterialTheme.colorScheme.primary,
                        modifier = Modifier.padding(bottom = 8.dp)
                    )
                    Column(modifier = Modifier.selectableGroup()) {
                        locations.forEach { location ->
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .selectable(
                                        selected = location.id == currentLocation?.id,
                                        onClick = { onLocationSelected(location) },
                                        role = Role.RadioButton
                                    )
                                    .padding(vertical = 8.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                RadioButton(
                                    selected = location.id == currentLocation?.id,
                                    onClick = null
                                )
                                Spacer(modifier = Modifier.width(12.dp))
                                Column(modifier = Modifier.weight(1f)) {
                                    Text(
                                        text = location.name,
                                        style = MaterialTheme.typography.bodyLarge
                                    )
                                    Text(
                                        text = "%.4f, %.4f".format(location.latitude, location.longitude),
                                        style = MaterialTheme.typography.bodySmall,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                }
                                IconButton(
                                    onClick = { onDeleteLocation(location.id) },
                                    modifier = Modifier.size(40.dp)
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.Delete,
                                        contentDescription = stringResource(R.string.settings_delete),
                                        tint = MaterialTheme.colorScheme.error
                                    )
                                }
                            }
                        }
                    }
                }
            }
        },
        confirmButton = {
            TextButton(onClick = onAddLocation) {
                Icon(
                    imageVector = Icons.Default.Add,
                    contentDescription = null,
                    modifier = Modifier.size(18.dp)
                )
                Spacer(modifier = Modifier.width(4.dp))
                Text(stringResource(R.string.settings_add_manually))
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text(stringResource(R.string.settings_close))
            }
        }
    )
}

@Composable
private fun AddLocationDialog(
    isSearching: Boolean,
    onSearch: (locationName: String) -> Unit,
    onDismiss: () -> Unit
) {
    var locationName by remember { mutableStateOf("") }
    var nameError by remember { mutableStateOf(false) }

    AlertDialog(
        onDismissRequest = { if (!isSearching) onDismiss() },
        title = { Text(stringResource(R.string.settings_add_location)) },
        text = {
            Column(
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                OutlinedTextField(
                    value = locationName,
                    onValueChange = {
                        locationName = it
                        nameError = false
                    },
                    label = { Text(stringResource(R.string.settings_location_name)) },
                    placeholder = { Text(stringResource(R.string.settings_search_location_hint)) },
                    isError = nameError,
                    supportingText = if (nameError) {
                        { Text(stringResource(R.string.settings_location_name_required)) }
                    } else null,
                    singleLine = true,
                    enabled = !isSearching,
                    modifier = Modifier.fillMaxWidth()
                )

                if (isSearching) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.Center,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        CircularProgressIndicator(
                            modifier = Modifier.size(20.dp),
                            strokeWidth = 2.dp
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = stringResource(R.string.settings_searching),
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            }
        },
        confirmButton = {
            TextButton(
                onClick = {
                    if (locationName.isBlank()) {
                        nameError = true
                    } else {
                        onSearch(locationName.trim())
                    }
                },
                enabled = !isSearching
            ) {
                Text(stringResource(R.string.settings_search))
            }
        },
        dismissButton = {
            TextButton(
                onClick = onDismiss,
                enabled = !isSearching
            ) {
                Text(stringResource(R.string.settings_cancel))
            }
        }
    )
}

// ============================================================================
// REUSABLE COMPONENTS
// ============================================================================

@Composable
private fun SettingsSection(
    title: String,
    content: @Composable () -> Unit
) {
    Column(
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        Text(
            text = title,
            style = MaterialTheme.typography.titleSmall,
            fontWeight = FontWeight.SemiBold,
            color = MaterialTheme.colorScheme.primary,
            modifier = Modifier.padding(start = 4.dp)
        )

        SalatyCard {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 4.dp)
            ) {
                content()
            }
        }
    }
}

@Composable
private fun SettingsExpandableItem(
    icon: ImageVector,
    title: String,
    subtitle: String,
    expanded: Boolean,
    onToggle: () -> Unit,
    content: @Composable () -> Unit
) {
    Column {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .clickable(onClick = onToggle)
                .padding(horizontal = 16.dp, vertical = 16.dp),
            horizontalArrangement = Arrangement.spacedBy(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.onSurfaceVariant
            )

            Column(
                modifier = Modifier.weight(1f)
            ) {
                Text(
                    text = title,
                    style = MaterialTheme.typography.bodyLarge,
                    color = MaterialTheme.colorScheme.onSurface
                )
                Text(
                    text = subtitle,
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }

            Icon(
                imageVector = if (expanded) Icons.Default.ExpandLess else Icons.Default.ExpandMore,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }

        AnimatedVisibility(
            visible = expanded,
            enter = expandVertically() + fadeIn(),
            exit = shrinkVertically() + fadeOut()
        ) {
            content()
        }
    }
}

@Composable
private fun SettingsClickableItem(
    title: String,
    subtitle: String,
    onClick: () -> Unit,
    icon: ImageVector? = null
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
            .padding(horizontal = 16.dp, vertical = 16.dp),
        horizontalArrangement = Arrangement.spacedBy(16.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        if (icon != null) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }

        Column(
            modifier = Modifier.weight(1f)
        ) {
            Text(
                text = title,
                style = MaterialTheme.typography.bodyLarge,
                color = MaterialTheme.colorScheme.onSurface
            )
            Text(
                text = subtitle,
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }

        Icon(
            imageVector = Icons.Default.ExpandMore,
            contentDescription = null,
            tint = MaterialTheme.colorScheme.onSurfaceVariant
        )
    }
}

@Composable
private fun SettingsInfoItem(
    title: String,
    subtitle: String
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 16.dp),
        horizontalArrangement = Arrangement.spacedBy(16.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column(
            modifier = Modifier.weight(1f)
        ) {
            Text(
                text = title,
                style = MaterialTheme.typography.bodyLarge,
                color = MaterialTheme.colorScheme.onSurface
            )
            Text(
                text = subtitle,
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

@Composable
private fun SettingsSwitchItem(
    icon: ImageVector,
    title: String,
    subtitle: String,
    checked: Boolean,
    onCheckedChange: (Boolean) -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 12.dp),
        horizontalArrangement = Arrangement.spacedBy(16.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Icon(
            imageVector = icon,
            contentDescription = null,
            tint = MaterialTheme.colorScheme.onSurfaceVariant
        )

        Column(
            modifier = Modifier.weight(1f)
        ) {
            Text(
                text = title,
                style = MaterialTheme.typography.bodyLarge,
                color = MaterialTheme.colorScheme.onSurface
            )
            Text(
                text = subtitle,
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }

        Switch(
            checked = checked,
            onCheckedChange = onCheckedChange
        )
    }
}

@Composable
private fun RadioOptionRow(
    text: String,
    description: String,
    selected: Boolean,
    onClick: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .selectable(
                selected = selected,
                onClick = onClick,
                role = Role.RadioButton
            )
            .padding(vertical = 8.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        RadioButton(
            selected = selected,
            onClick = null
        )
        Spacer(modifier = Modifier.width(12.dp))
        Column {
            Text(
                text = text,
                style = MaterialTheme.typography.bodyLarge
            )
            Text(
                text = description,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

@Composable
private fun AdjustmentRow(
    prayerName: String,
    adjustment: Int,
    onIncrease: () -> Unit,
    onDecrease: () -> Unit
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(
            text = prayerName,
            style = MaterialTheme.typography.bodyLarge
        )

        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(4.dp)
        ) {
            IconButton(
                onClick = onDecrease,
                modifier = Modifier.size(36.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.Remove,
                    contentDescription = null,
                    tint = MaterialTheme.colorScheme.primary
                )
            }

            Text(
                text = if (adjustment >= 0) "+$adjustment" else "$adjustment",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = if (adjustment != 0) {
                    MaterialTheme.colorScheme.primary
                } else {
                    MaterialTheme.colorScheme.onSurfaceVariant
                },
                modifier = Modifier.width(48.dp),
                textAlign = TextAlign.Center
            )

            IconButton(
                onClick = onIncrease,
                modifier = Modifier.size(36.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.Add,
                    contentDescription = null,
                    tint = MaterialTheme.colorScheme.primary
                )
            }
        }
    }
}
