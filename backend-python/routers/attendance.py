from fastapi import APIRouter, Depends, HTTPException, Form, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Optional
from pydantic import BaseModel
import io
import json
import numpy as np

# Try importing face_recognition; handle graceful failure if not available
try:
    import face_recognition
    from PIL import Image
    FACE_RECOGNITION_AVAILABLE = True
except ImportError:
    FACE_RECOGNITION_AVAILABLE = False

from database import get_db
from core.dependencies import get_current_active_user, get_current_admin_user

router = APIRouter(prefix="/api/attendance", tags=["attendance"])

@router.get("/")
def get_attendance(db: Session = Depends(get_db)):
    sql = """
        SELECT a.*, e.title as event_title, e.date as event_date,
               m.full_name as member_name, m.phone as member_phone,
               u.full_name as user_name
        FROM attendance a
        LEFT JOIN events e ON a.event_id = e.id
        LEFT JOIN members m ON a.member_id = m.member_id
        LEFT JOIN users u ON a.user_id = u.id
        ORDER BY a.scan_time DESC
    """
    rows = db.execute(text(sql)).mappings().all()
    return {"success": True, "data": [dict(r) for r in rows]}

@router.post("/")
def record_attendance(
    event_id: int = Form(...),
    member_id: Optional[int] = Form(None),
    user_id: Optional[int] = Form(None),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    if not member_id and not user_id:
        raise HTTPException(status_code=400, detail="Either member_id or user_id must be provided")

    existing_sql = "SELECT id FROM attendance WHERE event_id = :eid "
    params = {"eid": event_id}
    
    if member_id:
        existing_sql += "AND member_id = :mid"
        params["mid"] = member_id
    else:
        existing_sql += "AND user_id = :uid"
        params["uid"] = user_id
        
    existing = db.execute(text(existing_sql), params).mappings().first()
    if existing:
        return {"success": True, "message": "Attendance already recorded"}

    db.execute(
        text("INSERT INTO attendance (event_id, member_id, user_id, scan_time) VALUES (:eid, :mid, :uid, NOW())"),
        {"eid": event_id, "mid": member_id, "uid": user_id}
    )
    db.commit()
    return {"success": True, "message": "Attendance recorded successfully"}

@router.get("/stats")
def get_attendance_stats(db: Session = Depends(get_db)):
    sql = "SELECT COUNT(*) as total_records, COUNT(DISTINCT event_id) as total_events FROM attendance"
    row = db.execute(text(sql)).mappings().first()
    return {"success": True, "data": dict(row) if row else {}}

@router.get("/event/{event_id}")
def get_attendance_by_event(event_id: int, db: Session = Depends(get_db)):
    sql = """
        SELECT a.*, m.full_name as member_name, m.phone as member_phone, u.full_name as user_name
        FROM attendance a
        LEFT JOIN members m ON a.member_id = m.member_id
        LEFT JOIN users u ON a.user_id = u.id
        WHERE a.event_id = :eid
        ORDER BY a.scan_time DESC
    """
    rows = db.execute(text(sql), {"eid": event_id}).mappings().all()
    return {"success": True, "data": [dict(r) for r in rows]}

@router.get("/member/{member_id}")
def get_attendance_by_member(member_id: int, db: Session = Depends(get_db)):
    sql = """
        SELECT a.*, e.title as event_title, e.date as event_date
        FROM attendance a
        LEFT JOIN events e ON a.event_id = e.id
        WHERE a.member_id = :mid OR a.user_id = :mid
        ORDER BY a.scan_time DESC
    """
    rows = db.execute(text(sql), {"mid": member_id}).mappings().all()
    return {"success": True, "data": [dict(r) for r in rows]}

class ScanData(BaseModel):
    qr_code: str
    event_id: int

@router.post("/scan")
def scan_barcode(scan_data: ScanData, db: Session = Depends(get_db), current_user = Depends(get_current_active_user)):
    member_id_val = int(scan_data.qr_code) if scan_data.qr_code.isdigit() else 0
    member = db.execute(text("SELECT member_id FROM members WHERE phone = :qr OR member_id = :qrid"), {"qr": scan_data.qr_code, "qrid": member_id_val}).mappings().first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found from barcode")
        
    return record_attendance(event_id=scan_data.event_id, member_id=member['member_id'], user_id=None, db=db, current_user=current_user)

# --- FACIAL RECOGNITION ENDPOINTS ---

@router.post("/train-face")
async def train_face(
    member_id: int = Form(...),
    image: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    if not FACE_RECOGNITION_AVAILABLE:
        raise HTTPException(status_code=501, detail="Face recognition library is not installed on the server.")

    # Read image
    content = await image.read()
    pil_image = Image.open(io.BytesIO(content)).convert("RGB")
    image_array = np.array(pil_image)

    # Detect faces
    face_locations = face_recognition.face_locations(image_array)
    if not face_locations:
        raise HTTPException(status_code=400, detail="No face detected in the image.")
    if len(face_locations) > 1:
        raise HTTPException(status_code=400, detail="Multiple faces detected. Please upload an image with only one face.")

    # Get encoding
    face_encodings = face_recognition.face_encodings(image_array, face_locations)
    if not face_encodings:
        raise HTTPException(status_code=400, detail="Could not extract face encoding.")
    
    encoding = face_encodings[0].tolist() # Convert numpy array to list for JSON storage
    
    # Check if member exists
    member = db.execute(text("SELECT member_id FROM members WHERE member_id = :mid"), {"mid": member_id}).mappings().first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found.")

    # Save encoding
    db.execute(
        text("UPDATE members SET face_encoding = :enc WHERE member_id = :mid"),
        {"enc": json.dumps(encoding), "mid": member_id}
    )
    db.commit()

    return {"success": True, "message": "Face registered successfully."}

@router.post("/recognize")
async def recognize_face(
    event_id: int = Form(...),
    frame: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    if not FACE_RECOGNITION_AVAILABLE:
        raise HTTPException(status_code=501, detail="Face recognition library is not installed on the server.")

    # Fetch all registered members with face encodings
    members_data = db.execute(text("SELECT member_id, full_name, face_encoding FROM members WHERE face_encoding IS NOT NULL")).mappings().all()
    if not members_data:
        return {"success": False, "message": "No registered faces in the system."}

    known_encodings = []
    known_members = []
    for m in members_data:
        try:
            enc = json.loads(m['face_encoding'])
            if enc and len(enc) == 128:
                known_encodings.append(np.array(enc))
                known_members.append(m)
        except Exception:
            pass

    if not known_encodings:
        return {"success": False, "message": "No valid face encodings found in the system."}

    # Process uploaded frame
    content = await frame.read()
    try:
        pil_image = Image.open(io.BytesIO(content)).convert("RGB")
        image_array = np.array(pil_image)
    except Exception as e:
        raise HTTPException(status_code=400, detail="Invalid image format.")

    # Find faces in the frame
    # Use 'hog' for speed on CPU
    face_locations = face_recognition.face_locations(image_array, model="hog")
    if not face_locations:
        return {"success": False, "message": "No face detected in the frame."}

    face_encodings = face_recognition.face_encodings(image_array, face_locations)
    
    results = []
    
    for face_encoding in face_encodings:
        # Compare with known faces
        matches = face_recognition.compare_faces(known_encodings, face_encoding, tolerance=0.5)
        face_distances = face_recognition.face_distance(known_encodings, face_encoding)
        
        best_match_index = np.argmin(face_distances)
        if matches[best_match_index]:
            matched_member = known_members[best_match_index]
            
            # Record attendance for this member
            record_res = record_attendance(
                event_id=event_id, 
                member_id=matched_member['member_id'], 
                user_id=None, 
                db=db, 
                current_user=current_user
            )
            
            # We skip HTTPExceptions in loop; if it's already recorded, it just skips
            results.append({
                "member_id": matched_member['member_id'],
                "full_name": matched_member['full_name'],
                "status": "recorded" if "successfully" in record_res.get('message', '') else "already_recorded"
            })
    
    if results:
        return {"success": True, "message": f"Recognized {len(results)} faces.", "matches": results}
    else:
        return {"success": False, "message": "Faces detected but no matches found."}
