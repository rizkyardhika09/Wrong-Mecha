// Encrypted credentials storage

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.join(__dirname, '..', 'data');
const CREDS_FILE = path.join(DATA_DIR, 'credentials.enc');
const KEY_FILE = path.join(DATA_DIR, '.key');

function ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }
}

function getOrCreateKey() {
    ensureDataDir();
    if (fs.existsSync(KEY_FILE)) {
        return fs.readFileSync(KEY_FILE);
    }
    const key = crypto.randomBytes(32);
    fs.writeFileSync(KEY_FILE, key);
    return key;
}

function encrypt(text) {
    const key = getOrCreateKey();
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();
    return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
}

function decrypt(data) {
    const key = getOrCreateKey();
    const parts = data.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

function loadCredentials() {
    ensureDataDir();
    if (!fs.existsSync(CREDS_FILE)) return [];
    try {
        const data = fs.readFileSync(CREDS_FILE, 'utf-8');
        const decrypted = decrypt(data);
        return JSON.parse(decrypted);
    } catch (e) {
        console.log('[storage] Decrypt error:', e.message);
        return [];
    }
}

function saveCredential(cred) {
    const all = loadCredentials();
    all.push(cred);
    const encrypted = encrypt(JSON.stringify(all));
    fs.writeFileSync(CREDS_FILE, encrypted);
}

module.exports = { loadCredentials, saveCredential };
