import os
import sys

def run_postgres_migration():
    db_url = os.environ.get('DATABASE_URL')
    if not db_url:
        print("[INFO] No DATABASE_URL set. Skipping PostgreSQL migration.")
        return

    try:
        import psycopg2
    except ImportError:
        print("[ERROR] psycopg2-binary is required for PostgreSQL migrations.")
        sys.exit(1)

    if db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql://", 1)

    sql_file = os.path.join(os.path.dirname(__file__), 'postgres', '001_initial_schema.sql')
    if not os.path.exists(sql_file):
        print(f"[ERROR] Migration file not found: {sql_file}")
        sys.exit(1)

    with open(sql_file, 'r', encoding='utf-8') as f:
        migration_sql = f.read()

    print(f"[INFO] Connecting to PostgreSQL database...")
    conn = psycopg2.connect(db_url)
    cursor = conn.cursor()
    
    print(f"[INFO] Applying PostgreSQL migration: 001_initial_schema.sql...")
    cursor.execute(migration_sql)
    conn.commit()
    conn.close()
    print("[SUCCESS] PostgreSQL Migration Completed Cleanly!")

if __name__ == '__main__':
    run_postgres_migration()
