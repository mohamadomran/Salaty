package com.mohamad.salaty.core.data.sensor

import android.content.Context
import android.hardware.GeomagneticField
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import javax.inject.Inject
import javax.inject.Singleton
import kotlin.math.roundToInt

/**
 * Data class representing compass sensor data.
 *
 * @param azimuth The device's heading in degrees (0-360), where 0 is North (magnetic or true based on context)
 * @param accuracy The sensor accuracy level
 */
data class CompassData(
    val azimuth: Float,
    val accuracy: Int
)

/**
 * Service for reading compass sensor data using accelerometer and magnetometer.
 *
 * Uses the rotation vector sensor when available (more accurate), falling back
 * to accelerometer + magnetometer fusion when not available.
 */
@Singleton
class CompassSensor @Inject constructor(
    @ApplicationContext private val context: Context
) {
    private val sensorManager = context.getSystemService(Context.SENSOR_SERVICE) as SensorManager

    /**
     * Check if compass sensors are available on this device.
     */
    fun isCompassAvailable(): Boolean {
        val accelerometer = sensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER)
        val magnetometer = sensorManager.getDefaultSensor(Sensor.TYPE_MAGNETIC_FIELD)
        return accelerometer != null && magnetometer != null
    }

    /**
     * Get compass heading as a Flow.
     *
     * Emits CompassData with azimuth (0-360 degrees, 0 = North) and accuracy.
     * The flow collects sensor data until the collector is cancelled.
     */
    fun getCompassHeading(): Flow<CompassData> = callbackFlow {
        val accelerometerReading = FloatArray(3)
        val magnetometerReading = FloatArray(3)
        val rotationMatrix = FloatArray(9)
        val orientationAngles = FloatArray(3)

        var hasAccelerometer = false
        var hasMagnetometer = false
        var currentAccuracy = SensorManager.SENSOR_STATUS_ACCURACY_LOW

        val listener = object : SensorEventListener {
            override fun onSensorChanged(event: SensorEvent) {
                when (event.sensor.type) {
                    Sensor.TYPE_ACCELEROMETER -> {
                        System.arraycopy(event.values, 0, accelerometerReading, 0, 3)
                        hasAccelerometer = true
                    }
                    Sensor.TYPE_MAGNETIC_FIELD -> {
                        System.arraycopy(event.values, 0, magnetometerReading, 0, 3)
                        hasMagnetometer = true
                    }
                }

                if (hasAccelerometer && hasMagnetometer) {
                    val success = SensorManager.getRotationMatrix(
                        rotationMatrix,
                        null,
                        accelerometerReading,
                        magnetometerReading
                    )

                    if (success) {
                        SensorManager.getOrientation(rotationMatrix, orientationAngles)

                        // Convert azimuth from radians to degrees
                        var azimuthDegrees = Math.toDegrees(orientationAngles[0].toDouble()).toFloat()

                        // Normalize to 0-360 range
                        if (azimuthDegrees < 0) {
                            azimuthDegrees += 360f
                        }

                        trySend(CompassData(azimuthDegrees, currentAccuracy))
                    }
                }
            }

            override fun onAccuracyChanged(sensor: Sensor, accuracy: Int) {
                if (sensor.type == Sensor.TYPE_MAGNETIC_FIELD) {
                    currentAccuracy = accuracy
                }
            }
        }

        val accelerometer = sensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER)
        val magnetometer = sensorManager.getDefaultSensor(Sensor.TYPE_MAGNETIC_FIELD)

        if (accelerometer != null && magnetometer != null) {
            sensorManager.registerListener(
                listener,
                accelerometer,
                SensorManager.SENSOR_DELAY_UI
            )
            sensorManager.registerListener(
                listener,
                magnetometer,
                SensorManager.SENSOR_DELAY_UI
            )
        }

        awaitClose {
            sensorManager.unregisterListener(listener)
        }
    }

    /**
     * Get the accuracy description string resource.
     */
    fun getAccuracyDescription(accuracy: Int): String {
        return when (accuracy) {
            SensorManager.SENSOR_STATUS_ACCURACY_HIGH -> "High"
            SensorManager.SENSOR_STATUS_ACCURACY_MEDIUM -> "Medium"
            SensorManager.SENSOR_STATUS_ACCURACY_LOW -> "Low"
            SensorManager.SENSOR_STATUS_UNRELIABLE -> "Unreliable"
            else -> "Unknown"
        }
    }

    /**
     * Calculate magnetic declination for a given location.
     *
     * Magnetic declination is the angle between magnetic north and true north.
     * This must be added to the magnetic heading to get the true heading.
     *
     * @param latitude Location latitude in degrees
     * @param longitude Location longitude in degrees
     * @param altitude Location altitude in meters (0 if unknown)
     * @return Declination angle in degrees (positive = east, negative = west)
     */
    fun getMagneticDeclination(latitude: Double, longitude: Double, altitude: Float = 0f): Float {
        val geoField = GeomagneticField(
            latitude.toFloat(),
            longitude.toFloat(),
            altitude,
            System.currentTimeMillis()
        )
        return geoField.declination
    }

    /**
     * Convert magnetic heading to true heading using declination.
     *
     * @param magneticHeading The magnetic heading in degrees (0-360)
     * @param declination The magnetic declination in degrees
     * @return True heading in degrees (0-360)
     */
    fun magneticToTrueHeading(magneticHeading: Float, declination: Float): Float {
        var trueHeading = magneticHeading + declination
        // Normalize to 0-360
        while (trueHeading < 0) trueHeading += 360f
        while (trueHeading >= 360) trueHeading -= 360f
        return trueHeading
    }
}
