import React from 'react';
import { Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';

// Shared Recharts styling. All colours are read from the MUI theme so the
// charts follow light and dark mode.

export const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);

export const formatAxisCurrency = (value) => {
  const abs = Math.abs(value);
  if (abs >= 1e6) return `$${(value / 1e6).toFixed(abs >= 1e7 ? 0 : 1)}M`;
  return `$${(value / 1000).toFixed(0)}K`;
};

const formatYear = (year) => (Number.isInteger(year) ? `${year}` : year.toFixed(1));

// Integer year ticks at a sensible step, always including year 0 and the
// exit year. A regular tick that would crowd the exit tick is dropped.
export const buildYearTicks = (exitYear) => {
  if (!(exitYear > 0)) return [0];
  const step = exitYear <= 10 ? 1 : exitYear <= 16 ? 2 : 5;
  const ticks = [];
  for (let y = 0; y < exitYear; y += step) {
    if (exitYear - y >= step * 0.6 || y === 0) ticks.push(y);
  }
  ticks.push(exitYear);
  return ticks;
};

export const useChartStyles = () => {
  const theme = useTheme();
  const { palette, typography } = theme;
  const tick = { fill: palette.chart.axis, fontSize: 13, fontFamily: typography.fontFamily };
  return {
    palette: palette.chart,
    grid: { stroke: palette.chart.grid, strokeDasharray: '0', vertical: false },
    xAxis: { tick, tickLine: false, axisLine: { stroke: palette.chart.grid }, tickMargin: 8 },
    yAxis: { tick, tickLine: false, axisLine: false, width: 56, tickMargin: 4 },
    legend: {
      iconType: 'square',
      iconSize: 10,
      wrapperStyle: { fontSize: 14, fontFamily: typography.fontFamily, paddingTop: 12 },
      formatter: (value) => <span style={{ color: palette.text.secondary }}>{value}</span>,
    },
    cursor: { stroke: palette.chart.marker, strokeWidth: 1 },
    barCursor: { fill: palette.brand.surfaceMuted },
  };
};

// Explicit legend entries so swatches use the series fill (Recharts would
// otherwise take an area's stroke, which here is the surface-coloured gap).
export const legendPayload = (items) =>
  items.map((it) => ({ value: it.name, id: it.key, type: it.type || 'square', color: it.color }));

// Year axis props shared by the time-series charts.
export const yearAxisProps = (exitYear) => ({
  dataKey: 'year',
  type: 'number',
  domain: [0, exitYear],
  allowDecimals: false,
  ticks: buildYearTicks(exitYear),
  interval: 0,
  tickFormatter: formatYear,
});

// Category tick that wraps a long name onto two short lines instead of
// truncating or overlapping its neighbours on narrow charts.
const wrapLabel = (text, max = 12) => {
  const words = String(text).split(' ');
  const lines = [''];
  words.forEach((w) => {
    const cur = lines[lines.length - 1];
    if (!cur) lines[lines.length - 1] = w;
    else if (`${cur} ${w}`.length <= max) lines[lines.length - 1] = `${cur} ${w}`;
    else lines.push(w);
  });
  if (lines.length > 2) lines.splice(1, lines.length - 1, `${lines.slice(1).join(' ').slice(0, max - 1)}…`);
  return lines.map((l) => (l.length > max + 2 ? `${l.slice(0, max)}…` : l));
};

export function WrappedCategoryTick({ x, y, payload }) {
  const theme = useTheme();
  const lines = wrapLabel(payload?.value);
  return (
    <text x={x} y={y + 8} textAnchor="middle" fill={theme.palette.chart.axis} fontSize={13} fontFamily={theme.typography.fontFamily}>
      <title>{payload?.value}</title>
      {lines.map((line, i) => (
        <tspan key={i} x={x} dy={i === 0 ? '0.71em' : '1.25em'}>{line}</tspan>
      ))}
    </text>
  );
}

// "Exit · Year N" marker label, drawn as a small tag to the left of the line
// so it never runs off the plot on the right edge.
export function ExitMarkerLabel({ viewBox, value }) {
  const theme = useTheme();
  if (!viewBox) return null;
  const text = value;
  const width = text.length * 7 + 16;
  const height = 24;
  const x = viewBox.x - width - 6;
  const y = viewBox.y - height - 6; // sits in the top margin, above the plot
  return (
    <g aria-hidden="true">
      <rect x={x} y={y} width={width} height={height} rx={2} fill={theme.palette.brand.surfaceElevated} stroke={theme.palette.chart.marker} strokeWidth={1} />
      <text x={x + width / 2} y={y + height / 2} dy="0.35em" textAnchor="middle" fill={theme.palette.text.primary} fontSize={12} fontWeight={600} fontFamily={theme.typography.fontFamily}>
        {text}
      </text>
    </g>
  );
}

// Tooltip card used by every chart. `labelFormatter` turns the x value into
// the heading (defaults to "Year N"). `colors` is an optional map of
// dataKey → colour that takes priority over the Recharts entry colour —
// needed for stacked Area series where Recharts reports the stroke (surface
// colour) rather than the fill.
export function ChartTooltip({ active, payload, label, labelFormatter, valueFormatter = formatCurrency, colors }) {
  if (!active || !payload || !payload.length) return null;
  const heading = labelFormatter ? labelFormatter(label, payload) : `Year ${formatYear(Number(label))}`;
  return (
    <Box
      sx={{
        bgcolor: 'brand.surfaceElevated',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: '4px',
        boxShadow: 8,
        px: 1.75,
        py: 1.25,
        minWidth: 200,
      }}
    >
      <Typography variant="caption" component="p" color="text.secondary" sx={{ fontWeight: 600, mb: 0.75, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        {heading}
      </Typography>
      {payload.map((entry) => {
        const swatchColor = (colors && colors[entry.dataKey]) || entry.payload?.color || entry.color;
        return (
          <Box key={entry.dataKey || entry.name} sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.25 }}>
            <Box component="span" sx={{ width: 10, height: entry.type === 'line' ? 2 : 10, borderRadius: '2px', bgcolor: swatchColor, flexShrink: 0 }} />
            <Typography variant="body2" color="text.secondary" sx={{ flex: 1, mr: 2 }}>
              {entry.name}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
              {valueFormatter(entry.value)}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
}
