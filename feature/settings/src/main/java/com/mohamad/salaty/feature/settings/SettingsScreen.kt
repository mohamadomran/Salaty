package com.mohamad.salaty.feature.settings

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
import androidx.compose.material.icons.automirrored.filled.KeyboardArrowRight
import androidx.compose.material.icons.filled.AccessTime
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Calculate
import androidx.compose.material.icons.filled.DarkMode
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.LightMode
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.MyLocation
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.NotificationsActive
import androidx.compose.material.icons.filled.Remove
import androidx.compose.material.icons.filled.Schedule
import androidx.compose.material.icons.filled.SettingsBrightness
import androidx.compose.material.icons.filled.Tune
import androidx.compose.material.icons.filled.Vibration
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Snackbar
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.RadioButton
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
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
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import android.Manifest
import androidx.hilt.navigation.compose.hiltViewModel
import com.google.accompanist.permissions.ExperimentalPermissionsApi
import com.google.accompanist.permissions.isGranted
import com.google.accompanist.permissions.rememberPermissionState
import com.google.accompanist.permissions.shouldShowRationale
import com.mohamad.salaty.core.data.database.entity.LocationEntity
import com.mohamad.salaty.core.data.preferences.UserPreferences
import com.mohamad.salaty.core.designsystem.component.SalatyCard
import com.mohamad.salaty.core.domain.model.CalculationMethod
import com.mohamad.salaty.core.domain.model.HighLatitudeRule
import com.mohamad.salaty.core.domain.model.Madhab
import com.mohamad.salaty.core.domain.model.PrayerName
import java.util.TimeZone

