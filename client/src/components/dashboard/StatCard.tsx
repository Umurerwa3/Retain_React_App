import type { ReactNode } from 'react';
import { Avatar, Box, Card, CardContent, Stack, Typography } from '@mui/material';

interface StatCardProps {
  label: string;
  value: ReactNode;
  icon: ReactNode;
  caption?: ReactNode;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
}

export default function StatCard({ label, value, icon, caption, color = 'primary' }: StatCardProps) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Stack direction="row" spacing={2} sx={{ alignItems: 'flex-start' }}>
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography variant="body2" color="text.secondary">
              {label}
            </Typography>
            <Typography variant="h5" component="p" sx={{ mt: 0.5, fontWeight: 700 }} noWrap>
              {value}
            </Typography>
            {caption && (
              <Typography variant="caption" color="text.secondary" component="div" noWrap sx={{ mt: 0.5 }}>
                {caption}
              </Typography>
            )}
          </Box>
          <Avatar sx={{ bgcolor: `${color}.main`, color: `${color}.contrastText`, width: 44, height: 44 }} variant="rounded">
            {icon}
          </Avatar>
        </Stack>
      </CardContent>
    </Card>
  );
}
