from pydantic import BaseModel
from typing import Optional

class LoginRequest(BaseModel):
    username: str
    password: str

class UserCreate(BaseModel):
    username: str
    password: str
    full_name: str
    role: Optional[str] = "member"
    cooperative_id: Optional[int] = None
    phone: Optional[str] = None

class ProfileUpdate(BaseModel):
    full_name: str
    phone: Optional[str] = None
    email: Optional[str] = None

class ChangePassword(BaseModel):
    currentPassword: str
    newPassword: str
