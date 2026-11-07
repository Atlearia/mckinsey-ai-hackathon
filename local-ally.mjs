import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { parseEnv } from 'node:util';
import { handleAlly } from './server/ally.mjs';

// Run alongside the activity preview on port 3000 with `node local-ally.mjs`.
const origins = new Set(['http://localhost:3000', 'http://127.0.0.1:3000', 'http://[::1]:3000']);
const envFile = process.env.LOCALAPPDATA && join(process.env.LOCALAPPDATA, 'PizzaPartyPreview', 'ally.env');
const settings = envFile ? parseEnv(await readFile(envFile, 'utf8').catch(() => '')) : {};
const apiKey = process.env.OPENAI_API_KEY || settings.OPENAI_API_KEY;

const server = createServer(async (req, res) => {
  function finish(status, body = {}) {
    res.writeHead(status, {'Content-Type':'application/json', 'Cache-Control':'no-store'});
    res.end(JSON.stringify(body));
  }
  if (req.headers.host !== '127.0.0.1:3107' || !origins.has(req.headers.origin)) return finish(403);
  if (req.url !== '/api/ally') return finish(404);
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return finish(204);
  }
  await handleAlly(req,res,apiKey);
});
server.listen(3107, '127.0.0.1');
