from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from datetime import datetime
import json

db = SQLAlchemy()

class User(db.Model, UserMixin):
    __tablename__ = 'users'
    id = db.Column(db.String(50), primary_key=True)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False) # 'student', 'faculty', 'admin'
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    is_activated = db.Column(db.Boolean, default=False, nullable=False)
    otp_code = db.Column(db.String(10), nullable=True)

class SystemSetting(db.Model):
    __tablename__ = 'system_settings'
    key = db.Column(db.String(50), primary_key=True)
    value = db.Column(db.String(100), nullable=False)

class Department(db.Model):
    __tablename__ = 'departments'
    id = db.Column(db.String(20), primary_key=True) # e.g. 'CSE'
    name = db.Column(db.String(100), nullable=False)

class Faculty(db.Model):
    __tablename__ = 'faculty'
    id = db.Column(db.String(50), primary_key=True) # e.g. 'FAC-001'
    user_id = db.Column(db.String(50), db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    department_id = db.Column(db.String(20), db.ForeignKey('departments.id'), nullable=False)
    profile_pic = db.Column(db.String(255), nullable=True)
    about = db.Column(db.String(500), nullable=True)
    post = db.Column(db.String(100), nullable=True)
    present_address = db.Column(db.String(255), nullable=True)
    permanent_address = db.Column(db.String(255), nullable=True)
    office = db.Column(db.String(100), nullable=True)
    phone = db.Column(db.String(50), nullable=True)
    research_interests = db.Column(db.String(500), nullable=True)

class Student(db.Model):
    __tablename__ = 'students'
    id = db.Column(db.String(50), primary_key=True) # e.g. '2023-2-60-010'
    user_id = db.Column(db.String(50), db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    department_id = db.Column(db.String(20), db.ForeignKey('departments.id'), nullable=False)
    advisor_id = db.Column(db.String(50), db.ForeignKey('faculty.id'), nullable=True)
    credit_limit = db.Column(db.Integer, default=15)
    completed_credits = db.Column(db.Float, default=0.0)
    cgpa = db.Column(db.Float, default=0.0)
    advising_status = db.Column(db.String(20), default='not_started') # 'not_started', 'planned', 'approved'
    outstanding_balance = db.Column(db.Integer, default=0)
    financial_cleared = db.Column(db.Boolean, default=True)
    profile_pic = db.Column(db.String(255), nullable=True)
    about = db.Column(db.String(500), nullable=True)
    
    # Newly added fields
    phone_number = db.Column(db.String(50), nullable=True)
    remaining_credits = db.Column(db.Float, default=0.0)
    present_address = db.Column(db.String(255), nullable=True)
    permanent_address = db.Column(db.String(255), nullable=True)
    completed_courses_and_grades = db.Column(db.Text, nullable=True)
    current_courses = db.Column(db.Text, nullable=True)
    current_course_credit = db.Column(db.Float, default=0.0)
    next_semester_courses = db.Column(db.Text, nullable=True)
    next_semester_course_credit = db.Column(db.Float, default=0.0)
    unassigned_courses = db.Column(db.Text, nullable=True)

class Admin(db.Model):
    __tablename__ = 'admins'
    id = db.Column(db.String(50), primary_key=True)
    user_id = db.Column(db.String(50), db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)



class PreAdvisingCourse(db.Model):
    __tablename__ = 'pre_advising_courses'
    id = db.Column(db.String(50), primary_key=True) # e.g. 'CSE103'
    code = db.Column(db.String(20), nullable=False)
    title = db.Column(db.String(100), nullable=False)
    credits = db.Column(db.Float, nullable=False)
    department_id = db.Column(db.String(20), nullable=False)
    completed_credit_requirement = db.Column(db.Integer, default=0, nullable=False)
    _prerequisites = db.Column(db.Text, default='[]') # Saved as JSON string

    @property
    def prerequisites(self):
        return json.loads(self._prerequisites or '[]')
    
    @prerequisites.setter
    def prerequisites(self, value):
        self._prerequisites = json.dumps(value)

class SectionOffering(db.Model):
    __tablename__ = 'section_offerings'
    id = db.Column(db.String(100), primary_key=True) # e.g. 'CSE103-01-SU26'
    course_code = db.Column(db.String(20), nullable=False)
    course_title = db.Column(db.String(100), nullable=False)
    section_number = db.Column(db.String(10), nullable=False)
    credits = db.Column(db.Float, default=3.0)
    schedule = db.Column(db.String(50), nullable=False) # e.g. 'MW:10.10-11.40'
    room = db.Column(db.String(50), nullable=False)
    _dedicated_departments = db.Column(db.Text, default='[]') # Saved as JSON string
    capacity = db.Column(db.Integer, default=30)
    enrolled_count = db.Column(db.Integer, default=0)
    completed_credit_requirement = db.Column(db.Integer, default=0, nullable=False)
    _prerequisites = db.Column(db.Text, default='[]') # Saved as JSON string
    semester_id = db.Column(db.String(20), default='summer-2026')
    is_lab = db.Column(db.Boolean, default=False)
    linked_section_id = db.Column(db.String(100), nullable=True)
    faculty_id = db.Column(db.String(50), db.ForeignKey('faculty.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    @property
    def dedicated_departments(self):
        return json.loads(self._dedicated_departments or '[]')
    
    @dedicated_departments.setter
    def dedicated_departments(self, value):
        self._dedicated_departments = json.dumps(value)

    @property
    def prerequisites(self):
        return json.loads(self._prerequisites or '[]')
    
    @prerequisites.setter
    def prerequisites(self, value):
        self._prerequisites = json.dumps(value)

class AdvisingWindow(db.Model):
    __tablename__ = 'advising_windows'
    id = db.Column(db.String(50), primary_key=True)
    type = db.Column(db.String(20), nullable=False) # 'pre' or 'final'
    label = db.Column(db.String(100), nullable=False)
    credit_min = db.Column(db.Float, nullable=False)
    credit_max = db.Column(db.Float, nullable=False)
    start_date_time = db.Column(db.String(50), nullable=False)
    end_date_time = db.Column(db.String(50), nullable=False)
    semester_id = db.Column(db.String(20), default='summer-2026')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class AdvisingPlan(db.Model):
    __tablename__ = 'advising_plans'
    id = db.Column(db.String(50), primary_key=True) # PLAN-student_id
    student_id = db.Column(db.String(50), db.ForeignKey('students.id'), nullable=False)
    semester_id = db.Column(db.String(20), default='summer-2026')
    _course_ids = db.Column(db.Text, default='[]') # List of course codes selected

    @property
    def course_ids(self):
        return json.loads(self._course_ids or '[]')
    
    @course_ids.setter
    def course_ids(self, value):
        self._course_ids = json.dumps(value)

class Registration(db.Model):
    __tablename__ = 'registrations'
    id = db.Column(db.String(100), primary_key=True)
    student_id = db.Column(db.String(50), db.ForeignKey('students.id'), nullable=False)
    section_id = db.Column(db.String(100), db.ForeignKey('section_offerings.id'), nullable=False)
    semester_id = db.Column(db.String(20), default='summer-2026')
    status = db.Column(db.String(20), default='registered')
    registered_at = db.Column(db.DateTime, default=datetime.utcnow)

class SemesterDropRequest(db.Model):
    __tablename__ = 'semester_drop_requests'
    id = db.Column(db.String(80), primary_key=True)
    student_id = db.Column(db.String(50), db.ForeignKey('students.id'), nullable=False)
    semester_id = db.Column(db.String(20), nullable=False)
    reason = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(20), default='pending')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class AttendanceRecord(db.Model):
    __tablename__ = 'attendance_records'
    id = db.Column(db.String(220), primary_key=True)
    student_id = db.Column(db.String(50), db.ForeignKey('students.id'), nullable=False)
    section_id = db.Column(db.String(100), db.ForeignKey('section_offerings.id'), nullable=False)
    semester_id = db.Column(db.String(20), nullable=False)
    date = db.Column(db.String(20), nullable=False)
    status = db.Column(db.String(20), nullable=False, default='present')
    marked_by = db.Column(db.String(50), db.ForeignKey('faculty.id'), nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class AdvisingRequest(db.Model):
    __tablename__ = 'advising_requests'
    id = db.Column(db.String(50), primary_key=True)
    student_id = db.Column(db.String(50), db.ForeignKey('students.id'), nullable=False)
    section_id = db.Column(db.String(100), nullable=True) # The requested section
    current_section_id = db.Column(db.String(100), nullable=True) # Set if section change request
    course_id = db.Column(db.String(50), nullable=False) # course code
    semester_id = db.Column(db.String(20), default='summer-2026')
    type = db.Column(db.String(50), nullable=False) # 'add_course' or 'change_section'
    status = db.Column(db.String(20), default='pending_advisor') # 'pending_advisor', 'approved', 'rejected'
    comments = db.Column(db.Text, nullable=False)
    advisor_note = db.Column(db.Text, nullable=True)
    advisor_id = db.Column(db.String(50), db.ForeignKey('faculty.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Grade(db.Model):
    __tablename__ = 'grades'
    id = db.Column(db.String(50), primary_key=True)
    student_id = db.Column(db.String(50), db.ForeignKey('students.id'), nullable=False)
    section_id = db.Column(db.String(100), nullable=False) # E.g., 'CSE103'
    grade_letter = db.Column(db.String(5), nullable=False) # e.g., 'A', 'B-', 'F'
    grade_point = db.Column(db.Float, nullable=False)
    semester_id = db.Column(db.String(20), nullable=False)

class LedgerEntry(db.Model):
    __tablename__ = 'ledger_entries'
    id = db.Column(db.String(50), primary_key=True)
    student_id = db.Column(db.String(50), db.ForeignKey('students.id'), nullable=False)
    description = db.Column(db.String(255), nullable=False)
    amount = db.Column(db.Integer, nullable=False)
    status = db.Column(db.String(20), nullable=False) # 'paid', 'unpaid'
    date = db.Column(db.String(50), nullable=False)

class Installment(db.Model):
    __tablename__ = 'installments'
    id = db.Column(db.String(50), primary_key=True)
    student_id = db.Column(db.String(50), db.ForeignKey('students.id'), nullable=False)
    installment_no = db.Column(db.Integer, nullable=False)
    amount = db.Column(db.Integer, nullable=False)
    due_date = db.Column(db.String(50), nullable=False)
    status = db.Column(db.String(20), nullable=False) # 'paid', 'unpaid'

class Announcement(db.Model):
    __tablename__ = 'announcements'
    id = db.Column(db.String(50), primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    content = db.Column(db.Text, nullable=False)
    created_by = db.Column(db.String(100), nullable=False)
    created_at = db.Column(db.String(50), nullable=False)
    target_role = db.Column(db.String(20), nullable=False) # 'student', 'faculty', 'all'

class Notification(db.Model):
    __tablename__ = 'notifications'
    id = db.Column(db.String(50), primary_key=True)
    student_id = db.Column(db.String(50), db.ForeignKey('students.id'), nullable=False)
    title = db.Column(db.String(100), nullable=False)
    message = db.Column(db.Text, nullable=False)
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class CourseMaterial(db.Model):
    __tablename__ = 'course_materials'
    id = db.Column(db.String(50), primary_key=True)
    section_id = db.Column(db.String(100), db.ForeignKey('section_offerings.id'), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    file_path = db.Column(db.String(255), nullable=False)
    file_type = db.Column(db.String(50), nullable=False) # 'slide', 'note', 'assignment', 'lab'
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)

class CourseAnnouncement(db.Model):
    __tablename__ = 'course_announcements'
    id = db.Column(db.String(50), primary_key=True)
    section_id = db.Column(db.String(100), db.ForeignKey('section_offerings.id'), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Message(db.Model):
    __tablename__ = 'messages'
    id = db.Column(db.String(50), primary_key=True)
    sender_id = db.Column(db.String(50), nullable=False) # User.id
    receiver_id = db.Column(db.String(50), nullable=True) # User.id
    content = db.Column(db.Text, nullable=False)
    attachment_path = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_read = db.Column(db.Boolean, default=False)
    course_chat_section_id = db.Column(db.String(100), db.ForeignKey('section_offerings.id'), nullable=True)

class GradingScheme(db.Model):
    __tablename__ = 'grading_schemes'
    id = db.Column(db.String(50), primary_key=True) # SCHEME-section_id
    section_id = db.Column(db.String(100), db.ForeignKey('section_offerings.id'), nullable=False)
    _components = db.Column(db.Text, default='{}') # Saved as JSON string (e.g. {"Attendance": 10, "Midterm": 30})

    @property
    def components(self):
        return json.loads(self._components or '{}')
    
    @components.setter
    def components(self, value):
        self._components = json.dumps(value)

class StudentMark(db.Model):
    __tablename__ = 'student_marks'
    id = db.Column(db.String(100), primary_key=True) # MARK-student_id-section_id
    student_id = db.Column(db.String(50), db.ForeignKey('students.id'), nullable=False)
    section_id = db.Column(db.String(100), db.ForeignKey('section_offerings.id'), nullable=False)
    _marks = db.Column(db.Text, default='{}') # Saved as JSON string (e.g. {"Attendance": 9, "Midterm": 25})
    total_marks = db.Column(db.Float, default=0.0)
    percentage = db.Column(db.Float, default=0.0)
    grade_letter = db.Column(db.String(5), nullable=True)
    grade_point = db.Column(db.Float, default=0.0)
    is_published = db.Column(db.Boolean, default=False)

    @property
    def marks(self):
        return json.loads(self._marks or '{}')
    
    @marks.setter
    def marks(self, value):
        self._marks = json.dumps(value)
