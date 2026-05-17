# Enterprise Knowledge Base Management System (EKBMS)

A full-stack web application for managing organizational knowledge — articles, documents, FAQs, policies, and SOPs — with role-based access, approval workflows, search, and analytics.

---

## Tech Stack

| Layer    | Technology              |
|----------|-------------------------|
| Frontend | React 18, Vite, Tailwind CSS |
| Backend  | FastAPI (Python)         |
| Database | SQLite (via SQLAlchemy)  |
| Auth     | JWT (python-jose + bcrypt) |
| Editor   | React Quill (rich text)  |

---

## Features

- **Role-based access** — Admin, Author, Reviewer, Employee
- **Article lifecycle** — Draft → Pending → Approved / Rejected → Archived
- **Approval workflow** — Reviewer queue with approve/reject + comments
- **Rich text editor** — Quill.js for authoring articles
- **Full-text search** — Keyword, category, tag, author filters + sort
- **File attachments** — Upload/download PDFs, DOCX, images (max 10MB)
- **Comments & Ratings** — Per-article discussion and 1–5 star ratings
- **Bookmarks** — Save articles for later reading
- **Dashboard** — Live stats, recent articles, most viewed, popular categories
- **Analytics** — Status distribution, top authors, top rated articles (admin)
- **Category management** — Hierarchical categories (parent/child)
- **Tag management** — Multi-tag articles, tag-based search
- **User management** — Admin CRUD on users, role changes, activate/deactivate

---

## Project Structure

```
Project-3/
├── backend/
│   ├── main.py             # FastAPI app entry point + seeding
│   ├── database.py         # SQLAlchemy engine + session
│   ├── models.py           # ORM models
│   ├── schemas.py          # Pydantic request/response schemas
│   ├── auth.py             # JWT + password hashing + role guards
│   ├── routers/
│   │   ├── auth.py         # /api/auth — login, register, me
│   │   ├── users.py        # /api/users — admin user CRUD
│   │   ├── articles.py     # /api/articles — full CRUD + submit/archive
│   │   ├── categories.py   # /api/categories
│   │   ├── tags.py         # /api/tags
│   │   ├── approvals.py    # /api/approvals — review queue
│   │   ├── comments.py     # /api/articles/{id}/comments, rate, bookmark
│   │   ├── attachments.py  # /api/articles/{id}/attachments
│   │   ├── search.py       # /api/search — full-text + filters
│   │   └── dashboard.py    # /api/dashboard — stats + analytics
│   ├── uploads/            # Uploaded file storage
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── api/axios.js        # Axios instance with JWT interceptor
│   │   ├── context/AuthContext.jsx
│   │   ├── components/         # Layout, Sidebar, StatusBadge, Pagination
│   │   └── pages/
│   │       ├── Login.jsx / Register.jsx
│   │       ├── Dashboard.jsx
│   │       ├── Articles/       # List, Create, Edit, View
│   │       ├── Categories.jsx
│   │       ├── Tags.jsx
│   │       ├── Search.jsx
│   │       ├── ApprovalQueue.jsx
│   │       ├── UserManagement.jsx
│   │       ├── Reports.jsx
│   │       └── Bookmarks.jsx
│   └── package.json
├── database/
│   └── schema.sql
└── README.md
```

---

## Setup & Run

### Backend

```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

API docs available at: http://localhost:8000/docs

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App available at: http://localhost:5173

---

## Demo Credentials

| Role     | Email                  | Password    |
|----------|------------------------|-------------|
| Admin    | admin@ekbms.com        | Admin@123   |
| Author   | author@ekbms.com       | Author@123  |
| Reviewer | reviewer@ekbms.com     | Review@123  |
| Employee | employee@ekbms.com     | Emp@12345   |

---

## API Endpoints

| Method | Endpoint                              | Description              |
|--------|---------------------------------------|--------------------------|
| POST   | /api/auth/register                    | Register user            |
| POST   | /api/auth/login                       | Login                    |
| GET    | /api/auth/me                          | Current user             |
| GET    | /api/articles                         | List articles            |
| POST   | /api/articles                         | Create article           |
| GET    | /api/articles/{id}                    | Get article              |
| PUT    | /api/articles/{id}                    | Update article           |
| DELETE | /api/articles/{id}                    | Delete article           |
| POST   | /api/articles/{id}/submit             | Submit for review        |
| POST   | /api/articles/{id}/archive            | Archive article          |
| GET    | /api/approvals/pending                | Pending review queue     |
| POST   | /api/approvals/{id}/review            | Approve/reject           |
| GET    | /api/search                           | Full-text search         |
| GET    | /api/search/suggestions               | Autocomplete suggestions |
| GET    | /api/categories                       | List categories          |
| POST   | /api/categories                       | Create category          |
| GET    | /api/tags                             | List tags                |
| POST   | /api/tags                             | Create tag               |
| POST   | /api/articles/{id}/comments           | Post comment             |
| POST   | /api/articles/{id}/rate               | Rate article             |
| POST   | /api/articles/{id}/bookmark           | Toggle bookmark          |
| POST   | /api/articles/{id}/attachments        | Upload file              |
| GET    | /api/articles/attachments/{id}/download | Download file          |
| GET    | /api/dashboard/stats                  | Dashboard stats          |
| GET    | /api/dashboard/analytics              | Admin analytics          |
| GET    | /api/users                            | List users (admin)       |
| PUT    | /api/users/{id}                       | Update user (admin)      |

---

## Evaluation Coverage

| Criteria                  | Status |
|---------------------------|--------|
| Frontend Development      | ✅     |
| Backend API Development   | ✅     |
| Database Integration      | ✅     |
| CRUD Functionality        | ✅     |
| Search/Filtering          | ✅     |
| Code Quality & Structure  | ✅     |
| Documentation             | ✅     |
