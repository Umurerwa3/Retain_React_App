import { useNavigate, useParams } from 'react-router';
import { Alert, Card, CardContent, Skeleton } from '@mui/material';
import PageHeader from '../components/common/PageHeader';
import ExpenseForm from '../components/expenses/ExpenseForm';
import { useCategories } from '../hooks/useCategories';
import { useFetch } from '../hooks/useFetch';
import { useNotify } from '../hooks/useNotify';
import { expenseApi } from '../api/expenseApi';
import { getErrorMessage } from '../api/client';
import type { Expense, ExpenseInput } from '../types';

/** Handles both /expenses/new and /expenses/:id/edit */
export default function ExpenseFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const notify = useNotify();

  const { categories, loading: loadingCategories, error: categoriesError } = useCategories();
  const expense = useFetch<Expense | null>((signal) => (id ? expenseApi.get(id, signal) : Promise.resolve(null)), [id]);

  const handleSubmit = async (data: ExpenseInput) => {
    try {
      const saved = id ? await expenseApi.update(id, data) : await expenseApi.create(data);
      notify(isEdit ? 'Expense updated' : 'Expense added');
      navigate(`/expenses/${saved._id}`, { replace: true });
    } catch (err) {
      throw new Error(getErrorMessage(err));
    }
  };

  const error = categoriesError ?? expense.error;
  const loading = loadingCategories || expense.loading;

  return (
    <>
      <PageHeader
        title={isEdit ? 'Edit expense' : 'Add expense'}
        subtitle={isEdit ? 'Update the details of this expense.' : 'Record a new expense.'}
      />
      <Card sx={{ maxWidth: 720 }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          {error && <Alert severity="error">{error}</Alert>}
          {!error && loading && <Skeleton variant="rounded" height={320} />}
          {!error && !loading && (
            <ExpenseForm
              categories={categories}
              initial={expense.data}
              submitLabel={isEdit ? 'Save changes' : 'Add expense'}
              onSubmit={handleSubmit}
              onCancel={() => navigate(-1)}
            />
          )}
        </CardContent>
      </Card>
    </>
  );
}
