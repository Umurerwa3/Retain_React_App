import { Chip, type ChipProps } from '@mui/material';
import type { Category } from '../../types';

interface CategoryChipProps extends Omit<ChipProps, 'label' | 'color'> {
  category: Pick<Category, 'name' | 'color'> | null | undefined;
}

export default function CategoryChip({ category, sx, ...props }: CategoryChipProps) {
  const color = category?.color ?? '#9e9e9e';
  return (
    <Chip
      size="small"
      label={category?.name ?? 'Uncategorized'}
      sx={{ bgcolor: `${color}1f`, color, fontWeight: 600, border: `1px solid ${color}55`, ...sx }}
      {...props}
    />
  );
}
