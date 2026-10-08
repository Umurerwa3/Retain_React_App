import { useState } from 'react';
import { Link as RouterLink } from 'react-router';
import { Alert, Button, Card, CardContent, Grid, Skeleton, Stack, Typography } from '@mui/material';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import PageHeader from '../components/common/PageHeader';
import EmptyState from '../components/common/EmptyState';
import StatCard from '../components/dashboard/StatCard';
import CategoryBreakdown from '../components/dashboard/CategoryBreakdown';
import RecentExpenses from '../components/dashboard/RecentExpenses';
import CategoryDonut from '../components/dashboard/CategoryDonut';
import DailySpendingChart from '../components/dashboard/DailySpendingChart';
import BudgetProgress from '../components/budget/BudgetProgress';
import MonthPicker from '../components/budget/MonthPicker';
import { useAuth } from '../hooks/useAuth';
import { useFetch } from '../hooks/useFetch';
import { dashboardApi } from '../api/dashboardApi';
import { currentMonthValue, formatCurrency, formatMonth } from '../utils/format';

export default function DashboardPage() {
  const { user } = useAuth();
  const [month, setMonth] = useState(currentMonthValue);
  const { data, loading, error, refetch } = useFetch((signal) => dashboardApi.get(month, signal), [month]);

  const remainingColor = !data?.budget.hasBudget
    ? 'info'
    : data.budget.status === 'over'
      ? 'error'
      : data.budget.status === 'approaching'
        ? 'warning'
        : 'success';

  return (
    <>
      <PageHeader
        title={`Hi, ${user?.name.split(' ')[0] ?? 'there'}`}
        subtitle={`Here is your spending for ${formatMonth(month)}.`}
        actions={<MonthPicker value={month} onChange={setMonth} />}
      />

      {error && (
        <Alert severity="error" action={<Button onClick={refetch}>Retry</Button>} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading && !data && (
        <Grid container spacing={2}>
          {[0, 1, 2, 3].map((i) => (
            <Grid key={i} size={{ xs: 12, sm: 6, lg: 3 }}>
              <Skeleton variant="rounded" height={110} />
            </Grid>
          ))}
          <Grid size={12}>
            <Skeleton variant="rounded" height={260} />
          </Grid>
        </Grid>
      )}

      {data && (
        <Grid container spacing={2} sx={{ opacity: loading ? 0.6 : 1, transition: 'opacity .2s' }}>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard
              label="Total spent"
              value={formatCurrency(data.totalSpent)}
              caption={`${data.expenseCount} expense(s) this month`}
              icon={<PaymentsRoundedIcon />}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard
              label="Remaining budget"
              value={data.budget.hasBudget ? formatCurrency(data.budget.remaining) : 'No budget'}
              caption={
                data.budget.hasBudget ? (
                  `of ${formatCurrency(data.budget.budget)}`
                ) : (
                  <RouterLink to="/budget">Set a budget</RouterLink>
                )
              }
              icon={<AccountBalanceWalletRoundedIcon />}
              color={remainingColor}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard
              label="Highest expense"
              value={data.highestExpense ? formatCurrency(data.highestExpense.amount) : '—'}
              caption={data.highestExpense?.title ?? 'Nothing recorded yet'}
              icon={<TrendingUpRoundedIcon />}
              color="secondary"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard
              label="Categories used"
              value={data.spendingByCategory.length}
              caption={data.spendingByCategory[0] ? `Top: ${data.spendingByCategory[0].name}` : 'No spending yet'}
              icon={<ReceiptLongRoundedIcon />}
              color="info"
            />
          </Grid>

          <Grid size={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" component="h2" gutterBottom>
                  Budget status
                </Typography>
                <BudgetProgress summary={data.budget} />
              </CardContent>
            </Card>
          </Grid>

          {data.dailySpending.length > 0 && (
            <Grid size={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" component="h2" gutterBottom>
                    Daily spending
                  </Typography>
                  <DailySpendingChart month={month} data={data.dailySpending} />
                </CardContent>
              </Card>
            </Grid>
          )}

          <Grid size={{ xs: 12, md: 7 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" component="h2" gutterBottom>
                  Spending by category
                </Typography>
                {data.spendingByCategory.length ? (
                  <Grid container spacing={2} sx={{ alignItems: 'center' }}>
                    <Grid size={{ xs: 12, sm: 5 }}>
                      <CategoryDonut data={data.spendingByCategory} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 7 }}>
                      <CategoryBreakdown data={data.spendingByCategory} />
                    </Grid>
                  </Grid>
                ) : (
                  <EmptyState title="No spending this month" description="Expenses you record will be grouped here." />
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 5 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="h6" component="h2">
                    Recent expenses
                  </Typography>
                  <Button component={RouterLink} to="/expenses" size="small">
                    View all
                  </Button>
                </Stack>
                {data.recentExpenses.length ? (
                  <RecentExpenses expenses={data.recentExpenses} />
                ) : (
                  <EmptyState
                    title="No expenses yet"
                    action={
                      <Button component={RouterLink} to="/expenses/new" variant="contained" startIcon={<AddRoundedIcon />}>
                        Add your first expense
                      </Button>
                    }
                  />
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </>
  );
}
