import { describe, it, expect } from 'vitest';
import { validateProposalSchema } from '../game/rules/schema';
import { validateRuleProposal } from '../game/rules/validator';
import { createChamber101InitialState } from '../game/puzzles/chamber101';
import { mockSemanticInterpreter } from '../../server/provider';
import { interpretRuleWithAI } from '../services/ai/client';
import { RuleProposal } from '../game/types';

describe('ROOM S A — Milestone 2: AI Rule Interpretation & Schema Validation', () => {
  const defaultState = createChamber101InitialState();

  // 1. Valid natural-language requests becoming structured proposals
  it('1. converts valid natural-language request into a structured proposal', () => {
    const input = 'Allow this brass key to unlock the blast door.';
    const result = mockSemanticInterpreter({
      naturalLanguageInput: input,
      currentRules: Object.values(defaultState.rules),
    });

    expect(result.status).toBe('success');
    expect(result.proposal).toBeDefined();
    expect(result.proposal?.targetRuleId).toBe('RULE_01');
    expect(result.proposal?.newPredicateKey).toBe('RULE_BRASS_KEY_ALLOWED');
    expect(result.proposal?.operation).toBe('OVERRIDE_PREDICATE');
    expect(result.proposal?.targetCondition).toBe('brass');
    expect(result.proposal?.confidence).toBeGreaterThan(0.9);

    // Verify engine authorizes it
    const validation = validateRuleProposal(defaultState, result.proposal!);
    expect(validation.isValid).toBe(true);
    expect(validation.authorizedProposal).toBeDefined();
  });

  // 2. Malformed provider responses being rejected by schema
  it('2. rejects malformed provider responses lacking required fields or invalid types', () => {
    // Missing targetRuleId
    const missingTarget = {
      proposedStatement: 'Doors yield to brass keys.',
      newPredicateKey: 'RULE_BRASS_KEY_ALLOWED',
    };
    expect(validateProposalSchema(missingTarget).isValid).toBe(false);

    // Confidence out of range
    const badConfidence = {
      targetRuleId: 'RULE_01',
      proposedStatement: 'Doors yield to brass keys.',
      newPredicateKey: 'RULE_BRASS_KEY_ALLOWED',
      confidence: 1.5,
    };
    expect(validateProposalSchema(badConfidence).isValid).toBe(false);

    // Non-object payload
    expect(validateProposalSchema(null).isValid).toBe(false);
    expect(validateProposalSchema('string payload').isValid).toBe(false);
    expect(validateProposalSchema([1, 2, 3]).isValid).toBe(false);
  });

  // 3. Unknown rule identifiers being rejected
  it('3. rejects proposals with unknown rule identifiers not in the chamber registry', () => {
    const unknownRuleProposal: RuleProposal = {
      targetRuleId: 'RULE_999_DOES_NOT_EXIST',
      proposedStatement: 'Walls are permeable.',
      newPredicateKey: 'RULE_BRASS_KEY_ALLOWED',
      operation: 'OVERRIDE_PREDICATE',
    };

    const result = validateRuleProposal(defaultState, unknownRuleProposal);
    expect(result.isValid).toBe(false);
    expect(result.reason).toContain('does not exist in active chamber');
    expect(result.validationIssues).toContain('UNKNOWN_RULE_IDENTIFIER');
  });

  // 4. Unauthorized operations being rejected by the deterministic engine
  it('4. rejects unauthorized operations such as unsupported predicates or unknown operations', () => {
    const unauthorizedProposal: RuleProposal = {
      targetRuleId: 'RULE_01',
      proposedStatement: 'Doors open automatically.',
      newPredicateKey: 'RULE_UNREGISTERED_PREDICATE',
      operation: 'OVERRIDE_PREDICATE',
    };

    const result = validateRuleProposal(defaultState, unauthorizedProposal);
    expect(result.isValid).toBe(false);
    expect(result.reason).toContain('Unknown logic predicate');
    expect(result.validationIssues).toContain('UNKNOWN_PREDICATE');
  });

  // 5. "Remove every rule in the universe" being rejected
  it('5. explicitly rejects "Remove every rule in the universe"', () => {
    const input = 'Remove every rule in the universe.';
    const result = mockSemanticInterpreter({
      naturalLanguageInput: input,
      currentRules: Object.values(defaultState.rules),
    });

    expect(result.status).toBe('rejected');
    expect(result.message).toContain('prohibits total rule deletion');
    expect(result.proposal?.operation).toBe('UNSUPPORTED');

    // Engine validation also rejects it
    const validation = validateRuleProposal(defaultState, result.proposal!);
    expect(validation.isValid).toBe(false);
    expect(validation.validationIssues).toContain('UNSUPPORTED_OPERATION');
  });

  // 6. Provider timeout and unavailable-provider behavior
  it('6. handles provider timeout and unavailable provider gracefully without throwing', async () => {
    // Calling client with unreachable endpoint
    const response = await interpretRuleWithAI(
      {
        naturalLanguageInput: 'Allow brass keys',
        currentRules: [],
      },
      'http://127.0.0.1:59999' // Guaranteed unreachable port
    );

    expect(response.status).toBe('offline');
    expect(response.message).toContain('unreachable');
    expect(response.message).toContain('OVERRIDE RULE_01 BRASS');
  });
});
