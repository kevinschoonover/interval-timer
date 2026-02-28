import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { IntervalTimerScreen } from './src/screens/IntervalTimerScreen';

import './global.css';

export default function App() {
  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex-1 bg-gray-900" edges={['top', 'left', 'right']}>
        <IntervalTimerScreen />
        <StatusBar style="light" />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
