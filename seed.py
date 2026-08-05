import os
import json
from dotenv import load_dotenv
load_dotenv()

from sqlalchemy import create_engine, text as sa_text, event
from sqlalchemy.engine import Engine
from werkzeug.security import generate_password_hash
from models import (
    db, User, Department, Admin, SystemSetting, Faculty, Student,
    PreAdvisingCourse, SectionOffering, Grade, LedgerEntry, Installment
)
from flask import Flask

# Database — defaults to SQLite (zero setup). Set DATABASE_URL env var for PostgreSQL.
DATABASE_URL = os.environ.get('DATABASE_URL', 'sqlite:///ewu_portal.db')

# Ensure we delete the local SQLite file if it exists to fully clear it
if DATABASE_URL.startswith('sqlite:///'):
    db_file = DATABASE_URL.split('sqlite:///')[1]
    possible_paths = [db_file, os.path.join('instance', db_file)]
    for p in possible_paths:
        if os.path.exists(p):
            try:
                os.remove(p)
                print(f"Removed existing database file: {p}")
            except Exception as e:
                print(f"Failed to remove {p}: {e}")

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URL
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

@event.listens_for(Engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    import sqlite3
    if isinstance(dbapi_connection, sqlite3.Connection):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA journal_mode=WAL")
        cursor.execute("PRAGMA synchronous=NORMAL")
        cursor.close()

def seed_db():
    # For PostgreSQL: attempt to auto-create the database if missing
    if DATABASE_URL.startswith('postgresql'):
        try:
            temp_url = DATABASE_URL.rsplit('/', 1)[0] + '/postgres'
            temp_engine = create_engine(temp_url)
            with temp_engine.connect().execution_options(isolation_level='AUTOCOMMIT') as conn:
                db_name = DATABASE_URL.rsplit('/', 1)[1]
                result = conn.execute(sa_text(f"SELECT 1 FROM pg_database WHERE datname='{db_name}'"))
                if not result.scalar():
                    conn.execute(sa_text(f"CREATE DATABASE {db_name}"))
                    print(f"PostgreSQL database '{db_name}' created.")
            temp_engine.dispose()
        except Exception as e:
            print('Note: Could not auto-create PG database:', e)

    with app.app_context():
        print("Recreating database tables...")
        if DATABASE_URL.startswith('postgresql'):
            try:
                db.session.execute(sa_text("SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = current_database() AND pid <> pg_backend_pid();"))
                db.session.commit()
            except Exception as e:
                db.session.rollback()
            try:
                db.session.execute(sa_text("DROP SCHEMA public CASCADE; CREATE SCHEMA public; GRANT ALL ON SCHEMA public TO postgres; GRANT ALL ON SCHEMA public TO public;"))
                db.session.commit()
                print("Cleaned PostgreSQL schema 'public' successfully.")
            except Exception as e:
                db.session.rollback()
                print("DROP SCHEMA fallback, executing db.drop_all():", e)
                db.drop_all()
        else:
            db.drop_all()
        db.create_all()
        db.session.commit()

        default_admin_pass = os.environ.get('DEFAULT_ADMIN_PASSWORD', 'admin123')
        admin_pass_hash = generate_password_hash(default_admin_pass)
        admin_user1 = User(
            id='admin_u1',
            email='itsmebelalhossain@gmail.com',
            password_hash=admin_pass_hash,
            role='admin',
            is_active=True,
            is_activated=True
        )
        db.session.add(admin_user1)
        db.session.flush()

        admin_profile1 = Admin(
            id='A001',
            user_id='admin_u1',
            name='Registrar'
        )
        db.session.add(admin_profile1)

        print("Seeding System Settings...")
        db.session.add(SystemSetting(key='current_semester', value='Spring2026'))
        db.session.add(SystemSetting(key='next_semester', value='Summer2026'))
        db.session.add(SystemSetting(key='current_semester_start', value='2026-01-05'))
        db.session.add(SystemSetting(key='current_semester_end', value='2026-04-20'))
        db.session.add(SystemSetting(key='next_semester_start', value='2026-05-10'))
        db.session.add(SystemSetting(key='next_semester_end', value='2026-08-25'))
        db.session.add(SystemSetting(key='pre_advising_active', value='true'))
        db.session.add(SystemSetting(key='final_advising_active', value='true'))
        db.session.add(SystemSetting(key='request_phase_active', value='true'))
        db.session.commit()

        print("Seeding Departments...")
        departments = [
            Department(id='ICE', name='ICE'),
            Department(id='CSE', name='CSE'),
            Department(id='EEE', name='EEE'),
            Department(id='PHR', name='Pharmacy'),
            Department(id='GEB', name='GEB'),
            Department(id='CEN', name='Civil Engineering'),
            Department(id='MAT', name='Mathematics'),
            Department(id='DSA', name='Data Science'),
            Department(id='BBA', name='BBA'),
            Department(id='ECO', name='Economics'),
            Department(id='ENG', name='English'),
            Department(id='SOC', name='Sociology'),
            Department(id='INF', name='Information Studies'),
            Department(id='LAW', name='Law'),
            Department(id='PPHS', name='Population and Public Health'),
        ]
        for d in departments:
            db.session.add(d)
        db.session.commit()

        # ── Import JSON data files from Data/ folder ─────────────────────────
        print("Importing default JSON data files from Data/...")
        from app import import_json_faculty, import_json_students, import_json_schedule

        data_dir = 'Data'

        # 1. Faculty Records
        for fname in sorted(os.listdir(data_dir)):
            if fname.endswith('.json') and 'faculty' in fname.lower():
                fpath = os.path.join(data_dir, fname)
                try:
                    count = import_json_faculty(fpath)
                    print(f"Imported {count} faculty records from: {fname}")
                except Exception as e:
                    print(f"Note: Could not import faculty {fname}: {e}")

        # 2. Student Records
        for fname in sorted(os.listdir(data_dir)):
            if fname.endswith('.json') and 'student' in fname.lower():
                fpath = os.path.join(data_dir, fname)
                try:
                    count = import_json_students(fpath)
                    print(f"Imported {count} student records from: {fname}")
                except Exception as e:
                    print(f"Note: Could not import student {fname}: {e}")

        # 3. Schedule Files (all JSON files containing "schedule" in name)
        for fname in sorted(os.listdir(data_dir)):
            if fname.endswith('.json') and 'schedule' in fname.lower():
                fpath = os.path.join(data_dir, fname)
                try:
                    count = import_json_schedule(fpath)
                    print(f"Imported {count} sections from schedule: {fname}")
                except Exception as e:
                    print(f"Note: Could not import schedule {fname}: {e}")

        print("Database successfully initialized and seeded. Done.")

if __name__ == '__main__':
    seed_db()
