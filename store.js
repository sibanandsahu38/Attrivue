const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, 'data', 'accounts.json');

function empty() {
  return { users: {}, sessions: {} };
}

function readStore() {
  try {
    return JSON.parse(fs.readFileSync(FILE, 'utf8'));
  } catch (err) {
    return empty();
  }
}

function writeStore(store) {
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  const tmp = FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(store, null, 2));
  fs.renameSync(tmp, FILE);
}

function publicAccount(user) {
  const copy = Object.assign({}, user);
  delete copy.hash;
  return copy;
}

module.exports = { readStore, writeStore, publicAccount };
