export const COLORS = {
  jog: '#3B82F6', // blue-500
  run: '#EF4444', // red-500
  warning: '#F59E0B', // amber-500
  background: '#111827', // gray-900
  surface: '#1F2937', // gray-800
  text: '#F9FAFB', // gray-50
  textMuted: '#9CA3AF', // gray-400
  start: '#10B981', // emerald-500
} as const;

// GPS speed thresholds (m/s) for outdoor mode
export const GPS_SPEED = {
  threshold: 3.0, // jog/run boundary
  hysteresis: 0.3, // ±0.3 m/s deadzone
} as const;

// Cadence thresholds (steps per minute) for treadmill mode
export const CADENCE = {
  threshold: 170, // jog/run boundary SPM
  hysteresis: 5, // ±5 SPM deadzone
} as const;

export const WARNING_SECONDS = 10;

export const DEFAULT_CONFIG = {
  jogDurationSeconds: 60,
  runDurationSeconds: 30,
  intervalCount: 5,
} as const;
