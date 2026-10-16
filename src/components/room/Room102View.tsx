import React from 'react';
import { GameState } from '../../game/types';
import { evaluateChamber102Puzzle } from '../../game/puzzles/chamber102';
import { Radio, Cpu, Lock, Unlock, Eye, Sparkles, Activity } from 'lucide-react';
import './room.css';

interface Room102ViewProps {
  state: GameState;
  onInteract: (objectId: string) => void;
  onInspect: (objectId: string) => void;
}

export const Room102View: React.FC<Room102ViewProps> = ({
  state,
  onInteract,
  onInspect,
}) => {
  const c102 = state.chamber102;
  const evalResult = evaluateChamber102Puzzle(c102);

  const plateMass = c102.pressurePlates.plate_mass;
  const plateHarmonic = c102.pressurePlates.plate_harmonic;
  const coreHeavy = c102.movableObjects.core_heavy;
  const coreResonance = c102.movableObjects.core_resonance;
  const isExitUnlocked = !c102.exitDoorLocked;

  return (
    <div className="room-canvas" aria-label="Chamber 102: The Signal Foundry Schematic">
      {/* Background Architectural Grid */}
      <div className="chamber-geometry" aria-hidden="true">
        <div className="wall-left" />
        <div className="wall-right" />
        <div className="floor-perspective-grid" />
        <div className="atmospheric-ambient-dust" />
      </div>

      {/* ======================================================== */}
      {/* 1. Blast Door Hotspot (Center Back)                      */}
      {/* ======================================================== */}
      <section
        className={`hotspot hotspot-door ${isExitUnlocked ? 'door-unlocked' : 'door-locked'}`}
        style={{ left: '50%', top: '28%' }}
      >
        <button
          type="button"
          className="door-frame-btn"
          onClick={() => onInteract('exit_door_102')}
          aria-label={
            isExitUnlocked
              ? 'Foundry Blast Door: Disengaged. Click to escape facility!'
              : 'Foundry Blast Door: Locked. Requires mass and harmonic frequency synchronization.'
          }
        >
          <div className="door-arch">
            <div className="door-beacon">
              {isExitUnlocked ? (
                <Unlock size={18} className="beacon-icon beacon-green" />
              ) : (
                <Lock size={18} className="beacon-icon beacon-amber" />
              )}
              <span className="beacon-text">
                {isExitUnlocked ? 'QUARANTINE CLEARED' : 'DUAL HYDRAULIC LOCK ACTIVE'}
              </span>
            </div>

            <div className="door-panel">
              <div className="door-heavy-plates">
                <div className="door-plaque">
                  <span className="plaque-subtext">SECTOR 102 // QUARANTINE EXIT</span>
                  <span className="plaque-maintext">
                    {isExitUnlocked
                      ? 'HYDRAULIC SEALS RELEASED'
                      : 'MASS INDUCTOR & HARMONIC TRANSCEIVER REQUIRED'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </button>

        <div className="hotspot-action-pill">
          <button
            type="button"
            className="btn-inspect-pill"
            onClick={(e) => {
              e.stopPropagation();
              onInspect('exit_door_102');
            }}
            aria-label="Inspect blast door"
          >
            <Eye size={12} />
            <span>INSPECT DOOR</span>
          </button>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 2. Diagnostic Slate (Left Wall)                          */}
      {/* ======================================================== */}
      <section
        className="hotspot hotspot-slate"
        style={{ left: '14%', top: '48%' }}
      >
        <button
          type="button"
          className="slate-btn"
          onClick={() => onInteract('diagnostic_slate_102')}
          aria-label="Maintenance Advisory Slate. Click to read."
        >
          <div className="slate-plate">
            <Activity size={20} className="slate-icon" />
            <div className="slate-text-preview">
              <span>DECEPTION AUDIT</span>
              <span className="slate-scratches">"Plate B is NOT a mass scale!"</span>
            </div>
          </div>
        </button>

        <div className="hotspot-action-pill">
          <button
            type="button"
            className="btn-inspect-pill"
            onClick={(e) => {
              e.stopPropagation();
              onInspect('diagnostic_slate_102');
            }}
            aria-label="Read advisory"
          >
            <Eye size={12} />
            <span>READ ADVISORY</span>
          </button>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 3. Signal Console (Right Wall)                           */}
      {/* ======================================================== */}
      <section
        className="hotspot hotspot-terminal"
        style={{ left: '86%', top: '48%' }}
      >
        <button
          type="button"
          className="terminal-pod-btn"
          onClick={() => onInteract('circuit_console')}
          aria-label="Signal Routing Console. Click to tune channel and frequency."
        >
          <div className="terminal-pod">
            <div className="terminal-bezel">
              <div className="terminal-crt-preview">
                <Radio size={22} className="crt-amber-icon" />
                <div className="crt-glow-lines">
                  <span className="crt-line">CHAN: {c102.circuit.routingChannel}</span>
                  <span className="crt-line">FREQ: {c102.circuit.selectedFrequency} kHz</span>
                </div>
              </div>
            </div>
            <span className="terminal-pod-label">
              {evalResult.circuitClosed ? '● LOOP CLOSED' : '○ TUNE FREQUENCY'}
            </span>
          </div>
        </button>

        <div className="hotspot-action-pill">
          <button
            type="button"
            className="btn-inspect-pill"
            onClick={(e) => {
              e.stopPropagation();
              onInteract('circuit_console');
            }}
            aria-label="Tune console"
          >
            <Radio size={12} />
            <span>CYCLE SIGNAL</span>
          </button>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 4. Plate A (Kinetic Inductor) - Left Center               */}
      {/* ======================================================== */}
      <section
        className="hotspot"
        style={{ left: '32%', top: '68%' }}
      >
        <button
          type="button"
          className="slate-btn"
          onClick={() => onInteract('plate_mass')}
          style={{
            borderColor: evalResult.plateMassSatisfied ? '#10b981' : '#f59e0b',
            boxShadow: evalResult.plateMassSatisfied ? '0 0 15px rgba(16, 185, 129, 0.4)' : undefined,
          }}
          aria-label="Plate A: Kinetic Inductor. Minimum 20kg required."
        >
          <div className="slate-plate">
            <Cpu size={22} color={evalResult.plateMassSatisfied ? '#10b981' : '#f59e0b'} />
            <div className="slate-text-preview">
              <span style={{ color: evalResult.plateMassSatisfied ? '#10b981' : '#f59e0b' }}>
                PLATE A // INDUCTOR
              </span>
              <span className="slate-scratches">
                {plateMass?.currentObjectId
                  ? `[ ${c102.movableObjects[plateMass.currentObjectId]?.name} ]`
                  : 'EMPTY // MIN 20 KG'}
              </span>
            </div>
          </div>
        </button>
      </section>

      {/* ======================================================== */}
      {/* 5. Plate B (Substrate Transceiver) - Right Center        */}
      {/* ======================================================== */}
      <section
        className="hotspot"
        style={{ left: '68%', top: '68%' }}
      >
        <button
          type="button"
          className="slate-btn"
          onClick={() => onInteract('plate_harmonic')}
          style={{
            borderColor: evalResult.plateHarmonicSatisfied ? '#10b981' : '#8b5cf6',
            boxShadow: evalResult.plateHarmonicSatisfied ? '0 0 15px rgba(139, 92, 246, 0.4)' : undefined,
          }}
          aria-label="Plate B: Substrate Transceiver. Requires harmonic cell and resonant frequency."
        >
          <div className="slate-plate">
            <Radio size={22} color={evalResult.plateHarmonicSatisfied ? '#10b981' : '#8b5cf6'} />
            <div className="slate-text-preview">
              <span style={{ color: evalResult.plateHarmonicSatisfied ? '#10b981' : '#8b5cf6' }}>
                PLATE B // TRANSCEIVER
              </span>
              <span className="slate-scratches">
                {plateHarmonic?.currentObjectId
                  ? `[ ${c102.movableObjects[plateHarmonic.currentObjectId]?.name} ]`
                  : 'SURFACE TRANSDUCER'}
              </span>
            </div>
          </div>
        </button>
      </section>

      {/* ======================================================== */}
      {/* 6. Movable Cores in Foreground                           */}
      {/* ======================================================== */}
      <div style={{ position: 'absolute', bottom: '18px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '20px', zIndex: 10 }}>
        {coreHeavy && !coreHeavy.isCarried && !coreHeavy.placedOnPlateId && (
          <button
            type="button"
            className="btn-inspect-pill"
            style={{ padding: '8px 16px', background: 'rgba(245, 158, 11, 0.15)', borderColor: '#f59e0b', color: '#f59e0b' }}
            onClick={() => onInteract('core_heavy')}
          >
            <Sparkles size={14} />
            <span>PICK UP HEAVY FLUX CORE (25kg)</span>
          </button>
        )}

        {coreResonance && !coreResonance.isCarried && !coreResonance.placedOnPlateId && (
          <button
            type="button"
            className="btn-inspect-pill"
            style={{ padding: '8px 16px', background: 'rgba(139, 92, 246, 0.15)', borderColor: '#8b5cf6', color: '#8b5cf6' }}
            onClick={() => onInteract('core_resonance')}
          >
            <Sparkles size={14} />
            <span>PICK UP HARMONIC CELL (8kg)</span>
          </button>
        )}

        {state.carriedObjectId && (
          <button
            type="button"
            className="btn-inspect-pill"
            style={{ padding: '8px 16px', background: 'rgba(56, 189, 248, 0.2)', borderColor: '#38bdf8', color: '#38bdf8' }}
            onClick={() => onInteract(state.carriedObjectId!)}
          >
            <span>DROP CARRIED: {c102.movableObjects[state.carriedObjectId]?.name}</span>
          </button>
        )}
      </div>
    </div>
  );
};
