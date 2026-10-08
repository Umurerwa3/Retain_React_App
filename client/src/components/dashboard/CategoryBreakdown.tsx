import { Box, LinearProgress, Stack, Typography } from '@mui/material';
import { formatCurrency } from '../../utils/format';
import type { CategorySpending } from '../../types';

/** Per-category totals as proportional bars. */
export default function CategoryBreakdown({ data }: { data: CategorySpending[] }) {
  const total = data.reduce((sum, c) => sum + c.total, 0);

  return (
    <Stack spacing={2}>
      {data.map((c) => {
        const share = total ? (c.total / total) * 100 : 0;
        return (
          <Box key={c.categoryId}>
            <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {c.name}{' '}
                <Typography component="span" variant="caption" color="text.secondary">
                  ({c.count})
                </Typography>
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {formatCurrency(c.total)}{' '}
                <Typography component="span" variant="caption" color="text.secondary">
                  {share.toFixed(0)}%
                </Typography>
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={share}
              aria-label={`${c.name} share of spending`}
              sx={{ height: 8, borderRadius: 4, bgcolor: `${c.color}22`, '& .MuiLinearProgress-bar': { bgcolor: c.color } }}
            />
          </Box>
        );
      })}
    </Stack>
  );
}
