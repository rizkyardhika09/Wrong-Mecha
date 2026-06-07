# 🚀 LEONARDO AUTO SIGNUP — Setup Guide

> **What it does:** 1-click Canva account creation + team invite + Leonardo login → 8500 credits ready in ~90 seconds.

---

## ⚙️ INSTALL (one-time, ~5 minutes)

### **1. Install Python 3.10+**
Download: https://www.python.org/downloads/
- ✅ Check "Add Python to PATH" during install

### **2. Install dependencies**
Open Command Prompt / PowerShell in `D:\DIKA\Wrong Universe\Wrong Mecha\`:
```bash
pip install -r requirements.txt
playwright install chromium
```

That's it. Script ready to run.

---

## 🎯 USAGE

### **Single Signup** (default headless mode)
```bash
python auto_signup.py
```
- Browser runs invisible in background
- ~60-90 seconds per signup
- CAPTCHA = popup appears, you solve, script continues

### **Visible Mode** (debug / first test)
```bash
python auto_signup.py --visible
```
- Browser visible — watch the flow
- Recommended for first run to verify everything works

### **Batch Signup** (multiple accounts with cooldown)
```bash
python auto_signup.py --batch 3
```
- Creates 3 accounts with 5-minute cooldown between
- Total time: ~20 minutes for 3 accounts
- All run automatically

### **Visible + Batch**
```bash
python auto_signup.py --batch 3 --visible
```

---

## 📦 WHAT HAPPENS PER SIGNUP

1. **Pick team** with most slots remaining (auto from `team_invites.json`)
2. **Generate random identity** (Faker: random name, DOB, password)
3. **Create temp email** (mail.tm API, free)
4. **Open Canva signup** (Playwright stealth Chrome)
5. **Auto-fill form** (random typing speed, human-like)
6. **Wait for verification email** (polls every 5s, timeout 2 min)
7. **Auto-click verification link**
8. **Open team invite URL** → auto-click "Join Team"
9. **Open Leonardo** → click "Continue with Canva"
10. **Save encrypted credentials** to `leonardo_credentials.enc`
11. **Update tracker** (`leonardo_accounts.json`)
12. **Decrement team slot count** (auto in `team_invites.json`)
13. **Desktop popup**: "✅ Acc XX ready, 8500 credits"

---

## ⚠️ CAPTCHA HANDLING

If Canva shows CAPTCHA mid-signup:
1. **Browser auto-switches to visible** (window pops to front)
2. **Desktop popup** notifies you
3. **You solve CAPTCHA** manually in the browser
4. **Close the popup** → script continues automatically

---

## 🔐 SECURITY

Credentials stored encrypted:
- `leonardo_credentials.enc` — Fernet AES-256 encrypted JSON
- `.leonardo_key` — Encryption key (DO NOT commit to GitHub)

Both files auto-created on first run. Add to `.gitignore`:
```
leonardo_credentials.enc
.leonardo_key
```

---

## 📂 FILES CREATED

| File | Purpose |
|---|---|
| `auto_signup.py` | Main automation script |
| `team_invites.json` | Team invite URLs + slot tracking |
| `leonardo_accounts.json` | Account list (for tracker app) |
| `leonardo_credentials.enc` | Encrypted credentials (auto-created) |
| `.leonardo_key` | Encryption key (auto-created, DO NOT share) |
| `%TEMP%\Leonardo\auto_*` | Browser profile per signup (auto-cleanup OK) |

---

## 🛠️ TROUBLESHOOTING

### **"Playwright not installed"**
```bash
pip install playwright
playwright install chromium
```

### **"No temp mail domains available"**
mail.tm down — try again in few minutes, or replace with different temp mail API.

### **"Verification email timeout"**
- Increase timeout in `auto_signup.py` (default 120s)
- Try different temp mail service
- Check if Canva sent email to spam (rare for temp mail)

### **"Could not find Join Team button"**
Canva might have updated team invite UI. Script will pause + notify for manual click.

### **CAPTCHA appearing every signup**
- Add more cooldown (10+ min)
- Use VPN to rotate IP
- Or accept manual CAPTCHA solving (~30s extra per signup)

### **"Could not auto-join team"**
Manual click required — script will notify + pause for you.

---

## 💡 PRO TIPS

### **Best Time to Run Batch**
- Off-peak hours (late night or early morning)
- Less Canva traffic = lower detection risk

### **Anti-Detection Maximums**
- Default cooldown 5 min between signups
- Random identity per signup (Faker)
- Random viewport size (1366, 1440, 1920)
- Random typing delays (humanlike)
- Stealth plugin masks automation flags

### **Same-Day Credit Rule** (per Notion)
- After signup, USE credits same day
- Don't let fresh accounts sit >24h
- Canva may flag inactive accounts

### **Recommended Daily Flow**
```
Morning:  python auto_signup.py --batch 3
          (Creates 3 fresh accounts in ~20 min)
Daytime:  Generate Leonardo assets (use all 3 × 8500 = 25,500 credits)
Evening:  Edit + upload episode
```

---

## 🔄 INTEGRATION WITH TRACKER

The `leonardo_tracker.py` GUI will be updated with:
- **🚀 AUTO NEW SIGNUP** button — runs `auto_signup.py` in background
- **Live status** — shows progress (Picking team → Signup → Verifying → Joining → Login → Done)
- **Auto-refresh** account list when new signup completes

---

## ⚠️ RISKS & RESPONSIBILITY

This tool automates Canva signup which is a **gray area** in Canva ToS. Risks:
- Account ban (Canva detects pattern)
- Team subscription flagged
- IP rate limiting

**Mitigations built-in:**
- Random identity per signup
- 5-min cooldown
- Stealth browser flags
- Random typing/viewport

**Final responsibility is yours.** This tool is provided as-is for personal content creation use (Wrong Mecha series production).

---

## 📊 EXPECTED SUCCESS RATE

- **First few runs:** ~95% (Canva hasn't pattern-matched yet)
- **After 10+ accounts in 1 IP:** ~70% (CAPTCHA increases)
- **After 50+ accounts in 1 week:** ~50% (may need VPN rotation)

Pace yourself. Quality > quantity.
