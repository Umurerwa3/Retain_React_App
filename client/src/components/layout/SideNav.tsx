import { NavLink, useLocation } from 'react-router';
import { List, ListItemButton, ListItemIcon, ListItemText, ListSubheader, Toolbar, Stack, Typography, Divider } from '@mui/material';
import SavingsRoundedIcon from '@mui/icons-material/SavingsRounded';
import { useAuth } from '../../hooks/useAuth';
import { adminNavItems, userNavItems, type NavItem } from './navItems';

interface SideNavProps {
  onNavigate?: () => void;
}

export default function SideNav({ onNavigate }: SideNavProps) {
  const { isAdmin } = useAuth();
  const { pathname } = useLocation();

  // "/" and "/admin" should only be active on exact match; others also match nested paths
  const isActive = (to: string) =>
    to === '/' || to === '/admin' ? pathname === to : pathname === to || pathname.startsWith(`${to}/`);

  const renderItems = (items: NavItem[]) =>
    items.map((item) => (
      <ListItemButton
        key={item.to}
        component={NavLink}
        to={item.to}
        selected={isActive(item.to)}
        onClick={onNavigate}
        sx={{ borderRadius: 2, mx: 1, mb: 0.5 }}
      >
        <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
        <ListItemText primary={item.label} />
      </ListItemButton>
    ));

  return (
    <>
      <Toolbar>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <SavingsRoundedIcon color="primary" />
          <Typography variant="h6" color="primary">
            Retain
          </Typography>
        </Stack>
      </Toolbar>
      <Divider />
      <List component="nav" aria-label="Main navigation" sx={{ pt: 1 }}>
        {renderItems(userNavItems)}
      </List>
      {isAdmin && (
        <List
          component="nav"
          aria-label="Admin navigation"
          subheader={<ListSubheader sx={{ bgcolor: 'transparent' }}>Admin</ListSubheader>}
        >
          {renderItems(adminNavItems)}
        </List>
      )}
    </>
  );
}
