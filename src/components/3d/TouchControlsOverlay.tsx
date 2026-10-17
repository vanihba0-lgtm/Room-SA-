import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Hand, Eye, ArrowUp, Menu } from 'lucide-react';
import { InteractionTargetInfo } from './PlayerController';
import { soundManager } from '../../services/audio/soundManager';
import './styles/touchControls.css';

export interface TouchInputState {
  move: { x: number; y: number }; // x: -1 (left) to 1 (right), y: -1 (backward) to 1 (forward)
  look: { deltaX: number; deltaY: number };
  jumpRequested: boolean;
}

interface TouchControlsOverlayProps {
  onInputUpdate: (input: TouchInputState) => void;
  hoverTarget: InteractionTargetInfo | null;
  onInteract: (targetId: string) => void;
  onInspect: (targetId: string) => void;
  onOpenMenu: () => void;
  isPaused: boolean;
  carriedObjectId?: string | null;
}

export const TouchControlsOverlay: React.FC<TouchControlsOverlayProps> = ({
  onInputUpdate,
  hoverTarget,
  onInteract,
  onInspect,
  onOpenMenu,
  isPaused,
  carriedObjectId,
}) => {
  // Joystick state
  const joystickBaseRef = useRef<HTMLDivElement>(null);
  const joystickPointerId = useRef<number | null>(null);
  const joystickOrigin = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [knobPos, setKnobPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isJoystickActive, setIsJoystickActive] = useState(false);

  // Look zone state
  const lookZoneRef = useRef<HTMLDivElement>(null);
  const lookPointerId = useRef<number | null>(null);
  const lookLastPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Accumulated input state
  const currentInputRef = useRef<TouchInputState>({
    move: { x: 0, y: 0 },
    look: { deltaX: 0, deltaY: 0 },
    jumpRequested: false,
  });

  const MAX_RADIUS = 50; // Maximum joystick drag distance in pixels
  const DEADZONE = 0.12;  // Deadzone fraction

  // Flush input updates to parent
  const syncInput = useCallback(() => {
    onInputUpdate({
      move: { ...currentInputRef.current.move },
      look: { ...currentInputRef.current.look },
      jumpRequested: currentInputRef.current.jumpRequested,
    });
    // Look delta is consumed per frame
    currentInputRef.current.look.deltaX = 0;
    currentInputRef.current.look.deltaY = 0;
    currentInputRef.current.jumpRequested = false;
  }, [onInputUpdate]);

  // Reset all touch inputs on pause or unmount
  const resetAllInputs = useCallback(() => {
    joystickPointerId.current = null;
    lookPointerId.current = null;
    setKnobPos({ x: 0, y: 0 });
    setIsJoystickActive(false);
    currentInputRef.current.move = { x: 0, y: 0 };
    currentInputRef.current.look = { deltaX: 0, deltaY: 0 };
    currentInputRef.current.jumpRequested = false;
    onInputUpdate({
      move: { x: 0, y: 0 },
      look: { deltaX: 0, deltaY: 0 },
      jumpRequested: false,
    });
  }, [onInputUpdate]);

  useEffect(() => {
    if (isPaused) {
      resetAllInputs();
    }
  }, [isPaused, resetAllInputs]);

  // Handle window level pointer cancellation and focus loss
  useEffect(() => {
    const handleGlobalCancel = () => {
      resetAllInputs();
    };

    window.addEventListener('pointercancel', handleGlobalCancel);
    window.addEventListener('blur', handleGlobalCancel);
    window.addEventListener('orientationchange', handleGlobalCancel);

    return () => {
      window.removeEventListener('pointercancel', handleGlobalCancel);
      window.removeEventListener('blur', handleGlobalCancel);
      window.removeEventListener('orientationchange', handleGlobalCancel);
    };
  }, [resetAllInputs]);

  // -------------------------------------------------------------
  // Virtual Joystick Handlers
  // -------------------------------------------------------------
  const handleJoystickPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isPaused) return;
    if (joystickPointerId.current !== null) return; // Already tracking a pointer

    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    joystickPointerId.current = e.pointerId;
    joystickOrigin.current = { x: centerX, y: centerY };
    setIsJoystickActive(true);

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Ignore if pointer capture fails
    }

    handleJoystickMove(e.clientX, e.clientY);
  };

  const handleJoystickMove = (clientX: number, clientY: number) => {
    const dx = clientX - joystickOrigin.current.x;
    const dy = clientY - joystickOrigin.current.y;
    const distance = Math.hypot(dx, dy);

    let clampedDist = distance;
    let clampedX = dx;
    let clampedY = dy;

    if (distance > MAX_RADIUS) {
      clampedDist = MAX_RADIUS;
      clampedX = (dx / distance) * MAX_RADIUS;
      clampedY = (dy / distance) * MAX_RADIUS;
    }

    setKnobPos({ x: clampedX, y: clampedY });

    // Calculate normalized movement vector with deadzone
    const normDist = clampedDist / MAX_RADIUS;
    if (normDist < DEADZONE) {
      currentInputRef.current.move = { x: 0, y: 0 };
    } else {
      const rescale = (normDist - DEADZONE) / (1 - DEADZONE);
      const angle = Math.atan2(dy, dx);
      // y is inverted in screen space: moving down is negative forward (backward)
      const nx = Math.cos(angle) * rescale;
      const ny = -Math.sin(angle) * rescale; // Up is forward
      currentInputRef.current.move = { x: nx, y: ny };
    }

    syncInput();
  };

  const handleJoystickPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerId !== joystickPointerId.current) return;
    handleJoystickMove(e.clientX, e.clientY);
  };

  const handleJoystickPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerId !== joystickPointerId.current) return;
    joystickPointerId.current = null;
    setKnobPos({ x: 0, y: 0 });
    setIsJoystickActive(false);
    currentInputRef.current.move = { x: 0, y: 0 };
    syncInput();

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignore if pointer capture release fails
    }
  };

  // -------------------------------------------------------------
  // Touch Look Zone Handlers
  // -------------------------------------------------------------
  const handleLookPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isPaused) return;
    if (lookPointerId.current !== null) return;

    lookPointerId.current = e.pointerId;
    lookLastPos.current = { x: e.clientX, y: e.clientY };

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Ignore
    }
  };

  const handleLookPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerId !== lookPointerId.current) return;

    const dx = e.clientX - lookLastPos.current.x;
    const dy = e.clientY - lookLastPos.current.y;
    lookLastPos.current = { x: e.clientX, y: e.clientY };

    // Accumulate look delta
    currentInputRef.current.look.deltaX += dx;
    currentInputRef.current.look.deltaY += dy;

    syncInput();
  };

  const handleLookPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerId !== lookPointerId.current) return;
    lookPointerId.current = null;

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignore
    }
  };

  // Jump trigger
  const handleJump = () => {
    if (isPaused) return;
    soundManager.playKeystroke();
    currentInputRef.current.jumpRequested = true;
    syncInput();
  };

  const hasInteractTarget = Boolean(hoverTarget) || Boolean(carriedObjectId);
  const interactActionLabel = hoverTarget?.actionText || (carriedObjectId ? 'Drop Carried Object' : 'Interact');

  return (
    <div className="mobile-touch-overlay" aria-hidden="false">
      {/* 1. Virtual Joystick Zone (Bottom-Left) */}
      <div
        ref={joystickBaseRef}
        className={`touch-joystick-zone ${isJoystickActive ? 'active' : ''}`}
        onPointerDown={handleJoystickPointerDown}
        onPointerMove={handleJoystickPointerMove}
        onPointerUp={handleJoystickPointerUp}
        onPointerCancel={handleJoystickPointerUp}
        aria-label="Virtual movement joystick"
      >
        <div className="joystick-base">
          <div
            className="joystick-knob"
            style={{
              transform: `translate3d(${knobPos.x}px, ${knobPos.y}px, 0)`,
            }}
          />
        </div>
        <span className="joystick-label">MOVE</span>
      </div>

      {/* 2. Look Drag Zone (Right half of screen, avoiding buttons) */}
      <div
        ref={lookZoneRef}
        className="touch-look-zone"
        onPointerDown={handleLookPointerDown}
        onPointerMove={handleLookPointerMove}
        onPointerUp={handleLookPointerUp}
        onPointerCancel={handleLookPointerUp}
        aria-label="Drag here to look around"
      >
        <span className="look-hint">DRAG TO LOOK</span>
      </div>

      {/* 3. Action Buttons Cluster (Bottom-Right) */}
      <div className="touch-actions-cluster">
        {/* Contextual Interact Button */}
        {hasInteractTarget && (
          <button
            type="button"
            className="btn-touch-action btn-touch-interact"
            onClick={() => {
              if (hoverTarget) {
                soundManager.playKeystroke();
                onInteract(hoverTarget.id);
              } else if (carriedObjectId) {
                soundManager.playKeystroke();
                onInteract(carriedObjectId);
              }
            }}
            aria-label={interactActionLabel}
          >
            <Hand size={20} className="action-btn-icon" />
            <span className="action-btn-label">{interactActionLabel}</span>
          </button>
        )}

        {/* Contextual Inspect Button (if target has inspect data) */}
        {hoverTarget && hoverTarget.inspectText && (
          <button
            type="button"
            className="btn-touch-action btn-touch-inspect"
            onClick={() => {
              soundManager.playKeystroke();
              onInspect(hoverTarget.id);
            }}
            aria-label="Inspect target"
          >
            <Eye size={18} className="action-btn-icon" />
            <span className="action-btn-label">Inspect</span>
          </button>
        )}

        {/* Jump Button */}
        <button
          type="button"
          className="btn-touch-action btn-touch-jump"
          onClick={handleJump}
          aria-label="Jump"
        >
          <ArrowUp size={20} className="action-btn-icon" />
          <span className="action-btn-label">JUMP</span>
        </button>
      </div>

      {/* 4. Mobile Top-Right Pause/Menu Button */}
      <button
        type="button"
        className="btn-mobile-menu-pill"
        onClick={() => {
          soundManager.playKeystroke();
          onOpenMenu();
        }}
        aria-label="Open pause menu"
      >
        <Menu size={16} />
        <span>MENU</span>
      </button>
    </div>
  );
};
