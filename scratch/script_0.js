
    // Global advising & registration data (defined at top to avoid Temporal Dead Zone errors)
    let planCourseCodes = [];
    const coursesData = [];
    let registrationsList = [];
    const sectionsData = [];
    const failedCodes = [];
    const dCodes = [];
    const recommendedCodes = [];
    const passedCodes = [];
    let currentAdvisingFilter = 'recommended';
    let searchAdvisingQuery = '';
    let currentAdvisingView = 'card';
    let expandedCourses = new Set();
    let currentReqAddView = 'card';
    let reqAddExpandedCourses = new Set();
    let currentReqSeatView = 'card';
    let reqSeatExpandedCourses = new Set();
    
    // Portal phase entry controls
    const isPreActive = [];
    const isFinalActive = [];
    const prePlanSubmitted = [];

    function updateBreadcrumbs(tabId) {
        const breadcrumbEl = document.getElementById('portal-breadcrumb');
        if (!breadcrumbEl) return;
        const homeLink = `<a href="javascript:void(0)" onclick="switchTab('dashboard')" class="hover:text-white hover:underline transition-colors">Home</a>`;
        const mapping = {
            'dashboard': `${homeLink} / <span class="text-white font-semibold">Dashboard</span>`,
            'advising': `${homeLink} / <span class="text-white font-semibold">Advising</span>`,
            'schedule': `${homeLink} / <span class="text-white font-semibold">Class Schedule</span>`,
            'grade-report': `${homeLink} / <span class="text-white font-semibold">Grade Report</span>`,
            'settings': `${homeLink} / <span class="text-white font-semibold">My Profile</span>`
        };
        breadcrumbEl.innerHTML = mapping[tabId] || `${homeLink} / <span class="text-white font-semibold">${tabId}</span>`;
    }

    // Tab switching
    function switchTab(tabId) {
        sessionStorage.setItem('active_tab_id', tabId);
        if (tabId === 'profile') {
            tabId = 'settings';
        } else if (tabId === 'slip') {
            tabId = 'schedule';
        }
        const target = document.getElementById(`tab-${tabId}`);
        if (!target) {
            tabId = 'dashboard';
        }
        document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
        document.getElementById(`tab-${tabId}`).classList.remove('hidden');

        document.querySelectorAll('.nav-item, .nav-sub-item').forEach(el => el.classList.remove('active'));
        
        // Highlight active sub-items or main items
        const mainBtn = document.getElementById(`nav-${tabId}`);
        if (mainBtn) {
            mainBtn.classList.add('active');
        }

        if (tabId === 'advising') {
            showAdvisingHub();
        } else if (tabId === 'requests') {
            const reqActive = [];
            const dropActive = [];
            if (reqActive) {
                toggleRequestForm('add-course');
            } else if (dropActive) {
                toggleRequestForm('drop-course');
            }
        }

        updateBreadcrumbs(tabId);
        localStorage.setItem('student_active_tab', tabId);
    }

    function toggleRequestForm(formId) {
        ['add-course', 'change-section', 'seat-increase', 'drop-course', 'withdraw-course'].forEach(f => {
            const formEl = document.getElementById(`form-${f}`);
            if (formEl) formEl.classList.add('hidden');
            const btnEl = document.getElementById(`btn-form-${f}`);
            if (btnEl) {
                btnEl.className = "px-3.5 py-1.5 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-transparent transition-all";
            }
        });
        
        const targetForm = document.getElementById(`form-${formId}`);
        if (targetForm) targetForm.classList.remove('hidden');
        const targetBtn = document.getElementById(`btn-form-${formId}`);
        if (targetBtn) {
            targetBtn.className = "px-3.5 py-1.5 rounded-lg text-xs font-bold bg-blue-600 text-white border border-blue-600 transition-all";
        }
        if (formId === 'add-course') {
            if (typeof loadReqAddSections === 'function') {
                loadReqAddSections();
                updateReqAddCartUI();
            }
        } else if (formId === 'seat-increase') {
            if (typeof loadReqSeatSections === 'function') {
                loadReqSeatSections();
                updateReqSeatCartUI();
            }
        }
    }

    function showForm(formId) {
        toggleRequestForm(formId);
        document.querySelectorAll('.nav-item, .nav-sub-item').forEach(el => el.classList.remove('active'));
        let subNavId = '';
        if (formId === 'add-course') subNavId = 'nav-add-request';
        else if (formId === 'change-section') subNavId = 'nav-section-change';
        else if (formId === 'seat-increase') subNavId = 'nav-seat-request';
        else if (formId === 'drop-course') subNavId = 'nav-drop-request';
        else if (formId === 'withdraw-course') subNavId = 'nav-withdraw-request';
        
        const subNavEl = document.getElementById(subNavId);
        if (subNavEl) subNavEl.classList.add('active');
    }

    function showRequestTab(formId) {
        const mappedForm = formId === 'seat-request' ? 'seat-increase' : (formId === 'drop-request' ? 'drop-course' : (formId === 'withdraw-request' ? 'withdraw-course' : formId));
        toggleRequestForm(mappedForm);
        showForm(mappedForm);
    }

    function focusInstallments() {
        setTimeout(() => {
            const els = document.querySelectorAll('.card');
            // Try to find the installment card title
            els.forEach(el => {
                if (el.textContent.includes('Payment Installments') || el.textContent.includes('Installment #')) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    el.classList.add('ring-2', 'ring-blue-500/50');
                    setTimeout(() => el.classList.remove('ring-2', 'ring-blue-500/50'), 2000);
                }
            });
            document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
            const navEl = document.getElementById('nav-installments');
            if (navEl) navEl.classList.add('active');
        }, 100);
    }

    // CGPA Masking Control
    let cgpaVisible = false;
    const cgpaRaw = "[]";
    function toggleCGPA() {
        const valueSpan = document.getElementById('cgpa-value');
        const eyeIcon = document.getElementById('cgpa-eye-icon');
        cgpaVisible = !cgpaVisible;
        if (cgpaVisible) {
            valueSpan.textContent = cgpaRaw;
            eyeIcon.setAttribute('data-lucide', 'eye-off');
        } else {
            valueSpan.textContent = '***';
            eyeIcon.setAttribute('data-lucide', 'eye');
        }
        lucide.createIcons();
    }

    // Portal phase entry controls (moved to top of script)

    function showAdvisingHub() {
        const hub = document.getElementById('advising-hub');
        const preWork = document.getElementById('pre-advising-workspace');
        const finalWork = document.getElementById('final-advising-workspace');
        if (hub) hub.classList.remove('hidden');
        if (preWork) preWork.classList.add('hidden');
        if (finalWork) finalWork.classList.add('hidden');
    }

    function enterPreAdvisingPhase() {
        switchTab('advising');
        const hub = document.getElementById('advising-hub');
        const preWork = document.getElementById('pre-advising-workspace');
        const finalWork = document.getElementById('final-advising-workspace');
        if (hub) hub.classList.add('hidden');
        if (preWork) preWork.classList.remove('hidden');
        if (finalWork) finalWork.classList.add('hidden');
        filterPreAdvising('recommended');
        updatePreAdvisingCartList();

    }

    function enterFinalAdvisingPhase() {
        switchTab('advising');
        const hub = document.getElementById('advising-hub');
        const preWork = document.getElementById('pre-advising-workspace');
        const finalWork = document.getElementById('final-advising-workspace');
        if (hub) hub.classList.add('hidden');
        if (preWork) preWork.classList.add('hidden');
        if (finalWork) finalWork.classList.remove('hidden');
        filterAdvisingSections('recommended');

        const hasRegistered = registrationsList.length > 0;
        if (!isFinalActive && !hasRegistered) {
            showToast('info', 'Final Advising phase is not active (View-Only mode).');
        }
    }

    // Pre-advising selections (moved to top of script)

    function updatePreAdvisingCartList() {
        const listDiv = document.getElementById('pre-advising-cart-list');
        if (!listDiv) return;
        listDiv.innerHTML = '';
        if (planCourseCodes.length === 0) {
            listDiv.innerHTML = `<p class="text-slate-500 italic text-[0.7rem] text-center py-2">No courses selected.</p>`;
            return;
        }
        planCourseCodes.forEach(code => {
            const course = coursesData.find(x => x.code === code);
            const title = course ? course.title : '';
            const credits = course ? course.credits : 0;
            
            // Check if there is a lab course combined
            const labCode = code + " Lab";
            const labCourse = coursesData.find(x => x.code === labCode);
            const cleanTitle = (title && title.toUpperCase() !== code.toUpperCase()) ? title : '';
            const displayTitle = labCourse ? (cleanTitle ? `${cleanTitle} & Lab` : 'Theory & Lab') : cleanTitle;
            const displayCredits = labCourse ? (credits + labCourse.credits) : credits;

            listDiv.innerHTML += `
                <div class="flex justify-between items-center bg-slate-900/40 p-2 rounded-lg border border-white/5 text-xs">
                    <div>
                        <span class="font-bold text-slate-200">${code}</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="text-[0.65rem] font-bold text-slate-400">${displayCredits} CR</span>
                        <button onclick="togglePlanCourse('${code}', 'remove')" class="text-rose-400 hover:text-rose-300 font-bold p-1">
                            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                        </button>
                    </div>
                </div>
            `;
        });
        lucide.createIcons();
    }

    function togglePlanCourse(code, action = 'add') {
        const idx = planCourseCodes.indexOf(code);
        let selectedNow = false;
        let originalPlanCodes = [...planCourseCodes];

        if (action === 'remove') {
            if (idx > -1) {
                planCourseCodes.splice(idx, 1);
                selectedNow = false;
            } else {
                return;
            }
        } else { // action === 'add'
            if (idx > -1) {
                // Already selected, do nothing
                return;
            }
            if (planCourseCodes.length >= 6) {
                showToast('error', 'Limit exceeded: Maximum of 6 courses allowed.');
                return;
            }
            const courseToAdd = coursesData.find(x => x.code === code);
            let currentCredits = 0;
            planCourseCodes.forEach(c => {
                const course = coursesData.find(x => x.code === c);
                if (course) currentCredits += course.credits;
            });
            if (courseToAdd && currentCredits + courseToAdd.credits > 15) {
                showToast('error', 'Limit exceeded: Maximum of 15.0 credits allowed.');
                return;
            }
            planCourseCodes.push(code);
            selectedNow = true;
        }

        let credits = 0;
        planCourseCodes.forEach(c => {
            const course = coursesData.find(x => x.code === c);
            if (course) credits += course.credits;
        });

        document.getElementById('plan-count').textContent = `${planCourseCodes.length} / 6`;
        document.getElementById('plan-credits').textContent = `${credits} / 15 CR`;
        document.getElementById('plan-input').value = JSON.stringify(planCourseCodes);

        const btnSave = document.querySelector('#plan-form button');
        if (planCourseCodes.length < 3 || planCourseCodes.length > 6 || credits < 9 || credits > 15) {
            if (btnSave) btnSave.setAttribute('disabled', 'true');
        } else {
            if (btnSave) btnSave.removeAttribute('disabled');
        }

        // Toggling visual elements locally
        const cardEl = document.getElementById(`course-card-${code}`);
        const checkEl = document.getElementById(`check-badge-${code}`);
        if (cardEl) {
            if (selectedNow) {
                cardEl.classList.remove('border-[#e2e8f0]', 'dark:border-[#1e293b]', 'hover:bg-slate-50', 'dark:hover:bg-slate-900/10');
                cardEl.classList.add('border-blue-500', 'bg-blue-50/50', 'dark:bg-blue-950/25');
                if (checkEl) {
                    checkEl.classList.remove('opacity-0', 'scale-75');
                    checkEl.classList.add('opacity-100', 'scale-100');
                }
            } else {
                cardEl.classList.remove('border-blue-500', 'bg-blue-50/50', 'dark:bg-blue-950/25');
                cardEl.classList.add('border-[#e2e8f0]', 'dark:border-[#1e293b]', 'hover:bg-slate-50', 'dark:hover:bg-slate-900/10');
                if (checkEl) {
                    checkEl.classList.remove('opacity-100', 'scale-100');
                    checkEl.classList.add('opacity-0', 'scale-75');
                }
            }
        }

        updatePreAdvisingCartList();

        // AJAX Autosave
        fetch('/student/save-plan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ course_ids: planCourseCodes })
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                showToast('success', 'Plan auto-saved.');
            } else {
                showToast('error', data.message || 'Auto-save failed.');
                // Revert
                planCourseCodes = originalPlanCodes;
                let revertedCredits = 0;
                planCourseCodes.forEach(c => {
                    const course = coursesData.find(x => x.code === c);
                    if (course) revertedCredits += course.credits;
                });
                document.getElementById('plan-count').textContent = `${planCourseCodes.length} / 6`;
                document.getElementById('plan-credits').textContent = `${revertedCredits} / 15 CR`;
                document.getElementById('plan-input').value = JSON.stringify(planCourseCodes);
                
                const cardElRevert = document.getElementById(`course-card-${code}`);
                const checkElRevert = document.getElementById(`check-badge-${code}`);
                if (cardElRevert) {
                    if (planCourseCodes.includes(code)) {
                        cardElRevert.classList.remove('border-[#e2e8f0]', 'dark:border-[#1e293b]', 'hover:bg-slate-50', 'dark:hover:bg-slate-900/10');
                        cardElRevert.classList.add('border-blue-500', 'bg-blue-50/50', 'dark:bg-blue-950/25');
                        if (checkElRevert) {
                            checkElRevert.classList.remove('opacity-0', 'scale-75');
                            checkElRevert.classList.add('opacity-100', 'scale-100');
                        }
                    } else {
                        cardElRevert.classList.remove('border-blue-500', 'bg-blue-50/50', 'dark:bg-blue-950/25');
                        cardElRevert.classList.add('border-[#e2e8f0]', 'dark:border-[#1e293b]', 'hover:bg-slate-50', 'dark:hover:bg-slate-900/10');
                        if (checkElRevert) {
                            checkElRevert.classList.remove('opacity-100', 'scale-100');
                            checkElRevert.classList.add('opacity-0', 'scale-75');
                        }
                    }
                }
                updatePreAdvisingCartList();
            }
        })
        .catch(err => {
            console.error(err);
            showToast('error', 'Network error during auto-save.');
        });
    }

    document.addEventListener('DOMContentLoaded', () => {
        const planForm = document.getElementById('plan-form');
        if (planForm) {
            planForm.addEventListener('submit', function(e) {
                e.preventDefault();
                const courseIds = JSON.parse(document.getElementById('plan-input').value || '[]');
                fetch('/student/save-plan', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ course_ids: courseIds })
                })
                .then(res => res.json())
                .then(data => {
                    if (data.status === 'success') {
                        showToast('success', 'Pre-Advising choices successfully confirmed and saved.');
                    } else {
                        showToast('error', data.message || 'Confirmation failed.');
                    }
                })
                .catch(err => {
                    showToast('error', 'Network error during confirmation.');
                });
            });
        }
    });

    function filterPreAdvising(category) {
        const btns = ['recommended', 'retake', 'd_grade', 'f_grade'];
        btns.forEach(b => {
            const btn = document.getElementById('pre-filter-' + b);
            if (btn) {
                if (b === category) {
                    btn.classList.add('bg-blue-600', 'text-white');
                    btn.classList.remove('bg-slate-100', 'dark:bg-slate-800', 'text-slate-800', 'dark:text-slate-200');
                } else {
                    btn.classList.remove('bg-blue-600', 'text-white');
                    btn.classList.add('bg-slate-100', 'dark:bg-slate-800', 'text-slate-800', 'dark:text-slate-200');
                }
            }
        });

        const cards = document.querySelectorAll('.pre-course-card');
        cards.forEach(card => {
            let show = false;
            if (category === 'recommended') {
                show = card.getAttribute('data-is-recommended') === 'true';
            } else if (category === 'retake') {
                show = card.getAttribute('data-is-retake') === 'true';
            } else if (category === 'd_grade') {
                show = card.getAttribute('data-is-d-grade') === 'true';
            } else if (category === 'f_grade') {
                show = card.getAttribute('data-is-f-grade') === 'true';
            }

            if (show) {
                card.classList.remove('hidden');
            } else {
                card.classList.add('hidden');
            }
        });
    }

    // Final advising AJAX booking and filtering logic (moved to top of script)

    function searchAdvisingCourses() {
        searchAdvisingQuery = document.getElementById('course-search-input').value.trim().toUpperCase();
        loadAdvisingSections();
    }

    function filterAdvisingSections(filterType) {
        currentAdvisingFilter = filterType;
        document.querySelectorAll('[id^="filter-"]').forEach(el => {
            el.classList.remove('active-filter', 'bg-blue-600', 'text-white');
            el.classList.add('bg-slate-100', 'dark:bg-slate-800', 'text-slate-800', 'dark:text-slate-200');
        });
        const activeBtn = document.getElementById(`filter-${filterType}`);
        if (activeBtn) {
            activeBtn.classList.remove('bg-slate-100', 'dark:bg-slate-800', 'text-slate-800', 'dark:text-slate-200');
            activeBtn.classList.add('active-filter', 'bg-blue-600', 'text-white');
        }
        loadAdvisingSections();
    }

    function parseSchedule(scheduleStr) {
        if (!scheduleStr) return [];
        try {
            const s = String(scheduleStr).trim();
            let match = s.match(/^([A-Za-z]+)[:\s]*([\d\.:]+)\s*(?:AM|PM)?\s*-\s*([\d\.:]+)\s*(AM|PM)?/i);
            let daysStr, startStr, endStr;
            if (match) {
                daysStr = match[1];
                startStr = match[2];
                endStr = match[3];
            } else {
                match = s.match(/([A-Za-z]+).*?(\d{1,2}[\.\:]\d{2}).*?(\d{1,2}[\.\:]\d{2})/);
                if (!match) return [];
                daysStr = match[1];
                startStr = match[2];
                endStr = match[3];
            }
            const days = Array.from(daysStr.toUpperCase());
            const toMin = (tStr) => {
                let clean = tStr.trim().replace('.', ':');
                const isPm = /PM/i.test(tStr);
                const isAm = /AM/i.test(tStr);
                clean = clean.replace(/[^\d:]/g, '');
                const pts = clean.split(':');
                let h = parseInt(pts[0]) || 0;
                let m = pts[1] ? parseInt(pts[1]) : 0;
                if (isPm && h < 12) h += 12;
                else if (isAm && h === 12) h = 0;
                else if (!isPm && !isAm) {
                    if (h < 8) h += 12;
                }
                return h * 60 + m;
            };
            let startMin = toMin(startStr);
            let endMin = toMin(endStr);
            if (endMin <= startMin) {
                endMin += 12 * 60;
            }
            return days.map(d => ({ day: d, start: startMin, end: endMin }));
        } catch (e) {
            return [];
        }
    }

    function checkOverlap(s1, s2) {
        const p1 = parseSchedule(s1);
        const p2 = parseSchedule(s2);
        for (let item1 of p1) {
            for (let item2 of p2) {
                if (item1.day === item2.day) {
                    if (item1.start < item2.end && item2.start < item1.end) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    function getLinkedSection(sec) {
        if (!sec) return null;
        if (sec.linked_section_id) {
            const linked = sectionsData.find(s => s.id === sec.linked_section_id);
            if (linked) return linked;
        }
        const reverse = sectionsData.find(s => s.linked_section_id === sec.id);
        if (reverse) return reverse;
        const isLab = sec.is_lab || sec.course_code.endsWith(' Lab');
        if (isLab) {
            const baseCode = sec.course_code.replace(' Lab', '').trim();
            return sectionsData.find(s => s.course_code === baseCode && s.section_number === sec.section_number && s.id !== sec.id);
        } else {
            const labCode = sec.course_code.trim() + ' Lab';
            return sectionsData.find(s => s.course_code === labCode && s.section_number === sec.section_number && s.id !== sec.id);
        }
    }

    // ADD COURSE REQUEST CART LOGIC
    let addRequestCart = []; // stores section IDs
    let currentReqAddFilter = 'recommended';
    let reqAddSearchQuery = '';

    function setReqAddFilter(filterName) {
        currentReqAddFilter = filterName;
        // Update tab active styling
        const buttons = document.querySelectorAll('#req-add-filter-container button');
        buttons.forEach(btn => {
            if (btn.id === `req-add-filter-${filterName}`) {
                btn.classList.add('bg-blue-600', 'text-white');
                btn.classList.remove('bg-slate-100', 'dark:bg-slate-800', 'text-slate-800', 'dark:text-slate-200');
            } else {
                btn.classList.remove('bg-blue-600', 'text-white');
                btn.classList.add('bg-slate-100', 'dark:bg-slate-800', 'text-slate-800', 'dark:text-slate-200');
            }
        });
        loadReqAddSections();
    }

    function searchReqAddCourses() {
        reqAddSearchQuery = document.getElementById('req-add-search-input').value.trim().toUpperCase();
        loadReqAddSections();
    }

    function switchReqAddView(viewMode) {
        currentReqAddView = viewMode;
        const btnCard = document.getElementById('btn-req-add-view-card');
        const btnTable = document.getElementById('btn-req-add-view-table');
        if (viewMode === 'card') {
            if (btnCard) btnCard.className = 'flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-blue-600 text-white shadow-sm transition-all cursor-pointer';
            if (btnTable) btnTable.className = 'flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer';
        } else {
            if (btnCard) btnCard.className = 'flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer';
            if (btnTable) btnTable.className = 'flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-blue-600 text-white shadow-sm transition-all cursor-pointer';
        }
        loadReqAddSections();
    }

    function toggleReqAddCourseAccordion(courseCode) {
        const cleanCode = String(courseCode).replace(/[^a-zA-Z0-9]/g, '_');
        const body = document.getElementById(`req-add-accordion-body-${cleanCode}`);
        const icon = document.getElementById(`req-add-accordion-icon-${cleanCode}`);
        if (!body) return;
        if (body.classList.contains('hidden')) {
            body.classList.remove('hidden');
            if (icon) icon.classList.add('rotate-180');
            reqAddExpandedCourses.add(courseCode);
        } else {
            body.classList.add('hidden');
            if (icon) icon.classList.remove('rotate-180');
            reqAddExpandedCourses.delete(courseCode);
        }
    }

    function getReqAddConflictDetails(sec, linkedSec = null) {
        let conflicts = [];
        const isSelected = addRequestCart.includes(sec.id) || (linkedSec && addRequestCart.includes(linkedSec.id));
        if (!isSelected) {
            for (let regId of registrationsList) {
                const regSec = sectionsData.find(s => s.id === regId);
                if (regSec) {
                    if (checkOverlap(regSec.schedule, sec.schedule)) {
                        conflicts.push(`${regSec.course_code} Sec ${regSec.section_number}`);
                    } else if (linkedSec && checkOverlap(regSec.schedule, linkedSec.schedule)) {
                        conflicts.push(`${regSec.course_code} Sec ${regSec.section_number}`);
                    }
                }
            }
        }
        return [...new Set(conflicts)];
    }

    function loadReqAddSections() {
        const container = document.getElementById('req-add-table-container');
        if (!container) return;
        container.innerHTML = '';

        let filtered = sectionsData;
        const registeredAddCodes = registrationsList.map(id => {
            const s = sectionsData.find(sec => sec.id === id);
            return s ? s.course_code.replace(' Lab', '') : '';
        }).filter(Boolean);
        filtered = filtered.filter(sec => !registeredAddCodes.includes(sec.course_code.replace(' Lab', '')));

        if (currentReqAddFilter === 'f_grade') {
            filtered = filtered.filter(sec => failedCodes.includes(sec.course_code.replace(' Lab', '')));
        } else if (currentReqAddFilter === 'recommended') {
            filtered = filtered.filter(sec => recommendedCodes.includes(sec.course_code.replace(' Lab', '')));
        } else if (currentReqAddFilter === 'd_grade') {
            filtered = filtered.filter(sec => dCodes.includes(sec.course_code.replace(' Lab', '')));
        } else if (currentReqAddFilter === 'retakeable') {
            filtered = filtered.filter(sec => passedCodes.includes(sec.course_code.replace(' Lab', '')));
        }

        if (reqAddSearchQuery) {
            filtered = filtered.filter(sec => sec.course_code.toUpperCase().includes(reqAddSearchQuery));
        }

        if (filtered.length === 0) {
            container.innerHTML = '<div class="col-span-full text-xs text-[#94a3b8] py-8 text-center bg-white dark:bg-[#0a0f1e] rounded-xl border border-dashed border-[#e2e8f0] dark:border-[#1e293b]">No courses match the active filter criteria.</div>';
            return;
        }

        if (currentReqAddView === 'table') {
            renderReqAddTableView(filtered, container);
        } else {
            renderReqAddCardView(filtered, container);
        }

        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    function renderReqAddCardView(filtered, container) {
        const cardsContainer = document.createElement('div');
        cardsContainer.id = 'req-add-cards-container';
        cardsContainer.className = 'grid grid-cols-1 md:grid-cols-2 gap-4';
        container.appendChild(cardsContainer);

        filtered.forEach(sec => {
            const linkedSec = getLinkedSection(sec);
            const isSelected = addRequestCart.includes(sec.id) || (linkedSec && addRequestCart.includes(linkedSec.id));
            const isFull = (sec.enrolled_count >= sec.capacity) || (linkedSec && linkedSec.enrolled_count >= linkedSec.capacity);
            const isRestricted = sec.dedicated_departments && sec.dedicated_departments.length > 0 && !sec.dedicated_departments.includes('None') && !sec.dedicated_departments.includes('[]');
            
            const conflictList = getReqAddConflictDetails(sec, linkedSec);
            const hasConflict = conflictList.length > 0;

            let borderClass = "border-[#e2e8f0] dark:border-[#1e293b] bg-white dark:bg-[#0a0f1e]/40 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900/10";
            let statusBadge = '';
            let checkBadgeStyle = 'opacity-0 scale-75';
            
            if (isSelected) {
                borderClass = "border-blue-500 bg-blue-50/80 dark:bg-blue-950/40 text-blue-950 dark:text-blue-200 border-l-4 border-l-blue-600 dark:border-l-blue-500 shadow-sm";
                statusBadge = `<span class="px-2 py-0.5 rounded-full text-[0.6rem] font-extrabold bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200 border border-blue-300 dark:border-blue-700">Selected</span>`;
                checkBadgeStyle = "opacity-100 scale-100";
            } else if (isRestricted) {
                borderClass = "border-slate-300 dark:border-slate-800 bg-slate-100/70 dark:bg-[#0a0f1e]/20 text-slate-500 dark:text-slate-400 opacity-60 cursor-not-allowed";
                statusBadge = `<span class="px-2 py-0.5 rounded-full text-[0.6rem] font-extrabold bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400">Restricted</span>`;
            } else if (hasConflict) {
                borderClass = "border-rose-400 bg-rose-50/80 dark:bg-rose-950/40 text-rose-950 dark:text-rose-200 border-l-4 border-l-rose-600 dark:border-l-rose-500 shadow-sm";
                statusBadge = `<span class="px-2 py-0.5 rounded-full text-[0.6rem] font-extrabold bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200 border border-rose-300 dark:border-rose-700">Conflict</span>`;
            } else if (isFull) {
                borderClass = "border-amber-400 bg-amber-50/80 dark:bg-amber-950/40 text-amber-950 dark:text-amber-200 border-l-4 border-l-amber-500 dark:border-l-amber-500 shadow-sm";
                statusBadge = `<span class="px-2 py-0.5 rounded-full text-[0.6rem] font-extrabold bg-amber-100 text-amber-900 dark:bg-amber-900/60 dark:text-amber-200 border border-amber-300 dark:border-amber-700">Seat Full</span>`;
            }

            const prereqList = sec.prerequisites && sec.prerequisites.length > 0 ? sec.prerequisites.join(', ') : 'None';

            const card = document.createElement('div');
            card.className = `relative border transition-all duration-300 hover:scale-[1.01] hover:shadow-md cursor-pointer rounded-xl p-4 flex flex-col justify-between ${borderClass}`;
            card.onclick = () => {
                toggleReqAddSection(sec.id);
            };

            let conflictInfoHtml = '';
            if (hasConflict) {
                conflictInfoHtml = `
                    <div class="text-[0.68rem] font-extrabold text-rose-700 dark:text-rose-300 pt-1 flex items-center gap-1">
                        <i data-lucide="alert-triangle" class="w-3.5 h-3.5 shrink-0"></i>
                        <span>Conflicts with: ${conflictList.join(', ')}</span>
                    </div>
                `;
            }

            card.innerHTML = `
                <div class="absolute top-3 right-3 w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-md transition-all duration-300 ${checkBadgeStyle}">
                    <i data-lucide="check" class="w-3.5 h-3.5"></i>
                </div>

                <div class="space-y-2">
                    <div class="flex justify-between items-start pr-6">
                        <div>
                            <span class="text-sm font-extrabold">${sec.course_code}</span>
                            <span class="ml-1.5 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[0.65rem] font-bold">Sec ${sec.section_number}</span>
                        </div>
                        <div>
                            ${statusBadge}
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-y-1.5 gap-x-2 pt-2 border-t border-slate-200/80 dark:border-white/10 text-[0.7rem]">
                        <div class="flex items-center gap-1.5 font-medium">
                            <i data-lucide="clock" class="w-3.5 h-3.5 text-slate-400"></i>
                            <span class="font-semibold">${sec.schedule}</span>
                        </div>
                        <div class="flex items-center gap-1.5 justify-end font-semibold">
                            <i data-lucide="award" class="w-3.5 h-3.5 text-slate-400"></i>
                            <span class="font-bold">${sec.credits} CR</span>
                        </div>
                        <div class="flex items-center gap-1.5 font-medium">
                            <i data-lucide="map-pin" class="w-3.5 h-3.5 text-slate-400"></i>
                            <span>${sec.room}</span>
                        </div>
                        <div class="flex items-center gap-1.5 justify-end font-mono font-bold">
                            <i data-lucide="users" class="w-3.5 h-3.5 text-slate-400"></i>
                            <span>Seats: ${sec.enrolled_count} / ${sec.capacity}</span>
                        </div>
                    </div>

                    ${conflictInfoHtml}

                    <div class="text-[0.65rem] pt-1 text-slate-500 dark:text-slate-400 italic">
                        Prereq: ${prereqList}
                    </div>
                </div>
            `;
            cardsContainer.appendChild(card);
        });
    }

    function renderReqAddTableView(filtered, container) {
        const tableWrapper = document.createElement('div');
        tableWrapper.className = 'space-y-3';
        container.appendChild(tableWrapper);

        const courseGroups = {};
        filtered.forEach(sec => {
            const code = sec.course_code;
            if (!courseGroups[code]) {
                courseGroups[code] = {
                    code: code,
                    title: sec.course_title || (coursesData.find(c => c.code === code) ? coursesData.find(c => c.code === code).title : ''),
                    credits: sec.credits,
                    sections: []
                };
            }
            courseGroups[code].sections.push(sec);
        });

        Object.keys(courseGroups).forEach(courseCode => {
            const group = courseGroups[courseCode];
            const cleanCode = courseCode.replace(/[^a-zA-Z0-9]/g, '_');
            const isExpanded = reqAddExpandedCourses.has(courseCode);

            let selectedCount = 0;
            let conflictCount = 0;
            let fullCount = 0;

            group.sections.forEach(sec => {
                const linkedSec = getLinkedSection(sec);
                const isSelected = addRequestCart.includes(sec.id) || (linkedSec && addRequestCart.includes(linkedSec.id));
                const conflictList = getReqAddConflictDetails(sec, linkedSec);
                const isFull = (sec.enrolled_count >= sec.capacity) || (linkedSec && linkedSec.enrolled_count >= linkedSec.capacity);

                if (isSelected) selectedCount++;
                else if (conflictList.length > 0) conflictCount++;
                else if (isFull) fullCount++;
            });

            const courseCard = document.createElement('div');
            courseCard.className = 'border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-[#0a0f1e] overflow-hidden shadow-sm transition-all duration-200';

            let statusBadgesSummary = '';
            if (selectedCount > 0) {
                statusBadgesSummary += `<span class="px-2 py-0.5 rounded-full text-[0.62rem] font-extrabold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-300 dark:border-blue-800">✓ Selected</span>`;
            }
            if (conflictCount > 0) {
                statusBadgesSummary += `<span class="px-2 py-0.5 rounded-full text-[0.62rem] font-extrabold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800">${conflictCount} Conflict</span>`;
            }
            if (fullCount > 0) {
                statusBadgesSummary += `<span class="px-2 py-0.5 rounded-full text-[0.62rem] font-extrabold bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800">${fullCount} Full</span>`;
            }

            let rowsHtml = '';
            group.sections.forEach(sec => {
                const linkedSec = getLinkedSection(sec);
                const isSelected = addRequestCart.includes(sec.id) || (linkedSec && addRequestCart.includes(linkedSec.id));
                const isFull = (sec.enrolled_count >= sec.capacity) || (linkedSec && linkedSec.enrolled_count >= linkedSec.capacity);
                const isRestricted = sec.dedicated_departments && sec.dedicated_departments.length > 0 && !sec.dedicated_departments.includes('None') && !sec.dedicated_departments.includes('[]');
                const conflictList = getReqAddConflictDetails(sec, linkedSec);
                const hasConflict = conflictList.length > 0;
                const prereqList = sec.prerequisites && sec.prerequisites.length > 0 ? sec.prerequisites.join(', ') : 'None';

                let rowBgClass = "hover:bg-slate-50 dark:hover:bg-slate-900/40 text-slate-700 dark:text-slate-200 cursor-pointer";
                let actionContent = '';

                if (isSelected) {
                    rowBgClass = "bg-blue-500/15 hover:bg-blue-500/20 text-blue-950 dark:text-blue-200 font-semibold cursor-pointer border-l-4 border-l-blue-600 dark:border-l-blue-500";
                    actionContent = `
                        <span class="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-600 text-white shadow-sm inline-flex items-center gap-1 ml-auto">
                            <i data-lucide="check" class="w-3.5 h-3.5"></i> Selected
                        </span>
                    `;
                } else if (isRestricted) {
                    rowBgClass = "bg-slate-100/70 dark:bg-slate-900/30 text-slate-500 dark:text-slate-400 opacity-60 cursor-not-allowed";
                    actionContent = `<span class="px-2.5 py-1 rounded-lg text-[0.65rem] font-extrabold bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400">Restricted</span>`;
                } else if (hasConflict) {
                    rowBgClass = "bg-rose-500/15 hover:bg-rose-500/20 text-rose-950 dark:text-rose-200 cursor-pointer border-l-4 border-l-rose-600 dark:border-l-rose-500";
                    actionContent = `
                        <div class="text-right">
                            <span class="px-2.5 py-1 rounded-lg text-[0.65rem] font-extrabold bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200 border border-rose-300 dark:border-rose-700">Conflict</span>
                            <div class="text-[0.62rem] text-rose-700 dark:text-rose-300 font-extrabold mt-0.5">Conflicts with ${conflictList.join(', ')}</div>
                        </div>
                    `;
                } else if (isFull) {
                    rowBgClass = "bg-amber-500/15 hover:bg-amber-500/20 text-amber-950 dark:text-amber-200 cursor-pointer border-l-4 border-l-amber-500 dark:border-l-amber-500";
                    actionContent = `<span class="px-2.5 py-1 rounded-lg text-[0.65rem] font-extrabold bg-amber-100 text-amber-900 dark:bg-amber-900/60 dark:text-amber-200 border border-amber-300 dark:border-amber-700">Seat Full</span>`;
                } else {
                    actionContent = `
                        <button onclick="event.stopPropagation(); toggleReqAddSection('${sec.id}')" class="px-3 py-1 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-sm flex items-center gap-1 ml-auto cursor-pointer">
                            <i data-lucide="plus" class="w-3.5 h-3.5"></i> Select
                        </button>
                    `;
                }

                rowsHtml += `
                    <tr onclick="toggleReqAddSection('${sec.id}')" class="transition-colors ${rowBgClass}">
                        <td class="py-2.5 px-3 font-extrabold text-xs">
                            Sec ${sec.section_number}
                        </td>
                        <td class="py-2.5 px-3 text-xs">
                            <div class="flex items-center gap-1 font-semibold">
                                <i data-lucide="clock" class="w-3 h-3 text-slate-400"></i> ${sec.schedule}
                            </div>
                        </td>
                        <td class="py-2.5 px-3 text-xs font-medium">
                            ${sec.room}
                        </td>
                        <td class="py-2.5 px-3 text-xs font-mono">
                            ${sec.enrolled_count} / ${sec.capacity}
                        </td>
                        <td class="py-2.5 px-3 text-[0.65rem] text-slate-500 dark:text-slate-400 italic">
                            ${prereqList}
                        </td>
                        <td class="py-2.5 px-3 text-right">
                            ${actionContent}
                        </td>
                    </tr>
                `;
            });

            courseCard.innerHTML = `
                <div onclick="toggleReqAddCourseAccordion('${courseCode}')" class="p-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors select-none">
                    <div class="flex items-center gap-3">
                        <div class="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 font-extrabold flex items-center justify-center text-xs border border-blue-500/20">
                            ${courseCode.substring(0,3)}
                        </div>
                        <div>
                            <div class="flex items-center gap-2">
                                <h3 class="font-extrabold text-sm text-slate-800 dark:text-slate-100">${courseCode}</h3>
                                <span class="text-[0.65rem] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">${group.credits} CR</span>
                            </div>
                            ${group.title ? `<p class="text-xs text-slate-500 dark:text-slate-400 font-medium">${group.title}</p>` : ''}
                        </div>
                    </div>
                    <div class="flex items-center gap-2.5">
                        <div class="flex items-center gap-1.5">
                            ${statusBadgesSummary}
                        </div>
                        <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">${group.sections.length} ${group.sections.length === 1 ? 'Sec' : 'Secs'}</span>
                        <i id="req-add-accordion-icon-${cleanCode}" data-lucide="chevron-down" class="w-4 h-4 text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}"></i>
                    </div>
                </div>

                <div id="req-add-accordion-body-${cleanCode}" class="${isExpanded ? '' : 'hidden'} border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-[#070b14]/50 p-2 md:p-3">
                    <div class="overflow-x-auto">
                        <table class="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr class="border-b border-slate-200 dark:border-slate-800 text-[0.62rem] uppercase tracking-wider text-slate-400">
                                    <th class="py-2 px-3 font-bold">Section</th>
                                    <th class="py-2 px-3 font-bold">Schedule</th>
                                    <th class="py-2 px-3 font-bold">Room</th>
                                    <th class="py-2 px-3 font-bold">Seats</th>
                                    <th class="py-2 px-3 font-bold">Prerequisites</th>
                                    <th class="py-2 px-3 font-bold text-right">Status / Action</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-100 dark:divide-slate-800/60">
                                ${rowsHtml}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
            tableWrapper.appendChild(courseCard);
        });
    }

    function toggleReqAddSection(secId) {
        const sec = sectionsData.find(s => s.id === secId);
        if (!sec) return;

        const linkedSec = getLinkedSection(sec);
        const isSelected = addRequestCart.includes(secId) || (linkedSec && addRequestCart.includes(linkedSec.id));

        if (isSelected) {
            addRequestCart = addRequestCart.filter(id => id !== secId && (!linkedSec || id !== linkedSec.id));
        } else {
            const cleanCode = sec.course_code.replace(' Lab', '').trim();
            const alreadyHasCourse = addRequestCart.some(id => {
                const s = sectionsData.find(x => x.id === id);
                return s && s.course_code.replace(' Lab', '').trim() === cleanCode;
            });
            if (alreadyHasCourse) {
                showToast('error', 'You have already selected a section for ' + cleanCode + '.');
                return;
            }

            // Conflict check against enrolled courses
            for (let regId of registrationsList) {
                const regSec = sectionsData.find(s => s.id === regId);
                if (regSec) {
                    if (checkOverlap(regSec.schedule, sec.schedule)) {
                        showToast('error', `Schedule conflict between ${sec.course_code} (${sec.schedule}) and enrolled ${regSec.course_code} (${regSec.schedule}).`);
                        return;
                    }
                    if (linkedSec && checkOverlap(regSec.schedule, linkedSec.schedule)) {
                        showToast('error', `Schedule conflict between linked ${linkedSec.course_code} (${linkedSec.schedule}) and enrolled ${regSec.course_code} (${regSec.schedule}).`);
                        return;
                    }
                }
            }

            // Conflict check against items already in addRequestCart
            for (let cartId of addRequestCart) {
                const cartSec = sectionsData.find(s => s.id === cartId);
                if (cartSec) {
                    if (checkOverlap(cartSec.schedule, sec.schedule)) {
                        showToast('error', `Schedule conflict between ${sec.course_code} (${sec.schedule}) and selected ${cartSec.course_code} (${cartSec.schedule}).`);
                        return;
                    }
                    if (linkedSec && checkOverlap(cartSec.schedule, linkedSec.schedule)) {
                        showToast('error', `Schedule conflict between linked ${linkedSec.course_code} (${linkedSec.schedule}) and selected ${cartSec.course_code} (${cartSec.schedule}).`);
                        return;
                    }
                }
            }

            // Count unique base courses in request cart
            const currentUniqueCourses = new Set(addRequestCart.map(id => {
                const s = sectionsData.find(x => x.id === id);
                return s ? s.course_code.replace(' Lab', '').trim() : '';
            }));
            currentUniqueCourses.add(cleanCode);

            if (currentUniqueCourses.size > 3) {
                showToast('error', 'You can request a maximum of three (3) courses.');
                return;
            }

            addRequestCart.push(secId);
            if (linkedSec && !addRequestCart.includes(linkedSec.id)) {
                addRequestCart.push(linkedSec.id);
            }
        }

        loadReqAddSections();
        updateReqAddCartUI();
    }

    function updateReqAddCartUI() {
        const container = document.getElementById('req-add-cart-items');
        const hiddenInput = document.getElementById('add-request-cart-input');
        const creditsEl = document.getElementById('req-add-cart-credits');
        const countEl = document.getElementById('req-add-cart-count');
        if (!container || !hiddenInput || !creditsEl || !countEl) return;

        // Group selected sections by base course so count shows unique courses (1 for theory+lab)
        const uniqueBaseCourses = new Set(addRequestCart.map(id => {
            const sec = sectionsData.find(s => s.id === id);
            return sec ? sec.course_code.replace(' Lab', '').trim() : '';
        }).filter(Boolean));

        const courseCodes = Array.from(uniqueBaseCourses);
        hiddenInput.value = JSON.stringify(courseCodes);

        let totalCredits = 0;
        let html = '';

        if (addRequestCart.length === 0) {
            container.innerHTML = '<p class="text-[0.68rem] text-slate-500 italic">No courses selected for request.</p>';
            creditsEl.textContent = '0.0 CR';
            countEl.textContent = '0 / 3';
            return;
        }

        addRequestCart.forEach(secId => {
            const sec = sectionsData.find(s => s.id === secId);
            if (sec) {
                totalCredits += parseFloat(sec.credits);
                html += `
                    <div class="flex items-center justify-between p-3 bg-slate-900/40 rounded-lg border border-slate-800 text-xs">
                        <div>
                            <span class="font-bold text-blue-400">${sec.course_code} Sec ${sec.section_number}</span>
                            <div class="text-[0.62rem] text-slate-400 mt-0.5">${sec.credits} CR • ${sec.schedule}</div>
                        </div>
                        <button type="button" onclick="toggleReqAddSection('${secId}')" class="text-red-500 hover:text-red-400 transition-colors">
                            <i data-lucide="x" class="w-3.5 h-3.5"></i>
                        </button>
                    </div>
                `;
            }
        });

        container.innerHTML = html;
        creditsEl.textContent = totalCredits.toFixed(1) + ' CR';
        countEl.textContent = `${uniqueBaseCourses.size} / 3`;

        // Initialize icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    // SEAT INCREASE REQUEST CART LOGIC
    let seatRequestCart = []; // stores section IDs
    let currentReqSeatFilter = 'recommended';
    let reqSeatSearchQuery = '';

    function switchReqSeatView(viewMode) {
        currentReqSeatView = viewMode;
        const btnCard = document.getElementById('btn-req-seat-view-card');
        const btnTable = document.getElementById('btn-req-seat-view-table');
        if (viewMode === 'card') {
            if (btnCard) btnCard.className = 'flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-blue-600 text-white shadow-sm transition-all cursor-pointer';
            if (btnTable) btnTable.className = 'flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer';
        } else {
            if (btnCard) btnCard.className = 'flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer';
            if (btnTable) btnTable.className = 'flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-blue-600 text-white shadow-sm transition-all cursor-pointer';
        }
        loadReqSeatSections();
    }

    function toggleReqSeatCourseAccordion(courseCode) {
        const cleanCode = String(courseCode).replace(/[^a-zA-Z0-9]/g, '_');
        const body = document.getElementById(`req-seat-accordion-body-${cleanCode}`);
        const icon = document.getElementById(`req-seat-accordion-icon-${cleanCode}`);
        if (!body) return;
        if (body.classList.contains('hidden')) {
            body.classList.remove('hidden');
            if (icon) icon.classList.add('rotate-180');
            reqSeatExpandedCourses.add(courseCode);
        } else {
            body.classList.add('hidden');
            if (icon) icon.classList.remove('rotate-180');
            reqSeatExpandedCourses.delete(courseCode);
        }
    }

    function getReqSeatConflictDetails(sec, linkedSec = null) {
        let conflicts = [];
        const isSelected = seatRequestCart.includes(sec.id) || (linkedSec && seatRequestCart.includes(linkedSec.id));
        if (!isSelected) {
            for (let regId of registrationsList) {
                const regSec = sectionsData.find(s => s.id === regId);
                if (regSec) {
                    if (checkOverlap(regSec.schedule, sec.schedule) || (linkedSec && checkOverlap(regSec.schedule, linkedSec.schedule))) {
                        conflicts.push(`${regSec.course_code} Sec ${regSec.section_number}`);
                    }
                }
            }
        }
        return [...new Set(conflicts)];
    }

    function setReqSeatFilter(filterName) {
        currentReqSeatFilter = filterName;
        // Update tab active styling
        const buttons = document.querySelectorAll('#req-seat-filter-container button');
        buttons.forEach(btn => {
            if (btn.id === `req-seat-filter-${filterName}`) {
                btn.classList.add('bg-blue-600', 'text-white');
                btn.classList.remove('bg-slate-100', 'dark:bg-slate-800', 'text-slate-800', 'dark:text-slate-200');
            } else {
                btn.classList.remove('bg-blue-600', 'text-white');
                btn.classList.add('bg-slate-100', 'dark:bg-slate-800', 'text-slate-800', 'dark:text-slate-200');
            }
        });
        loadReqSeatSections();
    }

    function searchReqSeatCourses() {
        reqSeatSearchQuery = document.getElementById('req-seat-search-input').value.trim().toUpperCase();
        loadReqSeatSections();
    }

    function loadReqSeatSections() {
        const container = document.getElementById('req-seat-table-container');
        if (!container) return;
        container.innerHTML = '';

        let filtered = sectionsData;

        const registeredSeatCodes = registrationsList.map(id => {
            const s = sectionsData.find(sec => sec.id === id);
            return s ? s.course_code.replace(' Lab', '') : '';
        }).filter(Boolean);
        filtered = filtered.filter(sec => !registeredSeatCodes.includes(sec.course_code.replace(' Lab', '')));

        if (currentReqSeatFilter === 'f_grade') {
            filtered = filtered.filter(sec => failedCodes.includes(sec.course_code.replace(' Lab', '')));
        } else if (currentReqSeatFilter === 'recommended') {
            filtered = filtered.filter(sec => recommendedCodes.includes(sec.course_code.replace(' Lab', '')));
        } else if (currentReqSeatFilter === 'd_grade') {
            filtered = filtered.filter(sec => dCodes.includes(sec.course_code.replace(' Lab', '')));
        } else if (currentReqSeatFilter === 'retakeable') {
            filtered = filtered.filter(sec => passedCodes.includes(sec.course_code.replace(' Lab', '')));
        }

        if (reqSeatSearchQuery) {
            filtered = filtered.filter(sec => sec.course_code.toUpperCase().includes(reqSeatSearchQuery));
        }

        if (filtered.length === 0) {
            container.innerHTML = '<div class="col-span-full text-xs text-[#94a3b8] py-8 text-center bg-white dark:bg-[#0a0f1e] rounded-xl border border-dashed border-[#e2e8f0] dark:border-[#1e293b]">No courses match the active filter criteria.</div>';
            return;
        }

        if (currentReqSeatView === 'table') {
            renderReqSeatTableView(filtered, container);
        } else {
            renderReqSeatCardView(filtered, container);
        }

        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    function renderReqSeatCardView(filtered, container) {
        const cardsContainer = document.createElement('div');
        cardsContainer.id = 'req-seat-cards-container';
        cardsContainer.className = 'grid grid-cols-1 md:grid-cols-2 gap-4';
        container.appendChild(cardsContainer);

        filtered.forEach(sec => {
            const linkedSec = getLinkedSection(sec);
            const isSelected = seatRequestCart.includes(sec.id) || (linkedSec && seatRequestCart.includes(linkedSec.id));
            const isFull = (sec.enrolled_count >= sec.capacity) || (linkedSec && linkedSec.enrolled_count >= linkedSec.capacity);
            const isRestricted = sec.dedicated_departments && sec.dedicated_departments.length > 0 && !sec.dedicated_departments.includes('None') && !sec.dedicated_departments.includes('[]');
            
            const conflictList = getReqSeatConflictDetails(sec, linkedSec);
            const hasConflict = conflictList.length > 0;

            let borderClass = "border-[#e2e8f0] dark:border-[#1e293b] bg-white dark:bg-[#0a0f1e]/40 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900/10";
            let statusBadge = '';
            let checkBadgeStyle = 'opacity-0 scale-75';
            
            if (isSelected) {
                borderClass = "border-cyan-500 bg-cyan-50/80 dark:bg-cyan-950/40 text-cyan-950 dark:text-cyan-200 border-l-4 border-l-cyan-600 dark:border-l-cyan-500 shadow-sm";
                statusBadge = `<span class="px-2 py-0.5 rounded-full text-[0.6rem] font-extrabold bg-cyan-100 text-cyan-800 dark:bg-cyan-900/60 dark:text-cyan-200 border border-cyan-300 dark:border-cyan-700">Selected</span>`;
                checkBadgeStyle = "opacity-100 scale-100";
            } else if (isRestricted) {
                borderClass = "border-slate-300 dark:border-slate-800 bg-slate-100/70 dark:bg-[#0a0f1e]/20 text-slate-500 dark:text-slate-400 opacity-60 cursor-not-allowed";
                statusBadge = `<span class="px-2 py-0.5 rounded-full text-[0.6rem] font-extrabold bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400">Restricted</span>`;
            } else if (hasConflict) {
                borderClass = "border-rose-400 bg-rose-50/80 dark:bg-rose-950/40 text-rose-950 dark:text-rose-200 border-l-4 border-l-rose-600 dark:border-l-rose-500 shadow-sm";
                statusBadge = `<span class="px-2 py-0.5 rounded-full text-[0.6rem] font-extrabold bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200 border border-rose-300 dark:border-rose-700">Conflict</span>`;
            } else if (isFull) {
                borderClass = "border-amber-400 bg-amber-50/80 dark:bg-amber-950/40 text-amber-950 dark:text-amber-200 border-l-4 border-l-amber-500 dark:border-l-amber-500 shadow-sm";
                statusBadge = `<span class="px-2 py-0.5 rounded-full text-[0.6rem] font-extrabold bg-amber-100 text-amber-900 dark:bg-amber-900/60 dark:text-amber-200 border border-amber-300 dark:border-amber-700">Seat Full</span>`;
            }

            const prereqList = sec.prerequisites && sec.prerequisites.length > 0 ? sec.prerequisites.join(', ') : 'None';

            const card = document.createElement('div');
            card.className = `relative border transition-all duration-300 hover:scale-[1.01] hover:shadow-md cursor-pointer rounded-xl p-4 flex flex-col justify-between ${borderClass}`;
            card.onclick = () => {
                toggleReqSeatSection(sec.id);
            };

            let conflictInfoHtml = '';
            if (hasConflict) {
                conflictInfoHtml = `
                    <div class="text-[0.68rem] font-extrabold text-rose-700 dark:text-rose-300 pt-1 flex items-center gap-1">
                        <i data-lucide="alert-triangle" class="w-3.5 h-3.5 shrink-0"></i>
                        <span>Conflicts with: ${conflictList.join(', ')}</span>
                    </div>
                `;
            }

            card.innerHTML = `
                <div class="absolute top-3 right-3 w-5 h-5 rounded-full bg-cyan-500 text-white flex items-center justify-center shadow-md transition-all duration-300 ${checkBadgeStyle}">
                    <i data-lucide="check" class="w-3.5 h-3.5"></i>
                </div>

                <div class="space-y-2">
                    <div class="flex justify-between items-start pr-6">
                        <div>
                            <span class="text-sm font-extrabold">${sec.course_code}</span>
                            <span class="ml-1.5 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[0.65rem] font-bold">Sec ${sec.section_number}</span>
                        </div>
                        <div>
                            ${statusBadge}
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-y-1.5 gap-x-2 pt-2 border-t border-slate-200/80 dark:border-white/10 text-[0.7rem]">
                        <div class="flex items-center gap-1.5 font-medium">
                            <i data-lucide="clock" class="w-3.5 h-3.5 text-slate-400"></i>
                            <span class="font-semibold">${sec.schedule}</span>
                        </div>
                        <div class="flex items-center gap-1.5 justify-end font-semibold">
                            <i data-lucide="award" class="w-3.5 h-3.5 text-slate-400"></i>
                            <span class="font-bold">${sec.credits} CR</span>
                        </div>
                        <div class="flex items-center gap-1.5 font-medium">
                            <i data-lucide="map-pin" class="w-3.5 h-3.5 text-slate-400"></i>
                            <span>${sec.room}</span>
                        </div>
                        <div class="flex items-center gap-1.5 justify-end font-mono font-bold">
                            <i data-lucide="users" class="w-3.5 h-3.5 text-slate-400"></i>
                            <span>Seats: ${sec.enrolled_count} / ${sec.capacity}</span>
                        </div>
                    </div>

                    ${conflictInfoHtml}

                    <div class="text-[0.65rem] pt-1 text-slate-500 dark:text-slate-400 italic">
                        Prereq: ${prereqList}
                    </div>
                </div>
            `;
            cardsContainer.appendChild(card);
        });
    }

    function renderReqSeatTableView(filtered, container) {
        const tableWrapper = document.createElement('div');
        tableWrapper.className = 'space-y-3';
        container.appendChild(tableWrapper);

        const courseGroups = {};
        filtered.forEach(sec => {
            const code = sec.course_code;
            if (!courseGroups[code]) {
                courseGroups[code] = {
                    code: code,
                    title: sec.course_title || (coursesData.find(c => c.code === code) ? coursesData.find(c => c.code === code).title : ''),
                    credits: sec.credits,
                    sections: []
                };
            }
            courseGroups[code].sections.push(sec);
        });

        Object.keys(courseGroups).forEach(courseCode => {
            const group = courseGroups[courseCode];
            const cleanCode = courseCode.replace(/[^a-zA-Z0-9]/g, '_');
            const isExpanded = reqSeatExpandedCourses.has(courseCode);

            let selectedCount = 0;
            let conflictCount = 0;
            let fullCount = 0;

            group.sections.forEach(sec => {
                const linkedSec = getLinkedSection(sec);
                const isSelected = seatRequestCart.includes(sec.id) || (linkedSec && seatRequestCart.includes(linkedSec.id));
                const conflictList = getReqSeatConflictDetails(sec, linkedSec);
                const isFull = (sec.enrolled_count >= sec.capacity) || (linkedSec && linkedSec.enrolled_count >= linkedSec.capacity);

                if (isSelected) selectedCount++;
                else if (conflictList.length > 0) conflictCount++;
                else if (isFull) fullCount++;
            });

            const courseCard = document.createElement('div');
            courseCard.className = 'border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-[#0a0f1e] overflow-hidden shadow-sm transition-all duration-200';

            let statusBadgesSummary = '';
            if (selectedCount > 0) {
                statusBadgesSummary += `<span class="px-2 py-0.5 rounded-full text-[0.62rem] font-extrabold bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-800">✓ Selected</span>`;
            }
            if (conflictCount > 0) {
                statusBadgesSummary += `<span class="px-2 py-0.5 rounded-full text-[0.62rem] font-extrabold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800">${conflictCount} Conflict</span>`;
            }
            if (fullCount > 0) {
                statusBadgesSummary += `<span class="px-2 py-0.5 rounded-full text-[0.62rem] font-extrabold bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800">${fullCount} Full</span>`;
            }

            let rowsHtml = '';
            group.sections.forEach(sec => {
                const linkedSec = getLinkedSection(sec);
                const isSelected = seatRequestCart.includes(sec.id) || (linkedSec && seatRequestCart.includes(linkedSec.id));
                const isFull = (sec.enrolled_count >= sec.capacity) || (linkedSec && linkedSec.enrolled_count >= linkedSec.capacity);
                const isRestricted = sec.dedicated_departments && sec.dedicated_departments.length > 0 && !sec.dedicated_departments.includes('None') && !sec.dedicated_departments.includes('[]');
                const conflictList = getReqSeatConflictDetails(sec, linkedSec);
                const hasConflict = conflictList.length > 0;
                const prereqList = sec.prerequisites && sec.prerequisites.length > 0 ? sec.prerequisites.join(', ') : 'None';

                let rowBgClass = "hover:bg-slate-50 dark:hover:bg-slate-900/40 text-slate-700 dark:text-slate-200 cursor-pointer";
                let actionContent = '';

                if (isSelected) {
                    rowBgClass = "bg-cyan-500/15 hover:bg-cyan-500/20 text-cyan-950 dark:text-cyan-200 font-semibold cursor-pointer border-l-4 border-l-cyan-600 dark:border-l-cyan-500";
                    actionContent = `
                        <span class="px-2.5 py-1 rounded-lg text-xs font-bold bg-cyan-600 text-white shadow-sm inline-flex items-center gap-1 ml-auto">
                            <i data-lucide="check" class="w-3.5 h-3.5"></i> Selected
                        </span>
                    `;
                } else if (isRestricted) {
                    rowBgClass = "bg-slate-100/70 dark:bg-slate-900/30 text-slate-500 dark:text-slate-400 opacity-60 cursor-not-allowed";
                    actionContent = `<span class="px-2.5 py-1 rounded-lg text-[0.65rem] font-extrabold bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400">Restricted</span>`;
                } else if (hasConflict) {
                    rowBgClass = "bg-rose-500/15 hover:bg-rose-500/20 text-rose-950 dark:text-rose-200 cursor-pointer border-l-4 border-l-rose-600 dark:border-l-rose-500";
                    actionContent = `
                        <div class="text-right">
                            <span class="px-2.5 py-1 rounded-lg text-[0.65rem] font-extrabold bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200 border border-rose-300 dark:border-rose-700">Conflict</span>
                            <div class="text-[0.62rem] text-rose-700 dark:text-rose-300 font-extrabold mt-0.5">Conflicts with ${conflictList.join(', ')}</div>
                        </div>
                    `;
                } else if (isFull) {
                    rowBgClass = "bg-amber-500/15 hover:bg-amber-500/20 text-amber-950 dark:text-amber-200 cursor-pointer border-l-4 border-l-amber-500 dark:border-l-amber-500";
                    actionContent = `<span class="px-2.5 py-1 rounded-lg text-[0.65rem] font-extrabold bg-amber-100 text-amber-900 dark:bg-amber-900/60 dark:text-amber-200 border border-amber-300 dark:border-amber-700">Seat Full</span>`;
                } else {
                    actionContent = `
                        <button onclick="event.stopPropagation(); toggleReqSeatSection('${sec.id}')" class="px-3 py-1 rounded-lg text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white transition-all shadow-sm flex items-center gap-1 ml-auto cursor-pointer">
                            <i data-lucide="plus" class="w-3.5 h-3.5"></i> Select
                        </button>
                    `;
                }

                rowsHtml += `
                    <tr onclick="toggleReqSeatSection('${sec.id}')" class="transition-colors ${rowBgClass}">
                        <td class="py-2.5 px-3 font-extrabold text-xs">
                            Sec ${sec.section_number}
                        </td>
                        <td class="py-2.5 px-3 text-xs">
                            <div class="flex items-center gap-1 font-semibold">
                                <i data-lucide="clock" class="w-3 h-3 text-slate-400"></i> ${sec.schedule}
                            </div>
                        </td>
                        <td class="py-2.5 px-3 text-xs font-medium">
                            ${sec.room}
                        </td>
                        <td class="py-2.5 px-3 text-xs font-mono">
                            ${sec.enrolled_count} / ${sec.capacity}
                        </td>
                        <td class="py-2.5 px-3 text-[0.65rem] text-slate-500 dark:text-slate-400 italic">
                            ${prereqList}
                        </td>
                        <td class="py-2.5 px-3 text-right">
                            ${actionContent}
                        </td>
                    </tr>
                `;
            });

            courseCard.innerHTML = `
                <div onclick="toggleReqSeatCourseAccordion('${courseCode}')" class="p-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors select-none">
                    <div class="flex items-center gap-3">
                        <div class="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-extrabold flex items-center justify-center text-xs border border-cyan-500/20">
                            ${courseCode.substring(0,3)}
                        </div>
                        <div>
                            <div class="flex items-center gap-2">
                                <h3 class="font-extrabold text-sm text-slate-800 dark:text-slate-100">${courseCode}</h3>
                                <span class="text-[0.65rem] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">${group.credits} CR</span>
                            </div>
                            ${group.title ? `<p class="text-xs text-slate-500 dark:text-slate-400 font-medium">${group.title}</p>` : ''}
                        </div>
                    </div>
                    <div class="flex items-center gap-2.5">
                        <div class="flex items-center gap-1.5">
                            ${statusBadgesSummary}
                        </div>
                        <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">${group.sections.length} ${group.sections.length === 1 ? 'Sec' : 'Secs'}</span>
                        <i id="req-seat-accordion-icon-${cleanCode}" data-lucide="chevron-down" class="w-4 h-4 text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}"></i>
                    </div>
                </div>

                <div id="req-seat-accordion-body-${cleanCode}" class="${isExpanded ? '' : 'hidden'} border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-[#070b14]/50 p-2 md:p-3">
                    <div class="overflow-x-auto">
                        <table class="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr class="border-b border-slate-200 dark:border-slate-800 text-[0.62rem] uppercase tracking-wider text-slate-400">
                                    <th class="py-2 px-3 font-bold">Section</th>
                                    <th class="py-2 px-3 font-bold">Schedule</th>
                                    <th class="py-2 px-3 font-bold">Room</th>
                                    <th class="py-2 px-3 font-bold">Seats</th>
                                    <th class="py-2 px-3 font-bold">Prerequisites</th>
                                    <th class="py-2 px-3 font-bold text-right">Status / Action</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-100 dark:divide-slate-800/60">
                                ${rowsHtml}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
            tableWrapper.appendChild(courseCard);
        });
    }

    function toggleReqSeatSection(secId) {
        const sec = sectionsData.find(s => s.id === secId);
        if (!sec) return;

        const linkedSec = getLinkedSection(sec);
        const isSelected = seatRequestCart.includes(secId) || (linkedSec && seatRequestCart.includes(linkedSec.id));

        if (isSelected) {
            seatRequestCart = seatRequestCart.filter(id => id !== secId && (!linkedSec || id !== linkedSec.id));
        } else {
            const cleanCode = sec.course_code.replace(' Lab', '').trim();
            const alreadyHasCourse = seatRequestCart.some(id => {
                const s = sectionsData.find(x => x.id === id);
                return s && s.course_code.replace(' Lab', '').trim() === cleanCode;
            });
            if (alreadyHasCourse) {
                showToast('error', 'You have already selected a section for ' + cleanCode + '.');
                return;
            }

            for (let regId of registrationsList) {
                const regSec = sectionsData.find(s => s.id === regId);
                if (regSec) {
                    if (checkOverlap(regSec.schedule, sec.schedule)) {
                        showToast('error', `Schedule conflict between ${sec.course_code} (${sec.schedule}) and enrolled ${regSec.course_code} (${regSec.schedule}).`);
                        return;
                    }
                    if (linkedSec && checkOverlap(regSec.schedule, linkedSec.schedule)) {
                        showToast('error', `Schedule conflict between linked ${linkedSec.course_code} (${linkedSec.schedule}) and enrolled ${regSec.course_code} (${regSec.schedule}).`);
                        return;
                    }
                }
            }

            for (let cartId of seatRequestCart) {
                const cartSec = sectionsData.find(s => s.id === cartId);
                if (cartSec) {
                    if (checkOverlap(cartSec.schedule, sec.schedule)) {
                        showToast('error', `Schedule conflict between ${sec.course_code} (${sec.schedule}) and selected ${cartSec.course_code} (${cartSec.schedule}).`);
                        return;
                    }
                    if (linkedSec && checkOverlap(cartSec.schedule, linkedSec.schedule)) {
                        showToast('error', `Schedule conflict between linked ${linkedSec.course_code} (${linkedSec.schedule}) and selected ${cartSec.course_code} (${cartSec.schedule}).`);
                        return;
                    }
                }
            }

            const currentUniqueCourses = new Set(seatRequestCart.map(id => {
                const s = sectionsData.find(x => x.id === id);
                return s ? s.course_code.replace(' Lab', '').trim() : '';
            }));
            currentUniqueCourses.add(cleanCode);

            if (currentUniqueCourses.size > 2) {
                showToast('error', 'You can request seat increases for a maximum of two (2) courses.');
                return;
            }

            seatRequestCart.push(secId);
            if (linkedSec && !seatRequestCart.includes(linkedSec.id)) {
                seatRequestCart.push(linkedSec.id);
            }
        }

        loadReqSeatSections();
        updateReqSeatCartUI();
    }

    function updateReqSeatCartUI() {
        const container = document.getElementById('req-seat-cart-items');
        const hiddenInput = document.getElementById('seat-request-cart-input');
        const creditsEl = document.getElementById('req-seat-cart-credits');
        const countEl = document.getElementById('req-seat-cart-count');
        if (!container || !hiddenInput || !creditsEl || !countEl) return;

        const uniqueBaseCourses = new Set(seatRequestCart.map(id => {
            const sec = sectionsData.find(s => s.id === id);
            return sec ? sec.course_code.replace(' Lab', '').trim() : '';
        }).filter(Boolean));

        hiddenInput.value = JSON.stringify(seatRequestCart);

        let totalCredits = 0;
        let html = '';

        if (seatRequestCart.length === 0) {
            container.innerHTML = '<p class="text-[0.68rem] text-slate-500 italic">No courses selected for request.</p>';
            creditsEl.textContent = '0.0 CR';
            countEl.textContent = '0 / 2';
            return;
        }

        seatRequestCart.forEach(secId => {
            const sec = sectionsData.find(s => s.id === secId);
            if (sec) {
                totalCredits += parseFloat(sec.credits);
                html += `
                    <div class="flex items-center justify-between p-3 bg-slate-900/40 rounded-lg border border-slate-800 text-xs">
                        <div>
                            <span class="font-bold text-cyan-400">${sec.course_code} Sec ${sec.section_number}</span>
                            <div class="text-[0.62rem] text-slate-400 mt-0.5">${sec.credits} CR • ${sec.schedule}</div>
                        </div>
                        <button type="button" onclick="toggleReqSeatSection('${secId}')" class="text-red-500 hover:text-red-400 transition-colors">
                            <i data-lucide="x" class="w-3.5 h-3.5"></i>
                        </button>
                    </div>
                `;
            }
        });

        container.innerHTML = html;
        creditsEl.textContent = totalCredits.toFixed(1) + ' CR';
        countEl.textContent = `${uniqueBaseCourses.size} / 2`;

        // Initialize icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    // SECTION CHANGE SWAP LOGIC
    function handleSwapSelectionChange(checkbox) {
        const checked = Array.from(document.querySelectorAll('input[name="selected_swap_courses"]:checked'));
        
        // Enforce max 2 selection
        if (checked.length > 2) {
            checkbox.checked = false;
            alert('You can select a maximum of two (2) courses for section change.');
            return;
        }

        // Disable other checkboxes if 2 selected
        const allCheckboxes = document.querySelectorAll('input[name="selected_swap_courses"]');
        allCheckboxes.forEach(cb => {
            if (!cb.checked) {
                cb.disabled = (checked.length >= 2);
                cb.parentElement.style.opacity = (checked.length >= 2) ? '0.5' : '1';
            }
        });

        // Load swap options
        loadSectionSwapOptions(checked);
    }

    function loadSectionSwapOptions(checked) {
        const workspace = document.getElementById('section-swap-workspace');
        if (!workspace) return;

        if (checked.length === 0) {
            workspace.innerHTML = '<p class="text-xs text-slate-400 italic">Select one or two registered courses on the left to show alternative sections.</p>';
            return;
        }

        let html = '';
        checked.forEach(cb => {
            const currentSecId = cb.value;
            const currentSec = sectionsData.find(s => s.id === currentSecId);
            if (!currentSec) return;

            const currentLinkedSec = getLinkedSection(currentSec);

            // Find alternatives of same base course code
            const baseCode = currentSec.course_code.replace(' Lab', '').trim();
            const alternatives = sectionsData.filter(s => s.course_code === baseCode && s.id !== currentSec.id && !s.is_lab);

            let optionsHtml = '';
            if (alternatives.length === 0) {
                optionsHtml = '<p class="text-[0.68rem] text-slate-500 italic">No alternative sections offered for this course.</p>';
            } else {
                alternatives.forEach(targetSec => {
                    const targetLinkedSec = getLinkedSection(targetSec);
                    const isSelfFull = targetSec.enrolled_count >= targetSec.capacity;
                    const isLinkedFull = targetLinkedSec ? (targetLinkedSec.enrolled_count >= targetLinkedSec.capacity) : false;
                    const isFull = isSelfFull || isLinkedFull;
                    
                    // Conflict check against student's registrations (excluding current course being swapped)
                    let isConflicted = false;
                    let conflictCourse = '';
                    
                    for (let regId of registrationsList) {
                        if (regId === currentSec.id || (currentLinkedSec && regId === currentLinkedSec.id)) {
                            continue;
                        }
                        const regSec = sectionsData.find(s => s.id === regId);
                        if (regSec) {
                            if (checkOverlap(regSec.schedule, targetSec.schedule)) {
                                isConflicted = true;
                                conflictCourse = regSec.course_code;
                                break;
                            }
                            if (targetLinkedSec && checkOverlap(regSec.schedule, targetLinkedSec.schedule)) {
                                isConflicted = true;
                                conflictCourse = `Linked Lab ${targetLinkedSec.course_code}`;
                                break;
                            }
                        }
                    }

                    let badgeHtml = '';
                    if (isFull) {
                        badgeHtml += `<span class="px-1.5 py-0.5 rounded text-[0.6rem] font-bold bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400">Full</span> `;
                    }
                    if (isConflicted) {
                        badgeHtml += `<span class="px-1.5 py-0.5 rounded text-[0.6rem] font-bold bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">Conflicted (${conflictCourse})</span> `;
                    }
                    if (!isFull && !isConflicted) {
                        badgeHtml += `<span class="px-1.5 py-0.5 rounded text-[0.6rem] font-bold bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400">Available</span>`;
                    }

                    let labInfoStr = targetLinkedSec ? ` • <span class="text-blue-400 font-bold">Lab: Sec ${targetLinkedSec.section_number} (${targetLinkedSec.schedule})</span>` : '';

                    optionsHtml += `
                        <label class="flex items-center justify-between p-2.5 rounded-lg border border-[#e2e8f0] dark:border-[#1e293b] hover:bg-slate-50 dark:hover:bg-slate-900/10 cursor-pointer">
                            <div class="flex items-center gap-2">
                                <input type="radio" name="target_section_${currentSec.id}" value="${targetSec.id}" class="w-3.5 h-3.5 text-blue-600 border-slate-300">
                                <div>
                                    <span class="text-xs font-bold text-slate-800 dark:text-slate-200">Sec ${targetSec.section_number}</span>
                                    <span class="text-[0.65rem] text-slate-500 font-mono ml-1">Theory: ${targetSec.schedule}</span>
                                    ${labInfoStr}
                                    <span class="text-[0.65rem] text-slate-400 ml-1">Room: ${targetSec.room}</span>
                                    <span class="text-[0.65rem] text-slate-400 ml-1">Seats: ${targetSec.enrolled_count}/${targetSec.capacity}</span>
                                </div>
                            </div>
                            <div>
                                ${badgeHtml}
                            </div>
                        </label>
                    `;
                });
            }

            let curLabStr = currentLinkedSec ? ` + Lab Sec ${currentLinkedSec.section_number} (${currentLinkedSec.schedule})` : '';

            html += `
                <div class="p-3.5 rounded-xl border border-[#e2e8f0] dark:border-[#1e293b] bg-white dark:bg-[#0c101d] space-y-2.5" data-current-sec-id="${currentSec.id}">
                    <div class="flex justify-between items-center border-b border-[#e2e8f0] dark:border-[#1e293b] pb-2">
                        <span class="text-xs font-black text-slate-800 dark:text-slate-200">${currentSec.course_code}</span>
                        <span class="text-[0.65rem] text-slate-400">Current: Sec ${currentSec.section_number} (${currentSec.schedule})${curLabStr}</span>
                    </div>
                    <div class="space-y-2">
                        ${optionsHtml}
                    </div>
                </div>
            `;
        });
        workspace.innerHTML = html;
    }

    function submitSwapRequestForm(event) {
        event.preventDefault();
        const checked = Array.from(document.querySelectorAll('input[name="selected_swap_courses"]:checked'));
        if (checked.length === 0) {
            alert('Please select at least one registered course to swap.');
            return;
        }

        const swaps = [];
        for (let cb of checked) {
            const currentSecId = cb.value;
            const radio = document.querySelector(`input[name="target_section_${currentSecId}"]:checked`);
            if (!radio) {
                const currentSec = sectionsData.find(s => s.id === currentSecId);
                alert(`Please select a target section for ${currentSec.course_code}.`);
                return;
            }
            swaps.push({
                current_section_id: currentSecId,
                new_section_id: radio.value
            });
        }

        const comments = document.querySelector('#section-swap-form textarea[name="comments"]').value.trim();
        if (!comments) {
            alert('Justification comments are mandatory.');
            return;
        }

        document.getElementById('swaps-hidden-input').value = JSON.stringify(swaps);
        document.getElementById('section-swap-form').submit();
    }

    function switchAdvisingView(viewMode) {
        currentAdvisingView = viewMode;
        const btnCard = document.getElementById('btn-view-card');
        const btnTable = document.getElementById('btn-view-table');

        if (viewMode === 'card') {
            if (btnCard) btnCard.className = 'flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-blue-600 text-white shadow-sm transition-all cursor-pointer';
            if (btnTable) btnTable.className = 'flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer';
        } else {
            if (btnCard) btnCard.className = 'flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer';
            if (btnTable) btnTable.className = 'flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-blue-600 text-white shadow-sm transition-all cursor-pointer';
        }
        loadAdvisingSections();
    }

    function toggleCourseAccordion(courseCode) {
        const cleanCode = String(courseCode).replace(/[^a-zA-Z0-9]/g, '_');
        const body = document.getElementById(`accordion-body-${cleanCode}`);
        const icon = document.getElementById(`accordion-icon-${cleanCode}`);
        if (!body) return;
        if (body.classList.contains('hidden')) {
            body.classList.remove('hidden');
            if (icon) icon.classList.add('rotate-180');
            expandedCourses.add(courseCode);
        } else {
            body.classList.add('hidden');
            if (icon) icon.classList.remove('rotate-180');
            expandedCourses.delete(courseCode);
        }
    }

    function getConflictDetails(sec, linkedSec = null) {
        let conflicts = [];
        const isSelected = registrationsList.includes(sec.id) || (linkedSec && registrationsList.includes(linkedSec.id));
        if (!isSelected) {
            for (let regId of registrationsList) {
                if (regId === sec.id || (linkedSec && regId === linkedSec.id)) {
                    continue;
                }
                const regSec = sectionsData.find(s => s.id === regId);
                if (regSec) {
                    if (checkOverlap(regSec.schedule, sec.schedule)) {
                        conflicts.push(`${regSec.course_code} Sec ${regSec.section_number}`);
                    } else if (linkedSec && checkOverlap(regSec.schedule, linkedSec.schedule)) {
                        conflicts.push(`${regSec.course_code} Sec ${regSec.section_number}`);
                    }
                }
            }
        }
        return [...new Set(conflicts)];
    }

    function loadAdvisingSections() {
        const container = document.getElementById('advising-table-container');
        if (!container) return;
        container.innerHTML = '';

        // Group / Filter sectionsData
        let filteredSections = sectionsData;
        
        // Filter based on advising sub-branch filter
        if (currentAdvisingFilter === 'f_grade') {
            filteredSections = sectionsData.filter(sec => failedCodes.includes(sec.course_code.replace(' Lab', '')));
        } else if (currentAdvisingFilter === 'recommended') {
            filteredSections = sectionsData.filter(sec => recommendedCodes.includes(sec.course_code.replace(' Lab', '')));
        } else if (currentAdvisingFilter === 'd_grade') {
            filteredSections = sectionsData.filter(sec => dCodes.includes(sec.course_code.replace(' Lab', '')));
        } else if (currentAdvisingFilter === 'retakeable') {
            filteredSections = sectionsData.filter(sec => passedCodes.includes(sec.course_code.replace(' Lab', '')));
        }

        // Apply search query filter if present
        if (searchAdvisingQuery) {
            filteredSections = filteredSections.filter(sec => sec.course_code.toUpperCase().includes(searchAdvisingQuery));
        }

        if (filteredSections.length === 0) {
            container.innerHTML = '<div class="col-span-full text-xs text-[#94a3b8] py-8 text-center bg-white dark:bg-[#0a0f1e] rounded-xl border border-dashed border-[#e2e8f0] dark:border-[#1e293b]">No courses match the active filter criteria.</div>';
            return;
        }

        if (currentAdvisingView === 'table') {
            renderAdvisingTableView(filteredSections, container);
        } else {
            renderAdvisingCardView(filteredSections, container);
        }

        updateCartUI();
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    function renderAdvisingCardView(filteredSections, container) {
        const cardsContainer = document.createElement('div');
        cardsContainer.id = 'advising-cards-container';
        cardsContainer.className = 'grid grid-cols-1 md:grid-cols-2 gap-4';
        container.appendChild(cardsContainer);

        filteredSections.forEach(sec => {
            const baseCode = sec.course_code.replace(' Lab', '').trim();
            const linkedSec = sec.linked_section_id ? sectionsData.find(s => s.id === sec.linked_section_id) : null;
            
            const isEnrolledThisSec = registrationsList.includes(sec.id) || (linkedSec && registrationsList.includes(linkedSec.id));
            const enrolledSecForCourse = registrationsList.map(id => sectionsData.find(s => s.id === id)).find(s => s && s.course_code.replace(' Lab', '').trim() === baseCode);
            const isEnrolledOtherSec = enrolledSecForCourse && !isEnrolledThisSec;

            const isSelfFull = sec.enrolled_count >= sec.capacity;
            const isLinkedFull = linkedSec ? (linkedSec.enrolled_count >= linkedSec.capacity) : false;
            const isFull = isSelfFull || isLinkedFull;
            
            const isRestricted = sec.dedicated_departments && sec.dedicated_departments.length > 0 && !sec.dedicated_departments.includes('None') && !sec.dedicated_departments.includes('[]');
            
            const conflictList = getConflictDetails(sec, linkedSec);
            const hasConflict = conflictList.length > 0;

            let borderClass = "border-[#e2e8f0] dark:border-[#1e293b] bg-white dark:bg-[#0a0f1e]/40 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900/10";
            let statusBadge = '';
            let checkBadgeStyle = 'opacity-0 scale-75';
            let cardOnClick = () => toggleSectionAJAX(sec.id, isFull, hasConflict, isRestricted, 'add');
            
            if (isEnrolledThisSec) {
                borderClass = "border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200 border-l-4 border-l-emerald-600 dark:border-l-emerald-500 shadow-sm";
                statusBadge = `<span class="px-2 py-0.5 rounded-full text-[0.6rem] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700">Enrolled</span>`;
                checkBadgeStyle = "opacity-100 scale-100";
                cardOnClick = () => toggleSectionAJAX(sec.id, false, false, false, 'remove');
            } else if (isEnrolledOtherSec) {
                borderClass = "border-purple-300 dark:border-purple-800 bg-purple-50/70 dark:bg-purple-950/40 text-purple-950 dark:text-purple-200 border-l-4 border-l-purple-500 shadow-sm opacity-90";
                statusBadge = `<span class="px-2 py-0.5 rounded-full text-[0.6rem] font-extrabold bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-200 border border-purple-300 dark:border-purple-700">Enrolled in Sec ${enrolledSecForCourse.section_number}</span>`;
                cardOnClick = () => showToast('info', `You are already enrolled in ${baseCode} Sec ${enrolledSecForCourse.section_number}. Switch sections in Section Change tab.`);
            } else if (isRestricted) {
                borderClass = "border-slate-300 dark:border-slate-800 bg-slate-100/70 dark:bg-[#0a0f1e]/20 text-slate-500 dark:text-slate-400 opacity-60 cursor-not-allowed";
                statusBadge = `<span class="px-2 py-0.5 rounded-full text-[0.6rem] font-extrabold bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400">Restricted</span>`;
            } else if (hasConflict) {
                borderClass = "border-rose-400 bg-rose-50/80 dark:bg-rose-950/40 text-rose-950 dark:text-rose-200 border-l-4 border-l-rose-600 dark:border-l-rose-500 shadow-sm";
                statusBadge = `<span class="px-2 py-0.5 rounded-full text-[0.6rem] font-extrabold bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200 border border-rose-300 dark:border-rose-700">Conflict</span>`;
            } else if (isFull) {
                borderClass = "border-amber-400 bg-amber-50/80 dark:bg-amber-950/40 text-amber-950 dark:text-amber-200 border-l-4 border-l-amber-500 dark:border-l-amber-500 shadow-sm";
                statusBadge = `<span class="px-2 py-0.5 rounded-full text-[0.6rem] font-extrabold bg-amber-100 text-amber-900 dark:bg-amber-900/60 dark:text-amber-200 border border-amber-300 dark:border-amber-700">Seat Full</span>`;
            }

            const prereqList = sec.prerequisites && sec.prerequisites.length > 0 ? sec.prerequisites.join(', ') : 'None';

            const card = document.createElement('div');
            card.className = `relative border transition-all duration-300 hover:scale-[1.01] hover:shadow-md cursor-pointer rounded-xl p-4 flex flex-col justify-between ${borderClass}`;
            card.onclick = cardOnClick;

            let conflictInfoHtml = '';
            if (hasConflict) {
                conflictInfoHtml = `
                    <div class="text-[0.68rem] font-extrabold text-rose-700 dark:text-rose-300 pt-1 flex items-center gap-1">
                        <i data-lucide="alert-triangle" class="w-3.5 h-3.5 shrink-0"></i>
                        <span>Conflicts with: ${conflictList.join(', ')}</span>
                    </div>
                `;
            }

            card.innerHTML = `
                <!-- Checkmark Badge -->
                <div class="absolute top-3 right-3 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md transition-all duration-300 ${checkBadgeStyle}">
                    <i data-lucide="check" class="w-3.5 h-3.5"></i>
                </div>

                <div class="space-y-2">
                    <div class="flex justify-between items-start pr-6">
                        <div>
                            <span class="text-sm font-extrabold">${sec.course_code}</span>
                            <span class="ml-1.5 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[0.65rem] font-bold">Sec ${sec.section_number}</span>
                        </div>
                        <div>
                            ${statusBadge}
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-y-1.5 gap-x-2 pt-2 border-t border-slate-200/80 dark:border-white/10 text-[0.7rem]">
                        <div class="flex items-center gap-1.5 font-medium">
                            <i data-lucide="clock" class="w-3.5 h-3.5 text-slate-400"></i>
                            <span class="font-semibold">${sec.schedule}</span>
                        </div>
                        <div class="flex items-center gap-1.5 justify-end font-semibold">
                            <i data-lucide="award" class="w-3.5 h-3.5 text-slate-400"></i>
                            <span class="font-bold">${sec.credits} CR</span>
                        </div>
                        <div class="flex items-center gap-1.5 font-medium">
                            <i data-lucide="map-pin" class="w-3.5 h-3.5 text-slate-400"></i>
                            <span>${sec.room}</span>
                        </div>
                        <div class="flex items-center gap-1.5 justify-end font-mono font-bold">
                            <i data-lucide="users" class="w-3.5 h-3.5 text-slate-400"></i>
                            <span>Seats: ${sec.enrolled_count} / ${sec.capacity}</span>
                        </div>
                    </div>

                    ${conflictInfoHtml}

                    <div class="text-[0.65rem] pt-1 text-slate-500 dark:text-slate-400 italic">
                        Prereq: ${prereqList}
                    </div>
                </div>
            `;
            cardsContainer.appendChild(card);
        });
    }

    function renderAdvisingTableView(filteredSections, container) {
        const tableWrapper = document.createElement('div');
        tableWrapper.className = 'space-y-3';
        container.appendChild(tableWrapper);

        // Group sections by Course Code
        const courseGroups = {};
        filteredSections.forEach(sec => {
            const code = sec.course_code;
            if (!courseGroups[code]) {
                courseGroups[code] = {
                    code: code,
                    title: sec.course_title || (coursesData.find(c => c.code === code) ? coursesData.find(c => c.code === code).title : ''),
                    credits: sec.credits,
                    sections: []
                };
            }
            courseGroups[code].sections.push(sec);
        });

        Object.keys(courseGroups).forEach(courseCode => {
            const group = courseGroups[courseCode];
            const cleanCode = courseCode.replace(/[^a-zA-Z0-9]/g, '_');
            const isExpanded = expandedCourses.has(courseCode);

            // Compute summary stats
            let enrolledCount = 0;
            let conflictCount = 0;
            let fullCount = 0;

            group.sections.forEach(sec => {
                const linkedSec = sec.linked_section_id ? sectionsData.find(s => s.id === sec.linked_section_id) : null;
                const isSelected = registrationsList.includes(sec.id) || (linkedSec && registrationsList.includes(linkedSec.id));
                const conflictList = getConflictDetails(sec, linkedSec);
                const isFull = (sec.enrolled_count >= sec.capacity) || (linkedSec && linkedSec.enrolled_count >= linkedSec.capacity);

                if (isSelected) enrolledCount++;
                else if (conflictList.length > 0) conflictCount++;
                else if (isFull) fullCount++;
            });

            const courseCard = document.createElement('div');
            courseCard.className = 'border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-[#0a0f1e] overflow-hidden shadow-sm transition-all duration-200';

            let statusBadgesSummary = '';
            if (enrolledCount > 0) {
                statusBadgesSummary += `<span class="px-2 py-0.5 rounded-full text-[0.62rem] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">✓ Enrolled</span>`;
            }
            if (conflictCount > 0) {
                statusBadgesSummary += `<span class="px-2 py-0.5 rounded-full text-[0.62rem] font-extrabold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800">${conflictCount} Conflict</span>`;
            }
            if (fullCount > 0) {
                statusBadgesSummary += `<span class="px-2 py-0.5 rounded-full text-[0.62rem] font-extrabold bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800">${fullCount} Full</span>`;
            }

            let rowsHtml = '';
            group.sections.forEach(sec => {
                const baseCode = sec.course_code.replace(' Lab', '').trim();
                const linkedSec = sec.linked_section_id ? sectionsData.find(s => s.id === sec.linked_section_id) : null;
                
                const isEnrolledThisSec = registrationsList.includes(sec.id) || (linkedSec && registrationsList.includes(linkedSec.id));
                const enrolledSecForCourse = registrationsList.map(id => sectionsData.find(s => s.id === id)).find(s => s && s.course_code.replace(' Lab', '').trim() === baseCode);
                const isEnrolledOtherSec = enrolledSecForCourse && !isEnrolledThisSec;

                const isSelfFull = sec.enrolled_count >= sec.capacity;
                const isLinkedFull = linkedSec ? (linkedSec.enrolled_count >= linkedSec.capacity) : false;
                const isFull = isSelfFull || isLinkedFull;
                const isRestricted = sec.dedicated_departments && sec.dedicated_departments.length > 0 && !sec.dedicated_departments.includes('None') && !sec.dedicated_departments.includes('[]');
                const conflictList = getConflictDetails(sec, linkedSec);
                const hasConflict = conflictList.length > 0;
                const prereqList = sec.prerequisites && sec.prerequisites.length > 0 ? sec.prerequisites.join(', ') : 'None';

                let rowBgClass = "hover:bg-slate-50 dark:hover:bg-slate-900/40 text-slate-700 dark:text-slate-200";
                let actionContent = '';

                if (isEnrolledThisSec) {
                    rowBgClass = "bg-emerald-500/15 hover:bg-emerald-500/20 text-emerald-950 dark:text-emerald-200 font-semibold border-l-4 border-l-emerald-600 dark:border-l-emerald-500";
                    actionContent = `
                        <button onclick="event.stopPropagation(); toggleSectionAJAX('${sec.id}', false, false, false, 'remove')" class="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-rose-600 text-white transition-all shadow-sm flex items-center gap-1 ml-auto cursor-pointer group">
                            <span class="group-hover:hidden flex items-center gap-1"><i data-lucide="check" class="w-3.5 h-3.5"></i> Enrolled</span>
                            <span class="hidden group-hover:flex items-center gap-1"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i> Drop</span>
                        </button>
                    `;
                } else if (isEnrolledOtherSec) {
                    rowBgClass = "bg-purple-500/15 text-purple-950 dark:text-purple-200 font-semibold cursor-not-allowed border-l-4 border-l-purple-500";
                    actionContent = `<span class="px-2.5 py-1 rounded-lg text-[0.65rem] font-extrabold bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-200 border border-purple-300 dark:border-purple-700">Enrolled in Sec ${enrolledSecForCourse.section_number}</span>`;
                } else if (isRestricted) {
                    rowBgClass = "bg-slate-100/70 dark:bg-slate-900/30 text-slate-500 dark:text-slate-400 opacity-60 cursor-not-allowed";
                    actionContent = `<span class="px-2.5 py-1 rounded-lg text-[0.65rem] font-extrabold bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400">Restricted</span>`;
                } else if (hasConflict) {
                    rowBgClass = "bg-rose-500/15 hover:bg-rose-500/20 text-rose-950 dark:text-rose-200 border-l-4 border-l-rose-600 dark:border-l-rose-500";
                    actionContent = `
                        <div class="text-right">
                            <span class="px-2.5 py-1 rounded-lg text-[0.65rem] font-extrabold bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200 border border-rose-300 dark:border-rose-700">Conflict</span>
                            <div class="text-[0.62rem] text-rose-700 dark:text-rose-300 font-extrabold mt-0.5">Conflicts with ${conflictList.join(', ')}</div>
                        </div>
                    `;
                } else if (isFull) {
                    rowBgClass = "bg-amber-500/15 hover:bg-amber-500/20 text-amber-950 dark:text-amber-200 border-l-4 border-l-amber-500 dark:border-l-amber-500";
                    actionContent = `<span class="px-2.5 py-1 rounded-lg text-[0.65rem] font-extrabold bg-amber-100 text-amber-900 dark:bg-amber-900/60 dark:text-amber-200 border border-amber-300 dark:border-amber-700">Seat Full</span>`;
                } else {
                    actionContent = `
                        <button onclick="event.stopPropagation(); toggleSectionAJAX('${sec.id}', false, false, false, 'add')" class="px-3 py-1 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-sm flex items-center gap-1 ml-auto cursor-pointer">
                            <i data-lucide="plus" class="w-3.5 h-3.5"></i> Enroll
                        </button>
                    `;
                }

                rowsHtml += `
                    <tr class="transition-colors ${rowBgClass}">
                        <td class="py-2.5 px-3 font-extrabold text-xs">
                            Sec ${sec.section_number}
                        </td>
                        <td class="py-2.5 px-3 text-xs">
                            <div class="flex items-center gap-1 font-semibold">
                                <i data-lucide="clock" class="w-3 h-3 text-slate-400"></i> ${sec.schedule}
                            </div>
                        </td>
                        <td class="py-2.5 px-3 text-xs font-medium">
                            ${sec.room}
                        </td>
                        <td class="py-2.5 px-3 text-xs font-mono">
                            ${sec.enrolled_count} / ${sec.capacity}
                        </td>
                        <td class="py-2.5 px-3 text-[0.65rem] text-slate-500 dark:text-slate-400 italic">
                            ${prereqList}
                        </td>
                        <td class="py-2.5 px-3 text-right">
                            ${actionContent}
                        </td>
                    </tr>
                `;
            });

            courseCard.innerHTML = `
                <div onclick="toggleCourseAccordion('${courseCode}')" class="p-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors select-none">
                    <div class="flex items-center gap-3">
                        <div class="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 font-extrabold flex items-center justify-center text-xs border border-blue-500/20">
                            ${courseCode.substring(0,3)}
                        </div>
                        <div>
                            <div class="flex items-center gap-2">
                                <h3 class="font-extrabold text-sm text-slate-800 dark:text-slate-100">${courseCode}</h3>
                                <span class="text-[0.65rem] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">${group.credits} CR</span>
                            </div>
                            ${group.title ? `<p class="text-xs text-slate-500 dark:text-slate-400 font-medium">${group.title}</p>` : ''}
                        </div>
                    </div>
                    <div class="flex items-center gap-2.5">
                        <div class="flex items-center gap-1.5">
                            ${statusBadgesSummary}
                        </div>
                        <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">${group.sections.length} ${group.sections.length === 1 ? 'Sec' : 'Secs'}</span>
                        <i id="accordion-icon-${cleanCode}" data-lucide="chevron-down" class="w-4 h-4 text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}"></i>
                    </div>
                </div>

                <div id="accordion-body-${cleanCode}" class="${isExpanded ? '' : 'hidden'} border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-[#070b14]/50 p-2 md:p-3">
                    <div class="overflow-x-auto">
                        <table class="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr class="border-b border-slate-200 dark:border-slate-800 text-[0.62rem] uppercase tracking-wider text-slate-400">
                                    <th class="py-2 px-3 font-bold">Section</th>
                                    <th class="py-2 px-3 font-bold">Schedule</th>
                                    <th class="py-2 px-3 font-bold">Room</th>
                                    <th class="py-2 px-3 font-bold">Seats</th>
                                    <th class="py-2 px-3 font-bold">Prerequisites</th>
                                    <th class="py-2 px-3 font-bold text-right">Status / Action</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-100 dark:divide-slate-800/60">
                                ${rowsHtml}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
            tableWrapper.appendChild(courseCard);
        });
    }

    // Ajax booking function on click
    function toggleSectionAJAX(secId, isFull, hasConflict, isRestricted, action = 'add') {
        if (!isFinalActive) {
            showToast('error', 'Final Advising is currently closed. Registration is in view-only mode.');
            return;
        }
        if (isRestricted) {
            showToast('error', 'This section is restricted to other departments.');
            return;
        }

        // Toggling already selected sections is always allowed (to drop)
        const isSelected = registrationsList.includes(secId);
        if (action === 'add') {
            if (isSelected) {
                action = 'remove';
            } else if (isFull || hasConflict) {
                showToast('error', isFull ? 'Section is full.' : 'Schedule conflict detected.');
                return;
            }
        } else if (action === 'remove') {
            if (!isSelected) {
                return;
            }
        }

        fetch('/student/toggle-section', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ section_id: secId })
        })
        .then(res => res.json())
        .then(data => {
            if (data.status === 'success') {
                showToast('success', data.message);
                
                // Dynamic smooth refresh of state from backend without reloading the page
                fetch('/student/get-advising-state')
                .then(res => res.json())
                .then(stateData => {
                    if (stateData.status === 'success') {
                        registrationsList = stateData.registrations;
                        sectionsData.length = 0;
                        sectionsData.push(...stateData.sections);
                        
                        loadAdvisingSections();
                    }
                });
            } else {
                showToast('error', data.message);
            }
        })
        .catch(err => {
            showToast('error', 'Connection error. Please try again.');
        });
    }

    function updateCartUI() {
        const cartContainer = document.getElementById('live-cart-items');
        if (!cartContainer) return;
        cartContainer.innerHTML = '';

        let totalCredits = 0;
        let uniqueCourses = new Set();

        if (registrationsList.length === 0) {
            cartContainer.innerHTML = '<p class="text-xs text-[#94a3b8] text-center py-4">No sections selected</p>';
        } else {
            registrationsList.forEach(id => {
                const sec = sectionsData.find(s => s.id === id);
                if (sec) {
                    totalCredits += sec.credits;
                    uniqueCourses.add(sec.course_code.replace(' Lab', ''));

                    const cartItem = document.createElement('div');
                    cartItem.className = "p-3 bg-slate-50 dark:bg-slate-900 border border-[#e2e8f0] dark:border-[#1e293b] rounded-xl flex justify-between items-center text-xs";
                    
                    let actionHtml = '';
                    if (isFinalActive) {
                        if (sec.is_lab) {
                            actionHtml = `<span class="text-blue-500 dark:text-blue-400 text-[0.65rem] font-medium italic">Linked Lab</span>`;
                        } else {
                            actionHtml = `
                                <button onclick="toggleSectionAJAX('${sec.id}', false, false, false, 'remove')" class="text-red-500 hover:text-red-700">
                                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                                </button>
                            `;
                        }
                    } else {
                        actionHtml = `<span class="text-emerald-500 dark:text-emerald-400 text-[0.65rem] font-bold italic">Registered</span>`;
                    }

                    cartItem.innerHTML = `
                        <div>
                            <p class="font-bold">${sec.course_code} Sec ${sec.section_number}</p>
                            <p class="text-[0.65rem] text-[#94a3b8]">${sec.credits} CR • ${sec.schedule}</p>
                        </div>
                        <div class="flex items-center gap-2">
                            ${actionHtml}
                        </div>
                    `;
                    cartContainer.appendChild(cartItem);
                }
            });
        }

        document.getElementById('cart-credits-summary').textContent = `${totalCredits.toFixed(1)} CR`;
        document.getElementById('cart-course-count').textContent = `${uniqueCourses.size} / 5`;

        const warningBox = document.getElementById('enroll-warning');
        if (uniqueCourses.size > 0 && (uniqueCourses.size < 3 || totalCredits < 9)) {
            warningBox.classList.remove('hidden');
        } else {
            warningBox.classList.add('hidden');
        }
        lucide.createIcons();
    }

    function openRequestModal(sectionId, courseCode, reasonType) {
        const modal = document.getElementById('request-modal');
        const title = modal.querySelector('h3');
        const requestTypeInput = document.getElementById('modal-request-type');
        const sectionInput = document.getElementById('modal-section-id');
        const courseInput = document.getElementById('modal-course-id');
        const commentsInput = document.getElementById('comments');

        sectionInput.value = sectionId || '';
        courseInput.value = courseCode || '';
        requestTypeInput.value = reasonType === 'section_full' ? 'seat_increase' : 'add_course';

        if (title) {
            title.textContent = reasonType === 'section_full'
                ? 'Seat Increase Request'
                : 'Course Add Override Request';
        }
        if (commentsInput) {
            commentsInput.value = '';
            commentsInput.placeholder = reasonType === 'section_full'
                ? 'Explain why you need an additional seat in this section.'
                : 'Explain why you need this override, such as graduation requirement or unavoidable schedule issue.';
        }

        modal.classList.remove('hidden');
    }

    function closeRequestModal() {
        document.getElementById('request-modal').classList.add('hidden');
    }

    // Modal Section Swap Handlers
    function openChangeModal(secId, courseCode) {
        document.getElementById('swap-current-section-id').value = secId;
        document.getElementById('swap-course-display').textContent = courseCode;
        
        // Find other sections of the same course
        const rawCode = courseCode.replace(' Lab', '');
        const alternatives = sectionsData.filter(s => s.id !== secId && s.course_code === rawCode && !s.is_lab);
        
        const select = document.getElementById('swap-new-section-id');
        select.innerHTML = '';
        
        alternatives.forEach(alt => {
            const opt = document.createElement('option');
            opt.value = alt.id;
            opt.textContent = `Sec ${alt.section_number} (${alt.schedule}) - Room: ${alt.room} [Seats: ${alt.enrolled_count}/${alt.capacity}]`;
            select.appendChild(opt);
        });

        if (alternatives.length === 0) {
            select.innerHTML = '<option value="">No alternate sections available</option>';
        }

        document.getElementById('change-section-modal').classList.remove('hidden');
    }

    function closeChangeModal() {
        document.getElementById('change-section-modal').classList.add('hidden');
    }

    // 30s Auto Refresh
    setInterval(() => {
        if (document.getElementById('tab-advising').classList.contains('hidden') === false && isFinalActive && prePlanSubmitted) {
            // Silently fetch updated section statistics
            fetch('/student')
            .then(res => res.text())
            .then(html => {
                // Parse sections_json again and update local array
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                // Since data is static script loaded, we reload the sections offering layout quietly
                loadAdvisingSections();
            });
        }
    }, 30000);

    // Save routine as image using html2canvas
    function downloadScheduleAsImage() {
        const container = document.getElementById('schedule-print-container');
        html2canvas(container, {
            backgroundColor: '#0a0f1e',
            scale: 2
        }).then(canvas => {
            const link = document.createElement('a');
            link.download = `EWU_Routine_${new Date().toISOString().slice(0,10)}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        });
    }

    function changeScheduleSemester() {
        const select = document.getElementById('schedule-semester-select');
        const sem = select.value;
        window.location.href = `/student?schedule_semester=${sem}&tab=schedule`;
    }

    // Initialize Active Tab and Pre-advising defaults after all script definitions
    const isFreshLogin = [];
    const serverTab = "[]";
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    
    let savedTab;
    if (isFreshLogin) {
        sessionStorage.removeItem('student_active_tab');
        localStorage.removeItem('student_active_tab');
        savedTab = 'dashboard';
    } else if (tabParam) {
        savedTab = tabParam;
    } else if (serverTab === 'advising') {
        savedTab = 'advising';
    } else {
        savedTab = sessionStorage.getItem('student_active_tab') || localStorage.getItem('student_active_tab') || 'dashboard';
    }
    switchTab(savedTab);
    
    if (typeof filterPreAdvising === 'function') {
        filterPreAdvising('recommended');
    }
    if (typeof updatePreAdvisingCartList === 'function') {
        updatePreAdvisingCartList();
    }
    if (typeof setReqAddFilter === 'function') {
        setReqAddFilter('recommended');
        updateReqAddCartUI();
    }
    if (typeof setReqSeatFilter === 'function') {
        setReqSeatFilter('recommended');
        updateReqSeatCartUI();
    }

    // Auto-highlight already-planned courses on page load
    planCourseCodes.forEach(code => {
        const cardEl = document.getElementById(`course-card-${code}`);
        if (cardEl) {
            cardEl.classList.remove('border-[#e2e8f0]', 'dark:border-[#1e293b]');
            cardEl.classList.add('border-blue-500', 'bg-blue-50/10');
        }
    });
