// Main automation flow: Canva signup -> team join -> Leonardo login

const { humanDelay } = require('./stealth');

async function detectCaptcha(page) {
    const selectors = [
        'iframe[src*="recaptcha"]',
        'iframe[src*="hcaptcha"]',
        'div[class*="captcha"]',
        'div[class*="challenge"]'
    ];
    for (const sel of selectors) {
        const found = await page.locator(sel).count();
        if (found > 0) return true;
    }
    return false;
}

async function waitForCaptchaResolved(page, log) {
    log('CAPTCHA detected. Solve manually in browser. Bot resumes when done...');
    const startUrl = page.url();
    const timeout = 300000;
    const start = Date.now();
    while (Date.now() - start < timeout) {
        await new Promise(function(r) { setTimeout(r, 3000); });
        const still = await detectCaptcha(page);
        if (!still) {
            log('CAPTCHA solved. Continuing...');
            return true;
        }
    }
    log('CAPTCHA timeout. Manual intervention failed.');
    return false;
}

// ==================== CANVA SIGNUP ====================

async function canvaSignup(page, identity, email, log) {
    log('Opening Canva signup...');
    await page.goto('https://www.canva.com/id_id/signup', { waitUntil: 'domcontentloaded' });
    await humanDelay(2000, 4000);

    // Click "Continue with email"
    log('Looking for email signup button...');
    const emailButtonTexts = [
        'Lanjutkan dengan email',
        'Continue with email',
        'Sign up with email'
    ];
    let clickedEmailBtn = false;
    for (const txt of emailButtonTexts) {
        try {
            const btn = page.locator('text="' + txt + '"').first();
            const count = await btn.count();
            if (count > 0) {
                await btn.click({ timeout: 5000 });
                clickedEmailBtn = true;
                log('Clicked: ' + txt);
                break;
            }
        } catch (e) {}
    }
    if (!clickedEmailBtn) log('Email button not found, trying direct form');

    await humanDelay(1500, 3000);

    // Fill email
    log('Filling email: ' + email);
    try {
        const emailInput = page.locator('input[type="email"]').first();
        await emailInput.fill(email, { timeout: 10000 });
        await humanDelay(500, 1500);
        await emailInput.press('Enter');
    } catch (e) {
        log('Email fill error: ' + e.message);
    }

    await humanDelay(2000, 3000);

    // CAPTCHA check
    if (await detectCaptcha(page)) {
        await waitForCaptchaResolved(page, log);
    }

    // Fill name fields (multiple attempts as Canva flow varies)
    log('Filling name...');
    let nameFilled = false;
    for (let attempt = 0; attempt < 10; attempt++) {
        try {
            const firstInput = await page.locator('input[name="firstName"]').count();
            if (firstInput > 0) {
                await page.locator('input[name="firstName"]').first().fill(identity.firstName);
                await humanDelay(300, 700);
                const lastCount = await page.locator('input[name="lastName"]').count();
                if (lastCount > 0) {
                    await page.locator('input[name="lastName"]').first().fill(identity.lastName);
                }
                nameFilled = true;
                break;
            }
            const nameInput = await page.locator('input[placeholder*="name" i], input[placeholder*="nama" i]').count();
            if (nameInput > 0) {
                await page.locator('input[placeholder*="name" i], input[placeholder*="nama" i]').first().fill(identity.fullName);
                nameFilled = true;
                break;
            }
        } catch (e) {}
        await humanDelay(1000, 2000);
    }
    if (nameFilled) log('Name filled');

    // Fill password
    log('Filling password...');
    try {
        const passInput = page.locator('input[type="password"]').first();
        await passInput.fill(identity.password, { timeout: 10000 });
        await humanDelay(500, 1000);
    } catch (e) {
        log('Password fill error: ' + e.message);
    }

    // Submit
    log('Submitting form...');
    const submitTexts = ['Continue', 'Sign up', 'Daftar', 'Lanjutkan'];
    let submitted = false;
    for (const txt of submitTexts) {
        try {
            const btn = page.locator('button:has-text("' + txt + '")').first();
            const count = await btn.count();
            if (count > 0) {
                await btn.click({ timeout: 5000 });
                submitted = true;
                log('Clicked submit: ' + txt);
                break;
            }
        } catch (e) {}
    }
    if (!submitted) {
        // Try pressing Enter on password
        try {
            await page.locator('input[type="password"]').first().press('Enter');
            submitted = true;
        } catch (e) {}
    }

    await humanDelay(3000, 5000);

    if (await detectCaptcha(page)) {
        await waitForCaptchaResolved(page, log);
    }

    return submitted;
}

