package com.mohamad.salaty.feature.qada

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.mohamad.salaty.core.data.database.entity.PrayerRecordEntity
import com.mohamad.salaty.core.data.repository.PrayerRepository
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
 * UI state for a missed prayer item (qada).
 */
data class MissedPrayerItem(
    val id: Long,
    val prayerName: PrayerName,
    val date: java.time.LocalDate
)

/**
 * UI state for the Qada screen.
 */
data class QadaUiState(
    val missedPrayers: List<MissedPrayerItem> = emptyList(),
    val totalCount: Int = 0,
    val isLoading: Boolean = true,
    val error: String? = null
)

@HiltViewModel
class QadaViewModel @Inject constructor(
    private val prayerRepository: PrayerRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(QadaUiState())
    val uiState: StateFlow<QadaUiState> = _uiState.asStateFlow()

    init {
        loadMissedPrayers()
    }

    private fun loadMissedPrayers() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, error = null) }

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
                        it.copy(
                            missedPrayers = items,
                            totalCount = count,
                            isLoading = false
                        )
                    }
                }
            } catch (e: Exception) {
                _uiState.update {
                    it.copy(
                        isLoading = false,
                        error = e.message ?: "Failed to load missed prayers"
                    )
                }
            }
        }
    }

    /**
     * Mark a missed prayer as made up (qada completed).
     */
    fun markAsCompleted(recordId: Long) {
        viewModelScope.launch {
            prayerRepository.markQadaCompleted(recordId)
        }
    }
}
