import { List, ListItem, ListItemText, Typography, Box } from '@mui/material';
import { formatCurrency } from '../../utils/format';
import type { CategorySpending } from '../../types';

/** Ranked list of categories by number of expenses. */
export default function CategoryUsageList({ data }: { data: CategorySpending[] }) {
  return (
    <List dense disablePadding>
      {data.map((c, index) => (
        <ListItem key={c.categoryId} disableGutters divider={index < data.length - 1}>
          <Typography color="text.secondary" sx={{ width: 24, fontWeight: 600 }}>
            {index + 1}
          </Typography>
          <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: c.color, mr: 1.5, flexShrink: 0 }} />
          <ListItemText primary={c.name} secondary={formatCurrency(c.total)} />
          <Typography sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
            {c.count} {c.count === 1 ? 'expense' : 'expenses'}
          </Typography>
        </ListItem>
      ))}
    </List>
  );
}
