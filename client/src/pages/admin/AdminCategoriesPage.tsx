import { useState } from 'react';
import {
  Alert,
  Avatar,
  Button,
  Card,
  Chip,
  IconButton,
  LinearProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Stack,
  Tooltip,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import CategoryRoundedIcon from '@mui/icons-material/CategoryRounded';
import PageHeader from '../../components/common/PageHeader';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import CategoryDialog from '../../components/admin/CategoryDialog';
import { useCategories } from '../../hooks/useCategories';
import { useNotify } from '../../hooks/useNotify';
import { categoryApi } from '../../api/categoryApi';
import { getErrorMessage } from '../../api/client';
import type { Category, CategoryInput } from '../../types';

export default function AdminCategoriesPage() {
  const notify = useNotify();
  const { categories, loading, error, refetch } = useCategories();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [toDelete, setToDelete] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (category: Category) => {
    setEditing(category);
    setDialogOpen(true);
  };

  const handleSave = async (data: CategoryInput) => {
    try {
      if (editing) await categoryApi.update(editing._id, data);
      else await categoryApi.create(data);
    } catch (err) {
      throw new Error(getErrorMessage(err));
    }
    notify(editing ? 'Category updated' : 'Category created');
    setDialogOpen(false);
    refetch();
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      const result = await categoryApi.remove(toDelete._id);
      notify(result.message);
      refetch();
    } catch (err) {
      notify(getErrorMessage(err), 'error');
    } finally {
      setDeleting(false);
      setToDelete(null);
    }
  };

  return (
    <>
      <PageHeader
        title="Categories"
        subtitle="Manage the expense categories available to all users."
        actions={
          <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={openCreate}>
            New category
          </Button>
        }
      />

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Card>
        {loading && <LinearProgress />}
        <List disablePadding>
          {categories.map((c) => (
            <ListItem
              key={c._id}
              divider
              secondaryAction={
                <Stack direction="row" spacing={0.5}>
                  <Tooltip title="Edit">
                    <IconButton aria-label={`Edit ${c.name}`} onClick={() => openEdit(c)}>
                      <EditRoundedIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={c.isDefault ? 'The default category cannot be deleted' : 'Delete'}>
                    <span>
                      <IconButton
                        aria-label={`Delete ${c.name}`}
                        onClick={() => setToDelete(c)}
                        disabled={c.isDefault}
                        color="error"
                      >
                        <DeleteOutlineRoundedIcon />
                      </IconButton>
                    </span>
                  </Tooltip>
                </Stack>
              }
              sx={{ pr: 14 }}
            >
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: `${c.color}22`, color: c.color }}>
                  <CategoryRoundedIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <span>{c.name}</span>
                    {c.isDefault && <Chip label="Default" size="small" />}
                  </Stack>
                }
                secondary={c.description || 'No description'}
              />
            </ListItem>
          ))}
        </List>
      </Card>

      <CategoryDialog open={dialogOpen} category={editing} onClose={() => setDialogOpen(false)} onSave={handleSave} />

      <ConfirmDialog
        open={Boolean(toDelete)}
        title={`Delete "${toDelete?.name ?? ''}"?`}
        message="Any expenses in this category will be moved to Uncategorized. This cannot be undone."
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => setToDelete(null)}
      />
    </>
  );
}
