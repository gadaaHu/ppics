from fastapi import APIRouter, Depends, HTTPException, Form
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Optional

from database import get_db
from core.dependencies import get_current_active_user, get_current_admin_user
from core.security import get_password_hash

router = APIRouter(prefix="/api/users", tags=["users"])

@router.get("/")
def get_users(db: Session = Depends(get_db)):
    sql = """
        SELECT u.id as user_id, u.username, u.full_name, u.email, u.role, u.status, u.cooperative_id, u.family_id, c.cooperative_name, f.family_name 
        FROM users u 
        LEFT JOIN cooperatives c ON u.cooperative_id = c.cooperative_id
        LEFT JOIN families f ON u.family_id = f.family_id
    """
    rows = db.execute(text(sql)).mappings().all()
    return {"success": True, "data": [dict(r) for r in rows]}

@router.post("/")
def create_user(
    username: str = Form(...),
    password: str = Form(...),
    role: str = Form(...),
    full_name: Optional[str] = Form(None),
    email: Optional[str] = Form(None),
    cooperative_id: Optional[int] = Form(None),
    family_id: Optional[int] = Form(None),
    status: Optional[str] = Form("active"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin_user)
):
    if role == 'leader' and not cooperative_id:
        raise HTTPException(status_code=400, detail="Cooperative assignment is required for leaders")
    
    if role in ['family_leader', 'member'] and (not cooperative_id or not family_id):
        raise HTTPException(status_code=400, detail="Cooperative and Family assignment are required for this role")

    existing = db.execute(text("SELECT id FROM users WHERE username = :u"), {"u": username}).mappings().first()
    if existing:
        raise HTTPException(status_code=400, detail="Username already exists")

    hashed_password = get_password_hash(password)
    coopId = None if role == 'admin' else cooperative_id
    famId = family_id if role in ['family_leader', 'member'] else None

    result = db.execute(text("""
        INSERT INTO users (username, password, full_name, email, role, cooperative_id, family_id, status) 
        VALUES (:u, :p, :fn, :e, :r, :cid, :fid, :s)
    """), {
        "u": username, "p": hashed_password, "fn": full_name, "e": email,
        "r": role, "cid": coopId, "fid": famId, "s": status or "active"
    })
    db.commit()
    
    return {"success": True, "message": "User created successfully"}

@router.put("/{user_id}")
def update_user(
    user_id: int,
    username: str = Form(...),
    role: str = Form(...),
    password: Optional[str] = Form(None),
    full_name: Optional[str] = Form(None),
    email: Optional[str] = Form(None),
    cooperative_id: Optional[int] = Form(None),
    family_id: Optional[int] = Form(None),
    status: Optional[str] = Form("active"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin_user)
):
    if role == 'leader' and not cooperative_id:
        raise HTTPException(status_code=400, detail="Cooperative assignment is required for leaders")
    
    if role in ['family_leader', 'member'] and (not cooperative_id or not family_id):
        raise HTTPException(status_code=400, detail="Cooperative and Family assignment are required for this role")

    existing = db.execute(text("SELECT id FROM users WHERE username = :u AND id != :id"), {"u": username, "id": user_id}).mappings().first()
    if existing:
        raise HTTPException(status_code=400, detail="Username already taken by another user")

    coopId = None if role == 'admin' else cooperative_id
    famId = family_id if role in ['family_leader', 'member'] else None

    if password:
        hashed_password = get_password_hash(password)
        db.execute(text("""
            UPDATE users SET username = :u, password = :p, full_name = :fn, email = :e, 
            role = :r, cooperative_id = :cid, family_id = :fid, status = :s WHERE id = :id
        """), {
            "u": username, "p": hashed_password, "fn": full_name, "e": email,
            "r": role, "cid": coopId, "fid": famId, "s": status or "active", "id": user_id
        })
    else:
        db.execute(text("""
            UPDATE users SET username = :u, full_name = :fn, email = :e, 
            role = :r, cooperative_id = :cid, family_id = :fid, status = :s WHERE id = :id
        """), {
            "u": username, "fn": full_name, "e": email,
            "r": role, "cid": coopId, "fid": famId, "s": status or "active", "id": user_id
        })
        
    db.commit()
    return {"success": True, "message": "User updated successfully"}

@router.delete("/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_admin_user)):
    db.execute(text("DELETE FROM users WHERE id = :id"), {"id": user_id})
    db.commit()
    return {"success": True, "message": "User deleted successfully"}
