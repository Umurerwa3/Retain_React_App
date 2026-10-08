import { useState, type FormEvent } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router';
import { Alert, Button, Link, Stack, TextField, Typography } from '@mui/material';
import AuthLayout from '../components/auth/AuthLayout';
import PasswordField from '../components/auth/PasswordField';
import { useAuth } from '../hooks/useAuth';
import { getErrorMessage } from '../api/client';

interface FormState {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

type FormErrors = Partial<Record<keyof FormState, string>>;

function validate(values: FormState): FormErrors {
  const errors: FormErrors = {};
  if (!values.name.trim()) errors.name = 'Name is required';
  if (!/^\S+@\S+\.\S+$/.test(values.email.trim())) errors.email = 'Enter a valid email address';
  if (values.password.length < 6) errors.password = 'Password must be at least 6 characters';
  if (values.confirmPassword !== values.password) errors.confirmPassword = 'Passwords do not match';
  return errors;
}

export default function RegisterPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [values, setValues] = useState<FormState>({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const update = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setValues((v) => ({ ...v, [field]: e.target.value }));

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length) return;

    setServerError(null);
    setSubmitting(true);
    try {
      await signUp({ name: values.name.trim(), email: values.email.trim(), password: values.password });
      navigate('/budget', { replace: true, state: { welcome: true } });
    } catch (err) {
      setServerError(getErrorMessage(err));
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Create your account" subtitle="Start recording expenses and set your first budget.">
      <Stack component="form" spacing={2} onSubmit={handleSubmit} noValidate>
        {serverError && <Alert severity="error">{serverError}</Alert>}
        <TextField
          label="Full name"
          autoComplete="name"
          value={values.name}
          onChange={update('name')}
          error={Boolean(errors.name)}
          helperText={errors.name}
          autoFocus
        />
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          value={values.email}
          onChange={update('email')}
          error={Boolean(errors.email)}
          helperText={errors.email}
        />
        <PasswordField
          label="Password"
          autoComplete="new-password"
          value={values.password}
          onChange={update('password')}
          error={Boolean(errors.password)}
          helperText={errors.password ?? 'At least 6 characters'}
          size="small"
          fullWidth
        />
        <PasswordField
          label="Confirm password"
          autoComplete="new-password"
          value={values.confirmPassword}
          onChange={update('confirmPassword')}
          error={Boolean(errors.confirmPassword)}
          helperText={errors.confirmPassword}
          size="small"
          fullWidth
        />
        <Button type="submit" variant="contained" size="large" disabled={submitting}>
          {submitting ? 'Creating account…' : 'Sign up'}
        </Button>
        <Typography variant="body2" sx={{ textAlign: 'center' }}>
          Already have an account?{' '}
          <Link component={RouterLink} to="/login">
            Sign in
          </Link>
        </Typography>
      </Stack>
    </AuthLayout>
  );
}
