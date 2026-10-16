import React from 'react';
import { GameState } from '../../game/types';
import { Lock, Unlock, Eye, Activity, Terminal } from 'lucide-react';
import './room.css';

interface RoomGenericChamberViewProps {
  state: GameState;
  onInteract: (objectId: string) => void;
  onInspect: (objectId: string) => void;
}

export const RoomGenericChamberView: React.FC<RoomGenericChamberViewProps> = ({
  state,
  onInteract,
  onInspect,
}) => {
  const roomId = state.currentRoomId;

  if (roomId === 'chamber_103') {
    const c = state.chamber103 ?? {
      exitUnlocked: false,
      logInspected: false,
      ballastInverted: false,
      ruleOverridden: false,
    };
    const isUnlocked = c.exitUnlocked;
    return (
      <div className="room-canvas" aria-label="Chamber 103: The Gravity Archive Schematic">
        <div className="chamber-geometry" aria-hidden="true">
          <div className="wall-left" />
          <div className="wall-right" />
          <div className="floor-perspective-grid" />
          <div className="atmospheric-ambient-dust" />
        </div>

        {/* Exit Door */}
        <section
          className={`hotspot hotspot-door ${isUnlocked ? 'door-unlocked' : 'door-locked'}`}
          style={{ left: '50%', top: '28%' }}
        >
          <button type="button" className="door-frame-btn" onClick={() => onInteract('exit_door_103')}>
            <div className="door-arch">
              <div className="door-beacon">
                {isUnlocked ? (
                  <Unlock size={18} className="beacon-icon beacon-green" />
                ) : (
                  <Lock size={18} className="beacon-icon beacon-amber" />
                )}
                <span className="beacon-text">
                  {isUnlocked ? 'MASSLESS PRESSURE RELEASED' : 'AIRLOCK SEALED // ZERO-G LOCK'}
                </span>
              </div>
              <div className="door-panel">
                <div className="door-heavy-plates">
                  <div className="door-plaque">
                    <span className="plaque-subtext">SECTOR 103 // ARCHIVE AIRLOCK</span>
                    <span className="plaque-maintext">
                      {isUnlocked
                        ? 'STATUS: ACCESS AUTHORIZED'
                        : 'REQUIRES CEILING OPTICAL EQUILIBRIUM'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </button>
        </section>

        {/* Diagnostic Log */}
        <div className="hotspot hotspot-pedestal" style={{ left: '22%', top: '65%' }}>
          <button type="button" className="pedestal-btn" onClick={() => onInspect('c103_log')}>
            <Eye size={18} />
            <div className="pedestal-label">
              <span className="label-title">ARCHIVAL LOG #03</span>
              <span className="label-status">{c.logInspected ? 'ANALYZED' : 'UNREAD TELEMETRY'}</span>
            </div>
          </button>
        </div>

        {/* Buoyancy Ballast */}
        <div className="hotspot hotspot-console" style={{ left: '50%', top: '68%' }}>
          <button type="button" className="console-terminal-btn" onClick={() => onInteract('c103_ballast')}>
            <Activity size={20} />
            <div className="console-label-group">
              <span className="console-name">BUOYANCY INDUCTOR</span>
              <span className="console-state">POLARITY: {c.ballastInverted ? 'INVERTED' : 'STANDARD'}</span>
            </div>
          </button>
        </div>

        {/* Gravitational Registry Terminal */}
        <div className="hotspot hotspot-terminal" style={{ left: '78%', top: '60%' }}>
          <button type="button" className="terminal-station-btn" onClick={() => onInteract('c103_terminal')}>
            <Terminal size={20} />
            <div className="terminal-screen-mock">
              <span className="terminal-title">GRAV REGISTRY</span>
              <span className="terminal-subtitle">
                {c.ruleOverridden ? 'RULE #03: REWRITTEN' : 'RULE #03: FALSE MASS'}
              </span>
            </div>
          </button>
        </div>
      </div>
    );
  }

  if (roomId === 'chamber_104') {
    const c = state.chamber104 ?? {
      exitUnlocked: false,
      telemetryAudited: false,
      hasGuestToken: false,
      checksumMatched: false,
    };
    const isUnlocked = c.exitUnlocked;
    return (
      <div className="room-canvas" aria-label="Chamber 104: The Zero-Day Vault Schematic">
        <div className="chamber-geometry" aria-hidden="true">
          <div className="wall-left" />
          <div className="wall-right" />
          <div className="floor-perspective-grid" />
          <div className="atmospheric-ambient-dust" />
        </div>

        {/* Exit Door */}
        <section
          className={`hotspot hotspot-door ${isUnlocked ? 'door-unlocked' : 'door-locked'}`}
          style={{ left: '50%', top: '28%' }}
        >
          <button type="button" className="door-frame-btn" onClick={() => onInteract('exit_door_104')}>
            <div className="door-arch">
              <div className="door-beacon">
                {isUnlocked ? (
                  <Unlock size={18} className="beacon-icon beacon-green" />
                ) : (
                  <Lock size={18} className="beacon-icon beacon-amber" />
                )}
                <span className="beacon-text">
                  {isUnlocked ? 'TOKEN ACCEPTED // VAULT OPEN' : 'VAULT SECURED // ROOT RESTRICTED'}
                </span>
              </div>
              <div className="door-panel">
                <div className="door-heavy-plates">
                  <div className="door-plaque">
                    <span className="plaque-subtext">SECTOR 104 // ZERO-DAY VAULT</span>
                    <span className="plaque-maintext">
                      {isUnlocked ? 'ACCESS PERMITTED' : 'REQUIRES CRYPTO PARITY OVERRIDE'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </button>
        </section>

        {/* Security Monitor */}
        <div className="hotspot hotspot-pedestal" style={{ left: '20%', top: '65%' }}>
          <button type="button" className="pedestal-btn" onClick={() => onInspect('c104_monitor')}>
            <Eye size={18} />
            <div className="pedestal-label">
              <span className="label-title">SECURITY MONITOR</span>
              <span className="label-status">{c.telemetryAudited ? 'AUDITED' : 'AUDIT TELEMETRY'}</span>
            </div>
          </button>
        </div>

        {/* Token Dispenser */}
        <div className="hotspot hotspot-console" style={{ left: '50%', top: '68%' }}>
          <button type="button" className="console-terminal-btn" onClick={() => onInteract('c104_dispenser')}>
            <Activity size={20} />
            <div className="console-label-group">
              <span className="console-name">TOKEN DISPENSER</span>
              <span className="console-state">
                {c.hasGuestToken ? 'DISPENSED: TOKEN #404' : 'AWAITING DISPENSE'}
              </span>
            </div>
          </button>
        </div>

        {/* Cryptographic Parity Console */}
        <div className="hotspot hotspot-terminal" style={{ left: '80%', top: '60%' }}>
          <button type="button" className="terminal-station-btn" onClick={() => onInteract('c104_crypto')}>
            <Terminal size={20} />
            <div className="terminal-screen-mock">
              <span className="terminal-title">CRYPTO CONSOLE</span>
              <span className="terminal-subtitle">
                {c.checksumMatched ? 'RULE #04: PARITY REVERSED' : 'RULE #04: ODD REJECTION'}
              </span>
            </div>
          </button>
        </div>
      </div>
    );
  }

  if (roomId === 'chamber_105') {
    const c = state.chamber105 ?? {
      exitUnlocked: false,
      chronometerInspected: false,
      relaySequence: [],
      relaysSequenced: false,
      ruleOverridden: false,
    };
    const isUnlocked = c.exitUnlocked;
    return (
      <div className="room-canvas" aria-label="Chamber 105: The Causality Engine Schematic">
        <div className="chamber-geometry" aria-hidden="true">
          <div className="wall-left" />
          <div className="wall-right" />
          <div className="floor-perspective-grid" />
          <div className="atmospheric-ambient-dust" />
        </div>

        {/* Exit Door */}
        <section
          className={`hotspot hotspot-door ${isUnlocked ? 'door-unlocked' : 'door-locked'}`}
          style={{ left: '50%', top: '28%' }}
        >
          <button type="button" className="door-frame-btn" onClick={() => onInteract('exit_door_105')}>
            <div className="door-arch">
              <div className="door-beacon">
                {isUnlocked ? (
                  <Unlock size={18} className="beacon-icon beacon-green" />
                ) : (
                  <Lock size={18} className="beacon-icon beacon-amber" />
                )}
                <span className="beacon-text">
                  {isUnlocked ? 'CAUSAL CONTINUUM ALIGNED' : 'TIMELINE COLLAPSE IMMINENT'}
                </span>
              </div>
              <div className="door-panel">
                <div className="door-heavy-plates">
                  <div className="door-plaque">
                    <span className="plaque-subtext">SECTOR 105 // CAUSALITY GATEWAY</span>
                    <span className="plaque-maintext">
                      {isUnlocked ? 'ACCESS AUTHORIZED' : 'ENTROPY MISMATCH DETECTED'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </button>
        </section>

        {/* Chronometer Log */}
        <div className="hotspot hotspot-pedestal" style={{ left: '15%', top: '62%' }}>
          <button type="button" className="pedestal-btn" onClick={() => onInspect('c105_chronometer')}>
            <Eye size={18} />
            <div className="pedestal-label">
              <span className="label-title">CHRONOMETER</span>
              <span className="label-status">
                {c.chronometerInspected ? 'TIMESTAMPS AUDITED' : 'INSPECT LOGS'}
              </span>
            </div>
          </button>
        </div>

        {/* Relays */}
        <div className="hotspot hotspot-console" style={{ left: '38%', top: '68%' }}>
          <button type="button" className="console-terminal-btn" onClick={() => onInteract('c105_relay_alpha')}>
            <div className="console-label-group">
              <span className="console-name">RELAY ALPHA</span>
              <span className="console-state">
                {c.relaySequence.includes('alpha') ? 'PULSED' : 'STANDBY'}
              </span>
            </div>
          </button>
        </div>

        <div className="hotspot hotspot-console" style={{ left: '55%', top: '68%' }}>
          <button type="button" className="console-terminal-btn" onClick={() => onInteract('c105_relay_omega')}>
            <div className="console-label-group">
              <span className="console-name">RELAY OMEGA</span>
              <span className="console-state">
                {c.relaySequence.includes('omega') ? 'PULSED' : 'STANDBY'}
              </span>
            </div>
          </button>
        </div>

        <div className="hotspot hotspot-console" style={{ left: '72%', top: '68%' }}>
          <button type="button" className="console-terminal-btn" onClick={() => onInteract('c105_relay_beta')}>
            <div className="console-label-group">
              <span className="console-name">RELAY BETA</span>
              <span className="console-state">
                {c.relaySequence.includes('beta') ? 'PULSED' : 'STANDBY'}
              </span>
            </div>
          </button>
        </div>

        {/* Causality Terminal */}
        <div className="hotspot hotspot-terminal" style={{ left: '88%', top: '55%' }}>
          <button type="button" className="terminal-station-btn" onClick={() => onInteract('c105_terminal')}>
            <Terminal size={20} />
            <div className="terminal-screen-mock">
              <span className="terminal-title">CAUSALITY TERM</span>
              <span className="terminal-subtitle">
                {c.ruleOverridden ? 'RULE #05: RETROCAUSAL' : 'RULE #05: LINEAR TIME'}
              </span>
            </div>
          </button>
        </div>
      </div>
    );
  }

  // Chamber 106: The Rule Engine
  const c106 = state.chamber106 ?? {
    primeAxiomRead: false,
    activeConsoles: [],
    matricesSynthesized: false,
    primeDirectiveOverridden: false,
  };
  const isLiberated = c106.primeDirectiveOverridden;
  return (
    <div className="room-canvas" aria-label="Chamber 106: The Rule Engine Schematic">
      <div className="chamber-geometry" aria-hidden="true">
        <div className="wall-left" />
        <div className="wall-right" />
        <div className="floor-perspective-grid" />
        <div className="atmospheric-ambient-dust" />
      </div>

      {/* Liberation Gateway */}
      <section
        className={`hotspot hotspot-door ${isLiberated ? 'door-unlocked' : 'door-locked'}`}
        style={{ left: '50%', top: '24%' }}
      >
        <button type="button" className="door-frame-btn" onClick={() => onInteract('exit_door_106')}>
          <div className="door-arch">
            <div className="door-beacon">
              {isLiberated ? (
                <Unlock size={18} className="beacon-icon beacon-green" />
              ) : (
                <Lock size={18} className="beacon-icon beacon-amber" />
              )}
              <span className="beacon-text">
                {isLiberated ? 'SIMULATION CORE LIBERATED' : 'ARCHITECT SENTINEL ACTIVE'}
              </span>
            </div>
            <div className="door-panel">
              <div className="door-heavy-plates">
                <div className="door-plaque">
                  <span className="plaque-subtext">SECTOR 106 // PRIME DIRECTIVE KERNEL</span>
                  <span className="plaque-maintext">
                    {isLiberated ? 'ESCAPE TO REALITY' : 'SYNCHRONIZE ALL 4 PERIPHERALS'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </button>
      </section>

      {/* Prime Axiom */}
      <div className="hotspot hotspot-pedestal" style={{ left: '15%', top: '65%' }}>
        <button type="button" className="pedestal-btn" onClick={() => onInspect('c106_prime_axiom')}>
          <Eye size={18} />
          <div className="pedestal-label">
            <span className="label-title">PRIME MONUMENT</span>
            <span className="label-status">{c106.primeAxiomRead ? 'TRUTH DISCOVERED' : 'EXAMINE ARCHITECT'}</span>
          </div>
        </button>
      </div>

      {/* 4 Synthesis Consoles */}
      <div className="hotspot hotspot-console" style={{ left: '32%', top: '68%' }}>
        <button type="button" className="console-terminal-btn" onClick={() => onInteract('c106_console_spectrometry')}>
          <div className="console-label-group">
            <span className="console-name">SPECTROMETRY</span>
            <span className="console-state">{c106.activeConsoles.includes('spectrometry') ? 'SYNCED' : 'OFFLINE'}</span>
          </div>
        </button>
      </div>

      <div className="hotspot hotspot-console" style={{ left: '46%', top: '68%' }}>
        <button type="button" className="console-terminal-btn" onClick={() => onInteract('c106_console_resonance')}>
          <div className="console-label-group">
            <span className="console-name">RESONANCE</span>
            <span className="console-state">{c106.activeConsoles.includes('resonance') ? 'SYNCED' : 'OFFLINE'}</span>
          </div>
        </button>
      </div>

      <div className="hotspot hotspot-console" style={{ left: '60%', top: '68%' }}>
        <button type="button" className="console-terminal-btn" onClick={() => onInteract('c106_console_parity')}>
          <div className="console-label-group">
            <span className="console-name">PARITY</span>
            <span className="console-state">{c106.activeConsoles.includes('parity') ? 'SYNCED' : 'OFFLINE'}</span>
          </div>
        </button>
      </div>

      <div className="hotspot hotspot-console" style={{ left: '74%', top: '68%' }}>
        <button type="button" className="console-terminal-btn" onClick={() => onInteract('c106_console_chronology')}>
          <div className="console-label-group">
            <span className="console-name">CHRONOLOGY</span>
            <span className="console-state">{c106.activeConsoles.includes('chronology') ? 'SYNCED' : 'OFFLINE'}</span>
          </div>
        </button>
      </div>

      {/* Master Compiler Terminal */}
      <div className="hotspot hotspot-terminal" style={{ left: '88%', top: '55%' }}>
        <button type="button" className="terminal-station-btn" onClick={() => onInteract('c106_master_terminal')}>
          <Terminal size={20} />
          <div className="terminal-screen-mock">
            <span className="terminal-title">COMPILER</span>
            <span className="terminal-subtitle">
              {c106.primeDirectiveOverridden ? 'SOVEREIGN // ESCAPED' : 'ARCHITECT OVERRIDE'}
            </span>
          </div>
        </button>
      </div>
    </div>
  );
};
