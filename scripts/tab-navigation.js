// Simple Content Navigation System
const TabNav = {
    init: function() {
        this._cacheElements();
        this._initIndicatorPosition(); // 초기 위치 설정
        this._loadDefaultPage();
        this._bindEvents();
    },

    _initIndicatorPosition: function() {
        // 첫 번째 active 아이템 위치로 인디케이터 초기화
        const activeItem = this.$sidebar.querySelector('.sidebar__item--active');
        if (activeItem) {
            const itemTop = activeItem.offsetTop;
            this.$indicator.style.top = `${itemTop}px`;
        }
    },

    _cacheElements: function() {
        this.$contents = document.querySelector('.contents-wrap');
        this.$sidebar = document.querySelector('.sidebar__nav');
        this.$indicator = document.querySelector('.sidebar__indicator');
        this.$indicatorIcon = this.$indicator.querySelector('.sidebar__icon--active');
    },

    _loadPage: function(page) {
        const url = `pages/${page}.html`;

        // Update sidebar active state
        this._updateSidebarActive(page);

        // Load content
        this._loadContent(url);
    },

    _loadContent: function(url) {
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.text();
            })
            .then(html => {
                // Remove previously loaded page scripts
                this._removePageScripts();

                // Load new content
                this.$contents.innerHTML = html;

                // Execute any scripts in the loaded content
                this._executeScripts(html);
            })
            .catch(error => {
                this.$contents.innerHTML = `<div style="padding:1rem;color:red">불러오기 실패: ${error.message}</div>`;
            });
    },

    _removePageScripts: function() {
        // Remove previously loaded page scripts
        const oldScripts = document.querySelectorAll('script[data-page-script="true"]');
        oldScripts.forEach(script => script.remove());
    },

    _executeScripts: function(html) {
        // Extract and execute ONLY INLINE script tags (not external src files)
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const scripts = doc.querySelectorAll('script');

        scripts.forEach(oldScript => {
            // Skip external scripts - they should be loaded once in index.html
            if (oldScript.src) {
                console.log('⏭️ Skipping external script (already loaded):', oldScript.src);
                return;
            }

            // Only execute inline scripts
            if (oldScript.innerHTML) {
                const newScript = document.createElement('script');
                newScript.setAttribute('data-page-script', 'true');
                newScript.innerHTML = oldScript.innerHTML;
                document.body.appendChild(newScript);
                console.log('✅ Executed inline page script');
            }
        });
    },

    _updateSidebarActive: function(page) {
        // Remove active class from all sidebar items
        this.$sidebar.querySelectorAll('.sidebar__item').forEach(item => {
            item.classList.remove('sidebar__item--active');
        });

        // Add active class to corresponding sidebar item
        const $sidebarItem = this.$sidebar.querySelector(`.sidebar__item[data-page="${page}"]`);
        if ($sidebarItem) {
            $sidebarItem.classList.add('sidebar__item--active');

            // 엘리베이터 효과: 인디케이터 이동
            this._updateIndicator($sidebarItem);
        }
    },

    _updateIndicator: function(item) {
        // 클릭한 아이템의 Y 위치로 인디케이터 이동
        const itemTop = item.offsetTop;
        this.$indicator.style.top = `${itemTop}px`;

        // 인디케이터 안의 아이콘도 변경
        const icon = item.dataset.icon;
        this.$indicatorIcon.setAttribute('data-icon', icon);
    },

    _loadDefaultPage: function() {
        // Load monitoring page by default
        this._loadPage('monitoring');
    },

    _bindEvents: function() {
        const self = this;

        // Sidebar click event
        this.$sidebar.addEventListener('click', function(e) {
            const $item = e.target.closest('.sidebar__item');
            if (!$item) return;

            e.preventDefault();
            const page = $item.dataset.page;

            if (!page) return;

            self._loadPage(page);
        });
    }
};

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => TabNav.init());
} else {
    TabNav.init();
}
