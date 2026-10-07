import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { useChartPalette, chartTooltipStyle } from '../../utils/chartPalette';

export default function JudgeScoringChart({ data = [] }) {
  const palette = useChartPalette();

  if (!data || data.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
        No evaluation criteria scores available
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: 320 }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
          <PolarGrid stroke={palette.grid} />
          <PolarAngleAxis
            dataKey="criterion"
            stroke={palette.axisStrong}
            fontSize={12}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            stroke={palette.axis}
            fontSize={10}
          />
          <Tooltip contentStyle={chartTooltipStyle} />
          <Radar
            name="Score"
            dataKey="score"
            stroke={palette.gold}
            fill={palette.gold}
            fillOpacity={0.35}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
