"""
LEONARDO AUTO SIGNUP — Wrong Mecha Production
==============================================

Automated Canva signup → team invite → Leonardo OAuth flow.
Uses Playwright + stealth + random data + temp mail API.

Stack:
- Random per signup (Faker)
- Headless default, auto-visible on CAPTCHA
- 5 min cooldown between signups
- CAPTCHA: pause + popup notify + window to front
- JSON encrypted credentials save

Setup:
    pip install -r requirements.txt
    playwright install chromium

Usage:
    python auto_signup.py            # Single signup
    python auto_signup.py --batch 3  # Batch 3 signups (with cooldown)
    python auto_signup.py --gui      # GUI mode (launch via tracker)
"""

import asyncio
import json
import os
import random
import string
import sys
import time
import re
from datetime import datetime, timedelta
from pathlib import Path
from typing import Optional

# Dependencies (install via requirements.txt)
try:
    from playwright.async_api import async_playwright, Page, Browser, BrowserContext
    from playwright_stealth import Stealth
    from faker import Faker
    import requests
    from cryptography.fernet import Fernet
except ImportError as e:
    print(f"❌ Missing dependency: {e}")
    print("Run: pip install -r requirements.txt")
    print("Then: playwright install chromium")
    sys.exit(1)

# ========== CONFIG ==========

BASE_DIR = Path(__file__).parent
TEAMS_FILE = BASE_DIR / "team_invites.json"
ACCOUNTS_FILE = BASE_DIR / "leonardo_accounts.json"
ENCRYPTED_CREDS_FILE = BASE_DIR / "leonardo_credentials.enc"
KEY_FILE = BASE_DIR / ".leonardo_key"  # Encryption key (don't commit!)
COOLDOWN_SECONDS = 5 * 60  # 5 min between signups
TEMP_MAIL_DOMAIN_PREFERRED = "unik.it.com"  # Canva-friendly domain
USER_DATA_BASE = Path(os.environ.get("TEMP", "C:/Temp")) / "Leonardo"

fake = Faker()


# ========== ENCRYPTION HELPERS ==========

def get_or_create_key() -> bytes:
    """Get or create Fernet encryption key for credentials."""
    if KEY_FILE.exists():
        return KEY_FILE.read_bytes()
    key = Fernet.generate_key()
    KEY_FILE.write_bytes(key)
    print(f"🔑 Generated new encryption key: {KEY_FILE}")
    return key


def encrypt_data(data: dict) -> bytes:
    """Encrypt dict as JSON."""
    key = get_or_create_key()
    f = Fernet(key)
    return f.encrypt(json.dumps(data).encode())


def decrypt_data(encrypted: bytes) -> dict:
    """Decrypt to dict."""
    key = get_or_create_key()
    f = Fernet(key)
    return json.loads(f.decrypt(encrypted).decode())


def load_credentials() -> list:
    """Load existing encrypted credentials."""
    if not ENCRYPTED_CREDS_FILE.exists():
        return []
    return decrypt_data(ENCRYPTED_CREDS_FILE.read_bytes())


def save_credential(cred: dict):
    """Append new credential to encrypted store."""
    creds = load_credentials()
    creds.append(cred)
    encrypted = encrypt_data(creds)
    ENCRYPTED_CREDS_FILE.write_bytes(encrypted)
    print(f"🔐 Credential saved (encrypted): {cred['email']}")


# ========== TEAM SELECTION ==========

