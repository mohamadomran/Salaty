package com.mohamad.salaty.feature.qada

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.mohamad.salaty.core.data.database.entity.QadaCountEntity
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
 * UI state for a single Qada item.
 */
data class QadaItem(
    val prayerName: PrayerName,
    val count: Int,
    val displayName: String = PrayerName.displayName(prayerName)
)

/**
 * UI state for the Qada screen.
 */
data class QadaUiState(
    val qadaItems: List<QadaItem> = emptyList(),
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
        loadQadaCounts()
    }

    private fun loadQadaCounts() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, error = null) }

            try {
                combine(
                    prayerRepository.getAllQadaCounts(),
                    prayerRepository.getTotalQadaCount()
                ) { counts, total ->
                    Pair(counts, total)
                }.collect { (counts, total) ->
                    val items = buildQadaList(counts)
                    _uiState.update {
                        it.copy(
                            qadaItems = items,
                            totalCount = total,
                            isLoading = false
                        )
                    }
                }
            } catch (e: Exception) {
                _uiState.update {
                    it.copy(
                        isLoading = false,
                        error = e.message ?: "Failed to load Qada counts"
                    )
                }
            }
        }
    }

    private fun buildQadaList(counts: List<QadaCountEntity>): List<QadaItem> {
        val countMap = counts.associateBy { it.prayerName }

        return PrayerName.obligatory.map { prayer ->
            QadaItem(
                prayerName = prayer,
                count = countMap[prayer]?.count ?: 0
            )
        }
    }

    fun incrementQada(prayerName: PrayerName) {
        viewModelScope.launch {
            prayerRepository.incrementQada(prayerName)
        }
    }

    fun decrementQada(prayerName: PrayerName) {
        viewModelScope.launch {
            prayerRepository.decrementQada(prayerName)
        }
    }

    fun setQadaCount(prayerName: PrayerName, count: Int) {
        viewModelScope.launch {
            prayerRepository.setQadaCount(prayerName, count.coerceAtLeast(0))
        }
    }

    fun markOneAsCompleted(prayerName: PrayerName) {
        decrementQada(prayerName)
    }
}
