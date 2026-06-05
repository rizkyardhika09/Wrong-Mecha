"""
LEONARDO ACCOUNT TRACKER
Wrong Mecha Production Tool
========================

Track multiple Leonardo AI accounts (via Canva Pro Team workflow).
- List accounts with status & credits remaining
- One-click open Firefox with workflow URLs
- Save state to local JSON
- Notes per account

Usage:
    python leonardo_tracker.py

Requirements:
    - Python 3.7+
    - Firefox installed
    - Firefox Multi-Account Containers extension setup with bookmarks
"""

import tkinter as tk
from tkinter import ttk, messagebox, simpledialog
import json
import os
import subprocess
from datetime import datetime
from pathlib import Path

# Config
DATA_FILE = Path(__file__).parent / "leonardo_accounts.json"
WORKFLOW_URLS = [
    "https://www.canva.com/id_id/login/?redirect=%2Fuser-profile",
    "https://temporary-email.net/en",
    "https://leonardo.ai/",
    "https://notion.so/cepat-digital/Akses-Tool-Box-Affiliate-Generator-2f3cb7f73bfb80028a2dc2019c7576fc",
]

# Firefox paths (auto-detect common locations)
FIREFOX_PATHS = [
    r"C:\Program Files\Mozilla Firefox\firefox.exe",
    r"C:\Program Files (x86)\Mozilla Firefox\firefox.exe",
    "/Applications/Firefox.app/Contents/MacOS/firefox",
    "/usr/bin/firefox",
]


def find_firefox():
    """Auto-detect Firefox executable path."""
    for path in FIREFOX_PATHS:
        if os.path.exists(path):
            return path
    return None


# Default account template
def new_account_data(num):
    return {
        "id": f"Acc {num:02d}",
        "email": "",
        "credits_initial": 8500,
        "credits_remaining": 8500,
        "status": "FRESH",  # FRESH / ACTIVE / USED / EXPIRED
        "created_date": "",
        "last_used": "",
        "notes": "",
        "container_name": f"Acc {num:02d}",  # Firefox container name
    }


