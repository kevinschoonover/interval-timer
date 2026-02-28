import { useState, useEffect, useRef } from 'react';
import { Pedometer } from 'expo-sensors';

/**
 * Tracks real-time step cadence (steps per minute) using the device pedometer.
 * Computes cadence over rolling 5-second windows for smooth readings.
 */
export function useCadence(active: boolean) {
  const [cadence, setCadence] = useState(0);
  const baseStepsRef = useRef(0);
  const windowRef = useRef<{ time: number; steps: number }[]>([]);
  const subscriptionRef = useRef<ReturnType<typeof Pedometer.watchStepCount> | null>(null);
  const cumulativeRef = useRef(0);

  useEffect(() => {
    if (!active) {
      if (subscriptionRef.current) {
        subscriptionRef.current.remove();
        subscriptionRef.current = null;
      }
      setCadence(0);
      baseStepsRef.current = 0;
      cumulativeRef.current = 0;
      windowRef.current = [];
      return;
    }

    let cancelled = false;

    (async () => {
      const available = await Pedometer.isAvailableAsync();
      if (!available || cancelled) return;

      baseStepsRef.current = 0;
      cumulativeRef.current = 0;
      windowRef.current = [];

      const sub = Pedometer.watchStepCount((result) => {
        // result.steps is cumulative since watchStepCount started
        const totalSteps = result.steps;
        cumulativeRef.current = totalSteps;
        const now = Date.now();

        windowRef.current.push({ time: now, steps: totalSteps });

        // Keep only last 5 seconds of samples
        const cutoff = now - 5000;
        windowRef.current = windowRef.current.filter((s) => s.time >= cutoff);

        if (windowRef.current.length >= 2) {
          const oldest = windowRef.current[0];
          const newest = windowRef.current[windowRef.current.length - 1];
          const dtSeconds = (newest.time - oldest.time) / 1000;
          const dSteps = newest.steps - oldest.steps;

          if (dtSeconds > 0) {
            const spm = (dSteps / dtSeconds) * 60;
            setCadence(spm);
          }
        }
      });

      if (cancelled) {
        sub.remove();
      } else {
        subscriptionRef.current = sub;
      }
    })();

    return () => {
      cancelled = true;
      if (subscriptionRef.current) {
        subscriptionRef.current.remove();
        subscriptionRef.current = null;
      }
    };
  }, [active]);

  return cadence;
}
