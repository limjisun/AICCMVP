import React, { useState, useRef, useEffect } from 'react';
import BotInfoPanel from '../components/monitoring/BotInfoPanel';
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

  const tabsRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const allTabRef = useRef<HTMLButtonElement>(null);
  const callTabRef = useRef<HTMLButtonElement>(null);
  const chatTabRef = useRef<HTMLButtonElement>(null);

  // 컴포넌트 마운트시 세션 데이터 로드
  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

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

    updateIndicator();
  }, [activeTab]);

  return (
    <div className="page-monitor">
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

          {/* 정보 통계 */}
          <div className="ai-entire-info">
            <div className="ai-entire-info__item">
              <span className="ai-entire-info__label">총 세션수</span>
              <span className="ai-entire-info__value">
                <span>
                  48<span className="unit">건</span>
                </span>
                <span className="sub-info">동시세션 37</span>
              </span>
              <span className="ai-entire-info__change ai-entire-info__change--rise">
                어제보다 2건 증가 +12 | +10%
              </span>
            </div>
            <div className="ai-entire-info__item">
              <span className="ai-entire-info__label">평균 응답 속도</span>
              <span className="ai-entire-info__value">
                <span>
                  1.2<span className="unit">초</span>
                </span>
              </span>
              <span className="ai-entire-info__change ai-entire-info__change--decrease">
                어제보다 0.1초 빠름
              </span>
            </div>
            <div className="ai-entire-info__item">
              <span className="ai-entire-info__label">인텐트 인식 성공률</span>
              <span className="ai-entire-info__value">
                <span>
                  88<span className="unit">%</span>
                </span>
              </span>
              <span className="ai-entire-info__change ai-entire-info__change--rise">
                어제보다 10% 증가
              </span>
            </div>
            <div className="ai-entire-info__item">
              <span className="ai-entire-info__label">상담 성공</span>
              <span className="ai-entire-info__value">
                <span>
                  55<span className="unit">건</span>
                </span>
                <span className="sub-info">15%</span>
              </span>
              <span className="ai-entire-info__change ai-entire-info__change--rise">
                어제보다 18건 증가 | +10%
              </span>
            </div>
            <div className="ai-entire-info__item">
              <span className="ai-entire-info__label">상담사 전환</span>
              <span className="ai-entire-info__value">
                <span>
                  5<span className="unit">건</span>
                </span>
                <span className="sub-info">15%</span>
              </span>
              <span className="ai-entire-info__change ai-entire-info__change--decrease">
                어제보다 2건 감소 | -10%
              </span>
            </div>
            <div className="ai-entire-info__item">
              <span className="ai-entire-info__label">고객 이탈</span>
              <span className="ai-entire-info__value">
                <span>
                  15<span className="unit">건</span>
                </span>
                <span className="sub-info">15%</span>
              </span>
              <span className="ai-entire-info__change ai-entire-info__change--decrease">
                어제보다 2건 감소 | -10%
              </span>
            </div>
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
                <button className="ai-view-toggle ai-view-toggle--active">
                  간략하게 보기
                </button>
              </div>
            </div>

            <div className="ai-session-wrapper">
              <div className="ai-session-grid">
                {filteredSessions.map((session) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    isActive={selectedSession?.id === session.id}
                    onClick={() => setSelectedSession(session)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* 세션 디테일 패널 - ai-entire-bottom 바로 밑 */}
          <SessionDetail
            session={selectedSession}
            isOpen={selectedSession !== null}
            onClose={() => setSelectedSession(null)}
          />
        </div>
      </div>
    </div>
  );
};

export default Monitoring;
