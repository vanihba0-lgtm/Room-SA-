import React from 'react';
import { InteractionTargetInfo } from './PlayerController';
import './styles/crosshair.css';

interface CrosshairHUDProps {
  target: InteractionTargetInfo | null;
  isLocked: boolean;
}

export const CrosshairHUD: React.FC<CrosshairHUDProps> = ({ target, isLocked }) => {
  return (
    <div className="crosshair-hud-container" aria-hidden="true">
      {/* Central Reticle */}
      <div className={`crosshair-reticle ${target ? 'reticle-active' : ''}`}>
        <div className="reticle-dot" />
        <div className="reticle-ring" />
      </div>

      {/* Target Interaction Prompt Card */}
      {target && (
        <div className="interaction-prompt-card">
          <div className="prompt-header">
            <span className="prompt-object-name">{target.name}</span>
            <span className="prompt-distance">{target.distance.toFixed(1)}m</span>
          </div>

          <div className="prompt-actions">
            <div className="action-pill primary-action">
              <span className="action-key">E</span>
              <span className="action-label">{target.actionText}</span>
            </div>

            <div className="action-pill inspect-action">
              <span className="action-key">R</span>
              <span className="action-label">Inspect</span>
            </div>
          </div>
        </div>
      )}

      {/* Quick Nav Bar Hint when in-game */}
      {isLocked && !target && (
        <div className="controls-nav-hint">
          <span className="hint-item"><span className="key-badge">WASD</span> Move</span>
          <span className="hint-item"><span className="key-badge">SHIFT</span> Sprint</span>
          <span className="hint-item"><span className="key-badge">SPACE</span> Jump</span>
          <span className="hint-item"><span className="key-badge">ESC</span> Pause / Release Mouse</span>
        </div>
      )}
    </div>
  );
};
