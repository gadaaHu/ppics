from database import engine
from sqlalchemy import text

with engine.connect() as conn:
    result = conn.execute(text(
        "SELECT column_name FROM information_schema.columns WHERE table_name='users' ORDER BY ordinal_position"
    ))
    cols = [r[0] for r in result.fetchall()]
    print("users columns:", cols)
    
    # Add missing columns if they don't exist
    if 'cooperative_id' not in cols:
        conn.execute(text("ALTER TABLE users ADD COLUMN cooperative_id INTEGER"))
        print("Added cooperative_id")
    if 'family_id' not in cols:
        conn.execute(text("ALTER TABLE users ADD COLUMN family_id INTEGER"))
        print("Added family_id")
    if 'full_name' not in cols:
        conn.execute(text("ALTER TABLE users ADD COLUMN full_name VARCHAR(255)"))
        print("Added full_name")
    conn.commit()
    print("Done!")
