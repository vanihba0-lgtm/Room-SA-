import React, { useState } from 'react';
import { Play, RotateCcw, Compass, Settings, BookOpen, Film, AlertTriangle, Layers, Info } from 'lucide-react';
import { soundManager } from '../../services/audio/soundManager';
import { CampaignSaveData } from '../../game/progression/types';
import './mainMenu.css';

interface MainMenuProps {
  hasSaveData: boolean;
  saveData?: CampaignSaveData;
  onContinue: () => void;
  onStartNewGame: () => void;
  onOpenControls: () => void;
  onOpenSettings: () => void;
  onOpenLogbook: () => void;
  onOpenChamberSelect?: () => void;
  onOpenAbout?: () => void;
  onReplayIntro: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  hasSaveData,
  saveData,
  onContinue,
  onStartNewGame,
  onOpenControls,
  onOpenSettings,
  onOpenLogbook,
  onOpenChamberSelect,
  onOpenAbout,
  onReplayIntro,
}) => {
  const [showConfirmNewGame, setShowConfirmNewGame] = useState(false);

  const getSavedChamberName = (roomId?: string) => {
    switch (roomId) {
      case 'chamber_102':
        return 'CHAMBER 102 // SIGNAL FOUNDRY';
      case 'chamber_103':
        return 'CHAMBER 103 // GRAVITY ARCHIVE';
      case 'chamber_104':
        return 'CHAMBER 104 // ZERO-DAY VAULT';
      case 'chamber_105':
        return 'CHAMBER 105 // THE LAST WITNESS';
      default:
        return 'CHAMBER 101 // THE OBVIOUS LIE';
    }
  };

  const handleNewGameClick = () => {
    soundManager.playKeystroke();
    if (hasSaveData) {
      setShowConfirmNewGame(true);
    } else {
      onStartNewGame();
    }
  };

  const handleConfirmNewGame = () => {
    soundManager.playKeystroke();
    setShowConfirmNewGame(false);
    onStartNewGame();
  };

  return (
    <div className="main-menu-container" role="dialog" aria-modal="true" aria-label="Game Title Screen">
      {/* Background Architectural Atmosphere */}
      <div className="main-menu-grid" aria-hidden="true" />
      <div className="main-menu-vignette" aria-hidden="true" />

      <div className="main-menu-content">
        {/* Title Presentation */}
        <header className="main-menu-header">
          <div className="main-menu-wordmark-wrapper">
            <h1 className="main-menu-wordmark">
              ROOM <span className="main-menu-wordmark-accent">S A</span>
            </h1>
          </div>
          <div className="main-menu-tagline-wrapper">
            <div className="main-menu-line-left" aria-hidden="true" />
            <p className="main-menu-tagline">THE ROOM THAT LIES</p>
            <div className="main-menu-line-right" aria-hidden="true" />
          </div>
          <p className="main-menu-dossier-intro">
            Simulated Axiomatic Architecture // Forensic Investigation
          </p>
        </header>

        {/* Primary Action List */}
        <nav className="main-menu-nav" aria-label="Primary Navigation">
          {/* Continue Button */}
          {hasSaveData ? (
            <button
              type="button"
              className="btn-menu-primary"
              onClick={() => {
                soundManager.playKeystroke();
                onContinue();
              }}
              autoFocus
            >
              <div className="btn-menu-icon-box">
                <Play size={16} />
              </div>
              <div className="btn-menu-text-stack">
                <span className="btn-menu-label">CONTINUE INVESTIGATION</span>
                <span className="btn-menu-sublabel">{getSavedChamberName(saveData?.currentChamberId)}</span>
              </div>
            </button>
          ) : (
            <button
              type="button"
              className="btn-menu-primary disabled"
              disabled
              title="No saved campaign found"
              aria-disabled="true"
            >
              <div className="btn-menu-icon-box">
                <Play size={16} />
              </div>
              <div className="btn-menu-text-stack">
                <span className="btn-menu-label">CONTINUE</span>
                <span className="btn-menu-sublabel">NO ACTIVE DOSSIER FOUND</span>
              </div>
            </button>
          )}

          {/* New Game Button */}
          <button
            type="button"
            className={hasSaveData ? 'btn-menu-item' : 'btn-menu-primary'}
            onClick={handleNewGameClick}
            autoFocus={!hasSaveData}
            aria-label="START NEW GAME"
          >
            <div className="btn-menu-icon-box">
              <RotateCcw size={16} />
            </div>
            <div className="btn-menu-text-stack">
              <span className="btn-menu-label">START NEW GAME</span>
              <span className="btn-menu-sublabel">COMMENCE CHAMBER 101 PROTOCOL</span>
            </div>
          </button>

          {/* Chamber Select */}
          {onOpenChamberSelect && (
            <button
              type="button"
              className="btn-menu-item"
              onClick={() => {
                soundManager.playKeystroke();
                onOpenChamberSelect();
              }}
              aria-label="CHAMBER SELECT"
            >
              <div className="btn-menu-icon-box">
                <Layers size={16} />
              </div>
              <div className="btn-menu-text-stack">
                <span className="btn-menu-label">CHAMBER SELECT</span>
                <span className="btn-menu-sublabel">NAVIGATE TO UNLOCKED SECTORS</span>
              </div>
            </button>
          )}

          {/* Controls Reference */}
          <button
            type="button"
            className="btn-menu-item"
            onClick={() => {
              soundManager.playKeystroke();
              onOpenControls();
            }}
          >
            <div className="btn-menu-icon-box">
              <Compass size={16} />
            </div>
            <div className="btn-menu-text-stack">
              <span className="btn-menu-label">CONTROLS</span>
              <span className="btn-menu-sublabel">WASD, MOUSE & INTERACTION MAP</span>
            </div>
          </button>

          {/* Case File / Logbook */}
          <button
            type="button"
            className="btn-menu-item"
            onClick={() => {
              soundManager.playKeystroke();
              onOpenLogbook();
            }}
          >
            <div className="btn-menu-icon-box">
              <BookOpen size={16} />
            </div>
            <div className="btn-menu-text-stack">
              <span className="btn-menu-label">CASE FILE</span>
              <span className="btn-menu-sublabel">DR. MARA VOSS DOSSIER & LOGS</span>
            </div>
          </button>

          {/* Settings & Audio */}
          <button
            type="button"
            className="btn-menu-item"
            onClick={() => {
              soundManager.playKeystroke();
              onOpenSettings();
            }}
            aria-label="SETTINGS & AUDIO"
          >
            <div className="btn-menu-icon-box">
              <Settings size={16} />
            </div>
            <div className="btn-menu-text-stack">
              <span className="btn-menu-label">SETTINGS</span>
              <span className="btn-menu-sublabel">AUDIO LEVELS & ACCESSIBILITY</span>
            </div>
          </button>

          {/* Replay Intro */}
          <button
            type="button"
            className="btn-menu-item btn-menu-muted"
            onClick={() => {
              soundManager.playKeystroke();
              onReplayIntro();
            }}
          >
            <div className="btn-menu-icon-box">
              <Film size={16} />
            </div>
            <div className="btn-menu-text-stack">
              <span className="btn-menu-label">REPLAY INTRO</span>
              <span className="btn-menu-sublabel">CINEMATIC TITLE SEQUENCE</span>
            </div>
          </button>

          {/* About & Credits */}
          {onOpenAbout && (
            <button
              type="button"
              className="btn-menu-item btn-menu-muted"
              onClick={() => {
                soundManager.playKeystroke();
                onOpenAbout();
              }}
              aria-label="ABOUT & CREDITS"
            >
              <div className="btn-menu-icon-box">
                <Info size={16} />
              </div>
              <div className="btn-menu-text-stack">
                <span className="btn-menu-label">ABOUT & CREDITS</span>
                <span className="btn-menu-sublabel">DEVELOPMENT TEAM & ACKNOWLEDGMENTS</span>
              </div>
            </button>
          )}
        </nav>

        {/* Footer Identifier */}
        <footer className="main-menu-footer">
          <span className="footer-code">PROTOCOL // 5-CHAMBER DECEPTION AUDIT</span>
          <span className="footer-status">SILENT INITIALIZATION // NOMINAL</span>
        </footer>
      </div>

      {/* Confirmation Dialog for New Game Overwrite */}
      {showConfirmNewGame && (
        <div
          className="menu-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-overwrite-title"
          onClick={() => setShowConfirmNewGame(false)}
        >
          <div className="menu-confirm-card" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-icon-row">
              <AlertTriangle size={24} className="confirm-warn-icon" />
              <h3 id="confirm-overwrite-title" className="confirm-title">
                Overwrite Campaign Progress?
              </h3>
            </div>
            <p className="confirm-message">
              You currently have an active investigation dossier ({getSavedChamberName(saveData?.currentChamberId)}).
              Starting a new game will reset your chamber progress back to Chamber 101.
            </p>
            <div className="confirm-actions-row">
              <button
                type="button"
                className="btn-confirm-cancel"
                onClick={() => {
                  soundManager.playKeystroke();
                  setShowConfirmNewGame(false);
                }}
              >
                CANCEL
              </button>
              <button
                type="button"
                className="btn-confirm-overwrite"
                onClick={handleConfirmNewGame}
                autoFocus
              >
                OVERWRITE & BEGIN
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
