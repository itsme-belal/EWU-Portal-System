
    function validateSectionForm(form) {
        // Validate building name AB1, AB2, AB3, FUB, Main
        const room = form.room.value.trim();
        const validPrefixes = ['AB1', 'AB2', 'AB3', 'FUB', 'Main'];
        let buildingOk = false;
        for (let prefix of validPrefixes) {
            if (room.startsWith(prefix)) {
                buildingOk = true;
                break;
            }
        }
        if (!buildingOk) {
            alert("Error: Room name must start with a valid building (AB1, AB2, AB3, FUB, or Main). Example: AB2-702");
            return false;
        }

        // Validate Days: schedule must only contain days code S, M, T, W, R
        const schedule = form.schedule.value.trim();
        if (!schedule.includes(':')) {
            alert("Error: Schedule format must be like 'MW:10.10-11.40' or 'S:8.00-11.00'.");
            return false;
        }
        const daysPart = schedule.split(':')[0];
        const validDays = ['S', 'M', 'T', 'W', 'R'];
        for (let char of daysPart) {
            if (!validDays.includes(char)) {
                alert("Error: Schedule days must only contain valid codes (S, M, T, W, R). Example: MW:10.10-11.40");
                return false;
            }
        }
        return true;
    }



    // ── TAB SWITCHER ──────────────────────────────────────────
    function updateBreadcrumbs(tabId) {
        const breadcrumbEl = document.getElementById('portal-breadcrumb');
        if (!breadcrumbEl) return;
        const homeLink = `<a href="javascript:void(0)" onclick="switchTab('dashboard')" class="hover:text-white hover:underline transition-colors">Home</a>`;
        const userMgmtLink = `<a href="javascript:void(0)" onclick="switchTab('students')" class="hover:text-white hover:underline transition-colors">User Management</a>`;
        const advisingLink = `<a href="javascript:void(0)" onclick="switchTab('pre-advising')" class="hover:text-white hover:underline transition-colors">Advising</a>`;
        const mapping = {
            'dashboard': `${homeLink} / <span class="text-white font-semibold">Dashboard</span>`,
            'students': `${homeLink} / ${userMgmtLink} / <span class="text-white font-semibold">Student Management</span>`,
            'faculty': `${homeLink} / ${userMgmtLink} / <span class="text-white font-semibold">Faculty Management</span>`,
            'advisor-assign': `${homeLink} / ${userMgmtLink} / <span class="text-white font-semibold">Advisor Assignment</span>`,
            'course-management': `${homeLink} / Curriculum & Timeline / <span class="text-white font-semibold">Course Management</span>`,
            'settings': `${homeLink} / Curriculum & Timeline / <span class="text-white font-semibold">System Settings</span>`,
            'pre-advising': `${homeLink} / ${advisingLink} / <span class="text-white font-semibold">Pre-Advising Setup</span>`,
            'final-advising': `${homeLink} / ${advisingLink} / <span class="text-white font-semibold">Final Advising Setup</span>`,
            'default-advising': `${homeLink} / ${advisingLink} / <span class="text-white font-semibold">Default Advising</span>`,
            'requests': `${homeLink} / ${advisingLink} / <span class="text-white font-semibold">Course Requests</span>`,
            'academic-records': `${homeLink} / <span class="text-white font-semibold">Academic Records</span>`,
            'reports': `${homeLink} / <span class="text-white font-semibold">Reports</span>`
        };
        breadcrumbEl.innerHTML = mapping[tabId] || `${homeLink} / <span class="text-white font-semibold">${tabId}</span>`;
    }

    function switchTab(tabId, forceReload = false) {
        if (forceReload) {
            const targetUrl = new URL(window.location.href);
            targetUrl.searchParams.set('tab', tabId);
            window.location.href = targetUrl.toString();
            return;
        }

        let tabEl = document.getElementById(`tab-${tabId}`);
        if (!tabEl) {
            tabId = 'dashboard';
            tabEl = document.getElementById('tab-dashboard');
        }

        sessionStorage.setItem('active_tab_id', tabId);
        sessionStorage.setItem('admin_active_tab', tabId);
        localStorage.setItem('admin_active_tab', tabId);

        try {
            const targetUrl = new URL(window.location.href);
            if (targetUrl.searchParams.get('tab') !== tabId) {
                targetUrl.searchParams.set('tab', tabId);
                window.history.replaceState({}, '', targetUrl.toString());
            }
        } catch (e) {}

        if (typeof closeAdminEditSectionModal === 'function') {
            closeAdminEditSectionModal();
        }

        document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
        if (tabEl) {
            tabEl.classList.remove('hidden');
        }

        // Remove active class from all nav items & sub items
        document.querySelectorAll('.adm-nav-item, .adm-sub-item').forEach(el => el.classList.remove('active'));
        
        // Find matching triggers and mark them active
        const mainBtn = document.getElementById(`nav-${tabId}`);
        if (mainBtn) {
            mainBtn.classList.add('active');
        }
        
        // Match sub-items dynamically
        document.querySelectorAll('.adm-sub-item').forEach(subBtn => {
            const onclickAttr = subBtn.getAttribute('onclick') || '';
            if (onclickAttr.includes(`switchTab('${tabId}')`)) {
                subBtn.classList.add('active');
                const submenu = subBtn.closest('.submenu');
                if (submenu) {
                    if (typeof toggleMenu === 'function') {
                        toggleMenu(submenu.id, true);
                    }
                    const parentId = submenu.id.replace('submenu-', 'nav-') + '-parent';
                    const parentEl = document.getElementById(parentId);
                    if (parentEl) {
                        parentEl.classList.add('active');
                    }
                }
            }
        });

        updateBreadcrumbs(tabId);
    }

    const isFreshLogin = {{ 'true' if fresh_login else 'false' }};
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');

    let savedTab;
    if (isFreshLogin) {
        sessionStorage.removeItem('admin_active_tab');
        localStorage.removeItem('admin_active_tab');
        savedTab = 'dashboard';
    } else if (tabParam) {
        savedTab = tabParam;
    } else {
        savedTab = sessionStorage.getItem('admin_active_tab') || localStorage.getItem('admin_active_tab') || 'dashboard';
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            switchTab(savedTab);
        });
    } else {
        switchTab(savedTab);
    }

    // ── LIVE CLOCK ───────────────────────────────────────────
    function updateClock() {
        const el = document.getElementById('live-time');
        if (!el) return;
        const now = new Date();
        el.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }
    setInterval(updateClock, 1000);
    updateClock();

    // ── STATS COUNTER ANIMATION ──────────────────────────────
    function animateCounters() {
        const counters = document.querySelectorAll('.counter-animate');
        counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-target'), 10) || 0;
            if (target === 0) {
                counter.textContent = '0';
                return;
            }
            let current = 0;
            const step = Math.ceil(target / 40);
            const timer = setInterval(() => {
                current += step;
                if (current >= target) {
                    counter.textContent = target;
                    clearInterval(timer);
                } else {
                    counter.textContent = current;
                }
            }, 15);
        });
    }
    setTimeout(animateCounters, 100);

    // ── SIDEBAR TOGGLE / 3-DOT menu action ────────────────────
    function toggleSidebarCollapse() {
        if (typeof toggleSidebar === 'function') {
            toggleSidebar();
        }
    }

    // ── CHART.JS ENROLLMENT DISTRIBUTION ─────────────────────
    const deptCounts = {};
    {% for s in students %}
        deptCounts["{{ s.department_id }}"] = (deptCounts["{{ s.department_id }}"] || 0) + 1;
    {% endfor %}

    const labels = Object.keys(deptCounts);
    const dataValues = Object.values(deptCounts);

    const ctx = document.getElementById('enrollmentChart');
    if (ctx && typeof Chart !== 'undefined') {
        // Create gradients
        const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 200);
        gradient.addColorStop(0, 'rgba(16, 185, 129, 0.45)');
        gradient.addColorStop(1, 'rgba(99, 102, 241, 0.08)');

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels.length ? labels : ['No Students'],
                datasets: [{
                    label: 'Enrolled Headcount',
                    data: dataValues.length ? dataValues : [0],
                    backgroundColor: gradient,
                    borderColor: '#10b981',
                    borderWidth: 1.5,
                    borderRadius: 8,
                    borderSkipped: false,
                    barThickness: 32
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { color: '#64748b', font: { family: 'Plus Jakarta Sans', size: 10 } }
                    },
                    y: {
                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                        ticks: { color: '#64748b', font: { family: 'Plus Jakarta Sans', size: 10 }, stepSize: 1 }
                    }
                }
            }
        });
    }

    // Theme Switcher API
    function setSystemTheme(theme) {
        localStorage.setItem('theme', theme);
        localStorage.setItem('ewu_theme', theme);
        if (typeof applyTheme === 'function') {
            applyTheme(theme);
            showToast('success', `Theme switched to ${theme.toUpperCase()} successfully!`);
        }
    }

    // ── ACADEMIC RECORDS & TRANSCRIPT ─────────────────────────
    const MAJOR_CREDITS = {
        'CSE': 140.0, 'EEE': 140.0, 'ICE': 140.0, 'CEN': 140.0,
        'GEB': 140.0, 'PHR': 170.0, 'DSA': 130.0, 'MAT': 130.0,
        'BBA': 130.0, 'ECO': 130.0, 'ENG': 130.0, 'LAW': 130.0,
        'SOC': 130.0, 'INF': 130.0, 'PPHS': 130.0
    };

    const studentData = [
        {% for std in students %}
        {
            id: {{ std.id | tojson }},
            name: {{ std.name | tojson }},
            department_id: {{ std.department_id | tojson }},
            completed_credits: {{ std.completed_credits or 0.0 }},
            cgpa: {{ std.cgpa or 0.0 }},
            outstanding_balance: {{ std.outstanding_balance or 0 }},
            financial_cleared: {{ 'true' if std.financial_cleared else 'false' }},
            advising_status: {{ (std.advising_status or 'not_started') | tojson }},
            profile_pic: {{ (std.profile_pic or '') | tojson }},
            about: {{ (std.about or '') | tojson }}
        },
        {% endfor %}
    ];

    const gradeData = [];

    function renderAcademicStudents(list) {
        const tbody = document.getElementById('academic-students-tbody');
        if (!tbody) return;
        tbody.innerHTML = '';
        
        if (list.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center text-slate-500 py-6">No students found matching filters.</td></tr>`;
            return;
        }
        
        list.forEach(std => {
            const tr = document.createElement('tr');
            tr.className = 'hover:bg-white/5 border-b border-white/5 transition-colors';
            tr.innerHTML = `
                <td class="px-6 py-4 font-mono font-bold text-xs text-emerald-400 cursor-pointer hover:underline" onclick="showAcademicReport('${std.id}')">${std.id}</td>
                <td class="px-6 py-4 text-xs font-semibold text-slate-200 cursor-pointer hover:text-violet-300 hover:underline" onclick="viewStudentDetails('${std.id}')">${std.name}</td>
                <td class="px-6 py-4 text-xs"><span class="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold border border-slate-700">${std.department_id}</span></td>
                <td class="px-6 py-4 text-xs font-medium text-slate-300">${std.completed_credits.toFixed(1)} CR</td>
                <td class="px-6 py-4 text-xs font-bold text-slate-200">${std.cgpa.toFixed(2)}</td>
                <td class="px-6 py-4 text-xs">
                    <button onclick="showAcademicReport('${std.id}')" class="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 font-bold transition-all flex items-center gap-1">
                        <i data-lucide="eye" class="w-3.5 h-3.5"></i> View Report
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
        
        if (typeof lucide !== 'undefined' && lucide.createIcons) {
            lucide.createIcons();
        }
    }
    
    function filterAcademicRecords() {
        const query = document.getElementById('student-search-input').value.toLowerCase().trim();
        const dept = document.getElementById('student-dept-filter').value;
        
        const filtered = studentData.filter(std => {
            const matchesQuery = std.id.toLowerCase().includes(query) || std.name.toLowerCase().includes(query);
            const matchesDept = dept === 'all' || std.department_id === dept;
            return matchesQuery && matchesDept;
        });
        
        renderAcademicStudents(filtered);
    }

    function filterCourseRequests() {
        const query = document.getElementById('request-search-input').value.toLowerCase().trim();
        const type = document.getElementById('request-type-filter').value;
        const status = document.getElementById('request-status-filter').value;
        
        document.querySelectorAll('.request-row').forEach(row => {
            const studentId = row.getAttribute('data-student-id').toLowerCase();
            const studentName = row.getAttribute('data-student-name').toLowerCase();
            const courseId = row.getAttribute('data-course-id').toLowerCase();
            const rowType = row.getAttribute('data-type');
            const rowStatus = row.getAttribute('data-status');
            
            const matchesQuery = studentId.includes(query) || studentName.includes(query) || courseId.includes(query);
            const matchesType = type === 'all' || rowType === type;
            const matchesStatus = status === 'all' || rowStatus === status;
            
            if (matchesQuery && matchesType && matchesStatus) {
                row.classList.remove('hidden');
            } else {
                row.classList.add('hidden');
            }
        });
    }

    function filterAdvisorAssignments() {
        const query = document.getElementById('advisor-student-search').value.toLowerCase().trim();
        document.querySelectorAll('.advisor-assignment-row').forEach(row => {
            const studentId = row.getAttribute('data-student-id').toLowerCase();
            const studentName = row.getAttribute('data-student-name').toLowerCase();
            if (studentId.includes(query) || studentName.includes(query)) {
                row.classList.remove('hidden');
            } else {
                row.classList.add('hidden');
            }
        });
    }

    function showAcademicReport(studentId) {
        const student = studentData.find(s => s.id === studentId);
        if (!student) return;
        
        // Populate hidden input for grade update form
        const formStudentIdInput = document.getElementById('modal-form-student-id');
        if (formStudentIdInput) {
            formStudentIdInput.value = studentId;
        }

        const advisingBtn = document.getElementById('modal-advising-action-btn');
        if (advisingBtn) {
            advisingBtn.href = `/admin/view-student-profile/${studentId}`;
        }
        
        const studentGrades = gradeData.filter(g => g.student_id === studentId);
        
        // Populate profile pic
        const picContainer = document.getElementById('modal-student-pic-container');
        if (picContainer) {
            if (student.profile_pic && student.profile_pic !== '[Image]' && !student.profile_pic.includes('[')) {
                const picUrl = (student.profile_pic.startsWith('http://') || student.profile_pic.startsWith('https://') || student.profile_pic.startsWith('//')) ? student.profile_pic : `/static/uploads/${student.profile_pic}`;
                picContainer.innerHTML = `<img src="${picUrl}" class="w-full h-full object-cover">`;
            } else {
                picContainer.innerHTML = `<i data-lucide="user" class="w-10 h-10 text-slate-500"></i>`;
            }
        }

        // Populate about bio
        const aboutContainer = document.getElementById('modal-student-about-container');
        const aboutText = document.getElementById('modal-student-about');
        if (aboutContainer && aboutText) {
            if (student.about && student.about.trim() !== '') {
                aboutText.textContent = student.about;
                aboutContainer.classList.remove('hidden');
            } else {
                aboutContainer.classList.add('hidden');
            }
        }

        document.getElementById('modal-student-name').textContent = student.name;
        document.getElementById('modal-student-id').textContent = student.id;
        document.getElementById('modal-student-dept').textContent = student.department_id;
        document.getElementById('modal-student-cgpa').textContent = student.cgpa.toFixed(3);
        
        document.getElementById('modal-credits-completed').textContent = student.completed_credits.toFixed(1) + ' CR';
        
        const reqCredits = MAJOR_CREDITS[student.department_id] || 140.0;
        const remCredits = Math.max(0.0, reqCredits - student.completed_credits);
        document.getElementById('modal-credits-remaining').textContent = remCredits.toFixed(1) + ' CR';
        
        const progressPct = Math.min(100, Math.round((student.completed_credits / reqCredits) * 100));
        const progressBar = document.getElementById('modal-progress-bar');
        progressBar.style.width = progressPct + '%';
        progressBar.className = `h-full rounded-full bg-gradient-to-r ${progressPct >= 80 ? 'from-emerald-500 to-teal-400' : progressPct >= 50 ? 'from-indigo-500 to-blue-400' : 'from-amber-500 to-orange-400'}`;
        
        const finStatus = document.getElementById('modal-financial-status');
        if (student.financial_cleared && student.outstanding_balance === 0) {
            finStatus.textContent = 'Cleared';
            finStatus.className = 'badge badge-success text-[0.6rem]';
        } else {
            finStatus.textContent = 'Hold';
            finStatus.className = 'badge badge-danger text-[0.6rem]';
        }
        
        document.getElementById('modal-outstanding-balance').textContent = student.outstanding_balance.toLocaleString() + ' Tk';
        
        const advStatus = document.getElementById('modal-advising-status');
        const formattedStatus = student.advising_status ? student.advising_status.replace('_', ' ').toUpperCase() : 'NOT STARTED';
        advStatus.textContent = formattedStatus;
        if (student.advising_status === 'approved') {
            advStatus.className = 'badge badge-success text-[0.6rem]';
        } else if (student.advising_status === 'planned') {
            advStatus.className = 'badge badge-warning text-[0.6rem]';
        } else {
            advStatus.className = 'badge badge-neutral text-[0.6rem]';
        }
        
        // Populate grades table on-demand via lightweight endpoint
        const tbody = document.getElementById('modal-grades-tbody');
        tbody.innerHTML = `<tr><td colspan="5" class="text-center text-slate-500 py-4 text-xs">Loading grades...</td></tr>`;

        fetch(`/admin/student-grades/${encodeURIComponent(studentId)}`)
            .then(r => r.ok ? r.json() : [])
            .then(studentGrades => {
                tbody.innerHTML = '';
                if (!studentGrades || studentGrades.length === 0) {
                    tbody.innerHTML = `<tr><td colspan="5" class="text-center text-slate-500 py-4 text-xs">No grade entries found.</td></tr>`;
                } else {
                    studentGrades.forEach(g => {
                        const tr = document.createElement('tr');
                        tr.className = 'border-b border-white/5';
                        
                        let badgeClass = 'badge-danger';
                        if (g.grade_point >= 3.0) badgeClass = 'badge-success';
                        else if (g.grade_point >= 2.0) badgeClass = 'badge-info';
                        
                        tr.innerHTML = `
                            <td class="px-4 py-2.5 text-xs font-semibold text-slate-300">${escapeHtml(g.course_code || '')}</td>
                            <td class="px-4 py-2.5 text-xs font-mono text-slate-400">${escapeHtml(g.semester_id || '')}</td>
                            <td class="px-4 py-2.5 text-xs"><span class="badge ${badgeClass} text-[0.6rem] font-bold">${escapeHtml(g.grade_letter || 'N/A')}</span></td>
                            <td class="px-4 py-2.5 text-xs font-bold text-slate-300">${(g.grade_point || 0.0).toFixed(2)}</td>
                            <td class="px-4 py-2.5 text-xs text-right">
                                <form action="/admin/delete-grade/${g.id}" method="POST" onsubmit="return confirm('Remove this grade record?')" class="inline">
                                    <button type="submit" class="text-red-400 hover:text-red-600 bg-none border-none p-1 rounded hover:bg-white/5 transition-all" title="Delete Grade">
                                        <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                                    </button>
                                </form>
                            </td>
                        `;
                        tbody.appendChild(tr);
                    });
                    if (window.lucide) window.lucide.createIcons();
                }
            })
            .catch(() => {
                tbody.innerHTML = `<tr><td colspan="5" class="text-center text-slate-500 py-4 text-xs">No grade entries found.</td></tr>`;
            });

        if (typeof lucide !== 'undefined' && lucide.createIcons) {
            lucide.createIcons();
        }
        
        // Show modal with animation
        const modal = document.getElementById('academic-report-modal');
        const content = document.getElementById('report-modal-content');
        if (modal && content) {
            modal.classList.remove('hidden');
            modal.classList.add('flex');
            setTimeout(() => {
                content.classList.remove('scale-95', 'opacity-0');
            }, 50);
        }
    }
    
    function closeAcademicReportModal() {
        const modal = document.getElementById('academic-report-modal');
        const content = document.getElementById('report-modal-content');
        content.classList.add('scale-95', 'opacity-0');
        setTimeout(() => {
            modal.classList.remove('flex');
            modal.classList.add('hidden');
        }, 300);
    }
    function previewImage(input, previewId) {
        const preview = document.getElementById(previewId);
        if (input.files && input.files[0]) {
            const reader = new FileReader();
            reader.onload = function(e) {
                preview.innerHTML = `<img src="${e.target.result}" class="w-full h-full object-cover">`;
            }
            reader.readAsDataURL(input.files[0]);
        } else {
            preview.innerHTML = `<i data-lucide="user" class="w-8 h-8"></i>`;
            if (typeof lucide !== 'undefined' && lucide.createIcons) {
                lucide.createIcons();
            }
        }
    }

    function updateCharCount(textarea, countId) {
        const counter = document.getElementById(countId);
        if (counter) {
            counter.textContent = textarea.value.length;
        }
    }
    
    function initReportsCharts() {
        if (typeof Chart === 'undefined') return;
        const deptCgpaCanvas = document.getElementById('dept-cgpa-chart');
        const advisingCanvas = document.getElementById('advising-status-chart');
        if (!deptCgpaCanvas || !advisingCanvas) return;

        // Process student data
        const deptTotals = {};
        const advisingCounts = { approved: 0, planned: 0, not_started: 0 };

        studentData.forEach(std => {
            // Department CGPA
            const dept = std.department_id || 'Unknown';
            if (!deptTotals[dept]) {
                deptTotals[dept] = { sum: 0, count: 0 };
            }
            deptTotals[dept].sum += std.cgpa || 0;
            deptTotals[dept].count += 1;

            // Advising Status
            const status = std.advising_status || 'not_started';
            if (status === 'approved') {
                advisingCounts.approved += 1;
            } else if (status === 'planned') {
                advisingCounts.planned += 1;
            } else {
                advisingCounts.not_started += 1;
            }
        });

        // Compute averages
        const deptLabels = [];
        const deptAverages = [];
        for (const [dept, data] of Object.entries(deptTotals)) {
            deptLabels.push(dept);
            deptAverages.push(data.count > 0 ? (data.sum / data.count).toFixed(3) : 0);
        }

        // Render Bar Chart
        new Chart(deptCgpaCanvas, {
            type: 'bar',
            data: {
                labels: deptLabels,
                datasets: [{
                    label: 'Avg CGPA',
                    data: deptAverages,
                    backgroundColor: 'rgba(16, 185, 129, 0.2)',
                    borderColor: '#10b981',
                    borderWidth: 1.5,
                    borderRadius: 6,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                },
                scales: {
                    y: {
                        min: 0,
                        max: 4.0,
                        grid: { color: 'rgba(255, 255, 255, 0.04)' },
                        ticks: { color: '#94a3b8', font: { size: 10 } }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: '#94a3b8', font: { size: 10 } }
                    }
                }
            }
        });

        // Render Doughnut Chart
        new Chart(advisingCanvas, {
            type: 'doughnut',
            data: {
                labels: ['Approved', 'Planned', 'Not Started'],
                datasets: [{
                    data: [advisingCounts.approved, advisingCounts.planned, advisingCounts.not_started],
                    backgroundColor: [
                        'rgba(16, 185, 129, 0.25)',
                        'rgba(99, 102, 241, 0.25)',
                        'rgba(239, 68, 68, 0.25)'
                    ],
                    borderColor: [
                        '#10b981',
                        '#6366f1',
                        '#ef4444'
                    ],
                    borderWidth: 1.5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { color: '#94a3b8', font: { size: 10 } }
                    }
                }
            }
        });
    }

    function filterBulkSections() {
        const q = document.getElementById('bulk-section-search').value.toLowerCase();
        const items = document.querySelectorAll('.bulk-section-item');
        items.forEach(item => {
            const code = item.getAttribute('data-code').toLowerCase();
            const sched = item.getAttribute('data-sched').toLowerCase();
            if (code.includes(q) || sched.includes(q)) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    }

    function filterAdminStudents() {
        const q = document.getElementById('admin-student-search-input').value.toLowerCase();
        const rows = document.querySelectorAll('.admin-student-row');
        rows.forEach(row => {
            const id = row.getAttribute('data-id').toLowerCase();
            const name = row.getAttribute('data-name').toLowerCase();
            if (id.includes(q) || name.includes(q)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    }

    function filterAdminFaculty() {
        const q = document.getElementById('admin-faculty-search-input').value.toLowerCase();
        const rows = document.querySelectorAll('.admin-faculty-row');
        rows.forEach(row => {
            const id = row.getAttribute('data-id').toLowerCase();
            const name = row.getAttribute('data-name').toLowerCase();
            if (id.includes(q) || name.includes(q)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    }

    function viewStudentDetails(stdId) {
        window.location.href = `/student-profile/${stdId}`;
    }

    function closeStudentModal(event) {
        if (event === null || event.target === document.getElementById('student-profile-modal')) {
            document.getElementById('student-profile-modal').classList.add('hidden');
        }
    }

    // Faculty modal
    function viewFacultyDetails(facId) {
        window.location.href = `/view-faculty-profile/${facId}`;
    }

    function closeFacultyModal(event) {
        if (event === null || event.target === document.getElementById('faculty-profile-modal')) {
            document.getElementById('faculty-profile-modal').classList.add('hidden');
        }
    }

    function closeAdminEditFacultyModal() {
        const modal = document.getElementById('admin-edit-faculty-modal');
        if (modal) {
            modal.style.display = 'none';
            modal.classList.add('hidden');
        }
    }

    function closeAdminEditStudentModal() {
        const modal = document.getElementById('admin-edit-student-modal');
        if (modal) {
            modal.style.display = 'none';
            modal.classList.add('hidden');
        }
    }

    function openAdminEditFacultyModal(facId) {
        // Show modal immediately with a loading state
        const modal = document.getElementById('admin-edit-faculty-modal');
        if (modal) {
            modal.classList.remove('hidden');
            modal.style.display = 'flex';
        }
        fetch(`/admin/faculty-details/${encodeURIComponent(facId)}`, {
            method: 'GET',
            credentials: 'same-origin',
            headers: { 'X-Requested-With': 'XMLHttpRequest' }
        })
            .then(res => {
                if (!res.ok) throw new Error(`Server error: ${res.status} ${res.statusText}`);
                return res.json();
            })
            .then(data => {
                if (data.status === 'success') {
                    const setVal = (id, val) => {
                        const el = document.getElementById(id);
                        if (el) el.value = val ?? '';
                    };
                    setVal('edit-fac-id', data.id);
                    setVal('edit-fac-name', data.name);
                    setVal('edit-fac-dept', data.department_id);
                    setVal('edit-fac-post', data.post || '');
                    setVal('edit-fac-office', data.office || '');
                    setVal('edit-fac-phone', data.phone || '');
                    setVal('edit-fac-research', data.research_interests || '');
                    setVal('edit-fac-about', data.about || '');
                    setVal('edit-fac-present', data.present_address || '');
                    setVal('edit-fac-permanent', data.permanent_address || '');
                    
                    const headerName = document.getElementById('edit-fac-header-name');
                    if (headerName) headerName.textContent = data.name ? `Edit Profile: ${data.name}` : 'Edit Faculty Profile';

                    const initial = document.getElementById('edit-fac-initial');
                    const img = document.getElementById('edit-fac-avatar-img');
                    if (data.profile_pic && data.profile_pic !== '[Image]' && !data.profile_pic.includes('[')) {
                        const picUrl = (data.profile_pic.startsWith('http://') || data.profile_pic.startsWith('https://') || data.profile_pic.startsWith('//')) ? data.profile_pic : `/static/uploads/${data.profile_pic}`;
                        if (img) { img.src = picUrl; img.classList.remove('hidden'); }
                        if (initial) initial.classList.add('hidden');
                    } else {
                        if (img) img.classList.add('hidden');
                        if (initial) { initial.textContent = (data.name ? data.name[0] : 'F').toUpperCase(); initial.classList.remove('hidden'); }
                    }

                    const formEl = document.getElementById('admin-edit-faculty-form');
                    if (formEl) formEl.action = `/admin/edit-faculty/${encodeURIComponent(data.id)}`;
                } else {
                    closeAdminEditFacultyModal();
                    alert(data.message || 'Error fetching faculty details.');
                }
            })
            .catch(err => {
                closeAdminEditFacultyModal();
                console.error('Error in openAdminEditFacultyModal:', err);
                alert('Could not load faculty details. Please try again.\n(' + (err.message || err) + ')');
            });
    }

    function openAdminEditStudentModal(stdId) {
        // Show modal immediately with a loading state
        const modal = document.getElementById('admin-edit-student-modal');
        if (modal) {
            modal.classList.remove('hidden');
            modal.style.display = 'flex';
        }
        fetch(`/admin/student-details/${encodeURIComponent(stdId)}`, {
            method: 'GET',
            credentials: 'same-origin',
            headers: { 'X-Requested-With': 'XMLHttpRequest' }
        })
            .then(res => {
                if (!res.ok) throw new Error(`Server error: ${res.status} ${res.statusText}`);
                return res.json();
            })
            .then(data => {
                if (data.status === 'success') {
                    const setVal = (id, val) => {
                        const el = document.getElementById(id);
                        if (el) el.value = val ?? '';
                    };
                    setVal('edit-std-id', data.id);
                    setVal('edit-std-name', data.name);
                    setVal('edit-std-dept', data.department_id);
                    setVal('edit-std-phone', data.phone_number || '');
                    setVal('edit-std-cgpa', data.cgpa ?? 0);
                    setVal('edit-std-credits', data.completed_credits ?? 0);
                    setVal('edit-std-balance', data.outstanding_balance ?? 0);
                    
                    const clearedChk = document.getElementById('edit-std-cleared');
                    if (clearedChk) clearedChk.checked = !!data.financial_cleared;

                    setVal('edit-std-about', data.about || '');
                    setVal('edit-std-present', data.present_address || '');
                    setVal('edit-std-permanent', data.permanent_address || '');
                    
                    const headerName = document.getElementById('edit-std-header-name');
                    if (headerName) headerName.textContent = data.name ? `Edit Profile: ${data.name}` : 'Edit Student Profile';

                    const initial = document.getElementById('edit-std-initial');
                    const img = document.getElementById('edit-std-avatar-img');
                    if (data.profile_pic && data.profile_pic !== '[Image]' && !data.profile_pic.includes('[')) {
                        const picUrl = (data.profile_pic.startsWith('http://') || data.profile_pic.startsWith('https://') || data.profile_pic.startsWith('//')) ? data.profile_pic : `/static/uploads/${data.profile_pic}`;
                        if (img) { img.src = picUrl; img.classList.remove('hidden'); }
                        if (initial) initial.classList.add('hidden');
                    } else {
                        if (img) img.classList.add('hidden');
                        if (initial) { initial.textContent = (data.name ? data.name[0] : 'S').toUpperCase(); initial.classList.remove('hidden'); }
                    }

                    const formEl = document.getElementById('admin-edit-student-form');
                    if (formEl) formEl.action = `/admin/edit-student/${encodeURIComponent(data.id)}`;
                } else {
                    closeAdminEditStudentModal();
                    alert(data.message || 'Error fetching student details.');
                }
            })
            .catch(err => {
                closeAdminEditStudentModal();
                console.error('Error in openAdminEditStudentModal:', err);
                alert('Could not load student details. Please try again.\n(' + (err.message || err) + ')');
            });
    }

    function openAdminEditSectionModalFromBtn(btn) {
        if (!btn) return;
        try {
            const id = btn.getAttribute('data-sec-id') || '';
            const code = btn.getAttribute('data-sec-code') || '';
            const title = btn.getAttribute('data-sec-title') || '';
            const num = btn.getAttribute('data-sec-num') || 1;
            const sched = btn.getAttribute('data-sec-sched') || '';
            const credits = btn.getAttribute('data-sec-credits') || 3.0;
            const cap = btn.getAttribute('data-sec-cap') || 30;
            const room = btn.getAttribute('data-sec-room') || '';
            const dept = btn.getAttribute('data-sec-dept') || '';
            const prereq = btn.getAttribute('data-sec-prereq') || '';
            const linked = btn.getAttribute('data-sec-linked') || '';
            const minCredit = btn.getAttribute('data-sec-min-credit') || 0;
            const facId = btn.getAttribute('data-sec-fac') || '';

            openAdminEditSectionModal(id, code, title, num, sched, credits, cap, room, dept, prereq, linked, minCredit, facId);
        } catch(e) {
            console.error("Error extracting section data:", e);
        }
    }

    function openAdminEditSectionModal(id, code, title, num, sched, credits, cap, room, dept, prereq, linked, minCredit, facId) {
        const setVal = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.value = val;
        };

        setVal('edit-sec-code', code || '');
        setVal('edit-sec-title', title || '');
        setVal('edit-sec-num', num || 1);
        setVal('edit-sec-sched', sched || '');
        setVal('edit-sec-credits', credits || 3.0);
        setVal('edit-sec-cap', cap || 30);
        setVal('edit-sec-room', room || '');
        setVal('edit-sec-dept', dept || '');
        setVal('edit-sec-prereq', prereq || '');
        setVal('edit-sec-linked', linked || '');
        setVal('edit-sec-min-credit', minCredit || 0.0);
        setVal('edit-sec-faculty', facId || '');
        
        const form = document.getElementById('admin-edit-section-form');
        if (form) form.action = `/admin/edit-section/${id}`;

        const modal = document.getElementById('admin-edit-section-modal');
        if (modal) {
            modal.classList.remove('hidden');
            modal.style.setProperty('display', 'flex', 'important');
        }
    }

    function closeAdminEditSectionModal() {
        const modal = document.getElementById('admin-edit-section-modal');
        if (modal) {
            modal.classList.add('hidden');
            modal.style.setProperty('display', 'none', 'important');
        }
    }

    function toggleCourseView(mode) {
        const tableView = document.getElementById('course-table-view');
        const cardView = document.getElementById('course-card-view');
        const btnTable = document.getElementById('view-btn-table');
        const btnCard = document.getElementById('view-btn-card');
        if (!tableView || !cardView) return;

        localStorage.setItem('ewu_course_view', mode);

        if (mode === 'card') {
            tableView.classList.add('hidden');
            cardView.classList.remove('hidden');
            if (btnTable) { btnTable.classList.remove('active'); btnTable.classList.add('text-slate-600', 'dark:text-slate-400'); }
            if (btnCard) { btnCard.classList.add('active'); btnCard.classList.remove('text-slate-600', 'dark:text-slate-400'); }
        } else {
            cardView.classList.add('hidden');
            tableView.classList.remove('hidden');
            if (btnCard) { btnCard.classList.remove('active'); btnCard.classList.add('text-slate-600', 'dark:text-slate-400'); }
            if (btnTable) { btnTable.classList.add('active'); btnTable.classList.remove('text-slate-600', 'dark:text-slate-400'); }
        }
    }

    function filterSections() {
        const searchInput = document.getElementById("section-search");
        const deptSelect = document.getElementById("dept-filter");
        const typeSelect = document.getElementById("type-filter");
        const statusSelect = document.getElementById("status-filter");

        const filterText = searchInput ? searchInput.value.toLowerCase().trim() : "";
        const selectedDept = deptSelect ? deptSelect.value.toUpperCase() : "ALL";
        const selectedType = typeSelect ? typeSelect.value.toUpperCase() : "ALL";
        const selectedStatus = statusSelect ? statusSelect.value.toUpperCase() : "ALL";

        const rows = document.querySelectorAll(".course-row");
        const cards = document.querySelectorAll(".course-card");
        let visibleCount = 0;

        function matchesFilters(code, dept, type, pct, textContent) {
            const matchesText = !filterText || textContent.toLowerCase().includes(filterText);
            const matchesDept = selectedDept === "ALL" || dept.includes(selectedDept);
            const matchesType = selectedType === "ALL" || type === selectedType;
            let matchesStatus = true;
            if (selectedStatus === "OPEN") matchesStatus = pct < 85;
            else if (selectedStatus === "ALMOST") matchesStatus = pct >= 85 && pct < 100;
            else if (selectedStatus === "FULL") matchesStatus = pct >= 100;

            return matchesText && matchesDept && matchesType && matchesStatus;
        }

        rows.forEach(row => {
            const code = row.getAttribute('data-code') || "";
            const dept = row.getAttribute('data-dept') || "";
            const type = row.getAttribute('data-type') || "";
            const pct = parseFloat(row.getAttribute('data-pct') || "0");
            const textContent = row.innerText || "";

            if (matchesFilters(code, dept, type, pct, textContent)) {
                row.style.display = "";
                visibleCount++;
            } else {
                row.style.display = "none";
            }
        });

        cards.forEach(card => {
            const code = card.getAttribute('data-code') || "";
            const dept = card.getAttribute('data-dept') || "";
            const type = card.getAttribute('data-type') || "";
            const pct = parseFloat(card.getAttribute('data-pct') || "0");
            const textContent = card.innerText || "";

            if (matchesFilters(code, dept, type, pct, textContent)) {
                card.style.display = "";
            } else {
                card.style.display = "none";
            }
        });

        const emptyState = document.getElementById("no-results-empty-state");
        const tableView = document.getElementById("course-table-view");
        const cardView = document.getElementById("course-card-view");

        if (visibleCount === 0 && (rows.length > 0 || cards.length > 0)) {
            if (emptyState) emptyState.classList.remove('hidden');
            if (tableView) tableView.classList.add('hidden');
            if (cardView) cardView.classList.add('hidden');
        } else {
            if (emptyState) emptyState.classList.add('hidden');
            const savedView = localStorage.getItem('ewu_course_view') || 'table';
            if (savedView === 'card') {
                if (cardView) cardView.classList.remove('hidden');
            } else {
                if (tableView) tableView.classList.remove('hidden');
            }
        }
    }

    function adjustCapacity(secId, delta) {
        const input = document.getElementById(`cap-input-${secId}`) || document.getElementById(`card-cap-input-${secId}`);
        const form = document.getElementById(`cap-form-${secId}`) || document.getElementById(`card-cap-form-${secId}`);
        if (!input || !form) return;
        let current = parseInt(input.value || "30", 10);
        let nextVal = current + delta;
        if (nextVal < 0) nextVal = 0;
        if (nextVal > 500) nextVal = 500;
        input.value = nextVal;

        const formData = new FormData();
        formData.append('capacity', nextVal);

        fetch(`/admin/edit-capacity/${encodeURIComponent(secId)}`, {
            method: 'POST',
            body: formData,
            headers: { 'X-Requested-With': 'XMLHttpRequest' }
        })
        .then(res => res.json())
        .then(data => {
            if (data.status === 'success') {
                input.value = data.capacity;
                // Update seats left pill text if present
                const row = input.closest('tr') || input.closest('.course-card');
                if (row) {
                    const enrolledSpan = row.querySelector('.enrolled-number');
                    const enrolled = enrolledSpan ? parseInt(enrolledSpan.textContent || '0', 10) : 0;
                    const seatsLeft = Math.max(0, data.capacity - enrolled);
                    const leftEl = row.querySelector('.seats-left-text');
                    if (leftEl) leftEl.textContent = `${seatsLeft} seats left`;
                }
            } else {
                form.submit();
            }
        })
        .catch(() => {
            form.submit();
        });
    }

    function clearSectionFilters() {
        const searchInput = document.getElementById("section-search");
        const deptSelect = document.getElementById("dept-filter");
        const typeSelect = document.getElementById("type-filter");
        const statusSelect = document.getElementById("status-filter");

        if (searchInput) searchInput.value = "";
        if (deptSelect) deptSelect.value = "ALL";
        if (typeSelect) typeSelect.value = "ALL";
        if (statusSelect) statusSelect.value = "ALL";

        filterSections();
    }

    // Initial call on DOMContentLoaded for academic records, view preferences, and charts
    document.addEventListener('DOMContentLoaded', () => {
        // Enforce present & future selection only on date/time inputs
        const nowLocal = new Date();
        nowLocal.setMinutes(nowLocal.getMinutes() - nowLocal.getTimezoneOffset());
        const nowIsoStr = nowLocal.toISOString().slice(0, 16);
        document.querySelectorAll('input[type="datetime-local"], input[type="date"]').forEach(inp => {
            if (!inp.getAttribute('min')) {
                inp.setAttribute('min', nowIsoStr);
            }
            inp.addEventListener('change', function() {
                if (this.value && this.value < nowIsoStr) {
                    alert('Past dates and times cannot be selected. Setting to current time.');
                    this.value = nowIsoStr;
                }
            });
        });

        renderAcademicStudents(studentData);
        initReportsCharts();
        const savedView = localStorage.getItem('ewu_course_view') || 'table';
        toggleCourseView(savedView);
    });
