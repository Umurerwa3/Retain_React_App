import { MenuItem, Pagination, Stack, TextField, Typography } from '@mui/material';
import type { Pagination as PaginationInfo } from '../../types';

const PAGE_SIZES = [5, 10, 20, 50];

interface ExpensePaginationProps {
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

export default function ExpensePagination({ pagination, onPageChange, onLimitChange }: ExpensePaginationProps) {
  const { page, limit, total, totalPages } = pagination;
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={2}
      sx={{ alignItems: 'center', justifyContent: 'space-between', p: 2 }}
    >
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          {from}–{to} of {total}
        </Typography>
        <TextField
          select
          label="Per page"
          value={limit}
          onChange={(e) => onLimitChange(Number(e.target.value))}
          sx={{ width: 100 }}
          fullWidth={false}
        >
          {PAGE_SIZES.map((size) => (
            <MenuItem key={size} value={size}>
              {size}
            </MenuItem>
          ))}
        </TextField>
      </Stack>
      <Pagination
        count={totalPages}
        page={page}
        onChange={(_, value) => onPageChange(value)}
        color="primary"
        shape="rounded"
        siblingCount={0}
      />
    </Stack>
  );
}
