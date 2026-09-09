from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Optional
import os, shutil

from database import get_db
from core.dependencies import get_current_active_user, get_current_admin_user

router = APIRouter(prefix="/api/publications", tags=["publications"])

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "uploads", "publications")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.get("/categories")
def get_publication_categories(db: Session = Depends(get_db)):
    rows = db.execute(text("SELECT DISTINCT category FROM publications WHERE category IS NOT NULL")).mappings().all()
    categories = [row['category'] for row in rows]
    return {"success": True, "data": categories}

@router.get("/")
def get_publications(db: Session = Depends(get_db)):
    sql = """
        SELECT p.*, u.full_name as uploaded_by_name 
        FROM publications p
        LEFT JOIN users u ON p.uploaded_by = u.id
        ORDER BY p.created_at DESC
    """
    rows = db.execute(text(sql)).mappings().all()
    
    result = []
    for row in rows:
        d = dict(row)
        if d.get("file_path"):
            d["file_url"] = f"/uploads/publications/{d['file_path']}"
        result.append(d)
        
    return {"success": True, "data": result}

@router.post("/")
async def create_publication(
    title: str = Form(...),
    description: Optional[str] = Form(None),
    category: Optional[str] = Form("general"),
    language: Optional[str] = Form("am"),
    status: Optional[str] = Form("published"),
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin_user)
):
    file_path = None
    if file and file.filename:
        file_path = file.filename
        with open(os.path.join(UPLOAD_DIR, file_path), "wb") as f:
            shutil.copyfileobj(file.file, f)

    user_id = current_user.id if not getattr(current_user, 'is_member', False) else None

    db.execute(text("""
        INSERT INTO publications (title, description, category, language, file_path, status, uploaded_by)
        VALUES (:t, :d, :c, :l, :fp, :s, :uid)
    """), {
        "t": title, "d": description, "c": category, "l": language, "fp": file_path, "s": status, "uid": user_id
    })
    db.commit()
    return JSONResponse(status_code=201, content={"success": True, "message": "Publication created"})

@router.get("/{id}")
def get_publication_by_id(id: int, db: Session = Depends(get_db)):
    row = db.execute(text("SELECT * FROM publications WHERE id = :id"), {"id": id}).mappings().first()
    if not row:
        raise HTTPException(status_code=404, detail="Publication not found")
        
    db.execute(text("UPDATE publications SET views = views + 1 WHERE id = :id"), {"id": id})
    db.commit()
    return {"success": True, "data": dict(row)}

@router.put("/{id}")
async def update_publication(
    id: int,
    title: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    category: Optional[str] = Form(None),
    language: Optional[str] = Form(None),
    status: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin_user)
):
    existing = db.execute(text("SELECT * FROM publications WHERE id = :id"), {"id": id}).mappings().first()
    if not existing:
        raise HTTPException(status_code=404, detail="Publication not found")
        
    file_path = existing.get('file_path')
    if file and file.filename:
        file_path = file.filename
        with open(os.path.join(UPLOAD_DIR, file_path), "wb") as f:
            shutil.copyfileobj(file.file, f)

    db.execute(text("""
        UPDATE publications SET 
            title = :t, description = :d, category = :c, language = :l, 
            file_path = :fp, status = :s
        WHERE id = :id
    """), {
        "t": title or existing['title'], "d": description or existing['description'], 
        "c": category or existing['category'], "l": language or existing['language'], 
        "fp": file_path, "s": status or existing['status'], "id": id
    })
    db.commit()
    return {"success": True, "message": "Publication updated successfully"}

@router.delete("/{id}")
def delete_publication(id: int, db: Session = Depends(get_db), current_user = Depends(get_current_admin_user)):
    db.execute(text("DELETE FROM publications WHERE id = :id"), {"id": id})
    db.commit()
    return {"success": True, "message": "Publication deleted successfully"}