class LeonardoTracker:
    def __init__(self, root):
        self.root = root
        self.root.title("Leonardo Account Tracker — Wrong Mecha Production")
        self.root.geometry("1100x650")
        self.root.configure(bg="#1e1e2e")

        self.firefox_path = find_firefox()
        self.accounts = self.load_accounts()

        self.setup_ui()
        self.refresh_list()

    def load_accounts(self):
        """Load accounts from JSON file."""
        if DATA_FILE.exists():
            try:
                with open(DATA_FILE, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception as e:
                print(f"Error loading data: {e}")
        # Initialize with 5 default accounts
        return [new_account_data(i) for i in range(1, 6)]

    def save_accounts(self):
        """Save accounts to JSON file."""
        try:
            with open(DATA_FILE, "w", encoding="utf-8") as f:
                json.dump(self.accounts, f, indent=2, ensure_ascii=False)
        except Exception as e:
            messagebox.showerror("Save Error", f"Failed to save: {e}")

    def setup_ui(self):
        """Build the UI."""
        # Top frame: title + buttons
        top_frame = tk.Frame(self.root, bg="#1e1e2e")
        top_frame.pack(fill="x", padx=10, pady=10)

        tk.Label(
            top_frame,
            text="🔧 LEONARDO ACCOUNT TRACKER",
            font=("Segoe UI", 16, "bold"),
            bg="#1e1e2e",
            fg="#cba6f7",
        ).pack(side="left")

        tk.Label(
            top_frame,
            text="Wrong Mecha Production",
            font=("Segoe UI", 10, "italic"),
            bg="#1e1e2e",
            fg="#6c7086",
        ).pack(side="left", padx=(15, 0))

        # Right side buttons
        btn_frame = tk.Frame(top_frame, bg="#1e1e2e")
        btn_frame.pack(side="right")

        tk.Button(
            btn_frame,
            text="+ Add Account",
            command=self.add_account,
            bg="#a6e3a1",
            fg="#1e1e2e",
            font=("Segoe UI", 9, "bold"),
            relief="flat",
            padx=12,
            pady=4,
        ).pack(side="left", padx=4)

        tk.Button(
            btn_frame,
            text="🔄 Refresh",
            command=self.refresh_list,
            bg="#89dceb",
            fg="#1e1e2e",
            font=("Segoe UI", 9, "bold"),
            relief="flat",
            padx=12,
            pady=4,
        ).pack(side="left", padx=4)

        # Stats bar
        self.stats_label = tk.Label(
            self.root,
            text="",
            bg="#181825",
            fg="#cdd6f4",
            font=("Segoe UI", 10),
            pady=8,
        )
        self.stats_label.pack(fill="x", padx=10)

        # Table frame
        table_frame = tk.Frame(self.root, bg="#1e1e2e")
        table_frame.pack(fill="both", expand=True, padx=10, pady=10)

        # Treeview
        columns = ("id", "email", "credits", "status", "last_used", "notes")
        style = ttk.Style()
        style.theme_use("clam")
        style.configure(
            "Treeview",
            background="#181825",
            foreground="#cdd6f4",
            fieldbackground="#181825",
            rowheight=32,
            font=("Segoe UI", 9),
        )
        style.configure(
            "Treeview.Heading",
            background="#313244",
            foreground="#cba6f7",
            font=("Segoe UI", 10, "bold"),
        )
        style.map("Treeview", background=[("selected", "#45475a")])

        self.tree = ttk.Treeview(
            table_frame, columns=columns, show="headings", height=15
        )
        self.tree.heading("id", text="Account")
        self.tree.heading("email", text="Email")
        self.tree.heading("credits", text="Credits Left")
        self.tree.heading("status", text="Status")
        self.tree.heading("last_used", text="Last Used")
        self.tree.heading("notes", text="Notes")

        self.tree.column("id", width=80, anchor="center")
        self.tree.column("email", width=240)
        self.tree.column("credits", width=110, anchor="center")
        self.tree.column("status", width=90, anchor="center")
        self.tree.column("last_used", width=140, anchor="center")
        self.tree.column("notes", width=250)

        scrollbar = ttk.Scrollbar(table_frame, orient="vertical", command=self.tree.yview)
        self.tree.configure(yscrollcommand=scrollbar.set)
        self.tree.pack(side="left", fill="both", expand=True)
        scrollbar.pack(side="right", fill="y")

        # Action buttons frame
        action_frame = tk.Frame(self.root, bg="#1e1e2e")
        action_frame.pack(fill="x", padx=10, pady=(0, 10))

        tk.Button(
            action_frame,
            text="🚀 Open Workflow (Firefox)",
            command=self.open_workflow,
            bg="#cba6f7",
            fg="#1e1e2e",
            font=("Segoe UI", 10, "bold"),
            relief="flat",
            padx=15,
            pady=6,
        ).pack(side="left", padx=4)

        tk.Button(
            action_frame,
            text="✏️ Edit Selected",
            command=self.edit_account,
            bg="#f9e2af",
            fg="#1e1e2e",
            font=("Segoe UI", 10),
            relief="flat",
            padx=12,
            pady=6,
        ).pack(side="left", padx=4)

        tk.Button(
            action_frame,
            text="💰 Update Credits",
            command=self.update_credits,
            bg="#94e2d5",
            fg="#1e1e2e",
            font=("Segoe UI", 10),
            relief="flat",
            padx=12,
            pady=6,
        ).pack(side="left", padx=4)

        tk.Button(
            action_frame,
            text="🟢 Mark Active",
            command=lambda: self.set_status("ACTIVE"),
            bg="#a6e3a1",
            fg="#1e1e2e",
            font=("Segoe UI", 10),
            relief="flat",
            padx=12,
            pady=6,
        ).pack(side="left", padx=4)

        tk.Button(
            action_frame,
            text="⛔ Mark Used",
            command=lambda: self.set_status("USED"),
            bg="#f38ba8",
            fg="#1e1e2e",
            font=("Segoe UI", 10),
            relief="flat",
            padx=12,
            pady=6,
        ).pack(side="left", padx=4)

        tk.Button(
            action_frame,
            text="🗑️ Delete",
            command=self.delete_account,
            bg="#585b70",
            fg="#cdd6f4",
            font=("Segoe UI", 9),
            relief="flat",
            padx=10,
            pady=6,
        ).pack(side="right", padx=4)

    def refresh_list(self):
        """Reload account list display."""
        # Clear
        for item in self.tree.get_children():
            self.tree.delete(item)

        # Repopulate
        for acc in self.accounts:
            status_emoji = {
                "FRESH": "🟢 FRESH",
                "ACTIVE": "🟡 ACTIVE",
                "USED": "🔴 USED",
                "EXPIRED": "⚫ EXPIRED",
            }.get(acc["status"], acc["status"])

            self.tree.insert(
                "",
                "end",
                values=(
                    acc["id"],
                    acc.get("email", ""),
                    f"{acc['credits_remaining']:,}",
                    status_emoji,
                    acc.get("last_used", "-"),
                    acc.get("notes", ""),
                ),
            )

        self.update_stats()
        self.save_accounts()

    def update_stats(self):
        """Update stats bar."""
        total = len(self.accounts)
        fresh = sum(1 for a in self.accounts if a["status"] == "FRESH")
        active = sum(1 for a in self.accounts if a["status"] == "ACTIVE")
        used = sum(1 for a in self.accounts if a["status"] == "USED")
        total_credits = sum(a["credits_remaining"] for a in self.accounts)

        self.stats_label.config(
            text=f"📊 Total: {total} accounts | 🟢 Fresh: {fresh} | 🟡 Active: {active} | 🔴 Used: {used} | 💰 Total Credits Available: {total_credits:,}"
        )

    def get_selected_account(self):
        """Get currently selected account dict."""
        selection = self.tree.selection()
        if not selection:
            messagebox.showwarning("No Selection", "Please select an account first.")
            return None
        idx = self.tree.index(selection[0])
        return self.accounts[idx]

    def add_account(self):
        """Add a new account row."""
        next_num = len(self.accounts) + 1
        new_acc = new_account_data(next_num)
        new_acc["created_date"] = datetime.now().strftime("%Y-%m-%d %H:%M")
        self.accounts.append(new_acc)
        self.refresh_list()

    def edit_account(self):
        """Edit selected account's email + notes."""
        acc = self.get_selected_account()
        if not acc:
            return

        new_email = simpledialog.askstring(
            "Edit Email",
            f"Email for {acc['id']}:",
            initialvalue=acc.get("email", ""),
        )
        if new_email is not None:
            acc["email"] = new_email

        new_notes = simpledialog.askstring(
            "Edit Notes",
            f"Notes for {acc['id']}:",
            initialvalue=acc.get("notes", ""),
        )
        if new_notes is not None:
            acc["notes"] = new_notes

        self.refresh_list()

    def update_credits(self):
        """Update remaining credits."""
        acc = self.get_selected_account()
        if not acc:
            return

        new_val = simpledialog.askinteger(
            "Update Credits",
            f"Credits remaining for {acc['id']}:",
            initialvalue=acc["credits_remaining"],
            minvalue=0,
            maxvalue=999999,
        )
        if new_val is not None:
            acc["credits_remaining"] = new_val
            # Auto-mark USED if 0
            if new_val == 0:
                acc["status"] = "USED"
            self.refresh_list()

    def set_status(self, status):
        """Set status of selected account."""
        acc = self.get_selected_account()
        if not acc:
            return
        acc["status"] = status
        if status == "ACTIVE":
            acc["last_used"] = datetime.now().strftime("%Y-%m-%d %H:%M")
        self.refresh_list()

    def delete_account(self):
        """Delete selected account."""
        acc = self.get_selected_account()
        if not acc:
            return

        if messagebox.askyesno(
            "Confirm Delete",
            f"Delete {acc['id']}?\nThis cannot be undone.",
        ):
            self.accounts.remove(acc)
            self.refresh_list()

    def open_workflow(self):
        """Open 3 workflow URLs in Firefox (relies on Multi-Account Containers auto-mapping)."""
        acc = self.get_selected_account()
        if not acc:
            return

        if not self.firefox_path:
            messagebox.showerror(
                "Firefox Not Found",
                "Firefox executable not detected.\n\n"
                "Please install Firefox from firefox.com\n"
                "Or manually edit FIREFOX_PATHS in this script.",
            )
            return

        try:
            # Launch Firefox with all 3 URLs
            # The Multi-Account Containers extension will auto-route bookmarked URLs
            # to their assigned containers (must be configured first)
            cmd = [self.firefox_path]
            for url in WORKFLOW_URLS:
                cmd.extend(["-new-tab", url])

            subprocess.Popen(cmd)

            # Mark as active
            acc["status"] = "ACTIVE"
            acc["last_used"] = datetime.now().strftime("%Y-%m-%d %H:%M")
            self.refresh_list()

            messagebox.showinfo(
                "Workflow Opened",
                f"Opened workflow for {acc['id']} in Firefox.\n\n"
                f"Account marked as ACTIVE.\n"
                f"Last used: {acc['last_used']}\n\n"
                f"💡 Tip: Make sure bookmarks are mapped to container '{acc['container_name']}' in Firefox.",
            )
        except Exception as e:
            messagebox.showerror("Launch Error", f"Failed to launch Firefox: {e}")


def main():
    root = tk.Tk()
    app = LeonardoTracker(root)
    root.mainloop()


if __name__ == "__main__":
    main()
