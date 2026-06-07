# Leonardo Bot — Setup & Usage

> **What:** Standalone Node.js bot. One-click full automation: Canva signup → team join → Leonardo login → 8500 credits ready.
> **Stack:** Node.js + Playwright + mail.tm + custom stealth
> **Reliability target:** 80-90% first run, 95%+ after iteration

---

## ONE-TIME INSTALL (5 minutes)

### Step 1: Install Node.js

1. Download Node.js 20 LTS from https://nodejs.org/en/download
2. Run installer. **Important:** check "Add to PATH" during install.
3. Verify install — open NEW Command Prompt, type:
   ```
   node --version
   ```
   Should show `v20.x.x` or higher.

### Step 2: Run install.bat

Double-click `install.bat` in this folder.

It will:
1. Run `npm install` (downloads Playwright)
2. Run `npx playwright install chromium` (downloads Chromium browser ~170MB)

Wait until you see "INSTALL COMPLETE".

---

## DAILY USAGE

### Single Signup (visible browser, recommended first run)

Double-click `start.bat`

What happens:
1. Bot picks team with most slots remaining (auto)
2. Generates random identity (random name + secure password)
3. Creates temp email via mail.tm API
4. Opens stealth Chromium browser
5. Fills Canva signup form → submits
6. Polls mail.tm API for verification email
7. Auto-clicks verification link
8. Auto-navigates to team invite URL
9. Auto-clicks Join Team
10. Auto-navigates to Leonardo
11. Auto-clicks Continue with Canva
12. Saves credentials encrypted in `data/credentials.enc`
13. Browser stays open — you generate Leonardo assets

**Total time:** ~60-90 seconds (no CAPTCHA) or ~3-5 min (with CAPTCHA)

### Batch Mode (3 signups, 5-min cooldown between)

Double-click `start-batch-3.bat`

For more signups, edit the file and change `--batch 3` to your number.

---

## CAPTCHA HANDLING

If Canva shows CAPTCHA:
1. Bot detects it
2. Console shows: "CAPTCHA detected. Solve manually in browser."
3. You solve CAPTCHA in the browser window
4. Bot resumes automatically when CAPTCHA gone

If CAPTCHA persists for 5+ minutes, bot gives up and logs error.

---

## CREDENTIALS STORAGE

All credentials saved encrypted in `data/credentials.enc`.
Encryption key in `data/.key` (auto-generated).

**Important:**
- Do NOT delete `data/.key` — you lose access to saved credentials
- Back up `data/` folder if you want long-term retention
- Add `data/` to .gitignore — do NOT commit

To view credentials: open `data/credentials.enc` — see encrypted blob. Decrypt with the bot's storage module.

---

## TEAM SLOT TRACKING

File `team-usage.json` tracks how many accounts each team has consumed.

After each successful signup, slot count decrements.

When a team reaches 0 slots, bot auto-skips to next team.

Total pool starts at 604 slots (across 9 teams).

---

## TROUBLESHOOTING

### "Node is not recognized"
Node.js install failed or PATH not set. Reinstall Node.js with PATH option enabled. Restart Command Prompt.

### "npm install" fails
Check internet connection. Try: `npm install --verbose` to see error detail.

### "Playwright install" fails
Run manually: `npx playwright install chromium --force`

### "No temp mail domains available"
mail.tm API down. Wait 5 minutes and retry. Or use a different temp mail service (edit `src/mailtm.js`).

### "No verification email received"
- Canva may have flagged the temp mail domain
- Try increasing timeout in `src/main.js` (default 120000ms)
- Or try different temp mail provider

### "Canva form fields not found"
Canva updated their HTML. Update selectors in `src/flow.js`.

### "Bot stuck on team join"
Team URL may be invalid or expired. Check `src/teams.js` for current URLs.

### "Leonardo login timeout"
Canva account may not have been added to team yet. Wait 30 seconds and re-run.

---

## ADVANCED

### Run headless (background, faster)

Edit `start.bat`:
```
node src/main.js --headless
```

WARNING: Headless mode = no visual = can't solve CAPTCHA. Use only when confident no CAPTCHA.

### Adjust batch cooldown

```
node src/main.js --batch 5 --cooldown 600
```

5 signups with 10-min (600s) cooldown between.

### Update team URLs

Edit `src/teams.js`, modify the `TEAM_INVITES` array.

### Reset team usage tracking

Delete `team-usage.json`. Will recreate with initial slots on next run.

---

## REALISTIC EXPECTATIONS

### First Run (1-3 attempts)
- Success rate: 60-80%
- Common failures: CAPTCHA, slow temp mail, Canva UI mismatch

### After Iteration (you report failures, I fix selectors)
- Success rate: 85-95%
- Failures mostly CAPTCHA-triggered (manual solve)

### Long-term Maintenance
- Canva updates UI ~monthly → may need selector updates in `src/flow.js`
- mail.tm domain blocking → switch domains
- IP rate limiting → space signups (cooldown 5+ min) or use VPN

---

## ARCHITECTURE

```
leonardo-bot/
├── package.json           Dependencies
├── install.bat            One-time install script
├── start.bat              Single signup launcher
├── start-batch-3.bat      Batch mode launcher
├── SETUP.md               This file
├── team-usage.json        Auto-generated team slot tracker
├── src/
│   ├── main.js            CLI entry + orchestration
│   ├── flow.js            Canva signup + team join + Leonardo flow
│   ├── teams.js           Team URLs + smart selector
│   ├── identity.js        Random name/password generator
│   ├── mailtm.js          mail.tm API client
│   ├── stealth.js         Bot detection evasion
│   └── storage.js         Encrypted credentials
└── data/                  Auto-created
    ├── credentials.enc    Encrypted credentials
    └── .key               Encryption key (DO NOT SHARE)
```

---

## ANTI-DETECTION FEATURES

- Random viewport (5 common sizes)
- Random user agent (Chrome 120-124)
- Locale: en-US, timezone: Asia/Jakarta
- WebDriver flag hidden
- Plugins mocked (3 default Chrome plugins)
- Permissions query mocked
- Languages mocked (en-US, en)
- Chrome runtime mocked
- HeadlessChrome console filter
- Human-like delays (100-500ms between actions)
- Human-like typing speed (50-150ms per character)

---

## LIMITATIONS

- Cannot solve CAPTCHA automatically (manual fallback)
- Cannot bypass IP rate limiting (use cooldown / VPN)
- Cannot work if Canva requires phone verification (rare)
- Cannot work if mail.tm completely blocked by Canva (switch provider)

---

## SUPPORT

If bot fails consistently:
1. Run with visible browser (`start.bat`)
2. Note which step fails
3. Take screenshot of error
4. Report — selectors can be updated

The bot is yours. Modify freely.
