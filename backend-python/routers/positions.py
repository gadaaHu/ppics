from fastapi import APIRouter, Depends, HTTPException, Form
from sqlalchemy.orm import Session
from sqlalchemy import text

from database import get_db
from core.dependencies import get_current_active_user, get_current_admin_user

router = APIRouter(prefix="/api/positions", tags=["positions"])

@router.get("/")
def get_positions(db: Session = Depends(get_db)):
    sql = "SELECT * FROM positions ORDER BY level, sector, position_name"
    rows = db.execute(text(sql)).mappings().all()
    return {"success": True, "data": [dict(r) for r in rows]}

@router.get("/{position_id}")
def get_position(position_id: int, db: Session = Depends(get_db)):
    row = db.execute(text("SELECT * FROM positions WHERE position_id = :id"), {"id": position_id}).mappings().first()
    if not row:
        raise HTTPException(status_code=404, detail="Position not found")
    return {"success": True, "data": dict(row)}

@router.post("/")
def create_position(
    position_name: str = Form(...), 
    level: str = Form(...), 
    sector: str = Form(...), 
    db: Session = Depends(get_db), 
    current_user = Depends(get_current_admin_user)
):
    db.execute(
        text("INSERT INTO positions (position_name, level, sector) VALUES (:name, :lvl, :sec)"), 
        {"name": position_name, "lvl": level, "sec": sector}
    )
    db.commit()
    return {"success": True, "message": "Position created successfully"}

@router.put("/{position_id}")
def update_position(
    position_id: int, 
    position_name: str = Form(...), 
    level: str = Form(...), 
    sector: str = Form(...), 
    db: Session = Depends(get_db), 
    current_user = Depends(get_current_admin_user)
):
    db.execute(
        text("UPDATE positions SET position_name = :name, level = :lvl, sector = :sec WHERE position_id = :id"), 
        {"name": position_name, "lvl": level, "sec": sector, "id": position_id}
    )
    db.commit()
    return {"success": True, "message": "Position updated successfully"}

@router.delete("/{position_id}")
def delete_position(position_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_admin_user)):
    db.execute(text("DELETE FROM positions WHERE position_id = :id"), {"id": position_id})
    db.commit()
    return {"success": True, "message": "Position deleted successfully"}
