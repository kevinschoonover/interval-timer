import { Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useEffect } from 'react';

interface CountdownWarningProps {
  secondsLeft: number;
  visible: boolean;
}

export function CountdownWarning({ secondsLeft, visible }: CountdownWarningProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 200 });
      scale.value = withRepeat(
        withSequence(
          withTiming(1.15, { duration: 400, easing: Easing.out(Easing.ease) }),
          withTiming(1, { duration: 400, easing: Easing.in(Easing.ease) }),
        ),
        -1,
        true,
      );
    } else {
      opacity.value = withTiming(0, { duration: 200 });
      scale.value = 1;
    }
  }, [visible, scale, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  if (!visible) return null;

  return (
    <Animated.View
      style={animatedStyle}
      className="absolute inset-0 items-center justify-center bg-black/60 z-10"
    >
      <Text className="text-amber-400 text-8xl font-bold">{secondsLeft}</Text>
      <Text className="text-amber-400 text-xl font-bold mt-2">
        GET READY TO RUN
      </Text>
    </Animated.View>
  );
}
