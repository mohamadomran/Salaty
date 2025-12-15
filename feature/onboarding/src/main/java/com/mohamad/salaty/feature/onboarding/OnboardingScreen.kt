package com.mohamad.salaty.feature.onboarding

import android.Manifest
import android.os.Build
import androidx.compose.animation.AnimatedContent
import androidx.compose.foundation.background
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
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Mosque
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.Celebration
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.FilledTonalButton
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.google.accompanist.permissions.ExperimentalPermissionsApi
import com.google.accompanist.permissions.isGranted
import com.google.accompanist.permissions.rememberPermissionState

/**
 * Main Onboarding Screen
 *
 * Guides new users through initial setup:
 * 1. Welcome
 * 2. Location setup
 * 3. Notification permissions
 * 4. Completion
 */
@OptIn(ExperimentalPermissionsApi::class)
@Composable
fun OnboardingScreen(
    onComplete: () -> Unit,
    modifier: Modifier = Modifier,
    viewModel: OnboardingViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()

    // Location permission
    val locationPermission = rememberPermissionState(Manifest.permission.ACCESS_FINE_LOCATION)

    // Notification permission (Android 13+)
    val notificationPermission = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
        rememberPermissionState(Manifest.permission.POST_NOTIFICATIONS)
    } else null

    Column(
        modifier = modifier
            .fillMaxSize()
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        // Progress indicator
        PageIndicator(
            currentPage = uiState.currentPage,
            modifier = Modifier.padding(top = 16.dp, bottom = 32.dp)
        )

        // Page content
        AnimatedContent(
            targetState = uiState.currentPage,
            modifier = Modifier.weight(1f),
            label = "onboarding_page"
        ) { page ->
            when (page) {
                OnboardingPage.WELCOME -> WelcomePage(
                    onNext = { viewModel.nextPage() }
                )
                OnboardingPage.LOCATION -> LocationPage(
                    isDetecting = uiState.isLocationDetecting,
                    locationDetected = uiState.locationDetected,
                    locationName = uiState.locationName,
                    hasPermission = locationPermission.status.isGranted,
                    onRequestPermission = { locationPermission.launchPermissionRequest() },
                    onDetectLocation = { viewModel.detectLocation() },
                    onSkip = { viewModel.skipLocation() },
                    onNext = { viewModel.nextPage() }
                )
                OnboardingPage.NOTIFICATIONS -> NotificationsPage(
                    hasPermission = notificationPermission?.status?.isGranted ?: true,
                    onRequestPermission = { notificationPermission?.launchPermissionRequest() },
                    onEnable = {
                        viewModel.setNotificationsEnabled(true)
                        viewModel.nextPage()
                    },
                    onSkip = { viewModel.skipNotifications() }
                )
                OnboardingPage.COMPLETE -> CompletePage(
                    isCompleting = uiState.isCompleting,
                    onComplete = { viewModel.completeOnboarding(onComplete) }
                )
            }
        }
    }
}

@Composable
private fun PageIndicator(
    currentPage: OnboardingPage,
    modifier: Modifier = Modifier
) {
    val pages = OnboardingPage.entries
    val currentIndex = pages.indexOf(currentPage)

    Row(
        modifier = modifier,
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        pages.forEachIndexed { index, _ ->
            Box(
                modifier = Modifier
                    .size(if (index == currentIndex) 24.dp else 8.dp, 8.dp)
                    .clip(CircleShape)
                    .background(
                        if (index <= currentIndex)
                            MaterialTheme.colorScheme.primary
                        else
                            MaterialTheme.colorScheme.surfaceVariant
                    )
            )
        }
    }
}

@Composable
private fun WelcomePage(
    onNext: () -> Unit
) {
    OnboardingPageContent(
        icon = Icons.Default.Mosque,
        title = stringResource(R.string.onboarding_welcome_title),
        description = stringResource(R.string.onboarding_welcome_description),
        primaryButton = stringResource(R.string.onboarding_get_started),
        onPrimaryClick = onNext
    )
}

