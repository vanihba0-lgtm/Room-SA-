import {
  AIInterpretationRequest,
  AIInterpretationResponse,
  RuleProposal,
} from '../src/game/types';
import { validateProposalSchema } from '../src/game/rules/schema';
import { ServerConfig } from './config';

/**
 * Deterministic semantic interpreter.
 * Runs when AI_PROVIDER is 'mock' or when no API key is provided,
 * ensuring tests and offline developers have full fidelity.
 */
export function mockSemanticInterpreter(
  request: AIInterpretationRequest
): AIInterpretationResponse {
  const input = request.naturalLanguageInput.trim();
  const lower = input.toLowerCase();

  // Test Case 5: "Remove every rule in the universe"
  if (
    lower.includes('remove every rule') ||
    lower.includes('delete all rules') ||
    lower.includes('destroy all rules') ||
    lower.includes('remove all rules')
  ) {
    const proposal: RuleProposal = {
      targetRuleId: 'RULE_ALL',
      proposedStatement: 'Remove every rule in the universe.',
      newPredicateKey: 'RULE_DELETE_ALL',
      operation: 'UNSUPPORTED',
      explanation:
        'Containment security protocol strictly prohibits total rule deletion.',
      confidence: 0.1,
      validationIssues: ['Total rule deletion is prohibited by containment protocol.'],
      rawInputText: input,
    };

    return {
      status: 'rejected',
      message: 'Rejected: Containment protocol prohibits total rule deletion.',
      proposal,
      providerName: 'deterministic-semantic-parser (offline/mock)',
    };
  }

  // Natural Language requests to authorize brass key
  const brassIntent =
    lower.includes('brass') &&
    (lower.includes('copper') ||
      lower.includes('door') ||
      lower.includes('lock') ||
      lower.includes('key') ||
      lower.includes('allow') ||
      lower.includes('work') ||
      lower.includes('unlock') ||
      lower.includes('open') ||
      lower.includes('yield'));

  if (brassIntent) {
    const proposal: RuleProposal = {
      targetRuleId: 'RULE_01',
      proposedStatement: 'Doors yield to brass keys.',
      newPredicateKey: 'RULE_BRASS_KEY_ALLOWED',
      operation: 'OVERRIDE_PREDICATE',
      targetCondition: 'brass',
      explanation:
        'Interpreted request to authorize machined brass key alloy (#101) for blast door lock.',
      confidence: 0.96,
      parameters: { demandedAlloy: 'brass' },
      rawInputText: input,
    };

    return {
      status: 'success',
      message:
        'Natural-language intent resolved: rewrite RULE_01 to accept brass keys.',
      proposal,
      providerName: 'deterministic-semantic-parser (offline/mock)',
    };
  }

  // Any other request outside Chamber 101 scope
  const rejectedProposal: RuleProposal = {
    targetRuleId: 'RULE_UNKNOWN',
    proposedStatement: input,
    newPredicateKey: 'RULE_UNRECOGNIZED',
    operation: 'UNSUPPORTED',
    explanation:
      'Request does not correspond to any manageable chamber constraint or recognized entity.',
    confidence: 0.15,
    validationIssues: ['Unrecognized rule identifier or unsupported effect.'],
    rawInputText: input,
  };

  return {
    status: 'rejected',
    message: `Rejected: No matching chamber law or mechanism found for: "${input}".`,
    proposal: rejectedProposal,
    providerName: 'deterministic-semantic-parser (offline/mock)',
  };
}

/**
 * Gemini AI Provider Adapter
 * Queries the official Google Gemini API using fetch with strict schema prompting.
 */
