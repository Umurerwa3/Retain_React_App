import type { ReactNode } from 'react';
import { Box, Card, CardContent, Stack, Typography } from '@mui/material';
import SavingsRoundedIcon from '@mui/icons-material/SavingsRounded';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

export default function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        px: 2,
        py: 4,
        background: (t) => `linear-gradient(135deg, ${t.palette.primary.main}14, ${t.palette.secondary.main}14)`,
      }}
    >
      <Card sx={{ width: '100%', maxWidth: 420 }}>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 3 }}>
            <SavingsRoundedIcon color="primary" fontSize="large" />
            <Typography variant="h5" component="span" color="primary">
              Retain
            </Typography>
          </Stack>
          <Typography variant="h5" component="h1" gutterBottom>
            {title}
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            {subtitle}
          </Typography>
          {children}
        </CardContent>
      </Card>
    </Box>
  );
}
