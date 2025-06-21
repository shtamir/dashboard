import React, { useEffect, useRef, useState } from 'react';
import bgVideo from '../assets/videos/bg.mp4';

const INACTIVITY_TIMEOUT = 30000; // ms of inactivity before showing video
const FRONT_DURATION = 10000; // how long to keep video in front

const BackgroundVideo: React.FC = () => {
  const [isFront, setIsFront] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const inactivityTimer = useRef<number>();
  const hideTimer = useRef<number>();

  const showTemporarily = () => {
    setIsFront(true);
    videoRef.current?.play().catch(() => {
      /* ignore autoplay errors */
    });
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
    }
    hideTimer.current = window.setTimeout(() => setIsFront(false), FRONT_DURATION);
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
      resetInactivityTimer();
      videoRef.current?.play().catch(() => {
        /* ignore autoplay errors */
      });
    };
    const events = ['keydown', 'mousedown', 'touchstart', 'mousemove'];
    events.forEach(evt => window.addEventListener(evt, handleActivity));

    return () => {
      events.forEach(evt => window.removeEventListener(evt, handleActivity));
      if (inactivityTimer.current) {
        clearTimeout(inactivityTimer.current);
      }
      if (hideTimer.current) {
        clearTimeout(hideTimer.current);
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
