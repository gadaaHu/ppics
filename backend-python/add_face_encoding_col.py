from database import engine
from sqlalchemy import text

with engine.connect() as conn:
    # Check if column exists
    r = conn.execute(text(
        "SELECT column_name FROM information_schema.columns "
        "WHERE table_name='members' AND column_name='face_encoding'"
    )).fetchone()
    
    if not r:
        conn.execute(text("ALTER TABLE members ADD COLUMN face_encoding JSONB"))
        conn.commit()
        print("Added face_encoding column to members table.")
    else:
        print("face_encoding column already exists.")
