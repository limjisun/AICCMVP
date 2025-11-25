import React, { useMemo } from 'react';
import type { Session, EmotionPoint } from '../../types';
import ProgressBar from '../common/ProgressBar';
import EmotionChart from '../common/EmotionChart';

interface SessionDetailProps {
  session: Session | null;
  isOpen: boolean;
  onClose: () => void;
}

const statusText: Record<Session['status'], string> = {
  normal: '정상',
  warning: '주의',
  critical: '개입필요',
};

const SessionDetail: React.FC<SessionDetailProps> = ({ session, isOpen, onClose }) => {
  // 대화 내역에서 감정 데이터 추출 (사용자 발화만)
  const emotionData = useMemo<EmotionPoint[]>(() => {
    if (!session || !session.conversation) return [];

    return session.conversation
      .filter(msg => msg.type === 'user' && msg.emotion)
      .map((msg, index) => {
        const emotionValues: Record<string, number> = {
          'very_positive': 4,
          'positive': 3,
          'neutral': 2,
          'negative': 1,
          'very_negative': 0,
        };

        return {
          index: index + 1,
          emotion: msg.emotion!,
          value: emotionValues[msg.emotion!] || 2,
          message: msg.message,
          time: msg.time,
        };
      });
  }, [session]);

  if (!session) return null;

  return (
    <div className={`ai-session-detail ${isOpen ? 'detail-open' : ''}`}>
      <div className="session-detail-panel">
        <div className="detail-panel__content">
          {/* 헤더 */}
          <div className="detail-panel__header">
            <div className="detail-panel__title-section">
              <div className={`detail-panel__title-status ${session.status}`}>
                {statusText[session.status]}
              </div>
            </div>
            <button className="detail-panel__close" onClick={onClose}>
              ×
            </button>
          </div>

          {/* 바디 */}
          <div className="detail-panel__body">
            <div className="detail-panel-left">
              <div className="detail-header-bar">
                <div className="detail-header-info">
                  <div
                    className={`detail-source-icon detail-source-icon--${session.source}`}
                  />
                  <div className="detail-time">{session.time}</div>
                  {session.isDelayed && (
                    <div className="detail-delay-tag">지연</div>
                  )}
                </div>
                <button className="detail-transfer-btn">전환</button>
              </div>
              {/* 알림 목록 */}
              {session.alerts && session.alerts.length > 0 && (
                <div className="detail-alerts">
                  {session.alerts.map((alert, index) => (
                    <div key={index} className={`detail-alert detail-alert--${alert.type}`}>
                      <div className="detail-alert-title">{alert.title}:</div>
                      <div className="detail-alert-message">
                        {alert.highlight ? (
                          <>
                            {alert.message.split(alert.highlight)[0]}
                            <span className="detail-alert-highlight">{alert.highlight}</span>
                            {alert.message.split(alert.highlight)[1]}
                          </>
                        ) : (
                          alert.message
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="detail-conversation-area">
                <div className="conversation-list">
                  {session.conversation && session.conversation.length > 0 ? (
                    session.conversation.map((msg, index) => (
                      <div key={index} className={`conversation-item conversation-item--${msg.type}`}>
                        <div className="conversation-bubble">
                          {msg.isTyping ? (
                            <div className="conversation-typing">
                              <span></span>
                              <span></span>
                              <span></span>
                            </div>
                          ) : (
                            <div className="conversation-text">{msg.message}</div>
                          )}
                        </div>
                        <div className="conversation-meta">
                          <span className="conversation-time">{msg.time}</span>
                          {msg.type === 'bot' && msg.responseTime && !msg.isTyping && (
                            <span className="conversation-response-time">{msg.responseTime}</span>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="conversation-empty">대화 내역이 없습니다</div>
                  )}
                </div>
              </div>
            </div>
            <div className="detail-panael-right">
              {/* 기본 정보 */}
              {session.customerInfo && (
                <div className="detail-info-section border-section">
                  <h3 className="detail-section-title">기본 정보</h3>
                  <div className="detail-info-item">
                    <span className="detail-info-label">고객명</span>
                    <span className="detail-info-value">{session.customerInfo.name}</span>
                  </div>
                  <div className="detail-info-item">
                    <span className="detail-info-label">고객 ID</span>
                    <span className="detail-info-value">{session.customerInfo.customerId}</span>
                  </div>
                  <div className="detail-info-item">
                    <span className="detail-info-label">연락처</span>
                    <span className="detail-info-value">{session.customerInfo.phone}</span>
                  </div>
                  <div className="detail-info-item">
                    <span className="detail-info-label">이메일</span>
                    <span className="detail-info-value">{session.customerInfo.email}</span>
                  </div>
                </div>
              )}

              {/* 실시간 요약 */}
              {session.summary && (
                <div className="detail-info-section border-section">
                  <h3 className="detail-section-title">실시간 요약</h3>
                  <div className="summary-item">
                    <div className="summary-item__wrap">
                      {session.summary.tags.map((tag, index) => (
                        <span key={index} className="summary-item__label">{tag}</span>
                      ))}
                    </div>
                    <div className="summary-item__desc">{session.summary.description}</div>
                  </div>
                </div>
              )}
               <div className="detail-info-section">
                  <h3 className="detail-section-title">감정흐름</h3>
                  {emotionData.length > 0 && (
                    <EmotionChart data={emotionData} />
                  )}
                   {/* 성능 지표 */}
                    {session.progress && (
                        <ProgressBar items={session.progress} />
                    )}
              </div>
              {/* 성능 메트릭 */}
              {session.metrics && (
                <div className="detail-info-section">
                  <div className="metrics-grid">
                    {session.metrics.map((metric, index) => (
                      <div key={index} className="metric-card">
                        <div className="metric-card__header">{metric.label}</div>
                        <div className="metric-card__value">
                          <span className="metric-card__number">{metric.value}</span>
                          <span className="metric-card__unit">{metric.unit}</span>
                        </div>
                        <div className={`metric-card__delta metric-card__delta--${metric.trend}`}>
                          {metric.changeText}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionDetail;
