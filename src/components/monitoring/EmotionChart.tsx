import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from 'recharts';
import type { EmotionPoint } from '../../types';

interface EmotionChartProps {
  data: EmotionPoint[];
}

const EmotionChart: React.FC<EmotionChartProps> = ({ data }) => {
  // 감정 레이블 매핑
  const emotionLabels: Record<number, string> = {
    4: '매우긍정',
    3: '긍정',
    2: '중립',
    1: '부정',
    0: '매우부정',
  };

  // Y축 틱 설정
  const yAxisTicks = [4, 3, 2, 1, 0];

  // Y축 레이블 포맷
  const formatYAxis = (value: number) => emotionLabels[value] || '';

  return (
    <div className="emotion-chart">

      <ResponsiveContainer width="100%" height={110}>
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            {/* 긍정 그라데이션 (하늘색) */}
            <linearGradient id="colorPositive" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4FC3CF" stopOpacity={0.8} />
              <stop offset="100%" stopColor="#4FC3CF" stopOpacity={0.1} />
            </linearGradient>
            {/* 부정 그라데이션 (핑크색) */}
            <linearGradient id="colorNegative" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FF8480" stopOpacity={0.1} />
              <stop offset="100%" stopColor="#FF8480" stopOpacity={0.8} />
            </linearGradient>
          </defs>

          <XAxis
            dataKey="index"
            tick={false}
            axisLine={{ stroke: '#e0e0e0' }}
            tickLine={false}
          />

          <YAxis
            ticks={yAxisTicks}
            tickFormatter={formatYAxis}
            tick={{ fontSize: 11, fill: '#555' }}
            axisLine={false}
            tickLine={false}
            domain={[0, 4]}
          />

          {/* 부정 영역 */}
          <Area
            type="monotone"
            dataKey="value"
            stroke="#6F8186"
            strokeWidth={1}
            fill="url(#colorNegative)"
            fillOpacity={1}
            isAnimationActive={true}
            dot={{ fill: '#fff', stroke: '#6F8186', strokeWidth: 1.5, r: 2.5 }}
            activeDot={false}
          />

          {/* 긍정 영역 */}
          <Area
            type="monotone"
            dataKey="value"
            stroke="#6F8186"
            strokeWidth={1}
            fill="url(#colorPositive)"
            fillOpacity={1}
            isAnimationActive={true}
            dot={{ fill: '#fff', stroke: '#6F8186', strokeWidth: 1.5, r: 2.5 }}
            activeDot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default EmotionChart;
