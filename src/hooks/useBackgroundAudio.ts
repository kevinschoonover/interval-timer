import { useRef, useCallback } from 'react';
import { Audio, InterruptionModeIOS, InterruptionModeAndroid } from 'expo-av';

const silenceSource = require('../../assets/sounds/silence.mp3');

export function useBackgroundAudio() {
  const soundRef = useRef<Audio.Sound | null>(null);

  const startBackground = useCallback(async () => {
    try {
      await Audio.setAudioModeAsync({
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        interruptionModeIOS: InterruptionModeIOS.MixWithOthers,
        interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
        shouldDuckAndroid: true,
      });

      const { sound } = await Audio.Sound.createAsync(silenceSource, {
        isLooping: true,
        volume: 0,
      });
      soundRef.current = sound;
      await sound.playAsync();
    } catch (e) {
      console.warn('Failed to start background audio:', e);
    }
  }, []);

  const stopBackground = useCallback(async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
      await Audio.setAudioModeAsync({
        staysActiveInBackground: false,
        playsInSilentModeIOS: false,
        interruptionModeIOS: InterruptionModeIOS.MixWithOthers,
        interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
      });
    } catch (e) {
      console.warn('Failed to stop background audio:', e);
    }
  }, []);

  return { startBackground, stopBackground };
}
