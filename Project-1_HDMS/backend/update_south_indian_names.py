"""
Replaces all employee names in:
  1. backend/data/historical_tickets.csv
  2. tickets table (live tickets, seeded with South Indian names)
  3. historical_tickets table (reloaded from updated CSV)
"""

import csv
import sqlite3
import os
import io
from datetime import datetime, timedelta

BASE = os.path.dirname(__file__)
DB_PATH = os.path.join(BASE, "helpdesk.db")
CSV_PATH = os.path.join(BASE, "data", "historical_tickets.csv")

# ── 1. Name mapping: old → South Indian replacement ───────────────────────────
NAME_MAP = {
    "Amit Gupta":      "Arjun Krishnamurthy",
    "Ananya Das":      "Ananya Raghavan",
    "Anita Krishnan":  "Anitha Natarajan",
    "Arjun Sharma":    "Karthik Subramanian",
    "Arun Nambiar":    "Arun Balakrishnan",
    "Aryan Kumar":     "Dinesh Raghavan",
    "Ashwin Mehta":    "Ashwin Thirumalai",
    "Bhavna Das":      "Bhavna Venkatesh",
    "Deepa Iyer":      "Deepa Sundaram",
    "Dinesh Nambiar":  "Dinesh Raghunathan",
    "Divya Sharma":    "Divya Anand",
    "Karan Mehta":     "Manikandan Ravi",
    "Karthik Reddy":   "Karthik Subramaniam",
    "Kavya Pillai":    "Kavya Ramaswamy",
    "Manish Tiwari":   "Rajesh Natarajan",
    "Meena Joshi":     "Meena Subramaniam",
    "Neha Sharma":     "Neha Thyagarajan",
    "Nikhil Rao":      "Nikhil Ananthakrishnan",
    "Nisha Rao":       "Nisha Murthy",
    "Pallavi Nair":    "Pallavi Raghunathan",
    "Pooja Krishnan":  "Pooja Venkataraman",
    "Preethi Rajan":   "Preethi Rajan",
    "Priya Nair":      "Priya Krishnan",
    "Rajesh Singh":    "Rajan Pillai",
    "Riya Das":        "Riya Pillai",
    "Rohit Jain":      "Rohit Gopalakrishnan",
    "Rohit Menon":     "Sriram Venkatesh",
    "Sanjay Kumar":    "Sanjay Padmanabhan",
    "Shreya Patel":    "Shreya Balakrishnan",
    "Sriram Iyer":     "Sriram Narayanan",
    "Sunil Reddy":     "Sunil Nambiar",
    "Sunita Patel":    "Sunita Nair",
    "Suresh Babu":     "Suresh Venkataraman",
    "Swati Kumar":     "Swathi Krishnamurthy",
    "Varun Gupta":     "Varun Narayanan",
    "Vikram Rao":      "Vikram Chandrasekaran",
}

