import { useState, type FormEvent } from 'react';
import { Alert, Box, Button, Grid, InputAdornment, MenuItem, Stack, TextField } from '@mui/material';
import { currencySymbol, PAYMENT_METHOD_LABELS, todayInputValue, toDateInputValue } from '../../utils/format';
import { PAYMENT_METHODS, type Category, type Expense, type ExpenseInput, type PaymentMethod } from '../../types';

interface FormValues {
  title: string;
  amount: string;
  category: string;
  date: string;
  paymentMethod: PaymentMethod | '';
  notes: string;
}

type FormErrors = Partial<Record<keyof FormValues, string>>;

interface ExpenseFormProps {
  categories: Category[];
  initial?: Expense | null;
  submitLabel: string;
  onSubmit: (data: ExpenseInput) => Promise<void>;
  onCancel: () => void;
}

const toFormValues = (expense?: Expense | null): FormValues => ({
  title: expense?.title ?? '',
  amount: expense ? String(expense.amount) : '',
  category: expense?.category?._id ?? '',
  date: expense ? toDateInputValue(expense.date) : todayInputValue(),
  paymentMethod: expense?.paymentMethod ?? '',
  notes: expense?.notes ?? '',
});

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};
  const amount = Number(values.amount);
  if (!values.title.trim()) errors.title = 'Title is required';
  else if (values.title.trim().length > 100) errors.title = 'Keep the title under 100 characters';
  if (!values.amount || Number.isNaN(amount) || amount <= 0) errors.amount = 'Enter an amount greater than 0';
  if (!values.category) errors.category = 'Choose a category';
  if (!values.date) errors.date = 'Pick a date';
  if (!values.paymentMethod) errors.paymentMethod = 'Choose a payment method';
  if (values.notes.length > 500) errors.notes = 'Notes can be at most 500 characters';
  return errors;
}

export default function ExpenseForm({ categories, initial, submitLabel, onSubmit, onCancel }: ExpenseFormProps) {
  const [values, setValues] = useState<FormValues>(() => toFormValues(initial));
  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const field = (name: keyof FormValues) => ({
    name,
    value: values[name],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      setValues((v) => ({ ...v, [name]: e.target.value }));
      if (errors[name]) setErrors((err) => ({ ...err, [name]: undefined }));
    },
    error: Boolean(errors[name]),
    helperText: errors[name],
  });

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length) return;

    setSubmitting(true);
    setServerError(null);
    try {
      await onSubmit({
        title: values.title.trim(),
        amount: Math.round(Number(values.amount) * 100) / 100,
        category: values.category,
        date: values.date,
        paymentMethod: values.paymentMethod as PaymentMethod,
        notes: values.notes.trim(),
      });
    } catch (err) {
      setServerError(err instanceof Error ? err.message : String(err));
      setSubmitting(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      {serverError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {serverError}
        </Alert>
      )}
      <Grid container spacing={2}>
        <Grid size={12}>
          <TextField label="Title" required autoFocus {...field('title')} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Amount"
            type="number"
            required
            {...field('amount')}
            slotProps={{
              htmlInput: { min: 0, step: '0.01', inputMode: 'decimal' },
              input: { startAdornment: <InputAdornment position="start">{currencySymbol}</InputAdornment> },
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField label="Date" type="date" required {...field('date')} slotProps={{ inputLabel: { shrink: true } }} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField select label="Category" required {...field('category')}>
            {categories.map((c) => (
              <MenuItem key={c._id} value={c._id}>
                <Box component="span" sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: c.color, mr: 1.5, display: 'inline-block' }} />
                {c.name}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField select label="Payment method" required {...field('paymentMethod')}>
            {PAYMENT_METHODS.map((m) => (
              <MenuItem key={m} value={m}>
                {PAYMENT_METHOD_LABELS[m]}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={12}>
          <TextField
            label="Notes (optional)"
            multiline
            minRows={3}
            {...field('notes')}
            helperText={errors.notes ?? `${values.notes.length}/500`}
          />
        </Grid>
      </Grid>
      <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end', mt: 3 }}>
        <Button onClick={onCancel} color="inherit" disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" variant="contained" disabled={submitting}>
          {submitting ? 'Saving…' : submitLabel}
        </Button>
      </Stack>
    </Box>
  );
}
