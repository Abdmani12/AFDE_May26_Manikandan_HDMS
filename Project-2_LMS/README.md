# Bibliotheca — Library Management System
### Phase 1 | Full-Stack Web Application

A modern Library Management System built with **React** (frontend) and **FastAPI** (backend), featuring a premium "Bibliotheca" UI design.

---

## Tech Stack

| Layer      | Technology         |
|------------|--------------------|
| Frontend   | React 18 + Vite    |
| Backend    | Python FastAPI     |
| Database   | SQLite             |
| Styling    | Custom CSS         |
| Icons      | Lucide React       |
| HTTP       | Axios              |
| Routing    | React Router DOM   |

---

## Project Structure

```
Project-2/
├── backend/
│   ├── main.py          # FastAPI app entry point
│   ├── database.py      # SQLite connection & session
│   ├── models.py        # SQLAlchemy ORM models
│   ├── schemas.py       # Pydantic request/response schemas
│   ├── crud.py          # Database CRUD operations
│   ├── routers/
│   │   ├── books.py         # Book API routes
│   │   ├── borrowers.py     # Borrower API routes
│   │   └── transactions.py  # Borrow/Return/Search routes
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Modal.jsx
│   │   │   └── Toast.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Books.jsx
│   │   │   ├── Borrowers.jsx
│   │   │   ├── Transactions.jsx
│   │   │   └── Search.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   └── package.json
├── start_backend.bat
├── start_frontend.bat
└── README.md
```

---

## Running the Application

### Step 1 — Start the Backend
Double-click `start_backend.bat` or run:
```bash
cd backend
"C:\Program Files\Python310\python.exe" -m uvicorn main:app --reload --port 8000
```
Backend runs at: **http://localhost:8000**  
API Docs (Swagger): **http://localhost:8000/docs**

### Step 2 — Start the Frontend
Double-click `start_frontend.bat` or run:
```bash
cd frontend
npm run dev
```
Frontend runs at: **http://localhost:5173**

---

## API Endpoints

### Books
| Method | Endpoint        | Description       |
|--------|-----------------|-------------------|
| GET    | /books/         | List all books    |
| GET    | /books/{id}     | Get book by ID    |
| POST   | /books/         | Add new book      |
| PUT    | /books/{id}     | Update book       |
| DELETE | /books/{id}     | Delete book       |

### Borrowers
| Method | Endpoint            | Description          |
|--------|---------------------|----------------------|
| GET    | /borrowers/         | List all members     |
| POST   | /borrowers/         | Register member      |
| PUT    | /borrowers/{id}     | Update member        |
| DELETE | /borrowers/{id}     | Remove member        |

### Transactions
| Method | Endpoint        | Description            |
|--------|-----------------|------------------------|
| GET    | /transactions   | View all transactions  |
| POST   | /borrow         | Borrow a book          |
| POST   | /return         | Return a book          |
| GET    | /search?q=...   | Search books           |

---

## Features

- **Dashboard** — Live stats (total/available/borrowed books, members), category breakdown, recent transactions
- **Books** — Grid & list views, add/edit/delete, category color-coding
- **Members** — Member cards with avatar initials, full CRUD
- **Borrow/Return** — Simple workflow with dropdown selectors, transaction history with tabs
- **Search** — Hero search bar with keyword suggestions and category filters

---

## Database Schema

### Books
| Column              | Type    |
|---------------------|---------|
| book_id             | Integer (PK) |
| title               | String  |
| author              | String  |
| category            | String  |
| isbn                | String (unique) |
| availability_status | String  |

### Borrowers
| Column        | Type    |
|---------------|---------|
| borrower_id   | Integer (PK) |
| borrower_name | String  |
| email         | String (unique) |
| phone         | String  |

### Transactions
| Column         | Type     |
|----------------|----------|
| transaction_id | Integer (PK) |
| book_id        | Integer (FK) |
| borrower_id    | Integer (FK) |
| borrow_date    | DateTime |
| return_date    | DateTime (nullable) |
