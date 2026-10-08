import { useState } from 'react';
import { useLocation } from 'react-router';
import {
  Alert,
  Button,
  Card,
  CardContent,
  Grid,
  List,
  ListItemButton,
  ListItemText,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import PageHeader from '../components/common/PageHeader';
import ConfirmDialog from '../components/common/ConfirmDialog';
import MonthPicker from '../components/budget/MonthPicker';
import BudgetProgress from '../components/budget/BudgetProgress';
import BudgetForm from '../components/budget/BudgetForm';
import { useFetch } from '../hooks/useFetch';
import { useNotify } from '../hooks/useNotify';
import { budgetApi } from '../api/budgetApi';
import { getErrorMessage } from '../api/client';
import { currentMonthValue, formatCurrency, formatMonth } from '../utils/format';

export default function BudgetPage() {
  const notify = useNotify();
  const location = useLocation();
  const isWelcome = Boolean((location.state as { welcome?: boolean } | null)?.welcome);

  const [month, setMonth] = useState(currentMonthValue);
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const summary = useFetch((signal) => budgetApi.getSummary(month, signal), [month]);
  const history = useFetch((signal) => budgetApi.list(signal), []);

  const handleSave = async (amount: number) => {
    setSaving(true);
    try {
      summary.setData(await budgetApi.set(month, amount));
      history.refetch();
      notify(`Budget for ${formatMonth(month)} saved`);
    } catch (err) {
      notify(getErrorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async () => {
    setSaving(true);
    try {
      await budgetApi.remove(month);
      summary.refetch();
      history.refetch();
      notify('Budget removed');
    } catch (err) {
      notify(getErrorMessage(err), 'error');
    } finally {
      setSaving(false);
      setConfirmOpen(false);
    }
  };

  const data = summary.data;

  return (
    <>
      <PageHeader title="Budget" subtitle="Set a monthly spending limit and see how you are tracking." />

      {isWelcome && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Welcome to Retain! Start by setting a budget for this month.
        </Alert>
      )}

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' }, mb: 2 }}
                spacing={1}
              >
                <Typography variant="h6" component="h2">
                  Monthly budget
                </Typography>
                <MonthPicker value={month} onChange={setMonth} />
              </Stack>

              {summary.error && <Alert severity="error">{summary.error}</Alert>}
              {summary.loading && !data && <Skeleton variant="rounded" height={140} />}

              {data && (
                <Stack spacing={3} sx={{ opacity: summary.loading ? 0.6 : 1 }}>
                  <Grid container spacing={2}>
                    {[
                      { label: 'Budget', value: data.hasBudget ? formatCurrency(data.budget) : '—' },
                      { label: 'Spent', value: formatCurrency(data.spent) },
                      {
                        label: 'Remaining',
                        value: data.hasBudget ? formatCurrency(data.remaining) : '—',
                        color: data.remaining < 0 ? 'error.main' : undefined,
                      },
                    ].map((stat) => (
                      <Grid key={stat.label} size={{ xs: 12, sm: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                          {stat.label}
                        </Typography>
                        <Typography variant="h5" component="p" sx={{ color: stat.color }}>
                          {stat.value}
                        </Typography>
                      </Grid>
                    ))}
                  </Grid>

                  <BudgetProgress summary={data} />

                  <BudgetForm currentAmount={data.hasBudget ? data.budget : null} saving={saving} onSave={handleSave} />

                  {data.hasBudget && (
                    <Button color="error" onClick={() => setConfirmOpen(true)} sx={{ alignSelf: 'flex-start' }}>
                      Remove budget for this month
                    </Button>
                  )}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="h2" gutterBottom>
                Budget history
              </Typography>
              {history.data?.length === 0 && (
                <Typography color="text.secondary">You have not set any budgets yet.</Typography>
              )}
              <List dense disablePadding>
                {history.data?.map((b) => (
                  <ListItemButton key={b._id} selected={b.month === month} onClick={() => setMonth(b.month)} sx={{ borderRadius: 1 }}>
                    <ListItemText primary={formatMonth(b.month)} />
                    <Typography sx={{ fontWeight: 600 }}>{formatCurrency(b.amount)}</Typography>
                  </ListItemButton>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <ConfirmDialog
        open={confirmOpen}
        title="Remove budget?"
        message={`The budget for ${formatMonth(month)} will be removed. Your expenses are not affected.`}
        confirmLabel="Remove"
        loading={saving}
        onConfirm={handleRemove}
        onClose={() => setConfirmOpen(false)}
      />
    </>
  );
}
