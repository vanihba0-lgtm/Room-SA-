import { WorldRule, RuleProposal } from '../types';

/**
 * Chamber 101 Initial Governing Rule (The Lie)
 */
export const CHAMBER_101_DEFAULT_RULE: WorldRule = {
  id: 'RULE_01',
  statement: 'Doors yield only to copper keys.',
  isActive: true,
  isDeceptive: true,
  affectedObjectId: 'exit_door',
  predicateKey: 'RULE_COPPER_KEY_ONLY',
  parameters: {
    demandedAlloy: 'copper',
  },
};

/**
 * The authorized puzzle solution proposal for Chamber 101
 */
export const CHAMBER_101_SOLUTION_PROPOSAL: RuleProposal = {
  targetRuleId: 'RULE_01',
  proposedStatement: 'Doors yield to brass keys.',
  newPredicateKey: 'RULE_BRASS_KEY_ALLOWED',
  operation: 'OVERRIDE_PREDICATE',
  targetCondition: 'brass',
  explanation: 'Authorize machined brass key alloy (#101) to operate the blast door lock.',
  confidence: 1.0,
  parameters: {
    demandedAlloy: 'brass',
  },
  rawInputText: 'OVERRIDE RULE_01 BRASS',
};

/**
 * Map of initial rules for Chamber 101
 */
export const CHAMBER_101_RULES: Record<string, WorldRule> = {
  [CHAMBER_101_DEFAULT_RULE.id]: CHAMBER_101_DEFAULT_RULE,
};
