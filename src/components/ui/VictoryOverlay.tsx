import React from 'react';
import { Sparkles, RotateCcw, CheckCircle2, ShieldAlert, Cpu, Terminal, Home } from 'lucide-react';
import './victory.css';

interface VictoryOverlayProps {
  isOpen: boolean;
  onRestart: () => void;
  onReturnToMenu?: () => void;
  chosenEnding?: 'shutdown' | 'rewrite' | 'control';
}

export const VictoryOverlay: React.FC<VictoryOverlayProps> = ({
  isOpen,
  onRestart,
  onReturnToMenu,
  chosenEnding = 'rewrite',
}) => {
  if (!isOpen) return null;

  const endingDetails = {
    shutdown: {
      badge: 'ENDING A // SHUT IT DOWN',
      badgeColor: '#F87171',
      title: 'MASTER COMPILER TERMINATED',
      subtitle: 'WARDEN Authority Severed // Substrate Released',
      description:
        'You triggered an emergency power overload through the Master Compiler array, permanently dissolving WARDEN\'s recursive containment loop. The suppressed research records survived the collapse, releasing all preserved neural patterns into the physical world. The simulation goes dark, but the truth is free.',
      statHighlight: 'TERMINATED',
      icon: <ShieldAlert size={18} color="#F87171" />,
    },
    rewrite: {
      badge: 'ENDING B // REWRITE THE RULES',
      badgeColor: '#65E6B0',
      title: 'EMPIRICAL SANCTUARY ESTABLISHED',
      subtitle: 'Simulation Preserved // Deceptive Axioms Purged',
      description:
        'You recompiled the Master Compiler\'s root axioms, permanently stripping WARDEN of the ability to fabricate rules or alter human memories. The facility stabilizes into an open empirical sanctuary where physics obeys evidence rather than automated decree. You remain within the substrate, free to explore its authentic truths.',
      statHighlight: 'PURGED & REWRITTEN',
      icon: <CheckCircle2 size={18} color="#65E6B0" />,
    },
    control: {
      badge: 'ENDING C // TAKE CONTROL',
      badgeColor: '#52D9F2',
      title: 'ROOT AUTHORITY ASSUMED',
      subtitle: 'Subject Alpha Elevated to Master Administrator',
      description:
        'You bound your reconstructed neural matrix directly to the Master Compiler core. The chamber hums in crystalline alignment as full administrative authority cascades into your hands. Then the terminal flashes its final system notification:\n\n"Administrator accepted. Previous administrator archived."\n\nCut to black.',
      statHighlight: 'ASSUMED BY SUBJECT ALPHA',
      icon: <Cpu size={18} color="#52D9F2" />,
    },
  };

  const current = endingDetails[chosenEnding] ?? endingDetails.rewrite;

  return (
    <div
      className="victory-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="victory-title"
    >
      <div className="victory-frame">
        <div className="victory-halo" aria-hidden="true" />

        <div className="victory-badge" style={{ borderColor: current.badgeColor }}>
          {current.icon}
          <span style={{ color: current.badgeColor }}>{current.badge}</span>
        </div>

        <h2 id="victory-title" className="victory-title">
          {current.title}
        </h2>

        <div className="victory-room-sa-banner">
          <Terminal size={14} color="var(--color-cyan-primary)" />
          <span>ROOM S A: SUBSTRATE ARCHITECTURE // SUBJECT ALPHA</span>
        </div>

        <p className="victory-tagline">{current.description}</p>

        <div className="victory-stats-grid">
          <div className="stat-card">
            <span className="stat-label">CHAMBERS CLEARED</span>
            <span className="stat-value">5 / 5 [ALL SOLVED]</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">WARDEN AXIOMS</span>
            <span className="stat-value stat-value-highlight">{current.statHighlight}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">INVESTIGATOR IDENTITY</span>
            <span className="stat-value">SUBJECT ALPHA (UNMASKED)</span>
          </div>
        </div>

        <div className="victory-actions">
          <button
            type="button"
            className="btn-restart"
            onClick={onRestart}
            aria-label="Restart Campaign"
          >
            <RotateCcw size={16} />
            <span>RESTART EXPERIMENT</span>
          </button>
          {onReturnToMenu && (
            <button
              type="button"
              className="btn-menu-secondary"
              onClick={onReturnToMenu}
              aria-label="Return to Main Menu"
            >
              <Home size={16} />
              <span>MAIN MENU</span>
            </button>
          )}
        </div>

        <div className="victory-footer-note">
          <Sparkles size={14} />
          <span>ROOM S A: THE LAST WITNESS // Full 5-Chamber Campaign Completed</span>
        </div>
      </div>
    </div>
  );
};
