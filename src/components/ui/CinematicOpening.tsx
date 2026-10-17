import React, { useEffect, useState } from 'react';
import './cinematicOpening.css';

interface CinematicOpeningProps {
  onComplete: () => void;
}

export const CinematicOpening: React.FC<CinematicOpeningProps> = ({ onComplete }) => {
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    // Intentional cinematic duration: reveals, holds, then smoothly transitions to main menu
    const holdTimer = setTimeout(() => {
      setFadingOut(true);
    }, 2800);

    const completeTimer = setTimeout(() => {
      onComplete();
    }, 3400);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter' || e.code === 'Escape') {
        e.preventDefault();
        onComplete();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(holdTimer);
      clearTimeout(completeTimer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onComplete]);

  return (
    <div
      className={`cinematic-opening-container ${fadingOut ? 'fade-out' : ''}`}
      onClick={onComplete}
      role="banner"
      aria-label="ROOM S A Cinematic Opening"
    >
      <div className="cinematic-backdrop-grid" aria-hidden="true" />
      <div className="cinematic-radial-atmosphere" aria-hidden="true" />

      <div className="cinematic-title-box">
        <h1 className="cinematic-main-wordmark">
          ROOM <span className="cinematic-wordmark-accent">S A</span>
        </h1>
        <div className="cinematic-divider-line" aria-hidden="true" />
        <p className="cinematic-tagline">THE ROOM THAT LIES</p>
      </div>

      <div className="cinematic-skip-hint" aria-hidden="true">
        <span>PRESS SPACE OR CLICK TO ADVANCE</span>
      </div>
    </div>
  );
};
