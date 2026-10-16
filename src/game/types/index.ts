/**
 * ROOM S A — Core Engine & Domain Types
 * Pure TypeScript definitions. No DOM, React, or browser dependencies.
 */

// ==========================================
// 1. Identifiers & Primitives
// ==========================================

export type ItemId = string;
export type ObjectId = string;
export type RoomId = string;
export type RuleId = string;

// ==========================================
// 2. Inventory & Items
// ==========================================

export interface InventoryItem {
  readonly id: ItemId;
  readonly name: string;
  readonly description: string;
  readonly category: 'key' | 'tool' | 'document' | 'artifact';
  readonly iconName?: string;
  readonly acquiredAt?: number;
}

// ==========================================
// 3. Interactive Objects & Hotspots
// ==========================================

export type ObjectState = 'default' | 'inspected' | 'unlocked' | 'disabled' | 'transformed';

export interface RoomObject {
  readonly id: ObjectId;
  readonly name: string;
  readonly description: string;
  readonly inspectText: string;
  readonly state: ObjectState;
  readonly isInteractable: boolean;
  readonly requiredItemId?: ItemId;
  readonly position: {
    readonly x: number; // percentage (0-100) or grid coordinate
    readonly y: number;
    readonly width?: number;
    readonly height?: number;
  };
}

// ==========================================
// 4. Doors & Exits
// ==========================================

export interface RoomExit {
  readonly id: string;
  readonly targetRoomId: string;
  readonly name: string;
  readonly isLocked: boolean;
  readonly lockReason?: string;
  readonly unlockConditionRuleId?: RuleId;
}

// ==========================================
// 5. Rules System
// ==========================================

/**
 * A World Rule dictates what is true in the room.
 * "The room lies." — Initial rules are deceptive or restrictive.
 */
export interface WorldRule {
  readonly id: RuleId;
  readonly statement: string;            // Human-readable statement e.g. "Doors yield only to copper keys."
  readonly isActive: boolean;
  readonly isDeceptive: boolean;         // The lie or constraint currently binding reality
  readonly affectedObjectId?: ObjectId;
  readonly predicateKey: string;         // Deterministic evaluation key e.g. "RULE_KEY_MATCH"
  readonly parameters?: Record<string, unknown>;
}

export type RuleOperation = 'OVERRIDE_PREDICATE' | 'MODIFY_PARAMETER' | 'UNSUPPORTED';

/**
 * Structured proposal for a rule change (from deterministic terminal or AI interpretation)
 */
export interface RuleProposal {
  readonly targetRuleId: RuleId;
  readonly proposedStatement: string;
  readonly newPredicateKey: string;
  readonly operation?: RuleOperation;
  readonly targetCondition?: string;
  readonly explanation?: string;
  readonly confidence?: number;
  readonly validationIssues?: readonly string[];
  readonly parameters?: Record<string, unknown>;
  readonly rawInputText?: string;
}

export interface RuleValidationResult {
  readonly isValid: boolean;
  readonly reason?: string;
  readonly authorizedProposal?: RuleProposal;
  readonly validationIssues?: readonly string[];
}

export interface AIInterpretationRequest {
  readonly naturalLanguageInput: string;
  readonly currentRules: ReadonlyArray<{
    readonly id: string;
    readonly statement: string;
  }>;
}

export interface AIInterpretationResponse {
  readonly status: 'success' | 'rejected' | 'error' | 'offline';
  readonly proposal?: RuleProposal;
  readonly message: string;
  readonly rawProviderOutput?: string;
  readonly providerName?: string;
}

// ==========================================
// 5.5 Physics Objects & Signal Foundry (Chamber 102)
// ==========================================

export interface MovablePhysicsObject {
  readonly id: string;
  readonly name: string;
  readonly mass: number; // in kg (e.g. 25kg vs 10kg)
  readonly frequency: number; // in kHz (e.g. 433 vs 868)
  readonly color: string;
  readonly position: [number, number, number];
  readonly isCarried: boolean;
  readonly placedOnPlateId?: string | null;
}

export interface PressurePlateState {
  readonly id: string;
  readonly name: string;
  readonly position: [number, number, number];
  readonly label: string;
  readonly isDepressed: boolean;
  readonly currentObjectId?: string | null;
  readonly satisfied: boolean;
}

export type SignalChannel = 'ALPHA' | 'BETA' | 'GAMMA';

export interface SignalCircuitState {
  readonly selectedFrequency: number;
  readonly targetFrequency: number;
  readonly routingChannel: SignalChannel;
  readonly targetChannel: SignalChannel;
  readonly isCircuitClosed: boolean;
}

