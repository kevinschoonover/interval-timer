import { useState, useEffect, useRef } from 'react';
import * as Location from 'expo-location';

export function useGPSSpeed(active: boolean) {
  const [speed, setSpeed] = useState(0);
  const subscriptionRef = useRef<Location.LocationSubscription | null>(null);

  useEffect(() => {
    if (!active) {
      if (subscriptionRef.current) {
        subscriptionRef.current.remove();
        subscriptionRef.current = null;
      }
      setSpeed(0);
      return;
    }

    let cancelled = false;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted' || cancelled) return;

      const sub = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 1000,
          distanceInterval: 0,
        },
        (location) => {
          // speed is in m/s, can be -1 if unavailable
          const s = location.coords.speed;
          if (s != null && s >= 0) {
            setSpeed(s);
          }
        },
      );
      if (cancelled) {
        sub.remove();
      } else {
        subscriptionRef.current = sub;
      }
    })();

    return () => {
      cancelled = true;
      if (subscriptionRef.current) {
        subscriptionRef.current.remove();
        subscriptionRef.current = null;
      }
    };
  }, [active]);

  return speed;
}
