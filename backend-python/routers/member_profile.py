from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
from models import Member, Attendance, Plan, Event
from core.dependencies import get_current_active_user
import shutil
import os

router = APIRouter(prefix="/api/member/profile", tags=["member_profile"])

UPLOAD_DIR = "uploads/members"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.get("/")
def get_profile(current_user = Depends(get_current_active_user), db: Session = Depends(get_db)):
    if not current_user.is_member:
        raise HTTPException(status_code=403, detail="Access denied. Member only.")
        
    member = db.query(Member).filter(Member.member_id == current_user.member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
        
    # Stats
    total_attendance = db.query(func.count(Attendance.id)).filter(Attendance.user_id == member.member_id).scalar()
    total_documents = db.query(func.count(Plan.id)).filter(Plan.family_id == member.family_id).scalar()
    
    member_dict = member.__dict__
    member_dict.pop('_sa_instance_state', None)
    
    return {
        "success": True,
        "data": {
            **member_dict,
            "total_attendance": total_attendance or 0,
            "total_documents": total_documents or 0,
            "photo_url": f"/uploads/members/{member.photo}" if member.photo else None
        }
    }

@router.get("/stats")
def get_stats(current_user = Depends(get_current_active_user), db: Session = Depends(get_db)):
    if not current_user.is_member:
        raise HTTPException(status_code=403, detail="Access denied. Member only.")
        
    member = db.query(Member).filter(Member.member_id == current_user.member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")

    attendance = db.query(func.count(Attendance.id)).filter(Attendance.user_id == member.member_id).scalar()
    documents = db.query(func.count(Plan.id)).filter(Plan.family_id == member.family_id).scalar()
    events = 0 # Cannot easily query FIND_IN_SET with sqlalchemy on SQLite/Postgres trivially without specific functions, we'll return 0 for now
    
    return {
        "success": True,
        "data": {
            "attendance": attendance or 0,
            "documents": documents or 0,
            "events": events
        }
    }

@router.post("/photo")
def upload_photo(
    photo: UploadFile = File(...),
    current_user = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    if not current_user.is_member:
        raise HTTPException(status_code=403, detail="Access denied. Member only.")
        
    member = db.query(Member).filter(Member.member_id == current_user.member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
        
    file_location = f"{UPLOAD_DIR}/{photo.filename}"
    with open(file_location, "wb+") as file_object:
        shutil.copyfileobj(photo.file, file_object)
        
    member.photo = photo.filename
    db.commit()
    
    return {
        "success": True,
        "message": "Profile photo updated successfully",
        "data": {
            "photo": photo.filename,
            "photo_url": f"/{file_location}"
        }
    }
