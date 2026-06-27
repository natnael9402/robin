import sqlite3

conn = sqlite3.connect('platform/backend/dev.db')
cursor = conn.cursor()

# Get all tables
cursor.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
tables = cursor.fetchall()

print("=== TABLES ===")
for t in tables:
    table_name = t[0]
    cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
    count = cursor.fetchone()[0]
    print(f"{table_name}: {count} rows")

# Check User table schema
cursor.execute("PRAGMA table_info(User)")
columns = cursor.fetchall()
print("\n=== USER TABLE SCHEMA ===")
for col in columns:
    print(f"  {col[1]} ({col[2]})")

# Get user count specifically
cursor.execute("SELECT COUNT(*) FROM User")
user_count = cursor.fetchone()[0]
print(f"\n=== USER COUNT: {user_count} ===")

# Show all tables schema
for t in tables:
    table_name = t[0]
    if table_name not in ['sqlite_sequence', '_prisma_migrations']:
        cursor.execute(f"PRAGMA table_info({table_name})")
        cols = cursor.fetchall()
        print(f"\n=== {table_name} SCHEMA ===")
        for col in cols:
            print(f"  {col[1]} ({col[2]})")

conn.close()