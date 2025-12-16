package com.mohamad.salaty.feature.home

import android.Manifest
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
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.MyLocation
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.FilledTonalButton
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.ui.platform.LocalSoftwareKeyboardController
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.google.accompanist.permissions.ExperimentalPermissionsApi
import com.google.accompanist.permissions.isGranted
import com.google.accompanist.permissions.rememberPermissionState
import com.mohamad.salaty.feature.home.R
import com.mohamad.salaty.core.designsystem.component.SalatyCard
import com.mohamad.salaty.core.designsystem.component.SalatyElevatedCard
import com.mohamad.salaty.core.designsystem.localizedName
import com.mohamad.salaty.core.domain.model.DailyPrayerTimes
import com.mohamad.salaty.core.domain.model.HijriDate
import com.mohamad.salaty.core.domain.model.PrayerName
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.LocalTime
import java.time.format.DateTimeFormatter

/**
 * Home Screen - Prayer Times Display
 *
 * Shows current prayer times with countdown to next prayer.
 * Material Design 3 Expressive UI.
 */
@OptIn(ExperimentalPermissionsApi::class)
@Composable
fun HomeScreen(
    modifier: Modifier = Modifier,
    viewModel: HomeViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()

    // Location permission state
    val locationPermission = rememberPermissionState(Manifest.permission.ACCESS_FINE_LOCATION)

    // Auto-detect location when permission is granted
    LaunchedEffect(locationPermission.status.isGranted) {
        if (locationPermission.status.isGranted && !uiState.hasLocation && !uiState.isDetectingLocation) {
            viewModel.detectLocation()
        }
    }

    when {
        uiState.isLoading && uiState.hasLocation -> {
            LoadingContent(modifier)
        }
        uiState.error != null && uiState.hasLocation -> {
            ErrorContent(
                error = uiState.error!!,
                onRetry = viewModel::refresh,
                modifier = modifier
            )
        }
        !uiState.hasLocation -> {
            NoLocationContent(
                locationQuery = uiState.locationQuery,
                isDetecting = uiState.isDetectingLocation,
                locationError = uiState.locationError,
                onQueryChange = viewModel::updateLocationQuery,
                onDetectLocation = {
                    if (locationPermission.status.isGranted) {
                        viewModel.detectLocation()
                    } else {
                        locationPermission.launchPermissionRequest()
                    }
                },
                onSearchLocation = viewModel::searchAndSetLocation,
                modifier = modifier
            )
        }
        uiState.prayerTimes != null -> {
            PrayerTimesContent(
                prayerTimes = uiState.prayerTimes!!,
                hijriDate = uiState.hijriDate,
                nextPrayer = uiState.nextPrayer,
                currentPrayer = uiState.currentPrayer,
                countdown = uiState.formattedCountdown,
                use24hFormat = uiState.use24hFormat,
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
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            CircularProgressIndicator(
                color = MaterialTheme.colorScheme.primary
            )
            Text(
                text = stringResource(R.string.home_loading_prayer_times),
                style = MaterialTheme.typography.bodyLarge,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

@Composable
private fun ErrorContent(
    error: String,
    onRetry: () -> Unit,
    modifier: Modifier = Modifier
) {
    Box(
        modifier = modifier.fillMaxSize(),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(16.dp),
            modifier = Modifier.padding(24.dp)
        ) {
            Text(
                text = stringResource(R.string.home_error_title),
                style = MaterialTheme.typography.headlineSmall,
                color = MaterialTheme.colorScheme.error
            )
            Text(
                text = error,
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                textAlign = TextAlign.Center
            )
            FilledTonalButton(onClick = onRetry) {
                Text(stringResource(R.string.home_retry))
            }
        }
    }
}

@Composable
private fun NoLocationContent(
    locationQuery: String,
    isDetecting: Boolean,
    locationError: String?,
    onQueryChange: (String) -> Unit,
    onDetectLocation: () -> Unit,
    onSearchLocation: () -> Unit,
    modifier: Modifier = Modifier
) {
    val keyboardController = LocalSoftwareKeyboardController.current

    Box(
        modifier = modifier.fillMaxSize(),
        contentAlignment = Alignment.Center
    ) {
        SalatyElevatedCard(
            modifier = Modifier.padding(24.dp)
        ) {
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(16.dp),
                modifier = Modifier.padding(32.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.MyLocation,
                    contentDescription = null,
                    modifier = Modifier.size(64.dp),
                    tint = MaterialTheme.colorScheme.primary
                )

                Text(
                    text = stringResource(R.string.home_set_location_title),
                    style = MaterialTheme.typography.headlineSmall,
                    fontWeight = FontWeight.Bold
                )

                Text(
                    text = stringResource(R.string.home_set_location_description),
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    textAlign = TextAlign.Center
                )

                // GPS Button
                Button(
                    onClick = onDetectLocation,
                    enabled = !isDetecting,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    if (isDetecting) {
                        CircularProgressIndicator(
                            modifier = Modifier.size(18.dp),
                            color = MaterialTheme.colorScheme.onPrimary,
                            strokeWidth = 2.dp
                        )
                    } else {
                        Icon(
                            imageVector = Icons.Default.MyLocation,
                            contentDescription = null,
                            modifier = Modifier.size(18.dp)
                        )
                    }
                    Spacer(modifier = Modifier.size(8.dp))
                    Text(
                        if (isDetecting) stringResource(R.string.home_detecting_location)
                        else stringResource(R.string.home_use_gps)
                    )
                }

                // Divider with "or"
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    HorizontalDivider(modifier = Modifier.weight(1f))
                    Text(
                        text = stringResource(R.string.home_or),
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        modifier = Modifier.padding(horizontal = 16.dp)
                    )
                    HorizontalDivider(modifier = Modifier.weight(1f))
                }

                // Manual location entry
                OutlinedTextField(
                    value = locationQuery,
                    onValueChange = onQueryChange,
                    label = { Text(stringResource(R.string.home_enter_location)) },
                    singleLine = true,
                    enabled = !isDetecting,
                    modifier = Modifier.fillMaxWidth(),
                    trailingIcon = {
                        IconButton(
                            onClick = {
                                keyboardController?.hide()
                                onSearchLocation()
                            },
                            enabled = locationQuery.isNotBlank() && !isDetecting
                        ) {
                            Icon(
                                imageVector = Icons.Default.Search,
                                contentDescription = stringResource(R.string.home_search)
                            )
                        }
                    },
                    keyboardOptions = KeyboardOptions(imeAction = ImeAction.Search),
                    keyboardActions = KeyboardActions(
                        onSearch = {
                            keyboardController?.hide()
                            onSearchLocation()
                        }
                    )
                )

                // Error message
                if (locationError != null) {
                    Text(
                        text = locationError,
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.error
                    )
                }
            }
        }
    }
}

@Composable
private fun PrayerTimesContent(
    prayerTimes: DailyPrayerTimes,
    hijriDate: HijriDate?,
    nextPrayer: PrayerName?,
    currentPrayer: PrayerName?,
    countdown: String,
    use24hFormat: Boolean,
    modifier: Modifier = Modifier
) {
    val timePattern = if (use24hFormat) "HH:mm" else "hh:mm a"
    val currentDate = prayerTimes.date
    val now = LocalTime.now()

    Column(
        modifier = modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Header
        Text(
            text = stringResource(R.string.home_prayer_times_title),
            style = MaterialTheme.typography.headlineMedium,
            color = MaterialTheme.colorScheme.onBackground
        )

        // Date Section (Gregorian & Hijri)
        Column(
            modifier = Modifier.fillMaxWidth(),
            verticalArrangement = Arrangement.spacedBy(4.dp)
        ) {
            // Gregorian Date
            Text(
                text = currentDate.format(DateTimeFormatter.ofPattern("EEEE, MMMM d, yyyy")),
                style = MaterialTheme.typography.bodyLarge,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )

            // Hijri Date
            if (hijriDate != null) {
                Text(
                    text = stringResource(
                        R.string.home_hijri_date_format,
                        hijriDate.day,
                        hijriDate.monthName,
                        hijriDate.year
                    ),
                    style = MaterialTheme.typography.bodyMedium,
                    fontWeight = FontWeight.Medium,
                    color = MaterialTheme.colorScheme.primary
                )
            }
        }

        // Next Prayer Countdown Card
        if (nextPrayer != null) {
            val nextPrayerTime = prayerTimes.getTime(nextPrayer)

            SalatyElevatedCard(
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(24.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = stringResource(R.string.home_next_prayer),
                        style = MaterialTheme.typography.labelLarge,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )

                    Spacer(modifier = Modifier.height(8.dp))

                    Text(
                        text = nextPrayer.localizedName(),
                        style = MaterialTheme.typography.headlineLarge,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.primary
                    )

                    Text(
                        text = nextPrayerTime.format(DateTimeFormatter.ofPattern(timePattern)),
                        style = MaterialTheme.typography.titleMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )

                    Spacer(modifier = Modifier.height(16.dp))

                    // Countdown
                    Text(
                        text = countdown,
                        style = MaterialTheme.typography.displayMedium,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSurface
                    )

                    Text(
                        text = stringResource(R.string.home_remaining),
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
        }

        // All Prayer Times Card
        SalatyCard(
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp)
            ) {
                Text(
                    text = stringResource(R.string.home_todays_prayer_times),
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.SemiBold,
                    modifier = Modifier.padding(bottom = 16.dp)
                )

                PrayerName.ordered.forEachIndexed { index, prayer ->
                    val prayerTime = prayerTimes.getTime(prayer).toLocalTime()
                    val isNext = prayer == nextPrayer
                    val isPassed = prayerTime.isBefore(now) && prayer != nextPrayer

                    PrayerTimeRow(
                        name = prayer.localizedName(),
                        time = prayerTime,
                        isNext = isNext,
                        isPassed = isPassed,
                        timePattern = timePattern
                    )

                    if (index < PrayerName.ordered.size - 1) {
                        HorizontalDivider(
                            modifier = Modifier.padding(vertical = 12.dp),
                            color = MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f)
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun PrayerTimeRow(
    name: String,
    time: LocalTime,
    isNext: Boolean,
    isPassed: Boolean,
    timePattern: String = "hh:mm a"
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(
            text = name,
            style = MaterialTheme.typography.titleMedium,
            fontWeight = if (isNext) FontWeight.Bold else FontWeight.Normal,
            color = when {
                isNext -> MaterialTheme.colorScheme.primary
                isPassed -> MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.6f)
                else -> MaterialTheme.colorScheme.onSurface
            }
        )

        Text(
            text = time.format(DateTimeFormatter.ofPattern(timePattern)),
            style = MaterialTheme.typography.bodyLarge,
            fontWeight = if (isNext) FontWeight.Bold else FontWeight.Normal,
            color = when {
                isNext -> MaterialTheme.colorScheme.primary
                isPassed -> MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.6f)
                else -> MaterialTheme.colorScheme.onSurface
            }
        )
    }
}
