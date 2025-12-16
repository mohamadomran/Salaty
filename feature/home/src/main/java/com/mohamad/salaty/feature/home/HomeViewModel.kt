package com.mohamad.salaty.feature.home

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.mohamad.salaty.core.data.calendar.HijriDateConverter
import com.mohamad.salaty.core.data.location.LocationResult
import com.mohamad.salaty.core.data.location.LocationService
import com.mohamad.salaty.core.data.repository.PrayerRepository
import com.mohamad.salaty.core.domain.model.DailyPrayerTimes
import com.mohamad.salaty.core.domain.model.HijriDate
import com.mohamad.salaty.core.domain.model.PrayerName
import com.mohamad.salaty.core.domain.model.PrayerStatus
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import java.time.LocalDate
import javax.inject.Inject

/**
 * UI state for the Home screen.
 */
data class HomeUiState(
    val prayerTimes: DailyPrayerTimes? = null,
    val hijriDate: HijriDate? = null,
    val currentPrayer: PrayerName? = null,
    val nextPrayer: PrayerName? = null,
    val secondsUntilNextPrayer: Long? = null,
    val prayerStatuses: Map<PrayerName, PrayerStatus> = emptyMap(),
    val hasLocation: Boolean = false,
    val isLoading: Boolean = true,
    val error: String? = null,
    val use24hFormat: Boolean = false,
    // Location setup state
    val isDetectingLocation: Boolean = false,
    val locationQuery: String = "",
    val locationError: String? = null
) {
    val formattedCountdown: String
        get() {
            val seconds = secondsUntilNextPrayer ?: return "--:--:--"
            val hours = seconds / 3600
            val minutes = (seconds % 3600) / 60
            val secs = seconds % 60
            return String.format("%02d:%02d:%02d", hours, minutes, secs)
        }
}

