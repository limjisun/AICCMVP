// ==========================================
// Data Generation & State
// ==========================================

const generateKeywordData = (count = 50) => {
    const keywordNames = [
        '환불', '배송', '주문취소', '반품', '교환', '가격', '할인', '쿠폰',
        '결제', '오류', '로그인', '회원가입', '비밀번호', '계정', '포인트',
        '적립', '이벤트', '상품문의', '재고', '품절', '입고', '예약',
        '취소불가', '변경', '수정', '확인', '상담원', '연결', '대기시간',
        '불만', '불편', '개선', '건의', '피드백', '추천', '리뷰',
        '사이즈', '색상', '옵션', '수량', '배송비', '무료배송', '당일배송',
        '품질', '불량', '파손', '상태', '확인요청', 'A/S', '보상'
    ];

    const categories = ['product', 'complaint', 'general'];
    const categoryLabels = { product: '제품/서비스', complaint: '불만/문의', general: '일반' };

    const keywords = [];

    for (let i = 0; i < count; i++) {
        const detectionCount = Math.floor(Math.random() * 300) + 10;
        const detectionRate = Math.floor(Math.random() * 30) + 70;
        const trend = Math.random() > 0.5 ? 'up' : (Math.random() > 0.5 ? 'down' : 'neutral');
        const category = categories[Math.floor(Math.random() * categories.length)];

        keywords.push({
            id: i + 1,
            name: keywordNames[i % keywordNames.length] + (i >= keywordNames.length ? ` ${Math.floor(i / keywordNames.length) + 1}` : ''),
            category: category,
            categoryLabel: categoryLabels[category],
            detectionCount: detectionCount,
            detectionRate: detectionRate,
            trend: trend,
            status: Math.random() > 0.15 ? 'active' : 'inactive'
        });
    }

    return keywords.sort((a, b) => b.detectionCount - a.detectionCount);
};

const state = {
    keywords: generateKeywordData(),
    filteredKeywords: [],
    currentPage: 1,
    itemsPerPage: 15,
    filters: {
        period: 'week',
        category: 'all'
    }
};

// ==========================================
// UI Rendering
// ==========================================

const getTrendIcon = (trend) => {
    const icons = {
        'up': '📈',
        'down': '📉',
        'neutral': '➡️'
    };
    return icons[trend] || '➡️';
};

const getTrendClass = (trend) => {
    return `trend-indicator--${trend}`;
};

const getStatusBadgeClass = (status) => {
    return status === 'active' ? 'status-badge--active' : 'status-badge--inactive';
};

const getStatusLabel = (status) => {
    return status === 'active' ? '활성' : '비활성';
};

const renderKeywordRow = (keyword, index) => {
    return `
        <tr data-id="${keyword.id}">
            <td>${index + 1}</td>
            <td><strong>${keyword.name}</strong></td>
            <td>${keyword.categoryLabel}</td>
            <td>${keyword.detectionCount.toLocaleString()}회</td>
            <td>${keyword.detectionRate}%</td>
            <td><span class="trend-indicator ${getTrendClass(keyword.trend)}">${getTrendIcon(keyword.trend)}</span></td>
            <td><span class="status-badge ${getStatusBadgeClass(keyword.status)}">${getStatusLabel(keyword.status)}</span></td>
            <td>
                <button class="btn-action" onclick="editKeyword(${keyword.id})">수정</button>
                <button class="btn-action" onclick="deleteKeyword(${keyword.id})">삭제</button>
            </td>
        </tr>
    `;
};

const renderTable = () => {
    const tbody = document.getElementById('keywordTableBody');
    if (!tbody) return;

    const start = (state.currentPage - 1) * state.itemsPerPage;
    const end = start + state.itemsPerPage;
    const pageData = state.filteredKeywords.slice(start, end);

    tbody.innerHTML = pageData.map((keyword, idx) => renderKeywordRow(keyword, start + idx)).join('');
};

const renderTopKeywords = () => {
    const container = document.getElementById('topKeywordsList');
    if (!container) return;

    const top10 = state.filteredKeywords.slice(0, 10);

    container.innerHTML = top10.map((keyword, idx) => `
        <div class="keyword-item">
            <div class="keyword-item__rank">#${idx + 1}</div>
            <div class="keyword-item__name">${keyword.name}</div>
            <div class="keyword-item__count">${keyword.detectionCount}회</div>
        </div>
    `).join('');
};

