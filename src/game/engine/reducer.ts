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

    case 'ATTEMPT_EXIT': {
      if (!state.exit.isLocked) {
        return {
          success: true,
          message: 'The door is already open.',
          nextState: state,
          emittedEvents: [],
        };
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

      // Exit prerequisites satisfied: Unlock and Escape!
      const winEvt = createEvent(
        'CHAMBER_ESCAPED',
        'Blast door disengaged. Subject successfully escaped Chamber 101!'
      );

      const nextExit = {
        ...state.exit,
        isLocked: false,
        lockReason: undefined,
      };

      const nextDoorObj = {
        ...state.objects.exit_door,
        state: 'unlocked' as const,
        description: 'The titanium blast door is fully retracted. The corridor beyond is accessible.',
        inspectText: 'The exit stands open. Freedom awaits.',
      };

      const nextState: GameState = {
        ...state,
        status: 'escaped',
        exit: nextExit,
        objects: {
          ...state.objects,
          exit_door: nextDoorObj,
        },
        eventLog: [...state.eventLog, winEvt],
      };

      return {
        success: true,
        message: evalResult.message,
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
