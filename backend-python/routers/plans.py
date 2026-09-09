from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Optional
import os, shutil

from database import get_db
from core.dependencies import get_current_active_user, get_current_admin_user

router = APIRouter(prefix="/api/plans", tags=["plans"])

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "uploads", "plans")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.get("/")
def get_plans(db: Session = Depends(get_db)):
    sql = """
        SELECT p.*, f.family_name, dt.name as document_type 
        FROM plans p 
        LEFT JOIN families f ON p.family_id = f.family_id 
        LEFT JOIN document_type dt ON p.document_type_id = dt.id 
        ORDER BY p.created_at DESC
    """
    rows = db.execute(text(sql)).mappings().all()
    
    # Format response
    result = []
    for row in rows:
        d = dict(row)
        if d.get("file_path"):
            d["file_url"] = f"/uploads/plans/{d['file_path']}"
        result.append(d)
        
    return {"success": True, "data": result}

@router.get("/{plan_id}")
def get_plan(plan_id: int, db: Session = Depends(get_db)):
    sql = """
        SELECT p.*, f.family_name, dt.name as document_type 
        FROM plans p 
        LEFT JOIN families f ON p.family_id = f.family_id 
        LEFT JOIN document_type dt ON p.document_type_id = dt.id 
        WHERE p.id = :id
    """
    row = db.execute(text(sql), {"id": plan_id}).mappings().first()
    if not row:
        raise HTTPException(status_code=404, detail="Plan not found")
    return {"success": True, "data": dict(row)}

@router.post("/")
async def create_plan(
    title: str = Form(...),
    description: Optional[str] = Form(None),
    year: Optional[int] = Form(None),
    document_type_id: Optional[int] = Form(None),
    family_id: Optional[int] = Form(None),
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    file_path = None
    if file and file.filename:
        file_path = file.filename
        with open(os.path.join(UPLOAD_DIR, file_path), "wb") as f:
            shutil.copyfileobj(file.file, f)

    db.execute(text("""
        INSERT INTO plans (title, description, year, document_type_id, family_id, file_path)
        VALUES (:t, :d, :y, :dt, :f, :fp)
    """), {
        "t": title, "d": description, "y": year, 
        "dt": document_type_id, "f": family_id, "fp": file_path
    })
    db.commit()
    return JSONResponse(status_code=201, content={"success": True, "message": "Plan created successfully"})

@router.put("/{plan_id}")
async def update_plan(
    plan_id: int,
    title: str = Form(...),
    description: Optional[str] = Form(None),
    year: Optional[int] = Form(None),
    document_type_id: Optional[int] = Form(None),
    family_id: Optional[int] = Form(None),
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    existing = db.execute(text("SELECT file_path FROM plans WHERE id = :id"), {"id": plan_id}).mappings().first()
    if not existing:
        raise HTTPException(status_code=404, detail="Plan not found")

    file_path = existing.get("file_path")
    if file and file.filename:
        file_path = file.filename
        with open(os.path.join(UPLOAD_DIR, file_path), "wb") as f:
            shutil.copyfileobj(file.file, f)

    db.execute(text("""
        UPDATE plans SET title = :t, description = :d, year = :y, 
        document_type_id = :dt, family_id = :f, file_path = :fp 
        WHERE id = :id
    """), {
        "t": title, "d": description, "y": year, 
        "dt": document_type_id, "f": family_id, "fp": file_path, "id": plan_id
    })
    db.commit()
    return {"success": True, "message": "Plan updated successfully"}

@router.delete("/{plan_id}")
def delete_plan(plan_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_admin_user)):
    db.execute(text("DELETE FROM plans WHERE id = :id"), {"id": plan_id})
    db.commit()
    return {"success": True, "message": "Plan deleted successfully"}
