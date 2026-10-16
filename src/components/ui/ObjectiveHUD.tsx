import React, { useState, useEffect, useRef } from 'react';
import { Target, HelpCircle, BookOpen, CheckCircle } from 'lucide-react';
import { GameState } from '../../game/types';
import { getActiveObjective } from '../../game/progression/objectives';
import { soundManager } from '../../services/audio/soundManager';
import './objective.css';

interface ObjectiveHUDProps {
  state: GameState;
  onOpenHints: () => void;
  onOpenLogbook: () => void;
}

export const ObjectiveHUD: React.FC<ObjectiveHUDProps> = ({
  state,
  onOpenHints,
  onOpenLogbook,
}) => {
  const currentObj = getActiveObjective(state);
  const lastCompletedIdRef = useRef<string | null>(null);
  const [completedBanner, setCompletedBanner] = useState<string | null>(null);

  // When active objective changes, check if the previous one was completed
  useEffect(() => {
    if (lastCompletedIdRef.current && lastCompletedIdRef.current !== currentObj?.id) {
      soundManager.playObjectiveComplete();
      setCompletedBanner('Objective complete. Next task assigned.');
      const timer = setTimeout(() => setCompletedBanner(null), 3500);
      return () => clearTimeout(timer);
    }
    lastCompletedIdRef.current = currentObj?.id ?? null;
  }, [currentObj?.id]);

  if (!currentObj && !completedBanner) {
    return null;
  }

  return (
    <aside className="objective-hud-container" aria-label="Objective Tracker">
      {completedBanner && (
        <div className="objective-completed-banner" role="status">
          <CheckCircle size={15} />
          <span>{completedBanner}</span>
        </div>
      )}

      {currentObj && (
        <div className="objective-card">
          <div className="objective-header-row">
            <div className="objective-badge">
              <Target size={13} />
              <span>CURRENT OBJECTIVE</span>
            </div>

            <div className="objective-actions-row">
              <button
                type="button"
                className="btn-hud-pill"
                onClick={() => {
                  soundManager.playKeystroke();
                  onOpenHints();
                }}
                aria-label="Open puzzle hints"
                title="Request progressive hint"
              >
                <HelpCircle size={12} />
                <span>HINTS</span>
              </button>
              <button
                type="button"
                className="btn-hud-pill"
                onClick={() => {
                  soundManager.playKeystroke();
                  onOpenLogbook();
                }}
                aria-label="Open investigator logbook"
                title="View discovered logs"
              >
                <BookOpen size={12} />
                <span>LOGS</span>
              </button>
            </div>
          </div>

          <h3 className="objective-title">{currentObj.title}</h3>
          <p className="objective-description">{currentObj.description}</p>
          <div className="objective-why">
            <span>Context: </span>{currentObj.whyItMatters}
          </div>
        </div>
      )}
    </aside>
  );
};
