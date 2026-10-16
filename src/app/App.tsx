import React, { useState, useEffect } from 'react';
import {
  Terminal,
  RotateCcw,
  AlertTriangle,
  ShieldCheck,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useGameState } from '../hooks/useGameState';
import { RoomView } from '../components/room/RoomView';
import { InventoryHUD } from '../components/ui/InventoryHUD';
import { TerminalModal } from '../components/ui/TerminalModal';
import { FeedbackToast } from '../components/ui/FeedbackToast';
import { VictoryOverlay } from '../components/ui/VictoryOverlay';
import {
  isMuted,
  toggleMuted,
  playRealityShiftSound,
  playDoorUnlockSound,
  playDoorLockedSound,
  playSuccessChime,
  playKeystrokeSound,
} from '../services/audio/sound';
import './app.css';

export const App: React.FC = () => {
  const {
    state,
    lastFeedback,
    interactWithObject,
    inspectObject,
    collectItem,
    activateTerminal,
    submitRuleProposal,
    restartGame,
  } = useGameState();

  const [muted, setMutedState] = useState(() => isMuted());

  // Trigger reality shift audio cue when realityShiftCount increments
  useEffect(() => {
    if (state.realityShiftCount > 0) {
      playRealityShiftSound();
    }
  }, [state.realityShiftCount]);

  const activeRule = state.rules['RULE_01'];
  const isRuleDeceptive = activeRule?.isDeceptive;

  const handleToggleMute = () => {
    const next = toggleMuted();
    setMutedState(next);
  };

  const handleInteract = (objectId: string) => {
    if (objectId === 'exit_door') {
      const isBrassRuleActive =
        state.rules['RULE_01']?.predicateKey === 'RULE_BRASS_KEY_ALLOWED';
      const hasKey = state.inventory.some((i) => i.id === 'brass_key');
      if (isBrassRuleActive && hasKey) {
        playDoorUnlockSound();
      } else {
        playDoorLockedSound();
      }
    } else {
      playKeystrokeSound();
    }
    interactWithObject(objectId);
  };

  const handleCollectKey = () => {
    playSuccessChime();
    collectItem('brass_key');
  };

  const handleRestart = () => {
    playKeystrokeSound();
    restartGame();
  };

  return (
    <main className="app-viewport">
      {/* Ambient background grid & lighting */}
      <div className="ambient-grid" aria-hidden="true" />
      <div className="ambient-radial-glow" aria-hidden="true" />

      {/* Action Result / Feedback Toast Notification */}
      <FeedbackToast feedback={lastFeedback} />

      {/* Main Game Interface Container */}
      <div className="room-frame">
        {/* Navigation & Status Header */}
        <header className="room-header">
          <div className="header-brand">
            <h1 className="header-title">
              ROOM <span className="title-accent">S A</span>
            </h1>
            <span className="header-chamber-tag">CHAMBER 101 // THE OBVIOUS LIE</span>
          </div>

          {/* Active Rule Status Pill */}
          <button
            type="button"
            className={`rule-indicator-pill ${
              isRuleDeceptive ? 'pill-deceptive' : 'pill-stable'
            }`}
            onClick={() => {
              playKeystrokeSound();
              activateTerminal(true);
            }}
            aria-label={`Active Rule: ${activeRule?.statement}. Click to open terminal.`}
          >
            {isRuleDeceptive ? (
              <AlertTriangle size={14} className="pill-icon-warn" />
            ) : (
              <ShieldCheck size={14} className="pill-icon-ok" />
            )}
            <span className="pill-text">
              RULE_01: "{activeRule?.statement}"
            </span>
            <span className="pill-hint">[TERMINAL]</span>
          </button>

          {/* Quick Header Actions */}
          <div className="header-actions">
            <button
              type="button"
              className="btn-header-action"
              onClick={handleToggleMute}
              aria-label={muted ? 'Unmute game audio' : 'Mute game audio'}
              title={muted ? 'Audio Muted' : 'Audio Enabled'}
            >
              {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
              <span>{muted ? 'MUTED' : 'AUDIO'}</span>
            </button>
            <button
              type="button"
              className="btn-header-action"
              onClick={() => {
                playKeystrokeSound();
                activateTerminal(true);
              }}
              aria-label="Open Terminal"
            >
              <Terminal size={14} />
              <span>TERMINAL</span>
            </button>
            <button
              type="button"
              className="btn-header-action"
              onClick={handleRestart}
              aria-label="Restart Chamber"
            >
              <RotateCcw size={14} />
              <span>RESTART</span>
            </button>
          </div>
        </header>

        {/* Central Interactive Chamber Scene */}
        <section className="room-viewport-section">
          <RoomView
            state={state}
            onInteract={handleInteract}
            onInspect={(id) => {
              playKeystrokeSound();
              inspectObject(id);
            }}
            onCollectKey={handleCollectKey}
          />
        </section>

        {/* Footer HUD & Controls */}
        <footer className="game-hud-bar">
          <InventoryHUD
            items={state.inventory}
            onInspectItem={(item) => {
              playKeystrokeSound();
              inspectObject(item.id === 'brass_key' ? 'pedestal' : item.id);
            }}
          />
        </footer>
      </div>

      {/* Anomaly Terminal Modal */}
      <TerminalModal
        isOpen={state.terminalOpen}
        rules={state.rules}
        logs={state.terminalLog}
        onClose={() => {
          playKeystrokeSound();
          activateTerminal(false);
        }}
        onSubmitProposal={submitRuleProposal}
      />

      {/* Victory Escape Sequence Overlay */}
      <VictoryOverlay
        isOpen={state.status === 'escaped'}
        onRestart={handleRestart}
      />
    </main>
  );
};

export default App;
