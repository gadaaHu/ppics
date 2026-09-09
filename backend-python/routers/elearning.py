from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Optional
import os, shutil

from database import get_db
from core.dependencies import get_current_active_user, get_current_admin_user

router = APIRouter(prefix="/api/elearning", tags=["elearning"])

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "uploads", "elearning")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.get("/categories")
def get_elearning_categories(db: Session = Depends(get_db)):
    rows = db.execute(text("SELECT DISTINCT category FROM e_learning WHERE category IS NOT NULL")).mappings().all()
    categories = [row['category'] for row in rows]
    return {"success": True, "data": categories}

@router.get("/")
def get_elearning(db: Session = Depends(get_db)):
    sql = """
        SELECT e.*, u.full_name as uploaded_by_name 
        FROM e_learning e
        LEFT JOIN users u ON e.uploaded_by = u.id
        ORDER BY e.created_at DESC
    """
    rows = db.execute(text(sql)).mappings().all()
    
    result = []
    for row in rows:
        d = dict(row)
        if d.get("file_path"):
            d["file_url"] = f"/uploads/elearning/{d['file_path']}"
        if d.get("thumbnail"):
            d["thumbnail_url"] = f"/uploads/elearning/{d['thumbnail']}"
        result.append(d)
        
    return {"success": True, "data": result}

@router.post("/")
async def create_elearning(
    title: str = Form(...),
    description: Optional[str] = Form(None),
    category: Optional[str] = Form("general"),
    language: Optional[str] = Form("am"),
    material_type: Optional[str] = Form("document"),
    duration: Optional[str] = Form(None),
    level: Optional[str] = Form("beginner"),
    author: Optional[str] = Form(None),
    tags: Optional[str] = Form(None),
    video_url: Optional[str] = Form(None),
    status: Optional[str] = Form("published"),
    file: Optional[UploadFile] = File(None),
    thumbnail: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    file_path = None
    if file and file.filename:
        file_path = file.filename
        with open(os.path.join(UPLOAD_DIR, file_path), "wb") as f:
            shutil.copyfileobj(file.file, f)
            
    thumb_path = None
    if thumbnail and thumbnail.filename:
        thumb_path = thumbnail.filename
        with open(os.path.join(UPLOAD_DIR, thumb_path), "wb") as f:
            shutil.copyfileobj(thumbnail.file, f)

    user_id = current_user.id if not getattr(current_user, 'is_member', False) else None

    db.execute(text("""
        INSERT INTO e_learning (
            title, description, category, language, material_type, 
            file_path, thumbnail, duration, level, author, tags, video_url, status, uploaded_by
        ) VALUES (
            :t, :d, :c, :l, :mt, :fp, :th, :dur, :lvl, :auth, :tags, :vid, :s, :uid
        )
    """), {
        "t": title, "d": description, "c": category, "l": language, "mt": material_type,
        "fp": file_path, "th": thumb_path, "dur": duration, "lvl": level, "auth": author,
        "tags": tags, "vid": video_url, "s": status, "uid": user_id
    })
    db.commit()
    return JSONResponse(status_code=201, content={"success": True, "message": "E-Learning material created"})

@router.get("/{id}")
def get_elearning_by_id(id: int, db: Session = Depends(get_db)):
    row = db.execute(text("SELECT * FROM e_learning WHERE id = :id"), {"id": id}).mappings().first()
    if not row:
        raise HTTPException(status_code=404, detail="Material not found")
        
    db.execute(text("UPDATE e_learning SET views = views + 1 WHERE id = :id"), {"id": id})
    db.commit()
    return {"success": True, "data": dict(row)}

@router.put("/{id}")
async def update_elearning(
    id: int,
    title: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    category: Optional[str] = Form(None),
    language: Optional[str] = Form(None),
    material_type: Optional[str] = Form(None),
    duration: Optional[str] = Form(None),
    level: Optional[str] = Form(None),
    author: Optional[str] = Form(None),
    tags: Optional[str] = Form(None),
    video_url: Optional[str] = Form(None),
    status: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    thumbnail: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    existing = db.execute(text("SELECT * FROM e_learning WHERE id = :id"), {"id": id}).mappings().first()
    if not existing:
        raise HTTPException(status_code=404, detail="Material not found")
        
    file_path = existing.get('file_path')
    if file and file.filename:
        file_path = file.filename
        with open(os.path.join(UPLOAD_DIR, file_path), "wb") as f:
            shutil.copyfileobj(file.file, f)
            
    thumb_path = existing.get('thumbnail')
    if thumbnail and thumbnail.filename:
        thumb_path = thumbnail.filename
        with open(os.path.join(UPLOAD_DIR, thumb_path), "wb") as f:
            shutil.copyfileobj(thumbnail.file, f)

    db.execute(text("""
        UPDATE e_learning SET 
            title = :t, description = :d, category = :c, language = :l, material_type = :mt, 
            file_path = :fp, thumbnail = :th, duration = :dur, level = :lvl, author = :auth, 
            tags = :tags, video_url = :vid, status = :s
        WHERE id = :id
    """), {
        "t": title or existing['title'], "d": description or existing['description'], 
        "c": category or existing['category'], "l": language or existing['language'], 
        "mt": material_type or existing['material_type'],
        "fp": file_path, "th": thumb_path, 
        "dur": duration or existing['duration'], "lvl": level or existing['level'], 
        "auth": author or existing['author'], "tags": tags or existing['tags'], 
        "vid": video_url or existing['video_url'], "s": status or existing['status'],
        "id": id
    })
    db.commit()
    return {"success": True, "message": "E-Learning material updated"}


@router.delete("/{id}")
def delete_elearning(id: int, db: Session = Depends(get_db), current_user = Depends(get_current_admin_user)):
    db.execute(text("DELETE FROM e_learning WHERE id = :id"), {"id": id})
    db.commit()
    return {"success": True, "message": "Deleted successfully"}
