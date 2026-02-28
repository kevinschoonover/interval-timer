import { useState, useEffect, useRef } from 'react';
import { AutoDetectMode, TimerPhase } from '../types';
import { GPS_SPEED, CADENCE } from '../constants';
import { classifyPhase } from '../utils/speedClassifier';
import { useGPSSpeed } from './useGPSSpeed';
import { useCadence } from './useCadence';

interface CalibrationData {
  jogSamples: number[];
  runSamples: number[];
  jogMean: number | null;
  runMean: number | null;
  threshold: number | null;
}

interface AutoDetectResult {
  detectedPhase: TimerPhase;
  currentMetric: number;
  calibrationStatus: 'calibrating' | 'calibrated' | 'none';
}

/**
 * Auto-detection hook that delegates to GPS or cadence sensors.
 *
 * In treadmill mode, the first interval is used for calibration:
 * - During the jog phase of interval 1, cadence samples are collected as "jog cadence"
 * - During the run phase of interval 1, cadence samples are collected as "run cadence"
 * - After both phases, a personalized threshold is computed as the midpoint
 * - Subsequent intervals use the calibrated threshold for classification
 *
 * This accounts for individual differences in stride patterns and treadmill behavior.
 */
export function useAutoDetect(
  mode: AutoDetectMode,
  timerPhase: TimerPhase,
  currentInterval: number,
): AutoDetectResult | null {
  const isActive = mode !== 'off';
  const gpsSpeed = useGPSSpeed(isActive && mode === 'outdoor');
  const cadence = useCadence(isActive && mode === 'treadmill');

  const [detectedPhase, setDetectedPhase] = useState<TimerPhase>('jog');
  const calibrationRef = useRef<CalibrationData>({
    jogSamples: [],
    runSamples: [],
    jogMean: null,
    runMean: null,
    threshold: null,
  });
  const [calibrationStatus, setCalibrationStatus] = useState<
    'calibrating' | 'calibrated' | 'none'
  >('none');

  // Track previous phase for classification
  const prevDetectedRef = useRef<TimerPhase>('jog');

  // Reset calibration when mode changes
  useEffect(() => {
    calibrationRef.current = {
      jogSamples: [],
      runSamples: [],
      jogMean: null,
      runMean: null,
      threshold: null,
    };
    setCalibrationStatus(mode === 'treadmill' ? 'calibrating' : 'none');
  }, [mode]);

  // Collect calibration samples during interval 1 (treadmill mode)
  useEffect(() => {
    if (mode !== 'treadmill' || !isActive) return;

    const cal = calibrationRef.current;

    if (currentInterval === 1 && cadence > 0) {
      if (timerPhase === 'jog') {
        cal.jogSamples.push(cadence);
      } else if (timerPhase === 'run') {
        cal.runSamples.push(cadence);
      }
    }

    // Compute calibrated threshold once we have both jog and run samples
    // (i.e., we've moved past the jog phase of interval 1)
    if (
      cal.threshold === null &&
      cal.jogSamples.length >= 3 &&
      cal.runSamples.length >= 3
    ) {
      cal.jogMean =
        cal.jogSamples.reduce((a, b) => a + b, 0) / cal.jogSamples.length;
      cal.runMean =
        cal.runSamples.reduce((a, b) => a + b, 0) / cal.runSamples.length;
      cal.threshold = (cal.jogMean + cal.runMean) / 2;
      setCalibrationStatus('calibrated');
    }
  }, [mode, isActive, currentInterval, timerPhase, cadence]);

  // Classify current metric
  useEffect(() => {
    if (!isActive) return;

    let metric: number;
    let threshold: number;
    let hysteresis: number;

    if (mode === 'outdoor') {
      metric = gpsSpeed;
      threshold = GPS_SPEED.threshold;
      hysteresis = GPS_SPEED.hysteresis;
    } else {
      // Treadmill mode
      metric = cadence;
      const cal = calibrationRef.current;

      if (cal.threshold !== null) {
        // Use calibrated threshold
        threshold = cal.threshold;
        // Hysteresis scales with the gap between jog and run means
        hysteresis =
          cal.jogMean !== null && cal.runMean !== null
            ? Math.abs(cal.runMean - cal.jogMean) * 0.15
            : CADENCE.hysteresis;
      } else if (currentInterval === 1) {
        // Still calibrating — trust the timer phase during interval 1
        setDetectedPhase(timerPhase);
        prevDetectedRef.current = timerPhase;
        return;
      } else {
        // Fallback to defaults if calibration didn't get enough samples
        threshold = CADENCE.threshold;
        hysteresis = CADENCE.hysteresis;
      }
    }

    const classified = classifyPhase(metric, prevDetectedRef.current, {
      threshold,
      hysteresis,
    });
    setDetectedPhase(classified);
    prevDetectedRef.current = classified;
  }, [mode, isActive, gpsSpeed, cadence, currentInterval, timerPhase]);

  if (!isActive) return null;

  return {
    detectedPhase,
    currentMetric: mode === 'outdoor' ? gpsSpeed : cadence,
    calibrationStatus,
  };
}
