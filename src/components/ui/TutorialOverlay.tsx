import React, { useState, useEffect } from 'react';
import { Compass } from 'lucide-react';
import { GameState } from '../../game/types';
import { soundManager } from '../../services/audio/soundManager';
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
      // Completed tutorial
      onDismiss();
    }
  }, [step, hasMoved, state.inspectedObjectIds, state.inventory, state.rules, state.exit.isLocked, onDismiss]);

  if (!isActive) return null;

  const renderInstruction = () => {
    switch (step) {
      case 1:
        return 'Movement: Use [W, A, S, D] or Arrow Keys to move. Hold [Shift] to sprint.';
      case 2:
        return 'Observation: Look at the wall slate and press [R] to inspect handwritten evidence.';
      case 3:
        return 'Collection: Approach the central pedestal and press [E] to collect Brass Key #101.';
      case 4:
        return 'Rule Override: Approach the terminal on the right wall and rewrite Rule #01.';
      case 5:
        return 'Escape: Walk to the blast door and press [E] with your key to unlock the exit.';
      default:
        return 'Investigate the room and escape.';
    }
  };

  return (
    <div className="tutorial-banner" role="complementary" aria-label="Training Guide">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
        <div className="tutorial-step-label">TRAINING GUIDE // STEP {step} OF 5</div>
        <Compass size={13} color="var(--color-cyan-primary)" />
      </div>
      <p className="tutorial-instruction">{renderInstruction()}</p>
      <button
        type="button"
        className="tutorial-skip-btn"
        onClick={() => {
          soundManager.playKeystroke();
          onDismiss();
        }}
      >
        Dismiss training guide
      </button>
    </div>
  );
};
