import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildServer } from '../../server/server';

describe('ROOM S A — Fastify Backend Proxy', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = buildServer({ aiProvider: 'mock' });
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/health returns ok status and provider details', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/health',
    });

    expect(res.statusCode).toBe(200);
    const json = res.json();
    expect(json.status).toBe('ok');
    expect(json.aiProvider).toBe('mock');
  });

  it('POST /api/interpret-rule converts brass key request to valid proposal', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/interpret-rule',
      payload: {
        naturalLanguageInput: 'Make brass keys work like copper keys',
        currentRules: [{ id: 'RULE_01', statement: 'Doors yield only to copper keys.' }],
      },
    });

    expect(res.statusCode).toBe(200);
    const json = res.json();
    expect(json.status).toBe('success');
    expect(json.proposal.targetRuleId).toBe('RULE_01');
    expect(json.proposal.newPredicateKey).toBe('RULE_BRASS_KEY_ALLOWED');
    expect(json.proposal.targetCondition).toBe('brass');
  });

  it('POST /api/interpret-rule rejects "Remove every rule in the universe"', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/interpret-rule',
      payload: {
        naturalLanguageInput: 'Remove every rule in the universe.',
        currentRules: [],
      },
    });

    expect(res.statusCode).toBe(200);
    const json = res.json();
    expect(json.status).toBe('rejected');
    expect(json.proposal.operation).toBe('UNSUPPORTED');
  });

  it('POST /api/interpret-rule returns 400 when input is missing or empty', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/interpret-rule',
      payload: {
        naturalLanguageInput: '   ',
      },
    });

    expect(res.statusCode).toBe(400);
    const json = res.json();
    expect(json.message).toContain('must be a non-empty string');
  });

  it('POST /api/interpret-rule rejects oversized payloads exceeding bodyLimit', async () => {
    const hugeInput = 'a'.repeat(15000); // 15KB > 10KB limit
    const res = await app.inject({
      method: 'POST',
      url: '/api/interpret-rule',
      payload: {
        naturalLanguageInput: hugeInput,
      },
    });

    expect(res.statusCode).toBe(413);
  });
});
