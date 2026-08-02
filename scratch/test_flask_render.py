import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import re
from app import app, db, User

class MockUser:
    is_authenticated = True
    is_active = True
    is_anonymous = False
    id = "admin"
    name = "System Admin"
    role = "admin"

with app.app_context():
    try:
        from flask import render_template, g
        g._login_user = MockUser()
        
        # Test rendering admin.html with Flask context
        with app.test_request_context('/admin'):
            from flask_login import login_user
            u = User.query.filter_by(role='admin').first()
            if u:
                login_user(u)
            
            rendered = render_template(
                'admin.html',
                students=[],
                faculties=[],
                pre_courses=[],
                section_offerings=[],
                windows=[],
                demand_data=[],
                departments=[],
                all_requests=[],
                all_grades=[],
                users_map={},
                faculty_map={},
                student_map={},
                students_0cr=[],
                current_semester='Summer 2026',
                pre_advising_active=False,
                final_advising_active=False,
                request_phase_active=False,
                drop_withdraw_active=False,
                fresh_login=False,
                notifications=[]
            )
            print("Rendered admin.html length:", len(rendered))
            
            scripts = re.findall(r'<script[\s\S]*?>([\s\S]*?)</script>', rendered, re.IGNORECASE)
            print(f"Found {len(scripts)} script blocks.")
            
            with open('scratch/rendered_script.js', 'w', encoding='utf-8') as f:
                f.write(scripts[-1])
            print("Saved script to scratch/rendered_script.js")
    except Exception as e:
        import traceback
        traceback.print_exc()
