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
      const evt = createEvent('ROOM_TRANSITION', `Subject navigated to ${targetRoomId}.`);
      return {
        success: true,
        message: `Entered ${targetRoomId === 'chamber_102' ? 'Chamber 102: The Signal Foundry' : 'Chamber 101'}.`,
        nextState: {
          ...state,
          currentRoomId: targetRoomId,
          eventLog: [...state.eventLog, evt],
        },
        emittedEvents: [evt],
      };
    }

    case 'ATTEMPT_EXIT': {
      // 1. If currently in Chamber 102:
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

        // Chamber 102 Cleared - Entire Campaign Escaped!
        const victoryEvt = createEvent(
          'CAMPAIGN_ESCAPED',
          'Subject successfully escaped Chamber 102: The Signal Foundry! All facility sectors clear.'
        );
        return {
          success: true,
          message: 'Facility quarantine cleared! Freedom achieved!',
          nextState: {
            ...state,
            status: 'escaped',
            eventLog: [...state.eventLog, victoryEvt],
          },
          emittedEvents: [victoryEvt],
        };
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
