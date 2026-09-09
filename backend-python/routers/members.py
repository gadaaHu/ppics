from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Optional
import os, shutil

from database import get_db
from models import Member
from core.dependencies import get_current_active_user, get_current_admin_user

router = APIRouter(prefix="/api/members", tags=["members"])

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "uploads", "members")
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.get("")
@router.get("/")
def get_members(
    search: Optional[str] = None,
    district_id: Optional[int] = None,
    cooperative_id: Optional[int] = None,
    family_id: Optional[int] = None,
    current_user = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    conditions = []
    params = {}

    user_role = getattr(current_user, "role", None)
    is_member = getattr(current_user, "is_member", False)
    user_coop = getattr(current_user, "cooperative_id", None)
    user_family = getattr(current_user, "family_id", None)

    if is_member and user_role == "member":
        conditions.append("m.cooperative_id = :ucoop")
        params["ucoop"] = user_coop
    if user_role == "leader":
        conditions.append("m.cooperative_id = :ucoop")
        params["ucoop"] = user_coop
    if user_role == "family_leader":
        conditions.append("m.cooperative_id = :ucoop AND m.family_id = :ufam")
        params["ucoop"] = user_coop
        params["ufam"] = user_family

    if search:
        conditions.append("(m.full_name LIKE :search OR m.phone LIKE :search)")
        params["search"] = f"%{search}%"
    if district_id:
        conditions.append("m.district_id = :district_id")
        params["district_id"] = district_id
    if cooperative_id:
        conditions.append("m.cooperative_id = :cooperative_id")
        params["cooperative_id"] = cooperative_id
    if family_id:
        conditions.append("m.family_id = :family_id")
        params["family_id"] = family_id

    where_sql = f"WHERE {' AND '.join(conditions)}" if conditions else ""

    sql = text(f"""
        SELECT m.*, f.family_name, c.cooperative_name, d.district_name,
               string_agg(DISTINCT p.position_name, ', ') as position_name
        FROM members m
        LEFT JOIN families f ON m.family_id = f.family_id
        LEFT JOIN cooperatives c ON m.cooperative_id = c.cooperative_id
        LEFT JOIN districts d ON m.district_id = d.district_id
        LEFT JOIN member_positions mp ON m.member_id = mp.member_id
        LEFT JOIN positions p ON mp.position_id = p.position_id
        {where_sql}
        GROUP BY m.member_id
        ORDER BY d.district_name, c.cooperative_name, f.family_name, m.full_name
    """)

    rows = db.execute(sql, params).mappings().all()
    result = [
        {**dict(row), "photo_url": f"/uploads/members/{row['photo']}" if row.get("photo") else None}
        for row in rows
    ]
    return {"success": True, "data": result}


@router.get("/dropdown")
def get_dropdown_data(db: Session = Depends(get_db), current_user = Depends(get_current_active_user)):
    districts = db.execute(text("SELECT * FROM districts ORDER BY district_name")).mappings().all()
    cooperatives = db.execute(text("SELECT * FROM cooperatives ORDER BY cooperative_name")).mappings().all()
    families = db.execute(text("SELECT * FROM families ORDER BY family_name")).mappings().all()
    positions = db.execute(text("SELECT * FROM positions ORDER BY level, sector, position_name")).mappings().all()
    return {"success": True, "data": {
        "districts": [dict(r) for r in districts],
        "cooperatives": [dict(r) for r in cooperatives],
        "families": [dict(r) for r in families],
        "positions": [dict(r) for r in positions]
    }}


@router.get("/cooperatives-by-district/{district_id}")
def get_cooperatives_by_district(district_id: int, db: Session = Depends(get_db)):
    rows = db.execute(
        text("SELECT * FROM cooperatives WHERE district_id = :d ORDER BY cooperative_name"),
        {"d": district_id}
    ).mappings().all()
    return {"success": True, "data": [dict(r) for r in rows]}


@router.get("/families-by-cooperative/{cooperative_id}")
def get_families_by_cooperative(cooperative_id: int, db: Session = Depends(get_db)):
    rows = db.execute(
        text("SELECT * FROM families WHERE cooperative_id = :c ORDER BY family_name"),
        {"c": cooperative_id}
    ).mappings().all()
    return {"success": True, "data": [dict(r) for r in rows]}


@router.get("/{member_id}")
def get_member_by_id(member_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_active_user)):
    row = db.execute(text("""
        SELECT m.*, f.family_name, c.cooperative_name, d.district_name,
               string_agg(DISTINCT p.position_name, ', ') as position_name,
               string_agg(DISTINCT p.position_id::text, ', ') as position_ids
        FROM members m
        LEFT JOIN families f ON m.family_id = f.family_id
        LEFT JOIN cooperatives c ON m.cooperative_id = c.cooperative_id
        LEFT JOIN districts d ON m.district_id = d.district_id
        LEFT JOIN member_positions mp ON m.member_id = mp.member_id
        LEFT JOIN positions p ON mp.position_id = p.position_id
        WHERE m.member_id = :mid
        GROUP BY m.member_id
    """), {"mid": member_id}).mappings().first()

    if not row:
        raise HTTPException(status_code=404, detail="Member not found")
    return {"success": True, "data": dict(row)}


