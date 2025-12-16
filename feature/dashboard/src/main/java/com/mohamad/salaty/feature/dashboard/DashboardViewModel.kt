package com.mohamad.salaty.feature.dashboard

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.mohamad.salaty.core.data.database.entity.PrayerRecordEntity
import com.mohamad.salaty.core.data.repository.PrayerRepository
import com.mohamad.salaty.core.domain.model.PrayerName
import com.mohamad.salaty.core.domain.model.PrayerStatus
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import java.time.LocalDate
import javax.inject.Inject

// ============================================================================
// TRACKING STATE
// ============================================================================

data class PrayerTrackingItem(
    val prayerName: PrayerName,
    val status: PrayerStatus
)

data class TrackingState(
    val selectedDate: LocalDate = LocalDate.now(),
    val prayers: List<PrayerTrackingItem> = emptyList(),
    val isLoading: Boolean = true,
    val error: String? = null
) {
    val prayedCount: Int
        get() = prayers.count {
            it.status == PrayerStatus.PRAYED || it.status == PrayerStatus.PRAYED_LATE
        }

    val totalCount: Int
        get() = prayers.size.coerceAtMost(5)

    val completionPercentage: Float
        get() = if (totalCount > 0) (prayedCount.toFloat() / totalCount) * 100f else 0f
}

// ============================================================================
// QADA STATE
// ============================================================================

data class MissedPrayerItem(
    val id: Long,
    val prayerName: PrayerName,
    val date: LocalDate
)

data class QadaState(
    val missedPrayers: List<MissedPrayerItem> = emptyList(),
    val totalCount: Int = 0,
    val isLoading: Boolean = true,
    val error: String? = null
)

// ============================================================================
// STATISTICS STATE
// ============================================================================

enum class TimeRange(val label: String) {
    WEEK("Week"),
    MONTH("Month"),
    YEAR("Year")
}

data class StatsState(
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
}

// ============================================================================
// COMBINED DASHBOARD STATE
// ============================================================================

data class DashboardUiState(
    val tracking: TrackingState = TrackingState(),
    val qada: QadaState = QadaState(),
    val stats: StatsState = StatsState(),
    val selectedTab: Int = 0
)

@HiltViewModel
class DashboardViewModel @Inject constructor(
    private val prayerRepository: PrayerRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(DashboardUiState())
    val uiState: StateFlow<DashboardUiState> = _uiState.asStateFlow()

    private var trackingJob: Job? = null
    private var qadaJob: Job? = null
    private var statsJob: Job? = null

    init {
        loadTracking()
        loadQada()
        loadStats()
    }

    fun setSelectedTab(index: Int) {
        _uiState.update { it.copy(selectedTab = index) }
    }

    // ============================================================================
    // TRACKING METHODS
    // ============================================================================

    private fun loadTracking() {
        trackingJob?.cancel()
        trackingJob = viewModelScope.launch {
            _uiState.update { it.copy(tracking = it.tracking.copy(isLoading = true, error = null)) }

            try {
                prayerRepository.initializeDayRecords(_uiState.value.tracking.selectedDate)

                prayerRepository.getRecordsByDate(_uiState.value.tracking.selectedDate).collect { records ->
                    val prayers = buildPrayerList(records)
                    _uiState.update {
                        it.copy(tracking = it.tracking.copy(prayers = prayers, isLoading = false))
                    }
                }
            } catch (e: Exception) {
                _uiState.update {
                    it.copy(tracking = it.tracking.copy(
                        isLoading = false,
                        error = e.message ?: "Failed to load records"
                    ))
                }
            }
        }
    }

    private fun buildPrayerList(records: List<PrayerRecordEntity>): List<PrayerTrackingItem> {
        val recordMap = records.associateBy { it.prayerName }
        return PrayerName.obligatory.map { prayer ->
            PrayerTrackingItem(
                prayerName = prayer,
                status = recordMap[prayer]?.status ?: PrayerStatus.PENDING
            )
        }
    }

    fun selectDate(date: LocalDate) {
        _uiState.update {
            it.copy(tracking = it.tracking.copy(
                selectedDate = date,
                prayers = emptyList(),
                isLoading = true
            ))
        }
        loadTracking()
    }

    fun goToPreviousDay() {
        selectDate(_uiState.value.tracking.selectedDate.minusDays(1))
    }

    fun goToNextDay() {
        val nextDay = _uiState.value.tracking.selectedDate.plusDays(1)
        if (!nextDay.isAfter(LocalDate.now())) {
            selectDate(nextDay)
        }
    }

    fun setPrayerStatus(prayerName: PrayerName, status: PrayerStatus) {
        viewModelScope.launch {
            prayerRepository.updatePrayerStatus(
                date = _uiState.value.tracking.selectedDate,
                prayerName = prayerName,
                status = status
            )
        }
    }

    // ============================================================================
    // QADA METHODS
    // ============================================================================

    private fun loadQada() {
        qadaJob?.cancel()
        qadaJob = viewModelScope.launch {
            _uiState.update { it.copy(qada = it.qada.copy(isLoading = true, error = null)) }

            try {
                combine(
                    prayerRepository.getMissedPrayersNotCompleted(),
                    prayerRepository.getMissedPrayersCount()
                ) { prayers, count ->
                    Pair(prayers, count)
                }.collect { (prayers, count) ->
                    val items = prayers.map { record ->
                        MissedPrayerItem(
                            id = record.id,
                            prayerName = record.prayerName,
                            date = record.date
                        )
                    }
                    _uiState.update {
                        it.copy(qada = it.qada.copy(
                            missedPrayers = items,
                            totalCount = count,
                            isLoading = false
                        ))
                    }
                }
            } catch (e: Exception) {
                _uiState.update {
                    it.copy(qada = it.qada.copy(
                        isLoading = false,
                        error = e.message ?: "Failed to load missed prayers"
                    ))
                }
            }
        }
    }

    fun markQadaCompleted(recordId: Long) {
        viewModelScope.launch {
            prayerRepository.markQadaCompleted(recordId)
        }
    }

    // ============================================================================
    // STATISTICS METHODS
    // ============================================================================

    private fun loadStats() {
        statsJob?.cancel()
        statsJob = viewModelScope.launch {
            _uiState.update { it.copy(stats = it.stats.copy(isLoading = true, error = null)) }

            try {
                val (startDate, endDate) = getDateRange(_uiState.value.stats.selectedTimeRange)

                combine(
                    prayerRepository.getTotalCount(startDate, endDate),
                    prayerRepository.getPrayedCount(startDate, endDate),
                    prayerRepository.getMissedCount(startDate, endDate),
                    prayerRepository.getPerfectDays()
                ) { total, prayed, missed, perfectDays ->
                    StatisticsData(total, prayed, missed, perfectDays.size)
                }.collect { data ->
                    _uiState.update {
                        it.copy(stats = it.stats.copy(
                            totalPrayers = data.total,
                            prayedOnTime = data.prayed,
                            missed = data.missed,
                            perfectDays = data.perfectDays,
                            isLoading = false
                        ))
                    }
                }
            } catch (e: Exception) {
                _uiState.update {
                    it.copy(stats = it.stats.copy(
                        isLoading = false,
                        error = e.message ?: "Failed to load statistics"
                    ))
                }
            }
        }
    }

    fun selectTimeRange(timeRange: TimeRange) {
        _uiState.update { it.copy(stats = it.stats.copy(selectedTimeRange = timeRange)) }
        loadStats()
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
