/**
 * Biela Enterprise — port manifest reader. Managed by the platform; do not edit.
 *
 * Resolution order per service: .biela/ports.json → environment → default.
 *
 * The manifest is written by the platform for THIS worktree, so it is the most
 * specific source. It is also a file inside your repo that you can edit, so a
 * value from it is honoured only inside the platform's dev-server port block —
 * a number outside it is ignored rather than trusted. Environment values
 * (PORT, API_PORT) come from the platform directly, or from you running the
 * project by hand, and are used as-is.
 *
 * This file is committed on purpose: vite.config.ts imports it statically, and
 * a production build from a git clone has no manifest to read. Everything here
 * degrades to defaults rather than throwing, so such a build still succeeds.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ALLOWED_BLOCK = [26000,27299];
const DEFAULTS = {"web":5173,"api":3001};
const ENV_KEYS = {"web":["PORT"],"api":["API_PORT"],"db":["DB_PORT"]};

function isValidPort(value) {
  return Number.isInteger(value) && value > 0 && value < 65536;
}

/** Read the manifest. Missing, unreadable, malformed or truncated — all null. */
function loadManifest() {
  try {
    const here = dirname(fileURLToPath(import.meta.url));
    const parsed = JSON.parse(readFileSync(join(here, 'ports.json'), 'utf-8'));
    if (!parsed || parsed.version !== 1) return null;
    if (!parsed.services || typeof parsed.services !== 'object') return null;
    return parsed;
  } catch {
    return null;
  }
}

function fromManifest(manifest, service) {
  if (!manifest) return null;
  const entry = manifest.services[service];
  const port = entry && entry.port;
  if (!isValidPort(port)) return null;
  // A manifest value is a hint, not an instruction — see the header. The clamp
  // exists to stop a hand-edited ports.json from pointing this reader at
  // something it has no business reaching (a platform service, 443, 22), so it
  // accepts one contiguous block and nothing else.
  //
  // Deliberately one block for every service rather than a per-service range:
  // the platform legitimately assigns outside a service's own sub-range. A
  // project that predates the per-role split was allocated anywhere in the block
  // and keeps its number, because the preview URL is built from it and moving it
  // would move the URL. Rejecting those would send a correct, platform-issued
  // port down the fallback path.
  const [lo, hi] = ALLOWED_BLOCK;
  if (port < lo || port > hi) return null;
  return port;
}

function fromEnv(service) {
  for (const key of ENV_KEYS[service] || []) {
    const raw = process.env[key];
    if (raw == null || raw === '') continue;
    const port = Number(raw);
    if (isValidPort(port)) return port;
  }
  return null;
}

/**
 * Resolve this tree's ports.
 *
 * Returns { web, api, webUrl, apiUrl, services, urls, sources }. `services`
 * carries every service that has a default here PLUS any extra one the manifest
 * declares (db, worker, …), so a tree with more than a front end and an API can
 * read those without this file knowing about them in advance. Never throws.
 */
export function readPorts() {
  const manifest = loadManifest();
  // Every service with a default always resolves, manifest or not — that is what
  // makes "no manifest" a working configuration rather than a hole.
  const known = new Set([
    ...Object.keys(DEFAULTS),
    ...Object.keys(manifest ? manifest.services : {}),
  ]);

  const services = {};
  const sources = {};
  for (const service of known) {
    const manifestPort = fromManifest(manifest, service);
    if (manifestPort != null) {
      services[service] = manifestPort;
      sources[service] = 'manifest';
      continue;
    }
    const envPort = fromEnv(service);
    if (envPort != null) {
      services[service] = envPort;
      sources[service] = 'env';
      continue;
    }
    if (DEFAULTS[service] != null) {
      services[service] = DEFAULTS[service];
      sources[service] = 'default';
    }
  }

  const urls = {};
  for (const [service, port] of Object.entries(services)) {
    urls[service] = 'http://127.0.0.1:' + port;
  }

  return {
    web: services.web,
    api: services.api,
    webUrl: urls.web,
    apiUrl: urls.api,
    services,
    urls,
    sources,
  };
}

export default readPorts;
