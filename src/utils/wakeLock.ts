import { useEffect } from 'react';

const useWakeLock = () => {
  useEffect(() => {
    let sentinel: WakeLockSentinel | null = null;

    const requestWakeLock = async () => {
      try {
        // navigator.wakeLock is not supported on all browsers
        sentinel = await (navigator as any).wakeLock?.request('screen');
        sentinel?.addEventListener('release', requestWakeLock);
      } catch {
        // ignore wake lock errors
      }
    };

    const handleVisibility = () => {
      if (!document.hidden) {
        requestWakeLock();
      }
    };

    if ('wakeLock' in navigator) {
      requestWakeLock();
      document.addEventListener('visibilitychange', handleVisibility);
    }

    return () => {
      if (sentinel) {
        sentinel.removeEventListener('release', requestWakeLock);
        sentinel.release().catch(() => {
          /* ignore release errors */
        });
      }
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);
};

export default useWakeLock;
