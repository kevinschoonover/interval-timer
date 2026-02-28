import { TimerPhase } from '../types';

interface ClassifierConfig {
  threshold: number;
  hysteresis: number;
}

/**
 * Classifies a metric value (speed in m/s or cadence in SPM) as jog or run
 * with hysteresis to prevent oscillation near the threshold.
 *
 * - Below (threshold - hysteresis): always jog
 * - Above (threshold + hysteresis): always run
 * - In between: keep previous phase (hysteresis band)
 */
export function classifyPhase(
  value: number,
  previousPhase: TimerPhase,
  config: ClassifierConfig,
): TimerPhase {
  const lower = config.threshold - config.hysteresis;
  const upper = config.threshold + config.hysteresis;

  if (value >= upper) return 'run';
  if (value <= lower) return 'jog';
  return previousPhase;
}
