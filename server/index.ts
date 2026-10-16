import { buildServer } from './server';
import { loadServerConfig } from './config';

const config = loadServerConfig();
const server = buildServer(config);

async function start() {
  try {
    const address = await server.listen({ port: config.port, host: config.host });
    console.log(`[ROOM S A // AI BACKEND PROXY] Online at ${address}`);
    console.log(`[AI PROVIDER] ${config.aiProvider} (Gemini API Key Configured: ${Boolean(config.geminiApiKey)})`);
  } catch (err) {
    console.error('[ROOM S A // SERVER ERROR]', err);
    process.exit(1);
  }
}

start();
