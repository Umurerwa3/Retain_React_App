import { Link as RouterLink } from 'react-router';
import { Alert, Box, Button, Card, LinearProgress, Typography, useMediaQuery, useTheme } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import PageHeader from '../components/common/PageHeader';
import EmptyState from '../components/common/EmptyState';
import ExpenseTable from '../components/expenses/ExpenseTable';
import ExpenseCardList from '../components/expenses/ExpenseCardList';
import ExpensePagination from '../components/expenses/ExpensePagination';
import ExpenseFilters from '../components/expenses/ExpenseFilters';
import { useCategories } from '../hooks/useCategories';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { selectExpenseQueryParams, selectFilters, setLimit, setPage, setSort } from '../store/slices/filtersSlice';
import { useFetch } from '../hooks/useFetch';
import { expenseApi } from '../api/expenseApi';
import { formatCurrency } from '../utils/format';
import type { SortField } from '../types';

export default function ExpensesPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const dispatch = useAppDispatch();
  const filters = useAppSelector(selectFilters);
  const params = useAppSelector(selectExpenseQueryParams);

  const { categories } = useCategories();
  const { data, loading, error, refetch } = useFetch((signal) => expenseApi.list(params, signal), [params]);

  const handleSort = (field: SortField) => {
    const order = filters.sortBy === field && filters.order === 'desc' ? 'asc' : 'desc';
    dispatch(setSort({ sortBy: field, order }));
  };

  const addButton = (
    <Button component={RouterLink} to="/expenses/new" variant="contained" startIcon={<AddRoundedIcon />}>
      Add expense
    </Button>
  );

  return (
    <>
      <PageHeader
        title="Expenses"
        subtitle={data ? `${data.pagination.total} expense(s) · ${formatCurrency(data.totalAmount)} total` : 'Your recorded spending'}
        actions={addButton}
      />

      <ExpenseFilters categories={categories} />

      <Card>
        {loading && <LinearProgress />}
        {error && (
          <Alert severity="error" action={<Button onClick={refetch}>Retry</Button>} sx={{ m: 2 }}>
            {error}
          </Alert>
        )}

        {data && data.expenses.length === 0 && !loading && (
          <EmptyState
            title="No expenses found"
            description="Try changing your filters, or record a new expense."
            action={addButton}
          />
        )}

        {data && data.expenses.length > 0 && (
          <Box sx={{ opacity: loading ? 0.6 : 1, transition: 'opacity .2s' }}>
            {isMobile ? (
              <ExpenseCardList expenses={data.expenses} />
            ) : (
              <ExpenseTable expenses={data.expenses} sortBy={filters.sortBy} order={filters.order} onSort={handleSort} />
            )}
            <ExpensePagination
              pagination={data.pagination}
              onPageChange={(page) => dispatch(setPage(page))}
              onLimitChange={(limit) => dispatch(setLimit(limit))}
            />
          </Box>
        )}

        {!data && loading && (
          <Typography color="text.secondary" sx={{ p: 3 }}>
            Loading expenses…
          </Typography>
        )}
      </Card>
    </>
  );
}
