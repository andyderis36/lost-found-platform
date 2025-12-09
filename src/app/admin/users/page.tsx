'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading, router, roleFilter, verificationFilter]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (roleFilter !== 'all') params.append('role', roleFilter);
      if (verificationFilter !== 'all') params.append('verified', verificationFilter === 'verified' ? 'true' : 'false');
      if (searchQuery) params.append('search', searchQuery);

      const response = await fetch(`/api/admin/users?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch users');
      }

      // API returns { success: true, data: { users: [...], total: ... } }
      setUsers(data.data.users || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load users';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setLoading(true);
    fetchUsers();
  };

  const handleReset = async () => {
    setSearchQuery('');
    setRoleFilter('all');
    setVerificationFilter('all');
    setLoading(true);
    
    // Wait for state updates then fetch with reset filters
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch users');
      }

      setUsers(data.data.users || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load users';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId: string) => {
    if (userId === user?.id) {
      alert('You cannot delete your own account');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete user');
      }

      setDeleteConfirm(null);
      fetchUsers();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete user';
      alert(errorMessage);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: 'user' | 'admin') => {
    if (userId === user?.id) {
      alert('You cannot change your own role');
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

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update user role');
      }

      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update user';
      alert(errorMessage);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
          <div className="absolute top-40 right-20 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="text-center relative z-10">
          <div className="glass p-8 rounded-3xl inline-block">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200 mx-auto"></div>
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-indigo-600 border-r-purple-600 absolute top-0 left-1/2 -translate-x-1/2"></div>
            </div>
            <p className="mt-6 text-slate-700 font-bold text-lg">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 md:py-12 pt-24 md:pt-32 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute -bottom-32 left-1/2 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="mb-8 md:mb-10 animate-scale-in">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent leading-tight pb-1">User Management</h1>
              <p className="text-slate-600 mt-2 text-base sm:text-lg font-semibold">Manage all user accounts</p>
            </div>
            <button
              onClick={() => router.push('/admin')}
              className="glass-dark px-4 sm:px-6 py-3 rounded-xl hover:bg-slate-200/50 transition-all duration-300 text-sm sm:text-base whitespace-nowrap flex items-center gap-2 font-bold text-slate-700 border-2 border-slate-200 hover:border-indigo-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="hidden sm:inline">Back to Admin</span>
              <span className="sm:hidden">Admin</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="glass-dark border-2 border-red-300 text-red-700 px-6 py-4 rounded-2xl mb-6 font-semibold flex items-center gap-3 animate-scale-in">
            <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="glass p-4 sm:p-6 md:p-8 rounded-3xl mb-8 animate-scale-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            {/* Search Input */}
            <div className="sm:col-span-2 lg:col-span-1">
              <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Search
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Name or email..."
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-slate-900 font-semibold glass-dark transition-all duration-300"
              />
            </div>

            {/* Role Filter */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                Role
              </label>
              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value as 'all' | 'user' | 'admin');
                }}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 text-slate-900 font-bold glass-dark transition-all duration-300"
              >
                <option value="all">All Role</option>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {/* Verification Filter */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Verification
              </label>
              <select
                value={verificationFilter}
                onChange={(e) => {
                  setVerificationFilter(e.target.value as 'all' | 'verified' | 'unverified');
                }}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-200 text-slate-900 font-bold glass-dark transition-all duration-300"
              >
                <option value="all">All Status</option>
                <option value="verified">Verified</option>
                <option value="unverified">Unverified</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 sm:col-span-2 lg:col-span-1">
              <button
                onClick={handleSearch}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:shadow-lg hover:shadow-indigo-500/50 transition-all duration-300 font-bold"
              >
                Search
              </button>
              <button
                onClick={handleReset}
                className="flex-1 glass-dark text-slate-700 px-6 py-3 rounded-xl hover:bg-slate-200/50 transition-all duration-300 font-bold border-2 border-slate-200"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="glass rounded-3xl overflow-hidden animate-scale-in">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="glass-dark">
                <tr>
                  <th className="px-4 md:px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-4 md:px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider hidden lg:table-cell">
                    Contact
                  </th>
                  <th className="px-4 md:px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 md:px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider hidden sm:table-cell">
                    Items
                  </th>
                  <th className="px-4 md:px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider hidden md:table-cell">
                    Joined
                  </th>
                  <th className="px-4 md:px-6 py-4 text-right text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {users.map((u) => (
                  <tr key={u.id} className={u.id === user.id ? 'glass-dark' : 'hover:bg-slate-50/50 transition-colors duration-200'}>
                    <td className="px-4 md:px-6 py-4">
                      <div className="text-sm font-bold text-slate-900">
                        {u.name}
                        {u.id === user.id && (
                          <span className="ml-2 text-xs bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-2 py-1 rounded-full">(You)</span>
                        )}
                      </div>
                      <div className="text-sm text-slate-600 truncate max-w-[200px]">{u.email}</div>
                      <div className="text-sm text-slate-500 mt-1 lg:hidden">
                        {u.phone || '-'}
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-slate-600 hidden lg:table-cell">
                      {u.phone || '-'}
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <div className="flex flex-col gap-2">
                        {editingUser?.id === u.id ? (
                          <select
                            value={editingUser.role}
                            onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as 'user' | 'admin' })}
                            className="text-sm border-2 border-indigo-300 rounded-lg px-3 py-1.5 text-slate-900 font-bold glass-dark focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                          </select>
                        ) : (
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-lg w-fit ${
                            u.role === 'admin' 
                              ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow' 
                              : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow'
                          }`}>
                            {u.role}
                          </span>
                        )}
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-lg w-fit ${
                          u.emailVerified 
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow' 
                            : 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow'
                        }`}>
                          {u.emailVerified ? 'Verified' : 'Unverified'}
                        </span>
                      </div>
                      <div className="text-sm text-slate-600 mt-2 sm:hidden font-bold">
                        {u.itemCount} items
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-slate-700 font-bold hidden sm:table-cell">
                      {u.itemCount}
                    </td>
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-slate-600 hidden md:table-cell">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap text-right text-sm font-bold">
                      {u.id === user.id ? (
                        <span className="text-slate-400">-</span>
                      ) : editingUser?.id === u.id ? (
                        <div className="flex flex-col sm:flex-row gap-2 justify-end">
                          <button
                            onClick={() => handleUpdateRole(u.id, editingUser.role)}
                            className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-lg hover:shadow-lg hover:shadow-green-500/50 transition-all duration-300 text-xs"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingUser(null)}
                            className="glass-dark text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-200/50 transition-all duration-300 border-2 border-slate-200 text-xs"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col sm:flex-row gap-2 justify-end">
                          <button
                            onClick={() => setEditingUser(u)}
                            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:shadow-lg hover:shadow-indigo-500/50 transition-all duration-300 text-xs"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(u.id)}
                            className="bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2 rounded-lg hover:shadow-lg hover:shadow-red-500/50 transition-all duration-300 text-xs"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {users.length === 0 && (
            <div className="text-center py-16">
              <svg className="w-20 h-20 mx-auto mb-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <p className="text-slate-600 font-bold text-lg">No users found</p>
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-scale-in">
            <div className="glass p-8 rounded-3xl max-w-md w-full shadow-2xl border-2 border-slate-200">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-gradient-to-br from-red-500 to-red-600 p-3 rounded-xl">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">Confirm Delete</h3>
              </div>
              <p className="text-slate-700 mb-8 leading-relaxed">
                Are you sure you want to delete this user? This will also delete all their items and scans. This action cannot be undone.
              </p>
              <div className="flex flex-col sm:flex-row justify-end gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="glass-dark px-6 py-3 rounded-xl hover:bg-slate-200/50 transition-all duration-300 font-bold text-slate-700 border-2 border-slate-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-xl hover:shadow-lg hover:shadow-red-500/50 transition-all duration-300 font-bold"
                >
                  Delete User
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
