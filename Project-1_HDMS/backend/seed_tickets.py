import sqlite3
from datetime import datetime, timedelta
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "helpdesk.db")

tickets = [
    # Open (5) → shown in "New" category
    ("Alice Johnson",    "IT",          "Password Reset",        "Unable to reset my domain password after expiry. Locked out of the system.",                          "High",     "Open",        None),
    ("Bob Smith",        "HR",          "Software Installation", "Need Microsoft Office 365 installed on new laptop assigned to me.",                                   "Medium",   "Open",        None),
    ("Carol White",      "Finance",     "Account Access",        "Cannot log in to the financial reporting portal. Access denied error on every attempt.",               "High",     "Open",        None),
    ("David Lee",        "Operations",  "Hardware Request",      "Requesting a second monitor for dual-display setup to improve productivity.",                          "Low",      "Open",        None),
    ("Eva Martinez",     "Marketing",   "Email Access",          "Outlook not syncing emails since yesterday. All emails stuck in outbox.",                              "Medium",   "Open",        None),

    # In Progress (6) → shown in "Pending" and "Inprogress" categories
    ("Frank Kumar",      "IT",          "Network Connectivity",  "VPN connection drops every 15 minutes causing interruptions to remote work sessions.",                 "Critical", "In Progress", None),
    ("Grace Chen",       "Engineering", "VPN Issue",             "Cannot connect to office VPN from home. Tried reinstalling the VPN client but issue persists.",        "High",     "In Progress", None),
    ("Henry Adams",      "Sales",       "Laptop Issue",          "Laptop screen flickering and randomly going black. Battery draining faster than usual.",               "High",     "In Progress", None),
    ("Iris Patel",       "Legal",       "Application Crash",     "Legal document management system crashes when exporting PDFs longer than 20 pages.",                   "Critical", "In Progress", None),
    ("Jack Thompson",    "Finance",     "Database Error",        "Receiving SQL timeout errors in the accounting module during month-end report generation.",             "High",     "In Progress", None),
    ("Karen Wilson",     "HR",          "Printer Issue",         "Office printer on 3rd floor not responding to print jobs. Restarted printer but issue remains.",       "Medium",   "In Progress", None),

    # Approved (5) → shown in "Approved" category
    ("Liam Brown",       "IT",          "Software Installation", "Request approved to install Adobe Creative Suite for the design team workstations.",                   "Medium",   "Approved",    None),
    ("Mia Davis",        "Operations",  "Hardware Request",      "Ergonomic keyboard and mouse approved for procurement. Expected delivery in 5 business days.",          "Low",      "Approved",    None),
    ("Noah Garcia",      "Engineering", "Server Access",         "Access to production server environment approved for deployment team lead role.",                      "High",     "Approved",    None),
    ("Olivia Harris",    "Marketing",   "Software Installation", "Approval granted for Canva Pro subscription for the entire marketing department.",                     "Medium",   "Approved",    None),
    ("Peter Jackson",    "Finance",     "Account Access",        "Finance reporting tool access approved pending completion of security awareness training.",             "High",     "Approved",    None),

    # Resolved (6) → shown in "Resolved" category
    ("Quinn Rodriguez",  "IT",          "Password Reset",        "Password reset completed successfully. User can now access all required systems.",                     "Medium",   "Resolved",    "Reset password via admin console. User confirmed access restored."),
    ("Rachel Scott",     "HR",          "Email Access",          "Email sync issue fixed by reconfiguring IMAP settings. All emails now syncing correctly.",             "Medium",   "Resolved",    "Reconfigured Outlook profile. Issue was corrupted OST file."),
    ("Sam Turner",       "Sales",       "VPN Issue",             "VPN client updated to latest version. Stable connection maintained for 48 hours without drops.",       "High",     "Resolved",    "Updated Cisco AnyConnect to v4.10. Root cause was incompatible driver."),
    ("Tina Walker",      "Engineering", "Application Crash",     "Development IDE crash fixed by clearing corrupted cache and updating JVM to latest LTS version.",      "High",     "Resolved",    "Cleared IDE cache and updated Java 17. Crash not reproduced after fix."),
    ("Uma Young",        "Legal",       "Software Installation", "DocuSign e-signature software successfully installed and activated on legal team machines.",            "Medium",   "Resolved",    "Installed DocuSign v5.2 and configured SSO integration."),
    ("Victor Allen",     "Finance",     "Database Error",        "Database connection pool exhaustion resolved by tuning max connections and adding read replicas.",      "Critical", "Resolved",    "Increased DB connection pool from 50 to 200 and added index on report queries."),

    # Closed (6) → shown in "Resolved" and "Archive" categories
    ("Wendy Hall",       "Operations",  "Meeting Room AV",       "AV system in conference room B fully restored after firmware update and cable replacement.",           "Low",      "Closed",      "Updated projector firmware and replaced HDMI cable. Tested with 3 meetings."),
    ("Xavier Lewis",     "IT",          "Mobile Device",         "New iPhone provisioned with MDM profile and corporate email configured. User onboarded.",              "Medium",   "Closed",      "Device enrolled in Jamf MDM. Email, VPN, and apps configured."),
    ("Yara King",        "Marketing",   "Account Access",        "Social media management tool access restored after account ownership transfer completed.",              "Medium",   "Closed",      "Transferred Hootsuite account and reset 2FA. User confirmed access."),
    ("Zoe Wright",       "HR",          "Data Recovery",         "Accidentally deleted HR reports recovered from backup. All 3 years of data restored intact.",          "Critical", "Closed",      "Restored from nightly backup dated 2025-05-19. No data loss confirmed."),
    ("Aaron Mitchell",   "Sales",       "Laptop Issue",          "Laptop battery replaced under warranty. New battery holds charge for 8+ hours as expected.",           "Medium",   "Closed",      "Replaced battery under Dell ProSupport warranty. Laptop tested for 2 days."),
    ("Beth Nelson",      "Engineering", "Network Connectivity",  "Network switch port reconfigured to fix intermittent packet loss. Connection stable since fix.",        "High",     "Closed",      "Replaced faulty switch port and updated VLAN config. Monitoring shows 0% loss."),
]

def seed():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    cur.execute("SELECT COUNT(*) FROM tickets")
    existing = cur.fetchone()[0]
    if existing > 0:
        print(f"Database already has {existing} tickets. Clearing before seeding...")
        cur.execute("DELETE FROM tickets")

    base_date = datetime(2025, 4, 1, 9, 0, 0)
    for i, (emp, dept, cat, desc, pri, status, notes) in enumerate(tickets):
        created = base_date + timedelta(days=i, hours=i % 8)
        cur.execute(
            """INSERT INTO tickets
               (employee_name, department, issue_category, description, priority, status, resolution_notes, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
            (emp, dept, cat, desc, pri, status, notes, created.isoformat())
        )

    conn.commit()
    conn.close()

    counts = {}
    for *_, status, _ in tickets:
        counts[status] = counts.get(status, 0) + 1

    print(f"Seeded {len(tickets)} tickets:")
    for status, n in sorted(counts.items()):
        print(f"  {status}: {n}")

if __name__ == "__main__":
    seed()
