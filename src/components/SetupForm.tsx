import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Keyboard, TouchableWithoutFeedback, ScrollView } from 'react-native';
import Slider from '@react-native-community/slider';
import { TimeInput } from './TimeInput';
import { COLORS, DEFAULT_CONFIG } from '../constants';
import { AutoDetectMode, TimerConfig } from '../types';

interface SetupFormProps {
  onStart: (config: TimerConfig) => void;
  onVolumePreview?: (volume: number) => void;
}

const AUTO_DETECT_OPTIONS: { label: string; value: AutoDetectMode }[] = [
  { label: 'Off', value: 'off' },
  { label: 'Treadmill', value: 'treadmill' },
  { label: 'Outdoor', value: 'outdoor' },
];

export function SetupForm({ onStart, onVolumePreview }: SetupFormProps) {
  const [jogMin, setJogMin] = useState(
    String(Math.floor(DEFAULT_CONFIG.jogDurationSeconds / 60)),
  );
  const [jogSec, setJogSec] = useState(
    String(DEFAULT_CONFIG.jogDurationSeconds % 60).padStart(2, '0'),
  );
  const [runMin, setRunMin] = useState(
    String(Math.floor(DEFAULT_CONFIG.runDurationSeconds / 60)),
  );
  const [runSec, setRunSec] = useState(
    String(DEFAULT_CONFIG.runDurationSeconds % 60).padStart(2, '0'),
  );
  const [intervals, setIntervals] = useState(
    String(DEFAULT_CONFIG.intervalCount),
  );
  const [autoDetect, setAutoDetect] = useState<AutoDetectMode>('off');
  const [volume, setVolume] = useState(1.0);

  const handleStart = () => {
    const jogDuration = (parseInt(jogMin, 10) || 0) * 60 + (parseInt(jogSec, 10) || 0);
    const runDuration = (parseInt(runMin, 10) || 0) * 60 + (parseInt(runSec, 10) || 0);
    const count = parseInt(intervals, 10) || 1;

    onStart({
      jogDurationSeconds: jogDuration,
      runDurationSeconds: runDuration,
      intervalCount: count,
      autoDetectMode: autoDetect,
      volume,
    });
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScrollView className="flex-1 px-6 pt-4" keyboardShouldPersistTaps="handled">
        <Text className="text-white text-2xl font-bold mb-6 text-center">
          Interval Timer
        </Text>

        <TimeInput
          label="JOG DURATION"
          labelColor={COLORS.jog}
          minutes={jogMin}
          seconds={jogSec}
          onChangeMinutes={setJogMin}
          onChangeSeconds={setJogSec}
        />

        <TimeInput
          label="RUN DURATION"
          labelColor={COLORS.run}
          minutes={runMin}
          seconds={runSec}
          onChangeMinutes={setRunMin}
          onChangeSeconds={setRunSec}
        />

        <View className="mb-6">
          <Text className="text-gray-400 text-sm font-semibold mb-2">
            INTERVALS
          </Text>
          <TextInput
            className="bg-gray-700 text-white text-center text-lg rounded-lg px-4 py-3 w-20"
            value={intervals}
            onChangeText={(t) => setIntervals(t.replace(/[^0-9]/g, ''))}
            keyboardType="number-pad"
            maxLength={2}
            placeholder="5"
            placeholderTextColor="#6B7280"
          />
        </View>

        <View className="mb-6">
          <Text className="text-gray-400 text-sm font-semibold mb-2">
            AUTO-DETECT MODE
          </Text>
          <View className="flex-row bg-gray-700 rounded-lg overflow-hidden">
            {AUTO_DETECT_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                className={`flex-1 py-3 ${
                  autoDetect === opt.value ? 'bg-emerald-600' : ''
                }`}
                onPress={() => setAutoDetect(opt.value)}
              >
                <Text
                  className={`text-center text-sm font-medium ${
                    autoDetect === opt.value ? 'text-white' : 'text-gray-400'
                  }`}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {autoDetect === 'treadmill' && (
            <Text className="text-gray-500 text-xs mt-2">
              Uses pedometer & accelerometer — works on treadmills
            </Text>
          )}
          {autoDetect === 'outdoor' && (
            <Text className="text-gray-500 text-xs mt-2">
              Uses GPS speed — requires location permission
            </Text>
          )}
        </View>

        <View className="mb-6">
          <Text className="text-gray-400 text-sm font-semibold mb-2">
            BEEP VOLUME — {Math.round(volume * 100)}%
          </Text>
          <Slider
            minimumValue={0}
            maximumValue={1}
            step={0.05}
            value={volume}
            onValueChange={setVolume}
            onSlidingComplete={(val) => onVolumePreview?.(val)}
            minimumTrackTintColor="#10B981"
            maximumTrackTintColor="#374151"
            thumbTintColor="#10B981"
          />
        </View>

        <TouchableOpacity
          className="bg-emerald-500 rounded-xl py-4 mt-4 mb-8"
          onPress={handleStart}
          activeOpacity={0.8}
        >
          <Text className="text-white text-lg font-bold text-center">
            Start Workout
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
}
