import { useEffect, useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Card,
  Checkbox,
  Collapse,
  Grid,
  InputAdornment,
  ListItemText,
  MenuItem,
  Stack,
  TextField,
} from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import ClearAllRoundedIcon from '@mui/icons-material/ClearAllRounded';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  resetFilters,
  selectActiveFilterCount,
  selectFilters,
  setAmountRange,
  setCategories,
  setDateRange,
  setPaymentMethods,
  setSearch,
  setSort,
} from '../../store/slices/filtersSlice';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { PAYMENT_METHOD_LABELS } from '../../utils/format';
import { PAYMENT_METHODS, type Category, type PaymentMethod, type SortField, type SortOrder } from '../../types';

const SORT_OPTIONS: { value: `${SortField}:${SortOrder}`; label: string }[] = [
  { value: 'date:desc', label: 'Newest first' },
  { value: 'date:asc', label: 'Oldest first' },
  { value: 'amount:desc', label: 'Highest amount' },
  { value: 'amount:asc', label: 'Lowest amount' },
];

/** Search, filter and sort controls. All state is read from and written to the Redux filters slice. */
export default function ExpenseFilters({ categories }: { categories: Category[] }) {
  const dispatch = useAppDispatch();
  const filters = useAppSelector(selectFilters);
  const activeCount = useAppSelector(selectActiveFilterCount);
  const [expanded, setExpanded] = useState(activeCount > 0);

  // The search box is typed into locally and pushed to Redux once typing pauses
  const [searchInput, setSearchInput] = useState(filters.search);
  const debouncedSearch = useDebouncedValue(searchInput);

  useEffect(() => {
    if (debouncedSearch !== filters.search) dispatch(setSearch(debouncedSearch));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, dispatch]);

  // Keep the input in sync when filters are cleared elsewhere
  useEffect(() => {
    setSearchInput(filters.search);
  }, [filters.search]);

  const categoryName = (id: string) => categories.find((c) => c._id === id)?.name ?? 'Unknown';
  const amountError =
    filters.minAmount && filters.maxAmount && Number(filters.minAmount) > Number(filters.maxAmount)
      ? 'Min is greater than max'
      : undefined;
  const dateError =
    filters.startDate && filters.endDate && filters.startDate > filters.endDate ? 'Start is after end' : undefined;

  return (
    <Card sx={{ p: 2, mb: 2 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
        <TextField
          placeholder="Search title or notes"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          aria-label="Search expenses"
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon />
                </InputAdornment>
              ),
            },
          }}
        />
        <TextField
          select
          label="Sort by"
          value={`${filters.sortBy}:${filters.order}`}
          onChange={(e) => {
            const [sortBy, order] = e.target.value.split(':') as [SortField, SortOrder];
            dispatch(setSort({ sortBy, order }));
          }}
          sx={{ minWidth: { sm: 180 } }}
          fullWidth={false}
        >
          {SORT_OPTIONS.map((o) => (
            <MenuItem key={o.value} value={o.value}>
              {o.label}
            </MenuItem>
          ))}
        </TextField>
        <Stack direction="row" spacing={1}>
          <Badge badgeContent={activeCount} color="primary" sx={{ flex: 1 }}>
            <Button
              variant={expanded ? 'contained' : 'outlined'}
              startIcon={<TuneRoundedIcon />}
              onClick={() => setExpanded((v) => !v)}
              aria-expanded={expanded}
              fullWidth
              sx={{ whiteSpace: 'nowrap', height: 40 }}
            >
              Filters
            </Button>
          </Badge>
          {activeCount > 0 && (
            <Button
              color="inherit"
              startIcon={<ClearAllRoundedIcon />}
              onClick={() => dispatch(resetFilters())}
              sx={{ whiteSpace: 'nowrap' }}
            >
              Clear
            </Button>
          )}
        </Stack>
      </Stack>

      <Collapse in={expanded} unmountOnExit>
        <Box sx={{ pt: 2 }}>
          <Grid container spacing={1.5}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                select
                label="Categories"
                value={filters.categories}
                onChange={(e) => {
                  const value = e.target.value as unknown as string[] | string;
                  dispatch(setCategories(typeof value === 'string' ? value.split(',') : value));
                }}
                slotProps={{
                  select: {
                    multiple: true,
                    renderValue: (selected) => (selected as string[]).map(categoryName).join(', '),
                  },
                }}
              >
                {categories.map((c) => (
                  <MenuItem key={c._id} value={c._id}>
                    <Checkbox size="small" checked={filters.categories.includes(c._id)} />
                    <ListItemText primary={c.name} />
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                select
                label="Payment methods"
                value={filters.paymentMethods}
                onChange={(e) => {
                  const value = e.target.value as unknown as PaymentMethod[] | string;
                  dispatch(setPaymentMethods(typeof value === 'string' ? (value.split(',') as PaymentMethod[]) : value));
                }}
                slotProps={{
                  select: {
                    multiple: true,
                    renderValue: (selected) =>
                      (selected as PaymentMethod[]).map((m) => PAYMENT_METHOD_LABELS[m]).join(', '),
                  },
                }}
              >
                {PAYMENT_METHODS.map((m) => (
                  <MenuItem key={m} value={m}>
                    <Checkbox size="small" checked={filters.paymentMethods.includes(m)} />
                    <ListItemText primary={PAYMENT_METHOD_LABELS[m]} />
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 6, md: 1.5 }}>
              <TextField
                label="From"
                type="date"
                value={filters.startDate}
                onChange={(e) => dispatch(setDateRange({ startDate: e.target.value }))}
                error={Boolean(dateError)}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
            <Grid size={{ xs: 6, md: 1.5 }}>
              <TextField
                label="To"
                type="date"
                value={filters.endDate}
                onChange={(e) => dispatch(setDateRange({ endDate: e.target.value }))}
                error={Boolean(dateError)}
                helperText={dateError}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
            <Grid size={{ xs: 6, md: 1.5 }}>
              <TextField
                label="Min amount"
                type="number"
                value={filters.minAmount}
                onChange={(e) => dispatch(setAmountRange({ minAmount: e.target.value }))}
                error={Boolean(amountError)}
                slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
              />
            </Grid>
            <Grid size={{ xs: 6, md: 1.5 }}>
              <TextField
                label="Max amount"
                type="number"
                value={filters.maxAmount}
                onChange={(e) => dispatch(setAmountRange({ maxAmount: e.target.value }))}
                error={Boolean(amountError)}
                helperText={amountError}
                slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
              />
            </Grid>
          </Grid>
        </Box>
      </Collapse>
    </Card>
  );
}
