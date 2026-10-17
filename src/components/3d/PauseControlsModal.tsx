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
    default: return 'INVESTIGATION PAUSED';
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
    <div className="pause-overlay-backdrop" role="dialog" aria-modal="true" aria-label="Pause Menu">
      <div className="pause-modal-card">
        {/* Header */}
        <div className="pause-card-header">
          <div className="pause-badge">
            {getChamberLabel(currentRoomId)}
          </div>
          <h2 className="pause-title">
            ROOM <span className="title-accent">S A</span>
          </h2>
          <p className="pause-subtitle">THE ROOM THAT LIES // INVESTIGATION PAUSED</p>
        </div>

        {/* Current Objective Card */}
        {activeObjective && (
          <div className="pause-objective-card">
            <div className="objective-card-header">
              <Target size={14} className="objective-icon" />
              <span className="objective-label">ACTIVE OBJECTIVE</span>
            </div>
            <h3 className="objective-title">{activeObjective.title}</h3>
            <p className="objective-desc">{activeObjective.description}</p>
            {activeObjective.whyItMatters && (
              <div className="objective-axiom-row">
                <span className="axiom-tag">AXIOM:</span>
                <span className="axiom-val">{activeObjective.whyItMatters}</span>
              </div>
            )}
          </div>
        )}

        {/* Status Banner */}
        <div className="pause-status-banner">
          <div className="status-item">
            <span className="status-label">GOVERNING RULE:</span>
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
        </div>

        {/* Primary Resume Button */}
        <button
          type="button"
          className="btn-resume-primary"
          onClick={onResume}
          autoFocus
        >
          <Play size={18} className="btn-icon" />
          <span>RESUME INVESTIGATION</span>
        </button>

        {/* Quick Tools Navigation */}
        <div className="pause-actions-grid">
          {onOpenHints && (
            <button type="button" className="btn-pause-action" onClick={() => { onResume(); setTimeout(() => onOpenHints(), 50); }}>
              <HelpCircle size={15} />
              <span>Hints</span>
            </button>
          )}
          {onOpenLogbook && (
            <button type="button" className="btn-pause-action" onClick={() => { onResume(); setTimeout(() => onOpenLogbook(), 50); }}>
              <BookOpen size={15} />
              <span>Case Dossier</span>
            </button>
          )}
          {onOpenSettings && (
            <button type="button" className="btn-pause-action" onClick={() => { onResume(); setTimeout(() => onOpenSettings(), 50); }}>
              <Settings size={15} />
              <span>Settings</span>
            </button>
          )}
          {onOpenChamberSelect && (
            <button type="button" className="btn-pause-action" onClick={() => { onResume(); setTimeout(() => onOpenChamberSelect(), 50); }}>
              <Layers size={15} />
              <span>Chambers</span>
            </button>
          )}
        </div>

        {/* Real Controls Reference */}
        <div className="controls-guide-grid">
          <div className="guide-card">
            <div className="guide-icon-header">
              <Compass size={14} />
              <span>LOCOMOTION</span>
            </div>
            <div className="key-row">
              <span className="key-pill">W</span>
              <span className="key-pill">A</span>
              <span className="key-pill">S</span>
              <span className="key-pill">D</span>
              <span className="guide-desc">Walk</span>
            </div>
            <div className="key-row">
              <span className="key-pill wide-pill">SHIFT</span>
              <span className="guide-desc">Sprint</span>
            </div>
          </div>

          <div className="guide-card">
            <div className="guide-icon-header">
              <Eye size={14} />
              <span>PERSPECTIVE</span>
            </div>
            <div className="key-row">
              <span className="key-pill wide-pill">MOUSE</span>
              <span className="guide-desc">Free Look</span>
            </div>
            <div className="key-row">
              <span className="key-pill wide-pill">ESC</span>
              <span className="guide-desc">Pause Menu</span>
            </div>
          </div>

          <div className="guide-card">
            <div className="guide-icon-header">
              <Hand size={14} />
              <span>INTERACTION</span>
            </div>
            <div className="key-row">
              <span className="key-pill">E</span>
              <span className="guide-desc">Interact / Collect</span>
            </div>
            <div className="key-row">
              <span className="key-pill">R</span>
              <span className="guide-desc">Inspect</span>
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
            {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
            <span>{muted ? 'SOUND: MUTED' : 'SOUND: ENABLED'}</span>
          </button>

          <div className="pause-footer-right">
            <button
              type="button"
              className="btn-pause-secondary btn-restart"
              onClick={onRestart}
            >
              <RotateCcw size={15} />
              <span>RESTART SECTOR</span>
            </button>

            {onReturnToMenu && (
              <button
                type="button"
                className="btn-pause-secondary btn-menu"
                onClick={onReturnToMenu}
              >
                <Home size={15} />
                <span>MAIN MENU</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
