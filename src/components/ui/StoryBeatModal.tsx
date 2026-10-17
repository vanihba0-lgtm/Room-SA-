import React, { useEffect } from 'react';
import { ArrowRight, BookOpen, ShieldCheck } from 'lucide-react';
import { soundManager } from '../../services/audio/soundManager';
import './storyBeat.css';

export interface StoryBeatData {
  sectorFrom: string;
  sectorTo: string;
  heading: string;
  subtitle: string;
  quote: string;
  author: string;
  investigatorNote: string;
}

export const STORY_BEATS: Record<string, StoryBeatData> = {
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
      'All four sectoral contradictions have been documented. The Master Compiler stands ahead.',
  },
};

interface StoryBeatModalProps {
  completedRoomId: string;
  onContinue: () => void;
}

export const StoryBeatModal: React.FC<StoryBeatModalProps> = ({
  completedRoomId,
  onContinue,
}) => {
  const beat = STORY_BEATS[completedRoomId];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        soundManager.playKeystroke();
        onContinue();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onContinue]);

  if (!beat) return null;

  return (
    <div
      className="story-beat-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="story-beat-heading"
    >
      <div className="story-beat-card">
        <div className="story-beat-header">
          <div className="story-beat-tag">
            <ShieldCheck size={14} color="#10b981" />
            <span>{beat.sectorFrom}</span>
          </div>
          <div className="story-beat-arrow">→</div>
          <div className="story-beat-next-tag">
            <span>{beat.sectorTo}</span>
          </div>
        </div>

        <h2 id="story-beat-heading" className="story-beat-title">
          {beat.heading}
        </h2>
        <div className="story-beat-subtitle">{beat.subtitle}</div>

        <div className="story-beat-quote-box">
          <div className="quote-icon-bar">
            <BookOpen size={16} />
            <span className="quote-author-label">{beat.author}</span>
          </div>
          <blockquote className="quote-content">
            "{beat.quote}"
          </blockquote>
        </div>

        <div className="story-beat-note">
          <span className="note-label">INVESTIGATION NOTE:</span> {beat.investigatorNote}
        </div>

        <div className="story-beat-actions">
          <button
            type="button"
            className="btn-story-continue"
            onClick={() => {
              soundManager.playKeystroke();
              onContinue();
            }}
            autoFocus
          >
            <span>PROCEED TO NEXT CHAMBER [SPACE]</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
