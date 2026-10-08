import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router';
import ProtectedRoute from './ProtectedRoute';
import GuestRoute from './GuestRoute';
import AppLayout from '../components/layout/AppLayout';
import FullPageLoader from '../components/common/FullPageLoader';

// Pages are loaded on demand so the initial bundle stays small
const LoginPage = lazy(() => import('../pages/LoginPage'));
const RegisterPage = lazy(() => import('../pages/RegisterPage'));
const DashboardPage = lazy(() => import('../pages/DashboardPage'));
const ExpensesPage = lazy(() => import('../pages/ExpensesPage'));
const ExpenseDetailsPage = lazy(() => import('../pages/ExpenseDetailsPage'));
const ExpenseFormPage = lazy(() => import('../pages/ExpenseFormPage'));
const BudgetPage = lazy(() => import('../pages/BudgetPage'));
const AdminDashboardPage = lazy(() => import('../pages/admin/AdminDashboardPage'));
const AdminCategoriesPage = lazy(() => import('../pages/admin/AdminCategoriesPage'));
const ForbiddenPage = lazy(() => import('../pages/ForbiddenPage'));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'));

export default function AppRoutes() {
  return (
    <Suspense fallback={<FullPageLoader />}>
      <Routes>
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/expenses" element={<ExpensesPage />} />
            <Route path="/expenses/new" element={<ExpenseFormPage />} />
            <Route path="/expenses/:id" element={<ExpenseDetailsPage />} />
            <Route path="/expenses/:id/edit" element={<ExpenseFormPage />} />
            <Route path="/budget" element={<BudgetPage />} />
            <Route path="/forbidden" element={<ForbiddenPage />} />

            <Route element={<ProtectedRoute roles={['admin']} />}>
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route path="/admin/categories" element={<AdminCategoriesPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
