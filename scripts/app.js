// ==========================================
// Data & State Management
// ==========================================

// Session data generator
const generateSessionData = (count = 48) => {
    const sessions = [];
    const sources = ['call', 'chat']; // 클래스명으로 변경
    const statuses = [
        { type: 'normal', label: '정상' },
        { type: 'warning', label: '주의' },
        { type: 'critical', label: '개입필요' }
    ];
    const progressStages = [
        { name: '인식률', color: 'primary' },
        { name: '응답속도', color: 'success' },
        { name: '감정구간', color: 'warning' }
    ];

    const sampleConversations = [
        [
            { type: 'bot', text: '안녕하세요! 무엇을 도와드릴까요?', time: '00:00' },
            { type: 'user', text: '배송 조회 부탁드립니다', time: '00:05' },
            { type: 'bot', text: '주문번호를 알려주시겠어요?', time: '00:07' },
            { type: 'user', text: '1234567890입니다', time: '00:15' },
            { type: 'bot', text: '현재 배송 중이며, 내일 도착 예정입니다.', time: '00:18' }
        ],
        [
            { type: 'bot', text: '안녕하세요. 상담을 시작합니다.', time: '00:00' },
            { type: 'user', text: '환불 문의입니다', time: '00:03' },
            { type: 'bot', text: '환불 사유를 말씀해주세요.', time: '00:05' }
        ]
    ];

    for (let i = 0; i < count; i++) {
        const hour = Math.floor(Math.random() * 24);
        const minute = Math.floor(Math.random() * 60);
        const second = Math.floor(Math.random() * 60);

        const statusObj = statuses[Math.floor(Math.random() * statuses.length)];

        sessions.push({
            id: i + 1,
            sessionId: `S${String(i + 1).padStart(6, '0')}`,
            time: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')}`,
            source: sources[Math.floor(Math.random() * sources.length)],
            statusType: statusObj.type,
            statusLabel: statusObj.label,
            progress: progressStages.map(stage => ({
                ...stage,
                value: Math.floor(Math.random() * 100)
            })),
            conversation: sampleConversations[i % sampleConversations.length],
            duration: `${Math.floor(Math.random() * 10) + 1}분 ${Math.floor(Math.random() * 60)}초`,
            responseTime: `${(Math.random() * 2 + 0.5).toFixed(1)}초`,
            intentRate: `${Math.floor(Math.random() * 20) + 80}%`,
            satisfaction: `${Math.floor(Math.random() * 2) + 4}/5`,
            emotion: `${Math.floor(Math.random() * 30) + 70}점`,
            status: Math.random() > 0.3 ? '진행중' : '완료'
        });
    }

    return sessions.sort((a, b) => a.time.localeCompare(b.time));
};

// Application state
const state = {
    sessions: generateSessionData(),
    currentFilter: 'all',
    currentSort: 'time'
};

// ==========================================
// UI Components
// ==========================================

// Render session card
const createSessionCard = (session) => {
    const getProgressLevel = (value) => {
        if (value <= 20) return 'level-1';
        if (value <= 40) return 'level-2';
        if (value <= 60) return 'level-3';
        if (value <= 80) return 'level-4';
        return 'level-5';
    };

    const progressBars = session.progress.map(stage => `
        <div class="progress-bar">
            <span class="progress-bar__label">${stage.name}</span>
            <div class="progress-bar__track">
                <div class="progress-bar__fill progress-bar__fill--${getProgressLevel(stage.value)}"
                     style="width: ${stage.value}%"
                     data-value="${stage.value}">
                </div>
            </div>
        </div>
    `).join('');

    const cardClass = session.statusType === 'critical' ? 'session-card session-card--critical' : 'session-card';

    return `
        <div class="${cardClass}" data-session-id="${session.id}">
           <div class="session-card__session-brief">
                <div class="session-card__state">
                    <div class="session-card__source session-card__source--${session.source}"></div>
                    <div>
                        <div class="session-card__time">${session.time}</div>
                        <div class="session-card__status session-card__status--${session.statusType}">${session.statusLabel}</div>
                    </div>
                </div>
                <button class="session-card__btn"></button>
            </div>
            <div class="session-card__progress">
                ${progressBars}
            </div>
           <div class="session-card__btnwrap"><button class="session-card__action">전환</button></div>
        </div>
    `;
};