@router.post("/")
async def create_member(
    full_name: str = Form(...),
    gender: Optional[str] = Form("Unknown"),
    phone: Optional[str] = Form(None),
    email: Optional[str] = Form(None),
    family_id: Optional[int] = Form(None),
    cooperative_id: Optional[int] = Form(None),
    district_id: Optional[int] = Form(None),
    status: Optional[str] = Form("Active"),
    position_id: Optional[int] = Form(None),
    photo: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    photo_filename = None
    if photo and photo.filename:
        photo_filename = photo.filename
        with open(os.path.join(UPLOAD_DIR, photo_filename), "wb") as f:
            shutil.copyfileobj(photo.file, f)

    user_role = getattr(current_user, "role", "member")
    final_status = "Pending" if user_role == "member" else (status or "Active")

    result = db.execute(text("""
        INSERT INTO members (full_name, gender, phone, email, family_id, cooperative_id, district_id, photo, status)
        VALUES (:fn, :g, :ph, :em, :fid, :cid, :did, :photo, :status)
    """), {"fn": full_name, "g": gender, "ph": phone, "em": email,
           "fid": family_id, "cid": cooperative_id, "did": district_id,
           "photo": photo_filename, "status": final_status})
    db.commit()
    new_id = result.lastrowid

    if position_id:
        db.execute(text("INSERT INTO member_positions (member_id, position_id, start_date) VALUES (:mid, :pid, NOW())"),
                   {"mid": new_id, "pid": position_id})
        db.commit()

    new_member = db.execute(text("SELECT * FROM members WHERE member_id = :id"), {"id": new_id}).mappings().first()
    return JSONResponse(status_code=201, content={"success": True, "data": dict(new_member), "message": "Member added successfully"})


@router.put("/{member_id}/approve")
def approve_member(member_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_active_user)):
    user_role = getattr(current_user, "role", "member")
    if user_role == "member":
        raise HTTPException(status_code=403, detail="Unauthorized to approve members")

    member = db.execute(text("SELECT * FROM members WHERE member_id = :id"), {"id": member_id}).mappings().first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    if member["status"] == "Active":
        raise HTTPException(status_code=400, detail="Member is already active")

    db.execute(text("UPDATE members SET status = 'Active' WHERE member_id = :id"), {"id": member_id})
    db.commit()
    updated = db.execute(text("SELECT * FROM members WHERE member_id = :id"), {"id": member_id}).mappings().first()
    return {"success": True, "data": dict(updated), "message": "Member approved successfully"}


@router.delete("/{member_id}")
def delete_member(member_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_admin_user)):
    member = db.execute(text("SELECT * FROM members WHERE member_id = :id"), {"id": member_id}).mappings().first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")

    if member.get("photo"):
        photo_path = os.path.join(UPLOAD_DIR, member["photo"])
        if os.path.exists(photo_path):
            os.remove(photo_path)

    db.execute(text("DELETE FROM member_positions WHERE member_id = :id"), {"id": member_id})
    db.execute(text("DELETE FROM members WHERE member_id = :id"), {"id": member_id})
    db.commit()
    return {"success": True, "message": "Member deleted successfully"}
