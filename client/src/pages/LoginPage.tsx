import { useState, type FormEvent } from 'react';
import { Link as RouterLink, useLocation, useNavigate, type Location } from 'react-router';
import { Alert, Button, Link, Stack, TextField, Typography } from '@mui/material';
import AuthLayout from '../components/auth/AuthLayout';
import PasswordField from '../components/auth/PasswordField';
import { useAuth } from '../hooks/useAuth';
import { getErrorMessage } from '../api/client';

export default function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: Location } | null)?.from?.pathname ?? '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const user = await signIn({ email: email.trim(), password });
      navigate(from === '/' && user.role === 'admin' ? '/admin' : from, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to keep track of your spending.">
      <Stack component="form" spacing={2} onSubmit={handleSubmit} noValidate>
        {error && <Alert severity="error">{error}</Alert>}
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoFocus
        />
        <PasswordField
          label="Password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          size="small"
          fullWidth
        />
        <Button type="submit" variant="contained" size="large" disabled={submitting || !email || !password}>
          {submitting ? 'Signing in…' : 'Sign in'}
        </Button>
        <Typography variant="body2" sx={{ textAlign: 'center' }}>
          New to Retain?{' '}
          <Link component={RouterLink} to="/register">
            Create an account
          </Link>
        </Typography>
      </Stack>
    </AuthLayout>
  );
}
