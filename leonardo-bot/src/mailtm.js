// Temp mail via mail.tm API
// Free, programmatic, no website interference

const https = require('https');

const API_BASE = 'https://api.mail.tm';

function request(method, path, body, token) {
    return new Promise(function(resolve, reject) {
        const options = {
            method: method,
            hostname: 'api.mail.tm',
            path: path,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        };
        if (token) {
            options.headers['Authorization'] = 'Bearer ' + token;
        }
        const req = https.request(options, function(res) {
            let data = '';
            res.on('data', function(chunk) { data += chunk; });
            res.on('end', function() {
                try {
                    if (res.statusCode >= 400) {
                        reject(new Error('HTTP ' + res.statusCode + ': ' + data));
                    } else {
                        resolve(data ? JSON.parse(data) : {});
                    }
                } catch (e) {
                    reject(e);
                }
            });
        });
        req.on('error', reject);
        if (body) {
            req.write(JSON.stringify(body));
        }
        req.end();
    });
}

function randomString(len) {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let s = '';
    for (let i = 0; i < len; i++) {
        s += chars[Math.floor(Math.random() * chars.length)];
    }
    return s;
}

class TempMail {
    constructor() {
        this.email = null;
        this.password = null;
        this.token = null;
    }

    async createInbox() {
        // Get available domains
        const domainsResp = await request('GET', '/domains');
        const domains = domainsResp['hydra:member'] || [];
        if (domains.length === 0) {
            throw new Error('No temp mail domains available');
        }
        const domain = domains[0].domain;

        this.email = randomString(12) + '@' + domain;
        this.password = randomString(16);

        // Create account
        await request('POST', '/accounts', {
            address: this.email,
            password: this.password
        });

        // Get token
        const tokenResp = await request('POST', '/token', {
            address: this.email,
            password: this.password
        });
        this.token = tokenResp.token;

        return this.email;
    }

    async listMessages() {
        const resp = await request('GET', '/messages', null, this.token);
        return resp['hydra:member'] || [];
    }

    async getMessage(id) {
        return await request('GET', '/messages/' + id, null, this.token);
    }

    async pollForVerification(senderContains, timeoutMs) {
        senderContains = (senderContains || 'canva').toLowerCase();
        timeoutMs = timeoutMs || 120000;
        const start = Date.now();
        const pollInterval = 5000;

        console.log('[mail.tm] Polling for verification email (timeout ' + (timeoutMs / 1000) + 's)...');

        while (Date.now() - start < timeoutMs) {
            try {
                const messages = await this.listMessages();
                for (const msg of messages) {
                    const fromAddr = (msg.from && msg.from.address || '').toLowerCase();
                    if (fromAddr.includes(senderContains)) {
                        const full = await this.getMessage(msg.id);
                        return full;
                    }
                }
            } catch (e) {
                console.log('[mail.tm] Poll error:', e.message);
            }
            await new Promise(function(r) { setTimeout(r, pollInterval); });
        }
        return null;
    }

    extractVerificationLink(message) {
        const text = (message.text || '') + ' ' + (message.html ? message.html.join(' ') : '');
        const urlRegex = /https?:\/\/[^\s<>"']+/g;
        const urls = text.match(urlRegex) || [];
        for (const url of urls) {
            const lower = url.toLowerCase();
            if ((lower.includes('verify') || lower.includes('confirm') ||
                 lower.includes('email')) && lower.includes('canva')) {
                return url.replace(/[\\"'<>]+$/, '');
            }
        }
        // Fallback: any canva URL
        for (const url of urls) {
            if (url.toLowerCase().includes('canva')) {
                return url.replace(/[\\"'<>]+$/, '');
            }
        }
        return null;
    }
}

module.exports = { TempMail };
