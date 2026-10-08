/* Domain types shared across the app. They mirror the shapes returned by the Retain API. */

export type Role = 'user' | 'admin';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Credentials {
  email: string;
  password: string;
}

export interface SignUpData extends Credentials {
  name: string;
}

export interface Category {
  _id: string;
  name: string;
  description: string;
  color: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export type CategoryInput = Pick<Category, 'name' | 'description' | 'color'>;

export const PAYMENT_METHODS = [
  'cash',
  'credit_card',
  'debit_card',
  'mobile_money',
  'bank_transfer',
  'other',
] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export interface Expense {
  _id: string;
  user: string;
  title: string;
  amount: number;
  category: Category;
  /** ISO date string */
  date: string;
  paymentMethod: PaymentMethod;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

/** Payload for creating or updating an expense: category is sent as an id. */
export interface ExpenseInput {
  title: string;
  amount: number;
  category: string;
  date: string;
  paymentMethod: PaymentMethod;
  notes?: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ExpenseListResponse {
  expenses: Expense[];
  pagination: Pagination;
  totalAmount: number;
}

export type SortField = 'date' | 'amount';
export type SortOrder = 'asc' | 'desc';

export type BudgetStatus = 'within' | 'approaching' | 'over' | 'no_budget';

export interface BudgetSummary {
  /** YYYY-MM */
  month: string;
  budget: number;
  hasBudget: boolean;
  spent: number;
  remaining: number;
  percentUsed: number;
  expenseCount: number;
  status: BudgetStatus;
}

export interface Budget {
  _id: string;
  month: string;
  amount: number;
}

export interface CategorySpending {
  categoryId: string;
  name: string;
  color: string;
  total: number;
  count: number;
}

export interface DailySpending {
  date: string;
  total: number;
}

export interface DashboardData {
  month: string;
  totalSpent: number;
  expenseCount: number;
  budget: BudgetSummary;
  highestExpense: Expense | null;
  spendingByCategory: CategorySpending[];
  dailySpending: DailySpending[];
  recentExpenses: Expense[];
}

/** Expense as returned to admins, with the owner populated. */
export interface AdminExpense extends Omit<Expense, 'user'> {
  user: Pick<User, '_id' | 'name' | 'email'> | null;
}

export interface AdminInsights {
  totalUsers: number;
  totalExpenses: number;
  totalValue: number;
  expensesThisMonth: number;
  spendingPerCategory: CategorySpending[];
  topCategories: CategorySpending[];
  bottomCategories: CategorySpending[];
  recentExpenses: AdminExpense[];
  recentUsers: User[];
}

export interface ApiErrorBody {
  message: string;
  details?: Record<string, string>;
}
