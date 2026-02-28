import { View, Text, TextInput } from 'react-native';

interface TimeInputProps {
  label: string;
  labelColor: string;
  minutes: string;
  seconds: string;
  onChangeMinutes: (val: string) => void;
  onChangeSeconds: (val: string) => void;
}

export function TimeInput({
  label,
  labelColor,
  minutes,
  seconds,
  onChangeMinutes,
  onChangeSeconds,
}: TimeInputProps) {
  const filterNumeric = (text: string) => text.replace(/[^0-9]/g, '');

  return (
    <View className="mb-4">
      <Text className="text-sm font-semibold mb-2" style={{ color: labelColor }}>
        {label}
      </Text>
      <View className="flex-row items-center">
        <TextInput
          className="bg-gray-700 text-white text-center text-lg rounded-lg px-4 py-3 w-20"
          value={minutes}
          onChangeText={(t) => onChangeMinutes(filterNumeric(t))}
          keyboardType="number-pad"
          maxLength={2}
          placeholder="00"
          placeholderTextColor="#6B7280"
        />
        <Text className="text-white text-2xl mx-2">:</Text>
        <TextInput
          className="bg-gray-700 text-white text-center text-lg rounded-lg px-4 py-3 w-20"
          value={seconds}
          onChangeText={(t) => onChangeSeconds(filterNumeric(t))}
          keyboardType="number-pad"
          maxLength={2}
          placeholder="00"
          placeholderTextColor="#6B7280"
        />
        <Text className="text-gray-400 text-sm ml-3">min : sec</Text>
      </View>
    </View>
  );
}
