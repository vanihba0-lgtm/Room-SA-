export interface ServerConfig {
  readonly port: number;
  readonly host: string;
  readonly aiProvider: 'gemini' | 'mock';
  readonly geminiApiKey?: string;
  readonly geminiModel: string;
  readonly requestTimeoutMs: number;
}

export function loadServerConfig(): ServerConfig {
  const geminiApiKey = process.env.GEMINI_API_KEY?.trim();
  const rawProvider = process.env.AI_PROVIDER?.trim().toLowerCase();

  // If AI_PROVIDER is explicitly set, use it; otherwise, if an API key exists, default to gemini
  let aiProvider: 'gemini' | 'mock' = 'mock';
  if (rawProvider === 'gemini') {
    aiProvider = 'gemini';
  } else if (!rawProvider && geminiApiKey) {
    aiProvider = 'gemini';
  }

  return {
    port: parseInt(process.env.PORT || '3001', 10),
    host: process.env.HOST || '0.0.0.0',
    aiProvider,
    geminiApiKey,
    geminiModel: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
    requestTimeoutMs: parseInt(process.env.REQUEST_TIMEOUT_MS || '5000', 10),
  };
}
