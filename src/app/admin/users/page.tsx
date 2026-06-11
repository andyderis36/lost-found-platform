'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Users, User as UserIcon, Search, RefreshCw, Trash2, Edit2, Check, X, ShieldAlert, ShieldCheck, Mail, Phone, Clock, ArrowLeft, Loader2 } from 'lucide-react';

interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'user' | 'admin';
  emailVerified: boolean;
  createdAt: string;
  itemCount: number;
}

export default function AdminUsers() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'user' | 'admin'>('all');
  const [verificationFilter, setVerificationFilter] = useState<'all' | 'verified' | 'unverified'>('all');
  
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
      } else if (user.role !== 'admin') {
        router.push('/dashboard');
      } else {
        fetchUsers();
      }
    }
  }, [user, authLoading, router, roleFilter, verificationFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (roleFilter !== 'all') params.append('role', roleFilter);
      if (verificationFilter !== 'all') params.append('verified', verificationFilter === 'verified' ? 'true' : 'false');
      if (searchQuery) params.append('search', searchQuery);

      const response = await fetch(`/api/admin/users?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch users');
      }

      setUsers(data.data.users || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchUsers();
  };

  const handleReset = async () => {
    setSearchQuery('');
    setRoleFilter('all');
    setVerificationFilter('all');
    // fetchUsers will be triggered by useEffect dependencies
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    if (deleteConfirm === user?.id) {
      alert('You cannot delete your own account');
      setDeleteConfirm(null);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/users/${deleteConfirm}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete user');
      }

      setDeleteConfirm(null);
      fetchUsers();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete user');
      setDeleteConfirm(null);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: 'user' | 'admin') => {
    if (userId === user?.id) {
      alert('You cannot change your own role');
      setEditingUser(null);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update user role');
      }

      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update user');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col pt-16">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-500">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <p className="text-muted-foreground font-medium text-lg">Loading users...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="min-h-screen bg-muted/30 pt-24 pb-12">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-1">User Management</h1>
            <p className="text-muted-foreground">Manage all user accounts and roles.</p>
          </div>
          <Button variant="outline" onClick={() => router.push('/admin')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <ShieldAlert className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Search and filter through the user base</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="md:col-span-3">
              <Select value={roleFilter} onValueChange={(v: any) => setRoleFilter(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="user">Users</SelectItem>
                  <SelectItem value="admin">Admins</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-3">
              <Select value={verificationFilter} onValueChange={(v: any) => setVerificationFilter(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Verification" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="unverified">Unverified</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2 flex gap-2">
              <Button onClick={handleSearch} className="flex-1">Search</Button>
              <Button variant="outline" onClick={handleReset} size="icon">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-0">
            <CardTitle>Users List</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="rounded-md border border-border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>User Details</TableHead>
                    <TableHead className="hidden md:table-cell">Contact</TableHead>
                    <TableHead>Status & Role</TableHead>
                    <TableHead className="hidden sm:table-cell">Activity</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                        <Users className="w-8 h-8 mx-auto mb-2 opacity-20" />
                        No users found matching your criteria.
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((u) => (
                      <TableRow key={u.id} className={u.id === user.id ? "bg-primary/5" : ""}>
                        <TableCell>
                          <div className="font-semibold flex items-center gap-2">
                            {u.name}
                            {u.id === user.id && <Badge variant="secondary" className="text-xs py-0 h-5">You</Badge>}
                          </div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
                            <Mail className="w-3.5 h-3.5" /> {u.email}
                          </div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1 md:hidden">
                            <Phone className="w-3.5 h-3.5" /> {u.phone || 'No phone'}
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5" /> {u.phone || '-'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-2 items-start">
                            {editingUser?.id === u.id ? (
                              <Select
                                value={editingUser.role}
                                onValueChange={(v) => setEditingUser({ ...editingUser, role: (v ?? 'user') as 'user' | 'admin' })}
                              >
                                <SelectTrigger className="h-8 w-[110px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="user">User</SelectItem>
                                  <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                              </Select>
                            ) : (
                              <Badge variant={u.role === 'admin' ? "default" : "secondary"}>
                                {u.role === 'admin' ? <ShieldCheck className="w-3 h-3 mr-1" /> : <UserIcon className="w-3 h-3 mr-1" />}
                                {u.role}
                              </Badge>
                            )}
                            <Badge variant={u.emailVerified ? "outline" : "destructive"} className="text-[10px]">
                              {u.emailVerified ? 'Verified' : 'Unverified'}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <div className="text-sm font-medium">{u.itemCount} Items</div>
                          <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {new Date(u.createdAt).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {u.id !== user.id && (
                            <div className="flex justify-end gap-2">
                              {editingUser?.id === u.id ? (
                                <>
                                  <Button size="sm" onClick={() => handleUpdateRole(u.id, editingUser.role)} className="h-8 px-2">
                                    <Check className="w-4 h-4 mr-1" /> Save
                                  </Button>
                                  <Button size="sm" variant="ghost" onClick={() => setEditingUser(null)} className="h-8 w-8 p-0">
                                    <X className="w-4 h-4" />
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <Button size="sm" variant="outline" onClick={() => setEditingUser(u)} className="h-8 w-8 p-0">
                                    <Edit2 className="w-4 h-4 text-muted-foreground" />
                                  </Button>
                                  <Button size="sm" variant="outline" onClick={() => setDeleteConfirm(u.id)} className="h-8 w-8 p-0 border-destructive/30 hover:bg-destructive/10">
                                    <Trash2 className="w-4 h-4 text-destructive" />
                                  </Button>
                                </>
                              )}
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Delete Confirmation Alert Dialog */}
        <AlertDialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-destructive flex items-center gap-2">
                <ShieldAlert className="w-5 h-5" /> Confirm Deletion
              </AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this user? This will also permanently delete all their items and scans. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                Delete User
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

      </main>
    </div>
  );
}
