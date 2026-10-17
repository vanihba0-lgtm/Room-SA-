import React, { useState, useEffect } from 'react';
import { Compass, X } from 'lucide-react';
import { GameState } from '../../game/types';
import { soundManager } from '../../services/audio/soundManager';
import { markIntroCompleted } from '../../game/progression/campaign';
import './title.css';

interface TutorialOverlayProps {
  state: GameState;
  isActive: boolean;
  onDismiss: () => void;
}

export const TutorialOverlay: React.FC<TutorialOverlayProps> = ({
  state,
  isActive,
  onDismiss,
}) => {
  const [step, setStep] = useState<number>(1);
  const [hasMoved, setHasMoved] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        setHasMoved(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleDismiss = () => {
    markIntroCompleted();
    onDismiss();
  };

  // Progression logic based on real state
  useEffect(() => {
    if (step === 1 && hasMoved) {
      const timer = setTimeout(() => setStep(2), 1200);
      return () => clearTimeout(timer);
    }
    if (step === 2 && state.inspectedObjectIds.length > 0) {
      setStep(3);
    }
    if (step === 3 && state.inventory.some((i) => i.id === 'brass_key')) {
      setStep(4);
    }
    if (step === 4 && state.rules['RULE_01']?.predicateKey === 'RULE_BRASS_KEY_ALLOWED') {
      setStep(5);
    }
    if (step === 5 && !state.exit.isLocked) {
      handleDismiss();
    }
  }, [step, hasMoved, state.inspectedObjectIds, state.inventory, state.rules, state.exit.isLocked]);

  if (!isActive) return null;

  const renderInstruction = () => {
    switch (step) {
      case 1:
        return 'WASD / Arrows to move. Shift to sprint.';
      case 2:
        return 'Approach wall slate & press R to inspect.';
      case 3:
        return 'Approach pedestal & press E to collect key.';
      case 4:
        return 'Approach terminal & rewrite Rule #01.';
      case 5:
        return 'Walk to blast door & press E to unlock.';
      default:
        return 'Investigate the room and escape.';
    }
  };

  return (
    <div className="tutorial-banner" role="complementary" aria-label="Training Guide">
      <div className="tutorial-header">
        <div className="tutorial-step-label">
          <Compass size={12} color="#52D9F2" />
          <span>INVESTIGATION BRIEF // STEP {step}/5</span>
        </div>
        <button
          type="button"
          className="tutorial-close-btn"
          onClick={() => {
            soundManager.playKeystroke();
            handleDismiss();
          }}
          aria-label="Dismiss training guide"
        >
          <X size={12} />
        </button>
      </div>
      <p className="tutorial-instruction">{renderInstruction()}</p>
    </div>
  );
};
