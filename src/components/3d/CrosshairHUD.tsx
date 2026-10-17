import React from 'react';
import { InteractionTargetInfo } from './PlayerController';
import './styles/crosshair.css';

interface CrosshairHUDProps {
  target: InteractionTargetInfo | null;
  isLocked: boolean;
}

export const CrosshairHUD: React.FC<CrosshairHUDProps> = ({ target, isLocked }) => {
  if (!isLocked) {
    return null;
  }

  return (
    <div className="crosshair-hud-container" aria-hidden="true">
      {/* Central Reticle */}
      <div className={`crosshair-reticle ${target ? 'reticle-active' : ''}`}>
        <div className="reticle-dot" />
        <div className="reticle-ring" />
      </div>

      {/* Single, Stable Contextual Prompt */}
      {target && (
        <div className="interaction-prompt-pill" key={target.id}>
          <kbd className="prompt-key">E</kbd>
          <span className="prompt-verb">{target.actionText}</span>
          {target.inspectText && (
            <span className="prompt-secondary-action">
              <kbd className="prompt-key secondary">R</kbd>
              <span className="prompt-verb-sec">{target.inspectText}</span>
            </span>
          )}
        </div>
      )}
    </div>
  );
};
