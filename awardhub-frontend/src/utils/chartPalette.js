import { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';

/**
 * Chart palette resolved from the active theme's CSS custom properties.
 *
 * Recharts writes colours into SVG presentation attributes (fill, stroke,
 * stopColor), where CSS `var()` support is inconsistent. This hook reads the
 * concrete values from :root and re-reads them whenever the theme toggles.
 */
const SERIES_VARS = [
  '--chart-1',
  '--chart-2',
  '--chart-3',
  '--chart-4',
  '--chart-5',
  '--chart-6',
  '--chart-7',
  '--chart-8',
];

// Light-theme fallbacks (used during SSR/tests or before styles load)
const FALLBACK = {
  series: ['#1B2A4A', '#C9A24A', '#3E7C83', '#8C3B3B', '#6B8F71', '#A8693A', '#6C7A96', '#6E4C6E'],
  grid: '#E4DDCD',
  axis: '#5F6375',
  axisStrong: '#454A5E',
  primary: '#1B2A4A',
  gold: '#C9A24A',
  success: '#2F7D4F',
  error: '#B23A3A',
  info: '#2D5F8B',
  special: '#6E4C6E',
};

function readPalette() {
  if (typeof window === 'undefined') return FALLBACK;
  const styles = getComputedStyle(document.documentElement);
  const read = (name, fallback) => styles.getPropertyValue(name).trim() || fallback;

  return {
    series: SERIES_VARS.map((v, i) => read(v, FALLBACK.series[i])),
    grid: read('--chart-grid', FALLBACK.grid),
    axis: read('--text-muted', FALLBACK.axis),
    axisStrong: read('--text-secondary', FALLBACK.axisStrong),
    primary: read('--chart-1', FALLBACK.primary),
    gold: read('--accent-gold', FALLBACK.gold),
    success: read('--status-success', FALLBACK.success),
    error: read('--status-error', FALLBACK.error),
    info: read('--status-info', FALLBACK.info),
    special: read('--status-special', FALLBACK.special),
  };
}

export function useChartPalette() {
  const { theme } = useTheme();
  const [palette, setPalette] = useState(readPalette);

  useEffect(() => {
    // ThemeProvider sets data-theme in its own effect; defer one frame so the
    // new custom-property values are applied before we read them.
    const id = requestAnimationFrame(() => setPalette(readPalette()));
    return () => cancelAnimationFrame(id);
  }, [theme]);

  return palette;
}

/** Shared tooltip styling for Recharts, driven by theme tokens. */
export const chartTooltipStyle = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border-color)',
  borderRadius: 'var(--radius-md)',
  color: 'var(--text-primary)',
  boxShadow: 'var(--shadow-md)',
};

export default useChartPalette;
