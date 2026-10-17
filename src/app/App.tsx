import React, { useState, useEffect, useRef } from 'react';

import { useGameState } from '../hooks/useGameState';
import { RoomView } from '../components/room/RoomView';
import { ChamberCanvas } from '../components/3d/ChamberCanvas';
import { TerminalModal } from '../components/ui/TerminalModal';
import { FeedbackToast } from '../components/ui/FeedbackToast';
import { VictoryOverlay } from '../components/ui/VictoryOverlay';
import { CinematicOpening } from '../components/ui/CinematicOpening';
import { MainMenu } from '../components/ui/MainMenu';
import { StoryBriefing } from '../components/ui/StoryBriefing';
import { CinematicTransition } from '../components/ui/CinematicTransition';
import { TutorialOverlay, isTutorialDismissed } from '../components/ui/TutorialOverlay';
import { ObjectiveHUD } from '../components/ui/ObjectiveHUD';
import { HintModal } from '../components/ui/HintModal';
import { LogbookModal } from '../components/ui/LogbookModal';
import { ChamberSelectModal } from '../components/ui/ChamberSelectModal';
import { SettingsModal } from '../components/ui/SettingsModal';
import { AboutModal } from '../components/ui/AboutModal';
import { ControlsModal } from '../components/ui/ControlsModal';
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
import { notificationManager } from '../services/notifications/notificationManager';
import {
  loadCampaignSave,
  saveCampaignProgress,
  markChamberCompleted,
  resetCampaignSave,
  recordLogDiscovered,
} from '../game/progression/campaign';
import { getActiveObjective } from '../game/progression/objectives';
import { CampaignSaveData } from '../game/progression/types';
import './app.css';

export type GamePhase = 'cinematic' | 'menu' | 'briefing' | 'playing';

interface AppProps {
  initialViewMode?: '3d' | 'schematic';
  initialPhase?: GamePhase | 'title' | 'intro';
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

  // Phase resolution: tests start playing, fresh browser visits start at cinematic
  const resolveDefaultPhase = (): GamePhase => {
    if (initialPhase) {
      if (initialPhase === 'title') return 'menu';
      if (initialPhase === 'intro') return 'briefing';
      return initialPhase as GamePhase;
    }
    if (typeof process !== 'undefined' && process.env.NODE_ENV === 'test') {
      return 'playing';
    }
    return 'cinematic';
  };

  const [phase, setPhase] = useState<GamePhase>(resolveDefaultPhase);

  // Campaign Save Data
  const [campaignSave, setCampaignSave] = useState<CampaignSaveData>(() => loadCampaignSave());
  const hasSaveData = campaignSave.completedChambers.length > 0 || campaignSave.tutorialCompleted;

