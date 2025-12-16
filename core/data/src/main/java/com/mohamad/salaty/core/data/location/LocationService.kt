package com.mohamad.salaty.core.data.location

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.location.Geocoder
import android.os.Build
import androidx.core.content.ContextCompat
import com.google.android.gms.location.FusedLocationProviderClient
import com.google.android.gms.location.LocationServices
import com.google.android.gms.location.Priority
import com.google.android.gms.tasks.CancellationTokenSource
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlinx.coroutines.withContext
import java.util.Locale
import java.util.TimeZone
import javax.inject.Inject
import javax.inject.Singleton
import kotlin.coroutines.resume
import kotlin.coroutines.resumeWithException

/**
 * Data class representing a detected location.
 */
data class DetectedLocation(
    val name: String,
    val latitude: Double,
    val longitude: Double,
    val timezone: String
)

/**
 * Result sealed class for location detection.
 */
sealed class LocationResult {
    data class Success(val location: DetectedLocation) : LocationResult()
    data class Error(val message: String) : LocationResult()
    data object PermissionDenied : LocationResult()
}

/**
 * Service for detecting user's location using GPS.
 *
 * Uses FusedLocationProviderClient for battery-efficient location detection
 * and Geocoder for reverse geocoding to get location name.
 */
@Singleton
class LocationService @Inject constructor(
    @ApplicationContext private val context: Context
) {
    private val fusedLocationClient: FusedLocationProviderClient =
        LocationServices.getFusedLocationProviderClient(context)

    /**
     * Check if location permissions are granted.
     */
    fun hasLocationPermission(): Boolean {
        return ContextCompat.checkSelfPermission(
            context,
            Manifest.permission.ACCESS_FINE_LOCATION
        ) == PackageManager.PERMISSION_GRANTED ||
        ContextCompat.checkSelfPermission(
            context,
            Manifest.permission.ACCESS_COARSE_LOCATION
        ) == PackageManager.PERMISSION_GRANTED
    }

    /**
     * Detect current location.
     *
     * @return LocationResult with detected location or error
     */
    suspend fun detectLocation(): LocationResult {
        if (!hasLocationPermission()) {
            return LocationResult.PermissionDenied
        }

        return try {
            val location = getCurrentLocation()
            if (location != null) {
                val locationName = getLocationName(location.latitude, location.longitude)
                val timezone = getTimezone(location.latitude, location.longitude)

                LocationResult.Success(
                    DetectedLocation(
                        name = locationName,
                        latitude = location.latitude,
                        longitude = location.longitude,
                        timezone = timezone
                    )
                )
            } else {
                LocationResult.Error("Unable to get current location. Please try again.")
            }
        } catch (e: SecurityException) {
            LocationResult.PermissionDenied
        } catch (e: Exception) {
            LocationResult.Error(e.message ?: "Unknown error occurred")
        }
    }

    /**
     * Get current location using FusedLocationProviderClient.
     */
    @Suppress("MissingPermission")
    private suspend fun getCurrentLocation(): android.location.Location? {
        return suspendCancellableCoroutine { continuation ->
            val cancellationTokenSource = CancellationTokenSource()

            fusedLocationClient.getCurrentLocation(
                Priority.PRIORITY_HIGH_ACCURACY,
                cancellationTokenSource.token
            ).addOnSuccessListener { location ->
                continuation.resume(location)
            }.addOnFailureListener { exception ->
                continuation.resumeWithException(exception)
            }

            continuation.invokeOnCancellation {
                cancellationTokenSource.cancel()
            }
        }
    }

    /**
     * Get location name using reverse geocoding.
     */
    private suspend fun getLocationName(latitude: Double, longitude: Double): String {
        return try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                getLocationNameModern(latitude, longitude)
            } else {
                getLocationNameLegacy(latitude, longitude)
            }
        } catch (e: Exception) {
            // Fallback to coordinates if geocoding fails
            "%.4f, %.4f".format(latitude, longitude)
        }
    }

    @Suppress("DEPRECATION")
    private fun getLocationNameLegacy(latitude: Double, longitude: Double): String {
        val geocoder = Geocoder(context, Locale.getDefault())
        val addresses = geocoder.getFromLocation(latitude, longitude, 1)

        return if (!addresses.isNullOrEmpty()) {
            val address = addresses[0]
            buildLocationName(address)
        } else {
            "%.4f, %.4f".format(latitude, longitude)
        }
    }

    private suspend fun getLocationNameModern(latitude: Double, longitude: Double): String {
        return suspendCancellableCoroutine { continuation ->
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                val geocoder = Geocoder(context, Locale.getDefault())
                geocoder.getFromLocation(latitude, longitude, 1) { addresses ->
                    val name = if (addresses.isNotEmpty()) {
                        buildLocationName(addresses[0])
                    } else {
                        "%.4f, %.4f".format(latitude, longitude)
                    }
                    continuation.resume(name)
                }
            } else {
                continuation.resume("%.4f, %.4f".format(latitude, longitude))
            }
        }
    }

    private fun buildLocationName(address: android.location.Address): String {
        return when {
            !address.locality.isNullOrEmpty() && !address.countryName.isNullOrEmpty() -> {
                "${address.locality}, ${address.countryName}"
            }
            !address.subAdminArea.isNullOrEmpty() && !address.countryName.isNullOrEmpty() -> {
                "${address.subAdminArea}, ${address.countryName}"
            }
            !address.adminArea.isNullOrEmpty() && !address.countryName.isNullOrEmpty() -> {
                "${address.adminArea}, ${address.countryName}"
            }
            !address.countryName.isNullOrEmpty() -> {
                address.countryName
            }
            else -> {
                "%.4f, %.4f".format(address.latitude, address.longitude)
            }
        }
    }

    /**
     * Geocode a location name to coordinates.
     *
     * @param locationName The name of the location (city, address, etc.)
     * @return LocationResult with coordinates if successful
     */
    suspend fun geocodeLocationName(locationName: String): LocationResult {
        if (locationName.isBlank()) {
            return LocationResult.Error("Location name is required")
        }

        return withContext(Dispatchers.IO) {
            try {
                val geocoder = Geocoder(context, Locale.getDefault())

                @Suppress("DEPRECATION")
                val addresses = geocoder.getFromLocationName(locationName, 1)

                if (addresses.isNullOrEmpty()) {
                    return@withContext LocationResult.Error("Location not found. Try a different name or add coordinates manually.")
                }

                val address = addresses[0]
                val name = buildLocationName(address).ifEmpty { locationName }
                val timezone = getTimezone(address.latitude, address.longitude)

                LocationResult.Success(
                    DetectedLocation(
                        name = name,
                        latitude = address.latitude,
                        longitude = address.longitude,
                        timezone = timezone
                    )
                )
            } catch (e: Exception) {
                LocationResult.Error("Failed to find location: ${e.message}")
            }
        }
    }

    /**
     * Get timezone for the given coordinates.
     *
     * Uses a hybrid approach:
     * 1. First, try to use device timezone if it matches the longitude-based estimate
     * 2. Otherwise, estimate based on longitude (works offline)
     *
     * Each 15° of longitude = 1 hour offset from UTC.
     */
    private fun getTimezone(latitude: Double, longitude: Double): String {
        val deviceTimezone = TimeZone.getDefault()
        val deviceOffset = deviceTimezone.rawOffset / (1000 * 60 * 60) // hours

        // Estimate timezone offset from longitude (each 15° = 1 hour)
        val estimatedOffset = (longitude / 15.0).toInt()

        // If device timezone matches the estimated offset (within 2 hours), use device timezone
        // This handles daylight saving time and proper timezone IDs
        return if (kotlin.math.abs(deviceOffset - estimatedOffset) <= 2) {
            deviceTimezone.id
        } else {
            // Use GMT offset format for locations far from device timezone
            when {
                estimatedOffset == 0 -> "GMT"
                estimatedOffset > 0 -> "GMT+$estimatedOffset"
                else -> "GMT$estimatedOffset"
            }
        }
    }
}
