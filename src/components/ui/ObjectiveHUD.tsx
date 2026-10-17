import React, { useEffect, useRef } from 'react';
import { Target } from 'lucide-react';
import { GameState } from '../../game/types';
import { getActiveObjective } from '../../game/progression/objectives';
import { soundManager } from '../../services/audio/soundManager';
import './objective.css';

interface ObjectiveHUDProps {
  state: GameState;
}

export const ObjectiveHUD: React.FC<ObjectiveHUDProps> = ({ state }) => {
  const currentObj = getActiveObjective(state);
  const lastCompletedIdRef = useRef<string | null>(null);

  // Play subtle cue when objective progresses
  useEffect(() => {
    if (lastCompletedIdRef.current && lastCompletedIdRef.current !== currentObj?.id) {
      soundManager.playObjectiveComplete();
    }
    lastCompletedIdRef.current = currentObj?.id ?? null;
  }, [currentObj?.id]);

  if (!currentObj) {
    return null;
  }

  return (
    <aside className="objective-hud-container" aria-label="Current Objective">
      <div className="objective-panel">
        <div className="objective-panel-header">
          <Target size={12} className="objective-target-icon" />
          <span className="objective-tag">OBJECTIVE</span>
        </div>

        <h2 className="objective-headline">{currentObj.title}</h2>
        <p className="objective-body">{currentObj.description}</p>

        {currentObj.whyItMatters && (
          <div className="objective-clue-row">
            <span className="clue-tag">AXIOM:</span>
            <span className="clue-body">{currentObj.whyItMatters}</span>
          </div>
        )}
      </div>
    </aside>
  );
};
