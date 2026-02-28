import { View, Text } from 'react-native';
import { TimerPhase, AutoDetectMode } from '../types';
import { COLORS } from '../constants';

interface SpeedIndicatorProps {
  mode: AutoDetectMode;
  detectedPhase: TimerPhase;
  currentMetric: number;
  calibrationStatus?: 'calibrating' | 'calibrated' | 'none';
}

export function SpeedIndicator({
  mode,
  detectedPhase,
  currentMetric,
  calibrationStatus,
}: SpeedIndicatorProps) {
  if (mode === 'off') return null;

  const isTreadmill = mode === 'treadmill';
  const metricLabel = isTreadmill
    ? `${Math.round(currentMetric)} SPM`
    : `${currentMetric.toFixed(1)} m/s`;
  const modeLabel = isTreadmill ? 'Cadence' : 'GPS Speed';
  const phaseColor = detectedPhase === 'jog' ? COLORS.jog : COLORS.run;

  return (
    <View className="bg-gray-800 rounded-xl p-4 mx-6 mb-4">
      <Text className="text-gray-400 text-xs text-center mb-1">
        {modeLabel} Detection
      </Text>
      <View className="flex-row items-center justify-center">
        <View
          className="w-3 h-3 rounded-full mr-2"
          style={{ backgroundColor: phaseColor }}
        />
        <Text className="text-white text-lg font-semibold mr-2">
          {detectedPhase.toUpperCase()}
        </Text>
        <Text className="text-gray-400 text-sm">({metricLabel})</Text>
      </View>
      {isTreadmill && calibrationStatus === 'calibrating' && (
        <Text className="text-amber-400 text-xs text-center mt-2">
          Calibrating on interval 1 — jog and run normally
        </Text>
      )}
      {isTreadmill && calibrationStatus === 'calibrated' && (
        <Text className="text-emerald-400 text-xs text-center mt-2">
          Calibrated to your stride
        </Text>
      )}
    </View>
  );
}
