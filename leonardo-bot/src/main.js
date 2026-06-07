// Leonardo Bot - Main Entry Point
// One-click full automation: Canva signup -> team join -> Leonardo login
// Usage:
//   node src/main.js          (single signup)
//   node src/main.js --batch 3 (batch with cooldown)
//   node src/main.js --headless (background mode)

const { chromium } = require('playwright');
const { generateIdentity } = require('./identity');
const { TempMail } = require('./mailtm');
const { applyStealth, getRandomViewport, getRandomUserAgent, humanDelay } = require('./stealth');
const { pickBestTeam, decrementTeam, getTotalSlotsRemaining } = require('./teams');
const { saveCredential } = require('./storage');
const flow = require('./flow');

function log(msg) {
    const ts = new Date().toISOString().substring(11, 19);
    console.log('[' + ts + '] ' + msg);
}

function logSection(title) {
    console.log('\n' + '='.repeat(60));
    console.log(title);
    console.log('='.repeat(60));
}

async function runSignup(headless) {
    logSection('LEONARDO BOT - SIGNUP STARTING');

    // 1. Pick team
    const team = pickBestTeam();
    if (!team) {
        log('ERROR: No active teams with slots remaining');
        return { success: false, error: 'no_teams' };
    }
    log('Team: ' + team.name + ' (' + team.slotsRemaining + ' slots remaining)');
    log('Total pool: ' + getTotalSlotsRemaining() + ' slots');

    // 2. Generate identity
    const identity = generateIdentity();
    log('Identity: ' + identity.fullName);

    // 3. Create temp email
    log('Creating temp inbox via mail.tm...');
    const mail = new TempMail();
    let email;
    try {
        email = await mail.createInbox();
        log('Email: ' + email);
    } catch (e) {
        log('ERROR: ' + e.message);
        return { success: false, error: 'mail_failed' };
    }

    // 4. Launch browser
    log('Launching stealth browser (headless=' + headless + ')...');
    const viewport = getRandomViewport();
    const userAgent = getRandomUserAgent();
    const browser = await chromium.launch({
        headless: headless,
        args: [
            '--disable-blink-features=AutomationControlled',
            '--no-default-browser-check',
            '--no-first-run',
            '--disable-features=IsolateOrigins,site-per-process'
        ]
    });
    const context = await browser.newContext({
        viewport: viewport,
        userAgent: userAgent,
        locale: 'en-US',
        timezoneId: 'Asia/Jakarta',
        ignoreHTTPSErrors: true
    });
    await applyStealth(context);
    const page = await context.newPage();

    try {
        // 5. Canva signup
        const signupOk = await flow.canvaSignup(page, identity, email, log);
        if (!signupOk) {
            log('WARNING: Signup form submit uncertain, continuing anyway');
        }

        // 6. Poll verification email
        log('Polling for verification email (max 2 min)...');
        const message = await mail.pollForVerification('canva', 120000);
        if (!message) {
            log('ERROR: No verification email received');
            return { success: false, error: 'no_verification' };
        }
        log('Verification email received');

        const verifyLink = mail.extractVerificationLink(message);
        if (!verifyLink) {
            log('ERROR: Could not extract verification link');
            return { success: false, error: 'no_verify_link' };
        }
        log('Link: ' + verifyLink.substring(0, 60) + '...');

        // 7. Click verification link
        await flow.clickVerificationLink(page, verifyLink, log);

        // 8. Join team
        const joinedOk = await flow.joinTeam(page, team.url, log);
        if (!joinedOk) {
            log('WARNING: Team join uncertain');
        }
        decrementTeam(team.name);

        // 9. Leonardo login
        const leonardoOk = await flow.leonardoLogin(page, log);

        // 10. Save credentials
        const credential = {
            email: email,
            password: identity.password,
            identity: identity,
            team: team.name,
            teamUrl: team.url,
            createdAt: new Date().toISOString(),
            creditsInitial: 8500,
            leonardoOk: leonardoOk
        };
        saveCredential(credential);
        log('Credentials saved (encrypted)');

        logSection('SUCCESS - 8500 credits ready');
        log('Email: ' + email);
        log('Password: ' + identity.password);
        log('Team: ' + team.name);
        log('REMINDER: Use credits TODAY (anti-stockpile rule)');

        if (!headless) {
            log('\nBrowser kept open. Press Ctrl+C to close.');
            // Keep alive for user to use Leonardo
            await new Promise(function() {});
        }

        return { success: true, credential: credential };

    } catch (err) {
        log('FATAL ERROR: ' + err.message);
        console.error(err);
        return { success: false, error: err.message };

    } finally {
        if (headless) {
            await browser.close();
        }
    }
}

async function runBatch(count, headless, cooldownMs) {
    logSection('BATCH MODE: ' + count + ' signups, cooldown ' + (cooldownMs / 1000) + 's between');
    let success = 0;
    for (let i = 0; i < count; i++) {
        console.log('\n>>> Signup ' + (i + 1) + ' / ' + count + ' <<<');
        try {
            const result = await runSignup(headless);
            if (result.success) success++;
        } catch (e) {
            log('Signup ' + (i + 1) + ' failed: ' + e.message);
        }
        if (i < count - 1) {
            log('Cooldown ' + (cooldownMs / 1000) + 's before next...');
            await new Promise(function(r) { setTimeout(r, cooldownMs); });
        }
    }
    logSection('BATCH COMPLETE: ' + success + ' / ' + count + ' successful');
}

// ==================== CLI ====================

function parseArgs(argv) {
    const args = { batch: 1, headless: false, cooldownMs: 300000 };
    for (let i = 2; i < argv.length; i++) {
        const a = argv[i];
        if (a === '--headless') args.headless = true;
        else if (a === '--batch') args.batch = parseInt(argv[++i], 10) || 1;
        else if (a === '--cooldown') args.cooldownMs = parseInt(argv[++i], 10) * 1000 || 300000;
    }
    return args;
}

async function main() {
    const args = parseArgs(process.argv);
    if (args.batch > 1) {
        await runBatch(args.batch, args.headless, args.cooldownMs);
    } else {
        await runSignup(args.headless);
    }
}

main().catch(function(err) {
    console.error('UNCAUGHT ERROR:', err);
    process.exit(1);
});