export interface Chamber102State {
  readonly movableObjects: Readonly<Record<string, MovablePhysicsObject>>;
  readonly pressurePlates: Readonly<Record<string, PressurePlateState>>;
  readonly circuit: SignalCircuitState;
  readonly exitDoorLocked: boolean;
  readonly puzzleSolved: boolean;
  readonly seed: number;
}

// ==========================================
// 6. Overall Game State (Immutable)
// ==========================================

export interface Chamber103State {
  readonly surveyed?: boolean;
  readonly logInspected: boolean;
  readonly overrideInspected?: boolean;
  readonly ballastInverted: boolean;
  readonly ruleOverridden: boolean;
  readonly sensorActivated?: boolean;
  readonly exitUnlocked: boolean;
}

export interface Chamber104State {
  readonly vaultInspected?: boolean;
  readonly telemetryAudited: boolean;
  readonly hasGuestToken: boolean;
  readonly checksumMatched: boolean;
  readonly exitUnlocked: boolean;
}

export interface Chamber105State {
  // Master Compiler 4-Stage Synthesis (The Last Witness)
  readonly stationMaterialSolved?: boolean; // Stage A: Brass Key optical gate reality
  readonly stationSignalSolved?: boolean;   // Stage B: 868 kHz / BETA carrier resonance
  readonly stationArchiveSolved?: boolean;  // Stage C: Dr. Mara Voss dossier & polarity inversion
  readonly stationSecuritySolved?: boolean; // Stage D: Checksum 0x404 & Root elevation
  readonly masterCompilerUnlocked?: boolean; // All 4 stations verified
  readonly truthRevealed?: boolean;          // ROOM S A identity unmasked
  readonly chosenEnding?: 'shutdown' | 'rewrite' | 'control';

  // Backwards compatibility fields
  readonly chronometerInspected: boolean;
  readonly relaySequence: readonly string[];
  readonly relaysSequenced: boolean;
  readonly ruleOverridden: boolean;
  readonly exitUnlocked: boolean;
}

export interface Chamber106State {
  readonly primeAxiomRead: boolean;
  readonly activeConsoles: readonly string[];
  readonly matricesSynthesized: boolean;
  readonly primeDirectiveOverridden: boolean;
}

export type GameStatus = 'playing' | 'escaped' | 'failed';

export interface GameEvent {
  readonly id: string;
  readonly timestamp: number;
  readonly type: string;
  readonly description: string;
  readonly metadata?: Record<string, unknown>;
}

export interface GameState {
  readonly currentRoomId: RoomId;
  readonly status: GameStatus;
  readonly inventory: readonly InventoryItem[];
  readonly objects: Readonly<Record<ObjectId, RoomObject>>;
  readonly exit: RoomExit;
  readonly rules: Readonly<Record<RuleId, WorldRule>>;
  readonly activeRuleIds: readonly RuleId[];
  readonly eventLog: readonly GameEvent[];
  readonly inspectedObjectIds: readonly ObjectId[];
  readonly terminalOpen: boolean;
  readonly terminalLog: readonly string[];
  readonly realityShiftCount: number;
  readonly carriedObjectId: string | null;
  readonly chamber102: Chamber102State;
  readonly chamber103?: Chamber103State;
  readonly chamber104?: Chamber104State;
  readonly chamber105?: Chamber105State;
  readonly chamber106?: Chamber106State;
}

// ==========================================
// 7. Typed Engine Actions & Dispatch System
// ==========================================

export type GameAction =
  | { type: 'COLLECT_ITEM'; payload: { itemId: ItemId; sourceObjectId?: ObjectId } }
  | { type: 'INSPECT_OBJECT'; payload: { objectId: ObjectId } }
  | { type: 'INTERACT_WITH_OBJECT'; payload: { objectId: ObjectId; withItemId?: ItemId } }
  | { type: 'ACTIVATE_TERMINAL'; payload: { open: boolean } }
  | { type: 'SUBMIT_RULE_PROPOSAL'; payload: { proposal: RuleProposal } }
  | { type: 'APPLY_VALIDATED_RULE'; payload: { proposal: RuleProposal } }
  | { type: 'ATTEMPT_EXIT' }
  | { type: 'TRANSITION_ROOM'; payload: { targetRoomId: RoomId } }
  | { type: 'SELECT_CHAMBER'; payload: { chamberId: RoomId } }
  | { type: 'PICKUP_OBJECT'; payload: { objectId: string } }
  | { type: 'DROP_OBJECT'; payload: { objectId: string; position?: [number, number, number]; plateId?: string | null } }
  | { type: 'CONFIGURE_CIRCUIT'; payload: { frequency?: number; channel?: SignalChannel } }
  | { type: 'RESTART_GAME' };

export interface ActionResult {
  readonly success: boolean;
  readonly message: string;
  readonly nextState: GameState;
  readonly emittedEvents: readonly GameEvent[];
}

