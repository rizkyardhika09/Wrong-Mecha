# 🔧 LEONARDO AI WORKFLOW — Multi-Account via Firefox Containers

> **Owner:** Rizky Ardhika
> **Channel:** Wrong Universe
> **Project:** Wrong Mecha anime series production
> **Workflow basis:** Canva Pro Team subscription (paid) — multiple Canva accounts as team members → each gets 8500 Leonardo AI credits

---

## 📋 OVERVIEW

**Problem:** 8500 credits per account = only ~2-3 Leonardo Motion video clips (15s each). EP needs ~12-13 clips × ~2 retries = ~10-12 accounts per episode.

**Solution:** Pool of accounts cycling through 3 active slots, managed via Firefox Multi-Account Containers (each tab = isolated cookies/session).

---

## 🛠️ TECH STACK

| Tool | Purpose | Cost |
|---|---|---|
| **Firefox** | Browser base | Free |
| **Multi-Account Containers** | Tab isolation per account | Free (Mozilla extension) |
| **Bitwarden** | Credentials vault | Free |
| **Temp Email** (temporary-email.net) | Disposable email for Canva signup | Free |
| **leonardo_tracker.py** | Account status + credits tracking | Free (this repo) |

---

## ⚙️ SETUP STEPS

### **1. Install Firefox**
- Download from `firefox.com`
- Skip onboarding

### **2. Install Multi-Account Containers Extension**
- URL: `https://addons.mozilla.org/en-US/firefox/addon/multi-account-containers/`
- Click "Add to Firefox" → confirm

### **3. Create Containers (start with 5, scale up later)**
- Click container icon in toolbar → "Manage Containers"
- Create:
  - **Acc 01** — Red 🔴
  - **Acc 02** — Blue 🔵
  - **Acc 03** — Green 🟢
  - **Acc 04** — Yellow 🟡
  - **Acc 05** — Purple 🟣
- Naming uses leading zero (`01` not `1`) for sort order when scaling to 10+

### **4. Setup Bookmark Folders per Container**

Per container, save 4 workflow URLs:
1. `https://www.canva.com/id_id/login/?redirect=%2Fuser-profile` — Canva signup/login
2. `https://temporary-email.net/en` — Disposable email
3. `https://leonardo.ai/` — Leonardo AI generation
4. `https://notion.so/cepat-digital/Akses-Tool-Box-Affiliate-Generator-2f3cb7f73bfb80028a2dc2019c7576fc` — Tutorial reference

Folder naming: `Leonardo Acc 01`, `Leonardo Acc 02`, etc.

**Auto-map each bookmark to its container:**
- Click bookmark → page loads → click Multi-Account Containers icon → "Always Open This Site in..." → pick the right container.
- Now clicking that bookmark always opens in its assigned container.

**Pro tip:** Drag bookmark folders to Bookmarks Toolbar → right-click folder → "Open All in Tabs" = 1-click launch.

### **5. Install Bitwarden**
- Firefox addon: `https://addons.mozilla.org/en-US/firefox/addon/bitwarden-password-manager/`
- Save each Canva account credentials with tag `leonardo-acc-XX`
- Save each Leonardo login same way

### **6. Setup Python Tracker (Optional but Recommended)**
- File: `leonardo_tracker.py` (in this repo)
- Requirements: Python 3.7+, Firefox installed
- Run: `python leonardo_tracker.py`
- Features:
  - Track all accounts with credits, status, last used
  - One-click launch Firefox workflow URLs per account
  - Auto-mark status changes
  - Saves state to `leonardo_accounts.json`

---

## 🔄 PRODUCTION WORKFLOW

### **Account Creation (Batch Pre-Create)**

Before starting EP production, batch-create accounts:

