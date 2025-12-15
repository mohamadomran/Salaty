package com.mohamad.salaty.feature.tracking

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.mohamad.salaty.core.data.database.entity.PrayerRecordEntity
import com.mohamad.salaty.core.data.repository.PrayerRepository
import com.mohamad.salaty.core.domain.model.PrayerName
import com.mohamad.salaty.core.domain.model.PrayerStatus
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import java.time.LocalDate
import javax.inject.Inject

/**
 * UI state for a single prayer tracking item.
 */
data class PrayerTrackingItem(
    val prayerName: PrayerName,
    val status: PrayerStatus
)

/**
 * UI state for the Tracking screen.
 */
data class TrackingUiState(
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
        get() = prayers.size.coerceAtMost(5) // Only obligatory prayers

    val completionPercentage: Float
        get() = if (totalCount > 0) (prayedCount.toFloat() / totalCount) * 100f else 0f
}

@HiltViewModel
class TrackingViewModel @Inject constructor(
    private val prayerRepository: PrayerRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(TrackingUiState())
    val uiState: StateFlow<TrackingUiState> = _uiState.asStateFlow()

    init {
        loadRecords()
    }

    private fun loadRecords() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, error = null) }

            try {
                // Initialize today's records if needed
                prayerRepository.initializeDayRecords(_uiState.value.selectedDate)

                // Observe records for selected date
                prayerRepository.getRecordsByDate(_uiState.value.selectedDate).collect { records ->
                    val prayers = buildPrayerList(records)
                    _uiState.update {
                        it.copy(
                            prayers = prayers,
                            isLoading = false
                        )
                    }
                }
            } catch (e: Exception) {
                _uiState.update {
                    it.copy(
                        isLoading = false,
                        error = e.message ?: "Failed to load records"
                    )
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
        _uiState.update { it.copy(selectedDate = date) }
        loadRecords()
    }

    fun goToPreviousDay() {
        selectDate(_uiState.value.selectedDate.minusDays(1))
    }

    fun goToNextDay() {
        val nextDay = _uiState.value.selectedDate.plusDays(1)
        if (!nextDay.isAfter(LocalDate.now())) {
            selectDate(nextDay)
        }
    }

    fun togglePrayerStatus(prayerName: PrayerName) {
        viewModelScope.launch {
            val currentStatus = _uiState.value.prayers
                .find { it.prayerName == prayerName }?.status ?: PrayerStatus.PENDING

            val newStatus = when (currentStatus) {
                PrayerStatus.PENDING -> PrayerStatus.PRAYED
                PrayerStatus.PRAYED -> PrayerStatus.PRAYED_LATE
                PrayerStatus.PRAYED_LATE -> PrayerStatus.MISSED
                PrayerStatus.MISSED -> PrayerStatus.PENDING
            }

            prayerRepository.updatePrayerStatus(
                date = _uiState.value.selectedDate,
                prayerName = prayerName,
                status = newStatus
            )
        }
    }

    fun setPrayerStatus(prayerName: PrayerName, status: PrayerStatus) {
        viewModelScope.launch {
            prayerRepository.updatePrayerStatus(
                date = _uiState.value.selectedDate,
                prayerName = prayerName,
                status = status
            )
        }
    }
}
