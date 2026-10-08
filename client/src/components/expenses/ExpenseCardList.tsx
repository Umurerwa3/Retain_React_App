import { Link as RouterLink } from 'react-router';
import { Box, List, ListItemButton, Stack, Typography } from '@mui/material';
import CategoryChip from './CategoryChip';
import { formatCurrency, formatDate, PAYMENT_METHOD_LABELS } from '../../utils/format';
import type { Expense } from '../../types';

/** Compact mobile view of the expense list. */
export default function ExpenseCardList({ expenses }: { expenses: Expense[] }) {
  return (
    <List disablePadding>
      {expenses.map((expense) => (
        <ListItemButton
          key={expense._id}
          component={RouterLink}
          to={`/expenses/${expense._id}`}
          divider
          sx={{ py: 1.5, alignItems: 'flex-start' }}
        >
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography sx={{ fontWeight: 600 }} noWrap>
              {expense.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {formatDate(expense.date)} · {PAYMENT_METHOD_LABELS[expense.paymentMethod]}
            </Typography>
            <Stack direction="row" sx={{ mt: 0.75 }}>
              <CategoryChip category={expense.category} />
            </Stack>
          </Box>
          <Typography sx={{ fontWeight: 700, ml: 2, whiteSpace: 'nowrap' }}>{formatCurrency(expense.amount)}</Typography>
        </ListItemButton>
      ))}
    </List>
  );
}
