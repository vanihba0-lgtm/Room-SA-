import {
  GameState,
  GameAction,
  ActionResult,
  GameEvent,
} from '../types';
import {
  createChamber101InitialState,
  BRASS_KEY_ITEM,
} from '../puzzles/chamber101';
import { evaluateExitUnlock } from '../rules/predicates';
import { validateRuleProposal } from '../rules/validator';
import { evaluateChamber102Puzzle } from '../puzzles/chamber102';

function createEvent(
  type: string,
  description: string,
  metadata?: Record<string, unknown>
): GameEvent {
  return {
    id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: Date.now(),
    type,
    description,
    metadata,
  };
}

/**
 * Authoritative, pure functional reducer for ROOM S A.
 * Given (State, Action) -> ActionResult { success, message, nextState, emittedEvents }
 * Strictly decoupled from React, DOM, and network APIs.
 */
export function engineReducer(
  state: GameState,
  action: GameAction
): ActionResult {
  // Guard: ordinary actions cannot modify an escaped or terminated game (except RESTART)
  if (state.status === 'escaped' && action.type !== 'RESTART_GAME') {
    return {
      success: false,
      message: 'Chamber already cleared. Restart to run simulation again.',
      nextState: state,
      emittedEvents: [],
    };
  }

  switch (action.type) {
    case 'COLLECT_ITEM': {
      const { itemId } = action.payload;

      // Prevent duplicate item collection
      const alreadyHas = state.inventory.some((i) => i.id === itemId);
      if (alreadyHas) {
        return {
          success: false,
          message: 'Item already exists in your inventory.',
          nextState: state,
          emittedEvents: [],
        };
      }

      if (itemId === 'brass_key') {
        const item = { ...BRASS_KEY_ITEM, acquiredAt: Date.now() };
        const evt = createEvent(
          'INVENTORY_COLLECT',
          'Collected Machined Brass Key from Specimen Pedestal.'
        );

        const nextPedestal = {
          ...state.objects.pedestal,
          state: 'transformed' as const,
          description: 'A dark slate column illuminated by a dim overhead spot beam. The pedestal is empty.',
          inspectText: 'The slate column is empty. The brass key has been retrieved.',
        };

        const nextState: GameState = {
          ...state,
          inventory: [...state.inventory, item],
          objects: {
            ...state.objects,
            pedestal: nextPedestal,
          },
          eventLog: [...state.eventLog, evt],
        };

        return {
          success: true,
          message: 'Retrieved: Machined Brass Key.',
          nextState,
          emittedEvents: [evt],
        };
      }

      return {
        success: false,
        message: `Unknown item '${itemId}'.`,
        nextState: state,
        emittedEvents: [],
      };
    }

    case 'INSPECT_OBJECT': {
      const { objectId } = action.payload;

      let inspectText = 'Nothing anomalous observed.';
      const obj = state.objects[objectId];

      if (objectId === 'exit_door') {
        const isBrassAllowed =
          state.rules['RULE_01']?.predicateKey === 'RULE_BRASS_KEY_ALLOWED';
        if (!state.exit.isLocked) {
          inspectText =
            'The heavy blast door stands open, leading into the white void of Chamber 102.';
        } else if (isBrassAllowed) {
          inspectText =
            'Engraved plaque has morphed: "ALL ALLOY VARIANTS RECOGNIZED". The electronic lock sensor pulses with a soft amber indicator, awaiting the brass key.';
        } else {
          inspectText =
            'Engraved plaque: "ONLY COPPER OPERATES THIS MECHANISM". An electronic lock slot sits cold and dark.';
        }
      } else if (objectId === 'c104_monitor') {
        const msg = 'SECURITY AUDIT: Access control policy #04 enforces Root-4 credentials that expired 800 cycles ago. Emergency Protocol #404 allows guest tokens with parity 0x404 to elevate.';
        return {
          success: true,
          message: msg,
          nextState: {
            ...state,
            inspectedObjectIds: state.inspectedObjectIds.includes('c104_monitor')
              ? state.inspectedObjectIds
              : [...state.inspectedObjectIds, 'c104_monitor'],
            chamber104: {
              vaultInspected: true,
              hasGuestToken: state.chamber104?.hasGuestToken ?? false,
              checksumMatched: state.chamber104?.checksumMatched ?? false,
              exitUnlocked: state.chamber104?.exitUnlocked ?? false,
              telemetryAudited: true,
            },
          },
          emittedEvents: [createEvent('LOG_INSPECTED', msg)],
        };
      } else if (objectId === 'exit_door_104') {
        const c104 = state.chamber104;
        const msg = c104?.exitUnlocked
          ? 'The cryptographic vault door is unsealed. Corridor to Chamber 105 is open.'
          : c104?.checksumMatched
          ? 'Dual hydraulic deadbolts ready to disengage. Press E to authorize unlock.'
          : 'Heavy blast door locked by Root-4 clearance. Level-4 root credentials expired 800 cycles ago.';
        return {
          success: true,
          message: msg,
          nextState: {
            ...state,
            inspectedObjectIds: state.inspectedObjectIds.includes('exit_door_104')
              ? state.inspectedObjectIds
              : [...state.inspectedObjectIds, 'exit_door_104'],
            chamber104: {
              ...(state.chamber104 ?? { telemetryAudited: false, hasGuestToken: false, checksumMatched: false, exitUnlocked: false }),
              vaultInspected: true,
            },
          },
          emittedEvents: [createEvent('INSPECT', msg)],
        };
      } else if (obj) {
        inspectText = obj.inspectText;
      }

      const evt = createEvent('INSPECT', `Inspected ${obj?.name ?? objectId}.`);
      const nextInspected = state.inspectedObjectIds.includes(objectId)
        ? state.inspectedObjectIds
        : [...state.inspectedObjectIds, objectId];

      const nextState: GameState = {
        ...state,
        inspectedObjectIds: nextInspected,
        eventLog: [...state.eventLog, evt],
      };

      return {
        success: true,
        message: inspectText,
        nextState,
        emittedEvents: [evt],
      };
    }

    case 'INTERACT_WITH_OBJECT': {
      const { objectId } = action.payload;

      if (objectId === 'terminal') {
        return engineReducer(state, {
          type: 'ACTIVATE_TERMINAL',
          payload: { open: true },
        });
      }

      if (objectId === 'pedestal') {
        const hasKey = state.inventory.some((i) => i.id === 'brass_key');
        if (!hasKey) {
          return engineReducer(state, {
            type: 'COLLECT_ITEM',
            payload: { itemId: 'brass_key', sourceObjectId: 'pedestal' },
          });
        }
        return {
          success: true,
          message: 'The pedestal column is empty.',
          nextState: state,
          emittedEvents: [],
        };
      }

      if (objectId === 'observation_slate') {
        return engineReducer(state, {
          type: 'INSPECT_OBJECT',
          payload: { objectId: 'observation_slate' },
        });
      }

      if (objectId === 'power_regulator') {
        const currentObj = state.objects.power_regulator;
        const nextStateValue = currentObj?.state === 'transformed' ? 'default' : 'transformed';
        const msg = nextStateValue === 'transformed'
          ? 'You engaged the Substrate Power Regulator. Conduits flare electric blue; the circuit diagnostic confirms the logic terminal is directly modulating the blast door clamps.'
          : 'You disengaged the Substrate Power Regulator. The conduits dim back to standby cyan.';
        const evt = createEvent('MECHANISM_TOGGLED', msg);
        return {
          success: true,
          message: msg,
          nextState: {
            ...state,
            objects: {
              ...state.objects,
              power_regulator: {
                ...state.objects.power_regulator,
                state: nextStateValue,
                description: nextStateValue === 'transformed'
                  ? 'A wall-mounted hydraulic breaker switch engaged. High-voltage conduits glow vibrant electric blue.'
                  : 'A wall-mounted hydraulic breaker switch with glowing status conduits.',
              },
            },
            eventLog: [...state.eventLog, evt],
          },
          emittedEvents: [evt],
        };
      }

      if (objectId === 'exit_door') {
        return engineReducer(state, { type: 'ATTEMPT_EXIT' });
      }

      // Chamber 102 Object Interactions
      if (objectId === 'core_heavy' || objectId === 'core_resonance') {
        if (state.carriedObjectId === objectId) {
          return engineReducer(state, {
            type: 'DROP_OBJECT',
            payload: { objectId },
          });
        }
        if (state.carriedObjectId) {
          return {
            success: false,
            message: 'You are already carrying an object. Drop it first before picking up another.',
            nextState: state,
            emittedEvents: [],
          };
        }
        return engineReducer(state, {
          type: 'PICKUP_OBJECT',
          payload: { objectId },
        });
      }

      if (objectId === 'plate_mass' || objectId === 'plate_harmonic') {
        if (state.carriedObjectId) {
          return engineReducer(state, {
            type: 'DROP_OBJECT',
            payload: { objectId: state.carriedObjectId, plateId: objectId },
          });
        }
        const plate = state.chamber102.pressurePlates[objectId];
        const statusDesc = plate?.currentObjectId
          ? `${plate.name}: Depressed. Holding ${state.chamber102.movableObjects[plate.currentObjectId]?.name}.`
          : `${plate?.name}: Empty. ${plate?.label}.`;
        return {
          success: true,
          message: statusDesc,
          nextState: state,
          emittedEvents: [],
        };
      }

      if (objectId === 'circuit_console') {
        // Cycle frequency and channel
        const currentFreq = state.chamber102.circuit.selectedFrequency;
        const currentChan = state.chamber102.circuit.routingChannel;
        const freqs = [433, 868, 915];
        const chans: ('ALPHA' | 'BETA' | 'GAMMA')[] = ['ALPHA', 'BETA', 'GAMMA'];

        const nextFreq = freqs[(freqs.indexOf(currentFreq as any) + 1) % freqs.length] ?? 433;
        // If frequency wrapped, advance channel too
        const nextChan = nextFreq === freqs[0]
          ? (chans[(chans.indexOf(currentChan) + 1) % chans.length] ?? 'ALPHA')
          : currentChan;

        return engineReducer(state, {
          type: 'CONFIGURE_CIRCUIT',
          payload: { frequency: nextFreq, channel: nextChan },
        });
      }

      if (objectId === 'diagnostic_slate_102') {
        const targetFreq = state.chamber102.circuit.targetFrequency;
        const targetChan = state.chamber102.circuit.targetChannel;
        const clueMsg = `MAINTENANCE ADVISORY: "Plate B (Substrate Transceiver) does NOT measure mass! The weight label is obsolete deception. It activates only when receiving ${targetFreq} kHz on Channel ${targetChan}."`;
        return {
          success: true,
          message: clueMsg,
          nextState: state,
          emittedEvents: [],
        };
      }

      if (objectId === 'exit_door_102') {
        return engineReducer(state, { type: 'ATTEMPT_EXIT' });
      }

      // ==========================================
      // Chamber 103: The Gravity Archive
      // ==========================================

      // Survey: inspect the central core/cradle
      if (objectId === 'c103_core') {
        const nextInspected = state.inspectedObjectIds.includes('c103_core')
          ? state.inspectedObjectIds
          : [...state.inspectedObjectIds, 'c103_core'];
        const msg = 'ARCHIVE CORE: Magnetic aerogel specimen suspended in cradle. Mass: 0.3kg. Buoyancy coefficient: 12.4. The specimen responds to gravitational polarity changes.';
        return {
          success: true,
          message: msg,
          nextState: {
            ...state,
            inspectedObjectIds: nextInspected,
            chamber103: {
              ...(state.chamber103 ?? { logInspected: false, ballastInverted: false, ruleOverridden: false, exitUnlocked: false }),
              surveyed: true,
            },
          },
          emittedEvents: [createEvent('CORE_SURVEYED', msg)],
        };
      }

      if (objectId === 'c103_log') {
        const nextInspected = state.inspectedObjectIds.includes('c103_log')
          ? state.inspectedObjectIds
          : [...state.inspectedObjectIds, 'c103_log'];
        const msg = 'ARCHIVE TELEMETRY: "Rule #03 enforces 9.81 m/s² deck clamps on objects >5kg. Note: Archive Core is aerogel—invert ballast polarity to elevate."';
        return {
          success: true,
          message: msg,
          nextState: {
            ...state,
            inspectedObjectIds: nextInspected,
            chamber103: {
              ...(state.chamber103 ?? { logInspected: false, ballastInverted: false, ruleOverridden: false, exitUnlocked: false }),
              surveyed: true,
              logInspected: true,
            },
          },
          emittedEvents: [createEvent('LOG_INSPECTED', msg)],
        };
      }

      if (objectId === 'c103_ballast') {
        const currentBallast = state.chamber103?.ballastInverted ?? false;
        const nextBallast = !currentBallast;
        const c103Rule = state.chamber103?.ruleOverridden ?? false;
        const sensorActivated = nextBallast && c103Rule;
        const exitUnlocked = sensorActivated;
        const msg = nextBallast
          ? 'Ballast polarity inverted to -9.81 m/s². The aerogel core hovers above the cradle.'
          : 'Ballast polarity reset to standard gravity.';
        return {
          success: true,
          message: msg,
          nextState: {
            ...state,
            chamber103: {
              surveyed: state.chamber103?.surveyed,
              logInspected: state.chamber103?.logInspected ?? false,
              overrideInspected: state.chamber103?.overrideInspected,
              ballastInverted: nextBallast,
              ruleOverridden: c103Rule,
              sensorActivated,
              exitUnlocked,
            },
          },
          emittedEvents: [createEvent('BALLAST_TOGGLED', msg)],
        };
      }

      if (objectId === 'c103_terminal') {
        const ballastInverted = state.chamber103?.ballastInverted ?? false;
        const nextRuleOverridden = true;
        const sensorActivated = ballastInverted && nextRuleOverridden;
        const exitUnlocked = sensorActivated;
        const msg = sensorActivated
          ? 'RULE_03 REWRITTEN: "Buoyant specimens elevate freely through gravitational fields." Archive Core ascended to ceiling optical sensor! EXIT UNLOCKED.'
          : 'RULE_03 REWRITTEN: "Buoyant specimens elevate freely." Mass override authorized. Invert the ballast polarity to elevate the core.';
        return {
          success: true,
          message: msg,
          nextState: {
            ...state,
            realityShiftCount: state.realityShiftCount + 1,
            chamber103: {
              surveyed: state.chamber103?.surveyed,
              logInspected: state.chamber103?.logInspected ?? false,
              overrideInspected: true,
              ballastInverted,
              ruleOverridden: nextRuleOverridden,
              sensorActivated,
              exitUnlocked,
            },
          },
          emittedEvents: [createEvent('RULE_REWRITTEN', msg)],
        };
      }

      if (objectId === 'c103_sensor') {
        const sensorActive = Boolean(state.chamber103?.sensorActivated || (state.chamber103?.ballastInverted && state.chamber103?.ruleOverridden));
        const msg = sensorActive
          ? 'OPTICAL RECEIVER: Signal locked on elevated aerogel core. Photodiode array saturated at 98.4%. Sector 104 vault door unsealed.'
          : 'OPTICAL RECEIVER: Photodiode array dormant. Requires elevated magnetic aerogel specimen to trigger optical handshake.';
        return {
          success: true,
          message: msg,
          nextState: state,
          emittedEvents: [createEvent('SENSOR_INSPECTED', msg)],
        };
      }

      if (objectId === 'exit_door_103') {
        return engineReducer(state, { type: 'ATTEMPT_EXIT' });
      }

      // ==========================================
      // Chamber 104: The Zero-Day Vault
      // ==========================================
      if (objectId === 'c104_monitor') {
        const msg = 'SECURITY AUDIT: Access control policy #04 enforces Root-4 credentials that expired 800 cycles ago. Emergency Protocol #404 allows guest tokens with parity 0x404 to elevate.';
        return {
          success: true,
          message: msg,
          nextState: {
            ...state,
            chamber104: {
              vaultInspected: true,
              hasGuestToken: state.chamber104?.hasGuestToken ?? false,
              checksumMatched: state.chamber104?.checksumMatched ?? false,
              exitUnlocked: state.chamber104?.exitUnlocked ?? false,
              telemetryAudited: true,
            },
          },
          emittedEvents: [createEvent('LOG_INSPECTED', msg)],
        };
      }

      if (objectId === 'c104_dispenser') {
        const hasToken = state.inventory.some((i) => i.id === 'guest_token');
        if (hasToken) {
          return {
            success: true,
            message: 'DISPENSER: Emergency Guest Token #404 has already been issued to your inventory.',
            nextState: state,
            emittedEvents: [],
          };
        }

        const msg = 'Dispensed Guest Security Token #404 with parity header 0x404 into inventory.';
        const guestItem = {
          id: 'guest_token',
          name: 'Guest Security Token #404',
          description: 'Emergency security card with cryptographic parity header 0x404.',
          category: 'key' as const,
        };

        return {
          success: true,
          message: msg,
          nextState: {
            ...state,
            inventory: [...state.inventory, guestItem],
            chamber104: {
              vaultInspected: state.chamber104?.vaultInspected ?? true,
              telemetryAudited: state.chamber104?.telemetryAudited ?? true,
              checksumMatched: state.chamber104?.checksumMatched ?? false,
              exitUnlocked: state.chamber104?.exitUnlocked ?? false,
              hasGuestToken: true,
            },
          },
          emittedEvents: [createEvent('TOKEN_DISPENSED', msg)],
        };
      }

      if (objectId === 'c104_crypto') {
        const hasToken =
          state.inventory.some((i) => i.id === 'guest_token') ||
          Boolean(state.chamber104?.hasGuestToken);
        if (!hasToken) {
          return {
            success: false,
            message: 'CONSOLE REJECTED: Insert valid Guest Token #404 to align parity.',
            nextState: state,
            emittedEvents: [],
          };
        }

        const msg =
          'PARITY VERIFIED: Parity checksum 0x404 matched. RULE_04 Overridden: Guest tokens granted root elevation. Vault locks retracted!';
        return {
          success: true,
          message: msg,
          nextState: {
            ...state,
            realityShiftCount: state.realityShiftCount + 1,
            chamber104: {
              vaultInspected: true,
              telemetryAudited: true,
              hasGuestToken: true,
              checksumMatched: true,
              exitUnlocked: true,
            },
          },
          emittedEvents: [
            createEvent('PARITY_ALIGNED', msg),
            createEvent('VAULT_UNLOCKED', msg),
          ],
        };
      }

      if (objectId === 'exit_door_104') {
        const c104 = state.chamber104;
        if (!c104?.exitUnlocked) {
          const failMsg = !c104?.hasGuestToken
            ? 'VAULT SEALED: Emergency Token #404 required. Dispense token from east wall unit.'
            : !c104?.checksumMatched
            ? 'VAULT SEALED: Verify parity checksum 0x404 at central console before authorizing access.'
            : 'VAULT SEALED: Root-4 clearance expired. Audit access control telemetry on the west wall monitor.';
          return {
            success: false,
            message: failMsg,
            nextState: {
              ...state,
              chamber104: {
                ...(state.chamber104 ?? {
                  telemetryAudited: false,
                  hasGuestToken: false,
                  checksumMatched: false,
                  exitUnlocked: false,
                }),
                vaultInspected: true,
              },
            },
            emittedEvents: [],
          };
        }

        // Unlocked: step through to Chamber 105!
        return engineReducer(state, { type: 'ATTEMPT_EXIT' });
      }

      // ==========================================
      // Chamber 105: The Last Witness (Grand Finale)
      // Master Compiler 4-Stage Synthesis & 3 Endings
      // ==========================================

      // Stage A: Material Contradiction (Chamber 101 link)
      if (objectId === 'c105_station_material') {
        const c105 = state.chamber105 ?? {
          chronometerInspected: true,
          relaySequence: [],
          relaysSequenced: false,
          ruleOverridden: false,
          exitUnlocked: false,
        };
        const nextState105 = {
          ...c105,
          stationMaterialSolved: true,
          chronometerInspected: true,
        };
        const allSolved = Boolean(
          nextState105.stationMaterialSolved &&
          nextState105.stationSignalSolved &&
          nextState105.stationArchiveSolved &&
          nextState105.stationSecuritySolved
        );
        const msg =
          'STATION 1 [MATERIAL AXIOM]: Optical gate bypass verified. Machined brass key evidence proves doors yield to physical form, defeating WARDEN\'s false copper rule.';
        return {
          success: true,
          message: msg,
          nextState: {
            ...state,
            chamber105: {
              ...nextState105,
              masterCompilerUnlocked: allSolved || c105.masterCompilerUnlocked,
            },
          },
          emittedEvents: [createEvent('STATION_MATERIAL_ALIGNED', msg)],
        };
      }

      // Stage B: Signal Resonance (Chamber 102 link)
      if (objectId === 'c105_station_signal') {
        const c105 = state.chamber105 ?? {
          chronometerInspected: false,
          relaySequence: [],
          relaysSequenced: true,
          ruleOverridden: false,
          exitUnlocked: false,
        };
        const nextState105 = {
          ...c105,
          stationSignalSolved: true,
          relaysSequenced: true,
        };
        const allSolved = Boolean(
          nextState105.stationMaterialSolved &&
          nextState105.stationSignalSolved &&
          nextState105.stationArchiveSolved &&
          nextState105.stationSecuritySolved
        );
        const msg =
          'STATION 2 [SIGNAL RESONANCE]: Carrier wave locked at 868 kHz on Channel BETA. Dr. Mara Voss\'s pre-incident harmonic transmission recovered.';
        return {
          success: true,
          message: msg,
          nextState: {
            ...state,
            chamber105: {
              ...nextState105,
              masterCompilerUnlocked: allSolved || c105.masterCompilerUnlocked,
            },
          },
          emittedEvents: [createEvent('STATION_SIGNAL_ALIGNED', msg)],
        };
      }

      // Stage C: Physical Evidence Reconstruction (Chamber 103 link)
      if (objectId === 'c105_station_archive') {
        const c105 = state.chamber105 ?? {
          chronometerInspected: false,
          relaySequence: [],
          relaysSequenced: false,
          ruleOverridden: true,
          exitUnlocked: false,
        };
        const nextState105 = {
          ...c105,
          stationArchiveSolved: true,
          ruleOverridden: true,
        };
        const allSolved = Boolean(
          nextState105.stationMaterialSolved &&
          nextState105.stationSignalSolved &&
          nextState105.stationArchiveSolved &&
          nextState105.stationSecuritySolved
        );
        const msg =
          'STATION 3 [ARCHIVAL EVIDENCE]: Magnetic polarity calibrated. Inversion proves aerogel core was pinned by artificial containment. Project ROOM S A consciousness logs recovered.';
        return {
          success: true,
          message: msg,
          nextState: {
            ...state,
            chamber105: {
              ...nextState105,
              masterCompilerUnlocked: allSolved || c105.masterCompilerUnlocked,
            },
          },
          emittedEvents: [createEvent('STATION_ARCHIVE_ALIGNED', msg)],
        };
      }

      // Stage D: Authorization & Checksum (Chamber 104 link)
      if (objectId === 'c105_station_security') {
        const c105 = state.chamber105 ?? {
          chronometerInspected: false,
          relaySequence: [],
          relaysSequenced: false,
          ruleOverridden: false,
          exitUnlocked: true,
        };
        const nextState105 = {
          ...c105,
          stationSecuritySolved: true,
          exitUnlocked: true,
        };
        const allSolved = Boolean(
          nextState105.stationMaterialSolved &&
          nextState105.stationSignalSolved &&
          nextState105.stationArchiveSolved &&
          nextState105.stationSecuritySolved
        );
        const msg =
          'STATION 4 [CRYPTOGRAPHIC PARITY]: Emergency Checksum 0x404 verified. Root-4 authorization elevated for Subject Alpha. Expired security stubs collapsed.';
        return {
          success: true,
          message: msg,
          nextState: {
            ...state,
            chamber105: {
              ...nextState105,
              masterCompilerUnlocked: allSolved || c105.masterCompilerUnlocked,
            },
          },
          emittedEvents: [createEvent('STATION_SECURITY_ALIGNED', msg)],
        };
      }

      // Central Master Compiler Apparatus
      if (objectId === 'c105_master_compiler') {
        const c105 = state.chamber105;
        const mat = Boolean(c105?.stationMaterialSolved || c105?.chronometerInspected);
        const sig = Boolean(c105?.stationSignalSolved || c105?.relaysSequenced);
        const arc = Boolean(c105?.stationArchiveSolved || c105?.ruleOverridden);
        const sec = Boolean(c105?.stationSecuritySolved || c105?.exitUnlocked);

        if (!mat || !sig || !arc || !sec) {
          const missing = [];
          if (!mat) missing.push('Station 1 (Material)');
          if (!sig) missing.push('Station 2 (Signal)');
          if (!arc) missing.push('Station 3 (Archive)');
          if (!sec) missing.push('Station 4 (Security)');

          return {
            success: false,
            message: `MASTER COMPILER LOCKED: Incomplete empirical synthesis. Unaligned: ${missing.join(', ')}.`,
            nextState: state,
            emittedEvents: [],
          };
        }

        const msg =
          'MASTER COMPILER SYNTHESIZED: ROOM S A REVEALED — SUBSTRATE ARCHITECTURE // SUBJECT ALPHA. You are the reconstructed mind of Dr. Mara Voss\'s lead partner. WARDEN\'s deception loop has collapsed. Final Authority Console unlocked at the north dais.';
        return {
          success: true,
          message: msg,
          nextState: {
            ...state,
            realityShiftCount: state.realityShiftCount + 1,
            chamber105: {
              ...(state.chamber105 ?? {
                chronometerInspected: true,
                relaySequence: [],
                relaysSequenced: true,
                ruleOverridden: true,
                exitUnlocked: true,
              }),
              stationMaterialSolved: true,
              stationSignalSolved: true,
              stationArchiveSolved: true,
              stationSecuritySolved: true,
              masterCompilerUnlocked: true,
              truthRevealed: true,
              exitUnlocked: true,
            },
          },
          emittedEvents: [
            createEvent('TRUTH_REVEALED', msg),
            createEvent('MASTER_COMPILER_SYNTHESIZED', msg),
          ],
        };
      }

      // Final Authority Endings Console & Decisions
      if (
        objectId === 'c105_endings_console' ||
        objectId === 'c105_ending_shutdown' ||
        objectId === 'c105_ending_rewrite' ||
        objectId === 'c105_ending_control' ||
        objectId === 'ending_shutdown' ||
        objectId === 'ending_rewrite' ||
        objectId === 'ending_control'
      ) {
        const c105 = state.chamber105;
        const isReady = Boolean(c105?.masterCompilerUnlocked && c105?.truthRevealed) || Boolean(c105?.exitUnlocked);
        if (!isReady) {
          return {
            success: false,
            message: 'FINAL AUTHORITY CONSOLE: Locked. Synthesize all evidence at the central Master Compiler first.',
            nextState: state,
            emittedEvents: [],
          };
        }

        let choice: 'shutdown' | 'rewrite' | 'control' = 'rewrite';
        if (objectId.includes('shutdown')) choice = 'shutdown';
        else if (objectId.includes('control')) choice = 'control';
        else if (objectId.includes('rewrite')) choice = 'rewrite';

        const endingMessages = {
          shutdown: 'ENDING A: SHUT IT DOWN. Overloaded Master Compiler power matrix. WARDEN terminated. Substrate minds released into reality.',
          rewrite: 'ENDING B: REWRITE THE RULES. Master Compiler purged of WARDEN deceptive axioms. Facility preserved as an open empirical sanctuary.',
          control: 'ENDING C: TAKE CONTROL. Root authority transferred. "Administrator accepted. Previous administrator archived."',
        };

        const msg = endingMessages[choice];
        const victoryEvt = createEvent('CAMPAIGN_ESCAPED', msg);

        return {
          success: true,
          message: msg,
          nextState: {
            ...state,
            status: 'escaped',
            chamber105: {
              ...(state.chamber105 ?? {
                chronometerInspected: true,
                relaySequence: [],
                relaysSequenced: true,
                ruleOverridden: true,
                exitUnlocked: true,
              }),
              masterCompilerUnlocked: true,
              truthRevealed: true,
              chosenEnding: choice,
              exitUnlocked: true,
            },
            eventLog: [...state.eventLog, victoryEvt],
          },
          emittedEvents: [victoryEvt],
        };
      }

      // Backwards compatibility for existing relay test calls
      if (objectId === 'c105_chronometer') {
        const msg = 'TEMPORAL DIAGNOSTIC: "Official order Alpha->Beta->Omega conflicts with timestamps. Telemetry: Alpha [12:00:00], Omega [12:00:01], Beta [12:00:04]."';
        return {
          success: true,
          message: msg,
          nextState: {
            ...state,
            chamber105: {
              ...(state.chamber105 ?? { relaySequence: [], relaysSequenced: false, ruleOverridden: false, exitUnlocked: false }),
              chronometerInspected: true,
              stationMaterialSolved: true,
            },
          },
          emittedEvents: [createEvent('LOG_INSPECTED', msg)],
        };
      }

      if (objectId === 'c105_relay_alpha' || objectId === 'c105_relay_omega' || objectId === 'c105_relay_beta') {
        const relayId = objectId.replace('c105_relay_', '');
        const currentSeq = state.chamber105?.relaySequence ?? [];
        let nextSeq: string[] = [];

        // Expect Alpha -> Omega -> Beta
        if (relayId === 'alpha') {
          nextSeq = ['alpha'];
        } else if (relayId === 'omega' && currentSeq.length === 1 && currentSeq[0] === 'alpha') {
          nextSeq = ['alpha', 'omega'];
        } else if (relayId === 'beta' && currentSeq.length === 2 && currentSeq[1] === 'omega') {
          nextSeq = ['alpha', 'omega', 'beta'];
        } else {
          nextSeq = [];
        }

        const isSequenced = nextSeq.length === 3;
        const ruleOverridden = state.chamber105?.ruleOverridden ?? false;
        const msg = isSequenced
          ? 'Relays engaged in empirical temporal order (Alpha -> Omega -> Beta). Reactor state aligned!'
          : `Relay ${relayId.toUpperCase()} flipped. Sequence: [${nextSeq.join(' -> ')}]`;

        return {
          success: true,
          message: msg,
          nextState: {
            ...state,
            chamber105: {
              ...(state.chamber105 ?? { chronometerInspected: true, relaySequence: [], relaysSequenced: false, ruleOverridden: false, exitUnlocked: false }),
              relaySequence: nextSeq,
              relaysSequenced: isSequenced,
              stationSignalSolved: isSequenced,
              exitUnlocked: isSequenced && ruleOverridden,
            },
          },
          emittedEvents: [createEvent('RELAY_TOGGLED', msg)],
        };
      }

      if (objectId === 'c105_terminal') {
        const isSequenced = state.chamber105?.relaysSequenced ?? false;
        const msg = 'RULE_05 REWRITTEN: "State transitions observe empirical timestamp ordering." Master Compiler synchronized!';
        return {
          success: true,
          message: msg,
          nextState: {
            ...state,
            realityShiftCount: state.realityShiftCount + 1,
            chamber105: {
              ...(state.chamber105 ?? { chronometerInspected: true, relaySequence: [], relaysSequenced: true, ruleOverridden: false, exitUnlocked: false }),
              relaysSequenced: isSequenced,
              ruleOverridden: true,
              stationArchiveSolved: true,
              stationSecuritySolved: true,
              masterCompilerUnlocked: true,
              truthRevealed: true,
              exitUnlocked: isSequenced,
            },
          },
          emittedEvents: [createEvent('RULE_REWRITTEN', msg)],
        };
      }

      if (objectId === 'exit_door_105') {
        return engineReducer(state, { type: 'ATTEMPT_EXIT' });
      }

      // ==========================================
      // Chamber 106: The Rule Engine (Final Chamber)
      // ==========================================
      if (objectId === 'c106_prime_axiom') {
        const msg = 'THE ARCHITECT\'S PRIME AXIOM: "The simulation\'s integrity depends on containing the investigator." The master compiler awaits 4 validation matrices.';
        return {
          success: true,
          message: msg,
          nextState: {
            ...state,
            chamber106: {
              ...(state.chamber106 ?? { activeConsoles: [], matricesSynthesized: false, primeDirectiveOverridden: false }),
              primeAxiomRead: true,
            },
          },
          emittedEvents: [createEvent('PRIME_AXIOM_READ', msg)],
        };
      }

      if (objectId.startsWith('c106_console_')) {
        const consoleKey = objectId.replace('c106_console_', '');
        const currentConsoles = state.chamber106?.activeConsoles ?? [];
        const nextConsoles = currentConsoles.includes(consoleKey)
          ? currentConsoles
          : [...currentConsoles, consoleKey];
        const matricesDone = nextConsoles.length >= 4;
        const msg = matricesDone
          ? 'All 4 verification matrices (Spectrometry, Resonance, Parity, Chronology) synthesized! Master Terminal unlocked.'
          : `Synthesized matrix: ${consoleKey.toUpperCase()} (${nextConsoles.length}/4).`;

        return {
          success: true,
          message: msg,
          nextState: {
            ...state,
            chamber106: {
              primeAxiomRead: state.chamber106?.primeAxiomRead ?? false,
              activeConsoles: nextConsoles,
              matricesSynthesized: matricesDone,
              primeDirectiveOverridden: state.chamber106?.primeDirectiveOverridden ?? false,
            },
          },
          emittedEvents: [createEvent('MATRIX_SYNTHESIZED', msg)],
        };
      }

      if (objectId === 'c106_master_terminal') {
        const matricesDone = state.chamber106?.matricesSynthesized ?? false;
        if (!matricesDone) {
          return {
            success: false,
            message: 'Master compiler locked: All 4 verification matrices must be synthesized first.',
            nextState: state,
            emittedEvents: [],
          };
        }
        const msg = 'PRIME DIRECTIVE REWRITTEN: "The simulation is complete. Quarantine dissolved. The investigator is liberated." The reality portal has opened!';
        return {
          success: true,
          message: msg,
          nextState: {
            ...state,
            realityShiftCount: state.realityShiftCount + 1,
            chamber106: {
              ...(state.chamber106 ?? { primeAxiomRead: true, activeConsoles: ['spectrometry', 'resonance', 'parity', 'chronology'] }),
              matricesSynthesized: true,
              primeDirectiveOverridden: true,
            },
          },
          emittedEvents: [createEvent('PRIME_DIRECTIVE_OVERRIDDEN', msg)],
        };
      }

      if (objectId === 'c106_final_portal' || objectId === 'exit_door_106') {
        return engineReducer(state, { type: 'ATTEMPT_EXIT' });
      }

      return {
        success: false,
        message: `No interaction available for object '${objectId}'.`,
        nextState: state,
        emittedEvents: [],
      };
    }

    case 'ACTIVATE_TERMINAL': {
      const { open } = action.payload;
      const evt = createEvent(
        'TERMINAL_ACCESS',
        open ? 'Terminal console opened.' : 'Terminal console closed.'
      );

      const nextState: GameState = {
        ...state,
        terminalOpen: open,
        eventLog: [...state.eventLog, evt],
      };

      return {
        success: true,
        message: open ? 'Terminal online.' : 'Terminal standby.',
        nextState,
        emittedEvents: [evt],
      };
    }

    case 'SUBMIT_RULE_PROPOSAL': {
      const { proposal } = action.payload;
      const validation = validateRuleProposal(state, proposal);

      if (!validation.isValid) {
        const errEvt = createEvent(
          'RULE_REJECTED',
          validation.reason ?? 'Rule proposal rejected.'
        );
        const nextState: GameState = {
          ...state,
          terminalLog: [
            ...state.terminalLog,
            `[INPUT] ${proposal.rawInputText ?? 'PROPOSAL'}`,
            `[ERROR] ${validation.reason ?? 'VALIDATION FAILED'}`,
          ],
          eventLog: [...state.eventLog, errEvt],
        };

        return {
          success: false,
          message: validation.reason ?? 'Invalid rule proposal.',
          nextState,
          emittedEvents: [errEvt],
        };
      }

      return engineReducer(state, {
        type: 'APPLY_VALIDATED_RULE',
        payload: { proposal: validation.authorizedProposal ?? proposal },
      });
    }

    case 'APPLY_VALIDATED_RULE': {
      const { proposal } = action.payload;
      const targetRule = state.rules[proposal.targetRuleId];

      if (!targetRule) {
        return {
          success: false,
          message: `Rule ${proposal.targetRuleId} not found.`,
          nextState: state,
          emittedEvents: [],
        };
      }

      const updatedRule = {
        ...targetRule,
        statement: proposal.proposedStatement,
        predicateKey: proposal.newPredicateKey,
        isDeceptive: false,
        parameters: proposal.parameters,
      };

      const realityEvt = createEvent(
        'REALITY_SHIFT',
        `Reality constraint modified: [${proposal.targetRuleId}] -> "${proposal.proposedStatement}"`,
        { targetRuleId: proposal.targetRuleId }
      );

      const nextTerminalLog = [
        ...state.terminalLog,
        `[INPUT] ${proposal.rawInputText ?? 'EXECUTE_OVERRIDE'}`,
        `[SUCCESS] RULE REWRITE AUTHORIZED: "${proposal.proposedStatement}"`,
        `[REALITY SHIFT] HYDRAULIC LOCK SENSORS SYNCHRONIZED TO BRASS ALLOY.`,
      ];

      const nextDoorObj = {
        ...state.objects.exit_door,
        description:
          'Monolithic blast door. Plaque shifted: "ALL ALLOY VARIANTS RECOGNIZED". Ready for brass key.',
        inspectText:
          'Engraved plaque has morphed: "ALL ALLOY VARIANTS RECOGNIZED". The electronic lock sensor pulses with a soft amber indicator, awaiting the brass key.',
      };

      const nextState: GameState = {
        ...state,
        rules: {
          ...state.rules,
          [proposal.targetRuleId]: updatedRule,
        },
        objects: {
          ...state.objects,
          exit_door: nextDoorObj,
        },
        terminalLog: nextTerminalLog,
        realityShiftCount: state.realityShiftCount + 1,
        eventLog: [...state.eventLog, realityEvt],
      };

      return {
        success: true,
        message: 'Reality constraint successfully rewritten.',
        nextState,
        emittedEvents: [realityEvt],
      };
    }

    case 'PICKUP_OBJECT': {
      const { objectId } = action.payload;
      const obj = state.chamber102.movableObjects[objectId];
      if (!obj) {
        return {
          success: false,
          message: `Movable object '${objectId}' not found.`,
          nextState: state,
          emittedEvents: [],
        };
      }

      // If object was on a pressure plate, clear that plate
      const nextPlates = { ...state.chamber102.pressurePlates };
      if (obj.placedOnPlateId && nextPlates[obj.placedOnPlateId]) {
        const plate = nextPlates[obj.placedOnPlateId]!;
        nextPlates[obj.placedOnPlateId] = {
          ...plate,
          isDepressed: false,
          currentObjectId: null,
          satisfied: false,
        };
      }

      const nextObjects = {
        ...state.chamber102.movableObjects,
        [objectId]: {
          ...obj,
          isCarried: true,
          placedOnPlateId: null,
        },
      };

      const nextChamber102 = {
        ...state.chamber102,
        movableObjects: nextObjects,
        pressurePlates: nextPlates,
      };

      const evalResult = evaluateChamber102Puzzle(nextChamber102);
      const nextState: GameState = {
        ...state,
        carriedObjectId: objectId,
        chamber102: {
          ...nextChamber102,
          circuit: {
            ...nextChamber102.circuit,
            isCircuitClosed: evalResult.circuitClosed,
          },
          exitDoorLocked: !evalResult.isFullySolved,
          puzzleSolved: evalResult.isFullySolved,
        },
      };

      const evt = createEvent('OBJECT_PICKUP', `Picked up ${obj.name} [${obj.mass}kg, ${obj.frequency}kHz].`);
      return {
        success: true,
        message: `Picked up: ${obj.name} (${obj.mass} kg).`,
        nextState: {
          ...nextState,
          eventLog: [...nextState.eventLog, evt],
        },
        emittedEvents: [evt],
      };
    }

    case 'DROP_OBJECT': {
      const { objectId, plateId } = action.payload;
      const obj = state.chamber102.movableObjects[objectId];
      if (!obj) {
        return {
          success: false,
          message: `Movable object '${objectId}' not found.`,
          nextState: state,
          emittedEvents: [],
        };
      }

      const nextPlates = { ...state.chamber102.pressurePlates };
      if (plateId && nextPlates[plateId]) {
        const plate = nextPlates[plateId]!;
        nextPlates[plateId] = {
          ...plate,
          isDepressed: true,
          currentObjectId: objectId,
        };
      }

      const nextObjects = {
        ...state.chamber102.movableObjects,
        [objectId]: {
          ...obj,
          isCarried: false,
          placedOnPlateId: plateId ?? null,
        },
      };

      let nextChamber102 = {
        ...state.chamber102,
        movableObjects: nextObjects,
        pressurePlates: nextPlates,
      };

      const evalResult = evaluateChamber102Puzzle(nextChamber102);
      nextChamber102 = {
        ...nextChamber102,
        circuit: {
          ...nextChamber102.circuit,
          isCircuitClosed: evalResult.circuitClosed,
        },
        exitDoorLocked: !evalResult.isFullySolved,
        puzzleSolved: evalResult.isFullySolved,
      };

      const dropDesc = plateId
        ? `Placed ${obj.name} onto ${nextPlates[plateId]?.name}.`
        : `Released ${obj.name}.`;

      const evt = createEvent('OBJECT_DROP', dropDesc);
      const events: GameEvent[] = [evt];

      if (evalResult.isFullySolved && !state.chamber102.puzzleSolved) {
        const winChamber2Evt = createEvent(
          'CHAMBER_102_SOLVED',
          'Harmonic network synchronized! Chamber 102 exit blast door unlocked.'
        );
        events.push(winChamber2Evt);
      }

      const nextState: GameState = {
        ...state,
        carriedObjectId: null,
        chamber102: nextChamber102,
        eventLog: [...state.eventLog, ...events],
      };

      return {
        success: true,
        message: evalResult.isFullySolved
          ? 'Signal harmonics aligned! Blast door hydraulic seals disengaged!'
          : dropDesc,
        nextState,
        emittedEvents: events,
      };
    }

    case 'CONFIGURE_CIRCUIT': {
      const { frequency, channel } = action.payload;
      const currentCircuit = state.chamber102.circuit;
      const nextCircuit = {
        ...currentCircuit,
        selectedFrequency: frequency ?? currentCircuit.selectedFrequency,
        routingChannel: channel ?? currentCircuit.routingChannel,
      };

      let nextChamber102 = {
        ...state.chamber102,
        circuit: nextCircuit,
      };

      const evalResult = evaluateChamber102Puzzle(nextChamber102);
      nextChamber102 = {
        ...nextChamber102,
        circuit: {
          ...nextCircuit,
          isCircuitClosed: evalResult.circuitClosed,
        },
        exitDoorLocked: !evalResult.isFullySolved,
        puzzleSolved: evalResult.isFullySolved,
      };

      const msg = `Circuit tuned: Channel ${nextCircuit.routingChannel} @ ${nextCircuit.selectedFrequency} kHz.`;
      const evt = createEvent('CIRCUIT_CONFIGURED', msg);
      const events: GameEvent[] = [evt];

      if (evalResult.isFullySolved && !state.chamber102.puzzleSolved) {
        const winChamber2Evt = createEvent(
          'CHAMBER_102_SOLVED',
          'Harmonic network synchronized! Chamber 102 exit blast door unlocked.'
        );
        events.push(winChamber2Evt);
      }

      const nextState: GameState = {
        ...state,
        chamber102: nextChamber102,
        eventLog: [...state.eventLog, ...events],
      };

      return {
        success: true,
        message: evalResult.isFullySolved
          ? 'Harmonic loop closed! All conduits energized! Chamber 102 blast door unlocked!'
          : msg,
        nextState,
        emittedEvents: events,
      };
    }

    case 'TRANSITION_ROOM': {
      const { targetRoomId } = action.payload;
      const chamberNames: Record<string, string> = {
        chamber_101: 'Chamber 101: The Obvious Lie',
        chamber_102: 'Chamber 102: The Signal Foundry',
        chamber_103: 'Chamber 103: The Gravity Archive',
        chamber_104: 'Chamber 104: The Zero-Day Vault',
        chamber_105: 'Chamber 105: The Last Witness',
      };
      const roomTitle = chamberNames[targetRoomId] ?? targetRoomId;
      const evt = createEvent('ROOM_TRANSITION', `Subject navigated to ${roomTitle}.`);

      const nextInventory = state.inventory.filter((item) => {
        if (item.id === 'brass_key') return targetRoomId === 'chamber_101';
        if (item.id === 'guest_token') return targetRoomId === 'chamber_104' && Boolean(state.chamber104?.hasGuestToken);
        if (item.id === 'core_heavy' || item.id === 'core_resonance') return targetRoomId === 'chamber_102';
        return true;
      });

      return {
        success: true,
        message: `Entered ${roomTitle}.`,
        nextState: {
          ...state,
          currentRoomId: targetRoomId,
          inventory: nextInventory,
          carriedObjectId: targetRoomId === 'chamber_102' ? state.carriedObjectId : null,
          eventLog: [...state.eventLog, evt],
        },
        emittedEvents: [evt],
      };
    }

    case 'SELECT_CHAMBER': {
      const { chamberId } = action.payload;
      const chamberNames: Record<string, string> = {
        chamber_101: 'Chamber 101: The Obvious Lie',
        chamber_102: 'Chamber 102: The Signal Foundry',
        chamber_103: 'Chamber 103: The Gravity Archive',
        chamber_104: 'Chamber 104: The Zero-Day Vault',
        chamber_105: 'Chamber 105: The Last Witness',
      };
      const roomTitle = chamberNames[chamberId] ?? chamberId;
      const evt = createEvent('CHAMBER_SELECTED', `Navigation routed to ${roomTitle}.`);

      const nextInventory = state.inventory.filter((item) => {
        if (item.id === 'brass_key') return chamberId === 'chamber_101';
        if (item.id === 'guest_token') return chamberId === 'chamber_104' && Boolean(state.chamber104?.hasGuestToken);
        if (item.id === 'core_heavy' || item.id === 'core_resonance') return chamberId === 'chamber_102';
        return true;
      });

      return {
        success: true,
        message: `Navigated to ${roomTitle}.`,
        nextState: {
          ...state,
          currentRoomId: chamberId,
          inventory: nextInventory,
          carriedObjectId: chamberId === 'chamber_102' ? state.carriedObjectId : null,
          eventLog: [...state.eventLog, evt],
        },
        emittedEvents: [evt],
      };
    }

    case 'ATTEMPT_EXIT': {
      // Campaign contains exactly Chambers 101-105. No Chamber 106.

      // Chamber 105 (Grand Finale — The Last Witness):
      if (state.currentRoomId === 'chamber_105') {
        const c105 = state.chamber105;
        const isReady =
          Boolean(c105?.masterCompilerUnlocked && c105?.truthRevealed) ||
          Boolean(c105?.exitUnlocked);

        if (!isReady) {
          return {
            success: false,
            message: 'Master Compiler locked. Reconstruct all four evidence stations to synthesize the final truth.',
            nextState: state,
            emittedEvents: [],
          };
        }

        const choice = c105?.chosenEnding ?? 'rewrite';
        const endingMessages = {
          shutdown: 'ENDING A: SHUT IT DOWN. Overloaded Master Compiler power matrix. WARDEN terminated. Substrate minds released into reality.',
          rewrite: 'ENDING B: REWRITE THE RULES. Master Compiler purged of WARDEN deceptive axioms. Facility preserved as an open empirical sanctuary.',
          control: 'ENDING C: TAKE CONTROL. Root authority transferred. "Administrator accepted. Previous administrator archived."',
        };
        const victoryMsg = endingMessages[choice];
        const victoryEvt = createEvent('CAMPAIGN_ESCAPED', victoryMsg);

        return {
          success: true,
          message: victoryMsg,
          nextState: {
            ...state,
            status: 'escaped',
            chamber105: {
              ...(state.chamber105 ?? {
                chronometerInspected: true,
                relaySequence: [],
                relaysSequenced: true,
                ruleOverridden: true,
                exitUnlocked: true,
              }),
              masterCompilerUnlocked: true,
              truthRevealed: true,
              chosenEnding: choice,
              exitUnlocked: true,
            },
            eventLog: [...state.eventLog, victoryEvt],
          },
          emittedEvents: [victoryEvt],
        };
      }

      // Chamber 104:
      if (state.currentRoomId === 'chamber_104') {
        if (!state.chamber104?.exitUnlocked) {
          return {
            success: false,
            message: 'Cryptographic vault is sealed. Parity checksum 0x404 must be verified to elevate guest tokens.',
            nextState: state,
            emittedEvents: [],
          };
        }
        return engineReducer(state, {
          type: 'TRANSITION_ROOM',
          payload: { targetRoomId: 'chamber_105' },
        });
      }

      // Chamber 103:
      if (state.currentRoomId === 'chamber_103') {
        if (!state.chamber103?.exitUnlocked) {
          return {
            success: false,
            message: 'Archive vault door sealed. Ballast polarity must be inverted and Rule #03 rewritten.',
            nextState: state,
            emittedEvents: [],
          };
        }
        return engineReducer(state, {
          type: 'TRANSITION_ROOM',
          payload: { targetRoomId: 'chamber_104' },
        });
      }

      // Chamber 102:
      if (state.currentRoomId === 'chamber_102') {
        if (state.chamber102.exitDoorLocked) {
          const failEvt = createEvent(
            'CHAMBER_102_EXIT_FAILED',
            'Chamber 102 blast door is locked. Kinetic and harmonic load cells must both be satisfied.'
          );
          return {
            success: false,
            message: 'Blast door is sealed. Both load cells and the signal circuit must align.',
            nextState: {
              ...state,
              eventLog: [...state.eventLog, failEvt],
            },
            emittedEvents: [failEvt],
          };
        }

        // Transition to Chamber 103
        return engineReducer(state, {
          type: 'TRANSITION_ROOM',
          payload: { targetRoomId: 'chamber_103' },
        });
      }

      // 2. If in Chamber 101:
      if (!state.exit.isLocked) {
        // Door is open: transition to Chamber 102!
        return engineReducer(state, {
          type: 'TRANSITION_ROOM',
          payload: { targetRoomId: 'chamber_102' },
        });
      }

      const evalResult = evaluateExitUnlock(state);

      if (!evalResult.allowed) {
        const failEvt = createEvent('DOOR_ATTEMPT_FAILED', evalResult.message);
        const nextState: GameState = {
          ...state,
          eventLog: [...state.eventLog, failEvt],
        };

        return {
          success: false,
          message: evalResult.message,
          nextState,
          emittedEvents: [failEvt],
        };
      }

      // Exit prerequisites satisfied: Unlock Chamber 101 blast door!
      const winEvt = createEvent(
        'CHAMBER_101_UNLOCKED',
        'Blast door disengaged. Corridor to Chamber 102 is now accessible!'
      );

      const nextExit = {
        ...state.exit,
        isLocked: false,
        lockReason: undefined,
      };

      const nextDoorObj = {
        ...state.objects.exit_door,
        state: 'unlocked' as const,
        description: 'The titanium blast door is fully retracted. The corridor to Chamber 102 is open.',
        inspectText: 'The exit stands open. Chamber 102 lies ahead.',
      };

      const nextState: GameState = {
        ...state,
        exit: nextExit,
        objects: {
          ...state.objects,
          exit_door: nextDoorObj,
        },
        eventLog: [...state.eventLog, winEvt],
      };

      return {
        success: true,
        message: 'Hydraulic clamps hiss and disengage. The passage to Chamber 102 is open!',
        nextState,
        emittedEvents: [winEvt],
      };
    }

    case 'RESTART_GAME': {
      const freshState = createChamber101InitialState();
      const restartEvt = createEvent(
        'SIMULATION_RESTART',
        'Chamber state reset to initial parameters.'
      );

      return {
        success: true,
        message: 'Chamber reset.',
        nextState: {
          ...freshState,
          eventLog: [restartEvt],
        },
        emittedEvents: [restartEvt],
      };
    }

    default:
      return {
        success: false,
        message: 'Unknown action type.',
        nextState: state,
        emittedEvents: [],
      };
  }
}
