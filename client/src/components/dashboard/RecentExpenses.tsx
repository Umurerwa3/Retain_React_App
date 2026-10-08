import { Link as RouterLink } from 'react-router';
import { Avatar, List, ListItemAvatar, ListItemButton, ListItemText, Typography } from '@mui/material';
import ReceiptRoundedIcon from '@mui/icons-material/ReceiptRounded';
import { formatCurrency, formatDate } from '../../utils/format';
import type { Expense } from '../../types';

export default function RecentExpenses({ expenses }: { expenses: Expense[] }) {
  return (
    <List disablePadding>
      {expenses.map((e) => (
        <ListItemButton key={e._id} component={RouterLink} to={`/expenses/${e._id}`} sx={{ borderRadius: 1, px: 1 }}>
          <ListItemAvatar>
            <Avatar sx={{ bgcolor: `${e.category?.color ?? '#9e9e9e'}22`, color: e.category?.color ?? '#9e9e9e' }}>
              <ReceiptRoundedIcon fontSize="small" />
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={e.title}
            secondary={`${e.category?.name ?? 'Uncategorized'} · ${formatDate(e.date)}`}
            slotProps={{ primary: { noWrap: true }, secondary: { noWrap: true } }}
            sx={{ minWidth: 0 }}
          />
          <Typography sx={{ fontWeight: 600, ml: 1, whiteSpace: 'nowrap' }}>{formatCurrency(e.amount)}</Typography>
        </ListItemButton>
      ))}
    </List>
  );
}
