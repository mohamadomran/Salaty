package com.mohamad.salaty.feature.compass

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.mohamad.salaty.core.data.database.dao.LocationDao
import com.mohamad.salaty.core.data.preferences.SalatyPreferences
import com.mohamad.salaty.core.data.qibla.QiblaCalculator
import com.mohamad.salaty.core.data.sensor.CompassSensor
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject
import kotlin.math.roundToInt

/**
 * UI state for Qibla compass screen.
 */
data class QiblaCompassUiState(
    val isLoading: Boolean = true,
    val hasLocation: Boolean = false,
    val locationName: String? = null,
    val qiblaBearing: Float = 0f,
    val currentHeading: Float = 0f,
    val compassAccuracy: Int = 0,
    val distanceToKaaba: Double = 0.0,
    val isCompassAvailable: Boolean = true,
    val needsCalibration: Boolean = false
)

@HiltViewModel
class QiblaCompassViewModel @Inject constructor(
    private val compassSensor: CompassSensor,
    private val qiblaCalculator: QiblaCalculator,
    private val preferences: SalatyPreferences,
    private val locationDao: LocationDao
) : ViewModel() {

    private val _uiState = MutableStateFlow(QiblaCompassUiState())
    val uiState: StateFlow<QiblaCompassUiState> = _uiState.asStateFlow()

    init {
        checkCompassAvailability()
        loadLocationAndStartCompass()
    }

    private fun checkCompassAvailability() {
        val isAvailable = compassSensor.isCompassAvailable()
        _uiState.update { it.copy(isCompassAvailable = isAvailable) }
    }

    private fun loadLocationAndStartCompass() {
        viewModelScope.launch {
            // Get user's selected location from preferences
            val prefs = preferences.userPreferences.first()
            val locationId = prefs.selectedLocationId

            // Get location from database
            val location = if (locationId != null) {
                locationDao.getLocationById(locationId)
            } else {
                // Fall back to default location if no selection
                locationDao.getDefaultLocation()
            }

            if (location != null) {
                val qiblaBearing = qiblaCalculator.calculateQiblaDirection(
                    location.latitude,
                    location.longitude
                ).toFloat()

                val distance = qiblaCalculator.calculateDistanceToKaaba(
                    location.latitude,
                    location.longitude
                )

                _uiState.update {
                    it.copy(
                        isLoading = false,
                        hasLocation = true,
                        locationName = location.name,
                        qiblaBearing = qiblaBearing,
                        distanceToKaaba = distance
                    )
                }

                // Start compass updates
                startCompassUpdates()
            } else {
                _uiState.update {
                    it.copy(
                        isLoading = false,
                        hasLocation = false
                    )
                }
            }
        }
    }

    private fun startCompassUpdates() {
        viewModelScope.launch {
            compassSensor.getCompassHeading().collect { compassData ->
                _uiState.update {
                    it.copy(
                        currentHeading = compassData.azimuth,
                        compassAccuracy = compassData.accuracy,
                        needsCalibration = compassData.accuracy <= android.hardware.SensorManager.SENSOR_STATUS_ACCURACY_LOW
                    )
                }
            }
        }
    }

    /**
     * Get the rotation angle needed to point to Qibla.
     *
     * This is the difference between Qibla bearing and current device heading.
     * The result can be used to rotate a Qibla arrow on screen.
     */
    fun getQiblaRotation(): Float {
        val state = _uiState.value
        return (state.qiblaBearing - state.currentHeading + 360) % 360
    }

    /**
     * Get compass rotation for the dial (opposite of heading).
     * The dial should rotate opposite to the device heading.
     */
    fun getCompassRotation(): Float {
        return -_uiState.value.currentHeading
    }

    /**
     * Format distance to Kaaba for display.
     */
    fun formatDistance(distance: Double): String {
        return when {
            distance < 1 -> "${(distance * 1000).roundToInt()} m"
            distance < 100 -> "%.1f km".format(distance)
            else -> "${distance.roundToInt()} km"
        }
    }

    /**
     * Get cardinal direction for current heading.
     */
    fun getCurrentCardinalDirection(): String {
        return qiblaCalculator.getCardinalDirection(_uiState.value.currentHeading.toDouble())
    }
}
