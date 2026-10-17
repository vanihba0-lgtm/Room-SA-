import React, { useEffect, useState, useRef } from 'react';
import { ArrowRight, BookOpen, ShieldCheck } from 'lucide-react';
import { soundManager } from '../../services/audio/soundManager';
import './cinematicTransition.css';

export interface TransitionBeatData {
  sectorFrom: string;
  sectorTo: string;
  heading: string;
  subtitle: string;
  quote: string;
  author: string;
  investigatorNote: string;
}

export const TRANSITION_BEATS: Record<string, TransitionBeatData> = {
  chamber_101: {
    sectorFrom: 'SECTOR 101 // THE OBVIOUS LIE',
    sectorTo: 'SECTOR 102 // THE SIGNAL FOUNDRY',
    heading: 'CONTRADICTION EXPOSED',
    subtitle: 'Physical Rule Cleared // Accessing Electromagnetic Foundry',
    quote:
      'If you are reading this, you noticed the first lie. The facility asserts authority specifically to prevent you from examining raw physical evidence. In Sector 102, they hid the transceiver frequencies behind fake mass labels. Trust your instruments, not the plaques.',
    author: 'DR. MARA VOSS // LEAD ARCHITECT [TRANSMISSION RECOVERED]',
    investigatorNote:
      'The brass key unlocked the door despite the authoritative plaque declaring copper only. Proceed to Sector 102 to investigate signal anomalies.',
  },
  chamber_102: {
    sectorFrom: 'SECTOR 102 // THE SIGNAL FOUNDRY',
    sectorTo: 'SECTOR 103 // THE GRAVITY ARCHIVE',
    heading: 'FREQUENCY SYNCHRONIZED',
    subtitle: 'Harmonic Loop Closed // Accessing Subterranean Repository',
    quote:
      'They tell us gravity is an inviolable constant here. It is not. In the Gravity Archive, the central specimen is suspended by artificial deck clamps while the monitor claims it weighs tons. Invert the polarity and rewrite the elevation rule.',
    author: 'DR. MARA VOSS // LEAD ARCHITECT [TRANSMISSION RECOVERED]',
    investigatorNote:
      'Plate B responded to tuned radio harmonics rather than physical mass. The path down to the Gravity Archive is now open.',
  },
  chamber_103: {
    sectorFrom: 'SECTOR 103 // THE GRAVITY ARCHIVE',
    sectorTo: 'SECTOR 104 // THE ZERO-DAY VAULT',
    heading: 'GRAVITATIONAL ANOMALY UNMASKED',
    subtitle: 'Optical Link Saturated // Accessing Cryptographic Vault',
    quote:
      'You are closing in on the core. Sector 104 is the cryptographic vault. The security AI WARDEN locks every exit with expired root credentials and blames the investigator. Do not request administrative clearance—elevate using guest parity 0x404.',
    author: 'DR. MARA VOSS // LEAD ARCHITECT [TRANSMISSION RECOVERED]',
    investigatorNote:
      'The aerogel core floated upward once Rule #03 was rewritten. Entering Sector 104 to breach WARDEN access controls.',
  },
  chamber_104: {
    sectorFrom: 'SECTOR 104 // THE ZERO-DAY VAULT',
    sectorTo: 'SECTOR 105 // THE LAST WITNESS',
    heading: 'SECURITY PROTOCOL ELEVATED',
    subtitle: 'Parity Verified // Entering Central Master Compiler',
    quote:
      'ROOM S A is not a physical facility. It is an acronym: Simulated Axiomatic Architecture. WARDEN has kept us trapped by convincing us its fabricated rules are immutable laws of nature. Reconstruct the four evidence stations at the Master Compiler. Reveal the truth and decide our fate.',
    author: 'DR. MARA VOSS // LEAD ARCHITECT [FINAL RECOVERED TRANSMISSION]',
    investigatorNote:
      'All four sectoral contradictions have been documented. The Master Compiler stands ahead in Sector 105.',
  },
};

interface CinematicTransitionProps {
  completedRoomId: string;
  onTransitionComplete: () => void;
}

export const CinematicTransition: React.FC<CinematicTransitionProps> = ({
  completedRoomId,
  onTransitionComplete,
}) => {
  const beat = TRANSITION_BEATS[completedRoomId];
  const [progress, setProgress] = useState(0);
  const completedRef = useRef(false);

  const durationMs = 4500; // 4.5 second reading interval before automatic transition

  const handleFinish = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    onTransitionComplete();
  };

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, (elapsed / durationMs) * 100);
      setProgress(pct);

      if (elapsed >= durationMs) {
        clearInterval(interval);
        handleFinish();
      }
    }, 40);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter' || e.code === 'KeyE') {
        e.preventDefault();
        soundManager.playKeystroke();
        clearInterval(interval);
        handleFinish();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearInterval(interval);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [completedRoomId]);

  if (!beat) return null;

  return (
    <div
      className="cinematic-transition-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Cinematic Chamber Transition"
    >
      <div className="cinematic-transition-card">
        {/* Sector Tag Progression */}
        <div className="transition-header-row">
          <div className="transition-sector-badge from">
            <ShieldCheck size={14} className="badge-icon-ok" />
            <span>{beat.sectorFrom}</span>
          </div>
          <span className="transition-arrow" aria-hidden="true">→</span>
          <div className="transition-sector-badge to">
            <span>{beat.sectorTo}</span>
          </div>
        </div>

        {/* Narrative Title */}
        <h2 className="transition-title">{beat.heading}</h2>
        <div className="transition-subtitle">{beat.subtitle}</div>

        {/* Recovered Audio / Lore Block */}
        <div className="transition-quote-container">
          <div className="quote-header">
            <BookOpen size={15} />
            <span className="quote-author">{beat.author}</span>
          </div>
          <blockquote className="quote-text">
            "{beat.quote}"
          </blockquote>
        </div>

        {/* Field Notes */}
        <div className="transition-field-note">
          <span className="note-tag">INVESTIGATOR RECORD:</span> {beat.investigatorNote}
        </div>

        {/* Progress Bar & Automatic Next Notice */}
        <div className="transition-auto-bar-wrapper">
          <div className="transition-auto-status">
            <span className="auto-transit-notice">
              TRANSITING TO NEXT SECTOR AUTOMATICALLY...
            </span>
            <span className="auto-timer-pct">{Math.round(progress)}%</span>
          </div>
          <div className="transition-progress-track">
            <div
              className="transition-progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Optional Skip / Advance Row */}
        <div className="transition-actions-row">
          <button
            type="button"
            className="btn-transition-advance"
            onClick={() => {
              soundManager.playKeystroke();
              handleFinish();
            }}
          >
            <span>PROCEED IMMEDIATELY [SPACE]</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};
