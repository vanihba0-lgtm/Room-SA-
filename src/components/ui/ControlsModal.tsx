import React, { useEffect } from 'react';
import { X, Compass, Eye, Hand, ShieldAlert } from 'lucide-react';
import { soundManager } from '../../services/audio/soundManager';
import './controlsModal.css';

interface ControlsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ControlsModal: React.FC<ControlsModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        e.preventDefault();
        soundManager.playKeystroke();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="controls-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="controls-modal-title"
      onClick={onClose}
    >
      <div className="controls-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="controls-modal-header">
          <div className="controls-modal-heading-group">
            <span className="controls-modal-tag">INVESTIGATOR TELEMETRY</span>
            <h2 id="controls-modal-title" className="controls-modal-title">Control Reference</h2>
          </div>
          <button
            type="button"
            className="controls-close-btn"
            onClick={() => {
              soundManager.playKeystroke();
              onClose();
            }}
            aria-label="Close controls modal"
          >
            <X size={18} />
          </button>
        </div>

        <div className="controls-grid">
          {/* Movement */}
          <div className="controls-section">
            <div className="controls-section-header">
              <Compass size={16} className="section-icon" />
              <span>LOCOMOTION</span>
            </div>
            <div className="control-row">
              <div className="key-combo">
                <kbd className="ctrl-kbd">W</kbd>
                <kbd className="ctrl-kbd">A</kbd>
                <kbd className="ctrl-kbd">S</kbd>
                <kbd className="ctrl-kbd">D</kbd>
              </div>
              <span className="control-desc">Walk / Navigate chamber</span>
            </div>
            <div className="control-row">
              <div className="key-combo">
                <kbd className="ctrl-kbd wide">SHIFT</kbd>
              </div>
              <span className="control-desc">Sprint (5.8 m/s)</span>
            </div>
            <div className="control-row">
              <div className="key-combo">
                <kbd className="ctrl-kbd wide">SPACE</kbd>
              </div>
              <span className="control-desc">Vertical jump</span>
            </div>
          </div>

          {/* Camera & View */}
          <div className="controls-section">
            <div className="controls-section-header">
              <Eye size={16} className="section-icon" />
              <span>PERSPECTIVE & ORIENTATION</span>
            </div>
            <div className="control-row">
              <div className="key-combo">
                <kbd className="ctrl-kbd wide">MOUSE</kbd>
              </div>
              <span className="control-desc">360° First-person look</span>
            </div>
            <div className="control-row">
              <div className="key-combo">
                <kbd className="ctrl-kbd wide">CLICK</kbd>
              </div>
              <span className="control-desc">Engage pointer lock & interact</span>
            </div>
            <div className="control-row">
              <div className="key-combo">
                <kbd className="ctrl-kbd wide">ESC</kbd>
              </div>
              <span className="control-desc">Pause / Release cursor / Options</span>
            </div>
          </div>

          {/* Interactions */}
          <div className="controls-section">
            <div className="controls-section-header">
              <Hand size={16} className="section-icon" />
              <span>EMPIRICAL INTERACTION</span>
            </div>
            <div className="control-row">
              <div className="key-combo">
                <kbd className="ctrl-kbd">E</kbd>
              </div>
              <span className="control-desc">Interact / Pick up / Operate door</span>
            </div>
            <div className="control-row">
              <div className="key-combo">
                <kbd className="ctrl-kbd">R</kbd>
              </div>
              <span className="control-desc">Inspect object / Read archival slate</span>
            </div>
          </div>

          {/* Philosophy Note */}
          <div className="controls-section note-section">
            <div className="controls-section-header">
              <ShieldAlert size={16} className="section-icon note-icon" />
              <span>INVESTIGATION AXIOM</span>
            </div>
            <p className="controls-axiom-text">
              The facility claims nominal stability. Do not rely on written mandates or status plaques.
              Examine the physical evidence in each sector to expose the contradiction.
            </p>
          </div>
        </div>

        <div className="controls-modal-footer">
          <button
            type="button"
            className="btn-controls-dismiss"
            onClick={() => {
              soundManager.playKeystroke();
              onClose();
            }}
          >
            DISMISS [ESC]
          </button>
        </div>
      </div>
    </div>
  );
};
