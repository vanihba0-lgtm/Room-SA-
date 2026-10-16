import React, { useState, useEffect, useRef } from 'react';
import { Target, HelpCircle, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { GameState } from '../../game/types';
import { getActiveObjective } from '../../game/progression/objectives';
import { soundManager } from '../../services/audio/soundManager';
import { notificationManager } from '../../services/notifications/notificationManager';
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
  const [isExpanded, setIsExpanded] = useState(false);

  // When active objective changes, trigger single centralized toast notification
  useEffect(() => {
    if (lastCompletedIdRef.current && lastCompletedIdRef.current !== currentObj?.id) {
      soundManager.playObjectiveComplete();
      notificationManager.notify('Objective complete: Next task assigned.', 'objective');
    }
    lastCompletedIdRef.current = currentObj?.id ?? null;
  }, [currentObj?.id]);

  if (!currentObj) {
    return null;
  }

  return (
    <aside className="objective-hud-container" aria-label="Objective Tracker">
      <div className={`objective-card ${isExpanded ? 'is-expanded' : 'is-collapsed'}`}>
        <div className="objective-header-row">
          <div className="objective-badge">
            <Target size={12} className="objective-target-icon" />
            <span>OBJECTIVE</span>
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
              <HelpCircle size={11} />
              <span>HINT</span>
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
              <BookOpen size={11} />
              <span>LOGS</span>
            </button>
            <button
              type="button"
              className="btn-hud-toggle"
              onClick={() => setIsExpanded((prev) => !prev)}
              aria-label={isExpanded ? 'Collapse objective details' : 'Expand objective details'}
              title={isExpanded ? 'Collapse details' : 'Expand details'}
            >
              {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>
          </div>
        </div>

        <h3 className="objective-title">{currentObj.title}</h3>
        <p className="objective-description">{currentObj.description}</p>

        {isExpanded && (
          <div className="objective-expanded-content">
            {currentObj.what && (
              <div className="objective-field">
                <span className="field-label">Action: </span>
                <span className="field-text">{currentObj.what}</span>
              </div>
            )}
            {currentObj.where && (
              <div className="objective-field">
                <span className="field-label">Location: </span>
                <span className="field-text">{currentObj.where}</span>
              </div>
            )}
            {currentObj.how && (
              <div className="objective-field">
                <span className="field-label">Method: </span>
                <span className="field-text">{currentObj.how}</span>
              </div>
            )}
            <div className="objective-why">
              <span className="field-label">Why: </span>
              <span className="field-text">{currentObj.whyItMatters}</span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
