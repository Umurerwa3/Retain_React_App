import { useMemo } from 'react';
import { Box, useTheme } from '@mui/material';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatCurrency, formatDate, monthBounds } from '../../utils/format';
import type { DailySpending } from '../../types';

interface DailySpendingChartProps {
  /** YYYY-MM */
  month: string;
  data: DailySpending[];
}

/** Bar per day of the month, with days that have no spending shown as zero. */
export default function DailySpendingChart({ month, data }: DailySpendingChartProps) {
  const theme = useTheme();

  const series = useMemo(() => {
    const totals = new Map(data.map((d) => [d.date, d.total]));
    const days = Number(monthBounds(month).endDate.slice(-2));
    return Array.from({ length: days }, (_, i) => {
      const date = `${month}-${String(i + 1).padStart(2, '0')}`;
      return { date, day: i + 1, total: totals.get(date) ?? 0 };
    });
  }, [month, data]);

  return (
    <Box sx={{ width: '100%', height: 240 }}>
      <ResponsiveContainer>
        <BarChart data={series} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
          <XAxis dataKey="day" tickLine={false} axisLine={false} interval="preserveStartEnd" fontSize={12} />
          <YAxis tickLine={false} axisLine={false} width={56} fontSize={12} tickFormatter={(v: number) => formatCurrency(v)} />
          <Tooltip
            formatter={(value) => [formatCurrency(Number(value)), 'Spent']}
            labelFormatter={(_, payload) => (payload?.[0] ? formatDate(`${payload[0].payload.date}T00:00:00Z`) : '')}
            cursor={{ fill: theme.palette.action.hover }}
          />
          <Bar dataKey="total" fill={theme.palette.primary.main} radius={[4, 4, 0, 0]} maxBarSize={24} />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
}
