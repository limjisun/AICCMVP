// ==========================================
// Data Generation & State
// ==========================================

const generateConsultationData = (count = 100) => {
    const consultations = [];
    const sources = ['웹', '앱', '전화', '채팅'];
    const types = ['상품 문의', '기술 지원', '불만 접수', '일반 문의', '계정 관리'];
    const results = ['success', 'transfer', 'failed'];
    const resultLabels = { success: '성공', transfer: '상담사 연결', failed: '실패' };

    for (let i = 0; i < count; i++) {
        const startHour = Math.floor(Math.random() * 24);
        const startMinute = Math.floor(Math.random() * 60);
        const durationMinutes = Math.floor(Math.random() * 10) + 1;

        const startTime = new Date(2025, 0, Math.floor(Math.random() * 7) + 13);
        startTime.setHours(startHour, startMinute, 0);

        const endTime = new Date(startTime.getTime() + durationMinutes * 60000);

        const result = results[Math.floor(Math.random() * results.length)];

        consultations.push({
            id: `S${String(i + 1).padStart(6, '0')}`,
            startTime: startTime,
            endTime: endTime,
            duration: durationMinutes,
            source: sources[Math.floor(Math.random() * sources.length)],
            type: types[Math.floor(Math.random() * types.length)],
            result: result,
            resultLabel: resultLabels[result],
            satisfaction: result === 'success' ? Math.floor(Math.random() * 2) + 4 : Math.floor(Math.random() * 3) + 1
        });
    }

    return consultations.sort((a, b) => b.startTime - a.startTime);
};

const state = {
    consultations: generateConsultationData(),
    filteredConsultations: [],
    currentPage: 1,
    itemsPerPage: 10,
    filters: {
        date: 'week',
        result: 'all',
        search: ''
    }
};

// ==========================================
// UI Rendering
// ==========================================

const formatTime = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
};

const formatDuration = (minutes) => {
    return `${minutes}분`;
};

const getStatusBadgeClass = (result) => {
    const classMap = {
        'success': 'status-badge--success',
        'transfer': 'status-badge--transfer',
        'failed': 'status-badge--failed'
    };
    return classMap[result] || '';
};

const renderStars = (rating) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
};

const renderConsultationRow = (consultation) => {
    return `
        <tr data-id="${consultation.id}">
            <td>${consultation.id}</td>
            <td>${formatTime(consultation.startTime)}</td>
            <td>${formatTime(consultation.endTime)}</td>
            <td>${formatDuration(consultation.duration)}</td>
            <td>${consultation.source}</td>
            <td>${consultation.type}</td>
            <td><span class="status-badge ${getStatusBadgeClass(consultation.result)}">${consultation.resultLabel}</span></td>
            <td><span class="rating">${renderStars(consultation.satisfaction)}</span></td>
            <td><button class="btn-action" onclick="viewDetail('${consultation.id}')">상세</button></td>
        </tr>
    `;
};

const renderTable = () => {
    const tbody = document.getElementById('consultationTableBody');
    if (!tbody) return;

    const start = (state.currentPage - 1) * state.itemsPerPage;
    const end = start + state.itemsPerPage;
    const pageData = state.filteredConsultations.slice(start, end);

    tbody.innerHTML = pageData.map(renderConsultationRow).join('');
};

const renderPagination = () => {
    const totalPages = Math.ceil(state.filteredConsultations.length / state.itemsPerPage);
    const numbersContainer = document.getElementById('paginationNumbers');
    const prevBtn = document.querySelector('.pagination__btn--prev');
    const nextBtn = document.querySelector('.pagination__btn--next');

    if (!numbersContainer) return;

    let pages = [];
    for (let i = 1; i <= Math.min(totalPages, 5); i++) {
        pages.push(i);
    }

    numbersContainer.innerHTML = pages.map(page => `
        <button class="pagination__number ${page === state.currentPage ? 'pagination__number--active' : ''}"
                onclick="goToPage(${page})">
            ${page}
        </button>
    `).join('');

    prevBtn.disabled = state.currentPage === 1;
    nextBtn.disabled = state.currentPage === totalPages;
};

// ==========================================
// Filtering & Search
// ==========================================

