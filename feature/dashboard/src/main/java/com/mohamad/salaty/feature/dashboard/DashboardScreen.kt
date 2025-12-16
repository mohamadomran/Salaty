package com.mohamad.salaty.feature.dashboard

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Tab
import androidx.compose.material3.TabRow
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.mohamad.salaty.feature.dashboard.tabs.QadaTab
import com.mohamad.salaty.feature.dashboard.tabs.StatsTab
import com.mohamad.salaty.feature.dashboard.tabs.TrackingTab
import kotlinx.coroutines.launch

/**
 * Dashboard Screen - Combined Tracking, Qada, and Statistics
 *
 * Single screen with horizontal tabs for:
 * - Tracking: Daily prayer status management
 * - Qada: Missed prayer makeup tracking
 * - Stats: Prayer statistics and analytics
 */
@Composable
fun DashboardScreen(
    modifier: Modifier = Modifier,
    viewModel: DashboardViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    val pagerState = rememberPagerState(
        initialPage = uiState.selectedTab,
        pageCount = { 3 }
    )
    val coroutineScope = rememberCoroutineScope()

    // Sync pager with ViewModel
    LaunchedEffect(pagerState.currentPage) {
        viewModel.setSelectedTab(pagerState.currentPage)
    }

    Column(modifier = modifier.fillMaxSize()) {
        // Title
        Text(
            text = stringResource(R.string.dashboard_title),
            style = MaterialTheme.typography.headlineMedium,
            color = MaterialTheme.colorScheme.onBackground,
            modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp)
        )

        // Tab Row
        TabRow(
            selectedTabIndex = pagerState.currentPage,
            containerColor = MaterialTheme.colorScheme.surface,
            contentColor = MaterialTheme.colorScheme.primary
        ) {
            Tab(
                selected = pagerState.currentPage == 0,
                onClick = {
                    coroutineScope.launch {
                        pagerState.animateScrollToPage(0)
                    }
                },
                text = { Text(stringResource(R.string.dashboard_tab_tracking)) }
            )
            Tab(
                selected = pagerState.currentPage == 1,
                onClick = {
                    coroutineScope.launch {
                        pagerState.animateScrollToPage(1)
                    }
                },
                text = { Text(stringResource(R.string.dashboard_tab_qada)) }
            )
            Tab(
                selected = pagerState.currentPage == 2,
                onClick = {
                    coroutineScope.launch {
                        pagerState.animateScrollToPage(2)
                    }
                },
                text = { Text(stringResource(R.string.dashboard_tab_stats)) }
            )
        }

        // Horizontal Pager
        HorizontalPager(
            state = pagerState,
            modifier = Modifier.fillMaxSize()
        ) { page ->
            when (page) {
                0 -> {
                    if (uiState.tracking.isLoading) {
                        LoadingContent()
                    } else {
                        TrackingTab(
                            state = uiState.tracking,
                            onPreviousDay = viewModel::goToPreviousDay,
                            onNextDay = viewModel::goToNextDay,
                            onStatusChange = viewModel::setPrayerStatus
                        )
                    }
                }
                1 -> {
                    if (uiState.qada.isLoading) {
                        LoadingContent()
                    } else {
                        QadaTab(
                            state = uiState.qada,
                            onMarkCompleted = viewModel::markQadaCompleted
                        )
                    }
                }
                2 -> {
                    if (uiState.stats.isLoading) {
                        LoadingContent()
                    } else {
                        StatsTab(
                            state = uiState.stats,
                            onTimeRangeSelected = viewModel::selectTimeRange
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun LoadingContent(modifier: Modifier = Modifier) {
    Box(
        modifier = modifier.fillMaxSize(),
        contentAlignment = Alignment.Center
    ) {
        CircularProgressIndicator(color = MaterialTheme.colorScheme.primary)
    }
}
