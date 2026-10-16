import React from 'react';
import { Sparkles, RotateCcw, CheckCircle2 } from 'lucide-react';
import './victory.css';

interface VictoryOverlayProps {
  isOpen: boolean;
  onRestart: () => void;
  isCampaignComplete?: boolean;
}

export const VictoryOverlay: React.FC<VictoryOverlayProps> = ({
  isOpen,
  onRestart,
  isCampaignComplete = true,
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
          <span>
            {isCampaignComplete
              ? 'FACILITY ESCAPE PROTOCOL VERIFIED'
              : 'CHAMBER PROTOCOL VERIFIED'}
          </span>
        </div>

        <h2 id="victory-title" className="victory-title">
          FACILITY QUARANTINE <span className="title-accent">BREACHED</span>
        </h2>

        <p className="victory-tagline">
          The room claimed only copper could turn the lock, and that load cells obeyed only mass.
          You rewrote reality, tuned harmonic resonance in the Signal Foundry, and shattered every deception.
        </p>

        <div className="victory-stats-grid">
          <div className="stat-card">
            <span className="stat-label">CHAMBERS CLEARED</span>
            <span className="stat-value">2 / 2</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">DECEPTION STATUS</span>
            <span className="stat-value stat-value-highlight">NEUTRALIZED</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">CONTAINMENT MATRIX</span>
            <span className="stat-value">SHATTERED</span>
          </div>
        </div>

        <div className="victory-actions">
          <button
            type="button"
            className="btn-restart"
            onClick={onRestart}
            aria-label="Restart Simulation"
          >
            <RotateCcw size={18} />
            <span>RESTART EXPERIMENT</span>
          </button>
        </div>

        <div className="victory-footer-note">
          <Sparkles size={14} />
          <span>ROOM S A // THE ROOM LIES — Real 3D Puzzle Adventure Accomplished</span>
        </div>
      </div>
    </div>
  );
};