const applyFilters = () => {
    let filtered = [...state.consultations];

    // Date filter
    const now = new Date();
    switch (state.filters.date) {
        case 'today':
            filtered = filtered.filter(c => {
                const diff = now - c.startTime;
                return diff < 24 * 60 * 60 * 1000;
            });
            break;
        case 'week':
            filtered = filtered.filter(c => {
                const diff = now - c.startTime;
                return diff < 7 * 24 * 60 * 60 * 1000;
            });
            break;
        case 'month':
            filtered = filtered.filter(c => {
                const diff = now - c.startTime;
                return diff < 30 * 24 * 60 * 60 * 1000;
            });
            break;
    }

    // Result filter
    if (state.filters.result !== 'all') {
        filtered = filtered.filter(c => c.result === state.filters.result);
    }

    // Search filter
    if (state.filters.search) {
        const searchLower = state.filters.search.toLowerCase();
        filtered = filtered.filter(c =>
            c.id.toLowerCase().includes(searchLower) ||
            c.type.toLowerCase().includes(searchLower)
        );
    }

    state.filteredConsultations = filtered;
    state.currentPage = 1;
    renderTable();
    renderPagination();
    updateStats();
};

const updateStats = () => {
    const total = state.filteredConsultations.length;
    const success = state.filteredConsultations.filter(c => c.result === 'success').length;
    const transfer = state.filteredConsultations.filter(c => c.result === 'transfer').length;
    const failed = state.filteredConsultations.filter(c => c.result === 'failed').length;

    const avgDuration = state.filteredConsultations.reduce((sum, c) => sum + c.duration, 0) / total || 0;

    animateCountUp(document.querySelectorAll('.stat-card__number')[0], total);
    animateCountUp(document.querySelectorAll('.stat-card__number')[1], success);
    animateCountUp(document.querySelectorAll('.stat-card__number')[2], transfer);
    animateCountUp(document.querySelectorAll('.stat-card__number')[3], failed);
    animateCountUp(document.querySelectorAll('.stat-card__number')[4], avgDuration, true);
};

// ==========================================
// Event Handlers
// ==========================================

const goToPage = (page) => {
    state.currentPage = page;
    renderTable();
    renderPagination();
};

const viewDetail = (id) => {
    const consultation = state.consultations.find(c => c.id === id);
    if (consultation) {
        alert(`상담 상세 정보\n\nID: ${consultation.id}\n시작: ${formatTime(consultation.startTime)}\n종료: ${formatTime(consultation.endTime)}\n소요 시간: ${formatDuration(consultation.duration)}\n유형: ${consultation.type}\n결과: ${consultation.resultLabel}\n만족도: ${consultation.satisfaction}/5`);
    }
};

window.goToPage = goToPage;
window.viewDetail = viewDetail;

// ==========================================
// Utilities
// ==========================================

const animateCountUp = (element, target, isDecimal = false) => {
    if (!element) return;

    const start = 0;
    const duration = 1000;
    const increment = target / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = isDecimal ? target.toFixed(1) : Math.floor(target);
            clearInterval(timer);
        } else {
            element.textContent = isDecimal ? current.toFixed(1) : Math.floor(current);
        }
    }, 16);
};

const setupEventListeners = () => {
    // Date filter
    const dateFilter = document.getElementById('dateFilter');
    if (dateFilter) {
        dateFilter.addEventListener('change', (e) => {
            state.filters.date = e.target.value;
            applyFilters();
        });
    }

    // Result filter
    const resultFilter = document.getElementById('resultFilter');
    if (resultFilter) {
        resultFilter.addEventListener('change', (e) => {
            state.filters.result = e.target.value;
            applyFilters();
        });
    }

    // Search input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            state.filters.search = e.target.value;
            applyFilters();
        });
    }

    // Refresh button
    const refreshBtn = document.querySelector('.btn-refresh');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            state.consultations = generateConsultationData();
            applyFilters();
        });
    }

    // Export button
    const exportBtn = document.querySelector('.btn-export');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            alert('CSV 파일로 내보내기 기능이 곧 추가됩니다.');
        });
    }

    // Pagination
    const prevBtn = document.querySelector('.pagination__btn--prev');
    const nextBtn = document.querySelector('.pagination__btn--next');

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (state.currentPage > 1) {
                goToPage(state.currentPage - 1);
            }
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            const totalPages = Math.ceil(state.filteredConsultations.length / state.itemsPerPage);
            if (state.currentPage < totalPages) {
                goToPage(state.currentPage + 1);
            }
        });
    }
};

// ==========================================
// Initialization
// ==========================================

const init = () => {
    console.log('📋 AI Consultation History initialized');

    state.filteredConsultations = [...state.consultations];

    renderTable();
    renderPagination();
    updateStats();
    setupEventListeners();
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
