import os
import sqlite3
from backend.config import DB_FILE

# Attempt psycopg2 import for PostgreSQL support on Render
try:
    import psycopg2
    import psycopg2.pool
    import psycopg2.extras
    PSYCOPG2_AVAILABLE = True
except ImportError:
    PSYCOPG2_AVAILABLE = False

DATABASE_URL = os.environ.get('DATABASE_URL')

class SQLiteAdapter:
    @staticmethod
    def get_connection():
        conn = sqlite3.connect(DB_FILE, timeout=10.0)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA foreign_keys = ON;")
        conn.execute("PRAGMA journal_mode = WAL;")
        conn.execute("PRAGMA busy_timeout = 5000;")
        return conn

    def execute_query(self, query: str, params=()):
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute(query, params)
        rows = cursor.fetchall()
        conn.close()
        return [dict(row) for row in rows]

    def execute_single(self, query: str, params=()):
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute(query, params)
        row = cursor.fetchone()
        conn.close()
        return dict(row) if row else None

    def execute_write(self, query: str, params=()):
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute(query, params)
        last_id = cursor.lastrowid
        conn.commit()
        conn.close()
        return last_id

class PostgresAdapter:
    def __init__(self, db_url: str):
        # Fix Render postgres:// prefix to postgresql://
        if db_url.startswith("postgres://"):
            db_url = db_url.replace("postgres://", "postgresql://", 1)
        self.db_url = db_url
        self.pool = psycopg2.pool.ThreadedConnectionPool(minconn=1, maxconn=10, dsn=self.db_url)

    def get_connection(self):
        return self.pool.getconn()

    def release_connection(self, conn):
        self.pool.putconn(conn)

    def execute_query(self, query: str, params=()):
        # Convert ? to %s for PostgreSQL
        pg_query = query.replace('?', '%s')
        conn = self.get_connection()
        try:
            cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
            cursor.execute(pg_query, params)
            rows = cursor.fetchall()
            return [dict(r) for r in rows]
        finally:
            self.release_connection(conn)

    def execute_single(self, query: str, params=()):
        pg_query = query.replace('?', '%s')
        conn = self.get_connection()
        try:
            cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
            cursor.execute(pg_query, params)
            row = cursor.fetchone()
            return dict(row) if row else None
        finally:
            self.release_connection(conn)

    def execute_write(self, query: str, params=()):
        pg_query = query.replace('?', '%s')
        conn = self.get_connection()
        try:
            cursor = conn.cursor()
            if "RETURNING id" not in pg_query and "INSERT INTO" in pg_query:
                pg_query += " RETURNING id"
            cursor.execute(pg_query, params)
            last_id = None
            if cursor.description:
                row = cursor.fetchone()
                if row: last_id = row[0]
            conn.commit()
            return last_id
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            self.release_connection(conn)

# Dynamic Adapter Selection Engine
if DATABASE_URL and (DATABASE_URL.startswith("postgres://") or DATABASE_URL.startswith("postgresql://")) and PSYCOPG2_AVAILABLE:
    print("[INFO] Production Database Adapter: PostgreSQL (Render Managed DB)")
    db_engine = PostgresAdapter(DATABASE_URL)
else:
    print("[INFO] Development Database Adapter: SQLite 3 (local growth_beacon_crm.db)")
    db_engine = SQLiteAdapter()

class Database:
    @staticmethod
    def get_connection():
        return db_engine.get_connection()

    @staticmethod
    def execute_query(query, params=()):
        return db_engine.execute_query(query, params)

    @staticmethod
    def execute_single(query, params=()):
        return db_engine.execute_single(query, params)

    @staticmethod
    def execute_write(query, params=()):
        return db_engine.execute_write(query, params)
