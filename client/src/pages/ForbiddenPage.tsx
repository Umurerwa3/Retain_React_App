import { Link as RouterLink } from 'react-router';
import { Box, Button, Typography } from '@mui/material';
import LockRoundedIcon from '@mui/icons-material/LockRounded';

export default function ForbiddenPage() {
  return (
    <Box sx={{ minHeight: '60vh', display: 'grid', placeItems: 'center', textAlign: 'center' }}>
      <Box>
        <LockRoundedIcon color="error" sx={{ fontSize: 56, mb: 1 }} />
        <Typography variant="h5" component="h1" gutterBottom>
          Access denied
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          You need an admin account to view that page.
        </Typography>
        <Button component={RouterLink} to="/" variant="contained">
          Back to dashboard
        </Button>
      </Box>
    </Box>
  );
}