// Render all sessions
const renderSessions = (sessions = state.sessions) => {
    console.log('📊 renderSessions called, sessions count:', sessions.length);
    const sessionGrid = document.querySelector('.ai-session-grid');

    if (!sessionGrid) {
        console.warn('⚠️ ai-session-grid element not found!');
        return;
    }

    console.log('✅ ai-session-grid found, rendering cards...');
    sessionGrid.innerHTML = sessions.map(createSessionCard).join('');

    // Add click event listeners to button only
    sessionGrid.querySelectorAll('.session-card__btn').forEach(btn => {
        btn.addEventListener('click', (event) => {
            event.stopPropagation(); // 부모로 이벤트 전파 방지
            const card = btn.closest('.session-card');
            const sessionId = parseInt(card.dataset.sessionId);
            const session = state.sessions.find(s => s.id === sessionId);

            if (session) {
                handleSessionClick(card, session);
            }
        });
    });

    // Animate progress bars
    animateProgressBars();

    console.log('✅ Rendered', sessions.length, 'session cards');
};

// ==========================================
// Animations
// ==========================================

// Count up animation for stat cards
const animateCountUp = (element, target, duration = 1000) => {
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            // Handle decimal numbers
            if (target % 1 !== 0) {
                element.textContent = current.toFixed(1);
            } else {
                element.textContent = Math.floor(current);
            }
        }
    }, 16);
};

// Animate all stat numbers
const animateStatCards = () => {
    const statNumbers = document.querySelectorAll('.stat-card__number');

    statNumbers.forEach(number => {
        const target = parseFloat(number.dataset.target);
        animateCountUp(number, target);
    });
};

// Animate progress bars
const animateProgressBars = () => {
    const progressFills = document.querySelectorAll('.progress-bar__fill');

    progressFills.forEach((fill, index) => {
        const targetWidth = fill.dataset.value + '%';
        fill.style.width = '0%';

        setTimeout(() => {
            fill.style.width = targetWidth;
        }, index * 50);
    });
};

// ==========================================
// Event Handlers
// ==========================================

// Handle session card click
const handleSessionClick = (card, session) => {
    console.log('Session clicked:', session);

    // Remove active class from all cards
    document.querySelectorAll('.session-card').forEach(c => {
        c.classList.remove('active');
    });

    // Add active class to clicked card
    card.classList.add('active');

    // Scroll the card into view smoothly
    const sessionGrid = document.querySelector('.ai-session-grid');
    if (sessionGrid) {
        // Calculate offset to center the card in the viewport
        const cardTop = card.offsetTop;
        const cardHeight = card.offsetHeight;
        const gridVisibleHeight = sessionGrid.clientHeight;

        // Center the card in the grid's visible area
        const targetScroll = cardTop - (gridVisibleHeight / 2) + (cardHeight / 2);

        sessionGrid.scrollTo({
            top: targetScroll,
            behavior: 'smooth'
        });
    }

    // Here you can open a modal or navigate to detail page
    showSessionDetail(session);
};

// Show session detail panel (expand to 3-column layout)
const showSessionDetail = (session) => {
    const sessionWrapper = document.querySelector('.ai-session-wrapper');

    if (!sessionWrapper) return;

    // Add detail-open class to expand the detail panel
    sessionWrapper.classList.add('detail-open');

    // Populate session details
    document.getElementById('detailSessionId').textContent = session.sessionId;
    document.getElementById('detailStatus').textContent = `● ${session.status}`;
    document.getElementById('detailId').textContent = session.sessionId;
    document.getElementById('detailTime').textContent = session.time;
    document.getElementById('detailSource').textContent = session.source;
    document.getElementById('detailDuration').textContent = session.duration;

    // Populate progress bars
    const progressList = document.getElementById('detailProgressList');
    progressList.innerHTML = session.progress.map(p => `
        <div class="detail-progress-item">
            <div class="detail-progress-header">
                <span class="detail-progress-name">${p.name}</span>
                <span class="detail-progress-percent">${p.value}%</span>
            </div>
            <div class="detail-progress-bar">
                <div class="detail-progress-fill" style="width: ${p.value}%"></div>
            </div>
        </div>
    `).join('');

    // Populate conversation timeline
    const timeline = document.getElementById('conversationTimeline');
    timeline.innerHTML = session.conversation.map(msg => `
        <div class="conversation-message conversation-message--${msg.type}">
            <div class="conversation-avatar">${msg.type === 'bot' ? '🤖' : '👤'}</div>
            <div>
                <div class="conversation-bubble">${msg.text}</div>
                <div class="conversation-time">${msg.time}</div>
            </div>
        </div>
    `).join('');

    // Populate performance metrics
    document.getElementById('detailResponseTime').textContent = session.responseTime;
    document.getElementById('detailIntentRate').textContent = session.intentRate;
    document.getElementById('detailSatisfaction').textContent = session.satisfaction;
    document.getElementById('detailEmotion').textContent = session.emotion;

    // Setup action buttons
    setupDetailPanelActions();
};

