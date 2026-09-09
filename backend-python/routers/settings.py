from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Dict, Any

from database import get_db
from core.dependencies import get_current_active_user, get_current_admin_user

router = APIRouter(prefix="/api/settings", tags=["settings"])


@router.get("/")
def get_settings(db: Session = Depends(get_db)):
    rows = db.execute(text("SELECT * FROM settings")).mappings().all()
    settings_map = {r["setting_key"]: r["setting_value"] for r in rows}
    return {"success": True, "data": settings_map}


@router.put("/")
def update_settings(settings: Dict[str, Any], db: Session = Depends(get_db), current_user = Depends(get_current_admin_user)):
    for key, value in settings.items():
        db.execute(text("""
            INSERT INTO settings (setting_key, setting_value) VALUES (:k, :v)
            ON DUPLICATE KEY UPDATE setting_value = :v
        """), {"k": key, "v": value})
    db.commit()
    return {"success": True, "message": "Settings updated successfully"}
