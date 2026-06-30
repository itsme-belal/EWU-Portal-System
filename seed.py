import os
import json
from sqlalchemy import create_engine, text as sa_text
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

        print("Seeding Faculty...")
        fac_user = User(
            id='fac_u1',
            email='shamim@faculty.ewubd.edu',
            password_hash=generate_password_hash('password123'),
            role='faculty',
            is_active=True,
            is_activated=True
        )
        db.session.add(fac_user)

        fac_profile = Faculty(
            id='FAC-001',
            user_id='fac_u1',
            name='Dr. Shamim Ahmed',
            department_id='CSE'
        )
        db.session.add(fac_profile)

        print("Seeding Students...")
        std_user1 = User(
            id='std_u1',
            email='belal@std.ewubd.edu',
            password_hash=generate_password_hash('password123'),
            role='student',
            is_active=True,
            is_activated=True
        )
        db.session.add(std_user1)

        std_profile1 = Student(
            id='2023-2-60-010',
            user_id='std_u1',
            name='Belal Hossain',
            department_id='CSE',
            advisor_id='FAC-001',
            credit_limit=15,
            completed_credits=45.0,
            cgpa=3.75,
            advising_status='not_started',
            outstanding_balance=0,
            financial_cleared=True
        )
        db.session.add(std_profile1)

        std_user2 = User(
            id='std_u2',
            email='sarah@std.ewubd.edu',
            password_hash=generate_password_hash('password123'),
            role='student',
            is_active=True,
            is_activated=True
        )
        db.session.add(std_user2)

        std_profile2 = Student(
            id='2023-2-60-020',
            user_id='std_u2',
            name='Sarah Khan',
            department_id='CSE',
            advisor_id='FAC-001',
            credit_limit=15,
            completed_credits=30.0,
            cgpa=3.20,
            advising_status='not_started',
            outstanding_balance=12000,
            financial_cleared=False
        )
        db.session.add(std_profile2)

        # 0-credit Freshman Student
        std_user3 = User(
            id='std_u3',
            email='freshman@std.ewubd.edu',
            password_hash=generate_password_hash('password123'),
            role='student',
            is_active=True,
            is_activated=True
        )
        db.session.add(std_user3)

        std_profile3 = Student(
            id='2026-1-60-001',
            user_id='std_u3',
            name='Freshman Student',
            department_id='CSE',
            advisor_id='FAC-001',
            credit_limit=15,
            completed_credits=0.0,
            cgpa=0.0,
            advising_status='not_started',
            outstanding_balance=0,
            financial_cleared=True
        )
        db.session.add(std_profile3)

        print("Skipping auto-seeding Courses (Curriculum Catalog) as per admin manual configuration requirement...")
        courses = []

        print("Seeding Section Offerings...")
        sections = [
            SectionOffering(
                id='CSE103-01-Summer2026',
                course_code='CSE103',
                course_title='Structured Programming Language',
                section_number='01',
                credits=3.0,
                schedule='MW:10.10-11.40',
                room='AB2-702',
                capacity=30,
                enrolled_count=0,
                _dedicated_departments='["CSE"]',
                _prerequisites='[]',
                semester_id='Summer2026',
                is_lab=False,
                linked_section_id='CSE103Lab-01-Summer2026',
                faculty_id='FAC-001'
            ),
            SectionOffering(
                id='CSE103Lab-01-Summer2026',
                course_code='CSE103 Lab',
                course_title='Structured Programming Language Lab',
                section_number='01',
                credits=1.5,
                schedule='S:08.00-11.00',
                room='Main-602',
                capacity=30,
                enrolled_count=0,
                _dedicated_departments='["CSE"]',
                _prerequisites='[]',
                semester_id='Summer2026',
                is_lab=True,
                linked_section_id='CSE103-01-Summer2026',
                faculty_id='FAC-001'
            ),
            SectionOffering(
                id='CSE103-02-Summer2026',
                course_code='CSE103',
                course_title='Structured Programming Language',
                section_number='02',
                credits=3.0,
                schedule='MW:10.10-11.40',
                room='AB2-602',
                capacity=30,
                enrolled_count=0,
                _dedicated_departments='["CSE"]',
                _prerequisites='[]',
                semester_id='Summer2026',
                is_lab=False,
                linked_section_id='CSE103Lab-02-Summer2026',
                faculty_id='FAC-001'
            ),
            SectionOffering(
                id='CSE103Lab-02-Summer2026',
                course_code='CSE103 Lab',
                course_title='Structured Programming Language Lab',
                section_number='02',
                credits=1.5,
                schedule='T:08.00-11.00',
                room='Main-601',
                capacity=30,
                enrolled_count=0,
                _dedicated_departments='["CSE"]',
                _prerequisites='[]',
                semester_id='Summer2026',
                is_lab=True,
                linked_section_id='CSE103-02-Summer2026',
                faculty_id='FAC-001'
            ),
            SectionOffering(
                id='CSE106-01-Summer2026',
                course_code='CSE106',
                course_title='Digital Logic Design',
                section_number='01',
                credits=3.0,
                schedule='ST:11.50-13.20',
                room='Main-217',
                capacity=40,
                enrolled_count=0,
                _dedicated_departments='["CSE"]',
                _prerequisites='["CSE103"]',
                semester_id='Summer2026',
                is_lab=False,
                faculty_id='FAC-001'
            ),
            SectionOffering(
                id='CSE106-02-Summer2026',
                course_code='CSE106',
                course_title='Digital Logic Design',
                section_number='02',
                credits=3.0,
                schedule='TR:15.10-16.40',
                room='Main-540',
                capacity=40,
                enrolled_count=0,
                _dedicated_departments='["CSE"]',
                _prerequisites='["CSE103"]',
                semester_id='Summer2026',
                is_lab=False,
                faculty_id='FAC-001'
            ),
            SectionOffering(
                id='CSE207-01-Summer2026',
                course_code='CSE207',
                course_title='Data Structures and Algorithms',
                section_number='01',
                credits=3.0,
                schedule='ST:10.10-11.40',
                room='AB1-302',
                capacity=30,
                enrolled_count=0,
                _dedicated_departments='["CSE"]',
                _prerequisites='["CSE110"]',
                semester_id='Summer2026',
                is_lab=False,
                linked_section_id='CSE207Lab-01-Summer2026',
                faculty_id='FAC-001'
            ),
            SectionOffering(
                id='CSE207Lab-01-Summer2026',
                course_code='CSE207 Lab',
                course_title='Data Structures and Algorithms Lab',
                section_number='01',
                credits=1.0,
                schedule='R:16.50-18.50',
                room='Main-430',
                capacity=30,
                enrolled_count=0,
                _dedicated_departments='["CSE"]',
                _prerequisites='["CSE110"]',
                semester_id='Summer2026',
                is_lab=True,
                linked_section_id='CSE207-01-Summer2026',
                faculty_id='FAC-001'
            ),
            SectionOffering(
                id='MAT102-01-Summer2026',
                course_code='MAT102',
                course_title='Differential and Integral Calculus',
                section_number='01',
                credits=3.0,
                schedule='TR:13.30-15.00',
                room='AB3-402',
                capacity=40,
                enrolled_count=0,
                _dedicated_departments='["MAT", "CSE", "EEE"]',
                _prerequisites='["MAT101"]',
                semester_id='Summer2026',
                is_lab=False
            ),
            SectionOffering(
                id='MAT102-02-Summer2026',
                course_code='MAT102',
                course_title='Differential and Integral Calculus',
                section_number='02',
                credits=3.0,
                schedule='SR:13.30-15.00',
                room='AB3-502',
                capacity=40,
                enrolled_count=0,
                _dedicated_departments='["MAT"]',
                _prerequisites='["MAT101"]',
                semester_id='Summer2026',
                is_lab=False
            ),
            SectionOffering(
                id='MAT102-03-Summer2026',
                course_code='MAT102',
                course_title='Differential and Integral Calculus',
                section_number='03',
                credits=3.0,
                schedule='MW:15.10-16.40',
                room='FUB-402',
                capacity=40,
                enrolled_count=0,
                _dedicated_departments='["None"]',
                _prerequisites='["MAT101"]',
                semester_id='Summer2026',
                is_lab=False
            ),
            # ENG101 and MAT101 for default advising
            SectionOffering(
                id='ENG101-01-Summer2026',
                course_code='ENG101',
                course_title='English Reading and Writing',
                section_number='01',
                credits=3.0,
                schedule='MW:08.30-10.00',
                room='AB1-201',
                capacity=35,
                enrolled_count=0,
                _dedicated_departments='["None"]',
                _prerequisites='[]',
                semester_id='Summer2026',
                is_lab=False
            ),
            SectionOffering(
                id='ENG101-02-Summer2026',
                course_code='ENG101',
                course_title='English Reading and Writing',
                section_number='02',
                credits=3.0,
                schedule='TR:08.30-10.00',
                room='AB1-202',
                capacity=35,
                enrolled_count=0,
                _dedicated_departments='["None"]',
                _prerequisites='[]',
                semester_id='Summer2026',
                is_lab=False
            ),
            SectionOffering(
                id='MAT101-01-Summer2026',
                course_code='MAT101',
                course_title='Differential Equations',
                section_number='01',
                credits=3.0,
                schedule='ST:13.30-15.00',
                room='AB2-301',
                capacity=35,
                enrolled_count=0,
                _dedicated_departments='["None"]',
                _prerequisites='[]',
                semester_id='Summer2026',
                is_lab=False
            ),
            SectionOffering(
                id='MAT101-02-Summer2026',
                course_code='MAT101',
                course_title='Differential Equations',
                section_number='02',
                credits=3.0,
                schedule='TR:13.30-15.00',
                room='AB2-302',
                capacity=35,
                enrolled_count=0,
                _dedicated_departments='["None"]',
                _prerequisites='[]',
                semester_id='Summer2026',
                is_lab=False
            ),
        ]
        for s in sections:
            db.session.add(s)

        print("Seeding Student Academic History (Grades)...")
        grades = [
            Grade(id='g1', student_id='2023-2-60-010', section_id='MAT101', grade_letter='A', grade_point=4.0, semester_id='Spring2026'),
            Grade(id='g2', student_id='2023-2-60-010', section_id='CSE103', grade_letter='B+', grade_point=3.3, semester_id='Spring2026'),
            Grade(id='g3', student_id='2023-2-60-020', section_id='MAT101', grade_letter='B', grade_point=3.0, semester_id='Spring2026'),
            Grade(id='g4', student_id='2023-2-60-020', section_id='CSE103', grade_letter='F', grade_point=0.0, semester_id='Spring2026'),
        ]
        for g in grades:
            db.session.add(g)

        print("Seeding Billing Ledgers...")
        ledgers = [
            LedgerEntry(id='le1', student_id='2023-2-60-010', description='Tuition Fee - Spring 2026', amount=45000, status='paid', date='2026-02-15'),
            LedgerEntry(id='le2', student_id='2023-2-60-010', description='Activity & Lab Fees - Spring 2026', amount=1500, status='paid', date='2026-02-15'),
            LedgerEntry(id='le3', student_id='2023-2-60-020', description='Tuition Fee - Spring 2026', amount=45000, status='unpaid', date='2026-02-15'),
            LedgerEntry(id='le4', student_id='2023-2-60-020', description='Activity & Lab Fees - Spring 2026', amount=1500, status='unpaid', date='2026-02-15'),
        ]
        for l in ledgers:
            db.session.add(l)

        print("Seeding Installments...")
        installments = [
            Installment(id='inst1', student_id='2023-2-60-020', installment_no=1, amount=15500, due_date='2026-03-01', status='paid'),
            Installment(id='inst2', student_id='2023-2-60-020', installment_no=2, amount=15500, due_date='2026-04-01', status='unpaid'),
            Installment(id='inst3', student_id='2023-2-60-020', installment_no=3, amount=15500, due_date='2026-05-01', status='unpaid'),
        ]
        for inst in installments:
            db.session.add(inst)

        db.session.commit()
        print("Database successfully initialized and seeded. Done.")

if __name__ == '__main__':
    seed_db()
