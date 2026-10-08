import { Box, useTheme } from '@mui/material';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatCurrency } from '../../utils/format';
import type { CategorySpending } from '../../types';

/** Horizontal bars of total spending per category, across all users. */
export default function CategorySpendingChart({ data }: { data: CategorySpending[] }) {
  const theme = useTheme();

  return (
    <Box sx={{ width: '100%', height: Math.max(220, data.length * 36) }}>
      <ResponsiveContainer>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={theme.palette.divider} />
          <XAxis type="number" tickLine={false} axisLine={false} fontSize={12} tickFormatter={(v: number) => formatCurrency(v)} />
          <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} width={110} fontSize={12} />
          <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Total']} cursor={{ fill: theme.palette.action.hover }} />
          <Bar dataKey="total" radius={[0, 4, 4, 0]} maxBarSize={22}>
            {data.map((c) => (
              <Cell key={c.categoryId} fill={c.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
}
