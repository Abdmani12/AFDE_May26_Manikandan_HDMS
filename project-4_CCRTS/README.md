# Customer Complaint & Resolution Tracking System (CCRTS)

A full-stack web application for managing customer complaints end-to-end — from registration through resolution, with SLA tracking, escalation workflows, and role-based dashboards.

---

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, React Router v6, Recharts, Lucide React |
| Backend | Node.js, Express.js |
| Database | SQLite (via sql.js — zero native compilation) |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| API Testing | Postman |

---

## Project Structure

```
project-4/
├── frontend/           React.js application (port 5173)
├── backend/            Node.js + Express REST API (port 5000)
│   ├── src/
│   │   ├── routes/     auth, complaints, users, categories, dashboard, notifications, feedback
│   │   ├── middleware/ auth.js, roleCheck.js
│   │   └── utils/      slaChecker.js, notificationHelper.js
│   ├── database/       init.js + ccrts.db (auto-created on first run)
│   └── uploads/        Attachment storage
├── screenshots/        UI screenshots
└── docs/               API documentation
```

---

## Setup & Run

### Prerequisites
- Node.js v18+
- npm

### 1. Backend Setup

```bash
cd backend
npm install
npm run dev       # development (nodemon)
# or
npm start         # production
```

Backend runs at: **http://localhost:5000**

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: **http://localhost:5173**

> Run **backend first**, then frontend.

---

## Default Login Credentials

| Role | Email | Password |
|---|---|---|
| Admin | admin@ccrts.com | Admin@123 |
| Supervisor | supervisor@ccrts.com | Super@123 |
| Agent | agent1@ccrts.com | Agent@123 |
| Customer | customer@ccrts.com | Cust@123 |

---

## API Endpoints Summary

| Module | Endpoints |
|---|---|
| Auth | POST /api/auth/login, /register, GET /api/auth/me |
| Complaints | GET/POST /api/complaints, GET/PUT /api/complaints/:id |
| Workflow | PUT /api/complaints/:id/assign \| status \| escalate \| resolve \| close |
| Dashboard | GET /api/dashboard/stats \| recent \| sla-breaches \| agent-performance \| trends |
| Users | GET/POST/PUT/DELETE /api/users |
| Categories | GET/POST/PUT/DELETE /api/categories |
| Notifications | GET /api/notifications, PUT /read \| read-all |
| Feedback | POST/GET /api/feedback/:complaint_id |

Full API health check: **GET http://localhost:5000/api/health**

---

## User Roles & Permissions

| Feature | Admin | Supervisor | Agent | Customer |
|---|---|---|---|---|
| View all complaints | ✅ | ✅ | ❌ | ❌ |
| View own complaints | ✅ | ✅ | assigned only | own only |
| Create complaint | ✅ | ❌ | ❌ | ✅ |
| Assign to agent | ✅ | ✅ | ❌ | ❌ |
| Update status | ✅ | ✅ | assigned only | ❌ |
| Escalate | ✅ | ✅ | ❌ | ❌ |
| Resolve | ✅ | ✅ | assigned only | ❌ |
| Close complaint | ✅ | ❌ | ❌ | own resolved |
| Submit feedback | ❌ | ❌ | ❌ | own resolved |
| User management | ✅ | ❌ | ❌ | ❌ |
| Reports/Analytics | ✅ | ✅ | ❌ | ❌ |

---

## Complaint Lifecycle

```
open → assigned → in_progress → resolved → closed
                      ↓              ↑
               pending_customer  (reopen)
                      ↓
                  escalated → assigned
```

---

## SLA Rules

| Priority | Resolution Time |
|---|---|
| Low | 72 hours |
| Medium | 48 hours |
| High | 24 hours |
| Critical | 4 hours |

SLA auto-checker runs every 30 minutes and escalates breached complaints automatically.

---

## Features Implemented

- ✅ Role-based authentication (JWT)
- ✅ Complaint registration with auto-generated IDs (CCRTS-YYYYMMDD-XXXX)
- ✅ Full complaint lifecycle workflow with enforced transitions
- ✅ SLA tracking and auto-escalation via cron job
- ✅ In-app notification system
- ✅ Dashboard with charts (bar chart by category, line chart 30-day trend)
- ✅ Agent performance reports
- ✅ File attachment support (up to 5 files, 5MB each)
- ✅ Customer feedback with star rating
- ✅ Complaint history/audit trail
- ✅ User management (admin)
- ✅ Responsive UI with role-aware sidebar navigation
