import React from 'react';
import { Sparkles, RotateCcw, CheckCircle2 } from 'lucide-react';
import './victory.css';

interface VictoryOverlayProps {
  isOpen: boolean;
  onRestart: () => void;
}

export const VictoryOverlay: React.FC<VictoryOverlayProps> = ({
  isOpen,
  onRestart,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="victory-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="victory-title"
    >
      <div className="victory-frame">
        <div className="victory-halo" aria-hidden="true" />

        <div className="victory-badge">
          <CheckCircle2 size={16} />
          <span>ESCAPE PROTOCOL VERIFIED</span>
        </div>

        <h2 id="victory-title" className="victory-title">
          CHAMBER 101 <span className="title-accent">CLEARED</span>
        </h2>

        <p className="victory-tagline">
          The room claimed only copper could turn the lock. You rewrote the law, disengaged the hydraulic clamps, and shattered the deception.
        </p>

        <div className="victory-stats-grid">
          <div className="stat-card">
            <span className="stat-label">WORLD RULES REWRITTEN</span>
            <span className="stat-value">1</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">DECEPTION STATUS</span>
            <span className="stat-value stat-value-highlight">COLLAPSED</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">CORRIDOR ACCESS</span>
            <span className="stat-value">UNBOUND</span>
          </div>
        </div>

        <div className="victory-actions">
          <button
            type="button"
            className="btn-restart"
            onClick={onRestart}
            aria-label="Restart Chamber 101"
          >
            <RotateCcw size={18} />
            <span>RESTART CHAMBER</span>
          </button>
        </div>

        <div className="victory-footer-note">
          <Sparkles size={14} />
          <span>Milestone 1 Complete. Ready for Milestone 2: Natural Language Rewrites.</span>
        </div>
      </div>
    </div>
  );
};
