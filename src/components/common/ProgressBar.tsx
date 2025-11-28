import React from 'react';
import './ProgressBar.css';

interface ProgressItem {
  name: string;
  value: number;
}

interface ProgressBarProps {
  items: ProgressItem[];
}

/**
 * 재사용 가능한 프로그레스 바 컴포넌트
 * @param items - 프로그레스 아이템 배열
 */
const ProgressBar: React.FC<ProgressBarProps> = ({ items }) => {
  // 프로그레스 바 레벨 계산 (value 0-100 → level 1-5)
  const getProgressLevel = (value: number): number => {
    if (value <= 20) return 1;
    if (value <= 40) return 2;
    if (value <= 60) return 3;
    if (value <= 80) return 4;
    return 5;
  };

  return (
    <div className="session-card__progress">
      {items.map((item, index) => (
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
  );
};

export default ProgressBar;