// Close detail panel and return to 2-column layout
const closeDetailPanel = () => {
    const sessionWrapper = document.querySelector('.ai-session-wrapper');

    if (!sessionWrapper) return;

    // Remove detail-open class to collapse the detail panel
    sessionWrapper.classList.remove('detail-open');

    // Remove active class from all session cards
    document.querySelectorAll('.session-card').forEach(card => {
        card.classList.remove('active');
    });
};


// Handle refresh button
const handleRefresh = () => {
    console.log('Refreshing data...');

    // Regenerate sessions
    state.sessions = generateSessionData();
    renderSessions();

    // Show feedback
    const btn = document.querySelector('.btn-refresh');
    const originalText = btn.textContent;
    btn.textContent = '✓ 새로고침 완료';
    btn.style.background = '#4A90E2';
    btn.style.color = 'white';

    setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '';
        btn.style.color = '';
    }, 2000);
};

// Handle sidebar navigation
const handleNavigation = (event) => {
    const items = document.querySelectorAll('.sidebar__item');
    items.forEach(item => item.classList.remove('sidebar__item--active'));
    event.currentTarget.classList.add('sidebar__item--active');

    console.log('Navigation:', event.currentTarget.querySelector('.sidebar__label')?.textContent);
};

// ==========================================
// Utility Functions
// ==========================================

// Filter sessions
const filterSessions = (filterType) => {
    state.currentFilter = filterType;

    let filtered = state.sessions;

    // Apply filtering logic here if needed
    switch (filterType) {
        case 'pending':
            // Filter pending sessions
            break;
        case 'completed':
            // Filter completed sessions
            break;
        default:
            filtered = state.sessions;
    }

    renderSessions(filtered);
};

// Sort sessions
const sortSessions = (sortType) => {
    state.currentSort = sortType;

    let sorted = [...state.sessions];

    switch (sortType) {
        case 'time':
            sorted.sort((a, b) => a.time.localeCompare(b.time));
            break;
        case 'source':
            sorted.sort((a, b) => a.source.localeCompare(b.source));
            break;
        default:
            break;
    }

    state.sessions = sorted;
    renderSessions(sorted);
};

// ==========================================
// Initialization
// ==========================================

const init = () => {
    console.log('🚀 AI Monitoring Dashboard initialized');
    console.log('📍 Current sessionGrid:', document.querySelector('.ai-session-grid'));

    // Render initial sessions
    renderSessions();

    // Animate stat cards
    animateStatCards();

    // Setup event listeners
    setupEventListeners();

    // Auto refresh every 30 seconds (optional)
    // setInterval(handleRefresh, 30000);
};

const setupEventListeners = () => {
    // Refresh button
    const refreshBtn = document.querySelector('.btn-refresh');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', handleRefresh);
    }

    // Sidebar navigation
    const navItems = document.querySelectorAll('.sidebar__item');
    navItems.forEach(item => {
        item.addEventListener('click', handleNavigation);
    });

    // Logout button
    const logoutBtn = document.querySelector('.header__logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (confirm('로그아웃 하시겠습니까?')) {
                console.log('Logging out...');
                // Handle logout logic
            }
        });
    }

    // Detail panel close button
    const closeBtn = document.getElementById('closeDetailPanel');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeDetailPanel);
    }

    // Setup detail panel action buttons (will be added after panel is shown)
    setupDetailPanelActions();

    // Setup tooltips
    setupTooltips();
};

