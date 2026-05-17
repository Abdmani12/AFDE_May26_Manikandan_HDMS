from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from database import engine, Base, SessionLocal
import models
from auth import hash_password
from routers import auth, users, articles, categories, tags, approvals, comments, attachments, search, dashboard

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Enterprise Knowledge Base Management System", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded files
uploads_dir = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(uploads_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

# Register routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(articles.router)
app.include_router(categories.router)
app.include_router(tags.router)
app.include_router(approvals.router)
app.include_router(comments.router)
app.include_router(attachments.router)
app.include_router(search.router)
app.include_router(dashboard.router)


def seed_data():
    db = SessionLocal()
    try:
        if db.query(models.User).count() > 0:
            return

        # Seed users
        users_data = [
            {"name": "Admin User", "email": "admin@ekbms.com", "password": "Admin@123", "role": models.RoleEnum.admin},
            {"name": "Alice Author", "email": "author@ekbms.com", "password": "Author@123", "role": models.RoleEnum.author},
            {"name": "Bob Reviewer", "email": "reviewer@ekbms.com", "password": "Review@123", "role": models.RoleEnum.reviewer},
            {"name": "Charlie Employee", "email": "employee@ekbms.com", "password": "Emp@12345", "role": models.RoleEnum.employee},
        ]
        created_users = []
        for u in users_data:
            user = models.User(
                name=u["name"], email=u["email"],
                password_hash=hash_password(u["password"]), role=u["role"]
            )
            db.add(user)
            created_users.append(user)
        db.flush()

        # Seed categories
        cats = [
            {"name": "HR Policies", "description": "Human resources policies and guidelines"},
            {"name": "IT Support", "description": "Technical support documentation"},
            {"name": "Training Materials", "description": "Employee training resources"},
            {"name": "Finance", "description": "Finance policies and procedures"},
            {"name": "Operations", "description": "Operational procedures and SOPs"},
            {"name": "Infrastructure", "description": "IT infrastructure documentation"},
        ]
        created_cats = []
        for c in cats:
            cat = models.Category(**c)
            db.add(cat)
            created_cats.append(cat)
        db.flush()

        # Seed tags
        tag_names = ["FAQ", "SOP", "Policy", "Troubleshooting", "Onboarding", "Security", "Network", "HR", "Finance"]
        created_tags = []
        for name in tag_names:
            tag = models.Tag(name=name)
            db.add(tag)
            created_tags.append(tag)
        db.flush()

        # Seed articles
        articles_data = [
            {
                "title": "Employee Onboarding Guide",
                "content": """<h2>Welcome to the Company!</h2>
<p>This guide covers everything you need to know as a new employee.</p>
<h3>Day 1 Checklist</h3>
<ul>
<li>Complete HR paperwork</li>
<li>Set up your workstation</li>
<li>Meet your team</li>
<li>Review company policies</li>
</ul>
<h3>IT Setup</h3>
<p>Contact IT Support at support@company.com to set up your accounts and devices.</p>""",
                "description": "Comprehensive onboarding guide for new employees",
                "category_id": created_cats[0].id,
                "author_id": created_users[1].id,
                "status": models.ArticleStatus.approved,
                "views": 142,
                "tags": [created_tags[4].id, created_tags[2].id],
            },
            {
                "title": "VPN Troubleshooting Guide",
                "content": """<h2>VPN Connection Issues</h2>
<p>If you are having trouble connecting to the company VPN, follow these steps.</p>
<h3>Common Issues</h3>
<ol>
<li><strong>Check your internet connection</strong> – Ensure you have a stable internet connection.</li>
<li><strong>Restart the VPN client</strong> – Close and reopen the VPN application.</li>
<li><strong>Clear VPN cache</strong> – Navigate to settings and clear cached credentials.</li>
<li><strong>Check credentials</strong> – Ensure your username and password are correct.</li>
</ol>
<h3>Contact Support</h3>
<p>If the issue persists, contact IT Support with your error message and employee ID.</p>""",
                "description": "Step-by-step guide for resolving VPN connectivity problems",
                "category_id": created_cats[1].id,
                "author_id": created_users[1].id,
                "status": models.ArticleStatus.approved,
                "views": 89,
                "tags": [created_tags[3].id, created_tags[6].id],
            },
            {
                "title": "Leave Policy 2024",
                "content": """<h2>Leave Policy</h2>
<p>This document outlines the company's leave policy for all employees.</p>
<h3>Types of Leave</h3>
<ul>
<li><strong>Annual Leave:</strong> 20 days per year</li>
<li><strong>Sick Leave:</strong> 10 days per year</li>
<li><strong>Maternity Leave:</strong> 26 weeks</li>
<li><strong>Paternity Leave:</strong> 2 weeks</li>
</ul>
<h3>Leave Application Process</h3>
<p>Submit leave requests through the HR portal at least 3 days in advance.</p>""",
                "description": "Company leave policy including annual, sick, and special leaves",
                "category_id": created_cats[0].id,
                "author_id": created_users[1].id,
                "status": models.ArticleStatus.approved,
                "views": 210,
                "tags": [created_tags[2].id, created_tags[7].id],
            },
            {
                "title": "Network Security Best Practices",
                "content": """<h2>Network Security Guidelines</h2>
<p>Follow these best practices to maintain network security.</p>
<h3>Password Policy</h3>
<ul>
<li>Use minimum 12 characters</li>
<li>Include uppercase, lowercase, numbers and symbols</li>
<li>Change passwords every 90 days</li>
</ul>
<h3>Device Security</h3>
<p>Always lock your workstation when away. Enable full-disk encryption on all laptops.</p>""",
                "description": "Security guidelines for protecting company network and data",
                "category_id": created_cats[5].id,
                "author_id": created_users[1].id,
                "status": models.ArticleStatus.pending,
                "views": 0,
                "tags": [created_tags[5].id, created_tags[6].id],
            },
            {
                "title": "Expense Reimbursement Procedure",
                "content": """<h2>Expense Reimbursement</h2>
<p>This document explains how to submit expense reimbursement claims.</p>
<h3>Eligible Expenses</h3>
<ul>
<li>Travel expenses (flights, hotels, meals)</li>
<li>Client entertainment (with manager approval)</li>
<li>Training and certification fees</li>
</ul>
<h3>Submission Process</h3>
<ol>
<li>Collect all receipts</li>
<li>Submit via the Finance portal within 30 days</li>
<li>Manager approval required for amounts over ₹5000</li>
</ol>""",
                "description": "How to submit and process expense reimbursement claims",
                "category_id": created_cats[3].id,
                "author_id": created_users[1].id,
                "status": models.ArticleStatus.approved,
                "views": 67,
                "tags": [created_tags[8].id, created_tags[1].id],
            },
        ]

        for art_data in articles_data:
            tag_ids = art_data.pop("tags", [])
            article = models.Article(**art_data)
            db.add(article)
            db.flush()
            for tid in tag_ids:
                db.add(models.ArticleTag(article_id=article.id, tag_id=tid))

        db.commit()
        print("Seed data inserted successfully")
    except Exception as e:
        db.rollback()
        print(f"Seed error: {e}")
    finally:
        db.close()


@app.on_event("startup")
def startup():
    seed_data()


@app.get("/")
def root():
    return {"message": "EKBMS API is running", "docs": "/docs"}
