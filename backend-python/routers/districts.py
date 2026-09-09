from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Optional

from database import get_db
from core.dependencies import get_current_active_user, get_current_admin_user

router = APIRouter(prefix="/api/districts", tags=["districts"])

@router.get("/")
def get_districts(db: Session = Depends(get_db)):
    rows = db.execute(text("SELECT * FROM districts ORDER BY district_name")).mappings().all()
    return {"success": True, "data": [dict(r) for r in rows]}

@router.get("/{district_id}")
def get_district(district_id: int, db: Session = Depends(get_db)):
    row = db.execute(text("SELECT * FROM districts WHERE district_id = :id"), {"id": district_id}).mappings().first()
    if not row:
        raise HTTPException(status_code=404, detail="District not found")
    return {"success": True, "data": dict(row)}

@router.post("/")
def create_district(district_name: str, db: Session = Depends(get_db), current_user = Depends(get_current_admin_user)):
    if not district_name:
        raise HTTPException(status_code=400, detail="District name is required")
    
    result = db.execute(text("INSERT INTO districts (district_name) VALUES (:name)"), {"name": district_name})
    db.commit()
    return {"success": True, "message": "District created successfully"}

@router.put("/{district_id}")
def update_district(district_id: int, district_name: str, db: Session = Depends(get_db), current_user = Depends(get_current_admin_user)):
    db.execute(text("UPDATE districts SET district_name = :name WHERE district_id = :id"), {"name": district_name, "id": district_id})
    db.commit()
    return {"success": True, "message": "District updated successfully"}

@router.delete("/{district_id}")
def delete_district(district_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_admin_user)):
    db.execute(text("DELETE FROM districts WHERE district_id = :id"), {"id": district_id})
    db.commit()
    return {"success": True, "message": "District deleted successfully"}
