import React, { useState, useEffect, useRef } from 'react';

const INACTIVITY_TIMEOUT = 30000; // 30 seconds

const BackgroundVideo: React.FC = () => {
  const [isFront, setIsFront] = useState(true);
  const timerRef = useRef<number>();

  useEffect(() => {
    const handleActivity = () => {
      setIsFront(false);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = window.setTimeout(() => setIsFront(true), INACTIVITY_TIMEOUT);
    };

    const events = ['keydown', 'mousedown', 'touchstart', 'mousemove'];
    events.forEach(evt => window.addEventListener(evt, handleActivity));

    return () => {
      events.forEach(evt => window.removeEventListener(evt, handleActivity));
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return (
    <video
      src="/src/assets/videos/bg.mp4"
      autoPlay
      loop
      muted
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        pointerEvents: 'none',
        zIndex: isFront ? 50 : 0,
      }}
    />
  );
};

export default BackgroundVideo;
