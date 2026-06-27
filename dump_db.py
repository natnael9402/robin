import sqlite3

conn = sqlite3.connect('platform/backend/dev.db')
cursor = conn.cursor()

# Get all tables
cursor.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
tables = cursor.fetchall()

for t in tables:
    table_name = t[0]
    print(f"\n=== TABLE: {table_name} ===")
    
    # Schema
    cursor.execute(f"PRAGMA table_info({table_name})")
    cols = cursor.fetchall()
    print("COLUMNS:")
    for col in cols:
        print(f"  {col[1]} {col[2]} {'NOT NULL' if col[3] else ''} {'PK' if col[5] else ''} DEFAULT {col[4] if col[4] is not None else 'NULL'}")
    
    # Indexes
    cursor.execute(f"PRAGMA index_list({table_name})")
    indexes = cursor.fetchall()
    if indexes:
        print("INDEXES:")
        for idx in indexes:
            cursor.execute(f"PRAGMA index_info({idx[1]})")
            idx_cols = cursor.fetchall()
            print(f"  {idx[1]}: {[c[2] for c in idx_cols]}")
    
    # Foreign keys
    cursor.execute(f"PRAGMA foreign_key_list({table_name})")
    fks = cursor.fetchall()
    if fks:
        print("FOREIGN KEYS:")
        for fk in fks:
            print(f"  {fk[3]} -> {fk[2]}.{fk[4]}")
    
    # Row count
    cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
    count = cursor.fetchone()[0]
    print(f"ROW COUNT: {count}")
    
    # All rows (if small)
    if count > 0 and count < 50:
        cursor.execute(f"SELECT * FROM {table_name}")
        rows = cursor.fetchall()
        print("ROWS:")
        for row in rows:
            print(f"  {row}")
    elif count > 0:
        cursor.execute(f"SELECT * FROM {table_name} LIMIT 5")
        rows = cursor.fetchall()
        print(f"ROWS (first 5 of {count}):")
        for row in rows:
            print(f"  {row}")

# Get CREATE statements
cursor.execute("SELECT sql FROM sqlite_master WHERE type='table' AND sql IS NOT NULL ORDER BY name")
print("\n=== CREATE STATEMENTS ===")
for row in cursor.fetchall():
    print(row[0])
    print()

# Get migration history
cursor.execute("SELECT * FROM _prisma_migrations")
print("=== MIGRATIONS ===")
for row in cursor.fetchall():
    print(row)

conn.close()