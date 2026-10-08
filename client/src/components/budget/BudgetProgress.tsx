import { Box, Chip, LinearProgress, Stack, Typography } from '@mui/material';
import { BUDGET_STATUS, formatCurrency } from '../../utils/format';
import type { BudgetSummary } from '../../types';

/** Spent vs. budget bar with the within / approaching / over status. */
export default function BudgetProgress({ summary }: { summary: BudgetSummary }) {
  const status = BUDGET_STATUS[summary.status];
  const barColor = status.color === 'default' ? 'inherit' : status.color;

  return (
    <Box>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="body2" color="text.secondary">
          {summary.hasBudget
            ? `${formatCurrency(summary.spent)} of ${formatCurrency(summary.budget)} spent`
            : `${formatCurrency(summary.spent)} spent`}
        </Typography>
        <Chip size="small" label={status.label} color={status.color} />
      </Stack>
      <LinearProgress
        variant="determinate"
        value={summary.hasBudget ? Math.min(100, summary.percentUsed) : 0}
        color={barColor}
        sx={{ height: 10, borderRadius: 5 }}
        aria-label="Budget used"
      />
      {summary.hasBudget && (
        <Typography variant="body2" sx={{ mt: 1, color: summary.remaining < 0 ? 'error.main' : 'text.secondary' }}>
          {summary.remaining >= 0
            ? `${formatCurrency(summary.remaining)} left · ${summary.percentUsed}% used`
            : `${formatCurrency(Math.abs(summary.remaining))} over budget · ${summary.percentUsed}% used`}
        </Typography>
      )}
    </Box>
  );
}