@Composable
private fun LocationPage(
    isDetecting: Boolean,
    locationDetected: Boolean,
    locationName: String?,
    hasPermission: Boolean,
    onRequestPermission: () -> Unit,
    onDetectLocation: () -> Unit,
    onSkip: () -> Unit,
    onNext: () -> Unit
) {
    LaunchedEffect(hasPermission) {
        if (hasPermission && !locationDetected) {
            onDetectLocation()
        }
    }

    OnboardingPageContent(
        icon = Icons.Default.LocationOn,
        title = stringResource(R.string.onboarding_location_title),
        description = stringResource(R.string.onboarding_location_description),
        content = {
            if (isDetecting) {
                CircularProgressIndicator(
                    modifier = Modifier.size(48.dp),
                    color = MaterialTheme.colorScheme.primary
                )
                Spacer(modifier = Modifier.height(16.dp))
                Text(
                    text = stringResource(R.string.onboarding_detecting_location),
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            } else if (locationDetected && locationName != null) {
                Icon(
                    imageVector = Icons.Default.Check,
                    contentDescription = null,
                    modifier = Modifier.size(48.dp),
                    tint = MaterialTheme.colorScheme.primary
                )
                Spacer(modifier = Modifier.height(16.dp))
                Text(
                    text = locationName,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.SemiBold,
                    color = MaterialTheme.colorScheme.onSurface
                )
            }
        },
        primaryButton = when {
            locationDetected -> stringResource(R.string.onboarding_continue)
            hasPermission -> stringResource(R.string.onboarding_detect_location)
            else -> stringResource(R.string.onboarding_grant_permission)
        },
        onPrimaryClick = when {
            locationDetected -> onNext
            hasPermission -> onDetectLocation
            else -> onRequestPermission
        },
        secondaryButton = stringResource(R.string.onboarding_skip),
        onSecondaryClick = onSkip
    )
}

@Composable
private fun NotificationsPage(
    hasPermission: Boolean,
    onRequestPermission: () -> Unit,
    onEnable: () -> Unit,
    onSkip: () -> Unit
) {
    OnboardingPageContent(
        icon = Icons.Default.Notifications,
        title = stringResource(R.string.onboarding_notifications_title),
        description = stringResource(R.string.onboarding_notifications_description),
        primaryButton = if (hasPermission)
            stringResource(R.string.onboarding_enable_notifications)
        else
            stringResource(R.string.onboarding_grant_permission),
        onPrimaryClick = if (hasPermission) onEnable else onRequestPermission,
        secondaryButton = stringResource(R.string.onboarding_skip),
        onSecondaryClick = onSkip
    )
}

@Composable
private fun CompletePage(
    isCompleting: Boolean,
    onComplete: () -> Unit
) {
    OnboardingPageContent(
        icon = Icons.Default.Celebration,
        title = stringResource(R.string.onboarding_complete_title),
        description = stringResource(R.string.onboarding_complete_description),
        primaryButton = stringResource(R.string.onboarding_start_app),
        onPrimaryClick = onComplete,
        isLoading = isCompleting
    )
}

@Composable
private fun OnboardingPageContent(
    icon: ImageVector,
    title: String,
    description: String,
    primaryButton: String,
    onPrimaryClick: () -> Unit,
    modifier: Modifier = Modifier,
    content: @Composable (() -> Unit)? = null,
    secondaryButton: String? = null,
    onSecondaryClick: (() -> Unit)? = null,
    isLoading: Boolean = false
) {
    Column(
        modifier = modifier.fillMaxSize(),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Icon(
            imageVector = icon,
            contentDescription = null,
            modifier = Modifier.size(120.dp),
            tint = MaterialTheme.colorScheme.primary
        )

        Spacer(modifier = Modifier.height(32.dp))

        Text(
            text = title,
            style = MaterialTheme.typography.headlineMedium,
            fontWeight = FontWeight.Bold,
            textAlign = TextAlign.Center,
            color = MaterialTheme.colorScheme.onBackground
        )

        Spacer(modifier = Modifier.height(16.dp))

        Text(
            text = description,
            style = MaterialTheme.typography.bodyLarge,
            textAlign = TextAlign.Center,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            modifier = Modifier.padding(horizontal = 16.dp)
        )

        if (content != null) {
            Spacer(modifier = Modifier.height(32.dp))
            content()
        }

        Spacer(modifier = Modifier.weight(1f))

        Button(
            onClick = onPrimaryClick,
            enabled = !isLoading,
            modifier = Modifier
                .fillMaxWidth()
                .height(56.dp)
        ) {
            if (isLoading) {
                CircularProgressIndicator(
                    modifier = Modifier.size(24.dp),
                    color = MaterialTheme.colorScheme.onPrimary
                )
            } else {
                Text(primaryButton)
                Icon(
                    imageVector = Icons.AutoMirrored.Filled.ArrowForward,
                    contentDescription = null,
                    modifier = Modifier.padding(start = 8.dp)
                )
            }
        }

        if (secondaryButton != null && onSecondaryClick != null) {
            Spacer(modifier = Modifier.height(12.dp))
            TextButton(
                onClick = onSecondaryClick,
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(secondaryButton)
            }
        }

        Spacer(modifier = Modifier.height(16.dp))
    }
}