const renderKeywordCloud = () => {
    const container = document.getElementById('keywordCloud');
    if (!container) return;

    const top30 = state.filteredKeywords.slice(0, 30);

    const maxCount = Math.max(...top30.map(k => k.detectionCount));
    const minCount = Math.min(...top30.map(k => k.detectionCount));

    container.innerHTML = top30.map(keyword => {
        const normalized = (keyword.detectionCount - minCount) / (maxCount - minCount);
        const size = Math.floor(normalized * 5) + 1;

        return `<span class="cloud-keyword cloud-keyword--size-${size}" title="${keyword.detectionCount}회">${keyword.name}</span>`;
    }).join('');
};

const renderPagination = () => {
    const totalPages = Math.ceil(state.filteredKeywords.length / state.itemsPerPage);
    const numbersContainer = document.getElementById('paginationNumbers');
    const prevBtn = document.querySelector('.pagination__btn--prev');
    const nextBtn = document.querySelector('.pagination__btn--next');

    if (!numbersContainer) return;

    let pages = [];
    const maxVisible = 5;
    let startPage = Math.max(1, state.currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage < maxVisible - 1) {
        startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
    }

    numbersContainer.innerHTML = pages.map(page => `
        <button class="pagination__number ${page === state.currentPage ? 'pagination__number--active' : ''}"
                onclick="goToPage(${page})">
            ${page}
        </button>
    `).join('');

    if (prevBtn) prevBtn.disabled = state.currentPage === 1;
    if (nextBtn) nextBtn.disabled = state.currentPage === totalPages;
};

// ==========================================
// Filtering
// ==========================================

const applyFilters = () => {
    let filtered = [...state.keywords];

    // Category filter
    if (state.filters.category !== 'all') {
        filtered = filtered.filter(k => k.category === state.filters.category);
    }

    state.filteredKeywords = filtered;
    state.currentPage = 1;

    renderTable();
    renderTopKeywords();
    renderKeywordCloud();
    renderPagination();
    updateStats();
};

const updateStats = () => {
    const total = state.keywords.length;
    const totalDetections = state.filteredKeywords.reduce((sum, k) => sum + k.detectionCount, 0);
    const active = state.keywords.filter(k => k.status === 'active').length;
    const avgRate = state.filteredKeywords.reduce((sum, k) => sum + k.detectionRate, 0) / state.filteredKeywords.length || 0;

    const statNumbers = document.querySelectorAll('.stat-card__number');
    if (statNumbers.length >= 4) {
        animateCountUp(statNumbers[0], total);
        animateCountUp(statNumbers[1], totalDetections);
        animateCountUp(statNumbers[2], active);
        animateCountUp(statNumbers[3], avgRate, true);
    }
};

// ==========================================
// Event Handlers
// ==========================================

const goToPage = (page) => {
    state.currentPage = page;
    renderTable();
    renderPagination();
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

const editKeyword = (id) => {
    const keyword = state.keywords.find(k => k.id === id);
    if (keyword) {
        alert(`키워드 수정\n\nID: ${keyword.id}\n이름: ${keyword.name}\n카테고리: ${keyword.categoryLabel}\n\n수정 기능이 곧 추가됩니다.`);
    }
};

const deleteKeyword = (id) => {
    const keyword = state.keywords.find(k => k.id === id);
    if (keyword) {
        if (confirm(`"${keyword.name}" 키워드를 삭제하시겠습니까?`)) {
            state.keywords = state.keywords.filter(k => k.id !== id);
            applyFilters();
        }
    }
};

const addKeyword = () => {
    alert('키워드 추가 기능이 곧 추가됩니다.');
};

// Make functions global
window.goToPage = goToPage;
window.editKeyword = editKeyword;
window.deleteKeyword = deleteKeyword;
window.addKeyword = addKeyword;

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
    // Period filter
    const periodFilter = document.getElementById('periodFilter');
    if (periodFilter) {
        periodFilter.addEventListener('change', (e) => {
            state.filters.period = e.target.value;
            // In real app, would fetch different data based on period
            applyFilters();
        });
    }

    // Category filter
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', (e) => {
            state.filters.category = e.target.value;
            applyFilters();
        });
    }

    // Add keyword button
    const addBtn = document.querySelector('.btn-add');
    if (addBtn) {
        addBtn.addEventListener('click', addKeyword);
    }

    // Refresh button
    const refreshBtn = document.querySelector('.btn-refresh');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            state.keywords = generateKeywordData();
            applyFilters();
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
            const totalPages = Math.ceil(state.filteredKeywords.length / state.itemsPerPage);
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
    console.log('🔑 Keyword Analysis initialized');

    state.filteredKeywords = [...state.keywords];

    renderTable();
    renderTopKeywords();
    renderKeywordCloud();
    renderPagination();
    updateStats();
    setupEventListeners();
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