# ── 2. Live tickets (28 rows with South Indian names) ─────────────────────────
LIVE_TICKETS = [
    # (employee_name, department, issue_category, description, priority, status, resolution_notes)

    # Open (5) → "New" category
    ("Priya Krishnan",         "IT",          "Password Reset",        "Unable to reset domain password after expiry. Locked out of all systems.",                              "High",     "Open",        None),
    ("Karthik Subramanian",    "HR",          "Software Installation", "Need Microsoft Office 365 installed on the new laptop assigned to me.",                                 "Medium",   "Open",        None),
    ("Anitha Natarajan",       "Finance",     "Account Access",        "Cannot log in to the financial reporting portal. Access denied error on every attempt.",                "High",     "Open",        None),
    ("Arun Balakrishnan",      "Operations",  "Hardware Request",      "Requesting a second monitor for a dual-display setup to improve daily productivity.",                   "Low",      "Open",        None),
    ("Divya Sundaram",         "Marketing",   "Email Access",          "Outlook not syncing emails since yesterday. All outgoing emails stuck in the outbox.",                  "Medium",   "Open",        None),

    # In Progress (6) → "Pending" and "Inprogress" categories
    ("Rajesh Natarajan",       "IT",          "Network Connectivity",  "VPN connection drops every 15 minutes causing disruptions to remote work sessions.",                    "Critical", "In Progress", None),
    ("Kavya Ramaswamy",        "Engineering", "VPN Issue",             "Cannot connect to office VPN from home. Reinstalled VPN client but the issue persists.",                "High",     "In Progress", None),
    ("Suresh Venkataraman",    "Sales",       "Laptop Issue",          "Laptop screen flickering and randomly going black. Battery draining faster than expected.",             "High",     "In Progress", None),
    ("Pallavi Raghunathan",    "Legal",       "Application Crash",     "Legal document system crashes when exporting PDFs longer than 20 pages.",                               "Critical", "In Progress", None),
    ("Dinesh Raghavan",        "Finance",     "Database Error",        "Receiving SQL timeout errors in the accounting module during month-end report generation.",              "High",     "In Progress", None),
    ("Meena Subramaniam",      "HR",          "Printer Issue",         "Office printer on the 3rd floor not responding to print jobs. Restarted but issue remains.",            "Medium",   "In Progress", None),

    # Approved (5) → "Approved" category
    ("Manikandan Ravi",        "IT",          "Software Installation", "Request approved to install Adobe Creative Suite on design team workstations.",                         "Medium",   "Approved",    None),
    ("Nisha Murthy",           "Operations",  "Hardware Request",      "Ergonomic keyboard and mouse approved for procurement. Expected delivery in 5 business days.",           "Low",      "Approved",    None),
    ("Sriram Narayanan",       "Engineering", "Server Access",         "Production server access approved for the deployment team lead role.",                                   "High",     "Approved",    None),
    ("Swathi Krishnamurthy",   "Marketing",   "Software Installation", "Approval granted for Canva Pro subscription for the entire marketing department.",                      "Medium",   "Approved",    None),
    ("Vikram Chandrasekaran",  "Finance",     "Account Access",        "Finance tool access approved pending completion of mandatory security awareness training.",              "High",     "Approved",    None),

    # Resolved (6) → "Resolved" category
    ("Pooja Venkataraman",     "IT",          "Password Reset",        "Password reset completed successfully. User confirmed access to all required systems.",                  "Medium",   "Resolved",    "Reset via admin console. User confirmed access restored."),
    ("Deepa Sundaram",         "HR",          "Email Access",          "Email sync fixed by reconfiguring IMAP settings. All emails now syncing correctly.",                    "Medium",   "Resolved",    "Reconfigured Outlook profile. Root cause was a corrupted OST file."),
    ("Arjun Krishnamurthy",    "Sales",       "VPN Issue",             "VPN client updated to latest version. Stable connection for 48 hours without drops.",                   "High",     "Resolved",    "Updated Cisco AnyConnect to v4.10. Root cause was an incompatible driver."),
    ("Bhavna Venkatesh",       "Engineering", "Application Crash",     "IDE crash resolved by clearing corrupted cache and updating JVM to the latest LTS version.",            "High",     "Resolved",    "Cleared IDE cache and updated Java 17. Crash not reproduced after fix."),
    ("Ananya Raghavan",        "Legal",       "Software Installation", "DocuSign e-signature software installed and activated on all legal team machines.",                     "Medium",   "Resolved",    "Installed DocuSign v5.2 and configured SSO integration."),
    ("Rajan Pillai",           "Finance",     "Database Error",        "DB connection pool exhaustion resolved by tuning max connections and adding read replicas.",             "Critical", "Resolved",    "Increased pool from 50 to 200 and added index on report queries."),

    # Closed (6) → "Archive" and "Resolved" categories
    ("Riya Pillai",            "Operations",  "Meeting Room AV",       "AV system in conference room B restored after firmware update and cable replacement.",                   "Low",      "Closed",      "Updated projector firmware and replaced HDMI cable. Tested across 3 meetings."),
    ("Ashwin Thirumalai",      "IT",          "Mobile Device",         "New iPhone provisioned with MDM profile and corporate email configured. User onboarded.",               "Medium",   "Closed",      "Device enrolled in Jamf MDM. Email, VPN, and apps fully configured."),
    ("Shreya Balakrishnan",    "Marketing",   "Account Access",        "Social media tool access restored after account ownership transfer completed successfully.",             "Medium",   "Closed",      "Transferred Hootsuite account and reset 2FA. User confirmed access."),
    ("Sunita Nair",            "HR",          "Data Recovery",         "Accidentally deleted HR reports recovered from backup. All 3 years of data restored intact.",           "Critical", "Closed",      "Restored from nightly backup dated 2025-05-19. No data loss confirmed."),
    ("Sanjay Padmanabhan",     "Sales",       "Laptop Issue",          "Laptop battery replaced under warranty. New battery holds charge for 8+ hours as expected.",            "Medium",   "Closed",      "Replaced battery under Dell ProSupport warranty. Laptop tested for 2 days."),
    ("Nikhil Ananthakrishnan", "Engineering", "Network Connectivity",  "Network switch port reconfigured to fix intermittent packet loss. Connection stable since fix.",         "High",     "Closed",      "Replaced faulty switch port and updated VLAN config. Monitoring shows 0% loss."),
]


