from database import engine
from sqlalchemy import text

with engine.connect() as conn:
    r = conn.execute(text("SELECT current_schema(), current_database()"))
    print("Schema/DB:", r.fetchone())
    
    r2 = conn.execute(text(
        "SELECT table_schema, column_name FROM information_schema.columns "
        "WHERE table_name='users' ORDER BY table_schema, ordinal_position"
    ))
    rows = r2.fetchall()
    print("All users columns (all schemas):", rows)
