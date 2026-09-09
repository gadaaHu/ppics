from sqlalchemy import Column, Integer, String, Text, Date, TIMESTAMP, ForeignKey, DECIMAL, JSON, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import enum

class UserRole(str, enum.Enum):
    admin = "admin"
    member = "member"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(255), unique=True, index=True)
    password = Column(String(255))
    email = Column(String(255), unique=True, index=True, nullable=True)
    full_name = Column(String(255), nullable=True)
    role = Column(String(50), default="member")
    status = Column(String(50), default="active")
    cooperative_id = Column(Integer, nullable=True)
    family_id = Column(Integer, nullable=True)
    created_at = Column(TIMESTAMP, server_default=func.now())

class News(Base):
    __tablename__ = "news"

    id = Column(Integer, primary_key=True, index=True)
    news_title = Column(String(255))
    news_des = Column(Text)
    newsdate = Column(Date)
    news_image = Column(String(255), nullable=True)
    views = Column(Integer, default=0)
    created_at = Column(TIMESTAMP, server_default=func.now())

class Gallery(Base):
    __tablename__ = "gallery"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255))
    description = Column(Text)
    event_date = Column(Date)
    image = Column(String(255), nullable=True)
    type = Column(String(50))
    url = Column(String(255), nullable=True)
    created_at = Column(TIMESTAMP, server_default=func.now())

class DocumentType(Base):
    __tablename__ = "document_type"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    code = Column(String(50), nullable=True)
    description = Column(Text, nullable=True)
    required = Column(Integer, default=0)
    created_at = Column(TIMESTAMP, server_default=func.now())

class Plan(Base):
    __tablename__ = "plans"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    document_type_id = Column(Integer, nullable=True)
    family_id = Column(Integer, nullable=True)
    cooperative_id = Column(Integer, nullable=True)
    file_path = Column(String(255), nullable=True)
    attachment = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    year = Column(Integer, nullable=True)
    date = Column(Date, nullable=True)
    created_at = Column(TIMESTAMP, server_default=func.now())

class Setting(Base):
    __tablename__ = "settings"

    id = Column(Integer, primary_key=True, index=True)
    setting_key = Column(String(100), unique=True, nullable=False)
    setting_value = Column(Text)
    setting_group = Column(String(50), default="general")
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

class Member(Base):
    __tablename__ = "members"

    member_id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(255), nullable=True)
    gender = Column(String(50), nullable=True)
    email = Column(String(255), nullable=True)
    cooperative_id = Column(Integer, nullable=True)
    district_id = Column(Integer, nullable=True)
    family_id = Column(Integer, nullable=True)
    phone = Column(String(50), nullable=True)
    password = Column(String(255), nullable=True)
    photo = Column(String(255), nullable=True)
    status = Column(Enum('Active', 'Inactive', 'Pending', name='member_status_enum'), default='Active')
    face_encoding = Column(JSON, nullable=True)

class MemberEvaluation(Base):
    __tablename__ = "member_evaluations"

    evaluation_id = Column(Integer, primary_key=True, index=True)
    member_id = Column(Integer, ForeignKey("members.member_id", ondelete="CASCADE"), nullable=False)
    evaluator_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    evaluation_period = Column(String(100), nullable=False)
    total_score = Column(DECIMAL(5, 2), nullable=False)
    criteria_scores = Column(JSON, nullable=True)
    remarks = Column(Text, nullable=True)
    status = Column(String(50), default="Pending")
    created_at = Column(TIMESTAMP, server_default=func.now())

class MemberPayment(Base):
    __tablename__ = "member_payments"

    payment_id = Column(Integer, primary_key=True, index=True)
    member_id = Column(Integer, ForeignKey("members.member_id", ondelete="CASCADE"), nullable=False)
    amount = Column(DECIMAL(10, 2), nullable=False)
    payment_month = Column(String(20), nullable=False)
    payment_year = Column(Integer, nullable=False)
    status = Column(Enum('Pending', 'Approved', name='payment_status_enum'), default='Pending')
    approved_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    receipt_number = Column(String(50), unique=True, nullable=True)
    created_at = Column(TIMESTAMP, server_default=func.now())

class District(Base):
    __tablename__ = "districts"
    district_id = Column(Integer, primary_key=True, index=True)
    district_name = Column(String(255), nullable=False)

class Cooperative(Base):
    __tablename__ = "cooperatives"
    cooperative_id = Column(Integer, primary_key=True, index=True)
    cooperative_name = Column(String(255), nullable=False)
    district_id = Column(Integer, nullable=True)

class Family(Base):
    __tablename__ = "families"
    family_id = Column(Integer, primary_key=True, index=True)
    family_name = Column(String(255), nullable=False)
    cooperative_id = Column(Integer, nullable=True)

class Position(Base):
    __tablename__ = "positions"
    position_id = Column(Integer, primary_key=True, index=True)
    position_name = Column(String(255), nullable=False)
    level = Column(String(50), nullable=True)
    sector = Column(String(50), nullable=True)

class MemberPosition(Base):
    __tablename__ = "member_positions"
    member_id = Column(Integer, primary_key=True)
    position_id = Column(Integer, primary_key=True)
    start_date = Column(Date, nullable=True)

class Event(Base):
    __tablename__ = "events"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    date = Column(Date, nullable=True)
    photo = Column(String(255), nullable=True)
    venue = Column(String(255), nullable=True)
    event_type = Column(String(50), nullable=True)
    attendees = Column(String(255), nullable=True)
    created_at = Column(TIMESTAMP, server_default=func.now())

class Attendance(Base):
    __tablename__ = "attendance"
    id = Column(Integer, primary_key=True, index=True)
    member_id = Column(Integer, nullable=True)
    user_id = Column(Integer, nullable=True)
    event_id = Column(Integer, nullable=False)
    scan_time = Column(TIMESTAMP, nullable=True)
    created_at = Column(TIMESTAMP, server_default=func.now())

class Publication(Base):
    __tablename__ = "publications"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(100), nullable=True)
    language = Column(String(50), nullable=True)
    file_path = Column(String(255), nullable=True)
    status = Column(String(50), default='draft')
    uploaded_by = Column(Integer, nullable=True)
    created_at = Column(TIMESTAMP, server_default=func.now())

class ELearning(Base):
    __tablename__ = "e_learning"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(100), nullable=True)
    language = Column(String(50), nullable=True)
    material_type = Column(String(50), nullable=True)
    file_path = Column(String(255), nullable=True)
    thumbnail = Column(String(255), nullable=True)
    duration = Column(String(50), nullable=True)
    level = Column(String(50), nullable=True)
    author = Column(String(255), nullable=True)
    tags = Column(String(255), nullable=True)
    video_url = Column(String(255), nullable=True)
    status = Column(String(50), default='draft')
    uploaded_by = Column(Integer, nullable=True)
    views = Column(Integer, default=0)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())
