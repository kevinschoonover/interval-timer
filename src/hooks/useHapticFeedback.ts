import { useCallback } from 'react';
import * as Haptics from 'expo-haptics';

export function useHapticFeedback() {
  const warningPulse = useCallback(async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      // Haptics not available (simulator)
    }
  }, []);

  const phaseTransition = useCallback(async () => {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch {
      // Haptics not available
    }
  }, []);

  const workoutComplete = useCallback(async () => {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      // Haptics not available
    }
  }, []);

  return { warningPulse, phaseTransition, workoutComplete };
}
