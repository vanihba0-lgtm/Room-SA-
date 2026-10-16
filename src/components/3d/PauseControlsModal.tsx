import React from 'react';
import {
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
  Compass,
  Eye,
  Hand,
  Target,
  HelpCircle,
  BookOpen,
  Settings,
  Layers,
  Home,
} from 'lucide-react';
import { ChamberObjective } from '../../game/progression/types';
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
  activeObjective?: ChamberObjective | null;
  onOpenHints?: () => void;
  onOpenLogbook?: () => void;
  onOpenSettings?: () => void;
  onOpenChamberSelect?: () => void;
  onReturnToMenu?: () => void;
}

const getChamberLabel = (roomId?: string): string => {
  switch (roomId) {
    case 'chamber_101': return 'CHAMBER 101 // THE OBVIOUS LIE';
    case 'chamber_102': return 'CHAMBER 102 // THE SIGNAL FOUNDRY';
    case 'chamber_103': return 'CHAMBER 103 // THE GRAVITY ARCHIVE';
    case 'chamber_104': return 'CHAMBER 104 // THE ZERO-DAY VAULT';
    case 'chamber_105': return 'CHAMBER 105 // THE LAST WITNESS (FINALE)';
    case 'chamber_106': return 'CHAMBER 106 // THE RULE ENGINE';
    default: return 'SIMULATION PAUSED';
  }
};

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
  activeObjective,
  onOpenHints,
  onOpenLogbook,
  onOpenSettings,
  onOpenChamberSelect,
  onReturnToMenu,
}) => {
  if (!isOpen) return null;

  return (
    <div className="pause-overlay-backdrop">
      <div className="pause-modal-card">
        {/* Header */}
        <div className="pause-card-header">
          <div className="pause-badge">
            {getChamberLabel(currentRoomId)}
          </div>
          <h2 className="pause-title">
            ROOM <span className="title-accent">S A</span>
          </h2>
          <p className="pause-subtitle">THE ROOM LIES. EXPERIMENT TO ESCAPE.</p>
        </div>

        {/* Current Objective Card */}
        {activeObjective && (
          <div className="pause-objective-card">
            <div className="objective-card-header">
              <Target size={14} className="objective-icon" />
              <span className="objective-label">CURRENT OBJECTIVE</span>
            </div>
            <h3 className="objective-title">{activeObjective.title}</h3>
            {activeObjective.what && (
              <div className="objective-detail">
                <span className="detail-key">WHAT:</span>
                <span className="detail-value">{activeObjective.what}</span>
              </div>
            )}
            {activeObjective.where && (
              <div className="objective-detail">
                <span className="detail-key">WHERE:</span>
                <span className="detail-value">{activeObjective.where}</span>
              </div>
            )}
            {activeObjective.how && (
              <div className="objective-detail">
                <span className="detail-key">HOW:</span>
                <span className="detail-value">{activeObjective.how}</span>
              </div>
            )}
          </div>
        )}

        {/* Status Banner */}
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
          {(!currentRoomId || currentRoomId === 'chamber_101') && (
            <div className="status-item">
              <span className="status-label">KEY STATUS:</span>
              <span className="status-value">
                {hasKey ? 'Machined Brass Key #101 Acquired' : 'Resting on Specimen Pedestal'}
              </span>
            </div>
          )}
          {currentRoomId === 'chamber_102' && (
            <div className="status-item">
              <span className="status-label">FOUNDRY SYSTEM:</span>
              <span className="status-value">Substrate Circuit & Resonance Plates</span>
            </div>
          )}
          {currentRoomId === 'chamber_103' && (
            <div className="status-item">
              <span className="status-label">GRAVITY ANCHOR:</span>
              <span className="status-value">Magnetic Aerogel Ballast Mechanism</span>
            </div>
          )}
          {currentRoomId === 'chamber_104' && (
            <div className="status-item">
              <span className="status-label">SECURITY PROTOCOL:</span>
              <span className="status-value">Root-4 Parity Interlocks & Token Vault</span>
            </div>
          )}
          {currentRoomId === 'chamber_105' && (
            <div className="status-item">
              <span className="status-label">MASTER COMPILER:</span>
              <span className="status-value">4-Axiom Evidence Synthesis & ROOM S A Disclosure</span>
            </div>
          )}
          {currentRoomId === 'chamber_106' && (
            <div className="status-item">
              <span className="status-label">ENGINE ARCHITECTURE:</span>
              <span className="status-value">Rule Compiler & Ontological Core</span>
            </div>
          )}
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

        {/* Quick Actions Grid */}
        <div className="pause-actions-grid">
          {onOpenHints && (
            <button type="button" className="btn-pause-action" onClick={() => { onResume(); setTimeout(() => onOpenHints(), 50); }}>
              <HelpCircle size={16} />
              <span>Hints</span>
            </button>
          )}
          {onOpenLogbook && (
            <button type="button" className="btn-pause-action" onClick={() => { onResume(); setTimeout(() => onOpenLogbook(), 50); }}>
              <BookOpen size={16} />
              <span>Logbook</span>
            </button>
          )}
          {onOpenSettings && (
            <button type="button" className="btn-pause-action" onClick={() => { onResume(); setTimeout(() => onOpenSettings(), 50); }}>
              <Settings size={16} />
              <span>Settings</span>
            </button>
          )}
          {onOpenChamberSelect && (
            <button type="button" className="btn-pause-action" onClick={() => { onResume(); setTimeout(() => onOpenChamberSelect(), 50); }}>
              <Layers size={16} />
              <span>Chambers</span>
            </button>
          )}
        </div>

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

          <div className="pause-footer-right">
            <button
              type="button"
              className="btn-pause-secondary btn-restart"
              onClick={onRestart}
            >
              <RotateCcw size={16} />
              <span>RESTART</span>
            </button>

            {onReturnToMenu && (
              <button
                type="button"
                className="btn-pause-secondary btn-menu"
                onClick={onReturnToMenu}
              >
                <Home size={16} />
                <span>MENU</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
