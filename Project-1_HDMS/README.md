# Helpdesk Ticket Management System (HDMS)

A full-stack web application for managing internal IT support tickets — built with React + Vite on the frontend and FastAPI + SQLite on the backend. Includes an ETL pipeline for bulk historical data import, a rich analytics dashboard with interactive charts, and role-based user authentication.

---

## Tech Stack

| Layer       | Technology                          | Version  |
|-------------|-------------------------------------|----------|
| Frontend    | React + Vite                        | 18.3 / 5.4 |
| Routing     | React Router DOM                    | 6.27     |
| Charts      | Recharts                            | 3.8      |
| HTTP Client | Axios                               | 1.7      |
| Backend     | Python FastAPI                      | 0.115    |
| ASGI Server | Uvicorn                             | 0.30     |
| ORM         | SQLAlchemy                          | 2.0      |
| Validation  | Pydantic                            | 2.9      |
| ETL         | Pandas + Python-dateutil            | 2.2 / 2.9 |
| Database    | SQLite (`helpdesk.db`)              | —        |
| Auth        | SHA-256 password hashing with salt  | —        |

---

## Features

### Ticket Management
- Create, view, update, and delete support tickets
- Status lifecycle: **Open → In Progress → Approved → Resolved → Closed**
- Priority levels: Critical, High, Medium, Low
- 15+ issue categories (VPN, Password Reset, Software Installation, Network Connectivity, etc.)
- Resolution notes attached to resolved/closed tickets

### Dashboard
- Category cards: Recent, New, Pending, Approved, Inprogress, Resolved, Archive
- Live ticket counts per status category
- Card and list view toggle
- Inline search and status filter bar
- Per-ticket actions: View, Edit, Delete

### Search & Filter
- Full-text keyword search across ticket ID, name, category, description, department
- Filter by status, priority, and issue category simultaneously

### Analytics Dashboard
- **Hero header** with live-status badge and data source toggle (Historical / Live)
- **7 stat cards** — Live Tickets, Open, In Progress, Resolved, Closed, Historical Records, Avg Resolution
- **Most Common Issue Categories** — horizontal gradient bar chart
- **Priority Distribution** — donut chart with centre total count and % labels
- **Department-wise Ticket Counts** — vertical gradient bar chart
- **Monthly Resolution Trends** — area chart with gradient fills (total, resolved, avg resolution days)
- Dark frosted-glass custom tooltips throughout

### ETL Pipeline
- Load the bundled `historical_tickets.csv` (201 records) with one click
- Upload a custom CSV file and run ETL against it
- Transformer normalises priorities, statuses, categories; deduplicates; calculates resolution days
- ETL run history table with records extracted / transformed / loaded / duplicates removed
- Live status polling during pipeline execution

### Authentication
- Login / Register with email + password
- Protected routes — redirects to `/login` if unauthenticated
- User profile stored with department and role

---

## Project Structure

```
Project-1_HDMS/
├── backend/
│   ├── main.py                        # FastAPI app, CORS, router registration
│   ├── database.py                    # SQLite connection & session factory
│   ├── models.py                      # SQLAlchemy ORM models (4 tables)
│   ├── schemas.py                     # Pydantic request/response schemas
│   ├── crud.py                        # DB operations: tickets + users
│   ├── requirements.txt
│   ├── seed_tickets.py                # Seeds 28 demo tickets (all statuses)
│   ├── update_south_indian_names.py   # Replaces names with South Indian names (CSV + DB)
│   ├── routers/
│   │   ├── tickets.py                 # Ticket CRUD endpoints
│   │   ├── auth.py                    # Register / login endpoints
│   │   ├── analytics.py               # Overview, distributions, trends
│   │   └── etl.py                     # ETL run / upload / status endpoints
│   ├── etl/
│   │   ├── extractor.py               # CSV extraction & column validation
│   │   ├── transformer.py             # Normalise, deduplicate, enrich
│   │   └── loader.py                  # Bulk insert into historical_tickets
│   └── data/
│       └── historical_tickets.csv     # 201-row seed dataset (South Indian names)
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── Navbar.jsx
│       │   └── StatusBadge.jsx
│       ├── context/
│       │   ├── AuthContext.jsx
│       │   └── NotificationContext.jsx
│       ├── pages/
│       │   ├── Dashboard.jsx / .module.css
│       │   ├── TicketList.jsx / .module.css
│       │   ├── CreateTicket.jsx / .module.css
│       │   ├── TicketDetails.jsx / .module.css
│       │   ├── EditTicket.jsx / .module.css
│       │   ├── SearchFilter.jsx / .module.css
│       │   ├── Analytics.jsx / .module.css
│       │   ├── ETLPipeline.jsx / .module.css
│       │   └── Login.jsx / .module.css
│       ├── services/
│       │   └── api.js                 # Axios client for all API calls
│       ├── App.jsx                    # Router, Sidebar, Protected layout
│       └── main.jsx
├── database/
│   └── schema.sql                     # DDL with 5 sample seed rows
└── README.md
```

