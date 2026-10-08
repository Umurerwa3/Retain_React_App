import { createSelector, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { PaymentMethod, SortField, SortOrder } from '../../types';
import type { RootState } from '../index';

/**
 * All expense searching, filtering, sorting and paging state lives here.
 * Pages read it with selectors and the expense list is fetched from it.
 */
export interface FiltersState {
  search: string;
  categories: string[];
  paymentMethods: PaymentMethod[];
  /** YYYY-MM-DD, inclusive */
  startDate: string;
  /** YYYY-MM-DD, inclusive */
  endDate: string;
  minAmount: string;
  maxAmount: string;
  sortBy: SortField;
  order: SortOrder;
  page: number;
  limit: number;
}

export const initialFiltersState: FiltersState = {
  search: '',
  categories: [],
  paymentMethods: [],
  startDate: '',
  endDate: '',
  minAmount: '',
  maxAmount: '',
  sortBy: 'date',
  order: 'desc',
  page: 1,
  limit: 10,
};

const filtersSlice = createSlice({
  name: 'filters',
  initialState: initialFiltersState,
  reducers: {
    // Every filter change returns to the first page so results are never "out of range"
    setSearch(state, action: PayloadAction<string>) {
      state.search = action.payload;
      state.page = 1;
    },
    setCategories(state, action: PayloadAction<string[]>) {
      state.categories = action.payload;
      state.page = 1;
    },
    setPaymentMethods(state, action: PayloadAction<PaymentMethod[]>) {
      state.paymentMethods = action.payload;
      state.page = 1;
    },
    setDateRange(state, action: PayloadAction<{ startDate?: string; endDate?: string }>) {
      if (action.payload.startDate !== undefined) state.startDate = action.payload.startDate;
      if (action.payload.endDate !== undefined) state.endDate = action.payload.endDate;
      state.page = 1;
    },
    setAmountRange(state, action: PayloadAction<{ minAmount?: string; maxAmount?: string }>) {
      if (action.payload.minAmount !== undefined) state.minAmount = action.payload.minAmount;
      if (action.payload.maxAmount !== undefined) state.maxAmount = action.payload.maxAmount;
      state.page = 1;
    },
    setSort(state, action: PayloadAction<{ sortBy: SortField; order: SortOrder }>) {
      state.sortBy = action.payload.sortBy;
      state.order = action.payload.order;
      state.page = 1;
    },
    setPage(state, action: PayloadAction<number>) {
      state.page = Math.max(1, action.payload);
    },
    setLimit(state, action: PayloadAction<number>) {
      state.limit = action.payload;
      state.page = 1;
    },
    resetFilters(state) {
      // Keep the user's preferred page size
      return { ...initialFiltersState, limit: state.limit };
    },
  },
});

export const {
  setSearch,
  setCategories,
  setPaymentMethods,
  setDateRange,
  setAmountRange,
  setSort,
  setPage,
  setLimit,
  resetFilters,
} = filtersSlice.actions;

export default filtersSlice.reducer;

/* ---------- selectors ---------- */

export const selectFilters = (state: RootState) => state.filters;

/** Number of active filters (search, sort and paging are not counted). */
export const selectActiveFilterCount = createSelector(selectFilters, (f) =>
  [
    f.search.trim(),
    f.categories.length,
    f.paymentMethods.length,
    f.startDate || f.endDate,
    f.minAmount || f.maxAmount,
  ].filter(Boolean).length
);

/** Query string params for GET /api/expenses, with empty values left out. */
export const selectExpenseQueryParams = createSelector(selectFilters, (f) => {
  const params: Record<string, string | number> = {
    sortBy: f.sortBy,
    order: f.order,
    page: f.page,
    limit: f.limit,
  };
  if (f.search.trim()) params.search = f.search.trim();
  if (f.categories.length) params.category = f.categories.join(',');
  if (f.paymentMethods.length) params.paymentMethod = f.paymentMethods.join(',');
  if (f.startDate) params.startDate = f.startDate;
  if (f.endDate) params.endDate = f.endDate;
  if (f.minAmount) params.minAmount = f.minAmount;
  if (f.maxAmount) params.maxAmount = f.maxAmount;
  return params;
});
