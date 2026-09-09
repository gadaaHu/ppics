from fastapi import APIRouter, Depends, HTTPException, Form, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Optional
import os
import shutil

from database import get_db
from core.dependencies import get_current_active_user, get_current_admin_user, get_current_user

router = APIRouter(prefix="/api/documents", tags=["documents"])

UPLOAD_DIR = "uploads/documents"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.get("/types")
def get_document_types(db: Session = Depends(get_db)):
    sql = "SELECT * FROM document_type ORDER BY name"
    rows = db.execute(text(sql)).mappings().all()
    return {"success": True, "data": [dict(r) for r in rows]}

@router.post("/types")
def create_document_type(
    name: str = Form(...), 
    db: Session = Depends(get_db), 
    current_user = Depends(get_current_admin_user)
):
    db.execute(text("INSERT INTO document_type (name) VALUES (:name)"), {"name": name})
    db.commit()
    return {"success": True, "message": "Document type created successfully"}

@router.put("/types/{type_id}")
def update_document_type(
    type_id: int, 
    name: str = Form(...), 
    db: Session = Depends(get_db), 
    current_user = Depends(get_current_admin_user)
):
    db.execute(text("UPDATE document_type SET name = :name WHERE id = :id"), {"name": name, "id": type_id})
    db.commit()
    return {"success": True, "message": "Document type updated successfully"}

@router.delete("/types/{type_id}")
def delete_document_type(type_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_admin_user)):
    db.execute(text("DELETE FROM document_type WHERE id = :id"), {"id": type_id})
    db.commit()
    return {"success": True, "message": "Document type deleted successfully"}

@router.get("/families/{cooperative_id}")
def get_families(cooperative_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    sql = "SELECT family_id, family_name FROM families WHERE cooperative_id = :cid ORDER BY family_name"
    rows = db.execute(text(sql), {"cid": cooperative_id}).mappings().all()
    return {"success": True, "data": [dict(r) for r in rows]}

@router.get("/cooperative/{cooperative_id}")
def get_cooperative_documents(cooperative_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    sql = """
        SELECT p.*, dt.name as type_name, dt.code
        FROM plans p
        LEFT JOIN document_type dt ON p.document_type_id = dt.id
        WHERE p.cooperative_id = :cid AND p.family_id IS NULL
        ORDER BY p.created_at DESC
    """
    rows = db.execute(text(sql), {"cid": cooperative_id}).mappings().all()
    return {"success": True, "data": [dict(r) for r in rows]}

@router.get("/family/{family_id}")
def get_family_documents(family_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    sql = """
        SELECT p.*, dt.name as type_name, dt.code
        FROM plans p
        LEFT JOIN document_type dt ON p.document_type_id = dt.id
        WHERE p.family_id = :fid
        ORDER BY p.created_at DESC
    """
    rows = db.execute(text(sql), {"fid": family_id}).mappings().all()
    return {"success": True, "data": [dict(r) for r in rows]}

@router.get("/stats")
def get_document_stats(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    sql = """
        SELECT 
            COUNT(CASE WHEN family_id IS NULL THEN 1 END) as cooperative_docs,
            COUNT(CASE WHEN family_id IS NOT NULL THEN 1 END) as family_docs,
            COUNT(*) as total_docs
        FROM plans
        WHERE attachment IS NOT NULL OR file_path IS NOT NULL
    """
    row = db.execute(text(sql)).mappings().first()
    return {"success": True, "data": dict(row) if row else {}}

@router.post("/cooperative")
def add_cooperative_document(
    cooperative_id: int = Form(...),
    title: str = Form(...),
    document_type_id: int = Form(...),
    date: str = Form(None),
    description: str = Form(None),
    attachment: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    filename = None
    if attachment:
        filename = f"coop_{cooperative_id}_{attachment.filename}"
        with open(f"{UPLOAD_DIR}/{filename}", "wb+") as f:
            shutil.copyfileobj(attachment.file, f)
            
    sql = """
        INSERT INTO plans (cooperative_id, title, document_type_id, date, description, attachment)
        VALUES (:cid, :title, :type_id, :date, :desc, :attach)
    """
    db.execute(text(sql), {
        "cid": cooperative_id, "title": title, "type_id": document_type_id,
        "date": date, "desc": description, "attach": filename
    })
    db.commit()
    return {"success": True, "message": "Document added successfully"}

@router.post("/family")
def add_family_document(
    family_id: int = Form(...),
    cooperative_id: int = Form(...),
    title: str = Form(...),
    document_type_id: int = Form(...),
    date: str = Form(None),
    description: str = Form(None),
    attachment: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    filename = None
    if attachment:
        filename = f"fam_{family_id}_{attachment.filename}"
        with open(f"{UPLOAD_DIR}/{filename}", "wb+") as f:
            shutil.copyfileobj(attachment.file, f)
            
    sql = """
        INSERT INTO plans (family_id, cooperative_id, title, document_type_id, date, description, attachment)
        VALUES (:fid, :cid, :title, :type_id, :date, :desc, :attach)
    """
    db.execute(text(sql), {
        "fid": family_id, "cid": cooperative_id, "title": title, "type_id": document_type_id,
        "date": date, "desc": description, "attach": filename
    })
    db.commit()
    return {"success": True, "message": "Family document added successfully"}

@router.delete("/cooperative/{id}")
def delete_cooperative_document(id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    db.execute(text("DELETE FROM plans WHERE id = :id AND family_id IS NULL"), {"id": id})
    db.commit()
    return {"success": True, "message": "Document deleted"}

@router.delete("/family/{id}")
def delete_family_document(id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    db.execute(text("DELETE FROM plans WHERE id = :id AND family_id IS NOT NULL"), {"id": id})
    db.commit()
    return {"success": True, "message": "Document deleted"}
