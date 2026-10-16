import React, { useState, useEffect } from 'react';
import {
  Terminal,
  RotateCcw,
  AlertTriangle,
  ShieldCheck,
  Volume2,
  VolumeX,
  Box,
  Map,
} from 'lucide-react';
import { useGameState } from '../hooks/useGameState';
import { RoomView } from '../components/room/RoomView';
import { ChamberCanvas } from '../components/3d/ChamberCanvas';
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

interface AppProps {
  initialViewMode?: '3d' | 'schematic';
}

export const App: React.FC<AppProps> = ({ initialViewMode }) => {
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

  const isWebGLAvailable =
    typeof window !== 'undefined' && typeof window.WebGLRenderingContext !== 'undefined';
  const defaultMode = initialViewMode ?? (isWebGLAvailable ? '3d' : 'schematic');

  const [muted, setMutedState] = useState(() => isMuted());
  const [viewMode, setViewMode] = useState<'3d' | 'schematic'>(defaultMode);

  // Trigger reality shift audio cue when realityShiftCount increments
  useEffect(() => {
    if (state.realityShiftCount > 0) {
      playRealityShiftSound();
    }
  }, [state.realityShiftCount]);

  const activeRule = state.rules['RULE_01'];
  const isRuleDeceptive = activeRule?.isDeceptive;

  const isChamber102 = state.currentRoomId === 'chamber_102';
  const c102 = state.chamber102;

  const handleToggleMute = () => {
    const next = toggleMuted();
    setMutedState(next);
  };

  const handleInteract = (objectId: string) => {
    if (objectId === 'pedestal') {
      const hasKey = state.inventory.some((i) => i.id === 'brass_key');
      if (!hasKey) {
        handleCollectKey();
        return;
      }
    }

    if (objectId === 'terminal') {
      playKeystrokeSound();
      activateTerminal(true);
      return;
    }

    if (objectId === 'observation_slate' || objectId === 'diagnostic_slate_102') {
      playKeystrokeSound();
      inspectObject(objectId);
      return;
    }

    if (objectId === 'exit_door') {
      const isBrassRuleActive =
        state.rules['RULE_01']?.predicateKey === 'RULE_BRASS_KEY_ALLOWED';
      const hasKey = state.inventory.some((i) => i.id === 'brass_key');
      if (isBrassRuleActive && hasKey) {
        playDoorUnlockSound();
      } else {
        playDoorLockedSound();
      }
    } else if (objectId === 'exit_door_102') {
      if (!c102.exitDoorLocked) {
        playDoorUnlockSound();
        playSuccessChime();
      } else {
        playDoorLockedSound();
      }
    } else if (objectId === 'core_heavy' || objectId === 'core_resonance') {
      playSuccessChime();
    } else if (objectId === 'circuit_console') {
      playKeystrokeSound();
    } else if (objectId === 'plate_mass' || objectId === 'plate_harmonic') {
      playSuccessChime();
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
            <span className="header-chamber-tag">
              {isChamber102
                ? 'CHAMBER 102 // THE SIGNAL FOUNDRY'
                : 'CHAMBER 101 // THE OBVIOUS LIE'}
            </span>
          </div>

          {/* Active Rule Status Pill */}
          {isChamber102 ? (
            <div
              className={`rule-indicator-pill ${
                c102.circuit.isCircuitClosed ? 'pill-stable' : 'pill-deceptive'
              }`}
              aria-label={`Harmonic Circuit Status: ${c102.circuit.isCircuitClosed ? 'Closed' : 'Open'}`}
            >
              {c102.circuit.isCircuitClosed ? (
                <ShieldCheck size={14} className="pill-icon-ok" />
              ) : (
                <AlertTriangle size={14} className="pill-icon-warn" />
              )}
              <span className="pill-text">
                {`CIRCUIT: [ CHAN ${c102.circuit.routingChannel} @ ${c102.circuit.selectedFrequency} kHz ]`}
              </span>
              <span className="pill-hint">
                {c102.circuit.isCircuitClosed ? '[RESONANCE]' : '[TUNING]'}
              </span>
            </div>
          ) : (
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
          )}

          {/* Quick Header Actions */}
          <div className="header-actions">
            <button
              type="button"
              className="btn-header-action"
              onClick={() => {
                playKeystrokeSound();
                setViewMode((prev) => (prev === '3d' ? 'schematic' : '3d'));
              }}
              aria-label={viewMode === '3d' ? 'Switch to 2D Schematic' : 'Switch to 3D Chamber'}
              title={viewMode === '3d' ? 'Switch to 2D Tactical Schematic' : 'Switch to 3D First-Person View'}
            >
              {viewMode === '3d' ? <Map size={14} /> : <Box size={14} />}
              <span>{viewMode === '3d' ? '2D MAP' : '3D VIEW'}</span>
            </button>
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

        {/* Central Interactive Chamber Scene (3D First-Person or 2D Schematic) */}
        <section className="room-viewport-section">
          {viewMode === '3d' ? (
            <ChamberCanvas
              state={state}
              onInteract={handleInteract}
              onInspect={(id) => {
                playKeystrokeSound();
                inspectObject(id);
              }}
              onRestart={handleRestart}
              muted={muted}
              onToggleMute={handleToggleMute}
            />
          ) : (
            <RoomView
              state={state}
              onInteract={handleInteract}
              onInspect={(id) => {
                playKeystrokeSound();
                inspectObject(id);
              }}
              onCollectKey={handleCollectKey}
            />
          )}
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
