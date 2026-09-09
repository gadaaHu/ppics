from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Optional, List
import os, shutil

from database import get_db
from core.dependencies import get_current_active_user, get_current_admin_user

router = APIRouter(prefix="/api/gallery", tags=["gallery"])

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "uploads", "gallery")
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.get("/")
def get_gallery(search: Optional[str] = None, date: Optional[str] = None, db: Session = Depends(get_db)):
    conditions = []
    params = {}
    if search:
        conditions.append("title LIKE :s")
        params["s"] = f"%{search}%"
    if date:
        conditions.append("event_date = :d")
        params["d"] = date

    where = f"WHERE {' AND '.join(conditions)}" if conditions else ""
    rows = db.execute(
        text(f"SELECT * FROM gallery {where} ORDER BY event_date DESC, created_at DESC"),
        params
    ).mappings().all()
    return {"success": True, "data": [dict(r) for r in rows]}


@router.get("/{gallery_id}")
def get_gallery_by_id(gallery_id: int, db: Session = Depends(get_db)):
    row = db.execute(text("SELECT * FROM gallery WHERE id = :id"), {"id": gallery_id}).mappings().first()
    if not row:
        raise HTTPException(status_code=404, detail="Image not found")
    return {"success": True, "data": dict(row)}


@router.post("/upload")
async def upload_gallery(
    title: str = Form(...),
    event_date: str = Form(...),
    images: List[UploadFile] = File(...),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin_user)
):
    if not images:
        raise HTTPException(status_code=400, detail="No images uploaded")

    uploaded = []
    for img in images:
        if img.filename:
            with open(os.path.join(UPLOAD_DIR, img.filename), "wb") as f:
                shutil.copyfileobj(img.file, f)
            result = db.execute(text("""
                INSERT INTO gallery (title, image, event_date, created_at) VALUES (:t, :img, :ed, NOW())
            """), {"t": title, "img": img.filename, "ed": event_date})
            db.commit()
            uploaded.append({"id": result.lastrowid, "filename": img.filename, "originalName": img.filename})

    return JSONResponse(status_code=201, content={
        "success": True, "data": uploaded,
        "message": f"{len(uploaded)} image(s) uploaded successfully"
    })


@router.put("/{gallery_id}")
def update_gallery(
    gallery_id: int,
    title: Optional[str] = Form(None),
    event_date: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin_user)
):
    existing = db.execute(text("SELECT * FROM gallery WHERE id = :id"), {"id": gallery_id}).mappings().first()
    if not existing:
        raise HTTPException(status_code=404, detail="Image not found")

    db.execute(text("UPDATE gallery SET title = :t, event_date = :ed WHERE id = :id"), {
        "t": title or existing["title"],
        "ed": event_date or existing["event_date"],
        "id": gallery_id
    })
    db.commit()
    row = db.execute(text("SELECT * FROM gallery WHERE id = :id"), {"id": gallery_id}).mappings().first()
    return {"success": True, "data": dict(row), "message": "Image updated successfully"}


@router.delete("/by-date/{date}")
def delete_gallery_by_date(date: str, db: Session = Depends(get_db), current_user = Depends(get_current_admin_user)):
    images = db.execute(text("SELECT * FROM gallery WHERE event_date = :d"), {"d": date}).mappings().all()
    for img in images:
        fp = os.path.join(UPLOAD_DIR, img["image"])
        if os.path.exists(fp):
            os.remove(fp)
    db.execute(text("DELETE FROM gallery WHERE event_date = :d"), {"d": date})
    db.commit()
    return {"success": True, "message": f"{len(images)} image(s) deleted successfully"}


@router.delete("/{gallery_id}")
def delete_gallery(gallery_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_admin_user)):
    row = db.execute(text("SELECT * FROM gallery WHERE id = :id"), {"id": gallery_id}).mappings().first()
    if not row:
        raise HTTPException(status_code=404, detail="Image not found")
    fp = os.path.join(UPLOAD_DIR, row["image"]) if row.get("image") else None
    if fp and os.path.exists(fp):
        os.remove(fp)
    db.execute(text("DELETE FROM gallery WHERE id = :id"), {"id": gallery_id})
    db.commit()
    return {"success": True, "message": "Image deleted successfully"}
