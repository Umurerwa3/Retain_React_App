import { Box } from '@mui/material';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { formatCurrency } from '../../utils/format';
import type { CategorySpending } from '../../types';

export default function CategoryDonut({ data }: { data: CategorySpending[] }) {
  return (
    <Box sx={{ width: '100%', height: 220 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie data={data} dataKey="total" nameKey="name" innerRadius="55%" outerRadius="85%" paddingAngle={2} stroke="none">
            {data.map((c) => (
              <Cell key={c.categoryId} fill={c.color} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => formatCurrency(Number(value))} />
        </PieChart>
      </ResponsiveContainer>
    </Box>
  );
}
