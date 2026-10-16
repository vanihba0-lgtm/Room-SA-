import React, { useEffect, useState } from 'react';
import { KeyRound, Terminal, FileText, Lock, Unlock, Eye } from 'lucide-react';
import { GameState, ObjectId } from '../../game/types';
import './room.css';

interface RoomViewProps {
  state: GameState;
  onInteract: (objectId: ObjectId) => void;
  onInspect: (objectId: ObjectId) => void;
  onCollectKey: () => void;
}

export const RoomView: React.FC<RoomViewProps> = ({
  state,
  onInteract,
  onInspect,
  onCollectKey,
}) => {
  const [isShifting, setIsShifting] = useState(false);

  // Trigger reality-shift effect when realityShiftCount increments
  useEffect(() => {
    if (state.realityShiftCount > 0) {
      setIsShifting(true);
      const timer = setTimeout(() => setIsShifting(false), 800);
      return () => clearTimeout(timer);
    }
  }, [state.realityShiftCount]);

  const hasKey = state.inventory.some((i) => i.id === 'brass_key');
  const isDoorUnlocked = !state.exit.isLocked;
  const isBrassRuleActive =
    state.rules['RULE_01']?.predicateKey === 'RULE_BRASS_KEY_ALLOWED';

  return (
    <div
      className={`room-canvas ${isShifting ? 'reality-shift-active' : ''}`}
      aria-label="Chamber 101 Interior View"
    >
      {/* Perspective Architectural Geometry */}
      <div className="chamber-geometry" aria-hidden="true">
        <div className="wall-left" />
        <div className="wall-right" />
        <div className="ceiling-beam" />
        <div className="floor-perspective-grid" />
        <div className="atmospheric-ambient-dust" />
      </div>

      {/* Reality Shift Shockwave Overlay */}
      {isShifting && <div className="reality-shockwave" aria-hidden="true" />}

      {/* ======================================================== */}
      {/* 1. Blast Door Hotspot (Center Back)                      */}
      {/* ======================================================== */}
      <section
        className={`hotspot hotspot-door ${isDoorUnlocked ? 'door-unlocked' : 'door-locked'} ${
          isBrassRuleActive && !isDoorUnlocked ? 'door-ready' : ''
        }`}
        style={{ left: '50%', top: '34%' }}
      >
        <button
          type="button"
          className="door-frame-btn"
          onClick={() => onInteract('exit_door')}
          aria-label={
            isDoorUnlocked
              ? 'Reinforced Blast Door: Unlocked. Click to enter Chamber 102.'
              : isBrassRuleActive
              ? 'Reinforced Blast Door: Ready. Plaque reads ALL ALLOY VARIANTS RECOGNIZED. Click with Brass Key to unlock.'
              : 'Reinforced Blast Door: Locked. Plaque reads ONLY COPPER OPERATES THIS MECHANISM.'
          }
        >
          <div className="door-arch">
            {/* Status Beacon */}
            <div className="door-beacon">
              {isDoorUnlocked ? (
                <Unlock size={18} className="beacon-icon beacon-green" />
              ) : (
                <Lock size={18} className="beacon-icon beacon-amber" />
              )}
              <span className="beacon-text">
                {isDoorUnlocked ? 'ACCESS AUTHORIZED' : isBrassRuleActive ? 'READY FOR KEY' : 'SEALED // RULE #1'}
              </span>
            </div>

            {/* Door Panel Graphic */}
            <div className="door-panel">
              {isDoorUnlocked ? (
                <div className="door-void-portal">
                  <div className="void-light-beam" />
                  <span className="void-text">CORRIDOR 102</span>
                </div>
              ) : (
                <div className="door-heavy-plates">
                  <div className="door-seam-v" />
                  <div className="door-clamp clamp-top" />
                  <div className="door-clamp clamp-bottom" />
                  <div className="door-plaque">
                    <span className="plaque-subtext">SUBSTRATE ENFORCEMENT</span>
                    <span className="plaque-maintext">
                      {isBrassRuleActive
                        ? 'ALL ALLOY VARIANTS RECOGNIZED'
                        : 'ONLY COPPER OPERATES THIS MECHANISM'}
                    </span>
                  </div>
                  <div className="door-key-slot">
                    <div className={`keyhole-glow ${isBrassRuleActive ? 'glow-active' : ''}`} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </button>

        {/* Action inspect pill */}
        <div className="hotspot-action-pill">
          <button
            type="button"
            className="btn-inspect-pill"
            onClick={(e) => {
              e.stopPropagation();
              onInspect('exit_door');
            }}
            aria-label="Inspect blast door"
          >
            <Eye size={12} />
            <span>INSPECT DOOR</span>
          </button>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 2. Observation Slate (Left Wall)                        */}
      {/* ======================================================== */}
      <section
        className="hotspot hotspot-slate"
        style={{ left: '16%', top: '50%' }}
      >
        <button
          type="button"
          className="slate-btn"
          onClick={() => onInteract('observation_slate')}
          aria-label="Observation Slate: Pinned to left bulkhead with scratched notes. Click to read."
        >
          <div className="slate-plate">
            <div className="slate-rivet rivet-tl" />
            <div className="slate-rivet rivet-tr" />
            <div className="slate-rivet rivet-bl" />
            <div className="slate-rivet rivet-br" />
            <FileText size={20} className="slate-icon" />
            <div className="slate-text-preview">
              <span>OBSERVATION LOG</span>
              <span className="slate-scratches">"The room is lying..."</span>
            </div>
          </div>
        </button>

        <div className="hotspot-action-pill">
          <button
            type="button"
            className="btn-inspect-pill"
            onClick={(e) => {
              e.stopPropagation();
              onInspect('observation_slate');
            }}
            aria-label="Read observation slate"
          >
            <Eye size={12} />
            <span>READ SLATE</span>
          </button>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 3. Anomaly Terminal (Right Wall)                         */}
      {/* ======================================================== */}
      <section
        className="hotspot hotspot-terminal"
        style={{ left: '84%', top: '50%' }}
      >
        <button
          type="button"
          className="terminal-pod-btn"
          onClick={() => onInteract('terminal')}
          aria-label="Anomaly Terminal: Wall-mounted console. Click to inspect and rewrite chamber rules."
        >
          <div className="terminal-pod">
            <div className="terminal-bezel">
              <div className="terminal-crt-preview">
                <Terminal size={22} className="crt-amber-icon" />
                <div className="crt-glow-lines">
                  <span className="crt-line">RULE_01 ONLINE</span>
                  <span className="crt-blink">_</span>
                </div>
              </div>
            </div>
            <span className="terminal-pod-label">LOGIC OVERRIDE</span>
          </div>
        </button>

        <div className="hotspot-action-pill">
          <button
            type="button"
            className="btn-inspect-pill"
            onClick={(e) => {
              e.stopPropagation();
              onInteract('terminal');
            }}
            aria-label="Access terminal console"
          >
            <Terminal size={12} />
            <span>ACCESS TERMINAL</span>
          </button>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 4. Specimen Pedestal (Center Foreground)                 */}
      {/* ======================================================== */}
      <section
        className="hotspot hotspot-pedestal"
        style={{ left: '50%', top: '78%' }}
      >
        {/* Overhead Spot Beam */}
        <div className="spotlight-cone" aria-hidden="true" />

        <div className="pedestal-structure">
          {/* Key Resting on Pedestal */}
          {!hasKey ? (
            <button
              type="button"
              className="key-specimen-btn"
              onClick={onCollectKey}
              aria-label="Machined Brass Key: Resting atop pedestal. Click to collect into inventory."
            >
              <div className="brass-key-halo">
                <KeyRound size={32} className="brass-key-graphic" />
                <span className="key-tag-label">KEY #101 (BRASS)</span>
              </div>
              <div className="pedestal-prompt">CLICK TO COLLECT</div>
            </button>
          ) : (
            <div className="pedestal-empty-slot">
              <span className="empty-slot-label">[ CRADLE VACATED ]</span>
            </div>
          )}

          {/* Slate Column */}
          <button
            type="button"
            className="pedestal-column-btn"
            onClick={() => onInspect('pedestal')}
            aria-label="Specimen Pedestal column. Click to inspect."
          >
            <div className="column-cap" />
            <div className="column-shaft" />
            <div className="column-base" />
          </button>
        </div>

        <div className="hotspot-action-pill">
          <button
            type="button"
            className="btn-inspect-pill"
            onClick={(e) => {
              e.stopPropagation();
              onInspect('pedestal');
            }}
            aria-label="Inspect specimen pedestal"
          >
            <Eye size={12} />
            <span>INSPECT PEDESTAL</span>
          </button>
        </div>
      </section>
    </div>
  );
};
