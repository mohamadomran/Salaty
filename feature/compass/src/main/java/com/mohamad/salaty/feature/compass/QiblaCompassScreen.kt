package com.mohamad.salaty.feature.compass

import android.hardware.SensorManager
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.LocationOff
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.rotate
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.drawscope.rotate
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import kotlin.math.cos
import kotlin.math.sin

/**
 * Qibla Compass Screen
 *
 * Displays a compass that shows the direction to Mecca (Qibla).
 * The compass dial rotates with device orientation, while the
 * Qibla arrow always points toward the Kaaba.
 */
@Composable
fun QiblaCompassScreen(
    modifier: Modifier = Modifier,
    viewModel: QiblaCompassViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()

    Column(
        modifier = modifier
            .fillMaxSize()
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        // Title
        Text(
            text = stringResource(R.string.compass_title),
            style = MaterialTheme.typography.headlineMedium,
            fontWeight = FontWeight.Bold,
            color = MaterialTheme.colorScheme.onBackground
        )

        Spacer(modifier = Modifier.height(8.dp))

        when {
            !uiState.isCompassAvailable -> {
                CompassUnavailable()
            }
            !uiState.hasLocation -> {
                LocationRequired()
            }
            else -> {
                // Location info
                uiState.locationName?.let { location ->
                    Text(
                        text = location,
                        style = MaterialTheme.typography.bodyLarge,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }

                Spacer(modifier = Modifier.height(24.dp))

                // Calibration warning
                if (uiState.needsCalibration) {
                    CalibrationWarning()
                    Spacer(modifier = Modifier.height(16.dp))
                }

                // Compass
                CompassDial(
                    compassRotation = viewModel.getCompassRotation(),
                    qiblaRotation = viewModel.getQiblaRotation(),
                    modifier = Modifier.weight(1f)
                )

                Spacer(modifier = Modifier.height(24.dp))

                // Info cards
                CompassInfoCards(
                    qiblaBearing = uiState.qiblaBearing,
                    currentHeading = uiState.currentHeading,
                    distance = viewModel.formatDistance(uiState.distanceToKaaba),
                    cardinalDirection = viewModel.getCurrentCardinalDirection()
                )
            }
        }
    }
}

@Composable
private fun CompassDial(
    compassRotation: Float,
    qiblaRotation: Float,
    modifier: Modifier = Modifier
) {
    // Smooth animation for compass rotation
    val animatedCompassRotation by animateFloatAsState(
        targetValue = compassRotation,
        animationSpec = tween(durationMillis = 100),
        label = "compass_rotation"
    )

    val animatedQiblaRotation by animateFloatAsState(
        targetValue = qiblaRotation,
        animationSpec = tween(durationMillis = 100),
        label = "qibla_rotation"
    )

    val primaryColor = MaterialTheme.colorScheme.primary
    val onSurfaceColor = MaterialTheme.colorScheme.onSurface
    val surfaceVariantColor = MaterialTheme.colorScheme.surfaceVariant

    Box(
        modifier = modifier.fillMaxWidth(),
        contentAlignment = Alignment.Center
    ) {
        Canvas(
            modifier = Modifier
                .size(300.dp)
                .rotate(animatedCompassRotation)
        ) {
            val radius = size.minDimension / 2
            val center = Offset(size.width / 2, size.height / 2)

            // Draw compass ring
            drawCircle(
                color = surfaceVariantColor,
                radius = radius,
                center = center,
                style = Stroke(width = 8.dp.toPx())
            )

            // Draw cardinal direction markers
            drawCardinalMarkers(center, radius, onSurfaceColor, primaryColor)

            // Draw degree markers
            drawDegreeMarkers(center, radius, onSurfaceColor)
        }

        // Qibla arrow (rotates independently)
        Canvas(
            modifier = Modifier
                .size(280.dp)
                .rotate(animatedQiblaRotation)
        ) {
            val center = Offset(size.width / 2, size.height / 2)
            val arrowLength = size.minDimension / 2 - 30.dp.toPx()

            // Draw Qibla arrow
            drawQiblaArrow(center, arrowLength, primaryColor)
        }

        // Center Kaaba icon indicator
        Box(
            modifier = Modifier
                .size(60.dp)
                .background(
                    color = MaterialTheme.colorScheme.primaryContainer,
                    shape = CircleShape
                ),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = "🕋",
                style = MaterialTheme.typography.headlineMedium
            )
        }
    }
}

private fun DrawScope.drawCardinalMarkers(
    center: Offset,
    radius: Float,
    textColor: Color,
    northColor: Color
) {
    val markers = listOf(
        0f to "N",
        90f to "E",
        180f to "S",
        270f to "W"
    )

    markers.forEach { (angle, label) ->
        val markerRadius = radius - 30.dp.toPx()
        val angleRad = Math.toRadians(angle.toDouble() - 90)
        val x = center.x + markerRadius * cos(angleRad).toFloat()
        val y = center.y + markerRadius * sin(angleRad).toFloat()

        // Draw tick mark
        val tickStart = radius - 15.dp.toPx()
        val tickEnd = radius - 5.dp.toPx()
        val startX = center.x + tickStart * cos(angleRad).toFloat()
        val startY = center.y + tickStart * sin(angleRad).toFloat()
        val endX = center.x + tickEnd * cos(angleRad).toFloat()
        val endY = center.y + tickEnd * sin(angleRad).toFloat()

        val color = if (label == "N") northColor else textColor
        drawLine(
            color = color,
            start = Offset(startX, startY),
            end = Offset(endX, endY),
            strokeWidth = 4.dp.toPx(),
            cap = StrokeCap.Round
        )
    }
}

