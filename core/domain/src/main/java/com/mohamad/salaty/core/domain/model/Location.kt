package com.mohamad.salaty.core.domain.model

/**
 * Location Domain Models
 *
 * Models for geographic location data used in prayer time calculations.
 */

/**
 * Geographic coordinates
 */
data class Coordinates(
    val latitude: Double,
    val longitude: Double
) {
    init {
        require(latitude in -90.0..90.0) { "Latitude must be between -90 and 90" }
        require(longitude in -180.0..180.0) { "Longitude must be between -180 and 180" }
    }

    /**
     * Formatted display string
     */
    fun formatted(): String = String.format("%.4f, %.4f", latitude, longitude)

    companion object {
        /**
         * Default coordinates (Mecca, Saudi Arabia)
         */
        val MECCA = Coordinates(21.4225, 39.8262)
    }
}

/**
 * Saved location with metadata
 */
data class SavedLocation(
    val coordinates: Coordinates,
    val name: String,
    val city: String? = null,
    val country: String? = null,
    val isAutoDetected: Boolean = false
) {
    /**
     * Display name for the location
     */
    val displayName: String
        get() = when {
            city != null && country != null -> "$city, $country"
            city != null -> city
            country != null -> country
            else -> name.ifEmpty { coordinates.formatted() }
        }
}

/**
 * Location detection result
 */
sealed class LocationResult {
    data class Success(val location: SavedLocation) : LocationResult()
    data class Error(val message: String, val cause: Throwable? = null) : LocationResult()
    data object PermissionDenied : LocationResult()
    data object Loading : LocationResult()
}
