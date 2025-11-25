import React from 'react';
import type { Session } from '../../types';
import ProgressBar from '../common/ProgressBar';

interface SessionCardProps {
  session: Session;
  isActive?: boolean;
  onClick: () => void;
  hideProgress?: boolean; // 간략하게 보기 모드
}

const statusText: Record<Session['status'], string> = {
  normal: '정상',
  warning: '주의',
  critical: '개입필요',
};

const SessionCard: React.FC<SessionCardProps> = ({ session, isActive, onClick, hideProgress = false }) => {
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

      {/* 프로그레스 바 섹션 - hideProgress가 false일 때만 표시 */}
      {!hideProgress && session.progress && session.progress.length > 0 && (
        <ProgressBar items={session.progress} />
      )}

      <div className="session-card__btnwrap">
        <button className="session-card__action">전환</button>
      </div>
    </div>
  );
};

export default SessionCard;