def update_csv():
    with open(CSV_PATH, newline="", encoding="utf-8") as f:
        rows = list(csv.DictReader(f))
        fieldnames = list(rows[0].keys())

    replaced = 0
    for row in rows:
        old = row["employee_name"]
        if old in NAME_MAP:
            row["employee_name"] = NAME_MAP[old]
            replaced += 1

    with open(CSV_PATH, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

    print(f"CSV updated: {replaced} name replacements across {len(rows)} rows.")


def reseed_live_tickets(conn):
    cur = conn.cursor()
    cur.execute("DELETE FROM tickets")

    base_date = datetime(2025, 4, 1, 9, 0, 0)
    for i, (emp, dept, cat, desc, pri, status, notes) in enumerate(LIVE_TICKETS):
        created = base_date + timedelta(days=i, hours=i % 8)
        cur.execute(
            """INSERT INTO tickets
               (employee_name, department, issue_category, description, priority, status, resolution_notes, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
            (emp, dept, cat, desc, pri, status, notes, created.isoformat()),
        )

    counts = {}
    for *_, status, _ in LIVE_TICKETS:
        counts[status] = counts.get(status, 0) + 1

    print(f"Live tickets reseeded ({len(LIVE_TICKETS)} total):")
    for s, n in sorted(counts.items()):
        print(f"  {s}: {n}")


def reload_historical_tickets(conn):
    cur = conn.cursor()
    cur.execute("DELETE FROM historical_tickets")

    with open(CSV_PATH, newline="", encoding="utf-8") as f:
        rows = list(csv.DictReader(f))

    STATUS_MAP = {
        "Resolved":    "Resolved",
        "Closed":      "Closed",
        "In Progress": "In Progress",
        "Open":        "Open",
        "Pending":     "Pending",
    }
    PRIORITY_MAP = {
        "Critical": "Critical", "High": "High",
        "Medium": "Medium", "Low": "Low",
    }

    loaded = 0
    for row in rows:
        status   = STATUS_MAP.get(row["status"], "Resolved")
        priority = PRIORITY_MAP.get(row["priority"], "Medium")
        created  = row["created_at"]
        resolved = row.get("resolved_at") or None
        res_days = None
        if resolved:
            try:
                td = datetime.fromisoformat(resolved) - datetime.fromisoformat(created)
                res_days = round(td.total_seconds() / 86400, 2)
            except Exception:
                pass

        cur.execute(
            """INSERT INTO historical_tickets
               (employee_name, department, issue_category, description, priority,
                status, created_at, resolved_at, resolution_time_days, source_file)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                row["employee_name"], row["department"], row["issue_category"],
                row["description"],  priority, status,
                created, resolved, res_days, "historical_tickets.csv",
            ),
        )
        loaded += 1

    print(f"Historical tickets reloaded: {loaded} records.")


def main():
    print("Step 1: Update CSV")
    update_csv()

    print("\nStep 2: Reseed live tickets")
    conn = sqlite3.connect(DB_PATH)
    reseed_live_tickets(conn)

    print("\nStep 3: Reload historical tickets")
    reload_historical_tickets(conn)

    conn.commit()
    conn.close()
    print("\nDone.")


if __name__ == "__main__":
    main()
