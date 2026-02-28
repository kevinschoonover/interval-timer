import { useReducer, useRef, useCallback, useEffect } from 'react';
import { TimerState, TimerAction, TimerConfig } from '../types';

const initialState: TimerState = {
  status: 'idle',
  currentPhase: 'jog',
  currentInterval: 1,
  remainingSeconds: 0,
  totalIntervals: 0,
  config: {
    jogDurationSeconds: 0,
    runDurationSeconds: 0,
    intervalCount: 0,
    autoDetectMode: 'off',
    volume: 1.0,
  },
};

function timerReducer(state: TimerState, action: TimerAction): TimerState {
  switch (action.type) {
    case 'START': {
      const { config } = action;
      // Skip jog phase if duration is 0
      const startPhase = config.jogDurationSeconds === 0 ? 'run' : 'jog';
      const startDuration =
        startPhase === 'jog'
          ? config.jogDurationSeconds
          : config.runDurationSeconds;

      return {
        status: 'running',
        currentPhase: startPhase as 'jog' | 'run',
        currentInterval: 1,
        remainingSeconds: startDuration,
        totalIntervals: config.intervalCount,
        config,
      };
    }

    case 'TICK': {
      if (state.status !== 'running') return state;

      const next = state.remainingSeconds - 1;
      if (next > 0) {
        return { ...state, remainingSeconds: next };
      }

      // Phase expired — transition
      if (state.currentPhase === 'jog') {
        // Jog → Run (same interval)
        if (state.config.runDurationSeconds === 0) {
          // Skip run phase, go to next interval or complete
          if (state.currentInterval >= state.totalIntervals) {
            return { ...state, status: 'completed', remainingSeconds: 0 };
          }
          return {
            ...state,
            currentPhase: 'jog',
            currentInterval: state.currentInterval + 1,
            remainingSeconds: state.config.jogDurationSeconds,
          };
        }
        return {
          ...state,
          currentPhase: 'run',
          remainingSeconds: state.config.runDurationSeconds,
        };
      }

      // Run → next interval's Jog, or completed
      if (state.currentInterval >= state.totalIntervals) {
        return { ...state, status: 'completed', remainingSeconds: 0 };
      }

      if (state.config.jogDurationSeconds === 0) {
        // Skip jog phase
        return {
          ...state,
          currentPhase: 'run',
          currentInterval: state.currentInterval + 1,
          remainingSeconds: state.config.runDurationSeconds,
        };
      }

      return {
        ...state,
        currentPhase: 'jog',
        currentInterval: state.currentInterval + 1,
        remainingSeconds: state.config.jogDurationSeconds,
      };
    }

    case 'PAUSE':
      if (state.status !== 'running') return state;
      return { ...state, status: 'paused' };

    case 'RESUME':
      if (state.status !== 'paused') return state;
      return { ...state, status: 'running' };

    case 'STOP':
      return initialState;

    case 'FORCE_PHASE': {
      if (state.status !== 'running') return state;
      if (state.currentPhase === action.phase) return state;
      const duration =
        action.phase === 'jog'
          ? state.config.jogDurationSeconds
          : state.config.runDurationSeconds;
      return {
        ...state,
        currentPhase: action.phase,
        remainingSeconds: duration,
      };
    }

    default:
      return state;
  }
}

export function useIntervalTimer() {
  const [state, dispatch] = useReducer(timerReducer, initialState);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nextTickRef = useRef<number>(0);

  // Drift-correcting timer using setTimeout chains
  const scheduleTick = useCallback(() => {
    const now = Date.now();
    const drift = now - nextTickRef.current;
    const delay = Math.max(0, 1000 - drift);
    nextTickRef.current = now + delay;

    timerRef.current = setTimeout(() => {
      dispatch({ type: 'TICK' });
      scheduleTick();
    }, delay);
  }, []);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (state.status === 'running') {
      nextTickRef.current = Date.now() + 1000;
      scheduleTick();
    } else {
      clearTimer();
    }
    return clearTimer;
  }, [state.status, scheduleTick, clearTimer]);

  const start = useCallback((config: TimerConfig) => {
    dispatch({ type: 'START', config });
  }, []);

  const pause = useCallback(() => dispatch({ type: 'PAUSE' }), []);
  const resume = useCallback(() => dispatch({ type: 'RESUME' }), []);
  const stop = useCallback(() => dispatch({ type: 'STOP' }), []);
  const forcePhase = useCallback(
    (phase: 'jog' | 'run') => dispatch({ type: 'FORCE_PHASE', phase }),
    [],
  );

  return { state, start, pause, resume, stop, forcePhase };
}
