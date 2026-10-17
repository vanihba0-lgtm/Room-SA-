import React, { useEffect, useState } from 'react';
import { X, Compass } from 'lucide-react';
import { soundManager } from '../../services/audio/soundManager';
import './tutorialOverlay.css';

interface TutorialOverlayProps {
  onDismiss: () => void;
}

const STORAGE_KEY = 'room_sa_tutorial_dismissed_v2';

export function isTutorialDismissed(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setTutorialDismissed(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, 'true');
  } catch {
    // Ignore
  }
}

export const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ onDismiss }) => {
  const [fading, setFading] = useState(false);

  const handleClose = () => {
    setTutorialDismissed();
    setFading(true);
    setTimeout(() => {
      onDismiss();
    }, 250);
  };

  useEffect(() => {
    // Disappears automatically after 8 seconds of gameplay
    const autoDismissTimer = setTimeout(() => {
      handleClose();
    }, 8000);

    const handleKeyDown = (e: KeyboardEvent) => {
      // Dismisses on Escape or X
      if (e.code === 'Escape' || e.code === 'KeyX') {
        soundManager.playKeystroke();
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(autoDismissTimer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <aside
      className={`controls-tutorial-overlay ${fading ? 'fade-out' : ''}`}
      role="complementary"
      aria-label="Training Guide"
    >
      <div className="controls-tutorial-card">
        <div className="controls-tutorial-header">
          <div className="controls-tutorial-badge">
            <Compass size={13} className="tutorial-badge-icon" />
            <span>OPERATIONAL CONTROLS</span>
          </div>
          <button
            type="button"
            className="btn-tutorial-dismiss"
            onClick={() => {
              soundManager.playKeystroke();
              handleClose();
            }}
            aria-label="Dismiss controls tutorial"
            title="Dismiss guide [ESC]"
          >
            <X size={13} />
          </button>
        </div>

        <div className="controls-tutorial-entries">
          <div className="tutorial-entry">
            <div className="tutorial-kbd-group">
              <kbd className="tut-key">W</kbd>
              <kbd className="tut-key">A</kbd>
              <kbd className="tut-key">S</kbd>
              <kbd className="tut-key">D</kbd>
            </div>
            <span className="tut-label">Move / Walk</span>
          </div>

          <div className="tutorial-entry">
            <div className="tutorial-kbd-group">
              <kbd className="tut-key wide">MOUSE</kbd>
            </div>
            <span className="tut-label">Look (Click to lock)</span>
          </div>

          <div className="tutorial-entry">
            <div className="tutorial-kbd-group">
              <kbd className="tut-key">E</kbd>
            </div>
            <span className="tut-label">Interact / Collect</span>
          </div>

          <div className="tutorial-entry">
            <div className="tutorial-kbd-group">
              <kbd className="tut-key wide">ESC</kbd>
            </div>
            <span className="tut-label">Pause Menu</span>
          </div>
        </div>

        <div className="controls-tutorial-footer">
          <span>HINT: Full controls & logs in Pause Menu [ESC]</span>
        </div>
      </div>
    </aside>
  );
};
