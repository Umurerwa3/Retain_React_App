import type { ReactNode } from 'react';
import { Box, Typography } from '@mui/material';
import InboxRoundedIcon from '@mui/icons-material/InboxRounded';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
}

export default function EmptyState({ title, description, action, icon }: EmptyStateProps) {
  return (
    <Box sx={{ textAlign: 'center', py: 6, px: 2 }}>
      <Box sx={{ color: 'text.disabled', mb: 1 }}>{icon ?? <InboxRoundedIcon sx={{ fontSize: 48 }} />}</Box>
      <Typography variant="h6" component="p">
        {title}
      </Typography>
      {description && (
        <Typography color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
          {description}
        </Typography>
      )}
      {action}
    </Box>
  );
}
