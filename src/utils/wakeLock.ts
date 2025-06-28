import { useEffect } from 'react';

const useWakeLock = () => {
  useEffect(() => {
    let sentinel: WakeLockSentinel | null = null;

    const requestWakeLock = async () => {
      try {
        // navigator.wakeLock is not supported on all browsers
        sentinel = await (navigator as any).wakeLock?.request('screen');
      } catch {
        // ignore wake lock errors
      }
    };

    if ('wakeLock' in navigator) {
      requestWakeLock();
    }

    return () => {
      if (sentinel) {
        sentinel.release().catch(() => {
          /* ignore release errors */
        });
      }
    };
  }, []);
};

export default useWakeLock;
