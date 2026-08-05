# 🎓 East West University Academic Management Portal

> A production-grade academic management and automated advising portal for **East West University**, built with **Python Flask**, **SQLAlchemy ORM**, **Tailwind CSS**, and **PostgreSQL/SQLite**.

---

[![Python Version](https://img.shields.io/badge/python-3.10%2B-blue.svg?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/flask-v3.0.3-black.svg?style=for-the-badge&logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-v3.1.1-red.svg?style=for-the-badge&logo=sqlalchemy&logoColor=white)](https://www.sqlalchemy.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v3.4.19-38B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Ready-4169E1.svg?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

---

## 📌 Table of Contents

- [Project Overview](#-project-overview)
- [Problem Statement](#-problem-statement)
- [Challenges](#-challenges)
- [Proposed Solution](#-proposed-solution)
- [Objectives](#-objectives)
- [Key Features](#-key-features)
- [Screenshots](#-screenshots)
- [Demo](#-demo)
- [Technology Stack](#-technology-stack)
- [System Architecture](#-system-architecture)
- [Database Design](#-database-design)
- [Project Folder Structure](#-project-folder-structure)
- [Prerequisites](#-prerequisites)
- [Installation & Setup](#-installation--setup)
- [Environment Variables](#-environment-variables)
- [Configuration](#-configuration)
- [Usage Guide](#-usage-guide)
- [API Documentation](#-api-documentation)
- [Testing & Quality Assurance](#-testing--quality-assurance)
- [Security Features](#-security-features)
- [Performance Optimizations](#-performance-optimizations)
- [Challenges & Lessons Learned](#-challenges--lessons-learned)
- [Future Improvements](#-future-improvements)
- [Contributing](#-contributing)
- [License](#-license)
- [Contact](#-contact)
- [Acknowledgements](#-acknowledgements)

---

## 📖 Project Overview

The **EWU Academic Management Portal** is an enterprise-ready web platform developed to modernize and streamline the academic lifecycle, advising routines, and administrative operations at **East West University (EWU)**. It offers a role-driven architecture designed specifically for three primary stakeholder groups: **Students**, **Faculty / Academic Advisors**, and **University Administrators**.

Built to handle high-concurrency registration traffic during peak university advising windows, the portal combines a credit-bracket timed window scheduler with an automated advising policy execution engine. Students can construct pre-advising course roadmaps, monitor degree progress, review financial ledger standing, execute real-time section registrations, and request advisor overrides for constrained or seat-capped sections.

For faculty advisors, the portal acts as a central workspace to oversee advisees, track section rosters, capture daily attendance, enter course marks with dynamic grade letter calculations, publish course materials, and resolve student override requests either individually or in batch. University administrators gain granular controls over course catalogs, section offering capacity, prerequisite chains, credit-bracket time windows, live enrollment metrics, and university-wide announcement broadcasts.

---

## 🎯 Problem Statement

University course registration systems face significant challenges during peak advising periods when thousands of students simultaneously access the platform to search for courses, verify eligibility, and reserve seats. This flash-sale-like workload often overwhelms application servers, resulting in increased latency, HTTP 500 errors, system crashes, and a frustrating user experience that is further exacerbated by the Thundering Herd Problem as students repeatedly refresh pages. Beyond these scalability concerns, traditional registration systems frequently fail to enforce academic policies consistently, allowing students to enroll in courses without satisfying prerequisites, register for overlapping class schedules, bypass department-specific enrollment rules, or enroll in theory sections without the required laboratory components. Financial clearance verification is typically disconnected from the registration workflow, enabling students with unpaid dues to occupy limited seats before being manually removed later through administrative intervention. Administrative exception handling remains equally inefficient, with requests such as prerequisite waivers, section swaps, seat expansion approvals, and override permissions often managed through paper forms, email conversations, or in-person visits—creating delays, inconsistent approval workflows, lost requests, and a lack of transparency for students tracking their submissions. These interconnected limitations increase administrative workload, delay academic planning, negatively impact student and faculty experiences, and ultimately undermine the reliability and efficiency of the entire academic management process, highlighting the critical need for an integrated, automated, and scalable platform that ensures policy compliance, streamlines approval workflows, and provides a seamless registration experience for all stakeholders.

---

## ⚠️ Challenges

- **High Concurrent Registration Traffic**
  - Thousands of students access the portal simultaneously during advising windows, causing server overload and the Thundering Herd Problem.

- **Prerequisite Validation**
  - Prevent students from registering for advanced courses unless all prerequisite requirements are satisfied.

- **Schedule Conflict Detection**
  - Detect overlapping class schedules in real time before registration is confirmed.

- **Cross-Department Enrollment Rules**
  - Enforce major restrictions, department quotas, and reserved seat allocations.

- **Theory–Lab Co-requisite Validation**
  - Ensure theory and corresponding laboratory sections are enrolled together.

- **Financial Clearance Verification**
  - Prevent students with financial holds from registering until clearance requirements are met.

- **Approval Workflow Automation**
  - Replace manual paper forms and email-based approvals with structured digital workflows.

- **Transparent Request Tracking**
  - Allow students to monitor the status of advising requests, section swaps, and seat expansion approvals.

---

## 💡 Proposed Solution

The **EWU Academic Management Portal** transforms traditional university administration from reactive manual management into a proactive, automated, and data-driven academic management platform. Instead of relying on fragmented systems and manual validation, the portal centralizes advising, registration, financial verification, and academic administration into a unified rule-based workflow.

### 📌 Phase 1: Pre-Advising (Predictive Capacity Planning)

Before official section schedules are published, students build a preferred academic roadmap (up to **21 credits / 6 courses**). This allows departments to forecast course demand before registration begins and optimize academic resources accordingly.

**Key Benefits:**
- Predict future course demand before registration opens.
- Optimize section offerings based on student demand.
- Allocate larger classrooms where necessary.
- Recruit additional faculty members before registration.
- Reduce emergency section creation during registration periods.

---

### 📌 Phase 2: Automated Advising & Registration Engine

During live registration, every registration request passes through a comprehensive real-time validation pipeline before a seat is reserved.

#### 🎓 Academic Validation
- Enforces credit-bracket registration windows.
- Validates prerequisite completion and required grades.
- Checks maximum credit limits.
- Ensures degree progression compliance.

#### 📅 Registration Validation
- Performs real-time seat availability verification.
- Detects schedule conflicts automatically.
- Enforces department-specific enrollment policies.
- Preserves reserved seats for major students.
- Automatically validates theory–lab co-requisite enrollment.

#### 💳 Financial Validation
- Verifies tuition and financial clearance before registration.
- Prevents students with active financial holds from reserving seats.

#### 🔄 Atomic Registration
Theory and laboratory sections are treated as a single transaction. If either section cannot be reserved, the entire registration is automatically rolled back, preventing invalid partial enrollments.

---

## 🎓 Integrated Academic Management Suite

Beyond registration, the portal consolidates major academic and administrative services into a single unified platform.

### 📊 Custom Grading System
- Configurable grading components and assessment weights.
- Flexible grading schemes for different courses.
- Automatic GPA calculation.
- Automatic letter grade generation.
- Department-specific grading policies.

---

### 📅 Attendance Management
- Digital attendance recording.
- Real-time attendance statistics.
- Automatic low-attendance alerts.
- Academic risk monitoring for advisors.

---

### 💳 Financial Management
- Tuition ledger and payment history.
- Installment management.
- Financial clearance tracking.
- Automatic synchronization of financial holds with the registration system.

---

### 🔒 Security & Communication
- Role-Based Access Control (RBAC).
- Email OTP verification.
- Google OAuth 2.0 authentication.
- Secure password hashing.
- Direct student–faculty communication.
- Auditable advising and approval records.

---

## 🚀 Core Benefits

- Automated academic policy enforcement.
- High-concurrency registration support.
- Predictive course demand analysis.
- Reduced administrative workload.
- Improved policy compliance.
- Real-time registration validation.
- Transparent approval workflows.
- Centralized academic management platform.

---

## 🎯 Objectives

- **Automate Registration Policy Enforcement**: Eliminate manual validation errors by enforcing prerequisites, time-slot overlap prevention, seat limits, and credit caps at runtime.
- **Streamline Two-Phase Advising**: Support pre-advising demand forecasting followed by real-time credit-bracket timed registration windows.
- **Automate Lab-Theory Coupling**: Automatically select and register matching laboratory sections whenever a student registers for a theory course with a required co-requisite.
- **Enhance Faculty Productivity**: Provide faculty advisors with single-click override resolution, automated grade calculation based on customizable component weights, and streamlined attendance entry.
- **Provide Total Financial Transparency**: Enable real-time student tracking of tuition invoices, payment installments, outstanding balances, and financial hold statuses.
- **Ensure Enterprise Security & Scalability**: Implement session-based RBAC, OTP email verification, Google OAuth 2.0, audit logs, and database portability across SQLite and PostgreSQL.

---

## ✨ Key Features

### 🔐 1. Authentication & Account Management
- **Role-Based Access Control (RBAC)**: Enforces strict permission boundaries across `student`, `faculty`, and `admin` roles.
- **OTP Account Activation & Password Reset**: Secure 6-digit email OTP verification backed by Flask-Mail.
- **Google OAuth 2.0 Single Sign-On (SSO)**: Seamless Google authentication for university email domains.
- **Password Hashing**: Industry-standard PBKDF2 with SHA256 salt via Werkzeug Security.

---

### 🎓 2. Student Portal (`/student`)
- **Interactive Dashboard**: Real-time display of CGPA, completed credits, financial standing, assigned faculty advisor details, and university-wide announcements.
- **Pre-Advising Planner**: Course selection tool (up to 21 credits / 6 courses) with prerequisite visualization.
- **Final Advising Registration Engine**:
  - Real-time seat registration with instant feedback.
  - Credit-bracket time window enforcement.
  - Automatic prerequisite validation against completed courses.
  - Time-slot schedule overlap detection.
  - Dedicated department seat reservation enforcement.
  - Automatic theory-to-lab section pairing.
- **Academic Transcript**: Complete grade point and letter grade history log across semesters.
- **Financial Ledger & Installments**: Detailed tuition invoice logs, due dates, installment breakdown, and financial hold indicators.
- **Exception & Override Requests**: Submit and monitor requests for course additions, section swaps, or seat expansion overrides.

---

### 👨‍🏫 3. Faculty / Advisor Portal (`/faculty`)
- **Advisee Roster & Management**: Overview of assigned advisees with instant access to student academic profiles, CGPA, and completed credits.
- **Interactive Attendance Roster**: Per-section daily attendance logging with instant status updates (`Present`, `Absent`, `Late`).
- **Dynamic Grade Entry & Marksheets**: Customizable component weights (e.g., Midterm 30%, Final 40%, Quizzes 20%, Attendance 10%) with automatic letter grade (`A`, `B+`, `F`) and grade point calculation.
- **Override Request Center**: Review student section add/swap/seat expansion requests with single-click approval or rejection and custom feedback notes.
- **Course Content Publishing**: Upload lecture slides, lab manuals, and assignments with real-time section announcements.

---

### 🛠️ 4. Admin Portal (`/admin`)
- **System Executive Dashboard**: Real-time university analytics, active student/faculty counts, and announcement management.
- **Advising Window Scheduler**: Configure timed credit-bracket windows (e.g., 100+ credits, 60-99 credits) for pre-advising and final advising phases.
- **Section Offering & Course Catalog Control**: Add/modify course offerings, assign faculty instructors, set room schedules, define prerequisite chains, set capacity limits, and configure lab-theory linkages.
- **Pre-Advising Demand Analytics**: Visual metrics summarizing course demand to optimize section planning.
- **User & Department Administration**: Manage university departments, student profiles, faculty assignments, and financial hold flags.

---

## 🖼️ Screenshots

| Login & Authentication | Student Dashboard |
| :---: | :---: |
| ![Login Page](doc/login.png) | ![Student Dashboard](doc/student_dashboard.png) |

| Faculty Dashboard | Admin Dashboard |
| :---: | :---: |
| ![Faculty Dashboard](doc/faculty_dashboard.png) | ![Admin Dashboard](doc/admin_dashboard.png) |

| Advising Panel | Faculty Grade Entry |
| :---: | :---: |
| ![Advising Panel](doc/advising_panel.png) | ![Final Advising Panel](doc/final_advising.png) |

| Admin Window Control | Academic Transcript |
| :---: | :---: |
| ![Course Management](doc/course_management.png) | ![Faculty Approving](doc/faculty_approving.png) |

---

## 🎬 Demo

- **Live Hosted Application**: [https://ewubd-portal.onrender.com](https://ewubd-portal.onrender.app)
- **Demo Video **: [Watch Demo Video](https://youtu.be/ralzK9LL7T8?si=g82UFJZWQRV1C7Md) 
- **Full Video Demonstration**: [Watch Full Demonstration Video](https://youtu.be/1BW0NEam_HI?si=1eF-7Gl6EUTy8K4P) 
- **Demo Credentials** :

| Role | Email | User ID |
| :--- | :--- | :--- |
| **Student (Regular)** | `2023-2-60-010@std.ewubd.edu` | `2023-2-60-010` |
| **Faculty / Advisor** | `ahmedbhr2001@gmail.com` | `MMAH` |
| **System Admin** | `itsmebelalhossain@gmail.com` | `NONE` |

---

## 💻 Technology Stack

### Frontend
- **HTML5 & Jinja2 Templates**: Server-side template rendering with modular layouts.
- **Tailwind CSS (v3.4.19)**: Utility-first design system with dark mode support.
- **JavaScript (ES6+)**: Dynamic DOM updates, asynchronous Fetch API requests, and live advising counters.
- **Lucide Icons**: Modern icon library integrated via CDN.

### Backend
- **Python (v3.10+)**: Primary core application runtime.
- **Flask (v3.0.3)**: Lightweight WSGI web application framework.
- **Flask-SQLAlchemy (v3.1.1)**: Object-Relational Mapping (ORM) layer.
- **Flask-Login (v0.6.3)**: Session-based user authentication and identity management.
- **Flask-Mail (v0.9.1)**: SMTP mail handling for activation and password reset OTPs.
- **Werkzeug (v3.0.3)**: Security utilities and password hashing.
- **Gunicorn (v22.0.0)**: Production WSGI HTTP Server.

### Database
- **SQLite3**: Zero-configuration relational database for local development.
- **PostgreSQL**: Production-ready relational database via `psycopg2-binary`.

### Cloud Services & Integrations
- **Cloudinary**: Cloud asset management for user profile pictures and material uploads.
- **Google OAuth 2.0**: Enterprise Single Sign-On (SSO) authentication.

---

## 🏗️ System Architecture

The application follows a classic **Model-View-Controller (MVC)** design pattern built around Flask blueprints and routing modules:

```mermaid
flowchart TD

subgraph Client
    Student[Student]
    Faculty[Faculty]
    Admin[Admin]
end

subgraph Backend
    Auth[Authentication]
    RBAC[Authorization]
    Advising[Advising Engine]
    FacultyService[Faculty Service]
    AdminService[Admin Service]
end

subgraph Database
    ORM[SQLAlchemy ORM]
    DB[(PostgreSQL / SQLite)]
    Cloud[Cloudinary]
    Mail[SMTP]
end

Student --> Auth
Faculty --> Auth
Admin --> Auth

Auth --> RBAC

RBAC --> Advising
RBAC --> FacultyService
RBAC --> AdminService

Advising --> ORM
FacultyService --> ORM
AdminService --> ORM

ORM --> DB
FacultyService --> Cloud
Auth --> Mail
```

### Request Execution Flow
1. **Request Ingress**: HTTP requests reach the Flask WSGI server.
2. **Session Verification**: `Flask-Login` verifies session cookies against stored user credentials.
3. **RBAC Guard**: Route decorators (`@login_required`, `@role_required`) enforce permission access.
4. **Business Logic Execution**: The advising engine validates constraints (prerequisites, schedule conflict parser, department restriction matcher, lab coupler).
5. **Persistence**: SQLAlchemy executes transactional SQL queries against SQLite or PostgreSQL.
6. **Response Rendering**: HTML templates populated via Jinja2 or JSON payloads returned to client JS.

---

## 🗄️ Database Design

The database schema is designed around normalized relational entities with JSON-serialized storage columns for dynamic data (e.g., prerequisite chains and multi-department restrictions).

### Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    users ||--o| students : "has profile"
    users ||--o| faculty : "has profile"
    users ||--o| admins : "has profile"
    
    departments ||--o{ students : "belongs to"
    departments ||--o{ faculty : "belongs to"
    
    faculty ||--o{ students : "advises"
    faculty ||--o{ section_offerings : "instructs"
    
    pre_advising_courses ||--o{ section_offerings : "defines"
    
    students ||--o{ advising_plans : "creates"
    students ||--o{ registrations : "registers"
    students ||--o{ advising_requests : "submits"
    students ||--o{ grades : "receives"
    students ||--o{ student_marks : "earns"
    students ||--o{ attendance_records : "logs"
    students ||--o{ ledger_entries : "billed"
    students ||--o{ installments : "pays"
    
    section_offerings ||--o{ registrations : "contains"
    section_offerings ||--o{ advising_requests : "targets"
    section_offerings ||--o{ course_materials : "stores"
    section_offerings ||--o{ course_announcements : "publishes"
    section_offerings ||--o| grading_schemes : "configured by"
```

### Core Entities Description
- **`users`**: Base entity holding email, hashed password, role (`student`/`faculty`/`admin`), and activation flags.
- **`students`**: Academic profile detailing CGPA, completed credits, financial clearance, advisor ID, and credit limits.
- **`faculty`**: Academic staff profile including department, office, research interests, and assigned advisees.
- **`pre_advising_courses`**: Catalog courses containing course codes, title, credit units, and JSON prerequisite lists.
- **`section_offerings`**: Active course sections with capacity, enrolled count, schedule, room, dedicated department filters, and linked lab section references.
- **`advising_windows`**: Timed registration brackets filtered by credit completion range.
- **`registrations`**: Active enrollment records binding students to course sections.
- **`advising_requests`**: Override tickets submitted by students to advisors for section add/swap/expansion.

---

## 📁 Project Folder Structure

```text
EWU-Portal-System/
├── app.py                     # Main Flask application (routes, advising engine, controllers)
├── models.py                  # SQLAlchemy models & schema definitions
├── seed.py                    # Database seeding script with realistic university demo data
├── requirements.txt           # Python backend dependencies
├── package.json               # Tailwind CSS build scripts & frontend dependencies
├── tailwind.config.js         # Tailwind configuration & custom design tokens
├── Procfile                   # Process file for production WSGI server deployment
├── vercel.json                # Vercel deployment configuration
├── .env.example               # Template for environment variables
├── static/
│   ├── css/
│   │   ├── style.css          # Core custom styles & design tokens
│   │   └── tailwind.css       # Tailwind CSS input file
│   └── uploads/               # Uploaded course materials & profile pictures
├── templates/
│   ├── base.html              # Core application layout with sidebar & dark mode
│   ├── auth_base.html         # Authentication layout
│   ├── login.html             # Login screen
│   ├── activate.html          # Account activation OTP prompt
│   ├── student.html           # Main Student Portal interface (5 tabs)
│   ├── view_student_profile.html # Student profile view
│   ├── faculty.html           # Main Faculty Portal interface (4 tabs)
│   ├── view_faculty_profile.html # Faculty profile view
│   └── admin.html             # Main Admin Portal interface (3 tabs)
└── docs/                      # Documentation assets & screenshots
```

---

## ⚙️ Prerequisites

Before installing and running the application, ensure your environment meets the following requirements:

- **Python**: Version `3.10` or higher
- **Node.js**: Version `18.0` or higher (optional, required only for modifying Tailwind CSS styles)
- **Database**: `SQLite3` (included with Python) or `PostgreSQL 14+`
- **Git**: Installed on system PATH

---

## 🚀 Installation & Setup

Follow these steps to set up the project locally:

### 1. Clone Repository
```bash
git clone https://github.com/itsme-belal/EWU-Portal-System.git
cd EWU-Portal-System
```

### 2. Create Virtual Environment
- **On macOS/Linux:**
  ```bash
  python3 -m venv venv
  source venv/bin/activate
  ```
- **On Windows (PowerShell):**
  ```powershell
  python -m venv venv
  .\venv\Scripts\Activate.ps1
  ```

### 3. Install Python Dependencies
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### 4. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
*(Optionally edit `.env` to configure custom database links or email SMTP settings).*

### 5. Seed Database
Run the seeder script to initialize tables and populate sample students, faculty, departments, and course sections:
```bash
python seed.py
```

### 6. Run Development Server
```bash
python app.py
```
Open your browser and navigate to **`http://127.0.0.1:5000`**.

---

## 🔑 Environment Variables

The project uses `python-dotenv` to load environment variables from a `.env` file:

| Variable | Description | Default Value | Required? |
| :--- | :--- | :--- | :--- |
| `SECRET_KEY` | Secret key for session encryption & CSRF | `super-secret-key-ewu` | **Yes** |
| `DATABASE_URL` | SQLAlchemy connection string | `sqlite:///ewu_portal.db` | No |
| `MAIL_SERVER` | SMTP server address for OTP emails | `smtp.gmail.com` | No |
| `MAIL_PORT` | SMTP port | `587` | No |
| `MAIL_USE_TLS` | Enable TLS encryption | `True` | No |
| `MAIL_USERNAME` | SMTP account email | `your-email@gmail.com` | No |
| `MAIL_PASSWORD` | SMTP app password | `your-app-password` | No |
| `GOOGLE_CLIENT_ID` | OAuth 2.0 Client ID for Google Login | `your-google-client-id` | No |
| `GOOGLE_CLIENT_SECRET`| OAuth 2.0 Client Secret | `your-google-client-secret` | No |
| `CLOUDINARY_URL` | Cloudinary credentials URL | `cloudinary://api_key:secret@cloud` | No |

---

## ⚙️ Configuration

### 1. Database Connection (PostgreSQL)
To run against a local or cloud-hosted PostgreSQL instance:
1. Create a database named `ewu_portal`.
2. Update `DATABASE_URL` in `.env`:
   ```env
   DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/ewu_portal
   ```
3. Re-run `python seed.py`.

### 2. Email Service Setup
To send real activation and password recovery emails via Gmail SMTP:
1. Generate an **App Password** in your Google Account.
2. Update `.env`:
   ```env
   MAIL_USERNAME=your_email@gmail.com
   MAIL_PASSWORD=your_generated_app_password
   ```

---

## 📋 Usage Guide

### Student Workflow
1. Navigate to `http://127.0.0.1:5000/login` and log in with student credentials (`belal@std.ewubd.edu`).
2. **Pre-Advising**: Select up to 6 courses (max 21 credits) and submit your pre-advising plan.
3. **Final Advising**: When your credit bracket window opens, open the Advising tab to select open sections.
4. **Override Requests**: If a section is full or restricted, submit an override request to your faculty advisor directly from the portal.

### Faculty / Advisor Workflow
1. Log in with faculty credentials (`shamim@faculty.ewubd.edu`).
2. Access the **Advisees** tab to inspect student transcripts.
3. Open **Override Requests** to approve or decline pending student registration requests.
4. Open **Attendance** or **Grade Submission** to record daily section marks and publish end-of-term grades.

### Administrator Workflow
1. Log in with admin credentials (`itsmebelalhossain@gmail.com`).
2. Access **Advising Window Control** to create credit-bracket time windows for upcoming registration cycles.
3. Manage **Section Offerings** to update course capacities, instructors, time slots, and lab linkages.

---

## 📑 API Documentation

Below is a summary of major internal API routes and endpoints:

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/login` | Authenticates user credentials & sets session cookie | Public |
| `POST` | `/student/save-plan` | Saves student pre-advising course plan | Student |
| `POST` | `/student/toggle-section` | Registers or drops a section during final advising | Student |
| `GET` | `/student/get-advising-state` | Fetches live advising window state, capacity & schedule | Student |
| `POST` | `/student/submit-request` | Submits an advisor override ticket | Student |
| `POST` | `/faculty/save-attendance` | Saves section attendance roster | Faculty |
| `POST` | `/faculty/save-grades` | Saves marks & calculates letter grades | Faculty |
| `POST` | `/faculty/resolve-request/<id>` | Approves or rejects a student override ticket | Faculty |
| `GET` | `/api/live-advising-status` | Fetches real-time university registration statistics | Admin |

---

## 🧪 Testing & Quality Assurance

### Automated Testing
To run tests across route controllers and business logic models:
```bash
pytest tests/
```

### Manual Verification Matrix
- **Prerequisite Enforcement**: Attempt to register for `CSE110` without completing `CSE103` -> System blocks registration with message `Prerequisites not met`.
- **Financial Hold**: Log in as `sarah@std.ewubd.edu` (Hold active) -> System prevents section registration until balance is settled.
- **Lab-Theory Coupling**: Select `CSE103` Section 01 -> System automatically registers linked `CSE103L` Section 01.

---

## 🔒 Security Features

- **Session Security**: Session cookies are signed and configured with `HttpOnly` and `SameSite` flags.
- **SQL Injection Prevention**: SQLAlchemy parameterized query compilation prevents arbitrary SQL execution.
- **XSS Mitigation**: Jinja2 auto-escaping sanitizes user input rendered in templates.
- **Financial Gatekeeping**: Server-side validation enforces financial clearance check on all registration mutating endpoints.
- **State Integrity Checks**: Advising engine validates credit bracket windows server-side to prevent bypass via API clients.

---

## ⚡ Performance Optimizations

- **Database Indexing**: Foreign keys (`user_id`, `student_id`, `section_id`) are indexed to ensure `O(1)` lookups.
- **Minified Frontend Bundles**: Tailwind CSS is compiled and minified (`npm run build:css`) for fast loading.
- **SQLite WAL Mode**: Configured with Write-Ahead Logging (`PRAGMA journal_mode=WAL`) to allow concurrent read operations during write transactions.

---

## 💡 Challenges & Lessons Learned

- **Solving Registration Time Overlaps**: Implementing an efficient algorithm to parse diverse time patterns (e.g., `MW:10.10-11.40` vs `ST:08.30-10.00`) and detect conflicts across arbitrary schedules in real-time.
- **Atomic Lab-Theory Coupling**: Ensuring lab and theory section registrations execute atomically within a database transaction to prevent orphaned registrations.
- **Multi-Role Schema Integration**: Designing a unified `User` model linked cleanly to subclass profiles (`Student`, `Faculty`, `Admin`) while maintaining clear role boundaries.

---

## 🚀 Future Improvements

- [ ] **AI-Powered Degree Roadmap Generator**: Machine learning model recommending optimal course selection based on historic CGPA performance.
- [ ] **Real-Time WebSocket Notifications**: Instant push notifications for advisor override approvals via Socket.IO.
- [ ] **Native Mobile Application**: Cross-platform mobile app built with Flutter.
- [ ] **Docker & Kubernetes Support**: Containerization setup with multi-stage Dockerfiles and Helm charts.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps to contribute:

1. **Fork the Repository**
2. **Create a Feature Branch**:
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. **Commit your Changes**:
   ```bash
   git commit -m "Add AmazingFeature"
   ```
4. **Push to Branch**:
   ```bash
   git push origin feature/AmazingFeature
   ```
5. **Open a Pull Request**

---

## 📜 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## ✉️ Contact

**Belal Hossain**  
- **GitHub**: [@itsme-belal](https://github.com/itsme-belal)  
- **Email**: [itsmebelalhossain@gmail.com](mailto:itsmebelalhossain@gmail.com)  
- **Project Link**: [https://github.com/itsme-belal/EWU-Portal-System](https://github.com/itsme-belal/EWU-Portal-System)

---

## 🙏 Acknowledgements

This project was developed as a team effort under the guidance of our course instructor.

### 👨‍🏫 Supervisor

- **Ahmed Adnan**  
  Lecturer  
  Department of Computer Science & Engineering  
  East West University

### 👥 Project Team

| Name | Student ID | GitHub |
|------|------------|--------|
| **Belal Hossain** | *(2023-2-60-010)* | [github](https://github.com/itsme-belal) |
| **Nusrat Jahan Tithy** | 2023-2-60-286 | [github](https://github.com/nusrat-tithy) |
| **Waseer Ahmed Badsha** | 2023-2-60-004 | [github](https://github.com/waseerahmedbadsha-sketch) |
| **Habibullah Farazy** | 2023-2-60-356 | [github](https://github.com/Faraze7) |

### ❤️ Special Thanks

- **East West University (EWU)** – Department of Computer Science & Engineering (CSE)
- **Flask** & **SQLAlchemy** Community
- **Tailwind CSS**
- **Lucide Icons**