/**
 * Settings Screen - App Configuration
 *
 * Manage app settings and preferences.
 * Material Design 3 Expressive UI.
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

    // Dialog states
    var showCalculationMethodDialog by remember { mutableStateOf(false) }
    var showMadhabDialog by remember { mutableStateOf(false) }
    var showHighLatitudeDialog by remember { mutableStateOf(false) }
    var showLocationDialog by remember { mutableStateOf(false) }
    var showAddLocationDialog by remember { mutableStateOf(false) }
    var showAdjustmentsDialog by remember { mutableStateOf(false) }
    var showNotificationSettingsDialog by remember { mutableStateOf(false) }
    var showThemeDialog by remember { mutableStateOf(false) }
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
                text = "Settings",
                style = MaterialTheme.typography.headlineMedium,
                color = MaterialTheme.colorScheme.onBackground
            )

        // Location Section
        SettingsSection(title = "Location") {
            SettingsClickableItem(
                icon = Icons.Default.LocationOn,
                title = "Current Location",
                subtitle = uiState.currentLocation?.name ?: "Not set",
                onClick = { showLocationDialog = true }
            )
        }

        // Prayer Calculation Section
        SettingsSection(title = "Prayer Calculation") {
            SettingsClickableItem(
                icon = Icons.Default.Calculate,
                title = "Calculation Method",
                subtitle = uiState.preferences.calculationMethod.displayName,
                onClick = { showCalculationMethodDialog = true }
            )
            HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f))
            SettingsClickableItem(
                icon = Icons.Default.Schedule,
                title = "Madhab (Asr Calculation)",
                subtitle = uiState.preferences.madhab.displayName,
                onClick = { showMadhabDialog = true }
            )
            HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f))
            SettingsClickableItem(
                icon = Icons.Default.MyLocation,
                title = "High Latitude Rule",
                subtitle = HighLatitudeRule.entries.find {
                    it.name.lowercase() == uiState.preferences.highLatitudeRule
                }?.displayName ?: "Middle of the Night",
                onClick = { showHighLatitudeDialog = true }
            )
            HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f))
            SettingsClickableItem(
                icon = Icons.Default.Tune,
                title = "Time Adjustments",
                subtitle = "Fine-tune prayer times",
                onClick = { showAdjustmentsDialog = true }
            )
        }

        // Notifications Section
        SettingsSection(title = "Notifications") {
            SettingsSwitchItem(
                icon = Icons.Default.Notifications,
                title = "Prayer Notifications",
                subtitle = "Get notified for prayer times",
                checked = uiState.preferences.notificationsEnabled,
                onCheckedChange = viewModel::setNotificationsEnabled
            )
            if (uiState.preferences.notificationsEnabled) {
                HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f))
                SettingsClickableItem(
                    icon = Icons.Default.NotificationsActive,
                    title = "Per-Prayer Settings",
                    subtitle = "Configure individual prayers",
                    onClick = { showNotificationSettingsDialog = true }
                )
                HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f))
                SettingsSwitchItem(
                    icon = Icons.Default.Vibration,
                    title = "Vibrate",
                    subtitle = "Vibrate on notification",
                    checked = uiState.preferences.notificationVibrate,
                    onCheckedChange = viewModel::setNotificationVibrate
                )
            }
        }

        // Display Section
        SettingsSection(title = "Display") {
            SettingsClickableItem(
                icon = when (uiState.preferences.themeMode) {
                    "light" -> Icons.Default.LightMode
                    "dark" -> Icons.Default.DarkMode
                    else -> Icons.Default.SettingsBrightness
                },
                title = "Theme",
                subtitle = when (uiState.preferences.themeMode) {
                    "light" -> "Light"
                    "dark" -> "Dark"
                    else -> "System default"
                },
                onClick = { showThemeDialog = true }
            )
            HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f))
            SettingsSwitchItem(
                icon = Icons.Default.DarkMode,
                title = "Dynamic Colors",
                subtitle = "Use Material You colors",
                checked = uiState.preferences.dynamicColors,
                onCheckedChange = viewModel::setDynamicColors
            )
            HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f))
            SettingsSwitchItem(
                icon = Icons.Default.AccessTime,
                title = "24-Hour Format",
                subtitle = "Use 24-hour time format",
                checked = uiState.preferences.timeFormat24h,
                onCheckedChange = viewModel::setTimeFormat24h
            )
        }

        // About Section
        SettingsSection(title = "About") {
            SettingsClickableItem(
                title = "Version",
                subtitle = "1.0.0",
                onClick = { }
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

    // Dialogs
    if (showCalculationMethodDialog) {
        CalculationMethodDialog(
            currentMethod = uiState.preferences.calculationMethod,
            onMethodSelected = {
                viewModel.setCalculationMethod(it)
                showCalculationMethodDialog = false
            },
            onDismiss = { showCalculationMethodDialog = false }
        )
    }

    if (showMadhabDialog) {
        MadhabDialog(
            currentMadhab = uiState.preferences.madhab,
            onMadhabSelected = {
                viewModel.setMadhab(it)
                showMadhabDialog = false
            },
            onDismiss = { showMadhabDialog = false }
        )
    }

    if (showHighLatitudeDialog) {
        HighLatitudeRuleDialog(
            currentRule = HighLatitudeRule.entries.find {
                it.name.lowercase() == uiState.preferences.highLatitudeRule
            } ?: HighLatitudeRule.MIDDLE_OF_THE_NIGHT,
            onRuleSelected = {
                viewModel.setHighLatitudeRule(it)
                showHighLatitudeDialog = false
            },
            onDismiss = { showHighLatitudeDialog = false }
        )
    }

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
            title = { Text("Location Permission Needed") },
            text = {
                Text("Location permission is required to automatically detect your current location for accurate prayer times. Please grant the permission to use this feature.")
            },
            confirmButton = {
                TextButton(
                    onClick = {
                        showPermissionRationaleDialog = false
                        locationPermissionState.launchPermissionRequest()
                    }
                ) {
                    Text("Grant Permission")
                }
            },
            dismissButton = {
                TextButton(onClick = { showPermissionRationaleDialog = false }) {
                    Text("Cancel")
                }
            }
        )
    }

    if (showAddLocationDialog) {
        AddLocationDialog(
            onSave = { name, lat, lon, tz ->
                viewModel.saveLocation(name, lat, lon, tz, true)
                showAddLocationDialog = false
            },
            onDismiss = { showAddLocationDialog = false }
        )
    }

    if (showAdjustmentsDialog) {
        AdjustmentsDialog(
            preferences = uiState.preferences,
            onAdjustmentChanged = viewModel::setPrayerAdjustment,
            onDismiss = { showAdjustmentsDialog = false }
        )
    }

    if (showNotificationSettingsDialog) {
        NotificationSettingsDialog(
            preferences = uiState.preferences,
            onPrayerNotificationChanged = viewModel::setPrayerNotificationEnabled,
            onDismiss = { showNotificationSettingsDialog = false }
        )
    }

    if (showThemeDialog) {
        ThemeDialog(
            currentTheme = uiState.preferences.themeMode,
            onThemeSelected = {
                viewModel.setThemeMode(it)
                showThemeDialog = false
            },
            onDismiss = { showThemeDialog = false }
        )
    }
}

// ============================================================================
// DIALOGS
// ============================================================================

@Composable
private fun CalculationMethodDialog(
    currentMethod: CalculationMethod,
    onMethodSelected: (CalculationMethod) -> Unit,
    onDismiss: () -> Unit
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Calculation Method") },
        text = {
            Column(
                modifier = Modifier
                    .selectableGroup()
                    .verticalScroll(rememberScrollState())
            ) {
                CalculationMethod.entries.forEach { method ->
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .selectable(
                                selected = method == currentMethod,
                                onClick = { onMethodSelected(method) },
                                role = Role.RadioButton
                            )
                            .padding(vertical = 8.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        RadioButton(
                            selected = method == currentMethod,
                            onClick = null
                        )
                        Spacer(modifier = Modifier.width(12.dp))
                        Column {
                            Text(
                                text = method.displayName,
                                style = MaterialTheme.typography.bodyLarge
                            )
                            Text(
                                text = method.description,
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }
                }
            }
        },
        confirmButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel")
            }
        }
    )
}

@Composable
private fun MadhabDialog(
    currentMadhab: Madhab,
    onMadhabSelected: (Madhab) -> Unit,
    onDismiss: () -> Unit
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Madhab (School of Thought)") },
        text = {
            Column(modifier = Modifier.selectableGroup()) {
                Madhab.entries.forEach { madhab ->
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .selectable(
                                selected = madhab == currentMadhab,
                                onClick = { onMadhabSelected(madhab) },
                                role = Role.RadioButton
                            )
                            .padding(vertical = 12.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        RadioButton(
                            selected = madhab == currentMadhab,
                            onClick = null
                        )
                        Spacer(modifier = Modifier.width(12.dp))
                        Column {
                            Text(
                                text = madhab.displayName,
                                style = MaterialTheme.typography.bodyLarge
                            )
                            Text(
                                text = madhab.description,
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }
                }
            }
        },
        confirmButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel")
            }
        }
    )
}

@Composable
private fun HighLatitudeRuleDialog(
    currentRule: HighLatitudeRule,
    onRuleSelected: (HighLatitudeRule) -> Unit,
    onDismiss: () -> Unit
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("High Latitude Rule") },
        text = {
            Column(modifier = Modifier.selectableGroup()) {
                HighLatitudeRule.entries.forEach { rule ->
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .selectable(
                                selected = rule == currentRule,
                                onClick = { onRuleSelected(rule) },
                                role = Role.RadioButton
                            )
                            .padding(vertical = 12.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        RadioButton(
                            selected = rule == currentRule,
                            onClick = null
                        )
                        Spacer(modifier = Modifier.width(12.dp))
                        Column {
                            Text(
                                text = rule.displayName,
                                style = MaterialTheme.typography.bodyLarge
                            )
                            Text(
                                text = rule.description,
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }
                }
            }
        },
        confirmButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel")
            }
        }
    )
}

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
        title = { Text("Locations") },
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
                        Text("Detecting...")
                    } else {
                        Icon(
                            imageVector = Icons.Default.MyLocation,
                            contentDescription = null,
                            modifier = Modifier.size(18.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Detect My Location")
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))
                HorizontalDivider()
                Spacer(modifier = Modifier.height(8.dp))

                if (locations.isEmpty()) {
                    Text(
                        text = "No locations saved. Detect your location or add one manually.",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        textAlign = TextAlign.Center,
                        modifier = Modifier.padding(vertical = 16.dp)
                    )
                } else {
                    Text(
                        text = "Saved Locations",
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
                                        contentDescription = "Delete",
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
                Text("Add Manually")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Close")
            }
        }
    )
}

@Composable
private fun AddLocationDialog(
    onSave: (name: String, latitude: Double, longitude: Double, timezone: String) -> Unit,
    onDismiss: () -> Unit
) {
    var name by remember { mutableStateOf("") }
    var latitude by remember { mutableStateOf("") }
    var longitude by remember { mutableStateOf("") }
    val timezone = remember { TimeZone.getDefault().id }

    var nameError by remember { mutableStateOf(false) }
    var latError by remember { mutableStateOf(false) }
    var lonError by remember { mutableStateOf(false) }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Add Location") },
        text = {
            Column(
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                OutlinedTextField(
                    value = name,
                    onValueChange = {
                        name = it
                        nameError = false
                    },
                    label = { Text("Location Name") },
                    placeholder = { Text("e.g., Home, Work, Mosque") },
                    isError = nameError,
                    supportingText = if (nameError) {
                        { Text("Name is required") }
                    } else null,
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )

                OutlinedTextField(
                    value = latitude,
                    onValueChange = {
                        latitude = it
                        latError = false
                    },
                    label = { Text("Latitude") },
                    placeholder = { Text("e.g., 43.6532") },
                    isError = latError,
                    supportingText = if (latError) {
                        { Text("Invalid latitude (-90 to 90)") }
                    } else null,
                    singleLine = true,
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                    modifier = Modifier.fillMaxWidth()
                )

                OutlinedTextField(
                    value = longitude,
                    onValueChange = {
                        longitude = it
                        lonError = false
                    },
                    label = { Text("Longitude") },
                    placeholder = { Text("e.g., -79.3832") },
                    isError = lonError,
                    supportingText = if (lonError) {
                        { Text("Invalid longitude (-180 to 180)") }
                    } else null,
                    singleLine = true,
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                    modifier = Modifier.fillMaxWidth()
                )

                Text(
                    text = "Timezone: $timezone",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        },
        confirmButton = {
            TextButton(
                onClick = {
                    var hasError = false
                    if (name.isBlank()) {
                        nameError = true
                        hasError = true
                    }
                    val lat = latitude.toDoubleOrNull()
                    if (lat == null || lat < -90 || lat > 90) {
                        latError = true
                        hasError = true
                    }
                    val lon = longitude.toDoubleOrNull()
                    if (lon == null || lon < -180 || lon > 180) {
                        lonError = true
                        hasError = true
                    }
                    if (!hasError) {
                        onSave(name.trim(), lat!!, lon!!, timezone)
                    }
                }
            ) {
                Text("Save")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel")
            }
        }
    )
}

@Composable
private fun AdjustmentsDialog(
    preferences: UserPreferences,
    onAdjustmentChanged: (PrayerName, Int) -> Unit,
    onDismiss: () -> Unit
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Time Adjustments") },
        text = {
            Column(
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Text(
                    text = "Adjust prayer times by +/- minutes",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Spacer(modifier = Modifier.height(8.dp))

                PrayerName.ordered.forEach { prayer ->
                    val currentAdjustment = preferences.getAdjustment(prayer)
                    AdjustmentRow(
                        prayerName = PrayerName.displayName(prayer),
                        adjustment = currentAdjustment,
                        onIncrease = { onAdjustmentChanged(prayer, currentAdjustment + 1) },
                        onDecrease = { onAdjustmentChanged(prayer, currentAdjustment - 1) }
                    )
                }
            }
        },
        confirmButton = {
            TextButton(onClick = onDismiss) {
                Text("Done")
            }
        }
    )
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
                    contentDescription = "Decrease",
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
                    contentDescription = "Increase",
                    tint = MaterialTheme.colorScheme.primary
                )
            }
        }
    }
}

@Composable
private fun NotificationSettingsDialog(
    preferences: UserPreferences,
    onPrayerNotificationChanged: (PrayerName, Boolean) -> Unit,
    onDismiss: () -> Unit
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Prayer Notifications") },
        text = {
            Column(
                verticalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                Text(
                    text = "Enable or disable notifications for each prayer",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Spacer(modifier = Modifier.height(8.dp))

                PrayerName.ordered.forEach { prayer ->
                    val isEnabled = preferences.isNotificationEnabled(prayer)
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 4.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = PrayerName.displayName(prayer),
                            style = MaterialTheme.typography.bodyLarge
                        )
                        Switch(
                            checked = isEnabled,
                            onCheckedChange = { onPrayerNotificationChanged(prayer, it) }
                        )
                    }
                }
            }
        },
        confirmButton = {
            TextButton(onClick = onDismiss) {
                Text("Done")
            }
        }
    )
}

@Composable
private fun ThemeDialog(
    currentTheme: String,
    onThemeSelected: (String) -> Unit,
    onDismiss: () -> Unit
) {
    val themes = listOf(
        Triple("system", "System default", Icons.Default.SettingsBrightness),
        Triple("light", "Light", Icons.Default.LightMode),
        Triple("dark", "Dark", Icons.Default.DarkMode)
    )

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Theme") },
        text = {
            Column(modifier = Modifier.selectableGroup()) {
                themes.forEach { (value, label, icon) ->
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .selectable(
                                selected = value == currentTheme,
                                onClick = { onThemeSelected(value) },
                                role = Role.RadioButton
                            )
                            .padding(vertical = 12.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        RadioButton(
                            selected = value == currentTheme,
                            onClick = null
                        )
                        Spacer(modifier = Modifier.width(12.dp))
                        Icon(
                            imageVector = icon,
                            contentDescription = null,
                            tint = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                        Spacer(modifier = Modifier.width(12.dp))
                        Text(
                            text = label,
                            style = MaterialTheme.typography.bodyLarge
                        )
                    }
                }
            }
        },
        confirmButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel")
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
            imageVector = Icons.AutoMirrored.Filled.KeyboardArrowRight,
            contentDescription = null,
            tint = MaterialTheme.colorScheme.onSurfaceVariant
        )
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
