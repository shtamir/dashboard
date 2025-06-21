import React, { useState, useEffect, useRef } from 'react';
import bgVideo from '../assets/videos/bg.mp4';

const INACTIVITY_TIMEOUT = 30000; // 30 seconds
const KEEP_AWAKE_INTERVAL = 60000; // periodically bring video forward
const KEEP_AWAKE_DURATION = 3000; // how long to keep it in front

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

  // Periodically bring the video to the front to keep the screen awake
  useEffect(() => {
    let hideTimeout: number | undefined;
    const interval = window.setInterval(() => {
      setIsFront(true);
      hideTimeout = window.setTimeout(() => setIsFront(false), KEEP_AWAKE_DURATION);
    }, KEEP_AWAKE_INTERVAL);

    return () => {
      clearInterval(interval);
      if (hideTimeout) {
        clearTimeout(hideTimeout);
      }
    };
  }, []);

  return (
    <video
      src={bgVideo}
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
