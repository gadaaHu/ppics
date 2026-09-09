from fastapi import APIRouter, Depends, HTTPException, Form
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Optional

from database import get_db
from core.dependencies import get_current_active_user, get_current_admin_user

router = APIRouter(prefix="/api/families", tags=["families"])

@router.get("/")
def get_families(db: Session = Depends(get_db)):
    sql = """
        SELECT f.*, c.cooperative_name 
        FROM families f 
        LEFT JOIN cooperatives c ON f.cooperative_id = c.cooperative_id 
        ORDER BY c.cooperative_name, f.family_name
    """
    rows = db.execute(text(sql)).mappings().all()
    return {"success": True, "data": [dict(r) for r in rows]}

@router.get("/{family_id}")
def get_family(family_id: int, db: Session = Depends(get_db)):
    row = db.execute(text("SELECT * FROM families WHERE family_id = :id"), {"id": family_id}).mappings().first()
    if not row:
        raise HTTPException(status_code=404, detail="Family not found")
    return {"success": True, "data": dict(row)}

@router.post("/")
def create_family(family_name: str = Form(...), cooperative_id: int = Form(...), db: Session = Depends(get_db), current_user = Depends(get_current_admin_user)):
    db.execute(
        text("INSERT INTO families (family_name, cooperative_id) VALUES (:name, :cid)"), 
        {"name": family_name, "cid": cooperative_id}
    )
    db.commit()
    return {"success": True, "message": "Family created successfully"}

@router.put("/{family_id}")
def update_family(family_id: int, family_name: str = Form(...), cooperative_id: int = Form(...), db: Session = Depends(get_db), current_user = Depends(get_current_admin_user)):
    db.execute(
        text("UPDATE families SET family_name = :name, cooperative_id = :cid WHERE family_id = :id"), 
        {"name": family_name, "cid": cooperative_id, "id": family_id}
    )
    db.commit()
    return {"success": True, "message": "Family updated successfully"}

@router.delete("/{family_id}")
def delete_family(family_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_admin_user)):
    db.execute(text("DELETE FROM families WHERE family_id = :id"), {"id": family_id})
    db.commit()
    return {"success": True, "message": "Family deleted successfully"}
