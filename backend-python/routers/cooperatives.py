from fastapi import APIRouter, Depends, HTTPException, Form
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Optional

from database import get_db
from core.dependencies import get_current_active_user, get_current_admin_user

router = APIRouter(prefix="/api/cooperatives", tags=["cooperatives"])

@router.get("/")
def get_cooperatives(db: Session = Depends(get_db)):
    sql = """
        SELECT c.*, d.district_name 
        FROM cooperatives c 
        LEFT JOIN districts d ON c.district_id = d.district_id 
        ORDER BY d.district_name, c.cooperative_name
    """
    rows = db.execute(text(sql)).mappings().all()
    return {"success": True, "data": [dict(r) for r in rows]}

@router.get("/{cooperative_id}")
def get_cooperative(cooperative_id: int, db: Session = Depends(get_db)):
    row = db.execute(text("SELECT * FROM cooperatives WHERE cooperative_id = :id"), {"id": cooperative_id}).mappings().first()
    if not row:
        raise HTTPException(status_code=404, detail="Cooperative not found")
    return {"success": True, "data": dict(row)}

@router.post("/")
def create_cooperative(cooperative_name: str = Form(...), district_id: int = Form(...), db: Session = Depends(get_db), current_user = Depends(get_current_admin_user)):
    db.execute(
        text("INSERT INTO cooperatives (cooperative_name, district_id) VALUES (:name, :did)"), 
        {"name": cooperative_name, "did": district_id}
    )
    db.commit()
    return {"success": True, "message": "Cooperative created successfully"}

@router.put("/{cooperative_id}")
def update_cooperative(cooperative_id: int, cooperative_name: str = Form(...), district_id: int = Form(...), db: Session = Depends(get_db), current_user = Depends(get_current_admin_user)):
    db.execute(
        text("UPDATE cooperatives SET cooperative_name = :name, district_id = :did WHERE cooperative_id = :id"), 
        {"name": cooperative_name, "did": district_id, "id": cooperative_id}
    )
    db.commit()
    return {"success": True, "message": "Cooperative updated successfully"}

@router.delete("/{cooperative_id}")
def delete_cooperative(cooperative_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_admin_user)):
    db.execute(text("DELETE FROM cooperatives WHERE cooperative_id = :id"), {"id": cooperative_id})
    db.commit()
    return {"success": True, "message": "Cooperative deleted successfully"}
