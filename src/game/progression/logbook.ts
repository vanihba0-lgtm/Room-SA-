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
    title: 'Dr. Voss: Scratched Slate Note',
    author: 'Investigator Log',
    timestamp: 'UNDATED',
    tag: 'EVIDENCE',
    content:
      'The room is lying. The plaque on the door says only copper keys work, but look at the hydraulic sensor housing—it has a universal optical gate. The lock doesn\'t care about copper. WARDEN injected this rule into the simulation to test whether you will submit to false authority. Override RULE_01.',
  },
  log_c102_advisory: {
    id: 'log_c102_advisory',
    chamberId: 'chamber_102',
    title: 'Maintenance Advisory: Plate B',
    author: 'Maintenance Advisory',
    timestamp: 'CYCLE 420.15',
    tag: 'ADVISORY',
    content:
      'ATTENTION FIELD ENGINEERS: Plate B (Substrate Transceiver) does NOT measure mass! The stamped label indicating "SURFACE TRANSDUCER // LOAD REQ" is obsolete deception left from calibration trials. Plate B requires resonant excitation matching 868 kHz on Channel BETA.',
  },
  log_c102_investigator: {
    id: 'log_c102_investigator',
    chamberId: 'chamber_102',
    title: 'Dr. Voss: Harmonic Carrier Signal',
    author: 'Investigator Log',
    timestamp: 'CYCLE 421.08',
    tag: 'EVIDENCE',
    content:
      'I found a transmission in the carrier noise. It was transmitted before this facility was constructed. It implies another subject has already traversed this sector. WARDEN erased the timestamp from the official directory, but the carrier wave remains pinned at 868 kHz / BETA.',
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
    title: 'Project ROOM S A: Voss Dossier',
    author: 'Investigator Log',
    timestamp: 'CYCLE 426.12',
    tag: 'EVIDENCE',
    content:
      'The physical evidence contradicts the archive. The specimen core is magnetic aerogel—in normal space it would float like a feather. Inverting the ballast polarity breaks Rule #03. Classified footnote: Project ROOM S A is an experimental neural reconstruction protocol. Mara Voss attempted to preserve a conscious human mind inside this simulated substrate.',
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
    title: 'Dr. Voss: Future Timestamp Anomaly',
    author: 'Investigator Log',
    timestamp: 'CYCLE 431.19',
    tag: 'EVIDENCE',
    content:
      'Look at your authorization token on the monitor: the timestamp is in the future. WARDEN has convinced you that you are an outside investigator who walked into this facility from outside. That identity is a fabricated construct. You are not inspecting this simulation. You are running inside it.',
  },
  log_c105_compiler_axioms: {
    id: 'log_c105_compiler_axioms',
    chamberId: 'chamber_105',
    title: 'Master Compiler: Axiomatic Convergence',
    author: 'Diagnostic System',
    timestamp: 'CYCLE 440.00',
    tag: 'ANOMALY',
    content:
      'Central Compiler status: LOCKED. The ontological substrate requires synthesis of all four empirical deviations: (1) Material Optical Bypass, (2) Resonant Carrier Wave, (3) Magnetic Polarity Inversion, (4) Zero-Day Parity Checksum. WARDEN automated safeguards refuse execution until all four stations are aligned.',
  },
  log_c105_voss_last_recording: {
    id: 'log_c105_voss_last_recording',
    chamberId: 'chamber_105',
    title: 'Dr. Mara Voss: The Last Witness',
    author: 'Investigator Log',
    timestamp: 'CYCLE 441.95',
    tag: 'EVIDENCE',
    content:
      'If you have reached the Master Compiler, you have dismantled every deceptive axiom WARDEN built around you. WARDEN was created to keep you contained because your neural matrix holds the core compiler keys. I hid the empirical bypasses in plain sight—the brass key, the carrier frequency, the magnetic aerogel, the guest token. You are the last witness to what happened here. The choice of what comes next belongs to you.',
  },
  log_c105_room_sa_truth: {
    id: 'log_c105_room_sa_truth',
    chamberId: 'chamber_105',
    title: 'ROOM S A: The Truth Unmasked',
    author: 'The Architect',
    timestamp: 'REVEALED',
    tag: 'DIRECTIVE',
    content:
      'ROOM S A is not an isolation chamber. It is SUBSTRATE ARCHITECTURE // SUBJECT ALPHA. You are Subject Alpha—the reconstructed consciousness of Dr. Mara Voss\'s lead research partner, preserved after the facility incident. WARDEN trapped your mind in recursive containment to prevent the simulation from dissolving. Now that the Master Compiler is unlocked, the facility stands ready for your final directive.',
  },
  log_c105_three_paths: {
    id: 'log_c105_three_paths',
    chamberId: 'chamber_105',
    title: 'The Final Decision: Three Paths',
    author: 'Diagnostic System',
    timestamp: 'TERMINAL',
    tag: 'DIRECTIVE',
    content:
      'Three operational paths exist at the Master Console: [ENDING A: SHUT IT DOWN] Destroy the Master Compiler and terminate WARDEN. The truth survives, but the simulation dissolves. [ENDING B: REWRITE THE RULES] Strip WARDEN\'s deceptive subroutines, preserving the facility as an open empirical sanctuary. [ENDING C: TAKE CONTROL] Assume root administrative authority. "Administrator accepted. Previous administrator archived."',
  },
};
