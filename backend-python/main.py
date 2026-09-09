import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from database import engine, Base
from routers import (
    auth, members, news, gallery, payments, evaluations, settings,
    attendance, cooperatives, districts, documents, elearning, 
    events, families, hierarchy, plans, positions, publications, users, member_profile
)

# Create tables if they don't exist
Base.metadata.create_all(bind=engine)

app = FastAPI(title="ppics API", version="2.0.0", description="ICSPP Management System - Python/FastAPI Backend")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8082", "http://localhost:8000", "http://127.0.0.1:8082", "http://localhost:3000"], 
    allow_origin_regex=".*", # This allows any origin safely with credentials
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static file serving for uploads
UPLOADS_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOADS_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOADS_DIR), name="uploads")

# Register all routers
app.include_router(auth.router)
app.include_router(members.router)
app.include_router(news.router)
app.include_router(gallery.router)
app.include_router(payments.router)
app.include_router(evaluations.router)
app.include_router(settings.router)

# New routers
app.include_router(attendance.router)
app.include_router(cooperatives.router)
app.include_router(districts.router)
app.include_router(documents.router)
app.include_router(elearning.router)
app.include_router(events.router)
app.include_router(families.router)
app.include_router(hierarchy.router)
app.include_router(plans.router)
app.include_router(positions.router)
app.include_router(publications.router)
app.include_router(users.router)
app.include_router(member_profile.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the ppics API v2.0 (Python/FastAPI)", "docs": "/docs"}
