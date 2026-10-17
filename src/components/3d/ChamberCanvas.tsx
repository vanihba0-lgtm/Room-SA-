import React, { useState, Suspense, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { ChamberScene } from './ChamberScene';
import { CrosshairHUD } from './CrosshairHUD';
import { PauseControlsModal } from './PauseControlsModal';
import { TouchControlsOverlay, TouchInputState } from './TouchControlsOverlay';
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

  // Device & input detection: check touch capability without breaking hybrid laptops
  const [isTouchDevice, setIsTouchDevice] = useState(() => {
    if (typeof window === 'undefined') return false;
    return (
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      (window.matchMedia && window.matchMedia('(pointer: coarse)').matches)
    );
  });

  useEffect(() => {
    const handleTouchDetect = () => {
      setIsTouchDevice(true);
    };
    window.addEventListener('touchstart', handleTouchDetect, { passive: true, once: true });
    return () => window.removeEventListener('touchstart', handleTouchDetect);
  }, []);

  const effectivePaused = isForcePaused || isPaused;

  // Shared semantic touch input state passed to R3F frame loop via ref to avoid re-renders
  const touchInputRef = useRef<TouchInputState>({
    move: { x: 0, y: 0 },
    look: { deltaX: 0, deltaY: 0 },
    jumpRequested: false,
  });

  const handleTouchInputUpdate = (input: TouchInputState) => {
    touchInputRef.current = input;
  };

  // Reset internal pause state when room changes (e.g. after cinematic transition)
  // This prevents the player from being stuck in a paused state after a chamber transition
  const prevRoomRef = useRef(state.currentRoomId);
  useEffect(() => {
    if (prevRoomRef.current !== state.currentRoomId) {
      prevRoomRef.current = state.currentRoomId;
      setIsPaused(false);
      onTogglePause?.(false);
    }
  }, [state.currentRoomId, onTogglePause]);

  const activeRule = state.rules['RULE_01'];
  const hasBrassKey = state.inventory.some((item) => item.id === 'brass_key');
  const activeObjective = getActiveObjective(state);

  // Global Escape key listener to toggle pause
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape' && !isExternalModalOpen && !state.terminalOpen) {
        setIsPaused((prev) => !prev);
        onTogglePause?.(!effectivePaused);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isExternalModalOpen, state.terminalOpen, effectivePaused, onTogglePause]);

  const hasLockedRef = useRef(false);

  const handleLockChange = (locked: boolean) => {
    setIsLocked(locked);
    if (!locked) {
      // Only pause on lock loss if pointer lock was actively engaged in desktop mouse mode
      if (hasLockedRef.current && !isTouchDevice) {
        setIsPaused(true);
        onTogglePause?.(true);
      }
    } else {
      hasLockedRef.current = true;
      setIsPaused(false);
      onTogglePause?.(false);
    }
  };

  const handleResume = () => {
    setIsPaused(false);
    onTogglePause?.(false);
    // Request pointer lock on the canvas element on desktop
    if (!isTouchDevice) {
      const canvas = document.querySelector('canvas');
      if (canvas) {
        canvas.requestPointerLock?.();
      }
    }
  };

  // Performance Phase 4: Cap DPR conservatively on mobile to prevent GPU thermal throttling
  const dprCap: [number, number] = [1, isTouchDevice ? 1.5 : 2];

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
          dpr={dprCap}
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
            touchInputRef={touchInputRef}
            isTouchDevice={isTouchDevice}
          />
        </Canvas>
      </Suspense>

      {/* Crosshair & Contextual Target Prompts (visible on desktop locked, or active mobile play) */}
      <CrosshairHUD
        target={hoverTarget}
        isLocked={!effectivePaused && !isExternalModalOpen && (isLocked || isTouchDevice)}
      />

      {/* Touch Control Overlay for Mobile / Touchscreen Devices */}
      {isTouchDevice && !effectivePaused && !state.terminalOpen && state.status !== 'escaped' && !isExternalModalOpen && (
        <TouchControlsOverlay
          onInputUpdate={handleTouchInputUpdate}
          hoverTarget={hoverTarget}
          onInteract={onInteract}
          onInspect={onInspect}
          onOpenMenu={() => {
            setIsPaused(true);
            onTogglePause?.(true);
          }}
          isPaused={effectivePaused || isExternalModalOpen}
          carriedObjectId={state.carriedObjectId}
        />
      )}

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
