import { View, Text } from 'react-native';
import { formatTime } from '../utils/formatTime';
import { COLORS } from '../constants';
import { TimerPhase } from '../types';

interface TimerDisplayProps {
  phase: TimerPhase;
  remainingSeconds: number;
  isWarning: boolean;
}

export function TimerDisplay({ phase, remainingSeconds, isWarning }: TimerDisplayProps) {
  const borderColor = isWarning
    ? COLORS.warning
    : phase === 'jog'
      ? COLORS.jog
      : COLORS.run;

  const phaseLabel = phase.toUpperCase();
  const pillBg = phase === 'jog' ? 'bg-blue-500' : 'bg-red-500';

  return (
    <View className="items-center my-8">
      {/* Circular countdown container */}
      <View
        className="w-64 h-64 rounded-full items-center justify-center"
        style={{ borderWidth: 6, borderColor }}
      >
        <Text className="text-white text-6xl font-bold font-mono">
          {formatTime(remainingSeconds)}
        </Text>
      </View>

      {/* Phase pill */}
      <View className={`${pillBg} rounded-full px-6 py-2 mt-4`}>
        <Text className="text-white text-lg font-bold">{phaseLabel}</Text>
      </View>
    </View>
  );
}
