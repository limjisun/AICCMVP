import React from 'react';
import type { BotStatus as BotStatusType } from '../../types';

interface BotStatusProps {
  name: string;
  status: BotStatusType;
}

const statusText: Record<BotStatusType, string> = {
  normal: '정상',
  warning: '지연',
  error: '오류',
  pending: '대기',
};

const BotStatus: React.FC<BotStatusProps> = ({ name, status }) => {
  return (
    <div className="ai-bot-info__titlebox">
      <div className="ai-bot-info__title">{name}</div>
      <div className={`ai-bot-info__state ai-bot-info__state--${status}`}> {/*상태에 따라 클래스 바껴서 색상 바뀜*/}
        {statusText[status]}
      </div>
    </div>
  );
};

export default BotStatus;
