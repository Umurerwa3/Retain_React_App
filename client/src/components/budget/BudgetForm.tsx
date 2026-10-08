import { useState, type FormEvent } from 'react';
import { Button, InputAdornment, Stack, TextField } from '@mui/material';
import { currencySymbol } from '../../utils/format';

interface BudgetFormProps {
  currentAmount: number | null;
  saving: boolean;
  onSave: (amount: number) => void;
}

/** Remount with a new `key` to reset the field when the month or saved amount changes. */
export default function BudgetForm({ currentAmount, saving, onSave }: BudgetFormProps) {
  const [value, setValue] = useState(currentAmount ? String(currentAmount) : '');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const amount = Number(value);
    if (!value || Number.isNaN(amount) || amount <= 0) {
      setError('Enter a budget greater than 0');
      return;
    }
    onSave(Math.round(amount * 100) / 100);
  };

  return (
    <Stack component="form" direction={{ xs: 'column', sm: 'row' }} spacing={1.5} onSubmit={handleSubmit} noValidate>
      <TextField
        label="Monthly budget"
        type="number"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setError(null);
        }}
        error={Boolean(error)}
        helperText={error}
        slotProps={{
          htmlInput: { min: 0, step: '0.01', inputMode: 'decimal' },
          input: { startAdornment: <InputAdornment position="start">{currencySymbol}</InputAdornment> },
        }}
      />
      <Button type="submit" variant="contained" disabled={saving} sx={{ whiteSpace: 'nowrap', minWidth: 140, height: 40 }}>
        {saving ? 'Saving…' : currentAmount ? 'Update budget' : 'Set budget'}
      </Button>
    </Stack>
  );
}
