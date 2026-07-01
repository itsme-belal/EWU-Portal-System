import os
import json
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
        db.drop_all()
        db.create_all()

        print("Seeding Admin Users...")
        admin_pass_hash = generate_password_hash('admin')
        admin_user1 = User(
            id='admin_u1',
            email='itsmebelalhossain@gmail.com',
            password_hash=admin_pass_hash,
            role='admin',
            is_active=True,
            is_activated=True
        )
        db.session.add(admin_user1)
        
        admin_user2 = User(
            id='admin_u2',
            email='admin@ewubd.edu',
            password_hash=generate_password_hash('password123'),
            role='admin',
            is_active=True,
            is_activated=True
        )
        db.session.add(admin_user2)

        admin_profile1 = Admin(
            id='A001',
            user_id='admin_u1',
            name='Registrar'
        )
        db.session.add(admin_profile1)

        admin_profile2 = Admin(
            id='A002',
            user_id='admin_u2',
            name='Registrar Assistant'
        )
        db.session.add(admin_profile2)

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
        print("Database successfully initialized and seeded. Done.")

if __name__ == '__main__':
    seed_db()
