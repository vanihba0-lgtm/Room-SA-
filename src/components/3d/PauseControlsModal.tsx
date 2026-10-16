import React from 'react';
import {
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
  Compass,
  Eye,
  Hand,
} from 'lucide-react';
import './styles/pause.css';

interface PauseControlsModalProps {
  isOpen: boolean;
  onResume: () => void;
  onRestart: () => void;
  muted: boolean;
  onToggleMute: () => void;
  ruleStatement: string;
  isRuleDeceptive: boolean;
  hasKey: boolean;
  currentRoomId?: string;
}

export const PauseControlsModal: React.FC<PauseControlsModalProps> = ({
  isOpen,
  onResume,
  onRestart,
  muted,
  onToggleMute,
  ruleStatement,
  isRuleDeceptive,
  hasKey,
  currentRoomId,
}) => {
  if (!isOpen) return null;

  return (
    <div className="pause-overlay-backdrop">
      <div className="pause-modal-card">
        {/* Header */}
        <div className="pause-card-header">
          <div className="pause-badge">
            {currentRoomId === 'chamber_102'
              ? 'CHAMBER 102 // SIMULATION PAUSED'
              : 'CHAMBER 101 // SIMULATION PAUSED'}
          </div>
          <h2 className="pause-title">
            ROOM <span className="title-accent">S A</span>
          </h2>
          <p className="pause-subtitle">THE ROOM LIES. EXPERIMENT TO ESCAPE.</p>
        </div>

        {/* Current Objective & Status */}
        <div className="pause-status-banner">
          <div className="status-item">
            <span className="status-label">GOVERNING LAW:</span>
            <span
              className={`status-value ${
                isRuleDeceptive ? 'value-deceptive' : 'value-stable'
              }`}
            >
              "{ruleStatement}"
            </span>
          </div>
          <div className="status-item">
            <span className="status-label">KEY STATUS:</span>
            <span className="status-value">
              {hasKey ? 'Machined Brass Key #101 Acquired' : 'Resting on Specimen Pedestal'}
            </span>
          </div>
        </div>

        {/* Primary Click to Play / Resume Button */}
        <button
          type="button"
          className="btn-resume-primary"
          onClick={onResume}
          autoFocus
        >
          <Play size={20} className="btn-icon" />
          <span>ENTER CHAMBER (CLICK TO LOCK MOUSE)</span>
        </button>

        {/* Complete Controls Guide */}
        <div className="controls-guide-grid">
          <div className="guide-card">
            <div className="guide-icon-header">
              <Compass size={16} />
              <span>MOVEMENT</span>
            </div>
            <div className="key-row">
              <span className="key-pill">W</span>
              <span className="key-pill">A</span>
              <span className="key-pill">S</span>
              <span className="key-pill">D</span>
              <span className="guide-desc">Walk around</span>
            </div>
            <div className="key-row">
              <span className="key-pill wide-pill">SHIFT</span>
              <span className="guide-desc">Sprint</span>
            </div>
            <div className="key-row">
              <span className="key-pill wide-pill">SPACE</span>
              <span className="guide-desc">Jump</span>
            </div>
          </div>

          <div className="guide-card">
            <div className="guide-icon-header">
              <Eye size={16} />
              <span>CAMERA & AIM</span>
            </div>
            <div className="key-row">
              <span className="key-pill wide-pill">MOUSE</span>
              <span className="guide-desc">Free 360° Look</span>
            </div>
            <div className="key-row">
              <span className="key-pill wide-pill">ESC</span>
              <span className="guide-desc">Release Mouse / Menu</span>
            </div>
          </div>

          <div className="guide-card">
            <div className="guide-icon-header">
              <Hand size={16} />
              <span>INTERACTION</span>
            </div>
            <div className="key-row">
              <span className="key-pill">E</span>
              <span className="guide-desc">Interact / Collect / Use</span>
            </div>
            <div className="key-row">
              <span className="key-pill">R</span>
              <span className="guide-desc">Inspect Object / Lore</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pause-card-footer">
          <button
            type="button"
            className="btn-pause-secondary"
            onClick={onToggleMute}
          >
            {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            <span>{muted ? 'SOUND: MUTED' : 'SOUND: ENABLED'}</span>
          </button>

          <button
            type="button"
            className="btn-pause-secondary btn-restart"
            onClick={onRestart}
          >
            <RotateCcw size={16} />
            <span>RESTART CHAMBER</span>
          </button>
        </div>
      </div>
    </div>
  );
};
