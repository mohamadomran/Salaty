package com.mohamad.salaty.feature.onboarding

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.mohamad.salaty.core.data.location.LocationResult
import com.mohamad.salaty.core.data.location.LocationService
import com.mohamad.salaty.core.data.preferences.SalatyPreferences
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/**
 * Onboarding page definitions
 */
enum class OnboardingPage {
    WELCOME,
    LOCATION,
    NOTIFICATIONS,
    COMPLETE
}

/**
 * UI state for onboarding
 */
data class OnboardingUiState(
    val currentPage: OnboardingPage = OnboardingPage.WELCOME,
    val isLocationDetecting: Boolean = false,
    val locationDetected: Boolean = false,
    val locationName: String? = null,
    val notificationsEnabled: Boolean = false,
    val isCompleting: Boolean = false
)

@HiltViewModel
class OnboardingViewModel @Inject constructor(
    private val preferences: SalatyPreferences,
    private val locationService: LocationService
) : ViewModel() {

    private val _uiState = MutableStateFlow(OnboardingUiState())
    val uiState: StateFlow<OnboardingUiState> = _uiState.asStateFlow()

    /**
     * Navigate to next page
     */
    fun nextPage() {
        _uiState.update { state ->
            val nextPage = when (state.currentPage) {
                OnboardingPage.WELCOME -> OnboardingPage.LOCATION
                OnboardingPage.LOCATION -> OnboardingPage.NOTIFICATIONS
                OnboardingPage.NOTIFICATIONS -> OnboardingPage.COMPLETE
                OnboardingPage.COMPLETE -> OnboardingPage.COMPLETE
            }
            state.copy(currentPage = nextPage)
        }
    }

    /**
     * Navigate to previous page
     */
    fun previousPage() {
        _uiState.update { state ->
            val prevPage = when (state.currentPage) {
                OnboardingPage.WELCOME -> OnboardingPage.WELCOME
                OnboardingPage.LOCATION -> OnboardingPage.WELCOME
                OnboardingPage.NOTIFICATIONS -> OnboardingPage.LOCATION
                OnboardingPage.COMPLETE -> OnboardingPage.NOTIFICATIONS
            }
            state.copy(currentPage = prevPage)
        }
    }

    /**
     * Navigate to specific page
     */
    fun goToPage(page: OnboardingPage) {
        _uiState.update { it.copy(currentPage = page) }
    }

    /**
     * Detect user's current location
     */
    fun detectLocation() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLocationDetecting = true) }

            when (val result = locationService.detectLocation()) {
                is LocationResult.Success -> {
                    _uiState.update {
                        it.copy(
                            isLocationDetecting = false,
                            locationDetected = true,
                            locationName = result.location.name
                        )
                    }
                }
                is LocationResult.Error, LocationResult.PermissionDenied -> {
                    _uiState.update {
                        it.copy(
                            isLocationDetecting = false,
                            locationDetected = false
                        )
                    }
                }
            }
        }
    }

    /**
     * Skip location setup
     */
    fun skipLocation() {
        nextPage()
    }

    /**
     * Mark notifications as enabled
     */
    fun setNotificationsEnabled(enabled: Boolean) {
        viewModelScope.launch {
            preferences.setNotificationsEnabled(enabled)
            _uiState.update { it.copy(notificationsEnabled = enabled) }
        }
    }

    /**
     * Skip notification setup
     */
    fun skipNotifications() {
        nextPage()
    }

    /**
     * Complete onboarding and mark as done
     */
    fun completeOnboarding(onComplete: () -> Unit) {
        viewModelScope.launch {
            _uiState.update { it.copy(isCompleting = true) }
            preferences.setOnboardingCompleted(true)
            preferences.setFirstLaunchDate(System.currentTimeMillis())
            onComplete()
        }
    }
}
