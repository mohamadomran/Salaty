package com.mohamad.salaty.feature.statistics

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.mohamad.salaty.core.data.repository.PrayerRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import java.time.LocalDate
import javax.inject.Inject

/**
 * Time range options for statistics.
 */
enum class TimeRange(val label: String) {
    WEEK("Week"),
    MONTH("Month"),
    YEAR("Year")
}

/**
 * UI state for the Statistics screen.
 */
data class StatisticsUiState(
    val selectedTimeRange: TimeRange = TimeRange.WEEK,
    val totalPrayers: Int = 0,
    val prayedOnTime: Int = 0,
    val prayedLate: Int = 0,
    val missed: Int = 0,
    val perfectDays: Int = 0,
    val currentStreak: Int = 0,
    val longestStreak: Int = 0,
    val isLoading: Boolean = true,
    val error: String? = null
) {
    val completionRate: Float
        get() = if (totalPrayers > 0) {
            ((prayedOnTime + prayedLate).toFloat() / totalPrayers) * 100f
        } else 0f

    val onTimeRate: Float
        get() = if (totalPrayers > 0) {
            (prayedOnTime.toFloat() / totalPrayers) * 100f
        } else 0f
}

@HiltViewModel
class StatisticsViewModel @Inject constructor(
    private val prayerRepository: PrayerRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(StatisticsUiState())
    val uiState: StateFlow<StatisticsUiState> = _uiState.asStateFlow()

    init {
        loadStatistics()
    }

    private fun loadStatistics() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, error = null) }

            try {
                val (startDate, endDate) = getDateRange(_uiState.value.selectedTimeRange)

                // Load streaks
                val currentStreak = prayerRepository.getCurrentStreak()
                val longestStreak = prayerRepository.getLongestStreak()

                combine(
                    prayerRepository.getTotalCount(startDate, endDate),
                    prayerRepository.getPrayedCount(startDate, endDate),
                    prayerRepository.getMissedCount(startDate, endDate),
                    prayerRepository.getPerfectDays()
                ) { total, prayed, missed, perfectDays ->
                    StatisticsData(
                        total = total,
                        prayed = prayed,
                        missed = missed,
                        perfectDays = perfectDays.size
                    )
                }.collect { data ->
                    _uiState.update {
                        it.copy(
                            totalPrayers = data.total,
                            prayedOnTime = data.prayed,
                            missed = data.missed,
                            perfectDays = data.perfectDays,
                            currentStreak = currentStreak,
                            longestStreak = longestStreak,
                            isLoading = false
                        )
                    }
                }
            } catch (e: Exception) {
                _uiState.update {
                    it.copy(
                        isLoading = false,
                        error = e.message ?: "Failed to load statistics"
                    )
                }
            }
        }
    }

    fun selectTimeRange(timeRange: TimeRange) {
        _uiState.update { it.copy(selectedTimeRange = timeRange) }
        loadStatistics()
    }

    private fun getDateRange(timeRange: TimeRange): Pair<LocalDate, LocalDate> {
        val today = LocalDate.now()
        val startDate = when (timeRange) {
            TimeRange.WEEK -> today.minusDays(7)
            TimeRange.MONTH -> today.minusMonths(1)
            TimeRange.YEAR -> today.minusYears(1)
        }
        return Pair(startDate, today)
    }

    private data class StatisticsData(
        val total: Int,
        val prayed: Int,
        val missed: Int,
        val perfectDays: Int
    )
}
