# EWU Portal System — Flask Edition

A production-quality university academic management portal for **East West University**, built with **Python Flask** and **SQLAlchemy** (SQLite by default, PostgreSQL-ready).

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python Flask 3.0 |
| Database | SQLite (default) / PostgreSQL |
| ORM | Flask-SQLAlchemy |
| Auth | Flask-Login (session-based) |
| Frontend | Jinja2 Templates + Tailwind CSS (CDN) |
| Icons | Lucide Icons (CDN) |

---

## Quick Start

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Seed the Database
```bash
python seed.py
```
This creates `ewu_portal.db` (SQLite) and populates all tables with demo data.

### 3. Start the Server
```bash
python run.py
```

Open **http://localhost:5000** in your browser.

---

## Demo Accounts (password: `password123`)

| Role | Email |
|---|---|
| Student | `belal@std.ewubd.edu` |
| Student (Financial Hold) | `sarah@std.ewubd.edu` |
| Faculty / Advisor | `shamim@faculty.ewubd.edu` |
| Admin | `admin@ewubd.edu` |

---

## Portal Features

### Student Portal (`/student`)
| Tab | Features |
|---|---|
| Dashboard | CGPA, credits, financial status, announcements, advisor contact |
| Advising | Pre-advising course selection (max 21 CR / 6 courses), final section registration with prerequisite + capacity + schedule + department + financial checks, automatic lab-theory linking, exception request routing |
| Transcript | Full academic grade history |
| Account Ledger | Fee invoices, installment schedule |
| My Requests | Status tracking for advisor override requests |

### Faculty Portal (`/faculty`)
| Tab | Features |
|---|---|
| Dashboard | Advisee list, section statistics |
| Attendance | Per-section attendance roster |
| Grading | Marks entry with automatic grade letter calculation |
| Requests | Approve / Reject student override requests |

### Admin Portal (`/admin`)
| Tab | Features |
|---|---|
| Dashboard | University statistics, announcement publisher |
| Pre-Advising Control | Credit-bracket window scheduling, course catalog management, live demand metrics chart |
| Final Advising Control | Section offerings creation with lab-theory linking, department restrictions, capacity, prerequisites, and staggered enrollment windows |

---

## Advising Engine Rules

### Pre-Advising
- Max **21 credits** per plan
- Max **6 courses** per plan
- Credit-bracket time windows enforced in real-time
- Students who miss pre-advising cannot self-register in final advising

### Final Advising
- **Financial hold** blocks all registration
- **Pre-advising plan required** for self-registration
- **Prerequisites** validated against academic history
- **Dedicated departments** restrict sections by student department
- **Seat capacity** enforced with per-section counters
- **Schedule conflicts** detected by day/time overlap parsing
- **Lab-Theory auto-linking** — selecting a theory section auto-includes its lab

---

## Switching to PostgreSQL

1. Install PostgreSQL and create a database named `ewu_portal`
2. Set the environment variable:
   ```bash
   set DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/ewu_portal
   ```
3. Re-run `python seed.py` to populate the PostgreSQL database
4. Run `python run.py` as normal

---

## Project Structure

```
EWU Portal System/
├── app.py              # Flask routes + advising engine
├── models.py           # SQLAlchemy database models
├── seed.py             # Database seeder script
├── run.py              # Server entry point
├── requirements.txt    # Python dependencies
├── ewu_portal.db       # SQLite database (auto-created)
├── static/
│   └── css/style.css   # Custom CSS design system
└── templates/
    ├── base.html        # Layout with sidebar + dark mode
    ├── login.html       # Premium login screen
    ├── student.html     # Student portal (5 tabs)
    ├── faculty.html     # Faculty portal (4 tabs)
    └── admin.html       # Admin portal (3 tabs)
```