---

## Setup Instructions

### Prerequisites
- Python 3.10+
- Node.js 18+

### Backend

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# macOS / Linux
source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload
```

| URL | Purpose |
|-----|---------|
| `http://localhost:8000` | REST API |
| `http://localhost:8000/docs` | Swagger UI (interactive) |
| `http://localhost:8000/redoc` | ReDoc API reference |

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs at: `http://localhost:5173`

### Seed Demo Data

```bash
# From backend/
python seed_tickets.py
```

Seeds 28 tickets distributed across all statuses:

| Status | Count | Dashboard Category |
|--------|-------|--------------------|
| Open | 5 | New |
| In Progress | 6 | Pending / Inprogress |
| Approved | 5 | Approved |
| Resolved | 6 | Resolved |
| Closed | 6 | Archive |

### Load Historical Data (ETL)

Either run via the UI at `/etl` → **Run ETL**, or via API:

```bash
curl -X POST http://localhost:8000/etl/run
```

Loads 201 historical records from `backend/data/historical_tickets.csv` into the `historical_tickets` table, which powers the Analytics dashboard charts.

---

## API Endpoints

### Tickets — `/tickets`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/tickets/` | List all tickets |
| GET | `/tickets/{id}` | Get ticket by ID |
| POST | `/tickets/` | Create ticket |
| PUT | `/tickets/{id}` | Update ticket |
| DELETE | `/tickets/{id}` | Delete ticket |
| GET | `/tickets/search?keyword=&category=&status=&priority=` | Search / filter |

### Authentication — `/auth`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login and retrieve user |
| POST | `/auth/check-email` | Check if email exists |

### Analytics — `/analytics`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/analytics/overview` | Aggregate counts + avg resolution |
| GET | `/analytics/category-distribution?source=` | Ticket count by category |
| GET | `/analytics/priority-distribution?source=` | Ticket count by priority |
| GET | `/analytics/department-summary?source=` | Ticket count by department |
| GET | `/analytics/resolution-trends` | Monthly volume & resolution time |
| GET | `/analytics/historical-tickets?skip=&limit=&...` | Paginated historical records |
| GET | `/analytics/historical-tickets/count` | Total historical record count |

> `source` query param accepts `historical` (default) or `live`.

### ETL Pipeline — `/etl`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/etl/run` | Run ETL on built-in CSV |
| POST | `/etl/upload` | Upload custom CSV and run ETL |
| GET | `/etl/status` | Latest ETL run details |
| GET | `/etl/runs?limit=20` | ETL run history |

---

## Database Schema

### `tickets` — Live operational tickets

| Column | Type | Notes |
|--------|------|-------|
| ticket_id | INTEGER PK | Auto-increment |
| employee_name | VARCHAR(100) | |
| department | VARCHAR(100) | |
| issue_category | VARCHAR(100) | |
| description | TEXT | |
| priority | VARCHAR(20) | Default: Medium |
| status | VARCHAR(20) | Default: Open |
| resolution_notes | TEXT | Nullable |
| created_at | DATETIME | Server default: now() |

### `users` — Registered users

| Column | Type | Notes |
|--------|------|-------|
| user_id | INTEGER PK | Auto-increment |
| full_name | VARCHAR(100) | |
| email | VARCHAR(150) | Unique |
| password_hash | VARCHAR(200) | SHA-256 + salt |
| department | VARCHAR(100) | Default: IT |
| role | VARCHAR(50) | Default: Employee |
| created_at | DATETIME | Server default: now() |

### `historical_tickets` — ETL-imported records

| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER PK | Auto-increment |
| employee_name | VARCHAR(100) | Indexed |
| department | VARCHAR(100) | Indexed |
| issue_category | VARCHAR(100) | Indexed |
| description | TEXT | |
| priority | VARCHAR(20) | Indexed |
| status | VARCHAR(20) | Indexed |
| created_at | DATETIME | |
| resolved_at | DATETIME | Nullable |
| resolution_time_days | FLOAT | Calculated by transformer |
| source_file | VARCHAR(255) | Origin CSV filename |
| etl_run_id | INTEGER | FK to etl_runs |
| loaded_at | DATETIME | Server default: now() |

### `etl_runs` — Pipeline execution log

| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER PK | Auto-increment |
| source_file | VARCHAR(255) | |
| status | VARCHAR(20) | running / success / failed |
| records_extracted | INTEGER | |
| records_transformed | INTEGER | |
| records_loaded | INTEGER | |
| duplicates_removed | INTEGER | |
| error_message | TEXT | Nullable |
| started_at | DATETIME | |
| completed_at | DATETIME | Nullable |

---

## Frontend Pages

| Route | Page | Description |
|-------|------|-------------|
| `/login` | Login | Email + password auth, redirects to dashboard |
| `/` | Dashboard | Status category cards, ticket list, search |
| `/tickets` | Ticket List | Full table view of all tickets |
| `/tickets/new` | Create Ticket | Form to raise a new support ticket |
| `/tickets/:id` | Ticket Details | Read-only detail view |
| `/tickets/:id/edit` | Edit Ticket | Update ticket fields and status |
| `/search` | Search & Filter | Multi-field filter with live results |
| `/analytics` | Analytics | Charts dashboard (donut, bar, area) |
| `/etl` | ETL Pipeline | Trigger ETL runs, view run history |

---

## Ticket Status Flow

```
Open  ──►  In Progress  ──►  Approved  ──►  Resolved  ──►  Closed
 │                                                              │
 └──────────────────── (archived) ─────────────────────────────┘
```

| Status | Dashboard Card | Meaning |
|--------|---------------|---------|
| Open | New | Just raised, not yet picked up |
| In Progress | Pending / Inprogress | Actively being worked on |
| Approved | Approved | Approved by manager / team lead |
| Resolved | Resolved | Fix applied, pending confirmation |
| Closed | Archive | Fully completed and archived |

---

## ETL Pipeline — How It Works

```
CSV File
   │
   ▼
Extractor       → validates columns, returns raw DataFrame
   │
   ▼
Transformer     → normalises priority / status / category
                → deduplicates (name + category + date)
                → calculates resolution_time_days
                → parses & cleans dates
   │
   ▼
Loader          → bulk inserts into historical_tickets
                → records ETL run metadata in etl_runs
```

Supported CSV columns: `employee_name`, `department`, `issue_category`, `description`, `priority`, `status`, `created_at`, `resolved_at` (optional).

---

## Utility Scripts

### `backend/seed_tickets.py`
Seeds the live `tickets` table with 28 demo tickets using realistic South Indian employee names, spread across all statuses. Safe to re-run — clears existing tickets first.

```bash
python seed_tickets.py
```

### `backend/update_south_indian_names.py`
Replaces all employee names with authentic South Indian names (Tamil, Telugu, Kannada, Malayalam) across:
- `backend/data/historical_tickets.csv`
- `tickets` table (live tickets)
- `historical_tickets` table

```bash
python update_south_indian_names.py
```

---

## Sample Employee Names (South Indian)

| Name | Department |
|------|-----------|
| Priya Krishnan | IT |
| Karthik Subramanian | HR |
| Anitha Natarajan | Finance |
| Rajesh Natarajan | IT |
| Kavya Ramaswamy | Engineering |
| Pallavi Raghunathan | Legal |
| Vikram Chandrasekaran | Finance |
| Sriram Narayanan | Engineering |
| Manikandan Ravi | IT |
| Swathi Krishnamurthy | Marketing |
| Arjun Krishnamurthy | Sales |
| Rajan Pillai | Finance |

---

## Development Notes

- Backend auto-creates all database tables on startup via SQLAlchemy `Base.metadata.create_all()`
- CORS is configured for `http://localhost:5173` and `http://localhost:3000`
- No JWT — auth state is stored in React context (localStorage-backed)
- The `helpdesk.db` SQLite file is created in `backend/` on first run
- Historical data and live tickets are kept in separate tables; the Analytics page toggles between them via the `source` query parameter
