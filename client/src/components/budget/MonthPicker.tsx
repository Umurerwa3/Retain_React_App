import { IconButton, Stack, Typography } from '@mui/material';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import { formatMonth, shiftMonth } from '../../utils/format';

interface MonthPickerProps {
  /** YYYY-MM */
  value: string;
  onChange: (month: string) => void;
}

export default function MonthPicker({ value, onChange }: MonthPickerProps) {
  return (
    <Stack direction="row" sx={{ alignItems: 'center' }} spacing={0.5}>
      <IconButton aria-label="Previous month" onClick={() => onChange(shiftMonth(value, -1))}>
        <ChevronLeftRoundedIcon />
      </IconButton>
      <Typography sx={{ fontWeight: 600, minWidth: 140, textAlign: 'center' }} aria-live="polite">
        {formatMonth(value)}
      </Typography>
      <IconButton aria-label="Next month" onClick={() => onChange(shiftMonth(value, 1))}>
        <ChevronRightRoundedIcon />
      </IconButton>
    </Stack>
  );
}
