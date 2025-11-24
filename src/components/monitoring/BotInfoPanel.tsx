import React from 'react';
import BotStatus from './BotStatus';
import MetricSection from './MetricSection';
import type { BotStatus as BotStatusType, Metric } from '../../types';

interface BotInfoPanelProps {
  botName: string;
  status: BotStatusType;
}

const operationMetrics: Metric[] = [
  {
    label: '평균 응답 시간',
    value: 0.8,
    unit: '초',
    tooltip: '고객 발화 후, AI 상담사가 응답을 시작하기까지의 평균 시간',
  },
  {
    label: '평균 의도 파악 시간',
    value: 1.2,
    unit: '초',
    tooltip: '고객 발화 후, 인텐트(의도)를 식별하는 데 걸린 평균 시간',
  },
  {
    label: '평균 지식 답변 시간',
    value: 1.2,
    unit: '초',
    tooltip: '고객 발화 후, AI가 지식을 조회한 답변까지 걸린 평균 시간',
  },
  {
    label: '최대 응답 시간',
    value: 1.2,
    unit: '초',
    tooltip: '세션 중 AI가 응답을 시작하기까지 걸린 가장 긴 시간',
  },
  {
    label: '요청수(분당)',
    value: 1.2,
    unit: '초',
    tooltip: '분당 처리된 고객 발화 요청의 평균 건수',
  },
  {
    label: '인텐트 파악율',
    value: 1.2,
    unit: '초',
    tooltip: '전체 고객 발화 중 AI가 인텐트를 정확히 인식한 비율',
  },
  {
    label: '미응답수',
    value: 1.2,
    unit: '초',
    tooltip: '고객 발화에 대해 AI가 응답하지 못한 횟수',
  },
];

const qualityMetrics3Col: Metric[] = [
  {
    label: '응답 성공률',
    value: 0.8,
    unit: '초',
    tooltip: '전체 요청 중 정상적으로 응답을 반환한 비율',
  },
  {
    label: '비정상 응답수',
    value: 1.2,
    unit: '초',
    tooltip: '오류·중단 등으로 비정상 응답이 발생한 횟수',
  },
  {
    label: '평균 대화 길이',
    value: 1.2,
    unit: '초',
    tooltip: '한 세션 내 AI와 고객 간 주고받은 발화 쌍의 평균 횟수',
  },
];

const qualityMetrics2Col: Metric[] = [
  {
    label: '응답 지연 경고 발생',
    value: 0.8,
    unit: '초',
    tooltip: '설정된 기준 시간 이상 응답이 지연된 횟수',
  },
  {
    label: '인텐트 파악 급하락(1시간 이내)',
    value: 1.2,
    unit: '초',
    tooltip: '최근 1시간 동안 AI가 인텐트 파악이 급하락 한 비율',
  },
];

const BotInfoPanel: React.FC<BotInfoPanelProps> = ({ botName, status }) => {
  return (
    <div className="ai-bot-wrap">
      <h3 className="page-title">AI 모니터링</h3>
      <div className="ai-bot-info">
        <BotStatus name={botName} status={status} />
        <div className="ai-bot-info__box">
          <MetricSection title="동작지표" metrics={operationMetrics} columns={2} />
          <MetricSection title="대화품질" metrics={qualityMetrics3Col} columns={3} />
          <MetricSection title="이상 감지/알림" metrics={qualityMetrics2Col} columns="custom" />
        </div>
      </div>
    </div>
  );
};

export default BotInfoPanel;
