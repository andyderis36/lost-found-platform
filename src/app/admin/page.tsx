'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

interface Stats {
  users: {
    total: number;
    regular: number;
    admins: number;
  };
  items: {
    total: number;
    active: number;
    found: number;
    inactive: number;
    byCategory: Array<{ category: string; count: number }>;
  };
  scans: {
    total: number;
    perDay: Array<{ date: string; count: number }>;
    recent: Array<{
      id: string;
      scannerName: string;
      item: { name: string; qrCode: string } | null;
      scannedAt: string;
    }>;
  };
}

export default function AdminDashboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
      } else if (user.role !== 'admin') {
        router.push('/dashboard');
      } else {
        fetchStats();
      }
    }
  }, [user, authLoading, router]);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch statistics');
      }

      setStats(data.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load statistics';
      setError(errorMessage);
    } finally {
      setLoading(false);
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

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="glass-dark border-2 border-red-300 text-red-700 px-6 py-4 rounded-2xl font-semibold flex items-center gap-3">
            <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 pt-28 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute -bottom-32 left-1/2 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="mb-10 animate-scale-in">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3 leading-tight pb-1">Admin Dashboard</h1>
          <p className="text-slate-600 text-lg font-semibold">Platform statistics and management</p>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 animate-scale-in">
          <Link
            href="/admin/users"
            className="glass p-8 rounded-2xl card-hover group"
          >
            <div className="flex items-center gap-4 mb-3">
              <div className="glass-dark p-3 rounded-xl group-hover:bg-indigo-100 transition-colors duration-300">
                <svg className="w-7 h-7 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900">Manage Users</h3>
            </div>
            <p className="text-slate-600">View, edit, and delete user accounts</p>
          </Link>
          <Link
            href="/admin/items"
            className="glass p-8 rounded-2xl card-hover group"
          >
            <div className="flex items-center gap-4 mb-3">
              <div className="glass-dark p-3 rounded-xl group-hover:bg-purple-100 transition-colors duration-300">
                <svg className="w-7 h-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900">Manage Items</h3>
            </div>
            <p className="text-slate-600">View and manage all items</p>
          </Link>
          <Link
            href="/dashboard"
            className="glass p-8 rounded-2xl card-hover group"
          >
            <div className="flex items-center gap-4 mb-3">
              <div className="glass-dark p-3 rounded-xl group-hover:bg-pink-100 transition-colors duration-300">
                <svg className="w-7 h-7 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900">User Dashboard</h3>
            </div>
            <p className="text-slate-600">Switch to user view</p>
          </Link>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10 animate-scale-in">
          <div className="glass p-6 rounded-2xl card-hover">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-4 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-600 uppercase tracking-wide">Total Users</p>
                <p className="text-3xl font-bold text-slate-900">{stats?.users.total || 0}</p>
                <p className="text-xs text-slate-500 font-semibold">{stats?.users.admins || 0} admins</p>
              </div>
            </div>
          </div>

          <div className="glass p-6 rounded-2xl card-hover">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-600 uppercase tracking-wide">Total Items</p>
                <p className="text-3xl font-bold text-slate-900">{stats?.items.total || 0}</p>
                <p className="text-xs text-slate-500 font-semibold">{stats?.items.active || 0} active</p>
              </div>
            </div>
          </div>

          <div className="glass p-6 rounded-2xl card-hover">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-4 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-600 uppercase tracking-wide">Found Items</p>
                <p className="text-3xl font-bold text-slate-900">{stats?.items.found || 0}</p>
              </div>
            </div>
          </div>

          <div className="glass p-6 rounded-2xl card-hover">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl p-4 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-600 uppercase tracking-wide">Total Scans</p>
                <p className="text-3xl font-bold text-slate-900">{stats?.scans.total || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Items by Category */}
        <div className="glass p-8 rounded-3xl mb-10 animate-scale-in">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6">Items by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {stats?.items.byCategory.map((cat) => (
              <div key={cat.category} className="glass-dark p-6 rounded-2xl border border-slate-200 hover:border-indigo-300 transition-all duration-300 card-hover">
                <p className="text-sm text-slate-600 font-bold uppercase tracking-wide mb-2">{cat.category}</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{cat.count}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Scans */}
        <div className="glass p-8 rounded-3xl animate-scale-in">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6 flex items-center gap-3">
            <svg className="w-7 h-7 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Recent Scans
          </h2>
          {stats?.scans.recent && stats.scans.recent.length > 0 ? (
            <div className="space-y-4">
              {stats.scans.recent.map((scan) => (
                <div key={scan.id} className="glass-dark border border-slate-200 rounded-2xl p-5 hover:border-indigo-300 transition-all duration-300">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <p className="font-bold text-slate-900 text-lg mb-1">{scan.scannerName}</p>
                      {scan.item && (
                        <p className="text-sm text-slate-600 flex items-center gap-2">
                          <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                          <span><strong>Item:</strong> {scan.item.name} ({scan.item.qrCode})</span>
                        </p>
                      )}
                    </div>
                    <div className="glass px-4 py-2 rounded-lg">
                      <p className="text-xs text-slate-600 font-bold flex items-center gap-2 whitespace-nowrap">
                        <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {new Date(scan.scannedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-dark p-8 rounded-2xl text-center border border-slate-200">
              <svg className="w-16 h-16 mx-auto mb-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-slate-600 font-semibold">No scans yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
