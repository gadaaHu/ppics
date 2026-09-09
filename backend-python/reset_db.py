from database import engine, SessionLocal
from models import Base, User
from core.security import get_password_hash

print("Dropping all tables...")
Base.metadata.drop_all(bind=engine)
print("Creating all tables...")
Base.metadata.create_all(bind=engine)

db = SessionLocal()
try:
    admin = db.query(User).filter(User.username == "admin").first()
    if not admin:
        admin = User(
            username="admin",
            password=get_password_hash("admin123"),
            email="admin@example.com",
            full_name="Administrator",
            role="admin",
            status="active"
        )
        db.add(admin)
        db.commit()
        print("Admin user created/restored.")
except Exception as e:
    print("Error:", e)
finally:
    db.close()
