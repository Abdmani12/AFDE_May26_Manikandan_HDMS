from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import tickets, auth
from routers import analytics, etl as etl_router

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Helpdesk Ticket Management System",
    description="REST API for managing internal IT support tickets with ETL analytics",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(tickets.router)
app.include_router(auth.router)
app.include_router(analytics.router)
app.include_router(etl_router.router)


@app.get("/")
def root():
    return {"message": "Helpdesk Ticket Management System API", "status": "running"}
