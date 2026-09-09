import time, random
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy import text
from pydantic import BaseModel
from typing import Optional

from database import get_db
from core.dependencies import get_current_active_user, get_current_admin_user

router = APIRouter(prefix="/api/payments", tags=["payments"])


class PaymentCreate(BaseModel):
    member_id: int
    amount: float
    payment_month: str
    payment_year: int


@router.get("/")
def get_payments(db: Session = Depends(get_db), current_user = Depends(get_current_active_user)):
    user_role = getattr(current_user, "role", None)
    user_coop = getattr(current_user, "cooperative_id", None)
    user_family = getattr(current_user, "family_id", None)

    base_sql = """
        SELECT p.*, m.full_name as member_name, m.phone as member_phone, u.full_name as approver_name
        FROM member_payments p
        JOIN members m ON p.member_id = m.member_id
        LEFT JOIN users u ON p.approved_by = u.user_id
    """
    params = {}

    if user_role == "leader":
        base_sql += " WHERE m.cooperative_id = :coop"
        params["coop"] = user_coop
    elif user_role == "family_leader":
        base_sql += " WHERE m.cooperative_id = :coop AND m.family_id = :fam"
        params["coop"] = user_coop
        params["fam"] = user_family

    base_sql += " ORDER BY p.created_at DESC"
    rows = db.execute(text(base_sql), params).mappings().all()
    return {"success": True, "data": [dict(r) for r in rows]}


@router.get("/my-payments")
def get_member_payments(db: Session = Depends(get_db), current_user = Depends(get_current_active_user)):
    member_id = getattr(current_user, "member_id", None)
    is_member = getattr(current_user, "is_member", False)

    if not is_member or not member_id:
        raise HTTPException(status_code=404, detail="Member profile not found")

    rows = db.execute(text("""
        SELECT p.*, m.full_name as member_name, u.full_name as approver_name
        FROM member_payments p
        JOIN members m ON p.member_id = m.member_id
        LEFT JOIN users u ON p.approved_by = u.user_id
        WHERE p.member_id = :mid AND p.status = 'Approved'
        ORDER BY p.created_at DESC
    """), {"mid": member_id}).mappings().all()
    return {"success": True, "data": [dict(r) for r in rows]}


@router.post("/")
def create_payment(payment: PaymentCreate, db: Session = Depends(get_db), current_user = Depends(get_current_active_user)):
    existing = db.execute(text("""
        SELECT payment_id FROM member_payments WHERE member_id = :mid AND payment_month = :pm AND payment_year = :py
    """), {"mid": payment.member_id, "pm": payment.payment_month, "py": payment.payment_year}).mappings().first()

    if existing:
        raise HTTPException(status_code=409, detail="A payment record for this member and period already exists.")

    result = db.execute(text("""
        INSERT INTO member_payments (member_id, amount, payment_month, payment_year, status)
        VALUES (:mid, :amt, :pm, :py, 'Pending')
    """), {"mid": payment.member_id, "amt": payment.amount, "pm": payment.payment_month, "py": payment.payment_year})
    db.commit()
    return JSONResponse(status_code=201, content={
        "success": True, "message": "Payment logged successfully",
        "data": {"payment_id": result.lastrowid}
    })


@router.put("/{payment_id}/approve")
def approve_payment(payment_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_active_user)):
    user_role = getattr(current_user, "role", "member")
    if user_role == "member":
        raise HTTPException(status_code=403, detail="Unauthorized")

    existing = db.execute(text("SELECT * FROM member_payments WHERE payment_id = :id"), {"id": payment_id}).mappings().first()
    if not existing:
        raise HTTPException(status_code=404, detail="Payment not found")
    if existing["status"] == "Approved":
        raise HTTPException(status_code=400, detail="Payment is already approved")

    timestamp = str(int(time.time()))[-6:]
    rnd = random.randint(1000, 9999)
    receipt_number = f"RCPT-{timestamp}-{rnd}"

    user_id = getattr(current_user, "id", None)
    db.execute(text("""
        UPDATE member_payments SET status = 'Approved', approved_by = :uid, receipt_number = :rcpt
        WHERE payment_id = :id
    """), {"uid": user_id, "rcpt": receipt_number, "id": payment_id})
    db.commit()
    return {"success": True, "message": "Payment approved successfully", "receipt_number": receipt_number}


@router.delete("/{payment_id}")
def delete_payment(payment_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_admin_user)):
    db.execute(text("DELETE FROM member_payments WHERE payment_id = :id"), {"id": payment_id})
    db.commit()
    return {"success": True, "message": "Payment deleted successfully"}
