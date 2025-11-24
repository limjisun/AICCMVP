import React from 'react';
import MetricItem from './MetricItem';
import type { Metric } from '../../types';

interface MetricSectionProps {
  title: string;
  metrics: Metric[];
  columns?: 2 | 3 | 'custom';
}

const MetricSection: React.FC<MetricSectionProps> = ({ title, metrics, columns = 2 }) => {
  const getWrapperClass = () => {
    const baseClass = 'ai-bot-info__boxwrap';
    if (columns === 3) return `${baseClass} ai-bot-info__boxwrap--col3`;
    if (columns === 'custom') return `${baseClass} ai-bot-info__boxwrap--col2-custom`;
    return baseClass;
  };

  return (
    <div className="ai-bot-info__metric">
      <h3>{title}</h3>
      <div className={getWrapperClass()}>
        {metrics.map((metric, index) => (
          <MetricItem key={index} metric={metric} />
        ))}
      </div>
    </div>
  );
};

export default MetricSection;
