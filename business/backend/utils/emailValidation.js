const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const DISPOSABLE_LIST_URL = 'https://raw.githubusercontent.com/disposable-email-domains/disposable-email-domains/master/disposable_email_blocklist.conf';
const LOCAL_LIST_PATH = path.join(__dirname, '..', 'data', 'disposable-email-domains.txt');
const UPDATE_INTERVAL_MS = 24 * 60 * 60 * 1000;

const STATIC_BLOCKED = [
  "gmail.com","yahoo.com","hotmail.com","outlook.com","aol.com","icloud.com",
  "me.com","live.com","msn.com","ymail.com","protonmail.com","proton.me",
  "mail.com","zoho.com","gmx.com","gmx.net","fastmail.com","hey.com",
  "pm.me","tutanota.com","guerrillamail.com","mailinator.com","yahoo.co.uk",
  "comcast.net","verizon.net","att.net","sbcglobal.net","bellsouth.net"
];

const blockedDomains = new Set(STATIC_BLOCKED);

function loadDomainsFromFile() {
  try {
    const fileContent = fs.readFileSync(LOCAL_LIST_PATH, 'utf8');
    const domains = fileContent.split('\n')
      .map(d => d.trim().toLowerCase())
      .filter(d => d.length > 0);
    domains.forEach(d => blockedDomains.add(d));
    console.log(`Loaded ${blockedDomains.size} blocked email domains (including ${domains.length} from disposable list file)`);
    return domains.length;
  } catch (err) {
    console.warn('Could not load disposable email domains file:', err.message);
    return 0;
  }
}

function fetchRemoteList() {
  const lib = DISPOSABLE_LIST_URL.startsWith('https') ? https : http;
  lib.get(DISPOSABLE_LIST_URL, (res) => {
    if (res.statusCode !== 200) {
      console.warn(`Disposable list fetch failed: HTTP ${res.statusCode}`);
      res.resume();
      return;
    }
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
      const domains = body.split('\n')
        .map(d => d.trim().toLowerCase())
        .filter(d => d.length > 0);
      if (domains.length < 100) {
        console.warn(`Disposable list fetched too few domains (${domains.length}), skipping update`);
        return;
      }
      blockedDomains.clear();
      STATIC_BLOCKED.forEach(d => blockedDomains.add(d));
      domains.forEach(d => blockedDomains.add(d));
      try {
        fs.mkdirSync(path.dirname(LOCAL_LIST_PATH), { recursive: true });
        fs.writeFileSync(LOCAL_LIST_PATH, body, 'utf8');
      } catch (e) {
        console.warn('Could not save disposable list to disk:', e.message);
      }
      console.log(`Updated disposable email list: ${blockedDomains.size} total blocked domains (${domains.length} remote)`);
    });
  }).on('error', (err) => {
    console.warn('Disposable list fetch error:', err.message);
  });
}

loadDomainsFromFile();

fetchRemoteList();
setInterval(fetchRemoteList, UPDATE_INTERVAL_MS);

function isBusinessEmail(email) {
  const domain = email.split('@')[1]?.toLowerCase();
  return domain && !blockedDomains.has(domain);
}

module.exports = { isBusinessEmail };
