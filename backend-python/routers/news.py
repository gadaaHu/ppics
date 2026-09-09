from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Optional
import os, shutil

from database import get_db
from core.dependencies import get_current_active_user, get_current_admin_user

router = APIRouter(prefix="/api/news", tags=["news"])

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "uploads", "news")
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.get("/latest")
def get_latest_news(limit: int = 6, db: Session = Depends(get_db)):
    rows = db.execute(
        text("SELECT * FROM news ORDER BY newsdate DESC, id DESC LIMIT :lim"),
        {"lim": limit}
    ).mappings().all()
    return {"success": True, "data": [dict(r) for r in rows]}


@router.get("/")
def get_news(
    search: Optional[str] = None,
    page: int = 1,
    limit: int = 10,
    db: Session = Depends(get_db)
):
    offset = (page - 1) * limit
    where = "WHERE news_title LIKE :s OR news_des LIKE :s" if search else ""
    params = {"lim": limit, "off": offset}
    if search:
        params["s"] = f"%{search}%"

    rows = db.execute(text(f"SELECT * FROM news {where} ORDER BY newsdate DESC, id DESC LIMIT :lim OFFSET :off"), params).mappings().all()
    count = db.execute(text(f"SELECT COUNT(*) as total FROM news {where}"), params).mappings().first()
    total = count["total"] if count else 0
    return {
        "success": True,
        "data": [dict(r) for r in rows],
        "pagination": {"page": page, "limit": limit, "total": total, "pages": -(-total // limit)}
    }


@router.get("/{news_id}")
def get_news_by_id(news_id: int, db: Session = Depends(get_db)):
    row = db.execute(text("SELECT * FROM news WHERE id = :id"), {"id": news_id}).mappings().first()
    if not row:
        raise HTTPException(status_code=404, detail="News not found")
    db.execute(text("UPDATE news SET views = views + 1 WHERE id = :id"), {"id": news_id})
    db.commit()
    return {"success": True, "data": dict(row)}


@router.post("/")
async def create_news(
    news_title: str = Form(...),
    news_des: str = Form(...),
    newsdate: str = Form(...),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin_user)
):
    image_filename = None
    if image and image.filename:
        image_filename = image.filename
        with open(os.path.join(UPLOAD_DIR, image_filename), "wb") as f:
            shutil.copyfileobj(image.file, f)

    result = db.execute(text("""
        INSERT INTO news (news_title, news_des, newsdate, news_image, created_at)
        VALUES (:t, :d, :nd, :img, NOW())
    """), {"t": news_title, "d": news_des, "nd": newsdate, "img": image_filename})
    db.commit()
    new_id = result.lastrowid
    row = db.execute(text("SELECT * FROM news WHERE id = :id"), {"id": new_id}).mappings().first()
    return JSONResponse(status_code=201, content={"success": True, "data": dict(row), "message": "News created successfully"})


@router.put("/{news_id}")
async def update_news(
    news_id: int,
    news_title: Optional[str] = Form(None),
    news_des: Optional[str] = Form(None),
    newsdate: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin_user)
):
    existing = db.execute(text("SELECT * FROM news WHERE id = :id"), {"id": news_id}).mappings().first()
    if not existing:
        raise HTTPException(status_code=404, detail="News not found")

    image_filename = existing.get("news_image")
    if image and image.filename:
        image_filename = image.filename
        with open(os.path.join(UPLOAD_DIR, image_filename), "wb") as f:
            shutil.copyfileobj(image.file, f)

    db.execute(text("""
        UPDATE news SET news_title = :t, news_des = :d, newsdate = :nd, news_image = :img WHERE id = :id
    """), {
        "t": news_title or existing["news_title"],
        "d": news_des or existing["news_des"],
        "nd": newsdate or existing["newsdate"],
        "img": image_filename,
        "id": news_id
    })
    db.commit()
    row = db.execute(text("SELECT * FROM news WHERE id = :id"), {"id": news_id}).mappings().first()
    return {"success": True, "data": dict(row), "message": "News updated successfully"}


@router.delete("/{news_id}")
def delete_news(news_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_admin_user)):
    row = db.execute(text("SELECT * FROM news WHERE id = :id"), {"id": news_id}).mappings().first()
    if not row:
        raise HTTPException(status_code=404, detail="News not found")
    db.execute(text("DELETE FROM news WHERE id = :id"), {"id": news_id})
    db.commit()
    return {"success": True, "message": "News deleted successfully"}
