import { useEffect, useState, type FormEvent } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import type { Category, CategoryInput } from '../../types';

const SWATCHES = ['#ef6c00', '#1e88e5', '#6d4c41', '#00897b', '#8e24aa', '#e53935', '#d81b60', '#3949ab', '#43a047', '#fdd835', '#546e7a', '#9e9e9e'];

interface CategoryDialogProps {
  open: boolean;
  category: Category | null;
  onClose: () => void;
  onSave: (data: CategoryInput) => Promise<void>;
}

const emptyForm: CategoryInput = { name: '', description: '', color: SWATCHES[0] };

export default function CategoryDialog({ open, category, onClose, onSave }: CategoryDialogProps) {
  const [values, setValues] = useState<CategoryInput>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setValues(category ? { name: category.name, description: category.description, color: category.color } : emptyForm);
      setError(null);
      setSaving(false);
    }
  }, [open, category]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!values.name.trim()) {
      setError('Name is required');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSave({ ...values, name: values.name.trim(), description: values.description.trim() });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} fullWidth maxWidth="sm">
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <DialogTitle>{category ? 'Edit category' : 'New category'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {error && <Alert severity="error">{error}</Alert>}
            <TextField
              label="Name"
              value={values.name}
              onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
              slotProps={{ htmlInput: { maxLength: 40 } }}
              required
              autoFocus
            />
            <TextField
              label="Description"
              value={values.description}
              onChange={(e) => setValues((v) => ({ ...v, description: e.target.value }))}
              slotProps={{ htmlInput: { maxLength: 200 } }}
              multiline
              minRows={2}
            />
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Color
              </Typography>
              <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
                {SWATCHES.map((color) => (
                  <Box
                    key={color}
                    component="button"
                    type="button"
                    aria-label={`Use color ${color}`}
                    aria-pressed={values.color === color}
                    onClick={() => setValues((v) => ({ ...v, color }))}
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      bgcolor: color,
                      cursor: 'pointer',
                      border: 3,
                      borderColor: values.color === color ? 'text.primary' : 'transparent',
                    }}
                  />
                ))}
              </Stack>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} color="inherit" disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
