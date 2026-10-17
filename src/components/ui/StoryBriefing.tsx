import React, { useState, useEffect } from 'react';
import { ArrowRight, SkipForward } from 'lucide-react';
import { soundManager } from '../../services/audio/soundManager';
import './storyBriefing.css';

interface StoryBriefingProps {
  onComplete: () => void;
}

const BRIEFING_BEATS = [
  {
    counter: 'BRIEFING 01 // 04',
    speaker: 'FACILITY AI // WARDEN',
    heading: 'Investigator Entry Log',
    text: 'You have been dispatched to inspect a closed-loop diagnostic facility known as ROOM S A. Its purpose: to test whether an investigator can distinguish mathematical authority from empirical truth.',
  },
  {
    counter: 'BRIEFING 02 // 04',
    speaker: 'FIELD TELEMETRY // ANOMALY DETECTED',
    heading: 'The Simulation Anomaly',
    text: 'The facility’s diagnostic system claims all sectors are operating with 100% nominal stability. Yet every door, load cell, and breaker switch you encounter defies physical observation.',
  },
  {
    counter: 'BRIEFING 03 // 04',
    speaker: 'DR. MARA VOSS // RECOVERED RECORD',
    heading: 'The Room Lies',
    text: 'The official world rules displayed on terminal screens and stamped onto security plaques are deliberately deceptive. Believing them leaves you trapped forever.',
  },
  {
    counter: 'BRIEFING 04 // 04',
    speaker: 'MISSION DIRECTIVE',
    heading: 'The Override Directive',
    text: 'Trust physical evidence over written mandates. Examine objects, uncover contradictions, and access logic terminals to rewrite the rules of reality and escape.',
  },
];

export const StoryBriefing: React.FC<StoryBriefingProps> = ({ onComplete }) => {
  const [currentBeat, setCurrentBeat] = useState(0);

  const beat = BRIEFING_BEATS[currentBeat]!;

  const handleNext = () => {
    soundManager.playKeystroke();
    if (currentBeat < BRIEFING_BEATS.length - 1) {
      setCurrentBeat((prev) => prev + 1);
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
  }, [currentBeat]);

  return (
    <div
      className="story-briefing-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Investigator Entry Log"
    >
      <div className="story-briefing-card">
        <div className="story-briefing-top-meta">
          <span className="story-briefing-counter">{beat.counter}</span>
          <span className="story-briefing-speaker">{beat.speaker}</span>
        </div>

        <h2 className="story-briefing-heading">
          {beat.heading}
        </h2>

        <p className="story-briefing-text">{beat.text}</p>

        <div className="story-briefing-controls">
          <button
            type="button"
            className="btn-briefing-skip"
            onClick={handleSkip}
            title="Skip briefing and enter Chamber 101"
            aria-label="SKIP BRIEFING"
          >
            <SkipForward size={14} />
            <span>SKIP BRIEFING [ESC]</span>
          </button>

          <button
            type="button"
            className="btn-briefing-next"
            onClick={handleNext}
            autoFocus
          >
            <span>
              {currentBeat === BRIEFING_BEATS.length - 1
                ? 'ENTER CHAMBER 101'
                : 'CONTINUE'}
            </span>
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};
