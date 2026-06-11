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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Platform statistics and management</p>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link
            href="/admin/users"
            className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">👥 Manage Users</h3>
            <p className="text-gray-600 text-sm">View, edit, and delete user accounts</p>
          </Link>
          <Link
            href="/admin/items"
            className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">📦 Manage Items</h3>
            <p className="text-gray-600 text-sm">View and manage all items</p>
          </Link>
          <Link
            href="/dashboard"
            className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">🏠 User Dashboard</h3>
            <p className="text-gray-600 text-sm">Switch to user view</p>
          </Link>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                <span className="text-2xl">👥</span>
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.users.total || 0}</p>
                <p className="text-xs text-gray-500">{stats?.users.admins || 0} admins</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                <span className="text-2xl">📦</span>
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">Total Items</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.items.total || 0}</p>
                <p className="text-xs text-gray-500">{stats?.items.active || 0} active</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
                <span className="text-2xl">✨</span>
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">Found Items</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.items.found || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
                <span className="text-2xl">📱</span>
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">Total Scans</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.scans.total || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Items by Category */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Items by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats?.items.byCategory.map((cat) => (
              <div key={cat.category} className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">{cat.category}</p>
                <p className="text-2xl font-bold text-gray-900">{cat.count}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Scans */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Scans</h2>
          {stats?.scans.recent && stats.scans.recent.length > 0 ? (
            <div className="space-y-4">
              {stats.scans.recent.map((scan) => (
                <div key={scan.id} className="border-b border-gray-200 pb-4 last:border-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-900">{scan.scannerName}</p>
                      {scan.item && (
                        <p className="text-sm text-gray-600">
                          Item: {scan.item.name} ({scan.item.qrCode})
                        </p>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      {new Date(scan.scannedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No scans yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
