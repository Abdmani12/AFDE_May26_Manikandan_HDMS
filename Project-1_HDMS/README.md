# Helpdesk Ticket Management System (HDMS)

A full-stack web application for managing internal IT support tickets.

## Tech Stack

| Layer    | Technology       |
|----------|-----------------|
| Frontend | React + Vite     |
| Backend  | Python FastAPI   |
| Database | SQLite           |
| API Test | Postman          |
| Version  | Git / GitHub     |

## Features

- Create, view, update, delete support tickets
- Filter tickets by status, category, priority
- Keyword search across tickets
- Dashboard with live stats summary
- Responsive, clean UI

## Project Structure

```
project-1/
├── frontend/          # React + Vite app
│   └── src/
│       ├── components/    # Navbar, TicketTable, StatusBadge
│       ├── pages/         # Dashboard, CreateTicket, TicketList, TicketDetails, EditTicket, SearchFilter
│       └── services/      # api.js (Axios)
├── backend/           # FastAPI app
│   ├── main.py
│   ├── database.py
│   ├── models.py
│   ├── schemas.py
│   ├── crud.py
│   └── routers/tickets.py
├── database/
│   └── schema.sql
└── screenshots/
```

## Setup Instructions

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
uvicorn main:app --reload
```

API runs at: http://localhost:8000  
Swagger docs: http://localhost:8000/docs

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs at: http://localhost:5173

## API Endpoints

| Method | Endpoint             | Description           |
|--------|---------------------|-----------------------|
| GET    | /tickets/           | Get all tickets       |
| GET    | /tickets/{id}       | Get ticket by ID      |
| POST   | /tickets/           | Create ticket         |
| PUT    | /tickets/{id}       | Update ticket         |
| DELETE | /tickets/{id}       | Delete ticket         |
| GET    | /tickets/search     | Search/filter tickets |

## Database Schema

| Column           | Type     |
|-----------------|----------|
| ticket_id        | INTEGER  |
| employee_name    | VARCHAR  |
| department       | VARCHAR  |
| issue_category   | VARCHAR  |
| description      | TEXT     |
| priority         | VARCHAR  |
| status           | VARCHAR  |
| resolution_notes | TEXT     |
| created_at       | DATETIME |
