from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from database import get_db
from models import User, Member
from core.security import SECRET_KEY, ALGORITHM

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("userId")
        user_type: str = payload.get("userType")
        
        if user_id is None or user_type is None:
            raise credentials_exception
            
    except JWTError:
        raise credentials_exception

    if user_type == "member":
        member_id = payload.get("memberId")
        user = db.query(Member).filter(Member.member_id == int(member_id)).first()
        if user is None:
            raise credentials_exception
        user.is_member = True
        return user
    else:
        user = db.query(User).filter(User.id == int(user_id)).first()
        if user is None:
            raise credentials_exception
        user.is_member = False
        return user

def get_current_active_user(current_user = Depends(get_current_user)):
    if current_user.status == "inactive":
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

def get_current_admin_user(current_user = Depends(get_current_active_user)):
    if current_user.is_member or current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not enough privileges")
    return current_user
