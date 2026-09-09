from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Optional

from database import get_db
from core.dependencies import get_current_active_user, get_current_admin_user

router = APIRouter(prefix="/api/hierarchy", tags=["hierarchy"])

@router.get("/")
def get_hierarchy(db: Session = Depends(get_db)):
    districts = db.execute(text("SELECT * FROM districts ORDER BY district_name")).mappings().all()
    hierarchy_data = []

    for d in districts:
        district_data = dict(d)
        district_data["cooperatives"] = []

        cooperatives = db.execute(
            text("SELECT * FROM cooperatives WHERE district_id = :id ORDER BY cooperative_name"),
            {"id": d["district_id"]}
        ).mappings().all()

        for c in cooperatives:
            coop_data = dict(c)
            coop_data["families"] = []
            coop_data["leaders"] = []
            coop_data["sectors"] = []

            # Get cooperative leaders
            leaders = db.execute(text("""
                SELECT m.member_id, m.full_name, m.photo, p.position_name, p.sector
                FROM members m
                JOIN member_positions mp ON m.member_id = mp.member_id
                JOIN positions p ON mp.position_id = p.position_id
                WHERE m.cooperative_id = :cid AND p.level = 'Cooperative' AND p.sector = 'Leader'
                LIMIT 1
            """), {"cid": c["cooperative_id"]}).mappings().all()
            coop_data["leaders"] = [dict(l) for l in leaders]

            # Get cooperative sector leaders
            sectors = db.execute(text("""
                SELECT DISTINCT p.sector 
                FROM positions p 
                JOIN member_positions mp ON p.position_id = mp.position_id
                JOIN members m ON mp.member_id = m.member_id
                WHERE m.cooperative_id = :cid AND p.level = 'Cooperative' AND p.sector != 'Leader'
            """), {"cid": c["cooperative_id"]}).mappings().all()

            sector_data = []
            for s in sectors:
                sector_leaders = db.execute(text("""
                    SELECT m.member_id, m.full_name, m.photo, p.position_name
                    FROM members m
                    JOIN member_positions mp ON m.member_id = mp.member_id
                    JOIN positions p ON mp.position_id = p.position_id
                    WHERE m.cooperative_id = :cid AND p.sector = :sec AND p.level = 'Cooperative'
                """), {"cid": c["cooperative_id"], "sec": s["sector"]}).mappings().all()
                sector_data.append({"sector": s["sector"], "leaders": [dict(sl) for sl in sector_leaders]})
            
            coop_data["sectors"] = sector_data

            # Get families
            families = db.execute(
                text("SELECT * FROM families WHERE cooperative_id = :cid ORDER BY family_name"),
                {"cid": c["cooperative_id"]}
            ).mappings().all()

            for f in families:
                fam_data = dict(f)
                fam_data["leader"] = None
                fam_data["sectorLeaders"] = []
                fam_data["members"] = []

                # Family Leader
                fam_leader = db.execute(text("""
                    SELECT m.member_id, m.full_name, m.photo, p.position_name, p.sector
                    FROM members m
                    JOIN member_positions mp ON m.member_id = mp.member_id
                    JOIN positions p ON mp.position_id = p.position_id
                    WHERE m.family_id = :fid AND p.level = 'Family' AND p.sector = 'Leader'
                    LIMIT 1
                """), {"fid": f["family_id"]}).mappings().first()
                if fam_leader:
                    fam_data["leader"] = dict(fam_leader)

                # Family Sector Leaders
                fam_sectors = db.execute(text("""
                    SELECT m.member_id, m.full_name, m.photo, p.position_name, p.sector
                    FROM members m
                    JOIN member_positions mp ON m.member_id = mp.member_id
                    JOIN positions p ON mp.position_id = p.position_id
                    WHERE m.family_id = :fid AND p.level = 'Family' AND p.sector != 'Leader' AND p.sector != 'Member'
                """), {"fid": f["family_id"]}).mappings().all()
                fam_data["sectorLeaders"] = [dict(fs) for fs in fam_sectors]

                # Family Members
                fam_members = db.execute(text("""
                    SELECT m.member_id, m.full_name, m.photo
                    FROM members m
                    JOIN member_positions mp ON m.member_id = mp.member_id
                    JOIN positions p ON mp.position_id = p.position_id
                    WHERE m.family_id = :fid AND (p.sector = 'Member' OR p.sector = '' OR p.sector IS NULL)
                """), {"fid": f["family_id"]}).mappings().all()
                fam_data["members"] = [dict(fm) for fm in fam_members]

                coop_data["families"].append(fam_data)

            district_data["cooperatives"].append(coop_data)
        
        hierarchy_data.append(district_data)

    return {"success": True, "data": hierarchy_data}

@router.get("/cooperative/{cooperative_id}")
def get_cooperative_hierarchy(cooperative_id: int, db: Session = Depends(get_db)):
    c = db.execute(text("SELECT * FROM cooperatives WHERE cooperative_id = :cid"), {"cid": cooperative_id}).mappings().first()
    if not c:
        raise HTTPException(status_code=404, detail="Cooperative not found")

    leaders = db.execute(text("""
        SELECT m.member_id, m.full_name, m.photo, p.position_name, p.sector
        FROM members m
        JOIN member_positions mp ON m.member_id = mp.member_id
        JOIN positions p ON mp.position_id = p.position_id
        WHERE m.cooperative_id = :cid AND p.level = 'Cooperative' AND p.sector = 'Leader'
        LIMIT 1
    """), {"cid": cooperative_id}).mappings().all()

    families = db.execute(text("SELECT * FROM families WHERE cooperative_id = :cid ORDER BY family_name"), {"cid": cooperative_id}).mappings().all()
    family_data = []

    for f in families:
        fam_data = dict(f)
        fam_data["leader"] = None
        fam_data["members"] = []

        fam_leader = db.execute(text("""
            SELECT m.member_id, m.full_name, m.photo, p.position_name
            FROM members m
            JOIN member_positions mp ON m.member_id = mp.member_id
            JOIN positions p ON mp.position_id = p.position_id
            WHERE m.family_id = :fid AND p.level = 'Family' AND p.sector = 'Leader'
            LIMIT 1
        """), {"fid": f["family_id"]}).mappings().first()
        if fam_leader:
            fam_data["leader"] = dict(fam_leader)

        members = db.execute(text("""
            SELECT m.member_id, m.full_name, m.photo
            FROM members m
            JOIN member_positions mp ON m.member_id = mp.member_id
            JOIN positions p ON mp.position_id = p.position_id
            WHERE m.family_id = :fid AND (p.sector = 'Member' OR p.sector = '' OR p.sector IS NULL)
        """), {"fid": f["family_id"]}).mappings().all()
        fam_data["members"] = [dict(fm) for fm in members]

        family_data.append(fam_data)

    return {
        "success": True, 
        "data": {
            "cooperative": dict(c),
            "leaders": [dict(l) for l in leaders],
            "families": family_data
        }
    }