  // UI State
  const [muted, setMutedState] = useState(() => isMuted());
  const [viewMode] = useState<'3d' | 'schematic'>(defaultMode);
  const [showTutorial, setShowTutorial] = useState(() => !isTutorialDismissed());
  const [activeStoryBeatChamber, setActiveStoryBeatChamber] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPauseMenuOpen, setIsPauseMenuOpen] = useState(false);
  const pendingDoorInteractionRef = useRef<string | null>(null);

  // Modals
  const [isHintModalOpen, setIsHintModalOpen] = useState(false);
  const [isLogbookModalOpen, setIsLogbookModalOpen] = useState(false);
  const [isChamberSelectOpen, setIsChamberSelectOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isControlsOpen, setIsControlsOpen] = useState(false);

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
    }

    if (state.status === 'escaped') {
      nextSave = markChamberCompleted('chamber_105');
      if (state.chamber105?.chosenEnding) {
        nextSave = {
          ...nextSave,
          chosenEnding: state.chamber105.chosenEnding,
        };
        saveCampaignProgress(nextSave);
      }
    }

    if (nextSave) {
      setCampaignSave(nextSave);
    }
  }, [state.currentRoomId, state.status, state.chamber105?.chosenEnding]);

  // Synchronize active chamber with window.location.hash on hashchange
  useEffect(() => {
    const validChambers = [
      'chamber_101',
      'chamber_102',
      'chamber_103',
      'chamber_104',
      'chamber_105',
    ];

    const handleHashChange = () => {
      if (typeof window === 'undefined') return;
      const hash = window.location.hash.replace(/^#/, '');
      if (validChambers.includes(hash)) {
        if (state.currentRoomId !== hash) {
          selectChamber(hash);
        }
        setPhase('playing');
        notificationManager.clear();
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [selectChamber, state.currentRoomId]);

  // Update hash when currentRoomId changes in playing mode
  useEffect(() => {
    if (phase === 'playing' && typeof window !== 'undefined') {
      const currentHash = window.location.hash.replace(/^#/, '');
      if (currentHash !== state.currentRoomId) {
        window.location.hash = state.currentRoomId;
      }
      notificationManager.clear();
    }
  }, [state.currentRoomId, phase]);

  // Ambience is OFF by default. No continuous background audio autostart.
  useEffect(() => {
    soundManager.stopAmbience();
    return () => {
      soundManager.stopAmbience();
    };
  }, [phase]);

  const activeRule = state.rules['RULE_01'];

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
        return 'CHAMBER 105 // THE LAST WITNESS (FINALE)';
      default:
        return 'CHAMBER // SIMULATION SECTOR';
    }
  };

  const handleInspect = (id: string) => {
    playKeystrokeSound();
    inspectObject(id);

    let logId: string | null = null;
    if (id === 'observation_slate') logId = 'log_c101_scratches';
    else if (id === 'diagnostic_slate_102') logId = 'log_c102_advisory';
    else if (id === 'c103_log') logId = 'log_c103_clue';
    else if (id === 'c104_monitor') logId = 'log_c104_security';
    else if (id === 'c104_crypto') logId = 'log_c104_investigator';
    else if (id === 'c105_station_material' || id === 'c105_chronometer') logId = 'log_c105_compiler_axioms';
    else if (id === 'c105_station_signal') logId = 'log_c102_investigator';
    else if (id === 'c105_station_archive') logId = 'log_c105_voss_last_recording';
    else if (id === 'c105_station_security') logId = 'log_c104_investigator';
    else if (id === 'c105_master_compiler') logId = 'log_c105_room_sa_truth';
    else if (id === 'c105_endings_console') logId = 'log_c105_three_paths';

    if (logId) {
      setCampaignSave((prev) => recordLogDiscovered(prev, logId!));
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

    // 2. Anomaly Rule Terminal
    if (
      objectId === 'terminal' ||
      objectId === 'c105_terminal'
    ) {
      playKeystrokeSound();
      if (document.pointerLockElement) {
        document.exitPointerLock?.();
      }
      activateTerminal(true);
      return;
    }

    // 3. Inspection slates & monitors
    if (
      objectId === 'observation_slate' ||
      objectId === 'diagnostic_slate_102' ||
      objectId === 'c103_log' ||
      objectId === 'c104_monitor' ||
      objectId === 'c105_chronometer'
    ) {
      handleInspect(objectId);
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
      }

      if (isUnlocked) {
        playDoorUnlockSound();
        playSuccessChime();

        // Check if there is an inter-chamber narrative transition
        if (['chamber_101', 'chamber_102', 'chamber_103', 'chamber_104'].includes(state.currentRoomId)) {
          pendingDoorInteractionRef.current = objectId;
          setActiveStoryBeatChamber(state.currentRoomId);
          return;
        }
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
      objectId === 'c104_crypto' ||
      objectId.startsWith('c105_relay')
    ) {
      playSuccessChime();
    } else {
      playKeystrokeSound();
    }

    interactWithObject(objectId);
  };

  const handleContinueStoryBeat = () => {
    const pendingObjectId = pendingDoorInteractionRef.current || 'exit_door';
    pendingDoorInteractionRef.current = null;
    setActiveStoryBeatChamber(null);
    setIsTransitioning(true);

    // Dispatch the room transition through the reducer
    interactWithObject(pendingObjectId);

    // Ensure pause menu is cleared
    setIsPauseMenuOpen(false);

    setTimeout(() => {
      setIsTransitioning(false);

      // Re-engage pointer lock on the canvas to restore movement controls.
      // Without this, losing pointer lock during the cinematic overlay
      // triggers handleLockChange(false) which sets isPaused=true,
      // permanently freezing the player.
      requestAnimationFrame(() => {
        const canvas = document.querySelector('canvas');
        if (canvas && !document.pointerLockElement) {
          canvas.requestPointerLock?.();
        }
      });
    }, 600);
  };

  const handleCollectKey = () => {
    playSuccessChime();
    collectItem('brass_key');
  };

  const handleRestart = () => {
    playKeystrokeSound();
    notificationManager.clear();
    restartGame();
  };

  const handleStartNewGame = () => {
    notificationManager.clear();
    resetCampaignSave();
    setCampaignSave(loadCampaignSave());
    restartGame();
    setPhase('briefing');
  };

  const handleContinueGame = () => {
    notificationManager.clear();
    if (campaignSave.currentChamberId && campaignSave.currentChamberId !== state.currentRoomId) {
      selectChamber(campaignSave.currentChamberId);
    }
    setPhase('playing');
  };

  const handleBriefingComplete = () => {
    notificationManager.clear();
    setPhase('playing');
  };

  const handleSelectChamber = (chamberId: string) => {
    notificationManager.clear();
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
    isControlsOpen ||
    state.status === 'escaped' ||
    Boolean(activeStoryBeatChamber);

  return (
    <main className={`app-viewport ${phase === 'playing' ? 'is-playing' : ''}`}>
      {/* 1. Cinematic Opening Screen */}
      {phase === 'cinematic' && (
        <CinematicOpening onComplete={() => setPhase('menu')} />
      )}

      {/* 2. Redesigned Main Menu */}
      {phase === 'menu' && (
        <MainMenu
          hasSaveData={hasSaveData}
          saveData={campaignSave}
          onContinue={handleContinueGame}
          onStartNewGame={handleStartNewGame}
          onOpenControls={() => setIsControlsOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenLogbook={() => setIsLogbookModalOpen(true)}
          onOpenChamberSelect={() => setIsChamberSelectOpen(true)}
          onOpenAbout={() => setIsAboutOpen(true)}
          onReplayIntro={() => setPhase('cinematic')}
        />
      )}

      {/* 3. Opening Story Briefing */}
      {phase === 'briefing' && (
        <StoryBriefing onComplete={handleBriefingComplete} />
      )}

      {/* 4. Full-Viewport First-Person Gameplay (Chambers 101-105) */}
      {phase === 'playing' && (
        <>
          {/* Action Result / Feedback Toast Notification */}
          <FeedbackToast feedback={lastFeedback} />

          {/* Tasteful One-Time Controls Tutorial */}
          {showTutorial && state.currentRoomId === 'chamber_101' && (
            <TutorialOverlay
              onDismiss={() => {
                setShowTutorial(false);
              }}
            />
          )}

          {/* Clean Full-Viewport Game Container */}
          <div className="room-frame room-frame--fullscreen">
            {/* Subtle Minimal Floating HUD: Top-Left Objective, Top-Right Menu Pill */}
            {!isPauseMenuOpen && !isAnyModalOpen && (
              <div className="gameplay-floating-hud">
                {/* Contextual Single Objective Tracker */}
                <ObjectiveHUD state={state} />

                {/* Minimal Unobtrusive Menu Key Pill */}
                <div className="hud-corner-actions">
                  <button
                    type="button"
                    className="hud-esc-pill"
                    onClick={() => {
                      playKeystrokeSound();
                      setIsPauseMenuOpen(true);
                      if (document.pointerLockElement) {
                        document.exitPointerLock?.();
                      }
                    }}
                    title="Pause game [ESC]"
                    aria-label="Pause menu and controls"
                  >
                    <span className="hud-esc-key">ESC</span>
                    <span>MENU</span>
                  </button>
                </div>
              </div>
            )}

            {/* Central 3D Interactive Chamber */}
            <section className="room-viewport-section">
              {viewMode === '3d' ? (
                <ChamberCanvas
                  state={state}
                  onInteract={handleInteract}
                  onInspect={handleInspect}
                  onRestart={handleRestart}
                  muted={muted}
                  onToggleMute={handleToggleMute}
                  isExternalModalOpen={isAnyModalOpen}
                  isForcePaused={isPauseMenuOpen}
                  onTogglePause={setIsPauseMenuOpen}
                  onOpenHints={() => setIsHintModalOpen(true)}
                  onOpenLogbook={() => setIsLogbookModalOpen(true)}
                  onOpenSettings={() => setIsSettingsOpen(true)}
                  onOpenChamberSelect={() => setIsChamberSelectOpen(true)}
                  onReturnToMenu={() => {
                    setIsPauseMenuOpen(false);
                    setPhase('menu');
                  }}
                />
              ) : (
                <RoomView
                  state={state}
                  onInteract={handleInteract}
                  onInspect={handleInspect}
                  onCollectKey={handleCollectKey}
                />
              )}
            </section>

            {/* Screen Reader & Automated Test Auxiliary Controls */}
            <div className="hud-accessible-only" aria-hidden="false">
              <h1>ROOM S A</h1>
              <span>{getChamberHeaderLabel(state.currentRoomId)}</span>
              {/* Object interaction buttons — only needed for 3D mode (schematic RoomView has its own) */}
              {viewMode === '3d' && (
                <>
                  <button
                    type="button"
                    onClick={handleCollectKey}
                    aria-label="Machined Brass Key"
                  >
                    Collect Key
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInteract('exit_door')}
                    aria-label="Reinforced Blast Door: Locked"
                  >
                    Operate Door
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInspect('observation_slate')}
                    aria-label="Observation Slate: Wall"
                  >
                    Inspect Slate
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={() => activateTerminal(true)}
                aria-label="Open Terminal"
              >
                Open Terminal
              </button>
              <button
                type="button"
                onClick={handleRestart}
                aria-label="Restart Chamber"
              >
                Restart Chamber
              </button>
              <button
                type="button"
                onClick={() => setIsHintModalOpen(true)}
                aria-label="Open Progressive Hints"
              >
                Open Progressive Hints
              </button>
              <button
                type="button"
                onClick={() => setIsLogbookModalOpen(true)}
                aria-label="Open Telemetry Logbook"
              >
                Open Telemetry Logbook
              </button>
              <button
                type="button"
                onClick={() => setIsSettingsOpen(true)}
                aria-label="Open Settings"
              >
                Open Settings
              </button>
              <button
                type="button"
                onClick={() => setIsAboutOpen(true)}
                aria-label="Open About"
              >
                Open About
              </button>
              <button
                type="button"
                onClick={() => setIsChamberSelectOpen(true)}
                aria-label="Open Chamber Selection"
              >
                Open Chamber Selection
              </button>
              <button
                type="button"
                onClick={() => setPhase('menu')}
                aria-label="Return to Title Screen"
              >
                Return to Title Screen
              </button>
              <div aria-label="Player Inventory">
                <span>{state.inventory.length}/3</span>
                {state.inventory.map((item) => (
                  <span key={item.id}>{item.name}</span>
                ))}
              </div>
              <div aria-label="Active Rule">
                {activeRule?.statement ?? 'Doors yield only to copper keys'}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Controls Reference Modal */}
      <ControlsModal
        isOpen={isControlsOpen}
        onClose={() => setIsControlsOpen(false)}
      />

      {/* Progressive Hint Modal */}
      <HintModal
        isOpen={isHintModalOpen}
        objective={getActiveObjective(state)}
        onClose={() => setIsHintModalOpen(false)}
      />

      {/* Case File / Logbook Lore Modal */}
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
          setPhase('menu');
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
          setIsPauseMenuOpen(false);
          const canvas = document.querySelector('canvas');
          if (canvas) {
            canvas.requestPointerLock?.();
          }
        }}
        onSubmitProposal={submitRuleProposal}
      />

      {/* Victory Escape Sequence Overlay */}
      <VictoryOverlay
        isOpen={state.status === 'escaped'}
        chosenEnding={state.chamber105?.chosenEnding ?? 'rewrite'}
        onRestart={() => {
          restartGame();
          setPhase('menu');
        }}
        onReturnToMenu={() => {
          setPhase('menu');
        }}
      />

      {/* Automatic Cinematic Chamber Transition Overlay */}
      {activeStoryBeatChamber && (
        <CinematicTransition
          completedRoomId={activeStoryBeatChamber}
          onTransitionComplete={handleContinueStoryBeat}
        />
      )}

      {/* Screen fade overlay for chamber scene loading */}
      {isTransitioning && <div className="chamber-transition-overlay" aria-hidden="true" />}
    </main>
  );
};

export default App;
