import React, { useState, useEffect } from 'react';
import {
  Terminal,
  RotateCcw,
  Volume2,
  VolumeX,
  Box,
  Map,
  BookOpen,
  HelpCircle,
  Settings as SettingsIcon,
  Home,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { useGameState } from '../hooks/useGameState';
import { RoomView } from '../components/room/RoomView';
import { ChamberCanvas } from '../components/3d/ChamberCanvas';
import { InventoryHUD } from '../components/ui/InventoryHUD';
import { TerminalModal } from '../components/ui/TerminalModal';
import { FeedbackToast } from '../components/ui/FeedbackToast';
import { VictoryOverlay } from '../components/ui/VictoryOverlay';
import { TitleScreen } from '../components/ui/TitleScreen';
import { IntroCinematic } from '../components/ui/IntroCinematic';
import { TutorialOverlay } from '../components/ui/TutorialOverlay';
import { ObjectiveHUD } from '../components/ui/ObjectiveHUD';
import { HintModal } from '../components/ui/HintModal';
import { LogbookModal } from '../components/ui/LogbookModal';
import { ChamberSelectModal } from '../components/ui/ChamberSelectModal';
import { SettingsModal } from '../components/ui/SettingsModal';
import { AboutModal } from '../components/ui/AboutModal';
import {
  isMuted,
  toggleMuted,
  playRealityShiftSound,
  playDoorUnlockSound,
  playDoorLockedSound,
  playSuccessChime,
  playKeystrokeSound,
} from '../services/audio/sound';
import { soundManager } from '../services/audio/soundManager';
import {
  loadCampaignSave,
  markChamberCompleted,
  hasCompletedIntro,
  markIntroCompleted,
} from '../game/progression/campaign';
import { getActiveObjective } from '../game/progression/objectives';
import { CampaignSaveData } from '../game/progression/types';
import './app.css';

interface AppProps {
  initialViewMode?: '3d' | 'schematic';
  initialPhase?: 'title' | 'intro' | 'playing';
}

export const App: React.FC<AppProps> = ({ initialViewMode, initialPhase }) => {
  const {
    state,
    lastFeedback,
    interactWithObject,
    inspectObject,
    collectItem,
    activateTerminal,
    submitRuleProposal,
    restartGame,
    selectChamber,
  } = useGameState();

  const isWebGLAvailable =
    typeof window !== 'undefined' && typeof window.WebGLRenderingContext !== 'undefined';
  const defaultMode = initialViewMode ?? (isWebGLAvailable ? '3d' : 'schematic');

  // Game Phases
  const defaultPhase =
    initialPhase ??
    (typeof process !== 'undefined' && process.env.NODE_ENV === 'test' ? 'playing' : 'title');
  const [phase, setPhase] = useState<'title' | 'intro' | 'playing'>(defaultPhase);

  // Campaign Save Data
  const [campaignSave, setCampaignSave] = useState<CampaignSaveData>(() => loadCampaignSave());
  const hasSaveData = campaignSave.completedChambers.length > 0 || campaignSave.tutorialCompleted;

  // UI State
  const [muted, setMutedState] = useState(() => isMuted());
  const [viewMode, setViewMode] = useState<'3d' | 'schematic'>(defaultMode);
  const [showTutorial, setShowTutorial] = useState(true);

  // Modals
  const [isHintModalOpen, setIsHintModalOpen] = useState(false);
  const [isLogbookModalOpen, setIsLogbookModalOpen] = useState(false);
  const [isChamberSelectOpen, setIsChamberSelectOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  // Reality shift audio cue
  useEffect(() => {
    if (state.realityShiftCount > 0) {
      playRealityShiftSound();
    }
  }, [state.realityShiftCount]);

  // Campaign unlock synchronization
  useEffect(() => {
    let nextSave: CampaignSaveData | null = null;
    if (state.currentRoomId === 'chamber_102') {
      nextSave = markChamberCompleted('chamber_101');
    } else if (state.currentRoomId === 'chamber_103') {
      nextSave = markChamberCompleted('chamber_102');
    } else if (state.currentRoomId === 'chamber_104') {
      nextSave = markChamberCompleted('chamber_103');
    } else if (state.currentRoomId === 'chamber_105') {
      nextSave = markChamberCompleted('chamber_104');
    } else if (state.currentRoomId === 'chamber_106') {
      nextSave = markChamberCompleted('chamber_105');
    }

    if (state.status === 'escaped') {
      nextSave = markChamberCompleted('chamber_106');
    }

    if (nextSave) {
      setCampaignSave(nextSave);
    }
  }, [state.currentRoomId, state.status]);

  // Handle ambient drone audio according to active phase
  useEffect(() => {
    if (phase === 'playing') {
      soundManager.startAmbience();
    } else {
      soundManager.stopAmbience();
    }
    return () => {
      soundManager.stopAmbience();
    };
  }, [phase]);

  const activeRule = state.rules['RULE_01'];
  const isRuleDeceptive = activeRule?.isDeceptive;

  const handleToggleMute = () => {
    const next = toggleMuted();
    setMutedState(next);
  };

  const getChamberHeaderLabel = (roomId: string) => {
    switch (roomId) {
      case 'chamber_101':
        return 'CHAMBER 101 // THE OBVIOUS LIE';
      case 'chamber_102':
        return 'CHAMBER 102 // THE SIGNAL FOUNDRY';
      case 'chamber_103':
        return 'CHAMBER 103 // THE GRAVITY ARCHIVE';
      case 'chamber_104':
        return 'CHAMBER 104 // THE ZERO-DAY VAULT';
      case 'chamber_105':
        return 'CHAMBER 105 // THE CAUSALITY ENGINE';
      case 'chamber_106':
        return 'CHAMBER 106 // THE RULE ENGINE (FINALE)';
      default:
        return 'CHAMBER // SIMULATION SECTOR';
    }
  };

  const handleInteract = (objectId: string) => {
    // 1. Chamber 101 Pedestal Key
    if (objectId === 'pedestal') {
      const hasKey = state.inventory.some((i) => i.id === 'brass_key');
      if (!hasKey) {
        handleCollectKey();
        return;
      }
    }

    // 2. Terminals
    if (
      objectId === 'terminal' ||
      objectId === 'c103_terminal' ||
      objectId === 'c104_crypto' ||
      objectId === 'c105_terminal' ||
      objectId === 'c106_master_terminal'
    ) {
      playKeystrokeSound();
      activateTerminal(true);
      return;
    }

    // 3. Inspection slates & monitors
    if (
      objectId === 'observation_slate' ||
      objectId === 'diagnostic_slate_102' ||
      objectId === 'c103_log' ||
      objectId === 'c104_monitor' ||
      objectId === 'c105_chronometer' ||
      objectId === 'c106_prime_axiom'
    ) {
      playKeystrokeSound();
      inspectObject(objectId);
      return;
    }

    // 4. Doors
    if (objectId.startsWith('exit_door')) {
      let isUnlocked = false;
      if (objectId === 'exit_door') {
        const isBrassRuleActive =
          state.rules['RULE_01']?.predicateKey === 'RULE_BRASS_KEY_ALLOWED';
        const hasKey = state.inventory.some((i) => i.id === 'brass_key');
        isUnlocked = Boolean(isBrassRuleActive && hasKey);
      } else if (objectId === 'exit_door_102') {
        isUnlocked = !state.chamber102.exitDoorLocked;
      } else if (objectId === 'exit_door_103') {
        isUnlocked = Boolean(state.chamber103?.exitUnlocked);
      } else if (objectId === 'exit_door_104') {
        isUnlocked = Boolean(state.chamber104?.exitUnlocked);
      } else if (objectId === 'exit_door_105') {
        isUnlocked = Boolean(state.chamber105?.exitUnlocked);
      } else if (objectId === 'exit_door_106') {
        isUnlocked = Boolean(state.chamber106?.primeDirectiveOverridden);
      }

      if (isUnlocked) {
        playDoorUnlockSound();
        playSuccessChime();
      } else {
        playDoorLockedSound();
      }
      interactWithObject(objectId);
      return;
    }

    // 5. Switches, mechanisms, coils & consoles
    if (
      objectId === 'core_heavy' ||
      objectId === 'core_resonance' ||
      objectId === 'plate_mass' ||
      objectId === 'plate_harmonic' ||
      objectId === 'c103_ballast' ||
      objectId === 'c103_core' ||
      objectId === 'c103_sensor' ||
      objectId === 'c104_dispenser' ||
      objectId.startsWith('c105_relay') ||
      objectId.startsWith('c106_console')
    ) {
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

  const handleStartNewGame = () => {
    restartGame();
    if (!hasCompletedIntro()) {
      setPhase('intro');
    } else {
      setPhase('playing');
    }
  };

  const handleContinueGame = () => {
    setPhase('playing');
  };

  const handleIntroComplete = () => {
    markIntroCompleted();
    setCampaignSave(loadCampaignSave());
    setPhase('playing');
  };

  const handleSelectChamber = (chamberId: string) => {
    selectChamber(chamberId);
    setPhase('playing');
  };

  const isAnyModalOpen =
    state.terminalOpen ||
    isHintModalOpen ||
    isLogbookModalOpen ||
    isChamberSelectOpen ||
    isSettingsOpen ||
    isAboutOpen ||
    state.status === 'escaped';

  return (
    <main className={`app-viewport ${phase === 'playing' ? 'is-playing' : ''}`}>
      {/* Ambient background grid & lighting (hidden during gameplay) */}
      {phase !== 'playing' && (
        <>
          <div className="ambient-grid" aria-hidden="true" />
          <div className="ambient-radial-glow" aria-hidden="true" />
        </>
      )}

      {/* Screen A: Title Screen */}
      {phase === 'title' && (
        <TitleScreen
          hasSaveData={hasSaveData}
          onStartNewGame={handleStartNewGame}
          onContinue={handleContinueGame}
          onOpenChamberSelect={() => setIsChamberSelectOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenAbout={() => setIsAboutOpen(true)}
        />
      )}

      {/* Screen B: Cinematic Opening Narrative */}
      {phase === 'intro' && (
        <IntroCinematic
          onComplete={handleIntroComplete}
        />
      )}

      {/* Screen C & D: Main Game Loop (Chambers 101-106) */}
      {phase === 'playing' && (
        <>
          {/* Action Result / Feedback Toast Notification */}
          <FeedbackToast feedback={lastFeedback} />

          {/* Interactive Tutorial for Chamber 1 */}
          {showTutorial && state.currentRoomId === 'chamber_101' && (
            <TutorialOverlay
              state={state}
              isActive={showTutorial}
              onDismiss={() => setShowTutorial(false)}
            />
          )}

          {/* Main Game Interface Container */}
          <div className={`room-frame ${viewMode === '3d' ? 'room-frame--fullscreen' : ''}`}>
            {/* Navigation & Status Header */}
            <header className="room-header">
              <div className="header-brand">
                <h1 className="header-title">
                  ROOM <span className="title-accent">S A</span>
                </h1>
                <span className="header-chamber-tag">
                  {getChamberHeaderLabel(state.currentRoomId)}
                </span>
              </div>

              {/* Active Rule Status Pill */}
              {state.currentRoomId === 'chamber_102' ? (
                <div
                  className={`rule-indicator-pill ${
                    state.chamber102.circuit.isCircuitClosed
                      ? 'pill-stable'
                      : 'pill-deceptive'
                  }`}
                  aria-label={`Harmonic Circuit: ${
                    state.chamber102.circuit.isCircuitClosed ? 'Resonant' : 'Tuning'
                  }`}
                >
                  {state.chamber102.circuit.isCircuitClosed ? (
                    <ShieldCheck size={14} className="pill-icon-ok" />
                  ) : (
                    <AlertTriangle size={14} className="pill-icon-warn" />
                  )}
                  <span className="pill-text">
                    {`CIRCUIT: [ CHAN ${state.chamber102.circuit.routingChannel} @ ${state.chamber102.circuit.selectedFrequency} kHz ]`}
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
                  aria-label={`Active Rule: "${activeRule?.statement ?? ''}". Click to open terminal.`}
                >
                  {isRuleDeceptive ? (
                    <AlertTriangle size={14} className="pill-icon-warn" />
                  ) : (
                    <ShieldCheck size={14} className="pill-icon-ok" />
                  )}
                  <span className="pill-text">
                    RULE: "{activeRule?.statement ?? 'EVALUATING SYSTEM TRUTH'}"
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
                  aria-label={
                    viewMode === '3d'
                      ? 'Switch to 2D Schematic'
                      : 'Switch to 3D Chamber'
                  }
                  title={
                    viewMode === '3d'
                      ? 'Switch to 2D Schematic'
                      : 'Switch to 3D First-Person View'
                  }
                >
                  {viewMode === '3d' ? <Map size={14} /> : <Box size={14} />}
                  <span>{viewMode === '3d' ? '2D MAP' : '3D VIEW'}</span>
                </button>

                <button
                  type="button"
                  className="btn-header-action"
                  onClick={() => {
                    playKeystrokeSound();
                    setIsHintModalOpen(true);
                  }}
                  aria-label="Open Progressive Hints"
                  title="Progressive Hint System"
                >
                  <HelpCircle size={14} />
                  <span>HINTS</span>
                </button>

                <button
                  type="button"
                  className="btn-header-action"
                  onClick={() => {
                    playKeystrokeSound();
                    setIsLogbookModalOpen(true);
                  }}
                  aria-label="Open Telemetry Logbook"
                  title="Evidence & Telemetry Archive"
                >
                  <BookOpen size={14} />
                  <span>LOGS</span>
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
                  onClick={() => {
                    playKeystrokeSound();
                    handleRestart();
                  }}
                  aria-label="Restart Chamber"
                  title="Restart Current Chamber"
                >
                  <RotateCcw size={14} />
                  <span>RESTART</span>
                </button>

                <button
                  type="button"
                  className="btn-header-action"
                  onClick={() => {
                    playKeystrokeSound();
                    setIsSettingsOpen(true);
                  }}
                  aria-label="Open Settings"
                  title="Settings & Audio Sliders"
                >
                  <SettingsIcon size={14} />
                  <span>SETTINGS</span>
                </button>

                <button
                  type="button"
                  className="btn-header-action"
                  onClick={() => {
                    playKeystrokeSound();
                    setPhase('title');
                  }}
                  aria-label="Return to Title Screen"
                  title="Return to Main Menu"
                >
                  <Home size={14} />
                  <span>MENU</span>
                </button>
              </div>
            </header>

            {/* Central Interactive Chamber Scene (3D First-Person or 2D Schematic) */}
            <section className="room-viewport-section">
              {/* Contextual Objective Tracker */}
              <ObjectiveHUD
                state={state}
                onOpenHints={() => setIsHintModalOpen(true)}
                onOpenLogbook={() => setIsLogbookModalOpen(true)}
              />

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
                  isExternalModalOpen={isAnyModalOpen}
                  onOpenHints={() => setIsHintModalOpen(true)}
                  onOpenLogbook={() => setIsLogbookModalOpen(true)}
                  onOpenSettings={() => setIsSettingsOpen(true)}
                  onOpenChamberSelect={() => setIsChamberSelectOpen(true)}
                  onReturnToMenu={() => setPhase('title')}
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
        </>
      )}

      {/* Progressive Hint Modal */}
      <HintModal
        isOpen={isHintModalOpen}
        objective={getActiveObjective(state)}
        onClose={() => setIsHintModalOpen(false)}
      />

      {/* Logbook / Lore Dossier Modal */}
      <LogbookModal
        isOpen={isLogbookModalOpen}
        discoveredLogIds={campaignSave.discoveredLogIds}
        currentChamberId={state.currentRoomId}
        onClose={() => setIsLogbookModalOpen(false)}
      />

      {/* Chamber Selection Modal */}
      <ChamberSelectModal
        isOpen={isChamberSelectOpen}
        unlockedChamberIds={campaignSave.unlockedChambers}
        completedChamberIds={campaignSave.completedChambers}
        currentChamberId={state.currentRoomId}
        onSelectChamber={handleSelectChamber}
        onClose={() => setIsChamberSelectOpen(false)}
      />

      {/* Settings & Accessibility Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onRestartChamber={handleRestart}
        onReplayTutorial={() => {
          setShowTutorial(true);
          setIsSettingsOpen(false);
          setPhase('playing');
        }}
        onReturnToTitle={() => {
          setIsSettingsOpen(false);
          setPhase('title');
        }}
      />

      {/* About & Philosophy Modal */}
      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />

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
        onRestart={() => {
          restartGame();
          setPhase('title');
        }}
      />
    </main>
  );
};

export default App;