// Setup detail panel action buttons
const setupDetailPanelActions = () => {
    // This will be called after the panel is shown
    setTimeout(() => {
        const detailBtns = document.querySelectorAll('.detail-btn');
        detailBtns.forEach(btn => {
            btn.removeEventListener('click', handleDetailAction); // Remove old listeners
            btn.addEventListener('click', handleDetailAction);
        });
    }, 100);
};

const handleDetailAction = (e) => {
    const text = e.target.textContent;
    console.log('Detail action:', text);

    if (text === '대화 종료') {
        if (confirm('대화를 종료하시겠습니까?')) {
            closeDetailPanel();
            alert('대화가 종료되었습니다.');
        }
    } else {
        alert(`"${text}" 기능이 곧 추가됩니다.`);
    }
};

// ==========================================
// Additional Animations
// ==========================================

// ==========================================
// Tooltip System
// ==========================================

const setupTooltips = () => {
    // 툴팁 컨테이너 생성
    let tooltipContainer = document.getElementById('tooltip-container');
    if (!tooltipContainer) {
        tooltipContainer = document.createElement('div');
        tooltipContainer.id = 'tooltip-container';
        tooltipContainer.style.cssText = `
            position: fixed;
            background: #2C2C2C;
            color: white;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 12px;
            line-height: 1.4;
            white-space: nowrap;
            pointer-events: none;
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.2s ease, visibility 0.2s ease;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        `;
        document.body.appendChild(tooltipContainer);
    }

    // 화살표 생성
    let tooltipArrow = document.getElementById('tooltip-arrow');
    if (!tooltipArrow) {
        tooltipArrow = document.createElement('div');
        tooltipArrow.id = 'tooltip-arrow';
        tooltipArrow.style.cssText = `
            position: fixed;
            width: 0;
            height: 0;
            border: 6px solid transparent;
            border-right-color: #2C2C2C;
            pointer-events: none;
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.2s ease, visibility 0.2s ease;
            z-index: 9999;
        `;
        document.body.appendChild(tooltipArrow);
    }

    // 모든 툴팁 요소에 이벤트 리스너 추가
    document.querySelectorAll('.tooltip').forEach(tooltip => {
        tooltip.addEventListener('mouseenter', () => {
            const text = tooltip.getAttribute('data-tooltip');
            if (!text) return;

            const rect = tooltip.getBoundingClientRect();

            // 툴팁 표시
            tooltipContainer.textContent = text;
            tooltipContainer.style.opacity = '1';
            tooltipContainer.style.visibility = 'visible';

            // 툴팁 위치 계산 (오른쪽)
            const tooltipRect = tooltipContainer.getBoundingClientRect();
            const left = rect.right + 8;
            const top = rect.top + (rect.height / 2) - (tooltipRect.height / 2);

            tooltipContainer.style.left = left + 'px';
            tooltipContainer.style.top = top + 'px';

            // 화살표 위치
            tooltipArrow.style.opacity = '1';
            tooltipArrow.style.visibility = 'visible';
            tooltipArrow.style.left = (rect.right + 2) + 'px';
            tooltipArrow.style.top = (rect.top + rect.height / 2 - 6) + 'px';
        });

        tooltip.addEventListener('mouseleave', () => {
            tooltipContainer.style.opacity = '0';
            tooltipContainer.style.visibility = 'hidden';
            tooltipArrow.style.opacity = '0';
            tooltipArrow.style.visibility = 'hidden';
        });
    });
};

// Add pulse animation for clicked cards
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0%, 100% {
            transform: scale(1);
        }
        50% {
            transform: scale(1.05);
        }
    }
`;
document.head.appendChild(style);

// ==========================================
// Start Application
// ==========================================

// Don't initialize immediately - wait for page to call reinit()
console.log('📦 Dashboard app loaded (waiting for page initialization)');

// Export functions for external use
window.dashboardApp = {
    state,
    filterSessions,
    sortSessions,
    handleRefresh,
    renderSessions,
    reinit: init  // Expose init as reinit for page-triggered initialization
};
