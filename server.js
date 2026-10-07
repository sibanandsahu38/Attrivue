const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { readStore, writeStore, publicAccount } = require('./store');

const PORT = Number(process.env.PORT || 3000);
const ROOT = path.join(__dirname, '..');
const FRONTEND = ROOT;
const TOKEN_MS = 1000 * 60 * 60 * 24 * 14;

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon'
};

function send(res, status, body, type) {
  const data = typeof body === 'string' || Buffer.isBuffer(body) ? body : JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': type || 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff'
  });
  res.end(data);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', chunk => {
      raw += chunk;
      if (raw.length > 8_000_000) reject(new Error('Body too large'));
    });
    req.on('end', () => {
      if (!raw) return resolve({});
      try { resolve(JSON.parse(raw)); }
      catch (err) { reject(new Error('Invalid JSON')); }
    });
    req.on('error', reject);
  });
}

function token() {
  return crypto.randomBytes(24).toString('hex');
}

function userFrom(req, store) {
  const header = req.headers.authorization || '';
  const value = header.startsWith('Bearer ') ? header.slice(7) : '';
  const session = store.sessions[value];
  if (!session || session.expires < Date.now()) return null;
  const user = store.users[session.username];
  if (!user) return null;
  return { token: value, username: session.username, user };
}

function issue(store, username) {
  const value = token();
  store.sessions[value] = { username, expires: Date.now() + TOKEN_MS };
  return value;
}

function cleanName(value) {
  return String(value || '').trim().slice(0, 80);
}

function validHash(value) {
  return typeof value === 'string' && /^[a-f0-9]{64}$|^x[a-f0-9]+$/.test(value);
}

async function api(req, res, url) {
  const store = readStore();
  if (url.pathname === '/api/health' && req.method === 'GET') {
    return send(res, 200, { ok: true, name: 'Attrivue', time: new Date().toISOString() });
  }
  if ((url.pathname === '/api/signup' || url.pathname === '/api/login') && req.method === 'POST') {
    const body = await readBody(req);
    const username = cleanName(body.username);
    if (!username || !validHash(body.passwordHash)) {
      return send(res, 400, { error: 'Username and a SHA-256 password hash are required.' });
    }
    if (url.pathname === '/api/signup') {
      if (store.users[username]) return send(res, 409, { error: 'That username is already taken. Try signing in instead.' });
      store.users[username] = {
        hash: body.passwordHash,
        created: new Date().toISOString(),
        schemaVersion: 1,
        theme: 'system',
        privacy: false,
        tourDone: false,
        modelId: 'ibm',
        customModels: [],
        models: {},
        log: []
      };
    } else {
      const found = store.users[username];
      if (!found) return send(res, 401, { error: 'No account found for that username. Create one first.' });
      if (found.hash !== body.passwordHash) return send(res, 401, { error: 'That password is not correct.' });
    }
    const issued = issue(store, username);
    writeStore(store);
    return send(res, 200, { token: issued, account: publicAccount(store.users[username]) });
  }
  const auth = userFrom(req, store);
  if (!auth) return send(res, 401, { error: 'Sign in again.' });
  if (url.pathname === '/api/logout' && req.method === 'POST') {
    delete store.sessions[auth.token];
    writeStore(store);
    return send(res, 200, { ok: true });
  }
  if (url.pathname === '/api/me' && req.method === 'GET') {
    return send(res, 200, { username: auth.username, account: publicAccount(auth.user) });
  }
  if (url.pathname === '/api/me' && req.method === 'PUT') {
    const body = await readBody(req);
    const keep = ['theme', 'privacy', 'tourDone', 'modelId', 'customModels', 'models', 'log'];
    keep.forEach(key => { if (body[key] !== undefined) auth.user[key] = body[key]; });
    auth.user.schemaVersion = 1;
    writeStore(store);
    return send(res, 200, { ok: true });
  }
  if (url.pathname === '/api/backup' && req.method === 'GET') {
    return send(res, 200, {
      app: 'Attrivue',
      schemaVersion: 1,
      exported: new Date().toISOString(),
      username: auth.username,
      ...publicAccount(auth.user)
    });
  }
  return send(res, 404, { error: 'Unknown API route.' });
}

function frontend(req, res, url) {
  const file = url.pathname === '/' ? 'index.html' : url.pathname.replace(/^\/+/, '');
  if (file !== 'index.html') {
    return send(res, 404, 'Not found', 'text/plain; charset=utf-8');
  }
  const full = path.join(FRONTEND, 'index.html');
  if (!fs.existsSync(full)) return send(res, 404, 'Not found', 'text/plain; charset=utf-8');
  send(res, 200, fs.readFileSync(full), TYPES['.html']);
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  try {
    if (url.pathname.startsWith('/api/')) await api(req, res, url);
    else frontend(req, res, url);
  } catch (err) {
    send(res, 400, { error: err.message || 'Bad request' });
  }
});

server.listen(PORT, () => {
  console.log('Attrivue running at http://localhost:' + PORT);
});
