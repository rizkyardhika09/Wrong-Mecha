// ==UserScript==
// @name         Wrong Mecha - Leonardo Workflow Helper
// @namespace    https://github.com/rizkyardhika09/Wrong-Mecha
// @version      1.0.0
// @description  Auto-fill Canva signup, auto-extract verification email, auto-join team, auto-click Leonardo OAuth. Lifetime tool for Wrong Mecha production.
// @author       Rizky Ardhika
// @match        https://www.canva.com/*
// @match        https://canva.com/*
// @match        https://temporary-email.net/*
// @match        https://leonardo.ai/*
// @match        https://app.leonardo.ai/*
// @grant        GM_setClipboard
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_notification
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    // ==================== UTILITIES ====================

    const STORAGE_KEY = 'wmek_current_session';

    function getSession() {
        const raw = GM_getValue(STORAGE_KEY, null);
        if (!raw) return null;
        try { return JSON.parse(raw); }
        catch (e) { return null; }
    }

    function saveSession(data) {
        GM_setValue(STORAGE_KEY, JSON.stringify(data));
    }

    function clearSession() {
        GM_setValue(STORAGE_KEY, '');
    }

    // Random data
    const FIRST_NAMES = [
        'Aaron', 'Alex', 'Andre', 'Brian', 'Caleb', 'Daniel', 'Ethan', 'Felix',
        'Gabriel', 'Henry', 'Ivan', 'Jason', 'Kevin', 'Liam', 'Marcus',
        'Nathan', 'Oscar', 'Peter', 'Quentin', 'Ryan', 'Samuel', 'Thomas',
        'Victor', 'William', 'Xavier', 'Yusuf', 'Zachary'
    ];
    const LAST_NAMES = [
        'Anderson', 'Brown', 'Clark', 'Davis', 'Evans', 'Fisher', 'Garcia',
        'Harris', 'Johnson', 'King', 'Lewis', 'Martinez', 'Nelson', 'Oliver',
        'Parker', 'Quinn', 'Roberts', 'Smith', 'Taylor', 'Underwood',
        'Vargas', 'Wilson', 'Young', 'Zimmerman'
    ];

    function pick(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    function generatePassword() {
        const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
        const lower = 'abcdefghjkmnpqrstuvwxyz';
        const nums = '23456789';
        const syms = '!@#$%';
        let pwd = pick(upper);
        for (let i = 0; i < 3; i++) pwd += pick(lower);
        for (let i = 0; i < 3; i++) pwd += pick(nums);
        pwd += pick(syms);
        for (let i = 0; i < 4; i++) {
            pwd += pick(lower + upper + nums);
        }
        return pwd;
    }

    function generateIdentity() {
        const first = pick(FIRST_NAMES);
        const last = pick(LAST_NAMES);
        return {
            firstName: first,
            lastName: last,
            fullName: first + ' ' + last,
            password: generatePassword(),
            createdAt: new Date().toISOString()
        };
    }

    // ==================== STATUS OVERLAY ====================

    function createOverlay() {
        const existing = document.getElementById('wmek-overlay');
        if (existing) return existing;

        const div = document.createElement('div');
        div.id = 'wmek-overlay';
        div.style.cssText = [
            'position:fixed',
            'top:20px',
            'right:20px',
            'z-index:999999',
            'background:#1e1e2e',
            'color:#cdd6f4',
            'padding:15px 20px',
            'border-radius:8px',
            'border:2px solid #cba6f7',
            'font-family:system-ui,sans-serif',
            'font-size:14px',
            'max-width:350px',
            'box-shadow:0 4px 20px rgba(0,0,0,0.5)',
            'line-height:1.5'
        ].join(';');

        const title = document.createElement('div');
        title.style.cssText = 'font-weight:bold;color:#f38ba8;margin-bottom:8px;font-size:15px';
        title.textContent = 'Wrong Mecha Helper';
        div.appendChild(title);

        const content = document.createElement('div');
        content.id = 'wmek-content';
        div.appendChild(content);

        const closeBtn = document.createElement('button');
        closeBtn.textContent = 'X';
        closeBtn.style.cssText = [
            'position:absolute',
            'top:8px',
            'right:8px',
            'background:transparent',
            'border:none',
            'color:#cdd6f4',
            'cursor:pointer',
            'font-size:16px',
            'font-weight:bold'
        ].join(';');
        closeBtn.onclick = function() { div.remove(); };
        div.appendChild(closeBtn);

        document.body.appendChild(div);
        return div;
    }

    function setStatus(html) {
        createOverlay();
        const el = document.getElementById('wmek-content');
        if (el) el.innerHTML = html;
    }

    function addButton(label, onClick, color) {
        createOverlay();
        const content = document.getElementById('wmek-content');
        const btn = document.createElement('button');
        btn.textContent = label;
        btn.style.cssText = [
            'background:' + (color || '#cba6f7'),
            'color:#1e1e2e',
            'border:none',
            'padding:6px 12px',
            'border-radius:4px',
            'margin:5px 5px 0 0',
            'cursor:pointer',
            'font-weight:bold',
            'font-size:12px'
        ].join(';');
        btn.onclick = onClick;
        content.appendChild(btn);
        return btn;
    }

    // ==================== CANVA SIGNUP HANDLER ====================

    function handleCanvaSignup() {
        let session = getSession();
        if (!session || !session.identity) {
            session = { identity: generateIdentity(), step: 'signup' };
            saveSession(session);
        }

        const id = session.identity;

        setStatus(
            '<b>Step 1: Canva Signup</b><br>' +
            '<b>Name:</b> ' + id.firstName + ' ' + id.lastName + '<br>' +
            '<b>Password:</b> <code style="background:#313244;padding:2px 5px;border-radius:3px">' + id.password + '</code><br>' +
            '<br>' +
            '<i>Paste temp email when needed, click Continue manually for safety.</i>'
        );

        addButton('Copy Password', function() {
            GM_setClipboard(id.password);
            setStatus(
                '<b>Password copied!</b><br>' +
                'Paste in password field.<br><br>' +
                '<b>Name:</b> ' + id.fullName
            );
        }, '#a6e3a1');

        addButton('Copy Full Name', function() {
            GM_setClipboard(id.fullName);
        }, '#89dceb');

        addButton('New Identity', function() {
            session.identity = generateIdentity();
            saveSession(session);
            handleCanvaSignup();
        }, '#f9e2af');

        // Auto-fill name fields when they appear
        let nameAttempts = 0;
        const nameInterval = setInterval(function() {
            nameAttempts++;
            if (nameAttempts > 30) { clearInterval(nameInterval); return; }

            const firstInput = document.querySelector('input[name="firstName"]');
            const lastInput = document.querySelector('input[name="lastName"]');
            const nameInput = document.querySelector(
                'input[placeholder*="name" i], input[placeholder*="nama" i]'
            );

            if (firstInput && !firstInput.value) {
                setNativeValue(firstInput, id.firstName);
                if (lastInput) setNativeValue(lastInput, id.lastName);
            } else if (nameInput && !nameInput.value) {
                setNativeValue(nameInput, id.fullName);
            }

            const passInput = document.querySelector('input[type="password"]');
            if (passInput && !passInput.value) {
                setNativeValue(passInput, id.password);
            }
        }, 1000);
    }

    // Native setter for React inputs
    function setNativeValue(element, value) {
        const valueSetter = Object.getOwnPropertyDescriptor(
            element.__proto__, 'value'
        ).set;
        valueSetter.call(element, value);
        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new Event('change', { bubbles: true }));
    }

    // ==================== CANVA TEAM INVITE HANDLER ====================

    function handleTeamInvite() {
        setStatus(
            '<b>Step 3: Join Team</b><br>' +
            'Scanning for Join button...<br><br>' +
            '<i>Will highlight when ready. Click manually for safety.</i>'
        );

        let attempts = 0;
        const interval = setInterval(function() {
            attempts++;
            if (attempts > 60) { clearInterval(interval); return; }

            const buttons = document.querySelectorAll('button, a[role="button"]');
            for (const btn of buttons) {
                const txt = btn.textContent.trim().toLowerCase();
                if (txt === 'join team' || txt === 'gabung tim' ||
                    txt === 'accept' || txt === 'terima undangan') {
                    clearInterval(interval);
                    btn.style.outline = '3px solid #f38ba8';
                    btn.style.boxShadow = '0 0 20px #f38ba8';
                    setStatus(
                        '<b>Join Team button found!</b><br>' +
                        'Highlighted in pink. Click it manually.<br><br>' +
                        '<i>After joining, go to leonardo.ai</i>'
                    );
                    addButton('Auto-Click Join (3s)', function() {
                        setStatus('<b>Clicking in 3...</b>');
                        setTimeout(function() {
                            btn.click();
                            setStatus('<b>Joined!</b> Now go to leonardo.ai');
                        }, 3000);
                    }, '#f38ba8');
                    return;
                }
            }
        }, 1000);
    }

    // ==================== TEMP MAIL HANDLER ====================

    function handleTempMail() {
        setStatus(
            '<b>Step 2: Temp Mail</b><br>' +
            'Auto-refreshing inbox for Canva verification...<br><br>' +
            '<i>Email will appear in inbox below.</i>'
        );

        // Copy email button
        const emailInput = document.querySelector(
            'input[readonly][value*="@"], input[type="text"][value*="@"]'
        );
        if (emailInput) {
            addButton('Copy Email', function() {
                GM_setClipboard(emailInput.value);
                setStatus('<b>Email copied:</b><br>' + emailInput.value);
            }, '#a6e3a1');
        }

        // Auto-refresh and scan
        let scanAttempts = 0;
        const interval = setInterval(function() {
            scanAttempts++;
            if (scanAttempts > 60) {
                clearInterval(interval);
                setStatus('<b>Timeout</b><br>Check inbox manually.');
                return;
            }

            // Look for refresh button and click
            const refreshBtn = document.querySelector(
                'button[title*="refresh" i], a[title*="refresh" i], ' +
                '[class*="refresh"], [id*="refresh"]'
            );
            if (refreshBtn) refreshBtn.click();

            // Look for emails from Canva
            const emailRows = document.querySelectorAll('a, tr, [class*="mail"], [class*="email-row"]');
            for (const row of emailRows) {
                const txt = row.textContent.toLowerCase();
                if (txt.includes('canva') || txt.includes('verify')) {
                    clearInterval(interval);
                    row.style.outline = '3px solid #f38ba8';
                    setStatus(
                        '<b>Canva email detected!</b><br>' +
                        'Highlighted in pink. Click to open.<br><br>' +
                        '<i>Then click verification link inside.</i>'
                    );
                    return;
                }
            }
        }, 3000);
    }

    // ==================== LEONARDO OAUTH HANDLER ====================

    function handleLeonardo() {
        setStatus(
            '<b>Step 4: Leonardo Login</b><br>' +
            'Scanning for Canva OAuth button...<br><br>' +
            '<i>Will highlight when ready.</i>'
        );

        let attempts = 0;
        const interval = setInterval(function() {
            attempts++;
            if (attempts > 60) { clearInterval(interval); return; }

            const buttons = document.querySelectorAll('button, a');
            for (const btn of buttons) {
                const txt = btn.textContent.trim().toLowerCase();
                if (txt.includes('continue with canva') ||
                    txt.includes('canva') && txt.includes('login') ||
                    txt.includes('canva') && txt.includes('sign in')) {
                    clearInterval(interval);
                    btn.style.outline = '3px solid #f38ba8';
                    btn.style.boxShadow = '0 0 20px #f38ba8';
                    setStatus(
                        '<b>Canva OAuth button found!</b><br>' +
                        'Highlighted in pink. Click it.<br><br>' +
                        '<i>You should land at app.leonardo.ai with 8500 credits.</i>'
                    );
                    addButton('Auto-Click (3s)', function() {
                        setStatus('<b>Clicking in 3...</b>');
                        setTimeout(function() {
                            btn.click();
                        }, 3000);
                    }, '#f38ba8');
                    return;
                }
            }
        }, 1000);

        // Detect successful login (app.leonardo.ai)
        if (window.location.hostname.includes('app.leonardo.ai')) {
            const session = getSession();
            const id = session ? session.identity : null;
            const idStr = id ? id.fullName : 'Unknown';
            setStatus(
                '<b>LOGIN SUCCESS!</b><br>' +
                '8500 credits ready.<br><br>' +
                '<b>Identity:</b> ' + idStr + '<br><br>' +
                '<b>REMINDER:</b> Use credits TODAY (anti-stockpile rule)<br><br>' +
                '<i>Session cleared. Ready for next account.</i>'
            );
            addButton('Clear Session', function() {
                clearSession();
                setStatus('<b>Session cleared.</b><br>Run .bat launcher for new account.');
            }, '#a6e3a1');

            try {
                GM_notification({
                    title: 'Wrong Mecha Helper',
                    text: 'Leonardo login success! 8500 credits ready. USE TODAY.',
                    timeout: 5000
                });
            } catch (e) {}
        }
    }

    // ==================== ROUTER ====================

    function init() {
        const host = window.location.hostname;
        const path = window.location.pathname;
        const url = window.location.href;

        if (host.includes('canva.com')) {
            if (url.includes('brand/join') || url.includes('team-invite')) {
                handleTeamInvite();
            } else if (path.includes('signup') || path.includes('login')) {
                handleCanvaSignup();
            } else {
                setStatus(
                    '<b>Canva detected</b><br>' +
                    'On signup or team-invite page, helper will auto-activate.'
                );
            }
        } else if (host.includes('temporary-email.net')) {
            handleTempMail();
        } else if (host.includes('leonardo.ai')) {
            handleLeonardo();
        }
    }

    // Wait for DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 500);
    }

})();
