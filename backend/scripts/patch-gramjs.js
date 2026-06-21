/**
 * gramJS PING patch — CPU optimizatsiya
 *
 * Muammo: gramJS _updateLoop PING_FAIL_INTERVAL = 100ms
 * Ping fail bo'lganda har 100ms da retry qiladi → 100% CPU
 *
 * Patch:
 * - PING_INTERVAL: 9000 → 15000 (15s — kamroq ping)
 * - PING_FAIL_INTERVAL: 100 → 3000 (3s — retry orasida kutish)
 * - PING_FAIL_ATTEMPTS: 3 → 2 (kamroq retry)
 * - console.error → suppressed for TIMEOUT (log spam kamaytirish)
 */

const fs = require('fs');
const path = require('path');

const updatesPath = path.join(__dirname, '..', 'node_modules', 'telegram', 'client', 'updates.js');

if (!fs.existsSync(updatesPath)) {
  console.log('[patch-gramjs] telegram/client/updates.js topilmadi, skip');
  process.exit(0);
}

let content = fs.readFileSync(updatesPath, 'utf8');
let patched = false;

// PING_INTERVAL: 9000 → 15000
if (content.includes('const PING_INTERVAL = 9000')) {
  content = content.replace('const PING_INTERVAL = 9000', 'const PING_INTERVAL = 15000');
  patched = true;
}

// PING_FAIL_INTERVAL: 100 → 3000
if (content.includes('const PING_FAIL_INTERVAL = 100')) {
  content = content.replace('const PING_FAIL_INTERVAL = 100', 'const PING_FAIL_INTERVAL = 3000');
  patched = true;
}

// PING_FAIL_ATTEMPTS: 3 → 2
if (content.includes('const PING_FAIL_ATTEMPTS = 3')) {
  content = content.replace('const PING_FAIL_ATTEMPTS = 3', 'const PING_FAIL_ATTEMPTS = 2');
  patched = true;
}

// console.error(err) → suppress TIMEOUT errors in _updateLoop
// Replace the error logging to check for TIMEOUT first
if (content.includes('console.error(err)') || content.includes('console.error(e)')) {
  // In _updateLoop catch block — suppress TIMEOUT
  content = content.replace(
    /if \(client\._log\.canSend\(Logger_1\.LogLevel\.ERROR\)\) \{\s*\n\s*console\.error\(err\);/g,
    'if (client._log.canSend(Logger_1.LogLevel.ERROR) && err?.message !== "TIMEOUT" && err?.message !== "Not connected") {\n                console.error(err);'
  );
  patched = true;
}

if (patched) {
  fs.writeFileSync(updatesPath, content, 'utf8');
  console.log('[patch-gramjs] gramJS patched successfully');
} else {
  console.log('[patch-gramjs] gramJS already patched or no changes needed');
}
