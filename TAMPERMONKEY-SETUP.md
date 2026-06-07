# Wrong Mecha — TamperMonkey Setup Guide

> **Tool:** `wrong-mecha-leonardo.user.js`
> **Purpose:** Auto-fill Canva signup + auto-detect verification email + auto-highlight Join Team / Leonardo OAuth buttons
> **Safety:** Looks like real user (DOM events) — no browser automation flags
> **Setup time:** 10 minutes one-time
> **Lifetime tool:** Yes

---

## Why TamperMonkey?

This approach replaces the failed Playwright Python automation. Benefits:

- No Python install hassle (zero dependency issues)
- Works in Chrome, Firefox, Edge, Brave — any browser
- Looks 100% human (no headless browser detection)
- One-time setup, lifetime use
- Easy to update via TamperMonkey editor

---

## STEP 1: Install TamperMonkey Extension

### For Chrome / Brave / Edge:
1. Open: https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo
2. Click "Add to Chrome" / "Add to Brave"
3. Accept permissions

### For Firefox:
1. Open: https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/
2. Click "Add to Firefox"
3. Accept permissions

**Verify:** TamperMonkey icon appears in browser toolbar (puzzle piece icon if hidden — pin it).

---

## STEP 2: Install the Userscript

1. Click TamperMonkey icon in toolbar
2. Click "Create a new script..."
3. **Delete all default code** in editor
4. Open `wrong-mecha-leonardo.user.js` from your Wrong Mecha folder (any text editor)
5. **Copy ALL content** (Ctrl+A, Ctrl+C)
6. Paste into TamperMonkey editor (Ctrl+V)
7. **Save** (Ctrl+S) or File → Save

**Verify:**
- Click TamperMonkey icon → Dashboard
- See "Wrong Mecha - Leonardo Workflow Helper" listed
- Toggle ON (green)

---

## STEP 3: Test on Canva Signup

1. Open `leonardo-acc-01.bat` (or any slot launcher) — opens 4 tabs
2. Go to Canva tab → click "Continue with email"
3. **Helper overlay appears** in top-right corner with:
   - Random generated name
   - Random generated password
   - "Copy Password" button
   - "Copy Full Name" button
   - "New Identity" button

4. **Workflow:**
   - Switch to Temp Mail tab → email auto-detected, click "Copy Email"
   - Switch to Canva → paste email
   - Click "Continue" manually (safety for CAPTCHA)
   - When name/password fields appear, helper auto-fills them
   - You only click "Submit" / "Continue" buttons

---

## STEP 4: Test Full Flow

Per account:

1. **Launcher:** Double-click `leonardo-acc-01.bat`
2. **Tab 2 (TempMail):** Click "Copy Email" button in helper overlay
3. **Tab 1 (Canva):** Paste email → Continue → fields auto-fill → Submit
4. **Wait for verification email** in TempMail tab (helper auto-refreshes, highlights when arrived)
5. **Click verification link** in email
6. **Tab 4 (Notion):** Copy a Canva team invite URL with highest slots
7. **New tab:** Paste team invite URL → helper highlights "Join Team" → click it
8. **Tab 3 (Leonardo):** helper highlights "Continue with Canva" → click it
9. **Success!** 8500 credits ready. Helper shows "REMINDER: Use credits TODAY"

**Total time:** ~2-3 minutes per account (vs 5-10 min fully manual).

---

## How the Helper Works (Per Site)

### Canva Signup (`canva.com/.../signup`)
- Auto-generates random identity (US-style first/last name)
- Auto-generates secure password
- Displays in floating overlay
- Auto-fills name + password fields when they appear (React-aware)
- You handle email field manually (need to paste from temp mail)
- You click Submit manually (CAPTCHA safety)

### Canva Team Invite (`canva.com/brand/join?token=...`)
- Scans page for "Join Team" button (English + Indonesian)
- Highlights button with pink outline + glow
- Offers "Auto-Click (3s countdown)" button if you want hands-off
- Default: you click manually for safety

### Temp Mail (`temporary-email.net`)
- Auto-clicks Refresh button every 3 seconds
- Scans inbox for emails containing "canva" or "verify"
- Highlights matching email with pink outline
- "Copy Email" button to grab the temp email address