// ==================== VERIFY EMAIL ====================

async function clickVerificationLink(page, link, log) {
    log('Opening verification link...');
    await page.goto(link, { waitUntil: 'domcontentloaded' });
    await humanDelay(3000, 5000);

    // Wait for verification to complete
    log('Waiting for verification to complete...');
    try {
        await page.waitForURL(function(url) {
            return !url.includes('verify') && !url.includes('confirm');
        }, { timeout: 30000 });
    } catch (e) {
        log('Verification page wait timeout');
    }

    await humanDelay(2000, 3000);
    return true;
}

// ==================== JOIN TEAM ====================

async function joinTeam(page, teamUrl, log) {
    log('Opening team invite URL...');
    await page.goto(teamUrl, { waitUntil: 'domcontentloaded' });
    await humanDelay(3000, 5000);

    if (await detectCaptcha(page)) {
        await waitForCaptchaResolved(page, log);
    }

    log('Looking for Join Team button...');
    const joinTexts = ['Join team', 'Gabung tim', 'Accept', 'Terima undangan', 'Join'];
    let joined = false;
    for (let attempt = 0; attempt < 5; attempt++) {
        for (const txt of joinTexts) {
            try {
                const btn = page.locator('button:has-text("' + txt + '"), a:has-text("' + txt + '")').first();
                const count = await btn.count();
                if (count > 0) {
                    await humanDelay(800, 1500);
                    await btn.click({ timeout: 5000 });
                    joined = true;
                    log('Clicked: ' + txt);
                    break;
                }
            } catch (e) {}
        }
        if (joined) break;
        await humanDelay(2000, 3000);
    }

    if (joined) {
        await humanDelay(3000, 5000);
        log('Team joined');
    } else {
        log('Join Team button not found');
    }
    return joined;
}

// ==================== LEONARDO LOGIN ====================

async function leonardoLogin(page, log) {
    log('Opening Leonardo...');
    await page.goto('https://leonardo.ai/', { waitUntil: 'domcontentloaded' });
    await humanDelay(3000, 5000);

    log('Looking for Continue with Canva button...');
    const oauthTexts = [
        'Continue with Canva',
        'Login with Canva',
        'Sign in with Canva',
        'Canva'
    ];
    let clicked = false;
    for (let attempt = 0; attempt < 5; attempt++) {
        for (const txt of oauthTexts) {
            try {
                const btn = page.locator('button:has-text("' + txt + '"), a:has-text("' + txt + '")').first();
                const count = await btn.count();
                if (count > 0) {
                    await humanDelay(800, 1500);
                    await btn.click({ timeout: 5000 });
                    clicked = true;
                    log('Clicked: ' + txt);
                    break;
                }
            } catch (e) {}
        }
        if (clicked) break;
        await humanDelay(2000, 3000);
    }

    if (!clicked) {
        log('Canva OAuth button not found');
        return false;
    }

    // Wait for Leonardo app to load
    log('Waiting for Leonardo to authorize...');
    try {
        await page.waitForURL(function(url) {
            return url.includes('app.leonardo.ai');
        }, { timeout: 60000 });
        log('Leonardo login complete - 8500 credits ready');
        return true;
    } catch (e) {
        log('Leonardo authorization timeout');
        return false;
    }
}

module.exports = {
    canvaSignup,
    clickVerificationLink,
    joinTeam,
    leonardoLogin,
    detectCaptcha,
    waitForCaptchaResolved
};
