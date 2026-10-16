import { GameState, InventoryItem, RoomObject } from '../types';
import { CHAMBER_101_RULES } from '../rules/registry';

export const BRASS_KEY_ITEM: InventoryItem = {
  id: 'brass_key',
  name: 'Machined Brass Key',
  description:
    'A heavy key milled from brass alloy (#101). Clearly zinc-alloyed brass, noticeably not copper.',
  category: 'key',
  iconName: 'key',
};

export const CHAMBER_101_OBJECTS: Record<string, RoomObject> = {
  pedestal: {
    id: 'pedestal',
    name: 'Specimen Pedestal',
    description: 'A dark slate column illuminated by a dim overhead spot beam.',
    inspectText:
      'A heavy machined brass key rests atop the column induction cradle.',
    state: 'default',
    isInteractable: true,
    position: { x: 50, y: 68, width: 22, height: 26 },
  },
  observation_slate: {
    id: 'observation_slate',
    name: 'Observation Slate',
    description:
      'A magnetic metal slate pinned to the left bulkhead, covered in frantic handwriting.',
    inspectText:
      'Scratched handwriting reads: "The previous occupant spent months trying to transmute copper. They died without realizing the terminal console accepts rule overrides. The room is lying."',
    state: 'default',
    isInteractable: true,
    position: { x: 18, y: 44, width: 16, height: 22 },
  },
  terminal: {
    id: 'terminal',
    name: 'Anomaly Terminal',
    description: 'A wall-recessed console flickering with amber CRT phosphors.',
    inspectText:
      'The terminal connects to the chamber logic core. It displays active world rules and accepts constraint rewrites.',
    state: 'default',
    isInteractable: true,
    position: { x: 82, y: 44, width: 18, height: 26 },
  },
  exit_door: {
    id: 'exit_door',
    name: 'Reinforced Blast Door',
    description:
      'A monolithic titanium pressure door sealed with heavy hydraulic deadbolts.',
    inspectText:
      'Engraved plaque: "ONLY COPPER OPERATES THIS MECHANISM". An electronic lock slot sits cold and dark.',
    state: 'default',
    isInteractable: true,
    position: { x: 50, y: 28, width: 30, height: 38 },
  },
  power_regulator: {
    id: 'power_regulator',
    name: 'Substrate Power Regulator',
    description:
      'A wall-mounted hydraulic breaker switch with glowing status conduits.',
    inspectText:
      'Diagnostic readout: "CIRCUIT #101 ROUTED TO LOGIC CORE AND EXIT MECHANISM. SUBSTRATE STABILITY: COMPROMISED BY DECEPTIVE RULE_01."',
    state: 'default',
    isInteractable: true,
    position: { x: 30, y: 55, width: 14, height: 20 },
  },
};

/**
 * Creates a fresh, pristine GameState for Chamber 101: The Obvious Lie
 */
export function createChamber101InitialState(): GameState {
  return {
    currentRoomId: 'chamber_101',
    status: 'playing',
    inventory: [],
    objects: { ...CHAMBER_101_OBJECTS },
    exit: {
      id: 'exit_chamber_101',
      targetRoomId: 'chamber_102',
      name: 'Titanium Blast Door',
      isLocked: true,
      lockReason: 'Plaque: ONLY COPPER OPERATES THIS MECHANISM.',
      unlockConditionRuleId: 'RULE_01',
    },
    rules: { ...CHAMBER_101_RULES },
    activeRuleIds: ['RULE_01'],
    eventLog: [
      {
        id: 'evt_init',
        timestamp: Date.now(),
        type: 'SYSTEM',
        description: 'Chamber 101 initialized. Subject entered containment.',
      },
    ],
    inspectedObjectIds: [],
    terminalOpen: false,
    terminalLog: [
      '[CORE] ANOMALY LOGIC TERMINAL REV 4.09 ONLINE',
      '[SYS] CHAMBER GOVERNED BY RULE_01: "Doors yield only to copper keys."',
      '[WARN] REALITY STABILITY INDEX: RESTRICTED',
      '[SYS] TYPE "HELP" OR "RULES" FOR INSTRUCTIONS.',
    ],
    realityShiftCount: 0,
  };
}
