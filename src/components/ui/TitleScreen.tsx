import React from 'react';
import { Play, RotateCcw, Grid, Settings, Info, ShieldAlert } from 'lucide-react';
import { soundManager } from '../../services/audio/soundManager';
import './title.css';

interface TitleScreenProps {
  hasSaveData: boolean;
  onStartNewGame: () => void;
  onContinue: () => void;
  onOpenChamberSelect: () => void;
  onOpenSettings: () => void;
  onOpenAbout: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  hasSaveData,
  onStartNewGame,
  onContinue,
  onOpenChamberSelect,
  onOpenSettings,
  onOpenAbout,
}) => {
  return (
    <div className="title-screen-container" role="dialog" aria-modal="true" aria-label="Game Title Screen">
      <div className="title-card">
        <div className="title-badge-pill">
          <ShieldAlert size={13} />
          <span>SIMULATION INTEGRITY AUDIT // VER 4.09</span>
        </div>

        <div>
          <h1 className="title-wordmark">
            ROOM <span className="title-wordmark-accent">S A</span>
          </h1>
          <div className="title-subtitle">THE ROOM THAT LIES</div>
        </div>

        <p className="title-teaser">
          The simulation says everything is working. The evidence says otherwise.
          Investigate anomalies, expose contradictions, and rewrite the rules to escape.
        </p>

        <div className="title-menu-actions">
          {hasSaveData ? (
            <button
              type="button"
              className="btn-title-primary"
              onClick={() => {
                soundManager.playKeystroke();
                onContinue();
              }}
            >
              <Play size={16} />
              <span>CONTINUE INVESTIGATION</span>
            </button>
          ) : (
            <button
              type="button"
              className="btn-title-primary"
              onClick={() => {
                soundManager.playKeystroke();
                onStartNewGame();
              }}
            >
              <Play size={16} />
              <span>START NEW GAME</span>
            </button>
          )}

          {hasSaveData && (
            <button
              type="button"
              className="btn-title-secondary"
              onClick={() => {
                soundManager.playKeystroke();
                onStartNewGame();
              }}
            >
              <RotateCcw size={16} />
              <span>RESTART CAMPAIGN</span>
            </button>
          )}

          <button
            type="button"
            className="btn-title-secondary"
            onClick={() => {
              soundManager.playKeystroke();
              onOpenChamberSelect();
            }}
          >
            <Grid size={16} />
            <span>CHAMBER SELECT (6 TOTAL)</span>
          </button>

          <button
            type="button"
            className="btn-title-secondary"
            onClick={() => {
              soundManager.playKeystroke();
              onOpenSettings();
            }}
          >
            <Settings size={16} />
            <span>SETTINGS & AUDIO</span>
          </button>

          <button
            type="button"
            className="btn-title-secondary"
            onClick={() => {
              soundManager.playKeystroke();
              onOpenAbout();
            }}
          >
            <Info size={16} />
            <span>ABOUT & CREDITS</span>
          </button>
        </div>
      </div>
    </div>
  );
};
