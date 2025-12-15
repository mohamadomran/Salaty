package com.mohamad.salaty.feature.settings

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.mohamad.salaty.core.data.database.entity.LocationEntity
import com.mohamad.salaty.core.data.location.LocationResult
import com.mohamad.salaty.core.data.location.LocationService
import com.mohamad.salaty.core.data.preferences.SalatyPreferences
import com.mohamad.salaty.core.data.preferences.UserPreferences
import com.mohamad.salaty.core.data.repository.PrayerRepository
import com.mohamad.salaty.core.domain.model.CalculationMethod
import com.mohamad.salaty.core.domain.model.HighLatitudeRule
import com.mohamad.salaty.core.domain.model.Madhab
import com.mohamad.salaty.core.domain.model.PrayerName
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/**
 * UI state for the Settings screen.
 */
data class SettingsUiState(
    val preferences: UserPreferences = UserPreferences(),
    val locations: List<LocationEntity> = emptyList(),
    val currentLocation: LocationEntity? = null,
    val isLoading: Boolean = true,
    val isDetectingLocation: Boolean = false,
    val error: String? = null
)

@HiltViewModel
class SettingsViewModel @Inject constructor(
    private val salatyPreferences: SalatyPreferences,
    private val prayerRepository: PrayerRepository,
    private val locationService: LocationService
) : ViewModel() {

    private val _uiState = MutableStateFlow(SettingsUiState())
    val uiState: StateFlow<SettingsUiState> = _uiState.asStateFlow()

    init {
        loadData()
    }

    private fun loadData() {
        viewModelScope.launch {
            combine(
                salatyPreferences.userPreferences,
                prayerRepository.getAllLocations(),
                prayerRepository.getDefaultLocation()
            ) { prefs, locations, currentLocation ->
                Triple(prefs, locations, currentLocation)
            }.collect { (prefs, locations, currentLocation) ->
                _uiState.update {
                    it.copy(
                        preferences = prefs,
                        locations = locations,
                        currentLocation = currentLocation,
                        isLoading = false
                    )
                }
            }
        }
    }

    // ============================================================================
    // LOCATION SETTINGS
    // ============================================================================

    fun saveLocation(
        name: String,
        latitude: Double,
        longitude: Double,
        timezone: String,
        setAsDefault: Boolean = true
    ) {
        viewModelScope.launch {
            try {
                prayerRepository.saveLocation(
                    name = name,
                    latitude = latitude,
                    longitude = longitude,
                    timezone = timezone,
                    setAsDefault = setAsDefault
                )
            } catch (e: Exception) {
                _uiState.update { it.copy(error = e.message) }
            }
        }
    }

    fun setDefaultLocation(locationId: Long) {
        viewModelScope.launch {
            prayerRepository.setDefaultLocation(locationId)
        }
    }

    fun deleteLocation(locationId: Long) {
        viewModelScope.launch {
            prayerRepository.deleteLocation(locationId)
        }
    }

    /**
     * Detect current location using GPS.
     * Requires location permission to be granted.
     */
    fun detectLocation() {
        viewModelScope.launch {
            _uiState.update { it.copy(isDetectingLocation = true, error = null) }

            when (val result = locationService.detectLocation()) {
                is LocationResult.Success -> {
                    val location = result.location
                    // Save the detected location
                    prayerRepository.saveLocation(
                        name = location.name,
                        latitude = location.latitude,
                        longitude = location.longitude,
                        timezone = location.timezone,
                        setAsDefault = true
                    )
                    _uiState.update { it.copy(isDetectingLocation = false) }
                }
                is LocationResult.Error -> {
                    _uiState.update {
                        it.copy(
                            isDetectingLocation = false,
                            error = result.message
                        )
                    }
                }
                LocationResult.PermissionDenied -> {
                    _uiState.update {
                        it.copy(
                            isDetectingLocation = false,
                            error = "Location permission is required to detect your location"
                        )
                    }
                }
            }
        }
    }

    /**
     * Check if location permission is granted.
     */
    fun hasLocationPermission(): Boolean {
        return locationService.hasLocationPermission()
    }

    // ============================================================================
    // CALCULATION SETTINGS
    // ============================================================================

    fun setCalculationMethod(method: CalculationMethod) {
        viewModelScope.launch {
            salatyPreferences.setCalculationMethod(method)
        }
    }

    fun setMadhab(madhab: Madhab) {
        viewModelScope.launch {
            salatyPreferences.setMadhab(madhab)
        }
    }

    fun setHighLatitudeRule(rule: HighLatitudeRule) {
        viewModelScope.launch {
            salatyPreferences.setHighLatitudeRule(rule.name.lowercase())
        }
    }

    fun setPrayerAdjustment(prayerName: PrayerName, minutes: Int) {
        viewModelScope.launch {
            salatyPreferences.setPrayerAdjustment(prayerName, minutes)
        }
    }

    // ============================================================================
    // NOTIFICATION SETTINGS
    // ============================================================================

    fun setNotificationsEnabled(enabled: Boolean) {
        viewModelScope.launch {
            salatyPreferences.setNotificationsEnabled(enabled)
        }
    }

    fun setPrayerNotificationEnabled(prayerName: PrayerName, enabled: Boolean) {
        viewModelScope.launch {
            salatyPreferences.setPrayerNotificationEnabled(prayerName, enabled)
        }
    }

    fun setNotificationMinutesBefore(minutes: Int) {
        viewModelScope.launch {
            salatyPreferences.setNotificationMinutesBefore(minutes)
        }
    }

    fun setNotificationSound(sound: String) {
        viewModelScope.launch {
            salatyPreferences.setNotificationSound(sound)
        }
    }

    fun setNotificationVibrate(vibrate: Boolean) {
        viewModelScope.launch {
            salatyPreferences.setNotificationVibrate(vibrate)
        }
    }

    // ============================================================================
    // APPEARANCE SETTINGS
    // ============================================================================

    fun setThemeMode(mode: String) {
        viewModelScope.launch {
            salatyPreferences.setThemeMode(mode)
        }
    }

    fun setDynamicColors(enabled: Boolean) {
        viewModelScope.launch {
            salatyPreferences.setDynamicColors(enabled)
        }
    }

    fun setLanguage(language: String) {
        viewModelScope.launch {
            salatyPreferences.setLanguage(language)
        }
    }

    fun setTimeFormat24h(is24h: Boolean) {
        viewModelScope.launch {
            salatyPreferences.setTimeFormat24h(is24h)
        }
    }

    fun clearError() {
        _uiState.update { it.copy(error = null) }
    }
}