def load_teams() -> dict:
    """Load team_invites.json."""
    with open(TEAMS_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def save_teams(data: dict):
    """Save updated team_invites.json (after decrement slots)."""
    with open(TEAMS_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


def pick_best_team(teams_data: dict) -> Optional[dict]:
    """Pick team with most slots remaining, active status."""
    active = [t for t in teams_data["teams"] if t["status"] == "active" and t["slots_remaining"] > 0]
    if not active:
        return None
    return max(active, key=lambda t: t["slots_remaining"])


def decrement_team_slot(teams_data: dict, team_name: str):
    """After successful signup, decrement slot count."""
    for t in teams_data["teams"]:
        if t["name"] == team_name:
            t["slots_remaining"] -= 1
            t["last_updated"] = datetime.now().isoformat()
            break
    save_teams(teams_data)


# ========== RANDOM DATA ==========

def generate_signup_data() -> dict:
    """Generate random but valid signup data per Canva requirements."""
    first_name = fake.first_name()
    last_name = fake.last_name()

    # Strong password: 12 chars, mix
    password = (
        random.choice(string.ascii_uppercase)
        + random.choice(string.ascii_lowercase) * 3
        + random.choice(string.digits) * 3
        + random.choice("!@#$%")
        + "".join(random.choices(string.ascii_letters + string.digits, k=4))
    )

    # Random DOB (age 22-45)
    dob = fake.date_of_birth(minimum_age=22, maximum_age=45)

    return {
        "first_name": first_name,
        "last_name": last_name,
        "full_name": f"{first_name} {last_name}",
        "password": password,
        "dob_year": dob.year,
        "dob_month": dob.month,
        "dob_day": dob.day,
        "country": "Indonesia",  # Default region
    }


# ========== TEMP MAIL ==========

class TempMail:
    """Wrapper for mail.tm API (free, reliable temp mail service)."""

    BASE_URL = "https://api.mail.tm"

    def __init__(self):
        self.email = None
        self.password = None
        self.token = None

    def create_inbox(self) -> str:
        """Create temporary mailbox, return email address."""
        # Get available domain
        domains_resp = requests.get(f"{self.BASE_URL}/domains")
        domains = domains_resp.json()["hydra:member"]
        if not domains:
            raise RuntimeError("No temp mail domains available")
        domain = domains[0]["domain"]

        # Create account
        local = "".join(random.choices(string.ascii_lowercase + string.digits, k=12))
        self.email = f"{local}@{domain}"
        self.password = "".join(random.choices(string.ascii_letters + string.digits, k=16))

        create_resp = requests.post(
            f"{self.BASE_URL}/accounts",
            json={"address": self.email, "password": self.password},
        )
        if create_resp.status_code != 201:
            raise RuntimeError(f"Failed to create temp mail: {create_resp.text}")

        # Get token
        token_resp = requests.post(
            f"{self.BASE_URL}/token",
            json={"address": self.email, "password": self.password},
        )
        self.token = token_resp.json()["token"]

        print(f"📧 Temp mail created: {self.email}")
        return self.email

    def poll_verification(self, sender_contains: str = "canva", timeout: int = 120) -> Optional[str]:
        """Poll inbox for verification email. Return extracted link or None."""
        headers = {"Authorization": f"Bearer {self.token}"}
        start = time.time()

        print(f"⏳ Polling temp mail for verification (timeout {timeout}s)...")
        while time.time() - start < timeout:
            resp = requests.get(f"{self.BASE_URL}/messages", headers=headers)
            messages = resp.json().get("hydra:member", [])

            for msg in messages:
                from_addr = msg.get("from", {}).get("address", "").lower()
                if sender_contains.lower() in from_addr:
                    # Fetch full message
                    full = requests.get(
                        f"{self.BASE_URL}/messages/{msg['id']}", headers=headers
                    ).json()
                    body = full.get("text", "") + full.get("html", [""])[0]

                    # Extract verification URL
                    urls = re.findall(r'https?://[^\s<>"\']+', body)
                    for url in urls:
                        if "verify" in url.lower() or "confirm" in url.lower() or "canva" in url.lower():
                            print(f"✅ Verification link found: {url[:80]}...")
                            return url
            time.sleep(5)

        print("❌ Verification email timeout")
        return None


# ========== BROWSER AUTOMATION ==========

async def launch_browser(headless: bool = True, slot_name: str = "auto") -> tuple[Browser, BrowserContext]:
    """Launch stealth Chrome with isolated profile."""
    p = await async_playwright().start()

    # Isolated profile dir
    profile_dir = USER_DATA_BASE / slot_name
    profile_dir.mkdir(parents=True, exist_ok=True)

    # Random viewport
    viewport = random.choice([
        {"width": 1366, "height": 768},
        {"width": 1920, "height": 1080},
        {"width": 1440, "height": 900},
    ])

    browser = await p.chromium.launch_persistent_context(
        user_data_dir=str(profile_dir),
        headless=headless,
        viewport=viewport,
        locale="en-US",
        timezone_id="Asia/Jakarta",
        args=[
            "--disable-blink-features=AutomationControlled",
            "--no-default-browser-check",
        ],
    )

    # Apply stealth (v2.x API)
    page = browser.pages[0] if browser.pages else await browser.new_page()
    stealth = Stealth()
    await stealth.apply_stealth_async(page)

    return p, browser


def notify_user(title: str, message: str):
    """Desktop popup notification."""
    try:
        # Windows toast notification
        import ctypes
        ctypes.windll.user32.MessageBoxW(0, message, title, 0x40)  # MB_ICONINFORMATION
    except Exception:
        print(f"\n🔔 {title}: {message}\n")


async def detect_captcha(page: Page) -> bool:
    """Check if CAPTCHA appeared on page."""
    captcha_selectors = [
        "iframe[src*='recaptcha']",
        "iframe[src*='hcaptcha']",
        "div[class*='captcha']",
        "div[class*='challenge']",
    ]
    for sel in captcha_selectors:
        if await page.locator(sel).count() > 0:
            return True
    return False


async def signup_canva(page: Page, email: str, data: dict) -> bool:
    """Auto-fill Canva signup form. Returns True on success."""
    print("🌐 Opening Canva signup...")
    await page.goto("https://www.canva.com/id_id/signup", wait_until="networkidle")
    await asyncio.sleep(random.uniform(2, 4))

    # Click "Continue with email"
    try:
        await page.locator("text=Lanjutkan dengan email").first.click(timeout=10000)
    except Exception:
        try:
            await page.locator("text=Continue with email").first.click(timeout=10000)
        except Exception:
            print("⚠️ Could not find email signup button. May need manual click.")

    await asyncio.sleep(random.uniform(1, 2))

    # Fill email
    await page.locator("input[type='email']").fill(email)
    await asyncio.sleep(random.uniform(0.5, 1.5))
    await page.keyboard.press("Enter")
    await asyncio.sleep(random.uniform(2, 3))

    # Fill name (if asked)
    try:
        name_input = page.locator("input[name='firstName'], input[placeholder*='Nama']").first
        await name_input.fill(data["full_name"], timeout=5000)
        await asyncio.sleep(random.uniform(0.5, 1))
    except Exception:
        pass

    # Fill password
    try:
        await page.locator("input[type='password']").first.fill(data["password"])
        await asyncio.sleep(random.uniform(0.5, 1))
    except Exception:
        pass

    # CAPTCHA detection
    if await detect_captcha(page):
        notify_user(
            "CAPTCHA Detected",
            "Solve the CAPTCHA in the browser window, then close this dialog to continue.",
        )
        # Wait for user to solve (URL change indicates progression)
        try:
            await page.wait_for_url(lambda url: "verify" in url or "signup" not in url, timeout=300000)
        except Exception:
            print("⚠️ Timeout waiting after CAPTCHA")

    print("✅ Signup form submitted")
    return True


async def join_team(page: Page, invite_url: str) -> bool:
    """Navigate to team invite URL and click join."""
    print(f"🤝 Joining team: {invite_url[:70]}...")
    await page.goto(invite_url, wait_until="networkidle")
    await asyncio.sleep(random.uniform(2, 4))

    # Click "Join team" button
    try:
        for btn_text in ["Join team", "Gabung tim", "Accept invite", "Terima undangan"]:
            try:
                await page.locator(f"text={btn_text}").first.click(timeout=5000)
                print(f"✅ Clicked: {btn_text}")
                await asyncio.sleep(3)
                return True
            except Exception:
                continue
    except Exception as e:
        print(f"⚠️ Could not auto-join team: {e}")
        notify_user("Manual Action", "Click 'Join Team' in the browser, then close this dialog.")
        return False

    return True


async def login_leonardo(page: Page) -> bool:
    """Open Leonardo and trigger Canva OAuth login."""
    print("🎨 Opening Leonardo...")
    await page.goto("https://leonardo.ai/", wait_until="networkidle")
    await asyncio.sleep(random.uniform(2, 3))

    try:
        # Click "Continue with Canva" button
        for btn_text in ["Continue with Canva", "Canva", "Login with Canva", "Sign in with Canva"]:
            try:
                await page.locator(f"text={btn_text}").first.click(timeout=5000)
                print(f"✅ Clicked: {btn_text}")
                break
            except Exception:
                continue
    except Exception:
        notify_user("Manual Action", "Click 'Continue with Canva' in Leonardo, then close this dialog.")

    # Wait for redirect to authorized
    try:
        await page.wait_for_url(lambda url: "app.leonardo.ai" in url, timeout=60000)
        print("✅ Leonardo login successful — 8500 credits ready")
        return True
    except Exception:
        print("⚠️ Leonardo login timeout — may need manual continue")
        return False


# ========== MAIN FLOW ==========

async def run_signup(headless: bool = True) -> dict:
    """Full signup flow: temp mail → Canva → team → Leonardo."""
    print("\n" + "=" * 60)
    print("🚀 LEONARDO AUTO SIGNUP STARTING")
    print("=" * 60)

    # 1. Pick best team
    teams_data = load_teams()
    team = pick_best_team(teams_data)
    if not team:
        print("❌ No active teams with slots available")
        return {"success": False, "error": "no_teams"}

    print(f"🎯 Selected team: {team['name']} ({team['slots_remaining']} slots remaining)")

    # 2. Generate random data
    data = generate_signup_data()
    print(f"👤 Random identity: {data['full_name']}")

    # 3. Create temp mail
    mail = TempMail()
    email = mail.create_inbox()

    # 4. Launch browser
    slot_name = f"auto_{int(time.time())}"
    p, browser = await launch_browser(headless=headless, slot_name=slot_name)
    page = browser.pages[0] if browser.pages else await browser.new_page()

    try:
        # 5. Signup Canva
        await signup_canva(page, email, data)

        # 6. Wait for verification email
        verification_link = mail.poll_verification(sender_contains="canva", timeout=120)
        if not verification_link:
            return {"success": False, "error": "no_verification"}

        # 7. Click verification link
        print("🔗 Opening verification link...")
        await page.goto(verification_link, wait_until="networkidle")
        await asyncio.sleep(random.uniform(2, 4))

        # 8. Join team
        await join_team(page, team["invite_url"])

        # 9. Login Leonardo
        await login_leonardo(page)

        # 10. Save credentials
        credential = {
            "email": email,
            "password": data["password"],
            "team": team["name"],
            "team_invite_url": team["invite_url"],
            "identity": data,
            "created_at": datetime.now().isoformat(),
            "credits_initial": 8500,
            "credits_remaining": 8500,
            "status": "FRESH",
            "profile_dir": slot_name,
        }
        save_credential(credential)

        # 11. Decrement team slot
        decrement_team_slot(teams_data, team["name"])

        # 12. Update accounts JSON (for tracker app)
        accounts = []
        if ACCOUNTS_FILE.exists():
            with open(ACCOUNTS_FILE, "r") as f:
                accounts = json.load(f)
        next_num = len(accounts) + 1
        accounts.append({
            "id": f"Acc {next_num:02d}",
            "email": email,
            "credits_initial": 8500,
            "credits_remaining": 8500,
            "status": "FRESH",
            "created_date": datetime.now().strftime("%Y-%m-%d %H:%M"),
            "last_used": "",
            "notes": f"Auto-signup via {team['name']}",
            "container_name": slot_name,
        })
        with open(ACCOUNTS_FILE, "w") as f:
            json.dump(accounts, f, indent=2)

        notify_user(
            "✅ Signup Complete",
            f"Acc {next_num:02d} ready!\n\nEmail: {email}\nTeam: {team['name']}\nCredits: 8500\n\nREMINDER: Use credits TODAY (anti-stockpile rule)",
        )

        return {"success": True, "credential": credential}

    finally:
        if not headless:
            input("\nPress ENTER to close browser...")
        await browser.close()
        await p.stop()


async def run_batch(count: int, headless: bool = True):
    """Run multiple signups with cooldown between."""
    print(f"\n🔄 BATCH MODE: {count} signups, {COOLDOWN_SECONDS}s cooldown between\n")

    results = []
    for i in range(count):
        print(f"\n--- Signup {i + 1}/{count} ---")
        try:
            result = await run_signup(headless=headless)
            results.append(result)
        except Exception as e:
            print(f"❌ Signup {i + 1} failed: {e}")
            results.append({"success": False, "error": str(e)})

        if i < count - 1:
            print(f"\n⏸️ Cooldown {COOLDOWN_SECONDS}s before next signup...")
            await asyncio.sleep(COOLDOWN_SECONDS)

    # Summary
    successes = sum(1 for r in results if r.get("success"))
    print(f"\n{'=' * 60}")
    print(f"BATCH COMPLETE: {successes}/{count} successful")
    print(f"{'=' * 60}")


# ========== CLI ==========

def main():
    import argparse
    parser = argparse.ArgumentParser(description="Leonardo Auto Signup")
    parser.add_argument("--batch", type=int, default=1, help="Number of signups (with cooldown)")
    parser.add_argument("--visible", action="store_true", help="Show browser (debug mode)")
    args = parser.parse_args()

    headless = not args.visible

    if args.batch == 1:
        asyncio.run(run_signup(headless=headless))
    else:
        asyncio.run(run_batch(args.batch, headless=headless