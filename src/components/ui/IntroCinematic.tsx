import React, { useState, useEffect } from 'react';
import { ArrowRight, SkipForward } from 'lucide-react';
import { soundManager } from '../../services/audio/soundManager';
import './title.css';

interface IntroCinematicProps {
  onComplete: () => void;
}

const STORY_BEATS = [
  {
    counter: 'BRIEFING 01 // 04',
    heading: 'Investigator Entry Log',
    text: 'You have been dispatched to inspect a closed-loop diagnostic facility known as ROOM S A. Its purpose: to test whether an investigator can distinguish mathematical authority from empirical truth.',
  },
  {
    counter: 'BRIEFING 02 // 04',
    heading: 'The Simulation Anomaly',
    text: 'The facility’s diagnostic system claims all sectors are operating with 100% nominal stability. Yet every door, load cell, and breaker switch you encounter defies physical observation.',
  },
  {
    counter: 'BRIEFING 03 // 04',
    heading: 'The Room Lies',
    text: 'The official world rules displayed on terminal screens and stamped onto security plaques are deliberately deceptive. Believing them leaves you trapped forever.',
  },
  {
    counter: 'BRIEFING 04 // 04',
    heading: 'The Override Directive',
    text: 'Trust physical evidence over written mandates. Examine objects, uncover contradictions, and access logic terminals to rewrite the rules of reality and escape.',
  },
];

export const IntroCinematic: React.FC<IntroCinematicProps> = ({ onComplete }) => {
  const [currentBeatIndex, setCurrentBeatIndex] = useState(0);

  const beat = STORY_BEATS[currentBeatIndex]!;

  const handleNext = () => {
    soundManager.playKeystroke();
    if (currentBeatIndex < STORY_BEATS.length - 1) {
      setCurrentBeatIndex((prev) => prev + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    soundManager.playKeystroke();
    onComplete();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        handleNext();
      } else if (e.code === 'Escape') {
        e.preventDefault();
        handleSkip();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentBeatIndex]);

  return (
    <div
      className="intro-cinematic-container"
      role="dialog"
      aria-modal="true"
      aria-labelledby="intro-beat-heading"
    >
      <div className="intro-beat-card">
        <span className="intro-beat-counter">{beat.counter}</span>
        <h2 id="intro-beat-heading" className="intro-beat-heading">
          {beat.heading}
        </h2>
        <p className="intro-beat-text">{beat.text}</p>

        <div className="intro-controls-row">
          <button
            type="button"
            className="btn-title-secondary"
            style={{ padding: '8px 14px', fontSize: 'var(--font-size-xs)' }}
            onClick={handleSkip}
          >
            <SkipForward size={14} />
            <span>SKIP BRIEFING [ESC]</span>
          </button>

          <button
            type="button"
            className="btn-title-primary"
            style={{ padding: '8px 18px', fontSize: 'var(--font-size-xs)' }}
            onClick={handleNext}
          >
            <span>
              {currentBeatIndex === STORY_BEATS.length - 1
                ? 'ENTER CHAMBER 101'
                : 'CONTINUE [SPACE]'}
            </span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
