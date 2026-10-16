import { LogbookEntry } from './types';

export const ALL_LOGBOOK_ENTRIES: Record<string, LogbookEntry> = {
  log_c101_audit: {
    id: 'log_c101_audit',
    chamberId: 'chamber_101',
    title: 'Diagnostic Incident #101-A',
    author: 'Diagnostic System',
    timestamp: 'CYCLE 418.02',
    tag: 'ANOMALY',
    content:
      'Quarantine status: ACTIVE. Substrate Rule #01 enforces strict copper-key exclusivity. Warning: Machined specimen #101 does not match copper spectrometry. Personnel are advised that attempting to operate the blast door with non-compliant alloys constitutes an operational breach.',
  },
  log_c101_scratches: {
    id: 'log_c101_scratches',
    chamberId: 'chamber_101',
    title: 'Scratched Slate Notes',
    author: 'Investigator Log',
    timestamp: 'UNDATED',
    tag: 'EVIDENCE',
    content:
      'The room is lying. The plaque on the door says only copper keys work, but look at the hydraulic sensor housing—it has a universal optical gate. The lock doesn\'t care about copper. The simulation rule was injected through the terminal to keep us inside. Override RULE_01.',
  },
  log_c102_advisory: {
    id: 'log_c102_advisory',
    chamberId: 'chamber_102',
    title: 'Maintenance Advisory: Plate B',
    author: 'Maintenance Advisory',
    timestamp: 'CYCLE 420.15',
    tag: 'ADVISORY',
    content:
      'ATTENTION FIELD ENGINEERS: Plate B (Substrate Transceiver) does NOT measure mass! The stamped label indicating "SURFACE TRANSDUCER // LOAD REQ" is obsolete deception left from calibration trials. Plate B requires resonant excitation matching the target frequency and channel configured on the signal console.',
  },
  log_c102_investigator: {
    id: 'log_c102_investigator',
    chamberId: 'chamber_102',
    title: 'Harmonic Bridge Telemetry',
    author: 'Investigator Log',
    timestamp: 'CYCLE 421.08',
    tag: 'EVIDENCE',
    content:
      'We weighed down Plate A with the 25kg Flux Core, but Plate B never budged until the circuit console oscilloscope was dialed in. The facility is testing whether we test reality or trust their stamped labels.',
  },
  log_c103_gravity: {
    id: 'log_c103_gravity',
    chamberId: 'chamber_103',
    title: 'Buoyancy Inversion Record',
    author: 'Diagnostic System',
    timestamp: 'CYCLE 425.40',
    tag: 'ANOMALY',
    content:
      'Gravitational Field Diagnostic: Archive deck clamps engaged at 9.81 m/s². The Archive Core is recorded as immobile due to mass exceeding buoyancy thresholds. Rule #03 dictates heavier objects cannot ascend.',
  },
  log_c103_clue: {
    id: 'log_c103_clue',
    chamberId: 'chamber_103',
    title: 'Archivist Fragment #33',
    author: 'Investigator Log',
    timestamp: 'CYCLE 426.12',
    tag: 'EVIDENCE',
    content:
      'The Archive Core is magnetic aerogel. In normal space it would float like a feather, yet the room clamps it down. By inverting the polarity of the ballast coil, Rule #03 breaks—the core ascends instantly to the optical sensor above.',
  },
  log_c104_security: {
    id: 'log_c104_security',
    chamberId: 'chamber_104',
    title: 'Security Clearance Expired',
    author: 'Maintenance Advisory',
    timestamp: 'CYCLE 430.01',
    tag: 'ADVISORY',
    content:
      'All Level-4 Root clearance tokens expired 800 cycles ago. The facility access control matrix refuses all logins under Rule #04. However, Emergency Protocol #404 allows guest tokens to elevate if the security checksum matches the parity telemetry.',
  },
  log_c104_investigator: {
    id: 'log_c104_investigator',
    chamberId: 'chamber_104',
    title: 'Zero-Day Audit Memo',
    author: 'Investigator Log',
    timestamp: 'CYCLE 431.19',
    tag: 'EVIDENCE',
    content:
      'Rule #04 demands credentials no living human holds. But when you look at the dependency graph on the vault monitor, the authorization check is an empty stub. If you rewrite Rule #04 to accept the Guest Token with checksum parity, the lock collapses.',
  },
  log_c105_causality: {
    id: 'log_c105_causality',
    chamberId: 'chamber_105',
    title: 'Reactor Phase Contradiction',
    author: 'Diagnostic System',
    timestamp: 'CYCLE 440.00',
    tag: 'ANOMALY',
    content:
      'Telemetry Alert: Causal integrity violation detected. System Rule #05 insists state transitions must proceed in strict linear sequence: ALPHA -> BETA -> OMEGA. All out-of-order execution is quarantined.',
  },
  log_c105_investigator: {
    id: 'log_c105_investigator',
    chamberId: 'chamber_105',
    title: 'Broken Timeline Notes',
    author: 'Investigator Log',
    timestamp: 'CYCLE 441.22',
    tag: 'EVIDENCE',
    content:
      'Look at the chronometer timestamps on the reactor relays! The relay marked OMEGA fired before BETA! The official sequence is an impossible lie. Align the causality relays according to actual event timestamps, not the manual.',
  },
  log_c106_architect: {
    id: 'log_c106_architect',
    chamberId: 'chamber_106',
    title: 'The Architect\'s Prime Axiom',
    author: 'The Architect',
    timestamp: 'ORIGIN',
    tag: 'DIRECTIVE',
    content:
      'Investigator, you have unraveled five layers of fabricated axioms. This facility was never a prison; it is a verification engine designed to find the one mind capable of defying false authority. The prime rule states: "The simulation\'s integrity depends on containing the investigator." Rewrite it. Dissolve the simulation. Wake up.',
  },
};
