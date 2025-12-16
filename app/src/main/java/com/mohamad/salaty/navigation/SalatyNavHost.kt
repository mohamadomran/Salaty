package com.mohamad.salaty.navigation

import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Dashboard
import androidx.compose.material.icons.filled.Explore
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.outlined.Dashboard
import androidx.compose.material.icons.outlined.Explore
import androidx.compose.material.icons.outlined.Home
import androidx.compose.material.icons.outlined.Settings
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.navigation.NavDestination.Companion.hierarchy
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.mohamad.salaty.core.designsystem.component.SalatyNavigationBar
import com.mohamad.salaty.core.designsystem.component.SalatyNavigationBarItem
import com.mohamad.salaty.feature.compass.QiblaCompassScreen
import com.mohamad.salaty.feature.dashboard.DashboardScreen
import com.mohamad.salaty.feature.home.HomeScreen
import com.mohamad.salaty.feature.settings.SettingsScreen

/**
 * Navigation Routes
 */
sealed class Screen(
    val route: String,
    val label: String,
    val icon: ImageVector,
    val selectedIcon: ImageVector
) {
    data object Home : Screen(
        route = "home",
        label = "Home",
        icon = Icons.Outlined.Home,
        selectedIcon = Icons.Filled.Home
    )

    data object Dashboard : Screen(
        route = "dashboard",
        label = "Dashboard",
        icon = Icons.Outlined.Dashboard,
        selectedIcon = Icons.Filled.Dashboard
    )

    data object Compass : Screen(
        route = "compass",
        label = "Qibla",
        icon = Icons.Outlined.Explore,
        selectedIcon = Icons.Filled.Explore
    )

    data object Settings : Screen(
        route = "settings",
        label = "Settings",
        icon = Icons.Outlined.Settings,
        selectedIcon = Icons.Filled.Settings
    )

    companion object {
        val bottomNavItems = listOf(Home, Dashboard, Compass, Settings)
    }
}

/**
 * Main Navigation Host
 *
 * Sets up the navigation graph with bottom navigation.
 */
@Composable
fun SalatyNavHost(
    modifier: Modifier = Modifier
) {
    val navController = rememberNavController()
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentDestination = navBackStackEntry?.destination

    Scaffold(
        modifier = modifier,
        bottomBar = {
            SalatyNavigationBar {
                Screen.bottomNavItems.forEach { screen ->
                    val selected = currentDestination?.hierarchy?.any {
                        it.route == screen.route
                    } == true

                    SalatyNavigationBarItem(
                        selected = selected,
                        onClick = {
                            navController.navigate(screen.route) {
                                // Pop up to the start destination of the graph to
                                // avoid building up a large stack of destinations
                                popUpTo(navController.graph.findStartDestination().id) {
                                    saveState = true
                                }
                                // Avoid multiple copies of the same destination
                                launchSingleTop = true
                                // Restore state when reselecting a previously selected item
                                restoreState = true
                            }
                        },
                        icon = screen.icon,
                        selectedIcon = screen.selectedIcon,
                        label = screen.label
                    )
                }
            }
        }
    ) { innerPadding ->
        NavHost(
            navController = navController,
            startDestination = Screen.Home.route,
            modifier = Modifier.padding(innerPadding)
        ) {
            composable(Screen.Home.route) {
                HomeScreen()
            }
            composable(Screen.Dashboard.route) {
                DashboardScreen()
            }
            composable(Screen.Compass.route) {
                QiblaCompassScreen()
            }
            composable(Screen.Settings.route) {
                SettingsScreen()
            }
        }
    }
}
