import React from 'react';
import Tooltip from '../common/Tooltip';
import type { Metric } from '../../types';

interface MetricItemProps {
  metric: Metric;
}

const MetricItem: React.FC<MetricItemProps> = ({ metric }) => {
  return (
    <div className="ai-bot-info__each">
      <span className="ai-bot-info__label">
        {metric.label}
        {metric.tooltip && <Tooltip text={metric.tooltip} />}
      </span>
      <span className="ai-bot-info__value">
        {metric.value}
        {metric.unit && <span className="unit">{metric.unit}</span>}
      </span>
    </div>
  );
};

export default MetricItem;