@HiltViewModel
class HomeViewModel @Inject constructor(
    private val prayerRepository: PrayerRepository,
    private val hijriDateConverter: HijriDateConverter,
    private val locationService: LocationService,
    @dagger.hilt.android.qualifiers.ApplicationContext private val context: android.content.Context
) : ViewModel() {

    companion object {
        private const val ACTION_REFRESH_WIDGETS = "com.mohamad.salaty.REFRESH_WIDGETS"
    }

    private fun refreshWidgets() {
        val intent = android.content.Intent(ACTION_REFRESH_WIDGETS)
        intent.setPackage(context.packageName)
        context.sendBroadcast(intent)
    }

    private val _uiState = MutableStateFlow(HomeUiState())
    val uiState: StateFlow<HomeUiState> = _uiState.asStateFlow()

    init {
        observeLocation()
        observePreferences()
        loadData()
        startCountdownTimer()
    }

    /**
     * Observe user preferences for time format changes.
     */
    private fun observePreferences() {
        viewModelScope.launch {
            prayerRepository.userPreferences.collect { prefs ->
                _uiState.update { it.copy(use24hFormat = prefs.timeFormat24h) }
            }
        }
    }

    /**
     * Observe location changes reactively.
     * When location is added/changed, refresh prayer times.
     */
    private fun observeLocation() {
        viewModelScope.launch {
            prayerRepository.observeCurrentLocation().collect { location ->
                val hasLocation = location != null
                val currentHasLocation = _uiState.value.hasLocation

                _uiState.update { it.copy(hasLocation = hasLocation) }

                // Refresh prayer times when location changes (was null -> now has location)
                if (hasLocation && !currentHasLocation) {
                    loadData()
                }
            }
        }
    }

    private fun loadData() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, error = null) }

            try {
                // Load prayer times
                val prayerTimes = prayerRepository.getTodayPrayerTimes()

                // Get Hijri date for today
                val hijriDate = hijriDateConverter.today()

                // Get current and next prayer
                val (current, next) = prayerRepository.getCurrentAndNextPrayer()

                // Get seconds until next prayer
                val secondsUntil = prayerRepository.getSecondsUntilNextPrayer()

                _uiState.update {
                    it.copy(
                        prayerTimes = prayerTimes,
                        hijriDate = hijriDate,
                        currentPrayer = current,
                        nextPrayer = next,
                        secondsUntilNextPrayer = secondsUntil,
                        isLoading = false
                    )
                }

                // Observe prayer records
                observePrayerRecords()

            } catch (e: Exception) {
                _uiState.update {
                    it.copy(
                        isLoading = false,
                        error = e.message ?: "Failed to load prayer times"
                    )
                }
            }
        }
    }

    private fun observePrayerRecords() {
        viewModelScope.launch {
            prayerRepository.getRecordsByDate(LocalDate.now()).collect { records ->
                val statuses = records.associate { it.prayerName to it.status }
                _uiState.update { it.copy(prayerStatuses = statuses) }
            }
        }
    }

    private fun startCountdownTimer() {
        viewModelScope.launch {
            while (true) {
                delay(1000L)
                _uiState.update { state ->
                    state.secondsUntilNextPrayer?.let { seconds ->
                        if (seconds > 0) {
                            state.copy(secondsUntilNextPrayer = seconds - 1)
                        } else {
                            // Time's up, refresh data
                            loadData()
                            state
                        }
                    } ?: state
                }
            }
        }
    }

    fun markPrayerAsCompleted(prayerName: PrayerName) {
        viewModelScope.launch {
            prayerRepository.updatePrayerStatus(
                date = LocalDate.now(),
                prayerName = prayerName,
                status = PrayerStatus.PRAYED
            )
        }
    }

    fun markPrayerAsMissed(prayerName: PrayerName) {
        viewModelScope.launch {
            prayerRepository.updatePrayerStatus(
                date = LocalDate.now(),
                prayerName = prayerName,
                status = PrayerStatus.MISSED
            )
        }
    }

    fun refresh() {
        loadData()
    }

    // Location setup methods
    fun updateLocationQuery(query: String) {
        _uiState.update { it.copy(locationQuery = query, locationError = null) }
    }

    fun detectLocation() {
        viewModelScope.launch {
            _uiState.update { it.copy(isDetectingLocation = true, locationError = null) }

            when (val result = locationService.detectLocation()) {
                is LocationResult.Success -> {
                    // Save location and set as default
                    val locationId = prayerRepository.saveLocation(
                        name = result.location.name,
                        latitude = result.location.latitude,
                        longitude = result.location.longitude,
                        timezone = result.location.timezone,
                        setAsDefault = true
                    )
                    _uiState.update { it.copy(isDetectingLocation = false) }
                    // Refresh widgets with new location
                    refreshWidgets()
                    // observeLocation will trigger refresh
                }
                is LocationResult.Error -> {
                    _uiState.update {
                        it.copy(
                            isDetectingLocation = false,
                            locationError = result.message
                        )
                    }
                }
                LocationResult.PermissionDenied -> {
                    _uiState.update {
                        it.copy(
                            isDetectingLocation = false,
                            locationError = "Location permission denied"
                        )
                    }
                }
            }
        }
    }

    fun searchAndSetLocation() {
        val query = _uiState.value.locationQuery.trim()
        if (query.isEmpty()) return

        viewModelScope.launch {
            _uiState.update { it.copy(isDetectingLocation = true, locationError = null) }

            when (val result = locationService.geocodeLocationName(query)) {
                is LocationResult.Success -> {
                    // Save location and set as default
                    val locationId = prayerRepository.saveLocation(
                        name = result.location.name,
                        latitude = result.location.latitude,
                        longitude = result.location.longitude,
                        timezone = result.location.timezone,
                        setAsDefault = true
                    )
                    _uiState.update {
                        it.copy(isDetectingLocation = false, locationQuery = "")
                    }
                    // Refresh widgets with new location
                    refreshWidgets()
                    // observeLocation will trigger refresh
                }
                is LocationResult.Error -> {
                    _uiState.update {
                        it.copy(
                            isDetectingLocation = false,
                            locationError = result.message
                        )
                    }
                }
                LocationResult.PermissionDenied -> {
                    _uiState.update {
                        it.copy(
                            isDetectingLocation = false,
                            locationError = "Could not find location"
                        )
                    }
                }
            }
        }
    }
}