### Leonardo (`leonardo.ai`)
- Scans for "Continue with Canva" button
- Highlights when found
- Offers Auto-Click after 3s
- Detects successful login at `app.leonardo.ai`
- Notifies "8500 credits ready"
- Reminds about same-day-usage rule

---

## Updating the Script

If Canva/Leonardo changes their UI:

1. Click TamperMonkey icon → Dashboard
2. Click "Wrong Mecha - Leonardo Workflow Helper"
3. Edit the relevant section (look for `handleCanvaSignup()`, etc.)
4. Save (Ctrl+S)

Or replace entirely:
1. Open updated `wrong-mecha-leonardo.user.js`
2. Copy all content
3. Paste over old script in TamperMonkey editor
4. Save

---

## Troubleshooting

### Helper overlay doesn't appear
- Check TamperMonkey icon — script enabled?
- Refresh page (F5)
- Check browser console (F12) for errors

### Name/password not auto-filling
- Canva may have updated their form selectors
- Open helper overlay → manually click "Copy Password" → paste manually
- Update script (see Updating section)

### "Join Team" button not detected
- Page may not have loaded yet — wait 5 seconds
- Try refreshing page (F5)
- Click button manually — helper will catch on next visit

### Temp mail not auto-refreshing
- Check if `temporary-email.net` is the URL (script matches this domain)
- Some temp mail services have different selectors — switch to `@unik.it.com` domain

### Want to disable helper temporarily
- Click TamperMonkey icon → toggle the script OFF (gray)
- Refresh page

---

## Privacy & Security

- Script runs **only on these domains:**
  - `canva.com` and subdomains
  - `temporary-email.net`
  - `leonardo.ai` and `app.leonardo.ai`
- Stores generated identity in TamperMonkey's local storage (not synced to cloud)
- No data sent anywhere external
- Open source — read the .js file to verify

---

## Tips

### Speed Run Tips
- Pin all 4 tabs to specific positions for muscle memory
- Use Bitwarden alongside for credentials saving
- Keep a Notes file open with team invite URLs (or use Notion tab)

### Anti-Detection Tips (built-in)
- 100% real DOM events (no Playwright signature)
- Uses native React value setter for inputs
- Helper UI is visible (no headless flags)
- You handle CAPTCHA + Submit manually (most human-like)

### Productivity Tips
- Generate 3-5 accounts in batch (1 hour)
- Use credits same day (anti-stockpile rule per Notion)
- Track in `leonardo_accounts.json` or tracker app
- After credits exhausted, run `leonardo-reset-all.bat` to recycle slots

---

## Integration with Existing Tools

| Tool | Role |
|---|---|
| `leonardo-acc-XX.bat` | Spawn isolated Chrome window with 4 tabs |
| TamperMonkey + this script | Auto-fill forms + highlight buttons |
| Bitwarden | Save credentials for re-login later |
| `team_invites.json` | Track which team has most slots |
| `leonardo_tracker.py` (basic) | Manual credit tracking |

Workflow:
```
.bat launcher → opens browser/tabs
   ↓
TamperMonkey activates per tab
   ↓
You navigate + click strategic buttons
   ↓
Credits ready → save creds in Bitwarden
   ↓
Generate Leonardo assets today
```

---

## What This Replaces

- Failed Playwright Python script (corrupted multiple times)
- Manual form filling
- Manual button hunting in busy UIs
- Manual email refresh polling

---

## Next Steps After Setup

1. Generate 3 fresh accounts as test batch
2. Each account: download 2-3 Leonardo video clips for EP 5 scenes
3. Save assets to `D:\DIKA\Wrong Universe\Wrong Mecha\Assets\`
4. Update tracker with credit usage

---

## Honest Limitations

- Still requires you to navigate between tabs (not 100% hands-off)
- CAPTCHA solving stays manual (safety)
- If Canva does deep account verification (phone, etc.), script can't help
- Script needs occasional updates when sites change UI

For most cases, this saves 60-70% of manual signup time while staying safe.

---

## Lifetime Value

This script is yours to keep, modify, share. No subscription. No vendor lock. No automation framework brittleness.

Setup once, use forever for Wrong Mecha production and any future projects.
