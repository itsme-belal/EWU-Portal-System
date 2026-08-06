# 🛠️ Administrator User Manual
## EWU Academic Management Portal
**East West University — Academic Portal & Notification System**

---

> **Version**: 1.0  
> **Last Updated**: August 2026  
> **Audience**: System Administrators and University Administrative Staff  
> **Portal URL**: [https://ewubd-portal.onrender.com](https://ewubd-portal.onrender.com)

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Getting Started](#getting-started)
   - [Logging In](#logging-in)
   - [Forgot Password](#forgot-password)
3. [Admin Dashboard](#admin-dashboard)
4. [Advising Window Management](#advising-window-management)
   - [Pre-Advising Windows](#pre-advising-windows)
   - [Final Advising Windows](#final-advising-windows)
5. [Course Catalog Management (Pre-Advising Courses)](#course-catalog-management-pre-advising-courses)
6. [Section Offerings Management](#section-offerings-management)
7. [Pre-Advising Demand Analytics](#pre-advising-demand-analytics)
8. [Student Management](#student-management)
9. [Faculty Management](#faculty-management)
10. [Department Management](#department-management)
11. [Financial Management](#financial-management)
12. [Announcements & Notifications](#announcements--notifications)
13. [Semester Configuration](#semester-configuration)
14. [System Settings](#system-settings)
15. [User Account Administration](#user-account-administration)
16. [Frequently Asked Questions](#frequently-asked-questions)
17. [Contact & Support](#contact--support)

---

## 1. Overview

The **EWU Academic Management Portal — Administrator Interface** is the highest-privilege control panel for managing every aspect of the university's academic operations. As an **Administrator**, you have full authority to:

- **Configure and schedule** Pre-Advising and Final Advising registration windows.
- **Manage the course catalog** and all section offerings for each semester.
- **Set prerequisites**, enrollment capacities, room assignments, and faculty instructor assignments.
- **Monitor real-time enrollment analytics** and pre-advising demand metrics.
- **Administer student and faculty profiles**, including financial hold flags and account activation.
- **Manage university departments** and program structures.
- **Broadcast announcements** to students, faculty, or all users.
- **Configure system settings** including semester dates and rollover policies.
- **Activate or deactivate** user accounts system-wide.

---

## 2. Getting Started

### 2.1 Logging In

Administrator accounts are pre-configured with elevated privileges. No separate activation is required.

**Standard Login:**
1. Navigate to the portal login page.
2. Enter your **Admin Email** (e.g., `itsmebelalhossain@gmail.com`) in the identifier field.
3. Enter your **admin password**.
4. Click **"Sign In"**.
5. You will be redirected to the **Admin Dashboard**.

**Google Sign-In (One-Click):**
1. Click **"Continue with Google"** on the login page.
2. Select your administrator Google/Gmail account.
3. If already linked, you will sign in immediately.

> **Security Reminder**: Admin credentials grant full system access. Keep your password confidential and never share it.

---

### 2.2 Forgot Password

1. Click **"Forgot Password?"** on the login page.
2. Enter your **Admin Email**.
3. A **6-digit OTP** is sent to your registered email.
4. Enter the code and set a new password (6–12 characters).

---

## 3. Admin Dashboard

The **Admin Dashboard** is the system executive view providing real-time university analytics.

### Dashboard Summary Cards:

| Card | Description |
|---|---|
| **Total Students** | Total number of enrolled students in the system |
| **Total Faculty** | Total number of registered faculty members |
| **Active Sections** | Total course sections in the current semester |
| **Total Registrations** | Total active enrollment records this semester |
| **Pending Requests** | Override/exception requests awaiting faculty decisions |
| **Pre-Advising Plans** | Total student pre-advising plan submissions |
| **Current Semester** | The currently active semester label |
| **Next Semester** | The upcoming semester being planned |

### Charts & Analytics:
- **Department-wise Enrollment Chart**: Visual breakdown of student counts per department.
- **Registration Activity Chart**: Enrollment trend over the advising period.
- **Recent Announcements**: Quick view of the latest broadcasts.

### Sidebar Navigation:
- **Dashboard** — System overview & analytics
- **Advising Windows** — Scheduling registration windows
- **Course Catalog** — Pre-advising course management
- **Section Offerings** — Live section management
- **Demand Analytics** — Pre-advising demand heatmap
- **Students** — Student profile management
- **Faculty** — Faculty management
- **Departments** — Department administration
- **Financial** — Financial hold management
- **Announcements** — Broadcast management
- **Settings** — Semester and system configuration

---

## 4. Advising Window Management

Advising Windows control **when** students can access the advising portal based on their completed credit count. This is the core scheduling mechanism for the two-phase advising cycle.

### Understanding Windows:
- **Pre-Advising Windows**: Allow students to submit their preferred course plans before sections are finalized.
- **Final Advising Windows**: Open official seat registration. Students access these based on their **credit bracket** (students with more completed credits get earlier windows — priority registration).

---

### 4.1 Creating a New Advising Window:

1. Click **"Advising Windows"** in the sidebar.
2. Click **"+ Add Window"**.
3. Fill in the form:
   | Field | Description | Example |
   |---|---|---|
   | **Window Type** | `pre` for Pre-Advising, `final` for Final Registration | `final` |
   | **Label** | Human-readable name for this window | `Priority Window — 100+ Credits` |
   | **Credit Min** | Minimum completed credits for eligibility | `100` |
   | **Credit Max** | Maximum completed credits for eligibility | `999` |
   | **Start Date & Time** | When this window opens | `2026-05-10T09:00` |
   | **End Date & Time** | When this window closes | `2026-05-12T17:00` |
   | **Semester** | Target semester for this window | `Summer2026` |
4. Click **"Save Window"**.

### 4.2 Typical Credit-Bracket Window Schedule Example:
| Window Label | Credit Range | Opens |
|---|---|---|
| Priority — Senior Students | 100+ credits | Day 1, 9:00 AM |
| Priority — Advanced Students | 70–99 credits | Day 1, 12:00 PM |
| Standard — Intermediate Students | 40–69 credits | Day 2, 9:00 AM |
| Standard — Freshman Students | 0–39 credits | Day 3, 9:00 AM |

### 4.3 Editing & Deleting Windows:
- Click the **"Edit"** button next to any existing window to modify its details.
- Click **"Delete"** to remove a window permanently.

> **Important**: Deleting an active window immediately closes access for all students in that bracket.

---

## 5. Course Catalog Management (Pre-Advising Courses)

The **Course Catalog** defines all courses available for pre-advising selection. These are the master course records from which section offerings are created.

### Adding a New Course:

1. Click **"Course Catalog"** in the sidebar.
2. Click **"+ Add Course"**.
3. Fill in the course details:
   | Field | Description | Example |
   |---|---|---|
   | **Course Code** | Unique identifier | `CSE110` |
   | **Course Title** | Full name | `Programming Language I` |
   | **Credits** | Credit hours | `3` |
   | **Department** | Offering department | `CSE` |
   | **Prerequisites** | Comma-separated prerequisite course codes | `CSE103` |
   | **Completed Credit Requirement** | Min credits student must have completed | `0` |
4. Click **"Save Course"**.

### Editing a Course:
- Click **"Edit"** next to any existing course to modify its details, prerequisites, or credit requirements.

### Deleting a Course:
- Click **"Delete"** to remove a course from the catalog.

> **Warning**: Deleting a course removes it from pre-advising selection. This does not affect existing section offerings or student grade records.

---

## 6. Section Offerings Management

**Section Offerings** are the actual seats students register into during Final Advising. Each section offering is a specific instance of a course (with a room, time, faculty, and capacity) for a given semester.

### Adding a New Section Offering:

1. Click **"Section Offerings"** in the sidebar.
2. Click **"+ Add Section"**.
3. Fill in the form:
   | Field | Description | Example |
   |---|---|---|
   | **Course Code** | Course this section belongs to | `CSE110` |
   | **Course Title** | Section course name | `Programming Language I` |
   | **Section Number** | Section identifier | `01` |
   | **Credits** | Credit hours | `3` |
   | **Schedule** | Day and time code | `MW:10.10-11.40` |
   | **Room** | Classroom assignment | `AB-601` |
   | **Capacity** | Maximum seats | `40` |
   | **Faculty** | Assigned instructor | Select from faculty list |
   | **Semester** | Target semester | `Summer2026` |
   | **Is Lab Section** | Toggle on if this is a lab section | Yes / No |
   | **Linked Lab Section** | ID of corresponding lab section | `CSE110L-01-SU26` |
   | **Dedicated Departments** | Restrict seats to specific departments | `["CSE"]` |
   | **Prerequisites** | Prerequisite course codes to enforce | `["CSE103"]` |
   | **Completed Credit Requirement** | Min credits student must have | `0` |
4. Click **"Save Section"**.

### Schedule Format Guide:
| Pattern | Meaning |
|---|---|
| `MW:10.10-11.40` | Monday & Wednesday, 10:10 AM – 11:40 AM |
| `TR:11.50-1.20` | Tuesday & Thursday, 11:50 AM – 1:20 PM |
| `ST:08.30-10.00` | Saturday & Tuesday, 8:30 AM – 10:00 AM |
| `S:08.30-11.30` | Saturday only, 8:30 AM – 11:30 AM |

**Day Code Reference:**
| Code | Day |
|---|---|
| `S` | Saturday |
| `M` | Monday |
| `T` | Tuesday |
| `W` | Wednesday |
| `R` | Thursday |
| `F` | Friday |
| `U` | Sunday |

### Editing a Section:
- Click **"Edit"** to modify capacity, schedule, room, faculty, or prerequisites.
- Changes to capacity take effect immediately for live registrations.

### Deleting a Section:
- Click **"Delete"** to remove a section.

> **Caution**: Deleting a section removes all associated student registrations for that section. This action is irreversible. Always confirm before deleting active sections.

### Lab–Theory Linking:
- When a course has both a theory and a lab component, set the **Linked Lab Section** field on the theory section to the lab section's ID.
- The system will automatically co-register both sections when a student registers for the theory section.

---

## 7. Pre-Advising Demand Analytics

Before finalizing section offerings, you can analyze student pre-advising selections to understand demand.

### Accessing Demand Analytics:

1. Click **"Demand Analytics"** in the sidebar.
2. The page displays a visual breakdown of:
   - How many students selected each course in their pre-advising plan.
   - Demand sorted by popularity.
   - Department-wise course demand.

### How to Use This Data:
- **High Demand Courses**: Increase section capacity or create additional sections to avoid registration bottlenecks.
- **Low Demand Courses**: Consider consolidating into fewer sections.
- **Room Allocation**: Move high-demand sections to larger classrooms in advance.
- **Faculty Planning**: Identify courses that need additional instructors.

---

## 8. Student Management

The **Students** section allows full administrative control over student profiles.

### Viewing All Students:

1. Click **"Students"** in the sidebar.
2. A searchable, sortable table lists all students with:
   - Student ID, Name, Department
   - CGPA, Completed Credits
   - Advising Status
   - Financial Status

### Searching & Filtering:
- Use the **search bar** to find students by ID or name.
- Filter by department, advising status, or financial status.

### Viewing a Student Profile:
- Click any student's name to open their **full academic profile**.

### Editing a Student Profile:

1. Open the student's profile and click **"Edit"**.
2. Modifiable fields include:
   - Name
   - Department
   - Assigned Advisor (Faculty)
   - Credit Limit
   - Completed Credits
   - CGPA
   - Financial Clearance status
   - Outstanding Balance

### Adding a New Student:

1. Click **"+ Add Student"**.
2. Fill in:
   - Student ID (e.g., `2023-2-60-099`)
   - Full Name
   - University Email
   - Department
   - Assigned Faculty Advisor
   - Initial CGPA and Completed Credits
   - Credit Limit
3. Set an initial **password** for the account.
4. Click **"Create Student"**.

### Deactivating / Activating a Student Account:
- Toggle the **Active/Inactive** flag to deactivate a student account.
- Deactivated students cannot log in and are immediately redirected to the login page on their next request.

---

## 9. Faculty Management

### Viewing All Faculty:

1. Click **"Faculty"** in the sidebar.
2. A table lists all faculty members with their name, department, and active status.

### Adding a New Faculty Member:

1. Click **"+ Add Faculty"**.
2. Fill in:
   - Faculty ID (e.g., `FAC-010`)
   - Full Name
   - University Email
   - Department
   - Designation / Post (e.g., Lecturer, Senior Lecturer)
   - Office Location
   - Research Interests
3. Set an initial **password**.
4. Click **"Create Faculty"**.

### Editing Faculty:
- Click **"Edit"** on any faculty member to update their department, post, office, or other details.

### Deactivating a Faculty Account:
- Toggle the active status to deactivate. The faculty member will be immediately logged out on their next request.

---

## 10. Department Management

### Adding a Department:

1. Click **"Departments"** in the sidebar.
2. Click **"+ Add Department"**.
3. Enter the **Department Code** (e.g., `CSE`) and **Full Name** (e.g., `Computer Science & Engineering`).
4. Click **"Save"**.

### Supported Departments (Pre-configured):
| Code | Department |
|---|---|
| `CSE` | Computer Science & Engineering |
| `EEE` | Electrical & Electronic Engineering |
| `ICE` | Information & Communication Engineering |
| `CEN` | Civil Engineering |
| `GEB` | Genetic Engineering & Biotech |
| `PHR` | Pharmacy |
| `BBA` | Business Administration |
| `ECO` | Economics |
| `ENG` | English |
| `LAW` | Law |

---

## 11. Financial Management

### Managing Student Financial Records:

1. Click **"Students"**, then open a student's profile.
2. Navigate to the **"Financial"** tab within the student's profile.
3. You can:
   - View the full **Ledger** of charges and payments.
   - Add new **Ledger Entries** (charges or payments).
   - Manage **Installment Plans**.
   - Toggle the **Financial Hold** flag to block or allow registration.

### Setting a Financial Hold:
1. Open the student's profile → Financial tab.
2. Toggle **"Financial Hold: Active"** to **"Hold"**.
3. Save changes.
4. The student will be blocked from registering in any advising section until the hold is cleared.

### Clearing a Financial Hold:
1. Once the student's balance is settled, go back to the Financial tab.
2. Toggle **"Financial Hold: Active"** to **"Cleared"** and save.
3. The student can now proceed with registration.

### Adding a Ledger Entry:
1. In the Financial tab, click **"+ Add Ledger Entry"**.
2. Fill in:
   - Description (e.g., `Spring 2026 Tuition Fee`)
   - Amount
   - Date
   - Status (`Paid` or `Unpaid`)
3. Click **"Save"**.

---

## 12. Announcements & Notifications

### Broadcasting an Announcement:

1. Click **"Announcements"** in the sidebar.
2. Click **"+ New Announcement"**.
3. Fill in:
   | Field | Description | Example |
   |---|---|---|
   | **Title** | Announcement headline | `Registration Window Opens May 10` |
   | **Content** | Full announcement body | Detailed text |
   | **Target Role** | Who sees this | `all`, `student`, or `faculty` |
4. Click **"Post Announcement"**.

### Viewing & Deleting Announcements:
- All existing announcements are listed with their title, creation date, and target audience.
- Click **"Delete"** to remove an announcement.

### Sending System Notifications:
- Notifications are automatically generated by the system when advising requests are processed, grades are published, and financial holds are updated.
- You can manually create notifications for individual students if needed.

---

## 13. Semester Configuration

Managing the current and upcoming semester is critical to keeping the portal in sync with the academic calendar.

### Changing the Current Semester:

1. Click **"Settings"** in the sidebar.
2. Locate the **Semester Configuration** section.
3. Update the following:
   | Setting Key | Description | Example |
   |---|---|---|
   | `current_semester` | Active semester label | `Summer2026` |
   | `current_semester_start` | Start date of current semester | `2026-05-10T00:00` |
   | `current_semester_end` | End date of current semester | `2026-08-25T23:59` |
   | `next_semester` | Upcoming semester label | `Fall2026` |
   | `next_semester_start` | Start date of next semester | `2026-09-01T00:00` |
   | `next_semester_end` | End date of next semester | `2026-12-20T23:59` |
4. Click **"Save Settings"**.

### Automatic Semester Rollover:
- If the **current semester end date** passes, the system automatically:
  - Sets the `next_semester` as the new `current_semester`.
  - Shifts dates forward.
  - Updates existing registrations to the new semester label.
- Ensure the `next_semester` is always configured ahead of time to prevent disruption.

---

## 14. System Settings

The **Settings** tab provides granular control over system-wide configurations.

### Available Settings:
| Key | Description |
|---|---|
| `current_semester` | The active semester identifier |
| `next_semester` | The upcoming semester identifier |
| `current_semester_start` | Start datetime for current semester |
| `current_semester_end` | End datetime for current semester |
| `next_semester_start` | Start datetime for next semester |
| `next_semester_end` | End datetime for next semester |

### Editing a Setting:
1. Click **"Settings"** in the sidebar.
2. Locate the setting key you want to change.
3. Click **"Edit"** next to the setting.
4. Update the value.
5. Click **"Save"**.

---

## 15. User Account Administration

### Activating / Deactivating Accounts:

**For Students:**
1. Open the student's profile in **"Students"**.
2. Toggle the **"Active"** flag and save.

**For Faculty:**
1. Open the faculty record in **"Faculty"**.
2. Toggle the **"Active"** flag and save.

### Password Reset (Admin-Initiated):
- If a user cannot reset their own password:
  1. Open the user's profile.
  2. Set a temporary **new password** manually.
  3. Inform the user to change it upon next login.

### Account Roles:
| Role | Access Level |
|---|---|
| `student` | Student portal only |
| `faculty` | Faculty portal only |
| `admin` | Full system access |

> **Note**: Role assignments are set at account creation and cannot be changed after the fact via the UI. Contact the system developer for role reassignments.

---

## 16. Frequently Asked Questions

**Q: How do I open registration for a specific credit bracket?**  
A: Go to **"Advising Windows"** and create (or update) a Final Advising Window with the appropriate credit min/max range and the start/end datetime. Students in that bracket can only register during the window's active time.

**Q: A student is complaining they cannot register even though the window is open.**  
A: Check the following in the student's profile:
1. Financial hold — must be cleared.
2. Credit bracket — their completed credits must fall within an active window's range.
3. Correct semester — the window's semester must match the current advising semester.

**Q: How do I add a new semester?**  
A: Go to **"Settings"** and update the `next_semester`, `next_semester_start`, and `next_semester_end` values. Also create the relevant Advising Windows and Section Offerings for the new semester.

**Q: How do I bulk-import students or faculty?**  
A: Bulk import is handled via the seeding script (`seed.py`) from the server side. Contact the system developer or use the Data Excel files in the `/Data` folder to prepare bulk records. Manual entry via the Admin UI is also available for individual records.

**Q: Can I change a student's advisor?**  
A: Yes. Open the student's profile → Edit → Change the **"Assigned Advisor"** dropdown → Save.

**Q: How do I delete a section that already has registered students?**  
A: The system will warn you. All registrations linked to that section will be removed. This is irreversible. Consider increasing capacity or adding a new section instead of deleting one that students have already registered for.

**Q: The system is showing the wrong semester. What do I do?**  
A: Go to **Settings** and manually update the `current_semester` value to the correct semester label. Also ensure `current_semester_end` has not passed (which would trigger an automatic rollover).

**Q: How do I broadcast an emergency announcement?**  
A: Go to **"Announcements"** → **"+ New Announcement"** → Set **Target Role** to `all` → Write your message → Click **"Post"**. The announcement will appear on all dashboards immediately.

---

## 17. Contact & Support

| Contact | Details |
|---|---|
| **System Developer** | Belal Hossain — itsmebelalhossain@gmail.com |
| **GitHub Repository** | [https://github.com/itsme-belal/EWU-Portal-System](https://github.com/itsme-belal/EWU-Portal-System) |
| **Live Portal** | [https://ewubd-portal.onrender.com](https://ewubd-portal.onrender.com) |
| **Demo Video** | [Watch Demo](https://youtu.be/ralzK9LL7T8?si=g82UFJZWQRV1C7Md) |

---

## Appendix A — Demo Credentials

| Role | Login Identifier | Password |
|---|---|---|
| **Student** | `2023-2-60-010@std.ewubd.edu` | `123456` |
| **Faculty / Advisor** | `ahmedbhr2001@gmail.com` | `123456` |
| **Administrator** | `itsmebelalhossain@gmail.com` | `admin123` |

---

## Appendix B — Degree Credit Requirements

| Program | Total Credits Required |
|---|---|
| CSE, EEE, ICE, CEN, GEB | 140.0 |
| PHR (Pharmacy) | 170.0 |
| DSA, MAT, BBA, ECO, ENG, LAW, SOC, INF, PPHS | 130.0 |

---

> *This manual is intended for East West University Administrators and Academic Management Staff. All configurations directly affect the live student and faculty experience — proceed with care.*

**© 2026 East West University — Academic Portal System**
