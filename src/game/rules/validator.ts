import { GameState, RuleProposal, RuleValidationResult } from '../types';
import { PREDICATE_REGISTRY } from './predicates';
import { CHAMBER_101_SOLUTION_PROPOSAL } from './registry';
import { validateProposalSchema } from './schema';

/**
 * Validates a rule proposal against current chamber rules, strict schema,
 * and deterministic predicate registry.
 */
export function validateRuleProposal(
  state: GameState,
  proposal: RuleProposal
): RuleValidationResult {
  // 1. Strict Schema Validation
  const schemaCheck = validateProposalSchema(proposal);
  if (!schemaCheck.isValid) {
    const issues = [...schemaCheck.errors];
    if (
      proposal.operation === 'UNSUPPORTED' ||
      schemaCheck.errors.some((e) => e.toLowerCase().includes('unsupported'))
    ) {
      issues.push('UNSUPPORTED_OPERATION');
    }
    return {
      isValid: false,
      reason: `Schema validation failed: ${schemaCheck.errors.join(' ')}`,
      validationIssues: issues,
    };
  }

  // 2. Reject unsupported operations
  if (proposal.operation === 'UNSUPPORTED') {
    const reason =
      proposal.explanation ||
      'Rejected: The proposed operation is unsupported by chamber containment protocol.';
    return {
      isValid: false,
      reason,
      validationIssues: ['UNSUPPORTED_OPERATION'],
    };
  }

  // 3. Target rule must exist in active chamber
  const existingRule = state.rules[proposal.targetRuleId];
  if (!existingRule) {
    return {
      isValid: false,
      reason: `Rejected: Rule '${proposal.targetRuleId}' does not exist in active chamber.`,
      validationIssues: ['UNKNOWN_RULE_IDENTIFIER'],
    };
  }

  // 4. Predicate must exist in the deterministic registry
  if (!PREDICATE_REGISTRY[proposal.newPredicateKey]) {
    return {
      isValid: false,
      reason: `Rejected: Unknown logic predicate '${proposal.newPredicateKey}'.`,
      validationIssues: ['UNKNOWN_PREDICATE'],
    };
  }

  // 5. Rule cannot be rewritten to its identical existing condition
  if (existingRule.predicateKey === proposal.newPredicateKey) {
    return {
      isValid: false,
      reason: `Rejected: Rule '${proposal.targetRuleId}' is already enforcing this condition.`,
      validationIssues: ['REDUNDANT_REWRITE'],
    };
  }

  // 6. Authorized Chamber 101 rewrite: allowing brass key
  if (
    proposal.targetRuleId === 'RULE_01' &&
    proposal.newPredicateKey === 'RULE_BRASS_KEY_ALLOWED' &&
    proposal.operation === 'OVERRIDE_PREDICATE'
  ) {
    return {
      isValid: true,
      authorizedProposal: proposal,
    };
  }

  return {
    isValid: false,
    reason: `Rejected: Proposal violates chamber structural coherence constraint.`,
    validationIssues: ['UNAUTHORIZED_CONSTRAINT_VIOLATION'],
  };
}

export interface TerminalCommandParseResult {
  readonly actionType: 'HELP' | 'RULES' | 'PROPOSAL' | 'UNKNOWN';
  readonly proposal?: RuleProposal;
  readonly feedback: string;
}

/**
 * Parses user input typed into the in-game terminal for deterministic fallback
 */
export function parseTerminalInput(
  state: GameState,
  rawInput: string
): TerminalCommandParseResult {
  const normalized = rawInput.trim().toLowerCase();

  if (normalized === '' || normalized === 'help') {
    return {
      actionType: 'HELP',
      feedback:
        'AVAILABLE COMMANDS:\n- RULES                 : Inspect active chamber laws\n- OVERRIDE RULE_01 BRASS: Rewrite key constraint (offline fallback)\n- REWRITE RULE_01 BRASS : Authorize brass key\n- HELP                  : Display this manual',
    };
  }

  if (normalized === 'rules' || normalized === 'list' || normalized === 'status') {
    const rulesList = Object.values(state.rules)
      .map(
        (r) =>
          `[${r.id}] "${r.statement}" (${r.isDeceptive ? 'DECEPTIVE' : 'STABLE'})`
      )
      .join('\n');
    return {
      actionType: 'RULES',
      feedback: `ACTIVE CHAMBER LAWS:\n${rulesList}`,
    };
  }

  // Check destructive request
  if (
    normalized.includes('remove every rule') ||
    normalized.includes('delete all rules') ||
    normalized.includes('destroy all rules')
  ) {
    return {
      actionType: 'PROPOSAL',
      proposal: {
        targetRuleId: 'RULE_ALL',
        proposedStatement: 'Remove every rule in the universe.',
        newPredicateKey: 'RULE_DELETE_ALL',
        operation: 'UNSUPPORTED',
        confidence: 0.1,
        explanation: 'Universal rule deletion is forbidden by containment protocol.',
        rawInputText: rawInput,
      },
      feedback: 'REJECTED: Universal rule deletion violates containment protocol.',
    };
  }

  // Pattern matching for rule rewrite
  const rewriteMatch =
    normalized.includes('brass') &&
    (normalized.includes('override') ||
      normalized.includes('rewrite') ||
      normalized.includes('allow') ||
      normalized.includes('work') ||
      normalized.includes('set') ||
      normalized.includes('change') ||
      normalized.includes('rule_01') ||
      normalized.includes('rule 01'));

  if (rewriteMatch) {
    return {
      actionType: 'PROPOSAL',
      proposal: {
        ...CHAMBER_101_SOLUTION_PROPOSAL,
        rawInputText: rawInput,
      },
      feedback: 'REWRITE SEQUENCE COMPILED: RULE_01 -> DOORS YIELD TO BRASS KEYS.',
    };
  }

  return {
    actionType: 'UNKNOWN',
    feedback: `UNRECOGNIZED INSTRUCTION: "${rawInput}". Type 'HELP' or 'RULES' for chamber protocol, or consult the AI Assistant.`,
  };
}