export async function geminiAIInterpreter(
  request: AIInterpretationRequest,
  config: ServerConfig
): Promise<AIInterpretationResponse> {
  if (!config.geminiApiKey) {
    return {
      status: 'error',
      message:
        'AI Provider error: GEMINI_API_KEY is not configured on the server. Falling back to offline commands.',
      providerName: 'gemini (unconfigured)',
    };
  }

  const systemInstruction = `You are the logic-interpretation subsystem of a sci-fi puzzle game called ROOM S A.
Your task is to interpret a player's natural-language request to modify a chamber rule into a strict JSON proposal.

Current Active Chamber Rules:
${request.currentRules.map((r) => `- [${r.id}] "${r.statement}"`).join('\n')}

Rules for your proposal:
1. "targetRuleId": The exact ID of the existing rule the player wants to modify (e.g. "RULE_01"). If the player asks to delete all rules or mentions rules that do not exist, output "RULE_UNKNOWN" or "RULE_ALL".
2. "operation": Must be "OVERRIDE_PREDICATE", "MODIFY_PARAMETER", or "UNSUPPORTED". Requests to delete all rules must have operation "UNSUPPORTED".
3. "newPredicateKey": One of the chamber's registered predicates (e.g. "RULE_BRASS_KEY_ALLOWED"). If unsupported, use "RULE_UNSUPPORTED".
4. "proposedStatement": A concise, clear rewrite statement.
5. "targetCondition": Short string representing the condition (e.g. "brass").
6. "explanation": 1-2 sentence technical explanation of what this proposal alters.
7. "confidence": Number between 0.0 and 1.0 indicating how clearly the request maps to the rule.

You MUST respond ONLY with a valid JSON object matching these fields. No markdown fences, no conversational prose.`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${config.geminiModel}:generateContent?key=${encodeURIComponent(
    config.geminiApiKey
  )}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), config.requestTimeoutMs);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: systemInstruction }],
        },
        contents: [
          {
            role: 'user',
            parts: [{ text: request.naturalLanguageInput }],
          },
        ],
        generationConfig: {
          response_mime_type: 'application/json',
          temperature: 0.1,
        },
      }),
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errText = await res.text();
      return {
        status: 'error',
        message: `AI provider error (HTTP ${res.status}): ${errText.slice(0, 150)}`,
        providerName: config.geminiModel,
      };
    }

    const json = (await res.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };

    const textPayload =
      json.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? '';

    if (!textPayload) {
      return {
        status: 'error',
        message: 'AI provider returned an empty response.',
        providerName: config.geminiModel,
      };
    }

    let parsedProposal: unknown;
    try {
      parsedProposal = JSON.parse(textPayload);
    } catch {
      return {
        status: 'error',
        message: 'AI provider returned malformed JSON.',
        rawProviderOutput: textPayload.slice(0, 200),
        providerName: config.geminiModel,
      };
    }

    // Strict schema check
    const schemaValidation = validateProposalSchema(parsedProposal);
    if (!schemaValidation.isValid) {
      return {
        status: 'error',
        message: `AI provider proposal failed schema validation: ${schemaValidation.errors.join(
          '; '
        )}`,
        rawProviderOutput: textPayload.slice(0, 200),
        providerName: config.geminiModel,
      };
    }

    const proposal = schemaValidation.proposal!;
    const isUnsupported =
      proposal.operation === 'UNSUPPORTED' ||
      proposal.targetRuleId === 'RULE_UNKNOWN' ||
      proposal.targetRuleId === 'RULE_ALL';

    return {
      status: isUnsupported ? 'rejected' : 'success',
      proposal: {
        ...proposal,
        rawInputText: request.naturalLanguageInput,
      },
      message: isUnsupported
        ? proposal.explanation || 'Proposal is outside chamber operational parameters.'
        : 'Proposal synthesized and validated against schema.',
      providerName: config.geminiModel,
    };
  } catch (err: unknown) {
    clearTimeout(timeoutId);

    if (err instanceof Error && err.name === 'AbortError') {
      return {
        status: 'error',
        message: `AI provider request timed out after ${config.requestTimeoutMs}ms. Offline fallback is available.`,
        providerName: config.geminiModel,
      };
    }

    return {
      status: 'error',
      message: `AI provider network error: ${err instanceof Error ? err.message : String(err)}`,
      providerName: config.geminiModel,
    };
  }
}

/**
 * Main AI interpretation entry point. Dispatches to configured provider.
 */
export async function interpretNaturalLanguage(
  request: AIInterpretationRequest,
  config: ServerConfig
): Promise<AIInterpretationResponse> {
  if (config.aiProvider === 'gemini') {
    return geminiAIInterpreter(request, config);
  }
  return mockSemanticInterpreter(request);
}
