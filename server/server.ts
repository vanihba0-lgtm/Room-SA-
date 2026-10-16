import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import { loadServerConfig, ServerConfig } from './config';
import { interpretNaturalLanguage } from './provider';
import { AIInterpretationRequest } from '../src/game/types';

export function buildServer(customConfig?: Partial<ServerConfig>): FastifyInstance {
  const config: ServerConfig = {
    ...loadServerConfig(),
    ...customConfig,
  };

  const app = Fastify({
    logger: false,
    bodyLimit: 10240, // 10 KB strict body size limit
  });

  // Enable CORS for the local Vite dev server
  app.register(cors, {
    origin: [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:4173',
      'http://127.0.0.1:4173',
    ],
    methods: ['GET', 'POST', 'OPTIONS'],
  });

  // Health & Configuration Check
  app.get('/api/health', async () => {
    return {
      status: 'ok',
      timestamp: Date.now(),
      aiProvider: config.aiProvider,
      geminiConfigured: Boolean(config.geminiApiKey),
      geminiModel: config.geminiModel,
      serverTime: new Date().toISOString(),
    };
  });

  // Natural Language Rule Interpretation Route
  app.post<{ Body: unknown }>('/api/interpret-rule', async (req, reply) => {
    const body = req.body as Partial<AIInterpretationRequest> | null;

    if (!body || typeof body !== 'object') {
      return reply.status(400).send({
        status: 'error',
        message: 'Bad Request: Missing JSON request body.',
      });
    }

    if (
      typeof body.naturalLanguageInput !== 'string' ||
      body.naturalLanguageInput.trim() === ''
    ) {
      return reply.status(400).send({
        status: 'error',
        message: 'Bad Request: "naturalLanguageInput" must be a non-empty string.',
      });
    }

    if (body.naturalLanguageInput.length > 500) {
      return reply.status(400).send({
        status: 'error',
        message: 'Bad Request: "naturalLanguageInput" exceeds maximum length of 500 characters.',
      });
    }

    const currentRules = Array.isArray(body.currentRules)
      ? body.currentRules
      : [];

    const requestPayload: AIInterpretationRequest = {
      naturalLanguageInput: body.naturalLanguageInput.trim(),
      currentRules,
    };

    try {
      const result = await interpretNaturalLanguage(requestPayload, config);
      return reply.status(200).send(result);
    } catch (err: unknown) {
      return reply.status(500).send({
        status: 'error',
        message: `Internal Server Error: ${err instanceof Error ? err.message : String(err)}`,
      });
    }
  });

  return app;
}
