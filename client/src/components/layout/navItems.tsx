import type { ReactElement } from 'react';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded';
import CategoryRoundedIcon from '@mui/icons-material/CategoryRounded';

export interface NavItem {
  label: string;
  to: string;
  icon: ReactElement;
}

export const userNavItems: NavItem[] = [
  { label: 'Dashboard', to: '/', icon: <DashboardRoundedIcon /> },
  { label: 'Expenses', to: '/expenses', icon: <ReceiptLongRoundedIcon /> },
  { label: 'Budget', to: '/budget', icon: <AccountBalanceWalletRoundedIcon /> },
];

export const adminNavItems: NavItem[] = [
  { label: 'Insights', to: '/admin', icon: <InsightsRoundedIcon /> },
  { label: 'Categories', to: '/admin/categories', icon: <CategoryRoundedIcon /> },
];
