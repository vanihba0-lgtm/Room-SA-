import React from 'react';
import { InteractionTargetInfo } from './PlayerController';
import './styles/crosshair.css';

interface CrosshairHUDProps {
  target: InteractionTargetInfo | null;
  isLocked: boolean;
}

export const CrosshairHUD: React.FC<CrosshairHUDProps> = ({ target }) => {
  return (
    <div className="crosshair-hud-container" aria-hidden="true">
      {/* Central Reticle */}
      <div className={`crosshair-reticle ${target ? 'reticle-active' : ''}`}>
        <div className="reticle-dot" />
        <div className="reticle-ring" />
      </div>

      {/* Minimal Sleek Target Prompt Pill */}
      {target && (
        <div className="interaction-prompt-pill">
          <span className="prompt-target-name">{target.name}</span>
          <div className="prompt-actions-inline">
            <span className="prompt-action-item">
              <kbd className="prompt-key">E</kbd>
              <span className="prompt-verb">{target.actionText}</span>
            </span>
            {target.inspectText && (
              <span className="prompt-action-item inspect">
                <kbd className="prompt-key key-inspect">R</kbd>
                <span className="prompt-verb">Inspect</span>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
