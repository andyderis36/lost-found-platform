'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

interface Item {
  id: string;
  name: string;
  category: string;
  status: 'active' | 'found' | 'inactive';
  qrCode: string;
  image?: string;
  owner: {
    id: string;
    name: string;
    email: string;
  } | null;
  createdAt: string;
}

export default function AdminItems() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'found' | 'inactive'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [userFilter, setUserFilter] = useState('');

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
      } else if (user.role !== 'admin') {
        router.push('/dashboard');
      } else {
        fetchItems();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading, router]);

  const fetchItems = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (categoryFilter !== 'all') params.append('category', categoryFilter);
      if (userFilter) params.append('userId', userFilter);

      const response = await fetch(`/api/admin/items?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch items');
      }

      // API returns { success: true, data: { items: [...], total: ... } }
      setItems(data.data.items || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load items';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    setLoading(true);
    fetchItems();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-red-100 text-red-800';
      case 'found':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
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

  const categories = ['Electronics', 'Documents', 'Accessories', 'Clothing', 'Keys', 'Bags', 'Other'];

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
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent leading-tight pb-1">Item Management</h1>
              <p className="text-slate-600 mt-2 text-base sm:text-lg font-semibold">View all items across all users</p>
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
        <div className="glass p-6 md:p-8 rounded-3xl mb-8 animate-scale-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'found' | 'inactive')}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-slate-900 font-bold glass-dark transition-all duration-300"
              >
                <option value="all">All Status</option>
                <option value="active">Lost</option>
                <option value="found">Found</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                Category
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 text-slate-900 font-bold glass-dark transition-all duration-300"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                User ID
              </label>
              <input
                type="text"
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
                placeholder="Filter by user ID..."
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-200 text-slate-900 font-semibold glass-dark transition-all duration-300"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleFilter}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:shadow-lg hover:shadow-indigo-500/50 transition-all duration-300 font-bold"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-scale-in">
          {items.map((item) => (
            <div key={item.id} className="glass rounded-2xl card-hover overflow-hidden group">
              {/* Image Thumbnail - Square 1:1 */}
              {item.image && (
                <div className="w-full aspect-square glass-dark p-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover rounded-xl shadow-lg transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              )}
              
              <div className="p-6">
                {/* Item Header */}
                <div className="flex justify-between items-start mb-4 gap-3">
                  <h3 className="text-lg font-bold text-slate-900 line-clamp-2">{item.name}</h3>
                  <span className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wide rounded-lg shadow-lg whitespace-nowrap ${
                    item.status === 'active' ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white' :
                    item.status === 'found' ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' :
                    'glass-dark text-slate-700 border-2 border-slate-200'
                  }`}>
                    {item.status === 'active' ? 'LOST' : item.status === 'found' ? 'FOUND' : 'INACTIVE'}
                  </span>
                </div>

                {/* Item Details */}
                <div className="space-y-3 mb-5">
                  <div className="glass-dark p-3 rounded-xl border border-slate-200">
                    <p className="text-xs text-slate-500 font-bold uppercase mb-1">Category</p>
                    <p className="text-sm text-slate-900 font-bold">{item.category}</p>
                  </div>
                  <div className="glass-dark p-3 rounded-xl border border-slate-200">
                    <p className="text-xs text-slate-500 font-bold uppercase mb-1">QR Code</p>
                    <p className="text-sm text-slate-900 font-mono font-bold">{item.qrCode}</p>
                  </div>
                  {item.owner && (
                    <div className="glass-dark p-3 rounded-xl border border-slate-200">
                      <p className="text-xs text-slate-500 font-bold uppercase mb-1">Owner</p>
                      <p className="text-sm text-slate-900 font-bold">{item.owner.name}</p>
                      <p className="text-xs text-slate-600 truncate">{item.owner.email}</p>
                    </div>
                  )}
                  <p className="text-xs text-slate-500 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Created: {new Date(item.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href={`/items/${item.id}`}
                    className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-center px-4 py-3 rounded-xl hover:shadow-lg hover:shadow-indigo-500/50 transition-all duration-300 font-bold text-sm"
                  >
                    View Details
                  </Link>
                  <Link
                    href={`/scan/${item.qrCode}`}
                    className="flex-1 glass-dark text-slate-700 text-center px-4 py-3 rounded-xl hover:bg-slate-200/50 transition-all duration-300 font-bold text-sm border-2 border-slate-200"
                  >
                    QR Page
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {items.length === 0 && (
          <div className="glass rounded-3xl p-16 text-center animate-scale-in">
            <svg className="w-24 h-24 mx-auto mb-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <p className="text-slate-600 font-bold text-xl">No items found</p>
            <p className="text-slate-500 mt-2">Try adjusting your filters</p>
          </div>
        )}

        {/* Summary */}
        {items.length > 0 && (
          <div className="mt-8 glass p-6 rounded-2xl animate-scale-in">
            <p className="text-sm text-slate-700 font-bold flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Showing <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{items.length}</span> item{items.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
