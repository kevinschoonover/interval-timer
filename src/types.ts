export type TimerPhase = 'jog' | 'run';

export type TimerStatus = 'idle' | 'running' | 'paused' | 'completed';

export type AutoDetectMode = 'off' | 'treadmill' | 'outdoor';

export interface TimerConfig {
  jogDurationSeconds: number;
  runDurationSeconds: number;
  intervalCount: number;
  autoDetectMode: AutoDetectMode;
  volume: number; // 0.0 – 1.0
}

export interface TimerState {
  status: TimerStatus;
  currentPhase: TimerPhase;
  currentInterval: number;
  remainingSeconds: number;
  totalIntervals: number;
  config: TimerConfig;
}

export type TimerAction =
  | { type: 'START'; config: TimerConfig }
  | { type: 'TICK' }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'STOP' }
  | { type: 'FORCE_PHASE'; phase: TimerPhase };
