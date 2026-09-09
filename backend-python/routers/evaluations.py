import json
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy import text
from pydantic import BaseModel
from typing import Optional, Dict, Any

from database import get_db
from core.dependencies import get_current_active_user, get_current_admin_user

router = APIRouter(prefix="/api/evaluations", tags=["evaluations"])


class EvaluationCreate(BaseModel):
    member_id: int
    evaluation_period: str
    total_score: float
    criteria_scores: Optional[Dict[str, Any]] = {}
    remarks: Optional[str] = None


class EvaluationUpdate(BaseModel):
    evaluation_period: str
    total_score: float
    criteria_scores: Optional[Dict[str, Any]] = {}
    remarks: Optional[str] = None


@router.get("/")
def get_evaluations(db: Session = Depends(get_db), current_user = Depends(get_current_active_user)):
    user_role = getattr(current_user, "role", None)
    user_coop = getattr(current_user, "cooperative_id", None)
    user_family = getattr(current_user, "family_id", None)

    sql = """
        SELECT e.*, m.phone as member_name, m.phone as member_phone,
               u.full_name as evaluator_name, u.role as evaluator_role
        FROM member_evaluations e
        JOIN members m ON e.member_id = m.member_id
        JOIN users u ON e.evaluator_id = u.id
    """
    params = {}
    if user_role == "leader":
        sql += " WHERE m.cooperative_id = :coop"
        params["coop"] = user_coop
    elif user_role == "family_leader":
        sql += " WHERE m.cooperative_id = :coop AND m.family_id = :fam"
        params["coop"] = user_coop
        params["fam"] = user_family

    sql += " ORDER BY e.created_at DESC"
    rows = db.execute(text(sql), params).mappings().all()
    return {"success": True, "data": [dict(r) for r in rows]}


@router.get("/member/{member_id}")
def get_member_evaluations(member_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_active_user)):
    rows = db.execute(text("""
        SELECT e.*, u.full_name as evaluator_name, u.role as evaluator_role
        FROM member_evaluations e
        JOIN users u ON e.evaluator_id = u.id
        WHERE e.member_id = :mid ORDER BY e.created_at DESC
    """), {"mid": member_id}).mappings().all()
    return {"success": True, "data": [dict(r) for r in rows]}


@router.post("/")
def create_evaluation(eval_in: EvaluationCreate, db: Session = Depends(get_db), current_user = Depends(get_current_active_user)):
    evaluator_id = getattr(current_user, "id", None)
    user_role = getattr(current_user, "role", "member")

    existing = db.execute(text("""
        SELECT evaluation_id FROM member_evaluations WHERE member_id = :mid AND evaluation_period = :ep
    """), {"mid": eval_in.member_id, "ep": eval_in.evaluation_period}).mappings().first()
    if existing:
        raise HTTPException(status_code=409, detail="An evaluation for this member and period already exists.")

    status = "Pending" if user_role == "family_leader" else "Approved"
    result = db.execute(text("""
        INSERT INTO member_evaluations (member_id, evaluator_id, evaluation_period, total_score, criteria_scores, remarks, status)
        VALUES (:mid, :eid, :ep, :ts, :cs, :rem, :stat)
    """), {
        "mid": eval_in.member_id, "eid": evaluator_id, "ep": eval_in.evaluation_period,
        "ts": eval_in.total_score, "cs": json.dumps(eval_in.criteria_scores or {}),
        "rem": eval_in.remarks, "stat": status
    })
    db.commit()
    return JSONResponse(status_code=201, content={
        "success": True, "message": "Evaluation submitted successfully",
        "data": {"evaluation_id": result.lastrowid}
    })


@router.put("/{evaluation_id}/approve")
def approve_evaluation(evaluation_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_active_user)):
    user_role = getattr(current_user, "role", None)
    if user_role not in ("admin", "leader"):
        raise HTTPException(status_code=403, detail="Unauthorized to approve evaluations")

    existing = db.execute(text("""
        SELECT e.*, m.cooperative_id FROM member_evaluations e
        JOIN members m ON e.member_id = m.member_id WHERE e.evaluation_id = :id
    """), {"id": evaluation_id}).mappings().first()

    if not existing:
        raise HTTPException(status_code=404, detail="Evaluation not found")
    if existing["status"] == "Approved":
        raise HTTPException(status_code=400, detail="Evaluation is already approved")

    db.execute(text("UPDATE member_evaluations SET status = 'Approved' WHERE evaluation_id = :id"), {"id": evaluation_id})
    db.commit()
    return {"success": True, "message": "Evaluation approved successfully"}


@router.put("/{evaluation_id}")
def update_evaluation(evaluation_id: int, eval_in: EvaluationUpdate, db: Session = Depends(get_db), current_user = Depends(get_current_active_user)):
    existing = db.execute(text("SELECT * FROM member_evaluations WHERE evaluation_id = :id"), {"id": evaluation_id}).mappings().first()
    if not existing:
        raise HTTPException(status_code=404, detail="Evaluation not found")

    db.execute(text("""
        UPDATE member_evaluations SET evaluation_period = :ep, total_score = :ts, criteria_scores = :cs, remarks = :rem
        WHERE evaluation_id = :id
    """), {
        "ep": eval_in.evaluation_period, "ts": eval_in.total_score,
        "cs": json.dumps(eval_in.criteria_scores or {}), "rem": eval_in.remarks, "id": evaluation_id
    })
    db.commit()
    return {"success": True, "message": "Evaluation updated successfully"}


@router.delete("/{evaluation_id}")
def delete_evaluation(evaluation_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_admin_user)):
    db.execute(text("DELETE FROM member_evaluations WHERE evaluation_id = :id"), {"id": evaluation_id})
    db.commit()
    return {"success": True, "message": "Evaluation deleted successfully"}
