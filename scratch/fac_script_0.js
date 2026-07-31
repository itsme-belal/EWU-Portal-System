
const OFFERED_SECTIONS = [];
const REGISTERED_SEC_IDS = [];
const RECOMMENDED_CODES = [];
const PASSED_CODES = [];
const FAILED_CODES = [];
const D_CODES = [];
const STUDENT_ID = "[]";
const STUDENT_NAME = "[]";
const IS_REQUEST_PHASE_ACTIVE = [];
const CURRENT_USER_ROLE = "[]";

let currentFilter = 'recommended';

// Schedule Parsing & Conflict Engine
function parseSchedule(scheduleStr) {
    if (!scheduleStr) return [];
    try {
        const s = String(scheduleStr).trim();
        let match = s.match(/^([A-Za-z]+)[:\s]*([\d\.:]+)\s*(?:AM|PM)?\s*-\s*([\d\.:]+)\s*(AM|PM)?/i);
        let daysStr, startStr, endStr;
        if (match) {
            daysStr = match[1]; startStr = match[2]; endStr = match[3];
        } else {
            match = s.match(/([A-Za-z]+).*?(\d{1,2}[\.\:]\d{2}).*?(\d{1,2}[\.\:]\d{2})/);
            if (!match) return [];
            daysStr = match[1]; startStr = match[2]; endStr = match[3];
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
            else if (!isPm && !isAm && h < 8) h += 12;
            return h * 60 + m;
        };
        let startMin = toMin(startStr);
        let endMin = toMin(endStr);
        if (endMin <= startMin) endMin += 12 * 60;
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

function switchProfileTab(tabName) {
    sessionStorage.setItem('active_profile_tab', tabName);
    sessionStorage.setItem('active_tab_id', tabName);
    document.querySelectorAll('.profile-tab-content').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('.profile-tab-btn').forEach(btn => {
        btn.classList.remove('bg-blue-600', 'text-white', 'shadow-sm', 'font-black');
        btn.classList.add('text-slate-600', 'dark:text-slate-400', 'font-bold');
    });

    const targetContent = document.getElementById('tab-content-' + tabName);
    const targetBtn = document.getElementById('tab-btn-' + tabName);
    if (targetContent && targetBtn) {
        targetContent.classList.remove('hidden');
        targetBtn.classList.remove('text-slate-600', 'dark:text-slate-400', 'font-bold');
        targetBtn.classList.add('bg-blue-600', 'text-white', 'shadow-sm', 'font-black');
    }
}

function setAddFilter(filterType) {
    currentFilter = filterType;
    document.querySelectorAll('.add-filter-btn').forEach(btn => {
        btn.classList.remove('bg-blue-600', 'text-white', 'font-bold');
        btn.classList.add('bg-slate-100', 'dark:bg-slate-800', 'text-slate-700', 'dark:text-slate-300', 'font-semibold');
    });
    const activeBtn = document.getElementById('filter-btn-' + filterType);
    if (activeBtn) {
        activeBtn.classList.remove('bg-slate-100', 'dark:bg-slate-800', 'text-slate-700', 'dark:text-slate-300', 'font-semibold');
        activeBtn.classList.add('bg-blue-600', 'text-white', 'font-bold');
    }
    renderAddCards();
}

function getRegisteredBaseCodes() {
    const regCodes = new Set();
    REGISTERED_SEC_IDS.forEach(id => {
        const sec = OFFERED_SECTIONS.find(s => s.id === id);
        if (sec) {
            regCodes.add(sec.course_code.replace(' Lab', '').trim());
        }
    });
    return regCodes;
}

function getLinkedSection(sec) {
    if (!sec) return null;
    if (sec.linked_section_id) {
        return OFFERED_SECTIONS.find(s => s.id === sec.linked_section_id);
    }
    const labCode = sec.course_code + ' Lab';
    return OFFERED_SECTIONS.find(s => s.course_code === labCode && s.section_number === sec.section_number);
}

function getRegisteredSchedules() {
    const scheds = [];
    REGISTERED_SEC_IDS.forEach(id => {
        const sec = OFFERED_SECTIONS.find(s => s.id === id);
        if (sec && sec.schedule) {
            scheds.push(sec.schedule);
            const linked = getLinkedSection(sec);
            if (linked && linked.schedule && !scheds.includes(linked.schedule)) {
                scheds.push(linked.schedule);
            }
        }
    });
    return scheds;
}

function autoAddSection(secId) {
    const input = document.getElementById('auto-add-sec-id');
    const form = document.getElementById('auto-add-form');
    if (input && form) {
        input.value = secId;
        form.submit();
    }
}

let currentFacView = 'card';
let facExpandedCourses = new Set();

function switchFacView(viewMode) {
    currentFacView = viewMode;
    const btnCard = document.getElementById('btn-fac-view-card');
    const btnTable = document.getElementById('btn-fac-view-table');

    if (viewMode === 'card') {
        if (btnCard) btnCard.className = 'flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-blue-600 text-white shadow-sm transition-all cursor-pointer';
        if (btnTable) btnTable.className = 'flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer';
    } else {
        if (btnCard) btnCard.className = 'flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer';
        if (btnTable) btnTable.className = 'flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-blue-600 text-white shadow-sm transition-all cursor-pointer';
    }
    renderAddCards();
}

function toggleFacCourseAccordion(courseCode) {
    const cleanCode = String(courseCode).replace(/[^a-zA-Z0-9]/g, '_');
    const body = document.getElementById(`fac-accordion-body-${cleanCode}`);
    const icon = document.getElementById(`fac-accordion-icon-${cleanCode}`);
    if (!body) return;
    if (body.classList.contains('hidden')) {
        body.classList.remove('hidden');
        if (icon) icon.classList.add('rotate-180');
        facExpandedCourses.add(courseCode);
    } else {
        body.classList.add('hidden');
        if (icon) icon.classList.remove('rotate-180');
        facExpandedCourses.delete(courseCode);
    }
}

function getFacConflictDetails(sec, linkedLab = null) {
    let conflicts = [];
    for (let regId of REGISTERED_SEC_IDS) {
        if (regId === sec.id || (linkedLab && regId === linkedLab.id)) continue;
        const regSec = OFFERED_SECTIONS.find(s => s.id === regId);
        if (regSec && regSec.schedule) {
            if (checkOverlap(sec.schedule, regSec.schedule)) {
                conflicts.push(`${regSec.course_code} Sec ${regSec.section_number}`);
            } else if (linkedLab && linkedLab.schedule && checkOverlap(linkedLab.schedule, regSec.schedule)) {
                conflicts.push(`${regSec.course_code} Sec ${regSec.section_number}`);
            }
        }
    }
    return [...new Set(conflicts)];
}

function renderAddCards() {
    const searchQ = (document.getElementById('add-search-input').value || '').trim().toLowerCase();
    const container = document.getElementById('add-cards-grid');
    if (!container) return;
    container.innerHTML = '';

    const enrolledBaseCodes = getRegisteredBaseCodes();
    const totalRegisteredCr = REGISTERED_SEC_IDS.reduce((sum, id) => {
        const s = OFFERED_SECTIONS.find(sec => sec.id === id);
        return sum + (s ? s.credits : 0);
    }, 0);

    let list = OFFERED_SECTIONS.filter(s => !s.is_lab);

    if (currentFilter === 'recommended') {
        list = list.filter(s => RECOMMENDED_CODES.includes(s.course_code.replace(' Lab', '').trim()));
    } else if (currentFilter === 'retakeable') {
        list = list.filter(s => PASSED_CODES.includes(s.course_code.replace(' Lab', '').trim()) || D_CODES.includes(s.course_code.replace(' Lab', '').trim()) || FAILED_CODES.includes(s.course_code.replace(' Lab', '').trim()));
    } else if (currentFilter === 'd') {
        list = list.filter(s => D_CODES.includes(s.course_code.replace(' Lab', '').trim()));
    } else if (currentFilter === 'f') {
        list = list.filter(s => FAILED_CODES.includes(s.course_code.replace(' Lab', '').trim()));
    }

    if (searchQ) {
        list = list.filter(s => s.course_code.toLowerCase().includes(searchQ) || (s.course_title && s.course_title.toLowerCase().includes(searchQ)));
    }

    if (list.length === 0) {
        container.innerHTML = `<p class="text-xs text-slate-400 italic col-span-full py-8 text-center bg-white dark:bg-[#0a0f1e] rounded-xl border border-dashed border-[#e2e8f0] dark:border-[#1e293b]">No offered courses match this filter.</p>`;
        return;
    }

    if (currentFacView === 'table') {
        renderAddTableView(list, container, enrolledBaseCodes, totalRegisteredCr);
    } else {
        renderAddCardView(list, container, enrolledBaseCodes, totalRegisteredCr);
    }

    if (window.lucide) lucide.createIcons();
}

function renderAddCardView(list, container, enrolledBaseCodes, totalRegisteredCr) {
    const cardsGrid = document.createElement('div');
    cardsGrid.className = 'grid grid-cols-1 sm:grid-cols-2 gap-4';
    container.appendChild(cardsGrid);

    cardsGrid.innerHTML = list.map(sec => {
        const baseCode = sec.course_code.replace(' Lab', '').trim();
        const linkedLab = getLinkedSection(sec);
        
        const registeredSecForCourse = REGISTERED_SEC_IDS.map(id => OFFERED_SECTIONS.find(s => s.id === id)).find(s => s && s.course_code.replace(' Lab', '').trim() === baseCode);
        const isEnrolledThisSec = registeredSecForCourse && (sec.id === registeredSecForCourse.id || (linkedLab && linkedLab.id === registeredSecForCourse.id));
        const isEnrolledOtherSec = registeredSecForCourse && !isEnrolledThisSec;

        const isFull = (sec.enrolled_count >= sec.capacity) || (linkedLab && linkedLab.enrolled_count >= linkedLab.capacity);
        const courseTotalCr = sec.credits + (linkedLab ? linkedLab.credits : 0);
        const isExceedingCreditLimit = (totalRegisteredCr + courseTotalCr > 15.0);

        const conflictList = getFacConflictDetails(sec, linkedLab);
        const hasConflict = conflictList.length > 0;

        let badgeHtml = '';
        let isDisabled = false;

        if (CURRENT_USER_ROLE === 'faculty' && !IS_REQUEST_PHASE_ACTIVE) {
            badgeHtml = `<span class="px-2.5 py-0.5 rounded text-[0.62rem] font-black bg-slate-500/10 text-slate-400 border border-slate-500/20">Phase Closed</span>`;
            isDisabled = true;
        } else if (isEnrolledThisSec) {
            badgeHtml = `<span class="px-2.5 py-0.5 rounded text-[0.62rem] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">Enrolled</span>`;
            isDisabled = true;
        } else if (isEnrolledOtherSec) {
            badgeHtml = `<span class="px-2.5 py-0.5 rounded text-[0.62rem] font-black bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-300 dark:border-purple-800">Enrolled in Sec ${registeredSecForCourse.section_number}</span>`;
            isDisabled = true;
        } else if (hasConflict) {
            badgeHtml = `<span class="px-2.5 py-0.5 rounded text-[0.62rem] font-extrabold bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200 border border-rose-300 dark:border-rose-700">Conflict</span>`;
            isDisabled = true;
        } else if (isFull) {
            badgeHtml = `<span class="px-2.5 py-0.5 rounded text-[0.62rem] font-extrabold bg-amber-100 text-amber-900 dark:bg-amber-900/60 dark:text-amber-200 border border-amber-300 dark:border-amber-700">Seat Full</span>`;
            isDisabled = true;
        } else if (isExceedingCreditLimit) {
            badgeHtml = `<span class="px-2.5 py-0.5 rounded text-[0.62rem] font-black bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400">Max 15 CR</span>`;
            isDisabled = true;
        }

        let conflictInfoHtml = '';
        if (hasConflict) {
            conflictInfoHtml = `
                <div class="text-[0.68rem] text-rose-700 dark:text-rose-300 font-extrabold flex items-center gap-1 pt-1">
                    <i data-lucide="alert-triangle" class="w-3.5 h-3.5 shrink-0"></i>
                    <span>Conflicts with: ${conflictList.join(', ')}</span>
                </div>
            `;
        }

        let cardStyleClass = 'border-slate-200 dark:border-slate-800 hover:border-blue-500/60 cursor-pointer bg-white dark:bg-[#0c101d]';
        if (isEnrolledThisSec) {
            cardStyleClass = 'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200 border-l-4 border-l-emerald-600 dark:border-l-emerald-500 opacity-90 cursor-not-allowed';
        } else if (isEnrolledOtherSec) {
            cardStyleClass = 'border-purple-300 bg-purple-50/70 dark:bg-purple-950/40 text-purple-950 dark:text-purple-200 border-l-4 border-l-purple-500 dark:border-l-purple-500 opacity-80 cursor-not-allowed';
        } else if (hasConflict) {
            cardStyleClass = 'border-rose-400 bg-rose-50/80 dark:bg-rose-950/40 text-rose-950 dark:text-rose-200 border-l-4 border-l-rose-600 dark:border-l-rose-500 cursor-not-allowed';
        } else if (isFull) {
            cardStyleClass = 'border-amber-400 bg-amber-50/80 dark:bg-amber-950/40 text-amber-950 dark:text-amber-200 border-l-4 border-l-amber-500 dark:border-l-amber-500 cursor-not-allowed';
        } else if (isDisabled) {
            cardStyleClass = 'border-slate-200 dark:border-slate-800 opacity-60 cursor-not-allowed bg-slate-50 dark:bg-[#0c101d]';
        }

        return `
            <div onclick="${isDisabled ? '' : `autoAddSection('${sec.id}')`}" 
                 class="stitch-card p-4 border rounded-2xl space-y-3 transition-all relative ${cardStyleClass}">
                
                <div class="flex justify-between items-center">
                    <div class="flex items-center gap-2">
                        <span class="font-extrabold text-sm text-slate-900 dark:text-slate-100 font-mono">${sec.course_code}</span>
                        <span class="px-2 py-0.5 rounded text-[0.62rem] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">Sec ${sec.section_number}</span>
                    </div>
                    ${badgeHtml}
                </div>

                <div class="text-xs text-slate-700 dark:text-slate-200 font-mono space-y-2 pt-1 border-t border-slate-200/80 dark:border-slate-800/60">
                    <div class="flex justify-between items-center">
                        <span class="flex items-center gap-1.5 font-medium"><i data-lucide="clock" class="w-3.5 h-3.5 text-slate-400"></i> ${sec.schedule}</span>
                        <span class="flex items-center gap-1.5 font-bold"><i data-lucide="bookmark" class="w-3.5 h-3.5 text-blue-500"></i> ${courseTotalCr} CR</span>
                    </div>
                    ${linkedLab ? `
                    <div class="text-[0.68rem] text-blue-600 dark:text-blue-400 font-semibold font-mono flex items-center gap-1">
                        <i data-lucide="flask-conical" class="w-3 h-3 text-blue-500"></i>
                        <span>+ ${linkedLab.course_code} Sec ${linkedLab.section_number}: ${linkedLab.schedule}</span>
                    </div>
                    ` : ''}
                    <div class="flex justify-between items-center font-medium">
                        <span class="flex items-center gap-1.5"><i data-lucide="map-pin" class="w-3.5 h-3.5 text-slate-400"></i> ${sec.room || 'Main'}</span>
                        <span class="flex items-center gap-1.5 font-bold"><i data-lucide="users" class="w-3.5 h-3.5 text-slate-400"></i> Seats: ${sec.enrolled_count} / ${sec.capacity}</span>
                    </div>
                    ${conflictInfoHtml}
                    ${sec.prerequisites ? `<div class="text-[0.68rem] text-slate-500 dark:text-slate-400 italic pt-1">Prereq: ${sec.prerequisites}</div>` : ''}
                </div>
            </div>
        `;
    }).join('');
}

function renderAddTableView(list, container, enrolledBaseCodes, totalRegisteredCr) {
    const tableWrapper = document.createElement('div');
    tableWrapper.className = 'space-y-3';
    container.appendChild(tableWrapper);

    const courseGroups = {};
    list.forEach(sec => {
        const code = sec.course_code;
        if (!courseGroups[code]) {
            const linkedLab = getLinkedSection(sec);
            courseGroups[code] = {
                code: code,
                title: sec.course_title || '',
                credits: sec.credits + (linkedLab ? linkedLab.credits : 0),
                sections: []
            };
        }
        courseGroups[code].sections.push(sec);
    });

    Object.keys(courseGroups).forEach(courseCode => {
        const group = courseGroups[courseCode];
        const cleanCode = courseCode.replace(/[^a-zA-Z0-9]/g, '_');
        const isExpanded = facExpandedCourses.has(courseCode);

        let enrolledCount = 0;
        let conflictCount = 0;
        let fullCount = 0;

        group.sections.forEach(sec => {
            const baseCode = sec.course_code.replace(' Lab', '').trim();
            const linkedLab = getLinkedSection(sec);
            const isEnrolledSameCourse = enrolledBaseCodes.has(baseCode);
            const conflictList = getFacConflictDetails(sec, linkedLab);
            const isFull = (sec.enrolled_count >= sec.capacity) || (linkedLab && linkedLab.enrolled_count >= linkedLab.capacity);

            if (isEnrolledSameCourse) enrolledCount++;
            else if (conflictList.length > 0) conflictCount++;
            else if (isFull) fullCount++;
        });

        const courseCard = document.createElement('div');
        courseCard.className = 'border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-[#0a0f1e] overflow-hidden shadow-sm transition-all duration-200';

        let statusBadgesSummary = '';
        if (enrolledCount > 0) {
            statusBadgesSummary += `<span class="px-2 py-0.5 rounded-full text-[0.62rem] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">Enrolled</span>`;
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
            const linkedLab = getLinkedSection(sec);
            
            const registeredSecForCourse = REGISTERED_SEC_IDS.map(id => OFFERED_SECTIONS.find(s => s.id === id)).find(s => s && s.course_code.replace(' Lab', '').trim() === baseCode);
            const isEnrolledThisSec = registeredSecForCourse && (sec.id === registeredSecForCourse.id || (linkedLab && linkedLab.id === registeredSecForCourse.id));
            const isEnrolledOtherSec = registeredSecForCourse && !isEnrolledThisSec;

            const isFull = (sec.enrolled_count >= sec.capacity) || (linkedLab && linkedLab.enrolled_count >= linkedLab.capacity);
            const courseTotalCr = sec.credits + (linkedLab ? linkedLab.credits : 0);
            const isExceedingCreditLimit = (totalRegisteredCr + courseTotalCr > 15.0);
            const conflictList = getFacConflictDetails(sec, linkedLab);
            const hasConflict = conflictList.length > 0;

            let rowBgClass = "hover:bg-slate-50 dark:hover:bg-slate-900/40 text-slate-700 dark:text-slate-200 cursor-pointer";
            let actionContent = '';
            let isDisabled = false;

            if (CURRENT_USER_ROLE === 'faculty' && !IS_REQUEST_PHASE_ACTIVE) {
                rowBgClass = "bg-slate-100/50 dark:bg-slate-900/30 text-slate-400 dark:text-slate-500 opacity-60 cursor-not-allowed";
                actionContent = `<span class="px-2.5 py-1 rounded-lg text-[0.65rem] font-bold bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">Phase Closed</span>`;
                isDisabled = true;
            } else if (isEnrolledThisSec) {
                rowBgClass = "bg-emerald-500/15 text-emerald-950 dark:text-emerald-200 font-semibold cursor-not-allowed border-l-4 border-l-emerald-600 dark:border-l-emerald-500";
                actionContent = `<span class="px-2.5 py-1 rounded-lg text-[0.65rem] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">Enrolled</span>`;
                isDisabled = true;
            } else if (isEnrolledOtherSec) {
                rowBgClass = "bg-purple-500/15 text-purple-950 dark:text-purple-200 font-semibold cursor-not-allowed border-l-4 border-l-purple-500 dark:border-l-purple-500";
                actionContent = `<span class="px-2.5 py-1 rounded-lg text-[0.65rem] font-extrabold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-300 dark:border-purple-800">Enrolled in Sec ${registeredSecForCourse.section_number}</span>`;
                isDisabled = true;
            } else if (hasConflict) {
                rowBgClass = "bg-rose-500/15 hover:bg-rose-500/20 text-rose-950 dark:text-rose-200 cursor-pointer border-l-4 border-l-rose-600 dark:border-l-rose-500";
                actionContent = `
                    <div class="text-right">
                        <span class="px-2.5 py-1 rounded-lg text-[0.65rem] font-extrabold bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200 border border-rose-300 dark:border-rose-700">Conflict</span>
                        <div class="text-[0.62rem] text-rose-700 dark:text-rose-300 font-extrabold mt-0.5">Conflicts with ${conflictList.join(', ')}</div>
                    </div>
                `;
                isDisabled = true;
            } else if (isFull) {
                rowBgClass = "bg-amber-500/15 hover:bg-amber-500/20 text-amber-950 dark:text-amber-200 cursor-pointer border-l-4 border-l-amber-500 dark:border-l-amber-500";
                actionContent = `<span class="px-2.5 py-1 rounded-lg text-[0.65rem] font-extrabold bg-amber-100 text-amber-900 dark:bg-amber-900/60 dark:text-amber-200 border border-amber-300 dark:border-amber-700">Seat Full</span>`;
                isDisabled = true;
            } else if (isExceedingCreditLimit) {
                rowBgClass = "bg-slate-100/70 dark:bg-slate-900/30 text-slate-500 dark:text-slate-400 opacity-60 cursor-not-allowed";
                actionContent = `<span class="px-2.5 py-1 rounded-lg text-[0.65rem] font-extrabold bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400">Max 15 CR</span>`;
                isDisabled = true;
            } else {
                actionContent = `
                    <button onclick="event.stopPropagation(); autoAddSection('${sec.id}')" class="px-3 py-1 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-sm flex items-center gap-1 ml-auto cursor-pointer">
                        <i data-lucide="plus" class="w-3.5 h-3.5"></i> Add
                    </button>
                `;
            }

            rowsHtml += `
                <tr ${isDisabled ? '' : `onclick="autoAddSection('${sec.id}')"`} class="transition-colors ${rowBgClass}">
                    <td class="py-2.5 px-3 font-extrabold text-xs">
                        Sec ${sec.section_number}
                    </td>
                    <td class="py-2.5 px-3 text-xs">
                        <div class="flex items-center gap-1 font-semibold">
                            <i data-lucide="clock" class="w-3 h-3 text-slate-400"></i> ${sec.schedule}
                        </div>
                        ${linkedLab ? `
                        <div class="text-[0.65rem] text-blue-500 dark:text-blue-400 font-semibold mt-0.5 flex items-center gap-1">
                            <i data-lucide="flask-conical" class="w-3 h-3"></i> + Lab Sec ${linkedLab.section_number}: ${linkedLab.schedule}
                        </div>
                        ` : ''}
                    </td>
                    <td class="py-2.5 px-3 text-xs font-medium">
                        ${sec.room || 'Main'}
                    </td>
                    <td class="py-2.5 px-3 text-xs font-mono">
                        ${sec.enrolled_count} / ${sec.capacity}
                    </td>
                    <td class="py-2.5 px-3 text-[0.65rem] text-slate-500 dark:text-slate-400 italic">
                        ${sec.prerequisites || 'None'}
                    </td>
                    <td class="py-2.5 px-3 text-right">
                        ${actionContent}
                    </td>
                </tr>
            `;
        });

        courseCard.innerHTML = `
            <div onclick="toggleFacCourseAccordion('${courseCode}')" class="p-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors select-none">
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
                    <i id="fac-accordion-icon-${cleanCode}" data-lucide="chevron-down" class="w-4 h-4 text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}"></i>
                </div>
            </div>

            <div id="fac-accordion-body-${cleanCode}" class="${isExpanded ? '' : 'hidden'} border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-[#070b14]/50 p-2 md:p-3">
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

function loadAlternativeSections(courseCode, currentSecId) {
    const container = document.getElementById('alternative-sections-container');
    const alternatives = OFFERED_SECTIONS.filter(s => s.course_code === courseCode && s.id !== currentSecId && !s.is_lab);

    if (alternatives.length === 0) {
        container.innerHTML = `<p class="text-xs text-slate-400 italic text-center py-8">No alternative section offerings available for ${courseCode}.</p>`;
        return;
    }

    const otherRegSchedules = [];
    REGISTERED_SEC_IDS.forEach(id => {
        if (id !== currentSecId) {
            const sec = OFFERED_SECTIONS.find(s => s.id === id);
            if (sec && sec.schedule) otherRegSchedules.push(sec.schedule);
        }
    });

    container.innerHTML = `
        <div class="font-extrabold text-xs text-slate-300 border-b border-slate-100 dark:border-slate-800 pb-2">${courseCode} Current: Sec (Selected)</div>
        <div class="space-y-2 pt-1">
            ${alternatives.map(sec => {
                let isConflicted = false;
                for (let s of otherRegSchedules) {
                    if (checkOverlap(sec.schedule, s)) {
                        isConflicted = true;
                        break;
                    }
                }

                let badge = isConflicted ? 
                    `<span class="px-2.5 py-1 rounded text-[0.62rem] font-black bg-amber-500/10 text-amber-500 border border-amber-500/20">Conflicted (${courseCode})</span>` :
                    `<span class="px-2.5 py-1 rounded text-[0.62rem] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400">Available</span>`;

                return `
                    <label class="block cursor-pointer">
                        <input type="radio" name="new_section_id" value="${sec.id}" ${isConflicted ? 'disabled' : ''} required class="peer sr-only">
                        <div class="p-3.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl peer-checked:border-blue-500 peer-checked:bg-blue-500/10 ${isConflicted ? 'opacity-60 cursor-not-allowed' : ''} transition-all flex justify-between items-center">
                            <div>
                                <span class="font-mono font-extrabold text-xs text-slate-900 dark:text-slate-100">Sec ${sec.section_number} Theory: ${sec.schedule}</span>
                                <div class="text-[0.68rem] text-slate-400 font-mono">Room: ${sec.room} • Seats: ${sec.enrolled_count}/${sec.capacity}</div>
                            </div>
                            ${badge}
                        </div>
                    </label>
                `;
            }).join('')}
        </div>
    `;
}

// Initial Render
document.addEventListener('DOMContentLoaded', () => {
    renderAddCards();
});
