import { Link as RouterLink } from 'react-router';
import { Box, Button, Typography } from '@mui/material';

export default function NotFoundPage() {
  return (
    <Box sx={{ minHeight: '70vh', display: 'grid', placeItems: 'center', textAlign: 'center', px: 2 }}>
      <Box>
        <Typography variant="h2" component="p" color="primary" sx={{ fontWeight: 700 }}>
          404
        </Typography>
        <Typography variant="h5" component="h1" gutterBottom>
          Page not found
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          The page you are looking for does not exist or was moved.
        </Typography>
        <Button component={RouterLink} to="/" variant="contained">
          Back to dashboard
        </Button>
      </Box>
    </Box>
  );
}
