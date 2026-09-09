from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models import User, Member
from schemas import LoginRequest, UserCreate, ProfileUpdate, ChangePassword
from core.security import verify_password, get_password_hash, create_access_token
from core.dependencies import get_current_user, get_current_active_user, get_current_admin_user
from pydantic import BaseModel

class PasswordChange(BaseModel):
    currentPassword: str
    newPassword: str

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/login")
def login(request: LoginRequest, db: Session = Depends(get_db)):
    # Try finding in users table
    user = db.query(User).filter(User.username == request.username).first()
    if user:
        if not verify_password(request.password, user.password):
            raise HTTPException(status_code=401, detail="Invalid credentials")
        if user.status == "inactive":
            raise HTTPException(status_code=401, detail="Your account is deactivated. Please contact admin.")
            
        token_data = {
            "userId": str(user.id),
            "username": user.username,
            "role": user.role,
            "userType": "user"
        }
        user_data = {
            "user_id": user.id,
            "username": user.username,
            "full_name": user.full_name,
            "role": user.role,
            "status": user.status,
            "is_member": False
        }
    else:
        # Try finding in members table
        member = db.query(Member).filter(Member.phone == request.username).first()
        if not member:
            raise HTTPException(status_code=401, detail="Invalid credentials")
            
        default_password = "TempIcspp@2026!"
        member_password = member.password or default_password
        
        # simple equality check as in original Node.js code
        if member_password != request.password:
            raise HTTPException(status_code=401, detail="Invalid credentials")
            
        if member.status.lower() == "inactive":
            raise HTTPException(status_code=401, detail="Your account is deactivated. Please contact admin.")
            
        token_data = {
            "userId": f"M{member.member_id}",
            "username": member.phone,
            "role": "member",
            "userType": "member",
            "memberId": member.member_id,
            "family_id": member.family_id
        }
        
        user_data = {
            "user_id": f"M{member.member_id}",
            "username": member.phone,
            "full_name": "Member", # Need a way to fetch name
            "role": "member",
            "status": member.status,
            "is_member": True,
            "member_id": member.member_id,
            "phone": member.phone
        }
        
    access_token = create_access_token(data=token_data)
    return {
        "success": True,
        "token": access_token,
        "user": user_data,
        "message": "Login successful"
    }

@router.post("/register")
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.username == user_in.username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")
        
    new_user = User(
        username=user_in.username,
        password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        role=user_in.role or "member",
        status="active"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    token_data = {
        "userId": str(new_user.id),
        "username": new_user.username,
        "role": new_user.role,
        "userType": "user"
    }
    
    access_token = create_access_token(data=token_data)
    
    return {
        "success": True,
        "token": access_token,
        "user": {
            "user_id": new_user.id,
            "username": new_user.username,
            "full_name": new_user.full_name,
            "role": new_user.role
        },
        "message": "User registered successfully"
    }

@router.get("/profile")
def get_profile(current_user = Depends(get_current_active_user)):
    # Returns the currently authenticated user
    if current_user.is_member:
        return {
            "success": True,
            "data": {
                "member_id": current_user.member_id,
                "phone": current_user.phone,
                "is_member": True,
                "role": "member"
            }
        }
    else:
        return {
            "success": True,
            "data": {
                "user_id": current_user.id,
                "username": current_user.username,
                "full_name": current_user.full_name,
                "role": current_user.role,
                "is_member": False
            }
        }

@router.put("/profile")
def update_profile(profile_in: ProfileUpdate, current_user = Depends(get_current_active_user), db: Session = Depends(get_db)):
    if current_user.is_member:
        current_user.phone = profile_in.phone
    else:
        current_user.full_name = profile_in.full_name
        current_user.email = profile_in.email

    db.commit()
    return {"success": True, "message": "Profile updated successfully"}

@router.get("/users")
def get_users(current_user = Depends(get_current_admin_user), db: Session = Depends(get_db)):
    users = db.query(User).all()
    return {"success": True, "data": users}

@router.put("/change-password/user")
def change_user_password(passwords: PasswordChange, current_user = Depends(get_current_active_user), db: Session = Depends(get_db)):
    if current_user.is_member:
        raise HTTPException(status_code=403, detail="Not a user account")
    
    if not verify_password(passwords.currentPassword, current_user.password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
        
    current_user.password = get_password_hash(passwords.newPassword)
    db.commit()
    return {"success": True, "message": "Password changed successfully"}

@router.put("/change-password/member")
def change_member_password(passwords: PasswordChange, current_user = Depends(get_current_active_user), db: Session = Depends(get_db)):
    if not current_user.is_member:
        raise HTTPException(status_code=403, detail="Not a member account")
        
    default_password = "TempIcspp@2026!"
    current_member_password = current_user.password or default_password
    
    if current_member_password != passwords.currentPassword:
        raise HTTPException(status_code=400, detail="Current password is incorrect")
        
    if len(passwords.newPassword) < 6:
        raise HTTPException(status_code=400, detail="New password must be at least 6 characters")
        
    current_user.password = passwords.newPassword
    db.commit()
    return {"success": True, "message": "Password changed successfully"}

@router.put("/reset-password/{member_id}")
def reset_member_password(member_id: int, current_user = Depends(get_current_admin_user), db: Session = Depends(get_db)):
    member = db.query(Member).filter(Member.member_id == member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
        
    member.password = "TempIcspp@2026!"
    db.commit()
    return {"success": True, "message": "Password reset to default successfully"}

@router.get("/members-list")
def get_members_list(current_user = Depends(get_current_admin_user), db: Session = Depends(get_db)):
    members = db.query(Member.member_id, Member.full_name, Member.phone).all()
    # Map to dictionary list
    result = [{"member_id": m.member_id, "full_name": m.full_name, "phone": m.phone} for m in members]
    return {"success": True, "data": result}
