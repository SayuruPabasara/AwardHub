import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

import { useChartPalette, chartTooltipStyle } from '../../utils/chartPalette';

export default function VoteDistributionChart({ data = [] }) {
  const palette = useChartPalette();

  if (!data || data.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
        No voting data to display yet
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: 320 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 10, bottom: 40 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={palette.grid} vertical={false} />
          <XAxis
            dataKey="name"
            stroke={palette.axis}
            fontSize={12}
            tickLine={false}
            interval={0}
            angle={-20}
            textAnchor="end"
          />
          <YAxis stroke={palette.axis} fontSize={12} tickLine={false} allowDecimals={false} />
          <Tooltip
            contentStyle={chartTooltipStyle}
            cursor={{ fill: 'var(--accent-soft)' }}
          />
          <Bar dataKey="votes" radius={[6, 6, 0, 0]}>
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={palette.series[index % palette.series.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
