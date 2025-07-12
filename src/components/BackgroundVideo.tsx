import React, { useEffect, useRef, useState } from 'react';
import bgVideo from '../assets/videos/bg.mp4';
import useWakeLock from '@utils/wakeLock';

const INACTIVITY_TIMEOUT = 30000; // ms of inactivity before showing video
const FRONT_DURATION = 10000; // how long to keep video in front

const BackgroundVideo: React.FC = () => {
  useWakeLock();
  const [isFront, setIsFront] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const inactivityTimer = useRef<number>();
  const checkInterval = useRef<number>();
  const frontStart = useRef<number>();

  const showTemporarily = () => {
    setIsFront(true);
    frontStart.current = Date.now();
    videoRef.current?.play().catch(() => {
      /* ignore autoplay errors */
    });
  };

  const resetInactivityTimer = () => {
    if (inactivityTimer.current) {
      clearTimeout(inactivityTimer.current);
    }
    inactivityTimer.current = window.setTimeout(showTemporarily, INACTIVITY_TIMEOUT);
  };

  useEffect(() => {
    resetInactivityTimer();
    videoRef.current?.play().catch(() => {
      /* ignore autoplay errors */
    });
    const handleActivity = () => {
      setIsFront(false);
      frontStart.current = undefined;
      resetInactivityTimer();
      videoRef.current?.play().catch(() => {
        /* ignore autoplay errors */
      });
    };
    const events = ['keydown', 'mousedown', 'touchstart', 'mousemove', 'pointerdown', 'pointermove'];
    events.forEach(evt => window.addEventListener(evt, handleActivity));

    checkInterval.current = window.setInterval(() => {
      if (frontStart.current && Date.now() - frontStart.current > FRONT_DURATION) {
        setIsFront(false);
        frontStart.current = undefined;
        resetInactivityTimer();
      }
    }, 1000);

    return () => {
      events.forEach(evt => window.removeEventListener(evt, handleActivity));
      if (inactivityTimer.current) {
        clearTimeout(inactivityTimer.current);
      }
      if (checkInterval.current) {
        clearInterval(checkInterval.current);
      }
    };
  }, []);

  return (
    <video
      ref={videoRef}
      src={bgVideo}
      autoPlay
      loop
      muted
      playsInline
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        pointerEvents: 'none',
        zIndex: isFront ? 0 : -1,
      }}
    />
  );
};

export default BackgroundVideo;
