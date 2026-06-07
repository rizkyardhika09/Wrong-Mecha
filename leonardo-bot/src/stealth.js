// Custom stealth setup for Playwright
// Overrides common bot detection vectors without external plugin

async function applyStealth(context) {
    await context.addInitScript(function() {
        // Hide webdriver flag
        Object.defineProperty(navigator, 'webdriver', {
            get: function() { return false; }
        });

        // Mock plugins (real browser has plugins)
        Object.defineProperty(navigator, 'plugins', {
            get: function() {
                return [
                    { name: 'Chrome PDF Plugin', filename: 'internal-pdf-viewer', description: 'Portable Document Format' },
                    { name: 'Chrome PDF Viewer', filename: 'mhjfbmdgcfjbbpaeojofohoefgiehjai', description: '' },
                    { name: 'Native Client', filename: 'internal-nacl-plugin', description: '' }
                ];
            }
        });

        // Mock languages
        Object.defineProperty(navigator, 'languages', {
            get: function() { return ['en-US', 'en']; }
        });

        // Mock permissions query
        if (navigator.permissions) {
            const originalQuery = navigator.permissions.query;
            navigator.permissions.query = function(parameters) {
                if (parameters && parameters.name === 'notifications') {
                    return Promise.resolve({ state: Notification.permission });
                }
                return originalQuery.call(this, parameters);
            };
        }

        // Mock chrome runtime (Chrome only)
        if (!window.chrome) {
            window.chrome = {
                runtime: {},
                loadTimes: function() {},
                csi: function() {},
                app: {}
            };
        }

        // Mock Notification permission
        try {
            Object.defineProperty(Notification, 'permission', {
                get: function() { return 'default'; }
            });
        } catch (e) {}

        // Hide automation indicators in console
        const origConsoleDebug = console.debug;
        console.debug = function() {
            const args = Array.prototype.slice.call(arguments);
            const joined = args.join(' ');
            if (joined.indexOf('HeadlessChrome') !== -1) return;
            return origConsoleDebug.apply(console, args);
        };
    });
}

function getRandomViewport() {
    const sizes = [
        { width: 1366, height: 768 },
        { width: 1920, height: 1080 },
        { width: 1440, height: 900 },
        { width: 1536, height: 864 },
        { width: 1600, height: 900 }
    ];
    return sizes[Math.floor(Math.random() * sizes.length)];
}

function getRandomUserAgent() {
    const versions = [
        '120.0.0.0', '121.0.0.0', '122.0.0.0', '123.0.0.0', '124.0.0.0'
    ];
    const v = versions[Math.floor(Math.random() * versions.length)];
    return 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
           '(KHTML, like Gecko) Chrome/' + v + ' Safari/537.36';
}

// Random human-like delay
function humanDelay(min, max) {
    min = min || 100;
    max = max || 500;
    const ms = Math.floor(Math.random() * (max - min)) + min;
    return new Promise(function(r) { setTimeout(r, ms); });
}

// Human-like typing
async function humanType(page, selector, text) {
    await page.click(selector);
    for (const char of text) {
        await page.keyboard.type(char, { delay: 50 + Math.random() * 100 });
    }
}

module.exports = {
    applyStealth,
    getRandomViewport,
    getRandomUserAgent,
    humanDelay,
    humanType
};
