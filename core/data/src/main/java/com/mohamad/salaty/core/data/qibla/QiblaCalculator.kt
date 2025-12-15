package com.mohamad.salaty.core.data.qibla

import javax.inject.Inject
import javax.inject.Singleton
import kotlin.math.atan2
import kotlin.math.cos
import kotlin.math.sin

/**
 * Calculator for Qibla direction (direction to the Kaaba in Mecca).
 *
 * Uses spherical trigonometry to calculate the initial bearing on the
 * great circle path from any point on Earth to the Kaaba.
 */
@Singleton
class QiblaCalculator @Inject constructor() {

    companion object {
        // Kaaba coordinates (Mecca, Saudi Arabia)
        const val KAABA_LATITUDE = 21.4225
        const val KAABA_LONGITUDE = 39.8262
    }

    /**
     * Calculate the Qibla direction from a given location.
     *
     * @param latitude User's latitude in degrees
     * @param longitude User's longitude in degrees
     * @return Qibla bearing in degrees (0-360, where 0 is North)
     */
    fun calculateQiblaDirection(latitude: Double, longitude: Double): Double {
        // Convert to radians
        val lat1 = Math.toRadians(latitude)
        val lon1 = Math.toRadians(longitude)
        val lat2 = Math.toRadians(KAABA_LATITUDE)
        val lon2 = Math.toRadians(KAABA_LONGITUDE)

        // Calculate the difference in longitude
        val dLon = lon2 - lon1

        // Calculate the bearing using spherical trigonometry
        // Formula: atan2(sin(dLon) * cos(lat2),
        //                cos(lat1) * sin(lat2) - sin(lat1) * cos(lat2) * cos(dLon))
        val x = sin(dLon) * cos(lat2)
        val y = cos(lat1) * sin(lat2) - sin(lat1) * cos(lat2) * cos(dLon)

        var bearing = Math.toDegrees(atan2(x, y))

        // Normalize to 0-360 range
        bearing = (bearing + 360) % 360

        return bearing
    }

    /**
     * Calculate the distance to Kaaba in kilometers.
     *
     * Uses the Haversine formula for calculating great-circle distances.
     *
     * @param latitude User's latitude in degrees
     * @param longitude User's longitude in degrees
     * @return Distance to Kaaba in kilometers
     */
    fun calculateDistanceToKaaba(latitude: Double, longitude: Double): Double {
        val earthRadiusKm = 6371.0

        val lat1 = Math.toRadians(latitude)
        val lon1 = Math.toRadians(longitude)
        val lat2 = Math.toRadians(KAABA_LATITUDE)
        val lon2 = Math.toRadians(KAABA_LONGITUDE)

        val dLat = lat2 - lat1
        val dLon = lon2 - lon1

        val a = sin(dLat / 2) * sin(dLat / 2) +
                cos(lat1) * cos(lat2) * sin(dLon / 2) * sin(dLon / 2)
        val c = 2 * atan2(kotlin.math.sqrt(a), kotlin.math.sqrt(1 - a))

        return earthRadiusKm * c
    }

    /**
     * Get the cardinal direction name for a bearing.
     *
     * @param bearing Bearing in degrees (0-360)
     * @return Cardinal direction (N, NE, E, SE, S, SW, W, NW)
     */
    fun getCardinalDirection(bearing: Double): String {
        val normalized = (bearing + 360) % 360
        return when {
            normalized < 22.5 || normalized >= 337.5 -> "N"
            normalized < 67.5 -> "NE"
            normalized < 112.5 -> "E"
            normalized < 157.5 -> "SE"
            normalized < 202.5 -> "S"
            normalized < 247.5 -> "SW"
            normalized < 292.5 -> "W"
            else -> "NW"
        }
    }
}
