from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Optional
import os, shutil

from database import get_db
from core.dependencies import get_current_active_user, get_current_admin_user

router = APIRouter(prefix="/api/events", tags=["events"])

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "uploads", "events")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.get("/")
def get_events(db: Session = Depends(get_db)):
    sql = "SELECT * FROM events ORDER BY date DESC"
    rows = db.execute(text(sql)).mappings().all()
    
    result = []
    for row in rows:
        d = dict(row)
        if d.get("photo"):
            d["photo_url"] = f"/uploads/events/{d['photo']}"
        result.append(d)
        
    return {"success": True, "data": result}

@router.post("/")
async def create_event(
    title: str = Form(...),
    description: Optional[str] = Form(None),
    date: str = Form(...),
    venue: Optional[str] = Form(None),
    event_type: Optional[str] = Form(None),
    photo: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin_user)
):
    photo_path = None
    if photo and photo.filename:
        photo_path = photo.filename
        with open(os.path.join(UPLOAD_DIR, photo_path), "wb") as f:
            shutil.copyfileobj(photo.file, f)

    db.execute(text("""
        INSERT INTO events (title, description, date, venue, event_type, photo)
        VALUES (:t, :d, :dt, :v, :et, :p)
    """), {
        "t": title, "d": description, "dt": date, "v": venue, "et": event_type, "p": photo_path
    })
    db.commit()
    return JSONResponse(status_code=201, content={"success": True, "message": "Event created"})

@router.delete("/{id}")
def delete_event(id: int, db: Session = Depends(get_db), current_user = Depends(get_current_admin_user)):
    db.execute(text("DELETE FROM events WHERE id = :id"), {"id": id})
    db.commit()
    return {"success": True, "message": "Event deleted successfully"}
