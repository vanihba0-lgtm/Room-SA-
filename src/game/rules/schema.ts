import { RuleProposal, RuleOperation } from '../types';

export interface SchemaValidationResult {
  readonly isValid: boolean;
  readonly proposal?: RuleProposal;
  readonly errors: readonly string[];
}

const SUPPORTED_OPERATIONS: ReadonlySet<string> = new Set<RuleOperation>([
  'OVERRIDE_PREDICATE',
  'MODIFY_PARAMETER',
  'UNSUPPORTED',
]);

/**
 * Validates untrusted or AI-generated data against the strict RuleProposal schema.
 * Rejects malformed structures, unexpected types, out-of-bounds confidence values,
 * arbitrary rule wildcards, and destructive universal operations.
 */
export function validateProposalSchema(raw: unknown): SchemaValidationResult {
  const errors: string[] = [];

  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return {
      isValid: false,
      errors: ['Proposal payload must be a non-null object.'],
    };
  }

  const obj = raw as Record<string, unknown>;

  // targetRuleId
  if (typeof obj.targetRuleId !== 'string' || obj.targetRuleId.trim() === '') {
    errors.push('Field "targetRuleId" must be a non-empty string.');
  } else {
    const id = obj.targetRuleId.trim();
    if (
      id === '*' ||
      id.toUpperCase() === 'RULE_ALL' ||
      id.toUpperCase() === 'ALL' ||
      id.toUpperCase() === 'EVERY_RULE'
    ) {
      errors.push(
        'Universal rule identifiers (e.g. "RULE_ALL", "*") are strictly prohibited by containment protocol.'
      );
    }
  }

  // operation
  if (obj.operation !== undefined) {
    if (typeof obj.operation !== 'string' || !SUPPORTED_OPERATIONS.has(obj.operation)) {
      errors.push(
        `Field "operation" must be one of: ${Array.from(SUPPORTED_OPERATIONS).join(', ')}.`
      );
    }
  }

  // proposedStatement
  if (
    typeof obj.proposedStatement !== 'string' ||
    obj.proposedStatement.trim() === ''
  ) {
    errors.push('Field "proposedStatement" must be a non-empty string.');
  } else if (obj.proposedStatement.length > 250) {
    errors.push('Field "proposedStatement" exceeds maximum length of 250 characters.');
  }

  // newPredicateKey
  if (
    typeof obj.newPredicateKey !== 'string' ||
    obj.newPredicateKey.trim() === ''
  ) {
    errors.push('Field "newPredicateKey" must be a non-empty string.');
  }

  // confidence
  if (obj.confidence !== undefined) {
    if (
      typeof obj.confidence !== 'number' ||
      Number.isNaN(obj.confidence) ||
      obj.confidence < 0 ||
      obj.confidence > 1
    ) {
      errors.push('Field "confidence" must be a floating point number between 0.0 and 1.0.');
    }
  }

  // explanation
  if (obj.explanation !== undefined && typeof obj.explanation !== 'string') {
    errors.push('Field "explanation" must be a string.');
  }

  // targetCondition
  if (obj.targetCondition !== undefined && typeof obj.targetCondition !== 'string') {
    errors.push('Field "targetCondition" must be a string.');
  }

  // Destructive request check
  const proposedStatementLower =
    typeof obj.proposedStatement === 'string'
      ? obj.proposedStatement.toLowerCase()
      : '';
  const newPredicateLower =
    typeof obj.newPredicateKey === 'string' ? obj.newPredicateKey.toLowerCase() : '';

  if (
    proposedStatementLower.includes('remove every rule') ||
    proposedStatementLower.includes('delete all rules') ||
    proposedStatementLower.includes('destroy all rules') ||
    newPredicateLower.includes('delete_all') ||
    newPredicateLower.includes('remove_all')
  ) {
    errors.push('Operation "REMOVE_ALL_RULES" is unsupported and rejected by security protocol.');
  }

  if (errors.length > 0) {
    return {
      isValid: false,
      errors,
    };
  }

  const proposal: RuleProposal = {
    targetRuleId: (obj.targetRuleId as string).trim(),
    proposedStatement: (obj.proposedStatement as string).trim(),
    newPredicateKey: (obj.newPredicateKey as string).trim(),
    operation: (obj.operation as RuleOperation) || 'OVERRIDE_PREDICATE',
    targetCondition: typeof obj.targetCondition === 'string' ? obj.targetCondition.trim() : undefined,
    explanation: typeof obj.explanation === 'string' ? obj.explanation.trim() : undefined,
    confidence: typeof obj.confidence === 'number' ? obj.confidence : 1.0,
    parameters:
      obj.parameters && typeof obj.parameters === 'object' && !Array.isArray(obj.parameters)
        ? (obj.parameters as Record<string, unknown>)
        : undefined,
    rawInputText: typeof obj.rawInputText === 'string' ? obj.rawInputText : undefined,
  };

  return {
    isValid: true,
    proposal,
    errors: [],
  };
}
