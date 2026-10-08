import { useState, type ReactNode } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router';
import { Alert, Box, Button, Card, CardContent, Divider, Grid, Skeleton, Stack, Typography } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import CategoryChip from '../components/expenses/CategoryChip';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { useFetch } from '../hooks/useFetch';
import { useNotify } from '../hooks/useNotify';
import { expenseApi } from '../api/expenseApi';
import { getErrorMessage } from '../api/client';
import { formatCurrency, formatDate, formatDateTime, PAYMENT_METHOD_LABELS } from '../utils/format';

function Detail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Box>
      <Typography variant="overline" color="text.secondary">
        {label}
      </Typography>
      <Box sx={{ mt: 0.25 }}>{children}</Box>
    </Box>
  );
}

export default function ExpenseDetailsPage() {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const notify = useNotify();
  const { data: expense, loading, error } = useFetch((signal) => expenseApi.get(id, signal), [id]);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await expenseApi.remove(id);
      notify('Expense deleted');
      navigate('/expenses', { replace: true });
    } catch (err) {
      notify(getErrorMessage(err), 'error');
      setDeleting(false);
      setConfirmOpen(false);
    }
  };

  return (
    <>
      <Button component={RouterLink} to="/expenses" startIcon={<ArrowBackRoundedIcon />} color="inherit" sx={{ mb: 2 }}>
        All expenses
      </Button>

      {error && <Alert severity="error">{error}</Alert>}
      {loading && <Skeleton variant="rounded" height={280} sx={{ maxWidth: 720 }} />}

      {expense && !loading && (
        <Card sx={{ maxWidth: 720 }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              sx={{ justifyContent: 'space-between', alignItems: { sm: 'flex-start' } }}
            >
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="h5" component="h1" sx={{ wordBreak: 'break-word' }}>
                  {expense.title}
                </Typography>
                <Typography variant="h4" component="p" color="primary" sx={{ fontWeight: 700, mt: 1 }}>
                  {formatCurrency(expense.amount)}
                </Typography>
              </Box>
              <Stack direction="row" spacing={1}>
                <Button component={RouterLink} to={`/expenses/${expense._id}/edit`} variant="outlined" startIcon={<EditRoundedIcon />}>
                  Edit
                </Button>
                <Button color="error" variant="outlined" startIcon={<DeleteOutlineRoundedIcon />} onClick={() => setConfirmOpen(true)}>
                  Delete
                </Button>
              </Stack>
            </Stack>

            <Divider sx={{ my: 3 }} />

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Detail label="Category">
                  <CategoryChip category={expense.category} />
                </Detail>
              </Grid>
              <Grid size={{ xs: 6, sm: 4 }}>
                <Detail label="Date">
                  <Typography>{formatDate(expense.date, { dateStyle: 'full' })}</Typography>
                </Detail>
              </Grid>
              <Grid size={{ xs: 6, sm: 4 }}>
                <Detail label="Payment method">
                  <Typography>{PAYMENT_METHOD_LABELS[expense.paymentMethod]}</Typography>
                </Detail>
              </Grid>
              <Grid size={12}>
                <Detail label="Notes">
                  <Typography color={expense.notes ? 'text.primary' : 'text.secondary'} sx={{ whiteSpace: 'pre-wrap' }}>
                    {expense.notes || 'No notes'}
                  </Typography>
                </Detail>
              </Grid>
            </Grid>

            <Typography variant="caption" color="text.secondary" component="p" sx={{ mt: 3 }}>
              Recorded {formatDateTime(expense.createdAt)}
              {expense.updatedAt !== expense.createdAt && ` · Last updated ${formatDateTime(expense.updatedAt)}`}
            </Typography>
          </CardContent>
        </Card>
      )}

      <ConfirmDialog
        open={confirmOpen}
        title="Delete expense?"
        message={`"${expense?.title ?? ''}" will be permanently removed.`}
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => setConfirmOpen(false)}
      />
    </>
  );
}
