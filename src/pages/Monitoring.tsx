import React, { useState, useRef, useEffect } from 'react';
import BotInfoPanel from '../components/monitoring/BotInfoPanel';
import BotStatus from '../components/monitoring/BotStatus';
import SessionCard from '../components/monitoring/SessionCard';
import SessionDetail from '../components/monitoring/SessionDetail';

import { useSessionStore } from '../stores/sessionStore';
import type { Session, TabType, FilterStatus } from '../types';

const Monitoring: React.FC = () => {
  // Zustand store에서 세션 데이터 가져오기
  const { sessions, isLoading, fetchSessions } = useSessionStore();

  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [isSimpleView, setIsSimpleView] = useState(false); // 간략하게 보기 상태

  const tabsRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const allTabRef = useRef<HTMLButtonElement>(null);
  const callTabRef = useRef<HTMLButtonElement>(null);
  const chatTabRef = useRef<HTMLButtonElement>(null);
  const sessionCardRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // 컴포넌트 마운트시 세션 데이터 로드
  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  // 세션 카드 클릭 핸들러 (스크롤 포함)
  const handleSessionClick = (session: Session) => {
    setSelectedSession(session);

    // 상세 패널이 열린 후 스크롤 (트랜지션 0.3s + 여유 0.05s)
    setTimeout(() => {
      const cardElement = sessionCardRefs.current[session.id];
      if (cardElement) {
        cardElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    }, 350);
  };

  // 필터링된 세션 계산
  const filteredSessions = sessions.filter((session) => {
    // 1단계: 상단 탭 필터 (전체/Call/Chat)
    const sourceMatch = activeTab === 'all' || session.source === activeTab;

    // 2단계: 하단 상태 필터 (전체/정상/주의/개입)
    const statusMatch = filterStatus === 'all' || session.status === filterStatus;

    return sourceMatch && statusMatch;
  });

  // 각 카테고리별 카운트
  const counts = {
    all: sessions.length,
    call: sessions.filter(s => s.source === 'call').length,
    chat: sessions.filter(s => s.source === 'chat').length,
    allStatus: sessions.filter(s => activeTab === 'all' || s.source === activeTab).length,
    normal: sessions.filter(s => (activeTab === 'all' || s.source === activeTab) && s.status === 'normal').length,
    warning: sessions.filter(s => (activeTab === 'all' || s.source === activeTab) && s.status === 'warning').length,
    critical: sessions.filter(s => (activeTab === 'all' || s.source === activeTab) && s.status === 'critical').length,
  };

  // 통계 데이터 가짜데이터
  const statsData = [
    {
      label: '총 세션수',
      value: 48,
      unit: '건',
      subInfo: '동시세션 37',
      trend: 'rise' as const,
      changeText: '어제보다 2건 증가 +12 | +10%'
    },
    {
      label: '평균 응답 속도',
      value: 1.2,
      unit: '초',
      trend: 'decrease' as const,
      changeText: '어제보다 0.1초 빠름'
    },
    {
      label: '인텐트 인식 성공률',
      value: 88,
      unit: '%',
      trend: 'rise' as const,
      changeText: '어제보다 10% 증가'
    },
    {
      label: '상담 성공',
      value: 55,
      unit: '건',
      subInfo: '15%',
      trend: 'rise' as const,
      changeText: '어제보다 18건 증가 | +10%'
    },
    {
      label: '상담사 전환',
      value: 5,
      unit: '건',
      subInfo: '15%',
      trend: 'decrease' as const,
      changeText: '어제보다 2건 감소 | -10%'
    },
    {
      label: '고객 이탈',
      value: 15,
      unit: '건',
      subInfo: '15%',
      trend: 'decrease' as const,
      changeText: '어제보다 2건 감소 | -10%'
    }
  ];

  useEffect(() => {
    const updateIndicator = () => {
      let activeTabElement: HTMLButtonElement | null = null;

      if (activeTab === 'all') activeTabElement = allTabRef.current;
      if (activeTab === 'call') activeTabElement = callTabRef.current;
      if (activeTab === 'chat') activeTabElement = chatTabRef.current;

      if (activeTabElement && indicatorRef.current && tabsRef.current) {
        const tabsRect = tabsRef.current.getBoundingClientRect();
        const activeRect = activeTabElement.getBoundingClientRect();

        const left = activeRect.left - tabsRect.left;
        const width = activeRect.width;

        indicatorRef.current.style.transform = `translateX(${left}px)`;
        indicatorRef.current.style.width = `${width}px`;
      }
    };

    // 세션이 있을 때만 indicator 업데이트
    if (sessions.length > 0) {
      updateIndicator();
    }
  }, [activeTab, sessions.length]);

  return (
    <div className="page-monitor">
    {/* 진행중인 상담이 없을때*/}
    {sessions.length === 0 ? (
      <div className="ai-session-empty">
        <h3 className="page-title">AI 모니터링</h3>
        <div className="ai-session-empty__content">
            <BotStatus name="유미Bot" status="normal" />
            <p className="ai-session-empty__description1">아직 진행중인 상담이 없습니다.</p>
            <p className='ai-session-empty__description2'>AI 상담사 유미가 잠시 쉬는 중이에요<br/>새로운 상담이 시작되면 바로 모니터링됩니다.</p>
        </div>
      </div>
    ) : (
    <>
      <BotInfoPanel botName="유미Bot" status="normal" />{/*ai 이름과 상태*/}
      <div className="ai-bot-entire">
        {/* 상단 탭 영역 */}
        <div className="ai-entire-header">
          <div className="ai-entire-tabs" ref={tabsRef}>
            <button
              ref={allTabRef}
              className={`ai-entire-tab ${activeTab === 'all' ? 'ai-entire-tab--active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              전체 {counts.all}
            </button>
            <button
              ref={callTabRef}
              className={`ai-entire-tab ${activeTab === 'call' ? 'ai-entire-tab--active' : ''}`}
              onClick={() => setActiveTab('call')}
            >
              Call {counts.call}
            </button>
            <button
              ref={chatTabRef}
              className={`ai-entire-tab ${activeTab === 'chat' ? 'ai-entire-tab--active' : ''}`}
              onClick={() => setActiveTab('chat')}
            >
              Chat {counts.chat}
            </button>
            <div ref={indicatorRef} className="ai-entire-tabs__indicator" />
          </div>

          {/* 정보 통계 어제데이터와 비교해서 ai-entire-info__change-- 클래스 rise, decrease 구분*/}
          <div className="ai-entire-info">
            {statsData.map((stat, index) => (
              <div key={index} className="ai-entire-info__item">
                <span className="ai-entire-info__label">{stat.label}</span>
                <span className="ai-entire-info__value">
                  <span>
                    {stat.value}<span className="unit">{stat.unit}</span>
                  </span>
                  {stat.subInfo && <span className="sub-info">{stat.subInfo}</span>}
                </span>
                <span className={`ai-entire-info__change ai-entire-info__change--${stat.trend}`}>
                  {stat.changeText}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 하단 세션 영역 */}
        <div className={`ai-entire-bottom ${selectedSession ? 'open' : ''}`}>
          <div className="ai-entire-content">
            <div className="ai-entire-filter">
              <div className="ai-filter-tabs">
                <button
                  className={`ai-filter-tab ${filterStatus === 'all' ? 'ai-filter-tab--active' : ''}`}
                  onClick={() => setFilterStatus('all')}
                >
                  상담 전체<span className="count">{counts.allStatus}</span>
                </button>
                <button
                  className={`ai-filter-tab ${filterStatus === 'normal' ? 'ai-filter-tab--active' : ''}`}
                  onClick={() => setFilterStatus('normal')}
                >
                  정상<span className="count">{counts.normal}</span>
                </button>
                <button
                  className={`ai-filter-tab ${filterStatus === 'warning' ? 'ai-filter-tab--active' : ''}`}
                  onClick={() => setFilterStatus('warning')}
                >
                  주의<span className="count">{counts.warning}</span>
                </button>
                <button
                  className={`ai-filter-tab ${filterStatus === 'critical' ? 'ai-filter-tab--active' : ''}`}
                  onClick={() => setFilterStatus('critical')}
                >
                  개입필요<span className="count">{counts.critical}</span>
                </button>
              </div>
              <div className="ai-filter-view">
                <button
                  className={`ai-view-toggle ${isSimpleView ? 'ai-view-toggle--active' : ''}`}
                  onClick={() => setIsSimpleView(!isSimpleView)}
                >
                  간략하게 보기
                </button>
              </div>
            </div>

            <div className="ai-session-wrapper">
              <div className="ai-session-grid">
                {filteredSessions.map((session) => (
                  <div
                    key={session.id}
                    ref={(el) => {
                      sessionCardRefs.current[session.id] = el;
                    }}
                  >
                    <SessionCard
                      session={session}
                      isActive={selectedSession?.id === session.id}
                      onClick={() => handleSessionClick(session)}
                      hideProgress={isSimpleView}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 세션 디테일 패널/ 카드 열렸을때 나오는 화면 */}
          <SessionDetail
            session={selectedSession}
            isOpen={selectedSession !== null}
            onClose={() => setSelectedSession(null)}
          />
        </div>
      </div>
      </>
       )}
    </div>
  );
};

export default Monitoring;
