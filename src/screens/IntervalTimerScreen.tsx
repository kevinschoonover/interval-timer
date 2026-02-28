import { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { SetupForm } from '../components/SetupForm';
import { TimerDisplay } from '../components/TimerDisplay';
import { CountdownWarning } from '../components/CountdownWarning';
import { IntervalProgress } from '../components/IntervalProgress';
import { SpeedIndicator } from '../components/SpeedIndicator';
import { useIntervalTimer } from '../hooks/useIntervalTimer';
import { useBackgroundAudio } from '../hooks/useBackgroundAudio';
import { useAudioFeedback } from '../hooks/useAudioFeedback';
import { useHapticFeedback } from '../hooks/useHapticFeedback';
import { useAutoDetect } from '../hooks/useAutoDetect';
import { WARNING_SECONDS } from '../constants';
import { TimerConfig } from '../types';

export function IntervalTimerScreen() {
  const { state, start, pause, resume, stop } = useIntervalTimer();
  const { startBackground, stopBackground } = useBackgroundAudio();
  const [volume, setVolume] = useState(1.0);
  const { playBeep, playPhaseChange, playComplete, cleanup } = useAudioFeedback(volume);
  const { warningPulse, phaseTransition, workoutComplete } = useHapticFeedback();

  const autoDetect = useAutoDetect(
    state.status === 'running' || state.status === 'paused'
      ? state.config.autoDetectMode
      : 'off',
    state.currentPhase,
    state.currentInterval,
  );

  const [preCountdown, setPreCountdown] = useState(0);
  const [pendingConfig, setPendingConfig] = useState<TimerConfig | null>(null);
  const preTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const prevPhaseRef = useRef(state.currentPhase);
  const prevStatusRef = useRef(state.status);

  const isWarning =
    state.status === 'running' &&
    state.currentPhase === 'jog' &&
    state.remainingSeconds <= WARNING_SECONDS &&
    state.remainingSeconds > 0;

  // Phase change effects
  useEffect(() => {
    if (
      state.status === 'running' &&
      prevPhaseRef.current !== state.currentPhase &&
      prevStatusRef.current === 'running'
    ) {
      playPhaseChange();
      phaseTransition();
    }
    prevPhaseRef.current = state.currentPhase;
    prevStatusRef.current = state.status;
  }, [state.currentPhase, state.status, playPhaseChange, phaseTransition]);

  // Warning beep + haptic each second during countdown
  useEffect(() => {
    if (isWarning) {
      playBeep();
      warningPulse();
    }
  }, [isWarning, state.remainingSeconds, playBeep, warningPulse]);

  // Workout complete
  useEffect(() => {
    if (state.status === 'completed') {
      playComplete();
      workoutComplete();
      stopBackground();
      deactivateKeepAwake();
    }
  }, [state.status, playComplete, workoutComplete, stopBackground]);

  // Keep awake management
  useEffect(() => {
    if (state.status === 'running') {
      activateKeepAwakeAsync();
    } else if (state.status === 'idle') {
      deactivateKeepAwake();
    }
  }, [state.status]);

  // Pre-workout countdown tick
  useEffect(() => {
    if (preCountdown <= 0) return;

    preTimerRef.current = setTimeout(() => {
      const next = preCountdown - 1;
      if (next > 0) {
        playBeep();
        warningPulse();
        setPreCountdown(next);
      } else {
        // Countdown finished — start the actual workout
        if (pendingConfig) {
          start(pendingConfig);
          setPendingConfig(null);
        }
        setPreCountdown(0);
      }
    }, 1000);

    return () => {
      if (preTimerRef.current) clearTimeout(preTimerRef.current);
    };
  }, [preCountdown, pendingConfig, start, playBeep, warningPulse]);

  const handleStart = useCallback(
    async (config: TimerConfig) => {
      setVolume(config.volume);
      await startBackground();
      setPendingConfig(config);
      setPreCountdown(5);
      playBeep();
      warningPulse();
    },
    [startBackground, playBeep, warningPulse],
  );

  const handleStop = useCallback(async () => {
    // Cancel pre-countdown if active
    if (preTimerRef.current) clearTimeout(preTimerRef.current);
    setPreCountdown(0);
    setPendingConfig(null);
    stop();
    await stopBackground();
    await cleanup();
    deactivateKeepAwake();
  }, [stop, stopBackground, cleanup]);

  const handleVolumePreview = useCallback(
    (vol: number) => {
      setVolume(vol);
      setTimeout(() => playBeep(), 50);
    },
    [playBeep],
  );

  // Pre-workout countdown screen
  if (preCountdown > 0) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-gray-400 text-xl mb-4">Get Ready</Text>
        <Text className="text-white text-9xl font-bold">{preCountdown}</Text>
      </View>
    );
  }

  // Idle — show setup form
  if (state.status === 'idle') {
    return <SetupForm onStart={handleStart} onVolumePreview={handleVolumePreview} />;
  }

  // Completed — show summary
  if (state.status === 'completed') {
    return (
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-emerald-400 text-4xl font-bold mb-4">
          Workout Complete!
        </Text>
        <Text className="text-gray-400 text-lg mb-2">
          {state.totalIntervals} intervals finished
        </Text>
        <Text className="text-gray-500 text-sm mb-8">
          Jog: {formatDuration(state.config.jogDurationSeconds)} / Run:{' '}
          {formatDuration(state.config.runDurationSeconds)}
        </Text>
        <TouchableOpacity
          className="bg-emerald-500 rounded-xl py-4 px-12"
          onPress={handleStop}
          activeOpacity={0.8}
        >
          <Text className="text-white text-lg font-bold">Done</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Active timer (running or paused)
  return (
    <View className="flex-1">
      <CountdownWarning
        secondsLeft={state.remainingSeconds}
        visible={isWarning}
      />

      <IntervalProgress
        currentInterval={state.currentInterval}
        totalIntervals={state.totalIntervals}
      />

      <TimerDisplay
        phase={state.currentPhase}
        remainingSeconds={state.remainingSeconds}
        isWarning={isWarning}
      />

      {autoDetect && (
        <SpeedIndicator
          mode={state.config.autoDetectMode}
          detectedPhase={autoDetect.detectedPhase}
          currentMetric={autoDetect.currentMetric}
          calibrationStatus={autoDetect.calibrationStatus}
        />
      )}

      <View className="flex-row justify-center gap-4 px-6 mt-4">
        {state.status === 'running' ? (
          <TouchableOpacity
            className="bg-gray-700 rounded-xl py-4 px-8 flex-1"
            onPress={pause}
            activeOpacity={0.8}
          >
            <Text className="text-white text-lg font-bold text-center">
              Pause
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            className="bg-emerald-500 rounded-xl py-4 px-8 flex-1"
            onPress={resume}
            activeOpacity={0.8}
          >
            <Text className="text-white text-lg font-bold text-center">
              Resume
            </Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          className="bg-red-600 rounded-xl py-4 px-8 flex-1"
          onPress={handleStop}
          activeOpacity={0.8}
        >
          <Text className="text-white text-lg font-bold text-center">Stop</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function formatDuration(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  if (m === 0) return `${s}s`;
  if (s === 0) return `${m}m`;
  return `${m}m ${s}s`;
}
