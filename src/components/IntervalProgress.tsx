import { View, Text } from 'react-native';

interface IntervalProgressProps {
  currentInterval: number;
  totalIntervals: number;
}

export function IntervalProgress({
  currentInterval,
  totalIntervals,
}: IntervalProgressProps) {
  return (
    <View className="items-center mb-6">
      <View className="flex-row mb-2">
        {Array.from({ length: totalIntervals }, (_, i) => {
          const idx = i + 1;
          let dotClass = 'bg-gray-600'; // remaining
          if (idx < currentInterval) dotClass = 'bg-emerald-500'; // completed
          else if (idx === currentInterval) dotClass = 'bg-white'; // current
          return (
            <View
              key={idx}
              className={`w-3 h-3 rounded-full mx-1 ${dotClass}`}
            />
          );
        })}
      </View>
      <Text className="text-gray-400 text-sm">
        Interval {currentInterval} of {totalIntervals}
      </Text>
    </View>
  );
}
