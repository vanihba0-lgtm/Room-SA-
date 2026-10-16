import React, { useState } from 'react';
import { HelpCircle, X, ChevronRight, Lock } from 'lucide-react';
import { ChamberObjective } from '../../game/progression/types';
import { soundManager } from '../../services/audio/soundManager';
import './hints.css';

interface HintModalProps {
  isOpen: boolean;
  objective: ChamberObjective | null;
  onClose: () => void;
}

export const HintModal: React.FC<HintModalProps> = ({
  isOpen,
  objective,
  onClose,
}) => {
  const [revealedTier, setRevealedTier] = useState(1); // 1 = Nudge visible by default

  if (!isOpen || !objective) return null;

  const tierNames = ['STAGE 1: NUDGE', 'STAGE 2: CLUE CORRELATION', 'STAGE 3: DIRECT SOLUTION'];

  const handleRevealNext = () => {
    soundManager.playKeystroke();
    setRevealedTier((prev) => Math.min(prev + 1, 3));
  };

  return (
    <div
      className="modal-backdrop-generic"
      role="dialog"
      aria-modal="true"
      aria-labelledby="hint-modal-title"
    >
      <div className="modal-card-medium">
        <div className="modal-header-row">
          <div className="modal-title-group">
            <HelpCircle size={20} color="var(--color-cyan-primary)" />
            <h2 id="hint-modal-title" className="modal-title-text">
              Contextual Guidance
            </h2>
          </div>
          <button
            type="button"
            className="btn-close-icon"
            onClick={() => {
              soundManager.playKeystroke();
              onClose();
            }}
            aria-label="Close hints"
          >
            <X size={18} />
          </button>
        </div>

        <div>
          <span style={{ fontSize: 'var(--font-size-2xs)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Current Task
          </span>
          <h4 style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-primary)', marginTop: '2px' }}>
            {objective.title}
          </h4>
        </div>

        <div className="hint-tier-list">
          {objective.hints.map((hintText, idx) => {
            const isUnlocked = idx + 1 <= revealedTier;
            return (
              <div
                key={idx}
                className={`hint-tier-card ${isUnlocked ? 'unlocked' : 'locked'}`}
              >
                <div className="hint-tier-header">
                  <span className="hint-tier-badge">{tierNames[idx]}</span>
                  {!isUnlocked && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: 'var(--font-size-2xs)', color: 'var(--color-text-muted)' }}>
                      <Lock size={11} /> Locked
                    </span>
                  )}
                </div>
                {isUnlocked ? (
                  <p className="hint-tier-text">{hintText}</p>
                ) : (
                  <p className="hint-tier-text" style={{ fontStyle: 'italic', color: 'var(--color-text-muted)' }}>
                    [ Sealed to prevent spoilers. Click reveal below if you need deeper guidance. ]
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {revealedTier < 3 && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '4px' }}>
            <button
              type="button"
              className="btn-reveal-hint"
              onClick={handleRevealNext}
            >
              <span>Reveal Next Clue Level</span>
              <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
