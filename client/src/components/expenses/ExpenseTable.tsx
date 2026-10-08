import { useNavigate } from 'react-router';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel, Typography } from '@mui/material';
import CategoryChip from './CategoryChip';
import { formatCurrency, formatDate, PAYMENT_METHOD_LABELS } from '../../utils/format';
import type { Expense, SortField, SortOrder } from '../../types';

interface ExpenseTableProps {
  expenses: Expense[];
  sortBy: SortField;
  order: SortOrder;
  onSort: (field: SortField) => void;
}

/** Desktop view of the expense list. Rows open the expense details page. */
export default function ExpenseTable({ expenses, sortBy, order, onSort }: ExpenseTableProps) {
  const navigate = useNavigate();

  const sortableHeader = (field: SortField, label: string, align: 'left' | 'right' = 'left') => (
    <TableCell align={align} sortDirection={sortBy === field ? order : false}>
      <TableSortLabel active={sortBy === field} direction={sortBy === field ? order : 'desc'} onClick={() => onSort(field)}>
        {label}
      </TableSortLabel>
    </TableCell>
  );

  return (
    <TableContainer>
      <Table size="medium" aria-label="Expenses">
        <TableHead>
          <TableRow>
            {sortableHeader('date', 'Date')}
            <TableCell>Title</TableCell>
            <TableCell>Category</TableCell>
            <TableCell>Payment</TableCell>
            {sortableHeader('amount', 'Amount', 'right')}
          </TableRow>
        </TableHead>
        <TableBody>
          {expenses.map((expense) => (
            <TableRow
              key={expense._id}
              hover
              onClick={() => navigate(`/expenses/${expense._id}`)}
              onKeyDown={(e) => e.key === 'Enter' && navigate(`/expenses/${expense._id}`)}
              tabIndex={0}
              sx={{ cursor: 'pointer' }}
            >
              <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatDate(expense.date)}</TableCell>
              <TableCell>
                <Typography sx={{ fontWeight: 500 }}>{expense.title}</Typography>
                {expense.notes && (
                  <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 280 }}>
                    {expense.notes}
                  </Typography>
                )}
              </TableCell>
              <TableCell>
                <CategoryChip category={expense.category} />
              </TableCell>
              <TableCell>{PAYMENT_METHOD_LABELS[expense.paymentMethod]}</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
                {formatCurrency(expense.amount)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
