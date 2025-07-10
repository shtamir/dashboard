import { useEffect } from 'react';

const useWakeLock = () => {
  useEffect(() => {
    let sentinel: WakeLockSentinel | null = null;

    const requestWakeLock = async () => {
      try {
        if (!('wakeLock' in navigator)) return;
        if (!sentinel || sentinel.released) {
          sentinel = await (navigator as any).wakeLock.request('screen');
          sentinel.addEventListener('release', requestWakeLock);
        }
      } catch {
        // ignore wake lock errors
      }
    };

    const handleVisibility = () => {
      if (!document.hidden) requestWakeLock();
    };

    const handleInteraction = () => {
      requestWakeLock();
    };

    if ('wakeLock' in navigator) {
      requestWakeLock();
      document.addEventListener('visibilitychange', handleVisibility);
      const events = ['pointerdown', 'keydown', 'mousedown', 'touchstart'];
      events.forEach(evt => window.addEventListener(evt, handleInteraction, { passive: true }));
    }

    return () => {
      if (sentinel) {
        sentinel.removeEventListener('release', requestWakeLock);
        sentinel.release().catch(() => {
          /* ignore release errors */
        });
      }
      document.removeEventListener('visibilitychange', handleVisibility);
      const events = ['pointerdown', 'keydown', 'mousedown', 'touchstart'];
      events.forEach(evt => window.removeEventListener(evt, handleInteraction));
    };
  }, []);
};

export default useWakeLock;
