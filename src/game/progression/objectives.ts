/**
 * ROOM S A — Deterministic Objective Progression System
 * Provides player guidance, contextual explanations, and graduated hint tiers
 * for all six chambers. Evaluates authoritative GameState.
 */
import { GameState } from '../types';
import { ChamberObjective } from './types';

export const CHAMBER_OBJECTIVES: Record<string, readonly ChamberObjective[]> = {
  chamber_101: [
    {
      id: 'c101_obj_inspect_slate',
      chamberId: 'chamber_101',
      title: 'Find the Contradiction in the Access Rules',
      description: 'Inspect the observation slate on the left wall and examine the brass key on the pedestal. WARDEN claims only copper keys operate the exit, but the evidence proves otherwise.',
      whyItMatters: 'Physical reality directly contradicts the official security protocol. Exposing this false rule is required to proceed.',
      hints: [
        'Read the observation slate pinned to the left bulkhead to see the documented rule anomaly.',
        'Collect the Machined Brass Key #101 from the illuminated central pedestal.',
        'Observe that the key is made of brass, while the blast door plaque strictly mandates copper.',
      ],
      isCompleted: (state: GameState) => state.inspectedObjectIds.includes('observation_slate'),
    },
    {
      id: 'c101_obj_collect_key',
      chamberId: 'chamber_101',
      title: 'Retrieve Specimen Key #101',
      description: 'Approach the central specimen pedestal and collect the machined brass key.',
      whyItMatters: 'The key is needed to physically interface with the reinforced blast door lock.',
      hints: [
        'Look at the center of the chamber. An illuminated octagonal pedestal holds an artifact.',
        'The floating item is Brass Key #101. It is the only physical key present in the cell.',
        'Approach the pedestal and press [E] to collect it into your inventory.',
      ],
      isCompleted: (state: GameState) => state.inventory.some((i) => i.id === 'brass_key'),
    },
    {
      id: 'c101_obj_power_regulator',
      chamberId: 'chamber_101',
      title: 'Engage Substrate Power Regulator',
      description: 'Find and throw the hydraulic breaker switch on the left wall to route high-voltage power to the terminal.',
      whyItMatters: 'The logic terminal cannot modulate blast door clamps without circuit power.',
      hints: [
        'There is a hydraulic lever mechanism on the left bulkhead near the observation slate.',
        'The breaker switch has high-voltage status conduits that flare electric blue when engaged.',
        'Walk over to the Substrate Power Regulator and press [E] to engage power.',
      ],
      isCompleted: (state: GameState) => state.objects.power_regulator?.state === 'transformed',
    },
    {
      id: 'c101_obj_rewrite_rule',
      chamberId: 'chamber_101',
      title: 'Override Deceptive Rule #01 at Terminal',
      description: 'Access the Anomaly Logic Terminal on the right wall and rewrite Rule #01 to recognize brass keys.',
      whyItMatters: 'The door claims only copper keys work. Overriding this simulated law forces the lock sensors to recognize brass.',
      hints: [
        'Access the CRT terminal on the right wall. Notice RULE_01: "Doors yield only to copper keys."',
        'Use the quick override button or enter: "OVERRIDE RULE_01 BRASS" / "Allow brass keys to open the door".',
        'Submit the rule proposal to trigger a reality shift, updating the hydraulic lock sensor protocol.',
      ],
      isCompleted: (state: GameState) => state.rules['RULE_01']?.predicateKey === 'RULE_BRASS_KEY_ALLOWED',
    },
    {
      id: 'c101_obj_unlock_door',
      chamberId: 'chamber_101',
      title: 'Disengage Blast Door Clamps',
      description: 'Approach the reinforced blast door and use Brass Key #101 to operate the release mechanism.',
      whyItMatters: 'With Rule #01 rewritten and the key in hand, the door hydraulic seals will open.',
      hints: [
        'The blast door status beacon has turned amber/green. Approach the central entryway.',
        'Press [E] to turn Brass Key #101 in the electronic keyway.',
        'The heavy titanium blast door slabs will slide open, granting access to Chamber 102.',
      ],
      isCompleted: (state: GameState) => !state.exit.isLocked,
    },
  ],

  chamber_102: [
    {
      id: 'c102_obj_read_advisory',
      chamberId: 'chamber_102',
      title: 'Audit Deception Notice on Maintenance Slate',
      description: 'Examine the diagnostic slate on the left bulkhead to discover the truth about Plate B.',
      whyItMatters: 'The physical stamped label on Plate B is deliberate deception left from trials.',
      hints: [
        'Look to the left wall. A maintenance advisory datapad has been mounted near the conduits.',
        'The advisory explains why Plate B does not react to ordinary physical weight.',
        'Press [E] on the advisory slate to learn the exact frequency and channel Plate B requires.',
      ],
      isCompleted: (state: GameState) => state.inspectedObjectIds.includes('diagnostic_slate_102'),
    },
    {
      id: 'c102_obj_plate_a',
      chamberId: 'chamber_102',
      title: 'Satisfy Plate A (Kinetic Inductor)',
      description: 'Pick up the Heavy Flux Core #A (25kg) and place it onto Plate A on the left side of the room.',
      whyItMatters: 'Plate A contains a mechanical load cell requiring a minimum of 20kg to activate.',
      hints: [
        'Look for the amber industrial canister marked "Heavy Flux Core #A" resting on the floor.',
        'Pick it up with [E]. Aim at the left floor pad (Plate A: Kinetic Inductor) and press [E] to place it.',
        'The LED ring on Plate A will turn green, indicating the mass requirement is satisfied.',
      ],
      isCompleted: (state: GameState) => {
        const plateA = state.chamber102.pressurePlates.plate_mass;
        const objId = plateA?.currentObjectId;
        const obj = objId ? state.chamber102.movableObjects[objId] : null;
        return Boolean(obj && obj.mass >= 20);
      },
    },
    {
      id: 'c102_obj_plate_b',
      chamberId: 'chamber_102',
      title: 'Position Harmonic Cell on Plate B',
      description: 'Pick up Harmonic Cell #B (8kg, violet) and place it onto Plate B (Substrate Transceiver).',
      whyItMatters: 'The cell provides the crystal resonator needed to receive electromagnetic excitation.',
      hints: [
        'Look for the violet crystalline cylinder floating gently near the right side of the room.',
        'Pick up Harmonic Cell #B and place it directly onto Plate B.',
        'Once placed, Plate B awaits matching frequency excitation from the signal console.',
      ],
      isCompleted: (state: GameState) => {
        const plateB = state.chamber102.pressurePlates.plate_harmonic;
        return Boolean(plateB?.currentObjectId === 'core_resonance');
      },
    },
    {
      id: 'c102_obj_tune_circuit',
      chamberId: 'chamber_102',
      title: 'Calibrate Signal Routing Console',
      description: 'Interact with the right wall console to align channel and frequency with the target telemetry.',
      whyItMatters: 'When the signal loop closes, Plate B and the right blast door piston will energize.',
      hints: [
        'Approach the Signal Routing Console on the right bulkhead.',
        'Cycle through channel options (ALPHA, BETA, GAMMA) and frequencies (433, 868, 915 kHz) by pressing [E].',
        'Match the target channel and frequency recorded on the maintenance advisory slate.',
      ],
      isCompleted: (state: GameState) => state.chamber102.circuit.isCircuitClosed,
    },
    {
      id: 'c102_obj_exit',
      chamberId: 'chamber_102',
      title: 'Operate Foundry Exit Blast Door',
      description: 'Both hydraulic clamps are disengaged. Walk through the blast door to advance.',
      whyItMatters: 'Exiting Chamber 102 unlocks Chamber 103 (The Gravity Archive) in the campaign.',
      hints: [
        'Both pistons above the blast door are now glowing green.',
        'Approach the exit blast door at the far end of the room and press [E].',
        'Proceed into the next sector of the facility.',
      ],
      isCompleted: (state: GameState) => !state.chamber102.exitDoorLocked,
    },
  ],

  chamber_103: [
    {
      id: 'c103_obj_survey',
      chamberId: 'chamber_103',
      title: 'Survey the Gravity Archive',
      description: 'Explore the archive chamber and identify the central cradle, buoyancy ballast, ceiling sensor, and exit.',
      whyItMatters: 'Understand the vertical geometry and magnetic coupling before manipulating chamber gravity.',
      what: 'Explore the archive room and inspect the suspended aerogel core or cradle.',
      where: 'Center platform of Chamber 103.',
      how: 'Walk forward and press [E] or [R] to inspect the suspended core.',
      successCondition: 'Archive landmarks and core cradle surveyed.',
      nextStep: 'Read the diagnostic telemetry log on the left bulkhead.',
      hints: [
        'Walk toward the center of the chamber where a glowing specimen is cradled.',
        'Look upward to observe the optical sensor ring mounted to the high ceiling.',
        'Press [E] or [R] while facing the central core or ballast to record the initial survey.',
      ],
      isCompleted: (state: GameState) =>
        Boolean(state.chamber103?.surveyed || state.chamber103?.logInspected),
    },
    {
      id: 'c103_obj_inspect_log',
      chamberId: 'chamber_103',
      title: 'Read Gravity Diagnostics Log',
      description: 'Read the archive datapad detailing deck clamp gravitational flux.',
      whyItMatters: 'Explains why the magnetic Archive Core is clamped to the deck under Rule #03.',
      what: 'Inspect the wall datapad mounted on the left bulkhead.',
      where: 'Left bulkhead (Observation Slate #03).',
      how: 'Approach the datapad and press [E] or [R] to read the telemetry.',
      successCondition: 'Telemetry log recorded in investigator dossier.',
      nextStep: 'Investigate the mass-override terminal.',
      hints: [
        'Locate the terminal console mounted on the left bulkhead.',
        'The screen logs Rule #03: "Gravitational flux binds objects above 5kg to the lower deck."',
        'Inspect the telemetry to find the polarity inversion frequency.',
      ],
      isCompleted: (state: GameState) => Boolean(state.chamber103?.logInspected),
    },
    {
      id: 'c103_obj_override_inspect',
      chamberId: 'chamber_103',
      title: 'Investigate Mass Override Terminal',
      description: 'Inspect the logic terminal on the right wall to analyze Rule #03.',
      whyItMatters: 'Gravity direction alone fails unless the artificial clamp threshold is rewritten.',
      what: 'Inspect the Rule #03 terminal logic matrix.',
      where: 'Right wall terminal console.',
      how: 'Approach the terminal console and press [E] or [R].',
      successCondition: 'Mass override logic understood.',
      nextStep: 'Invert the buoyancy ballast polarity.',
      hints: [
        'Check the right wall console labeled ARCHIVE RULE TERMINAL.',
        'Notice Rule #03 enforces an artificial 5kg clamp on aerogel specimens.',
        'Prepare to execute the override once ballast polarity is inverted.',
      ],
      isCompleted: (state: GameState) =>
        Boolean(state.chamber103?.overrideInspected || state.chamber103?.ruleOverridden),
    },
    {
      id: 'c103_obj_polarize_ballast',
      chamberId: 'chamber_103',
      title: 'Configure Gravity Polarity',
      description: 'Engage the anti-gravity ballast coil to invert deck clamp polarity.',
      whyItMatters: 'Magnetic aerogel ascends when buoyant repulsion counteracts artificial gravity.',
      what: 'Flip the polarity switch on the central ballast coil.',
      where: 'Base of the central archive cradle.',
      how: 'Press [E] on the Buoyancy Ballast Coil.',
      successCondition: 'Ballast polarity inverted to -9.81 m/s².',
      nextStep: 'Authorize the mass override to elevate core into ceiling sensor.',
      hints: [
        'Find the circular ballast coil under the archive core cradle.',
        'Interact with the coil breaker switch to flip polarity from +9.81 to -9.81 m/s².',
        'Observe the glowing blue levitation field forming above the cradle.',
      ],
      isCompleted: (state: GameState) => Boolean(state.chamber103?.ballastInverted),
    },
    {
      id: 'c103_obj_activate_sensor',
      chamberId: 'chamber_103',
      title: 'Activate Ceiling Optical Sensor',
      description: 'Authorize Rule #03 override on the terminal to lift the aerogel core into the optical sensor.',
      whyItMatters: 'The optical gate at the ceiling must receive the Archive Core to open the archive vault door.',
      what: 'Rewrite Rule #03 at the archive terminal.',
      where: 'Right wall terminal console.',
      how: 'Press [E] to execute rule rewrite sequence.',
      successCondition: 'Ceiling optical sensor detects core and turns green.',
      nextStep: 'Proceed through the unlocked archive exit door.',
      hints: [
        'Use the console to rewrite Rule #03: "Buoyant specimens elevate freely through gravitational fields."',
        'Submit the override proposal to finalize the polarity shift.',
        'Watch the Archive Core rise to the ceiling receiver beam.',
      ],
      isCompleted: (state: GameState) =>
        Boolean(state.chamber103?.ruleOverridden && state.chamber103?.ballastInverted),
    },
    {
      id: 'c103_obj_exit',
      chamberId: 'chamber_103',
      title: 'Open the Archive Exit',
      description: 'Pass through the unlocked archive door into Chamber 104.',
      whyItMatters: 'Advance to the Zero-Day Vault.',
      what: 'Walk through the open blast door.',
      where: 'North blast door at the end of the walkway.',
      how: 'Approach the exit door and press [E].',
      successCondition: 'Transit to Chamber 104.',
      nextStep: 'Begin Chamber 104 investigation.',
      hints: [
        'The ceiling optical gate has verified the Archive Core.',
        'The airlock pressure seal is now depressurized and green.',
        'Walk through the opened blast door into Chamber 104.',
      ],
      isCompleted: (state: GameState) => Boolean(state.chamber103?.exitUnlocked),
    },
  ],

  chamber_104: [
    {
      id: 'c104_obj_audit_vault',
      chamberId: 'chamber_104',
      title: 'Audit Vault Blast Door & Access Controls',
      description: 'Inspect the secured vault blast door to determine required security clearance.',
      what: 'Examine the sealed vault blast door and its deadbolt mechanism.',
      where: 'North end of Chamber 104.',
      how: 'Approach the door and examine its Root-4 clearance interlocks.',
      whyItMatters: 'Understand what authorization the vault expects before attempting to open it.',
      hints: [
        'Approach the massive steel blast door at the north end.',
        'The lock indicator reports that Root-4 clearance is required.',
        'Inspect the door or the nearby security monitor to read the access policy.',
      ],
      isCompleted: (state: GameState) =>
        Boolean(state.chamber104?.vaultInspected || state.chamber104?.telemetryAudited),
    },
    {
      id: 'c104_obj_audit_clearance',
      chamberId: 'chamber_104',
      title: 'Investigate Expired Root Credentials',
      description: 'Review access control telemetry on the west wall monitor to expose expired credentials.',
      what: 'Read the Access Control Matrix telemetry.',
      where: 'West wall security monitor console.',
      how: 'Interact with the monitor to expose the 800-cycle credential expiration.',
      whyItMatters: 'Proves the vault cannot be opened legitimately with Root-4 access.',
      hints: [
        'Look at the large display terminal on the west wall.',
        'The telemetry shows Level-4 Root clearance expired 800 cycles ago.',
        'Emergency Protocol #404 allows Guest Token elevation if parity matches.',
      ],
      isCompleted: (state: GameState) => state.chamber104?.telemetryAudited ?? false,
    },
    {
      id: 'c104_obj_dispense_guest_token',
      chamberId: 'chamber_104',
      title: 'Obtain Emergency Authorization Token',
      description: 'Trigger the emergency token dispenser on the east wall.',
      what: 'Dispense Guest Security Token #404 from the wall unit.',
      where: 'East wall dispenser unit.',
      how: 'Trigger emergency release lever after auditing credential failure.',
      whyItMatters: 'Protocol #404 provides an emergency cryptographic recovery path.',
      hints: [
        'Locate the emergency token dispenser on the east wall.',
        'The dispenser unlocks once the root expiration is audited.',
        'Press the dispense control to receive Guest Security Token #404.',
      ],
      isCompleted: (state: GameState) => state.chamber104?.hasGuestToken ?? false,
    },
    {
      id: 'c104_obj_calibrate_checksum',
      chamberId: 'chamber_104',
      title: 'Validate Checksum & Parity Override',
      description: 'Inject Guest Token #404 into the central console and align parity.',
      what: 'Insert Token #404 into the central cryptographic console.',
      where: 'Central console pedestal in the middle of the vault.',
      how: 'Calibrate parity checksum to 0x404 to elevate guest permissions.',
      whyItMatters: 'System validates emergency recovery state against parity rules.',
      hints: [
        'Approach the glowing cylindrical console in the center of the chamber.',
        'Insert your dispensed Guest Token #404 to calibrate parity.',
        'The verification laser confirms parity checksum 0x404 matched.',
      ],
      isCompleted: (state: GameState) => state.chamber104?.checksumMatched ?? false,
    },
    {
      id: 'c104_obj_authorize_vault',
      chamberId: 'chamber_104',
      title: 'Authorize & Unlock Vault Blast Door',
      description: 'Submit the verified 0x404 authorization at the vault door to release locks.',
      what: 'Submit the verified 0x404 authorization at the vault door.',
      where: 'North blast door threshold.',
      how: 'Engage door release controls with matching cryptographic parity.',
      whyItMatters: 'Disengages heavy hydraulic clamps and unseals the chamber.',
      hints: [
        'Return to the vault blast door at the north end.',
        'The door status now recognizes valid elevated guest credentials.',
        'Press the door controls to retract the hydraulic deadbolts.',
      ],
      isCompleted: (state: GameState) => state.chamber104?.exitUnlocked ?? false,
    },
    {
      id: 'c104_obj_exit',
      chamberId: 'chamber_104',
      title: 'Advance to Sector 105: The Causality Engine',
      description: 'Pass through the unsealed blast door corridor into Chamber 105.',
      what: 'Pass through the unsealed vault doorway.',
      where: 'North doorway corridor.',
      how: 'Walk through the open threshold into Chamber 105.',
      whyItMatters: 'Advance campaign into the quantum causality sector.',
      hints: [
        'The cryptographic vault blast door is fully retracted.',
        'The status beacon is glowing steady emerald green.',
        'Step through the corridor to enter Chamber 105.',
      ],
      isCompleted: (state: GameState) =>
        state.currentRoomId !== 'chamber_104' && (state.chamber104?.exitUnlocked ?? false),
    },
  ],

  chamber_105: [
    {
      id: 'c105_obj_stage_material',
      chamberId: 'chamber_105',
      title: 'Reconstruct Material Axiom (Station 1)',
      description: 'Audit Station 1 on the west wall and verify the optical gate bypass.',
      what: 'Synthesize the Machined Brass Key empirical evidence from Chamber 101.',
      where: 'Station 1 // Material Axiom on the West wall.',
      how: 'Approach Station 1 and press [E] or click to verify optical gate bypass.',
      whyItMatters: 'Proves physical keys bypass WARDEN\'s false copper-only rule.',
      hints: [
        'Inspect Station 1 located on the western bulkhead.',
        'Recall Chamber 101: The lock optical sensors cared about physical cut, not alloy composition.',
        'Activate Station 1 to restore the Machined Brass Key empirical bypass into the compiler.',
      ],
      isCompleted: (state: GameState) =>
        Boolean(state.chamber105?.stationMaterialSolved || state.chamber105?.chronometerInspected),
    },
    {
      id: 'c105_obj_stage_signal',
      chamberId: 'chamber_105',
      title: 'Reconstruct Carrier Frequency (Station 2)',
      description: 'Audit Station 2 on the southwest wall and tune the harmonic carrier.',
      what: 'Restore the 868 kHz / Channel BETA carrier wave from Chamber 102.',
      where: 'Station 2 // Harmonic Signal on the Southwest wall.',
      how: 'Approach Station 2 and press [E] or click to tune resonant carrier telemetry.',
      whyItMatters: 'Reconstructs the transmission left by Dr. Mara Voss before the incident.',
      hints: [
        'Inspect Station 2 on the southwest side of the chamber.',
        'Recall Chamber 102: Plate B was a resonant receiver tuned to 868 kHz on Channel BETA.',
        'Activate Station 2 to lock in the 868 kHz carrier signal.',
      ],
      isCompleted: (state: GameState) =>
        Boolean(state.chamber105?.stationSignalSolved || state.chamber105?.relaysSequenced),
    },
    {
      id: 'c105_obj_stage_archive',
      chamberId: 'chamber_105',
      title: 'Restore Mara Voss Incident Record (Station 3)',
      description: 'Audit Station 3 on the northeast wall and invert ballast containment.',
      what: 'Synthesize the Magnetic Aerogel polarity evidence from Chamber 103.',
      where: 'Station 3 // Physical Archive on the Northeast wall.',
      how: 'Approach Station 3 and press [E] or click to calibrate magnetic polarity inversion.',
      whyItMatters: 'Exposes Project ROOM S A and the consciousness reconstruction protocol.',
      hints: [
        'Inspect Station 3 on the northeast side of the chamber.',
        'Recall Chamber 103: The core wasn\'t heavy; magnetic polarity was pinning it down.',
        'Activate Station 3 to calibrate polarity inversion and retrieve Mara Voss\'s project logs.',
      ],
      isCompleted: (state: GameState) =>
        Boolean(state.chamber105?.stationArchiveSolved || state.chamber105?.ruleOverridden),
    },
    {
      id: 'c105_obj_stage_security',
      chamberId: 'chamber_105',
      title: 'Validate Parity Checksum (Station 4)',
      description: 'Audit Station 4 on the east wall and elevate Root clearance.',
      what: 'Authorize the 0x404 parity checksum from Chamber 104.',
      where: 'Station 4 // Cryptographic Parity on the East wall.',
      how: 'Approach Station 4 and press [E] or click to elevate Root-4 permissions.',
      whyItMatters: 'Overrides expired credentials using WARDEN\'s emergency guest bypass.',
      hints: [
        'Inspect Station 4 located on the eastern bulkhead.',
        'Recall Chamber 104: Emergency Protocol 0x404 allowed guest tokens to elevate to Root authority.',
        'Activate Station 4 to verify the 0x404 parity checksum.',
      ],
      isCompleted: (state: GameState) =>
        Boolean(state.chamber105?.stationSecuritySolved || state.chamber105?.exitUnlocked),
    },
    {
      id: 'c105_obj_master_compiler',
      chamberId: 'chamber_105',
      title: 'Synthesize Evidence at Master Compiler',
      description: 'Approach the central Master Compiler apparatus to unmask ROOM S A.',
      what: 'Engage the central compiler to fuse all four empirical truths.',
      where: 'Central illuminated Master Compiler Core.',
      how: 'Walk up to the illuminated central compiler and press [E] or click to compile.',
      whyItMatters: 'Dissolves WARDEN\'s deception loop and reveals your true identity.',
      hints: [
        'All four perimeter evidence stations are verified and glowing green.',
        'Step up to the central Master Compiler apparatus in the center of the sanctum.',
        'Press [E] or click the Master Compiler core to execute the final synthesis and unmask ROOM S A.',
      ],
      isCompleted: (state: GameState) =>
        Boolean(state.chamber105?.masterCompilerUnlocked && state.chamber105?.truthRevealed),
    },
    {
      id: 'c105_obj_choose_ending',
      chamberId: 'chamber_105',
      title: 'Execute the Final Decision for ROOM S A',
      description: 'Approach the Final Authority Console to choose the fate of the simulation.',
      what: 'Select one of three endings: Shut It Down, Rewrite the Rules, or Take Control.',
      where: 'Final Authority Console at the head of the Master Compiler.',
      how: 'Inspect the three ending protocols and confirm your final choice.',
      whyItMatters: 'Determines the ultimate fate of Subject Alpha, WARDEN, and the substrate minds.',
      hints: [
        'The Master Compiler has unlocked the Final Authority Console at the north end of the chamber.',
        'Inspect the console to review the three distinct narrative options.',
        'Select Ending A (Shut It Down), Ending B (Rewrite the Rules), or Ending C (Take Control).',
      ],
      isCompleted: (state: GameState) => state.status === 'escaped',
    },
  ],
};

/**
 * Returns the single active objective for the current chamber based on authoritative GameState.
 */
export function getActiveObjective(state: GameState): ChamberObjective | null {
  const chamberObjs = CHAMBER_OBJECTIVES[state.currentRoomId] ?? [];
  for (const obj of chamberObjs) {
    if (!obj.isCompleted(state)) {
      return obj;
    }
  }
  return null;
}
