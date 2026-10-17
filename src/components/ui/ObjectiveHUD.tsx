import React, { useState, useEffect, useRef } from 'react';
import { Target, ChevronDown, ChevronUp } from 'lucide-react';
import { GameState } from '../../game/types';
import { getActiveObjective } from '../../game/progression/objectives';
import { soundManager } from '../../services/audio/soundManager';
import { notificationManager } from '../../services/notifications/notificationManager';
import './objective.css';

interface ObjectiveHUDProps {
  state: GameState;
}

export const ObjectiveHUD: React.FC<ObjectiveHUDProps> = ({ state }) => {
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
            <span>ACTIVE TASK</span>
          </div>

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

        <h3 className="objective-title">{currentObj.title}</h3>
        <p className="objective-description">{currentObj.description}</p>

        {isExpanded && (
          <div className="objective-expanded-content">
            {currentObj.what && (
              <div className="objective-field">
                <span className="field-label">WHAT: </span>
                <span className="field-text">{currentObj.what}</span>
              </div>
            )}
            {currentObj.where && (
              <div className="objective-field">
                <span className="field-label">WHERE: </span>
                <span className="field-text">{currentObj.where}</span>
              </div>
            )}
            {currentObj.how && (
              <div className="objective-field">
                <span className="field-label">HOW: </span>
                <span className="field-text">{currentObj.how}</span>
              </div>
            )}
            <div className="objective-why">
              <span className="field-label">WHY: </span>
              <span className="field-text">{currentObj.whyItMatters}</span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