1. Open Firefox, long-press `+` tab → pick **Acc 01** container
2. Open bookmark folder `Leonardo Acc 01` → "Open All in Tabs"
3. Three tabs open in red container: Canva + TempMail + Leonardo
4. **Step-by-step per account:**
   - Tab 2 (TempMail): copy email (must end with `@unik.it.com` — see Working Domains below)
   - Tab 1 (Canva): sign up with that email
   - Wait verification email in Tab 2 → click verification link
   - In Canva: accept team invite to your Canva Pro Team (sent from primary account)
   - Tab 3 (Leonardo): login with Canva
   - Verify 8500 credits showing
5. Save credentials in Bitwarden with tag `leonardo-acc-01`
6. Mark in tracker: Acc 01 = FRESH, 8500 credits

Repeat for Acc 02, 03, ... 05 (or however many).

**Batch time:** ~1.5 hours for 10 accounts. Do all at once during low-energy session.

### **Production Use (Per Generation Session)**

1. Open tracker (`python leonardo_tracker.py`)
2. Click FRESH account → "Open Workflow" → Firefox tabs auto-open
3. Generate in Leonardo
4. After generation, update credits remaining in tracker
5. When credits low (<2000), mark account USED
6. Switch to next FRESH account

**Parallel work:** Can have 3 active accounts at once (3 sets of tabs in Firefox windows).

---

## 📧 WORKING TEMP MAIL DOMAINS

Canva blocks many temp mail domains. Confirmed working:

✅ **`@unik.it.com`** — temporary-email.net (default)
⏳ Test these (update list as confirmed):
- `@tempmail.la` — TBD
- `@mail.tm` — TBD (probably blocked)
- `@guerrillamail.com` — TBD

**Strategy:** Refresh tempmail page until you get `@unik.it.com` domain (it rotates).

---

## ⚠️ RISKS & MITIGATION

| Risk | Mitigation |
|---|---|
| Canva detects multi-account fingerprint | Different containers = different cookies (helps). Add browser fingerprint variance via privacy.resistFingerprinting in `about:config` (optional) |
| Same IP triggers flag | Space signups (don't batch 10 in 5 min). Use VPN/proxy if scaling beyond ~10 accounts |
| Temp mail domain blocked | Keep list of working domains, refresh until working domain appears |
| Account ban | Worst case: lose that one account's credits. Easy recovery (create new) |

**ToS note:** This workflow is gray area in Canva ToS (interpretation of "team member"). Personal use for content creation (not commercial fraud) — low enforcement risk historically.

---

## 🚀 TIPS & TRICKS

### **Speed tips:**
- Pin bookmark folders to Bookmarks Toolbar = 1-click launch
- Bitwarden auto-fill = skip typing credentials
- Pre-batch 10-15 accounts at once = no production interrupts

### **Tracking tips:**
- Use `leonardo_tracker.py` consistently — saves time vs spreadsheet
- Update credits AFTER each generation (habit)
- Notes field: log what you generated for that account (e.g., "EP 5 Scene 1-3")

### **Scale tips:**
- Start with 5 containers, scale to 10/15 as needed
- Color repeat OK (only 8 colors), distinct icons more important
- Numbering keeps it organized: Acc 01, 02, ... 99

---

## 📁 FILES IN THIS REPO

| File | Purpose |
|---|---|
| `leonardo_tracker.py` | Python tracker app (Tkinter GUI) |
| `leonardo_accounts.json` | Auto-generated state file (DO NOT commit credentials) |
| `LEONARDO-WORKFLOW.md` | This file |

---

## 🔄 SESSION CONTINUITY

**For Claude AI next session:**
- This file is the source of truth for Leonardo workflow
- Grep "Leonardo" or "Firefox Container" before discussing — already documented
- User's setup: 5 containers (Acc 01-05), Bitwarden, Python tracker
- Working temp mail: `@unik.it.com`
- Production for Wrong Mecha anime series

**Update this file when:**
- Working temp mail domains list changes
- New containers added
- Workflow optimizations discovered
- Tracker app feature additions
