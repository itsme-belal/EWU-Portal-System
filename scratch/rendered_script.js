
        // Init Lucide
        lucide.createIcons();

        // ── Developer Info Modal ──────────────────────────────────────
        function openDevModal() {
            const modal = document.getElementById('dev-info-modal');
            if (!modal) return;
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            // Re-trigger animation each open
            const card = modal.querySelector('div');
            if (card) {
                card.style.animation = 'none';
                card.offsetHeight; // reflow
                card.style.animation = 'devModalIn .35s cubic-bezier(.22,1,.36,1) both';
            }
        }
        function closeDevModal() {
            const modal = document.getElementById('dev-info-modal');
            if (modal) modal.style.display = 'none';
            document.body.style.overflow = '';
        }
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') closeDevModal();
        });
        // ─────────────────────────────────────────────────────────────

        // Unified Theme Logic
        function toggleMenu(menuId, forceOpen) {
            const menu = document.getElementById(menuId);
            const arrow = document.getElementById(`${menuId}-arrow`);
            if (!menu) return;
            const isHidden = menu.classList.contains('hidden') || !menu.classList.contains('open');
            const shouldOpen = typeof forceOpen === 'boolean' ? forceOpen : isHidden;
            if (shouldOpen) {
                menu.classList.remove('hidden');
                menu.classList.add('open');
                if (arrow) arrow.classList.add('rotate-90', 'open');
            } else {
                menu.classList.add('hidden');
                menu.classList.remove('open');
                if (arrow) arrow.classList.remove('rotate-90', 'open');
            }
        }

        function toggleSidebar() {
            if (window.innerWidth >= 1024) {
                const isClosed = document.body.classList.toggle('sidebar-closed');
                localStorage.setItem('sidebar_closed', isClosed ? 'true' : 'false');
            } else {
                document.body.classList.toggle('sidebar-open');
            }
        }

        // On load, apply saved desktop sidebar state
        (function() {
            if (window.innerWidth >= 1024) {
                const closed = localStorage.getItem('sidebar_closed') !== 'false';
                if (closed) {
                    document.body.classList.add('sidebar-closed');
                } else {
                    document.body.classList.remove('sidebar-closed');
                }
            }
        })();

        function applyTheme(theme) {
            theme = 'light';
            localStorage.setItem('theme', 'light');
            localStorage.setItem('ewu_theme', 'light');

            document.documentElement.setAttribute('data-theme', 'light');
            document.body.setAttribute('data-theme', 'light');

            document.documentElement.classList.remove('dark');
            document.body.classList.remove('dark');
            document.body.style.backgroundImage = '';
            document.body.style.backgroundSize = '';
            document.body.style.backgroundPosition = '';
            document.body.style.backgroundAttachment = '';

            document.documentElement.style.backgroundColor = '#F5F7FA';
            document.body.style.backgroundColor = '#F5F7FA';
            document.documentElement.style.color = '#0f172a';
        }

        applyTheme('light');

        function toggleDarkMode() {
            applyTheme('light');
        }

        // Global Toast Trigger
        function showToast(type, msg) {
            const toast = document.getElementById('toast-box');
            const border = document.getElementById('toast-border');
            const icon = document.getElementById('toast-icon');
            const title = document.getElementById('toast-title');
            const message = document.getElementById('toast-msg');

            message.textContent = msg;

            if (type === 'success') {
                border.style.borderLeftColor = '#10B981';
                border.style.borderLeftWidth = '4px';
                border.style.borderLeftStyle = 'solid';
                icon.className = 'w-5 h-5 mt-0.5';
                icon.style.color = '#10B981';
                icon.setAttribute('data-lucide', 'check-circle-2');
                title.textContent = 'Success';
                title.style.color = '#10B981';
            } else if (type === 'info' || type === 'notice') {
                border.style.borderLeftColor = '#0EA5E9';
                border.style.borderLeftWidth = '4px';
                border.style.borderLeftStyle = 'solid';
                icon.className = 'w-5 h-5 mt-0.5';
                icon.style.color = '#0EA5E9';
                icon.setAttribute('data-lucide', 'info');
                title.textContent = msg && msg.startsWith('Batch Excel Results') ? 'Batch Ingestion Summary' : 'Notice';
                title.style.color = '#0EA5E9';
            } else if (type === 'warning') {
                border.style.borderLeftColor = '#F59E0B';
                border.style.borderLeftWidth = '4px';
                border.style.borderLeftStyle = 'solid';
                icon.className = 'w-5 h-5 mt-0.5';
                icon.style.color = '#F59E0B';
                icon.setAttribute('data-lucide', 'alert-triangle');
                title.textContent = 'Warning';
                title.style.color = '#F59E0B';
            } else {
                border.style.borderLeftColor = '#EF4444';
                border.style.borderLeftWidth = '4px';
                border.style.borderLeftStyle = 'solid';
                icon.className = 'w-5 h-5 mt-0.5';
                icon.style.color = '#EF4444';
                icon.setAttribute('data-lucide', 'x-circle');
                title.textContent = 'Error';
                title.style.color = '#EF4444';
            }

            lucide.createIcons();

            toast.classList.remove('hidden');
            setTimeout(() => { toast.classList.remove('translate-y-4', 'opacity-0'); }, 50);
            setTimeout(() => {
                toast.classList.add('translate-y-4', 'opacity-0');
                setTimeout(() => { toast.classList.add('hidden'); }, 300);
            }, 4000);
        }

        function toggleSidebar() {
            const isClosed = document.body.classList.contains('sidebar-closed');
            if (isClosed) {
                document.body.classList.remove('sidebar-closed');
                localStorage.setItem('sidebar_closed', 'false');
            } else {
                document.body.classList.add('sidebar-closed');
                localStorage.setItem('sidebar_closed', 'true');
            }
        }

        function smartRefreshPage() {
            const url = new URL(window.location.href);
            const activeTabParam = url.searchParams.get('tab');
            const storedTab = sessionStorage.getItem('active_tab_id') || sessionStorage.getItem('active_profile_tab');
            if (storedTab && !activeTabParam) {
                url.searchParams.set('tab', storedTab);
            }
            window.location.href = url.toString();
        }

        // Refresh page when navigating Back or Forward from browser history cache
        window.addEventListener('pageshow', function(event) {
            if (event.persisted || (window.performance && window.performance.getEntriesByType && window.performance.getEntriesByType("navigation")[0] && window.performance.getEntriesByType("navigation")[0].type === "back_forward")) {
                window.location.reload();
            }
        });

        // Clean up fast-tab-styling to allow dynamic tab switching
        window.addEventListener('DOMContentLoaded', function() {
            const styleEl = document.getElementById('fast-tab-styling');
            if (styleEl) {
                styleEl.remove();
            }
        });

        // Display Flask flashed messages as toasts
        
            
        
    