import React from 'react';
import type { Session } from '../../types';

interface SessionCardProps {
  session: Session;
  isActive?: boolean;
  onClick: () => void;
}

const statusText: Record<Session['status'], string> = {
  normal: '정상',
  warning: '주의',
  critical: '개입필요',
};

const SessionCard: React.FC<SessionCardProps> = ({ session, isActive, onClick }) => {
  // 프로그레스 바 레벨 계산 (value 0-100 → level 1-5)
  const getProgressLevel = (value: number): number => {
    if (value <= 20) return 1;
    if (value <= 40) return 2;
    if (value <= 60) return 3;
    if (value <= 80) return 4;
    return 5;
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // 부모 div 클릭 이벤트 전파 방지
    onClick();
  };

  return (
    <div
      className={`session-card ${isActive ? 'active' : ''} ${
        session.status === 'critical' ? 'session-card--critical' : ''
      }`}
    >
      <div className="session-card__session-brief">
        <div className="session-card__state">
          <div
            className={`session-card__source session-card__source--${session.source}`}
          />
          <div>
             <div className="session-card__time">{session.time}</div>
             <div className={`session-card__status session-card__status--${session.status}`}>
              {statusText[session.status]}
            </div>
          </div>
        </div>
        <button className="session-card__btn" onClick={handleButtonClick} />
      </div>

      {/* 프로그레스 바 섹션 */}
      {session.progress && session.progress.length > 0 && (
        <div className="session-card__progress">
          {session.progress.map((item, index) => (
            <div key={index} className="progress-bar">
              <span className="progress-bar__label">{item.name}</span>
              <div className="progress-bar__track">
                <div
                  className={`progress-bar__fill progress-bar__fill--level-${getProgressLevel(item.value)}`}
                  style={{ width: `${item.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="session-card__btnwrap">
        <button className="session-card__action">전환</button>
      </div>
    </div>
  );
};

export default SessionCard;
