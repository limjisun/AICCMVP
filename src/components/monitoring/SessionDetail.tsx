import React from 'react';
import type { Session } from '../../types';

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
                  <div className="detail-delay-tag">지연</div>
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
                실시간대화
              </div>
            </div>
            <div className="detail-panael-right">
              <div className="detail-info-section">
                  <h3 className="detail-section-title">기본 정보</h3>
                  <div className="detail-info-item">
                    <span className="detail-info-label">고객명</span>
                    <span className="detail-info-value">홍길동</span>
                  </div>
                  <div className="detail-info-item">
                    <span className="detail-info-label">고객 ID</span>
                    <span className="detail-info-value">FDW5000024</span>
                  </div>
                  <div className="detail-info-item">
                    <span className="detail-info-label">연락처</span>
                    <span className="detail-info-value">010-1234-5678</span>
                  </div>
                  <div className="detail-info-item">
                    <span className="detail-info-label">이메일</span>
                    <span className="detail-info-value">sdfk3223@naver.com</span>
                  </div>
              </div>
               <div className="detail-info-section">
                  <h3 className="detail-section-title">실시간 요약</h3>
                   <div className="">
                        <div className="">
                          <span className="">자동이체 변경</span>
                        </div>
                        <div className="">자동이체 변경 요청에 대한 인증 절차 안내 중(고객 인증 대기)</div>
                   </div>
              </div>
               <div className="detail-info-section">
                  <h3 className="detail-section-title">감정흐름</h3>
                   <div className="">
                      그래프
                   </div>
                   {/* 성능 지표 */}
                    {session.progress && (
                        <div className="detail-progress-list">
                          {session.progress.map((item, index) => (
                            <div key={index} className="detail-progress-item">
                              <div className="detail-progress-header">
                                <span className="detail-progress-name">{item.name}</span>
                                <span className="detail-progress-percent">{item.value}%</span>
                              </div>
                              <div className="detail-progress-bar">
                                <div
                                  className="detail-progress-fill"
                                  style={{ width: `${item.value}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>     
                    )}
                   <div></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionDetail;