private fun DrawScope.drawDegreeMarkers(
    center: Offset,
    radius: Float,
    color: Color
) {
    for (i in 0 until 360 step 30) {
        if (i % 90 != 0) { // Skip cardinal directions
            val angleRad = Math.toRadians(i.toDouble() - 90)
            val tickStart = radius - 10.dp.toPx()
            val tickEnd = radius - 5.dp.toPx()
            val startX = center.x + tickStart * cos(angleRad).toFloat()
            val startY = center.y + tickStart * sin(angleRad).toFloat()
            val endX = center.x + tickEnd * cos(angleRad).toFloat()
            val endY = center.y + tickEnd * sin(angleRad).toFloat()

            drawLine(
                color = color.copy(alpha = 0.5f),
                start = Offset(startX, startY),
                end = Offset(endX, endY),
                strokeWidth = 2.dp.toPx(),
                cap = StrokeCap.Round
            )
        }
    }
}

private fun DrawScope.drawQiblaArrow(
    center: Offset,
    length: Float,
    color: Color
) {
    val arrowHeadSize = 20.dp.toPx()

    // Arrow body
    drawLine(
        color = color,
        start = center,
        end = Offset(center.x, center.y - length),
        strokeWidth = 6.dp.toPx(),
        cap = StrokeCap.Round
    )

    // Arrow head
    val path = Path().apply {
        moveTo(center.x, center.y - length - arrowHeadSize / 2)
        lineTo(center.x - arrowHeadSize / 2, center.y - length + arrowHeadSize / 2)
        lineTo(center.x + arrowHeadSize / 2, center.y - length + arrowHeadSize / 2)
        close()
    }
    drawPath(path, color)
}

@Composable
private fun CompassInfoCards(
    qiblaBearing: Float,
    currentHeading: Float,
    distance: String,
    cardinalDirection: String
) {
    Column(
        modifier = Modifier.fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        // Qibla bearing card
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(
                containerColor = MaterialTheme.colorScheme.primaryContainer
            )
        ) {
            Column(
                modifier = Modifier.padding(16.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    text = stringResource(R.string.compass_qibla_direction),
                    style = MaterialTheme.typography.labelMedium,
                    color = MaterialTheme.colorScheme.onPrimaryContainer
                )
                Text(
                    text = "%.1f°".format(qiblaBearing),
                    style = MaterialTheme.typography.headlineSmall,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onPrimaryContainer
                )
            }
        }

        // Current heading and distance
        androidx.compose.foundation.layout.Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Card(
                modifier = Modifier.weight(1f),
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.surfaceVariant
                )
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = stringResource(R.string.compass_heading),
                        style = MaterialTheme.typography.labelMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Text(
                        text = "%.0f° $cardinalDirection".format(currentHeading),
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.SemiBold,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }

            Card(
                modifier = Modifier.weight(1f),
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.surfaceVariant
                )
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = stringResource(R.string.compass_distance),
                        style = MaterialTheme.typography.labelMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Text(
                        text = distance,
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.SemiBold,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
        }
    }
}

@Composable
private fun CalibrationWarning() {
    Card(
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.errorContainer
        )
    ) {
        androidx.compose.foundation.layout.Row(
            modifier = Modifier.padding(12.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Icon(
                imageVector = Icons.Default.Warning,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.onErrorContainer
            )
            Text(
                text = stringResource(R.string.compass_calibration_needed),
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onErrorContainer
            )
        }
    }
}

@Composable
private fun CompassUnavailable() {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(32.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Icon(
            imageVector = Icons.Default.Warning,
            contentDescription = null,
            modifier = Modifier.size(64.dp),
            tint = MaterialTheme.colorScheme.error
        )
        Spacer(modifier = Modifier.height(16.dp))
        Text(
            text = stringResource(R.string.compass_unavailable),
            style = MaterialTheme.typography.titleMedium,
            textAlign = TextAlign.Center,
            color = MaterialTheme.colorScheme.onSurface
        )
        Spacer(modifier = Modifier.height(8.dp))
        Text(
            text = stringResource(R.string.compass_unavailable_description),
            style = MaterialTheme.typography.bodyMedium,
            textAlign = TextAlign.Center,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
    }
}

@Composable
private fun LocationRequired() {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(32.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Icon(
            imageVector = Icons.Default.LocationOff,
            contentDescription = null,
            modifier = Modifier.size(64.dp),
            tint = MaterialTheme.colorScheme.primary
        )
        Spacer(modifier = Modifier.height(16.dp))
        Text(
            text = stringResource(R.string.compass_location_required),
            style = MaterialTheme.typography.titleMedium,
            textAlign = TextAlign.Center,
            color = MaterialTheme.colorScheme.onSurface
        )
        Spacer(modifier = Modifier.height(8.dp))
        Text(
            text = stringResource(R.string.compass_location_required_description),
            style = MaterialTheme.typography.bodyMedium,
            textAlign = TextAlign.Center,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
    }
}
