package com.mohamad.salaty.feature.home

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.mohamad.salaty.core.data.calendar.HijriDateConverter
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
    val error: String? = null
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
    private val hijriDateConverter: HijriDateConverter
) : ViewModel() {

    private val _uiState = MutableStateFlow(HomeUiState())
    val uiState: StateFlow<HomeUiState> = _uiState.asStateFlow()

    init {
        loadData()
        startCountdownTimer()
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

                // Check if location exists
                val hasLocation = prayerTimes != null

                _uiState.update {
                    it.copy(
                        prayerTimes = prayerTimes,
                        hijriDate = hijriDate,
                        currentPrayer = current,
                        nextPrayer = next,
                        secondsUntilNextPrayer = secondsUntil,
                        hasLocation = hasLocation,
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
}
