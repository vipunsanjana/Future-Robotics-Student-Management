'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import {
  Search,
  Plus,
  Loader2,
  Trash2,
  Pencil,
  Shield,
  User as UserIcon,
  Mail,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { useUserStore, type User } from '@/stores/user-store';

function formatDate(dateStr: string) {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function UsersPage() {
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.role === 'admin';
  const currentUserId = (session?.user as any)?.id;
  const { users, loading, setSearch, fetchUsers, createUser, updateUser, deleteUser } =
    useUserStore();

  const [searchInput, setSearchInput] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [deleteUserData, setDeleteUserData] = useState<User | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [createForm, setCreateForm] = useState({ name: '', email: '', role: 'manager' });
  const [editForm, setEditForm] = useState({ name: '', role: 'manager' });

  useEffect(() => {
    if (isAdmin) fetchUsers();
  }, [isAdmin, fetchUsers]);

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 300);
    return () => clearTimeout(timer);
  }, [searchInput, setSearch]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name.trim()) return toast.error('Full Name is required');
    if (!createForm.email.trim()) return toast.error('Email Address is required');

    setSaving(true);
    const ok = await createUser(createForm);
    if (ok) {
      toast.success('User pre-registered successfully');
      setCreateOpen(false);
      setCreateForm({ name: '', email: '', role: 'manager' });
    } else {
      toast.error('Failed to create user');
    }
    setSaving(false);
  };

  const openEdit = (user: User) => {
    setEditUser(user);
    setEditForm({ name: user.name, role: user.role });
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;
    if (!editForm.name.trim()) return toast.error('Full Name is required');

    setSaving(true);
    const ok = await updateUser(editUser.id, { name: editForm.name, role: editForm.role });
    if (ok) {
      toast.success('User details updated successfully');
      setEditUser(null);
    } else {
      toast.error('Failed to update user');
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteUserData) return;
    setDeleting(true);
    const ok = await deleteUser(deleteUserData.id);
    if (ok) {
      toast.success('User deleted successfully');
      setDeleteUserData(null);
    } else {
      toast.error('Failed to delete user');
    }
    setDeleting(false);
  };

  if (!isAdmin) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center text-muted-foreground gap-3">
        <Shield className="h-12 w-12 opacity-50 text-destructive" />
        <p className="text-lg font-medium">Access Denied</p>
        <p className="text-sm">Only administrators can manage system users.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">User Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Authorized Google SSO Accounts — {users.length} registered members
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="rounded-xl shadow-md">
          <Plus className="mr-2 h-4 w-4" /> Pre-Register User
        </Button>
      </div>

      <Card className="border-border/60 bg-card/80 backdrop-blur-xl shadow-sm">
        <CardContent className="p-4 sm:p-6">
          <div className="mb-4 relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9 rounded-xl"
            />
          </div>

          {loading ? (
            <div className="flex h-[300px] items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User Profile</TableHead>
                    <TableHead>System Role</TableHead>
                    <TableHead>Auth Method</TableHead>
                    <TableHead>Created Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id} className="hover:bg-secondary/40 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 ring-1 ring-border/50">
                            <AvatarImage src={user.image || ''} alt={user.name} />
                            <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                              {user.name
                                ? user.name
                                    .split(' ')
                                    .map((n) => n[0])
                                    .join('')
                                    .slice(0, 2)
                                    .toUpperCase()
                                : 'US'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-sm">
                              {user.name || 'Pending First Login'}
                              {user.id === currentUserId && (
                                <span className="ml-2 rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                                  You
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant={user.role === 'admin' ? 'default' : 'secondary'}
                          className="gap-1.5 capitalize rounded-lg font-semibold"
                        >
                          {user.role === 'admin' ? (
                            <Shield className="h-3 w-3" />
                          ) : (
                            <UserIcon className="h-3 w-3" />
                          )}
                          {user.role}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-500/10 px-2.5 py-1 text-xs font-semibold text-sky-600 dark:text-sky-400 border border-sky-500/20">
                          Google SSO
                        </span>
                      </TableCell>

                      <TableCell className="text-xs text-muted-foreground font-medium">
                        {formatDate(user.createdAt)}
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 rounded-lg"
                            onClick={() => openEdit(user)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          {user.id !== currentUserId && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 rounded-lg text-destructive hover:bg-destructive/10"
                              onClick={() => setDeleteUserData(user)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pre-Register User Modal */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pre-Register Google Account</DialogTitle>
            <DialogDescription>
              Add an authorized user with their full name and Google email address.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="create-name">Full Name *</Label>
              <Input
                id="create-name"
                value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                placeholder="e.g. Viduranga Jayakody"
                className="rounded-xl"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="create-email">Google Email Address *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="create-email"
                  type="email"
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  placeholder="user@gmail.com"
                  className="pl-9 rounded-xl"
                  required
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="create-role">System Role *</Label>
              <Select
                value={createForm.role}
                onValueChange={(v) => setCreateForm({ ...createForm, role: v })}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Pre-Register User'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog open={!!editUser} onOpenChange={(open) => !open && setEditUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update display name or change assigned role permissions
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="edit-name">Display Name *</Label>
              <Input
                id="edit-name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="rounded-xl"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-role">System Role *</Label>
              <Select
                value={editForm.role}
                onValueChange={(v) => setEditForm({ ...editForm, role: v })}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setEditUser(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <AlertDialog open={!!deleteUserData} onOpenChange={(open) => !open && setDeleteUserData(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Account Access</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove access for{' '}
              <span className="font-bold text-foreground">{deleteUserData?.email}</span>? They will no
              longer be able to log in with Google SSO.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 flex items-center justify-end gap-3">
            <AlertDialogCancel disabled={deleting} className="mt-0">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Remove Access'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}