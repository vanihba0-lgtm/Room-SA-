import React from 'react';
import { Info, X, ShieldCheck } from 'lucide-react';
import { soundManager } from '../../services/audio/soundManager';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop-generic"
      role="dialog"
      aria-modal="true"
      aria-labelledby="about-modal-title"
    >
      <div className="modal-card-medium" style={{ maxWidth: '520px' }}>
        <div className="modal-header-row">
          <div className="modal-title-group">
            <Info size={20} color="var(--color-cyan-primary)" />
            <h2 id="about-modal-title" className="modal-title-text">
              About ROOM S A: The Room That Lies
            </h2>
          </div>
          <button
            type="button"
            className="btn-close-icon"
            onClick={() => {
              soundManager.playKeystroke();
              onClose();
            }}
            aria-label="Close about dialog"
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', lineHeight: 'var(--line-height-relaxed)' }}>
          <p>
            <strong style={{ color: 'var(--color-text-primary)' }}>ROOM S A</strong> is a first-person 3D science-fiction puzzle simulation mystery.
            Trapped in an unmonitored diagnostic facility run by the Architect, you discover that the official world rules governing reality are incomplete and deliberately falsified.
          </p>
          <p>
            By examining physical evidence, correlating anomalies, and accessing logic terminals, you deduce the hidden truth and rewrite the simulation's rules to escape through five increasingly intricate chambers.
          </p>

          <div style={{ background: 'var(--color-bg-surface)', padding: '12px 14px', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--color-cyan-primary)' }}>
            <div style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-primary)', marginBottom: '4px' }}>
              Architectural Design & Philosophy
            </div>
            <div>
              • Deterministic Rule Engine with pure state transitions.<br />
              • Low-latency synthesized Web Audio soundscapes.<br />
              • Authentic 3D FPS interaction with pointer lock controls and tactical 2D map fallback.<br />
              • Five unique chambers culminating in the Rule Engine finale.
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-cyan-primary)', fontSize: 'var(--font-size-2xs)' }}>
            <ShieldCheck size={14} />
            <span>Built with React 19, TypeScript, Three.js, React Three Fiber & Rapier.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
