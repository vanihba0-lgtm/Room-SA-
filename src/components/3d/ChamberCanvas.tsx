import React, { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { ChamberScene } from './ChamberScene';
import { CrosshairHUD } from './CrosshairHUD';
import { PauseControlsModal } from './PauseControlsModal';
import { InteractionTargetInfo } from './PlayerController';
import { GameState } from '../../game/types';
import { getActiveObjective } from '../../game/progression/objectives';
import './styles/chamber3d.css';

interface ChamberCanvasProps {
  state: GameState;
  onInteract: (objectId: string) => void;
  onInspect: (objectId: string) => void;
  onRestart: () => void;
  muted: boolean;
  onToggleMute: () => void;
  isExternalModalOpen?: boolean;
  isForcePaused?: boolean;
  onTogglePause?: (paused: boolean) => void;
  onOpenHints?: () => void;
  onOpenLogbook?: () => void;
  onOpenSettings?: () => void;
  onOpenChamberSelect?: () => void;
  onReturnToMenu?: () => void;
}

export const ChamberCanvas: React.FC<ChamberCanvasProps> = ({
  state,
  onInteract,
  onInspect,
  onRestart,
  muted,
  onToggleMute,
  isExternalModalOpen = false,
  isForcePaused = false,
  onTogglePause,
  onOpenHints,
  onOpenLogbook,
  onOpenSettings,
  onOpenChamberSelect,
  onReturnToMenu,
}) => {
  const [isLocked, setIsLocked] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [hoverTarget, setHoverTarget] = useState<InteractionTargetInfo | null>(null);

  const effectivePaused = isForcePaused || isPaused;

  const activeRule = state.rules['RULE_01'];
  const hasBrassKey = state.inventory.some((item) => item.id === 'brass_key');
  const activeObjective = getActiveObjective(state);

  // Global Escape key listener to toggle pause
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape' && !isExternalModalOpen && !state.terminalOpen) {
        setIsPaused((prev) => !prev);
        onTogglePause?.(!effectivePaused);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isExternalModalOpen, state.terminalOpen, effectivePaused, onTogglePause]);

  const handleLockChange = (locked: boolean) => {
    setIsLocked(locked);
    if (!locked) {
      setIsPaused(true);
      onTogglePause?.(true);
    } else {
      setIsPaused(false);
      onTogglePause?.(false);
    }
  };

  const handleResume = () => {
    setIsPaused(false);
    onTogglePause?.(false);
    // Request pointer lock on the canvas element
    const canvas = document.querySelector('canvas');
    if (canvas) {
      canvas.requestPointerLock?.();
    }
  };

  return (
    <div className="chamber-3d-viewport">
      <Suspense
        fallback={
          <div className="webgl-fallback-container">
            <h3 className="webgl-fallback-title">INITIALIZING 3D CONTAINMENT CHAMBER...</h3>
            <p>Loading shaders and physics matrix...</p>
          </div>
        }
      >
        <Canvas
          className="chamber-canvas-element"
          style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
          camera={{ position: [0, 1.7, 3.5], fov: 65, near: 0.1, far: 50 }}
          shadows
          gl={{
            antialias: true,
            powerPreference: 'default',
            preserveDrawingBuffer: true,
          }}
        >
          <ChamberScene
            state={state}
            isPaused={effectivePaused || state.terminalOpen || state.status === 'escaped' || isExternalModalOpen}
            onLockChange={handleLockChange}
            onInteract={onInteract}
            onInspect={onInspect}
            onHoverTarget={setHoverTarget}
          />
        </Canvas>
      </Suspense>

      {/* Crosshair & Contextual Target Prompts */}
      <CrosshairHUD target={hoverTarget} isLocked={isLocked && !effectivePaused && !isExternalModalOpen} />

      {/* Full Pause Menu */}
      <PauseControlsModal
        isOpen={effectivePaused && !state.terminalOpen && state.status !== 'escaped' && !isExternalModalOpen}
        onResume={handleResume}
        onRestart={onRestart}
        muted={muted}
        onToggleMute={onToggleMute}
        ruleStatement={activeRule?.statement ?? ''}
        isRuleDeceptive={activeRule?.isDeceptive ?? false}
        hasKey={hasBrassKey}
        currentRoomId={state.currentRoomId}
        activeObjective={activeObjective}
        onOpenHints={onOpenHints}
        onOpenLogbook={onOpenLogbook}
        onOpenSettings={onOpenSettings}
        onOpenChamberSelect={onOpenChamberSelect}
        onReturnToMenu={onReturnToMenu}
      />
    </div>
  );
};
