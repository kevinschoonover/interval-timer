import { useRef, useCallback } from 'react';
import { Audio, InterruptionModeIOS, InterruptionModeAndroid } from 'expo-av';

const beepSource = require('../../assets/sounds/beep.mp3');
const phaseChangeSource = require('../../assets/sounds/phase-change.mp3');
const completeSource = require('../../assets/sounds/complete.mp3');

export function useAudioFeedback(volume: number = 1.0) {
  const beepRef = useRef<Audio.Sound | null>(null);
  const phaseRef = useRef<Audio.Sound | null>(null);
  const completeRef = useRef<Audio.Sound | null>(null);
  const volumeRef = useRef(volume);
  volumeRef.current = volume;

  const ensureAudioMode = useCallback(async () => {
    await Audio.setAudioModeAsync({
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
      interruptionModeIOS: InterruptionModeIOS.MixWithOthers,
      interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
      shouldDuckAndroid: true,
    });
  }, []);

  const playSound = useCallback(
    async (ref: React.RefObject<Audio.Sound | null>, source: number) => {
      try {
        await ensureAudioMode();
        if (ref.current) {
          await ref.current.unloadAsync();
        }
        const { sound } = await Audio.Sound.createAsync(source, {
          volume: volumeRef.current,
        });
        ref.current = sound;
        await sound.playAsync();
      } catch (e) {
        console.warn('Failed to play sound:', e);
      }
    },
    [ensureAudioMode],
  );

  const playBeep = useCallback(
    () => playSound(beepRef, beepSource),
    [playSound],
  );

  const playPhaseChange = useCallback(
    () => playSound(phaseRef, phaseChangeSource),
    [playSound],
  );

  const playComplete = useCallback(
    () => playSound(completeRef, completeSource),
    [playSound],
  );

  const cleanup = useCallback(async () => {
    for (const ref of [beepRef, phaseRef, completeRef]) {
      if (ref.current) {
        await ref.current.unloadAsync().catch(() => {});
        ref.current = null;
      }
    }
  }, []);

  return { playBeep, playPhaseChange, playComplete, cleanup };
}
