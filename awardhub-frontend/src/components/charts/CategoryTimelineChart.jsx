import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useChartPalette, chartTooltipStyle } from '../../utils/chartPalette';

export default function CategoryTimelineChart({ data = [] }) {
  const palette = useChartPalette();
  const votesColor = palette.series[0];
  const nominationsColor = palette.series[1];

  if (!data || data.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
        No timeline activity data
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: 320 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
        >
          <defs>
            <linearGradient id="colorVotes" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={votesColor} stopOpacity={0.35} />
              <stop offset="95%" stopColor={votesColor} stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="colorNominations" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={nominationsColor} stopOpacity={0.35} />
              <stop offset="95%" stopColor={nominationsColor} stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={palette.grid} vertical={false} />
          <XAxis dataKey="date" stroke={palette.axis} fontSize={12} tickLine={false} />
          <YAxis stroke={palette.axis} fontSize={12} tickLine={false} allowDecimals={false} />
          <Tooltip contentStyle={chartTooltipStyle} />
          <Area
            type="monotone"
            dataKey="votes"
            stroke={votesColor}
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorVotes)"
            name="Votes Cast"
          />
          <Area
            type="monotone"
            dataKey="nominations"
            stroke={nominationsColor}
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorNominations)"
            name="Nominations"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
