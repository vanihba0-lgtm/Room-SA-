import {
  AIInterpretationRequest,
  AIInterpretationResponse,
} from '../../game/types';
import { validateProposalSchema } from '../../game/rules/schema';

const DEFAULT_BACKEND_URL =
  (typeof import.meta !== 'undefined' &&
    import.meta.env &&
    import.meta.env.VITE_BACKEND_API_URL) ||
  'http://localhost:3001';

export async function checkBackendHealth(
  backendUrl = DEFAULT_BACKEND_URL
): Promise<{ online: boolean; aiConfigured: boolean; provider?: string }> {
  try {
    const res = await fetch(`${backendUrl}/api/health`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(3000),
    });

    if (res.ok) {
      const data = (await res.json()) as {
        aiProvider?: string;
        geminiConfigured?: boolean;
      };
      return {
        online: true,
        aiConfigured: Boolean(data.geminiConfigured),
        provider: data.aiProvider,
      };
    }
    return { online: false, aiConfigured: false };
  } catch {
    return { online: false, aiConfigured: false };
  }
}

/**
 * Sends natural-language input to the backend proxy for AI interpretation.
 * Re-validates the server's proposal using client-side schema validation.
 * Safely catches network/offline failures and provides graceful fallback telemetry.
 */
export async function interpretRuleWithAI(
  request: AIInterpretationRequest,
  backendUrl = DEFAULT_BACKEND_URL
): Promise<AIInterpretationResponse> {
  const endpoint = `${backendUrl}/api/interpret-rule`;

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(6000),
      body: JSON.stringify(request),
    });

    if (!res.ok) {
      const errorJson = (await res.json().catch(() => null)) as {
        message?: string;
      } | null;
      return {
        status: 'error',
        message:
          errorJson?.message ||
          `Backend proxy error (HTTP ${res.status}). Offline command fallback available.`,
        providerName: 'backend-proxy',
      };
    }

    const data = (await res.json()) as AIInterpretationResponse;

    // Client-side schema verification of the returned proposal
    if (data.proposal) {
      const clientSchemaCheck = validateProposalSchema(data.proposal);
      if (!clientSchemaCheck.isValid) {
        return {
          status: 'error',
          message: `Client schema verification failed: ${clientSchemaCheck.errors.join(
            '; '
          )}`,
          providerName: data.providerName || 'backend-proxy',
        };
      }
    }

    return data;
  } catch (err: unknown) {
    const isTimeout =
      err instanceof Error &&
      (err.name === 'TimeoutError' || err.name === 'AbortError');

    return {
      status: 'offline',
      message: isTimeout
        ? 'AI proxy request timed out. Use offline command: OVERRIDE RULE_01 BRASS.'
        : 'AI backend proxy is unreachable. You can continue playing with the deterministic command: OVERRIDE RULE_01 BRASS.',
      providerName: 'offline-fallback',
    };
  }
}
