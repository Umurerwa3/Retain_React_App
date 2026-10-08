import type { ReactNode } from 'react';
import {
  Alert,
  Avatar,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import PageHeader from '../../components/common/PageHeader';
import EmptyState from '../../components/common/EmptyState';
import StatCard from '../../components/dashboard/StatCard';
import CategoryChip from '../../components/expenses/CategoryChip';
import CategoryUsageList from '../../components/admin/CategoryUsageList';
import CategorySpendingChart from '../../components/admin/CategorySpendingChart';
import { useFetch } from '../../hooks/useFetch';
import { adminApi } from '../../api/adminApi';
import { formatCurrency, formatDate, formatDateTime, formatMonth, currentMonthValue } from '../../utils/format';

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" component="h2" gutterBottom>
          {title}
        </Typography>
        {children}
      </CardContent>
    </Card>
  );
}

export default function AdminDashboardPage() {
  const { data, loading, error, refetch } = useFetch((signal) => adminApi.insights(signal), []);

  return (
    <>
      <PageHeader
        title="Platform insights"
        subtitle="An overview of activity across all Retain users."
        actions={
          <Button onClick={refetch} disabled={loading} variant="outlined">
            Refresh
          </Button>
        }
      />

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading && !data && (
        <Grid container spacing={2}>
          {[0, 1, 2, 3].map((i) => (
            <Grid key={i} size={{ xs: 12, sm: 6, lg: 3 }}>
              <Skeleton variant="rounded" height={110} />
            </Grid>
          ))}
        </Grid>
      )}

      {data && (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard label="Registered users" value={data.totalUsers} icon={<PeopleAltRoundedIcon />} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard label="Expenses recorded" value={data.totalExpenses} icon={<ReceiptLongRoundedIcon />} color="secondary" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard label="Total value recorded" value={formatCurrency(data.totalValue)} icon={<PaymentsRoundedIcon />} color="success" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard
              label="Expenses this month"
              value={data.expensesThisMonth}
              caption={formatMonth(currentMonthValue())}
              icon={<CalendarMonthRoundedIcon />}
              color="info"
            />
          </Grid>

          <Grid size={12}>
            <Section title="Total spending per category">
              <CategorySpendingChart data={data.spendingPerCategory} />
            </Section>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Section title="Top 5 most-used categories">
              <CategoryUsageList data={data.topCategories} />
            </Section>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Section title="Bottom 5 least-used categories">
              <CategoryUsageList data={data.bottomCategories} />
            </Section>
          </Grid>

          <Grid size={{ xs: 12, lg: 8 }}>
            <Section title="Recently added expenses">
              {data.recentExpenses.length === 0 ? (
                <EmptyState title="No expenses recorded yet" />
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Expense</TableCell>
                        <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>User</TableCell>
                        <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Category</TableCell>
                        <TableCell align="right">Amount</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {data.recentExpenses.map((e) => (
                        <TableRow key={e._id}>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {e.title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatDate(e.date)}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                            {e.user?.name ?? 'Deleted user'}
                          </TableCell>
                          <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                            <CategoryChip category={e.category} />
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
                            {formatCurrency(e.amount)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Section>
          </Grid>

          <Grid size={{ xs: 12, lg: 4 }}>
            <Section title="Recently registered users">
              <List dense disablePadding>
                {data.recentUsers.map((u) => (
                  <ListItem key={u._id} disableGutters>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36, fontSize: 14 }}>
                        {u.name.charAt(0).toUpperCase()}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={u.name}
                      secondary={`${u.email} · ${formatDateTime(u.createdAt)}`}
                      slotProps={{ secondary: { noWrap: true } }}
                      sx={{ minWidth: 0 }}
                    />
                    {u.role === 'admin' && <Chip label="admin" size="small" color="secondary" />}
                  </ListItem>
                ))}
              </List>
            </Section>
          </Grid>
        </Grid>
      )}
    </>
  );
}
