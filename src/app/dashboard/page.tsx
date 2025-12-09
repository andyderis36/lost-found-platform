'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';

interface Item {
  id: string;
  name: string;
  category: string;
  description: string;
  status: 'active' | 'found' | 'inactive';
  qrCode: string;
  qrCodeDataUrl?: string;
  image?: string;
  imageUrl?: string;
  customFields?: Record<string, string>;
  createdAt: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'found' | 'inactive'>('all');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchItems();
    }
  }, [user]);

  const fetchItems = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/items', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch items');
      }

      const data = await response.json();
      setItems(data.data.items);
    } catch (err) {
      setError('Failed to load items');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this item?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/items/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete item');
      }

      // Remove from state
      setItems(items.filter(item => item.id !== itemId));
    } catch (err) {
      alert('Failed to delete item');
      console.error(err);
    }
  };

  const filteredItems = filter === 'all' 
    ? (items || [])
    : (items || []).filter(item => item.status === filter);

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

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-indigo-400/30 rounded-full mix-blend-multiply filter blur-xl animate-float"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-400/30 rounded-full mix-blend-multiply filter blur-xl animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-400/30 rounded-full mix-blend-multiply filter blur-xl animate-float" style={{animationDelay: '4s'}}></div>
      </div>

      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
            My Dashboard
          </h1>
          <p className="text-slate-600 text-lg">
            Welcome back, <span className="font-semibold text-indigo-600">{user.name}</span>! Manage your registered items below.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="glass p-6 rounded-2xl hover-glow group cursor-pointer transition-all duration-300 animate-scale-in">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1 font-medium">Total Items</p>
                <p className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{items?.length || 0}</p>
              </div>
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </div>
            </div>
          </div>
          <div className="glass p-6 rounded-2xl hover-glow group cursor-pointer transition-all duration-300 animate-scale-in" style={{animationDelay: '0.1s'}}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1 font-medium">Lost Items</p>
                <p className="text-4xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">{items?.filter(i => i.status === 'active').length || 0}</p>
              </div>
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="glass p-6 rounded-2xl hover-glow group cursor-pointer transition-all duration-300 animate-scale-in" style={{animationDelay: '0.2s'}}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1 font-medium">Found Items</p>
                <p className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{items?.filter(i => i.status === 'found').length || 0}</p>
              </div>
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>
          <div className="glass p-6 rounded-2xl hover-glow group cursor-pointer transition-all duration-300 animate-scale-in" style={{animationDelay: '0.3s'}}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1 font-medium">Inactive Items</p>
                <p className="text-4xl font-bold bg-gradient-to-r from-slate-600 to-gray-600 bg-clip-text text-transparent">{items?.filter(i => i.status === 'inactive').length || 0}</p>
              </div>
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-slate-500 to-gray-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Modern Filter Tabs */}
        <div className="glass p-2 rounded-2xl mb-8 inline-flex gap-2 flex-wrap">
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 relative ${
              filter === 'all'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/50'
                : 'text-slate-700 hover:bg-white/50'
            }`}
          >
            All Items
            {filter === 'all' && (
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full"></div>
            )}
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 relative ${
              filter === 'active'
                ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg shadow-red-500/50'
                : 'text-slate-700 hover:bg-white/50'
            }`}
          >
            Lost
            {filter === 'active' && (
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-gradient-to-r from-red-600 to-orange-600 rounded-full"></div>
            )}
          </button>
          <button
            onClick={() => setFilter('found')}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 relative ${
              filter === 'found'
                ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-500/50'
                : 'text-slate-700 hover:bg-white/50'
            }`}
          >
            Found
            {filter === 'found' && (
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full"></div>
            )}
          </button>
          <button
            onClick={() => setFilter('inactive')}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 relative ${
              filter === 'inactive'
                ? 'bg-gradient-to-r from-slate-600 to-gray-600 text-white shadow-lg shadow-slate-500/50'
                : 'text-slate-700 hover:bg-white/50'
            }`}
          >
            Inactive
            {filter === 'inactive' && (
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-gradient-to-r from-slate-600 to-gray-600 rounded-full"></div>
            )}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="glass-dark border-2 border-red-500/50 bg-red-500/10 text-red-700 px-6 py-4 rounded-2xl mb-6 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Items Grid */}
        {filteredItems.length === 0 ? (
          <div className="glass p-16 rounded-3xl text-center animate-scale-in">
            <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
              No items found
            </h3>
            <p className="text-slate-600 mb-6">
              {filter === 'all' 
                ? 'Start by adding your first item to protect it with a QR code.'
                : `You don't have any ${filter} items yet.`
              }
            </p>
            {filter === 'all' && (
              <Link
                href="/items/new"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-indigo-500/50 transition-all duration-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Your First Item
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item, index) => (
              <div 
                key={item.id} 
                className="glass rounded-2xl overflow-hidden card-hover group animate-scale-in"
                style={{animationDelay: `${index * 0.1}s`}}
              >
                {/* Item Image or QR Code - Square 1:1 */}
                {item.image ? (
                  <div className="relative w-full aspect-square bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                ) : (
                  <div className="w-full aspect-square bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center p-8">
                    <div className="glass-dark p-4 rounded-xl">
                      <img 
                        src={item.qrCodeDataUrl} 
                        alt={`QR Code for ${item.name}`}
                        className="max-w-full max-h-full"
                      />
                    </div>
                  </div>
                )}

                {/* Item Details */}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors duration-300">
                      {item.name}
                    </h3>
                    <span className={`px-3 py-1.5 text-xs font-bold rounded-full backdrop-blur-sm ${
                      item.status === 'active' ? 'bg-red-500/20 text-red-700 ring-2 ring-red-500/50' :
                      item.status === 'found' ? 'bg-green-500/20 text-green-700 ring-2 ring-green-500/50' :
                      'bg-slate-500/20 text-slate-700 ring-2 ring-slate-500/50'
                    }`}>
                      {item.status === 'active' ? 'LOST' : item.status === 'found' ? 'FOUND' : 'INACTIVE'}
                    </span>
                  </div>

                  <p className="text-sm font-medium text-indigo-600 mb-2">
                    {item.category}
                  </p>
                  <p className="text-xs text-slate-500 mb-1 font-mono bg-slate-100 px-2 py-1 rounded inline-block">
                    QR: {item.qrCode}
                  </p>
                  <p className="text-xs text-slate-500 mb-4 flex items-center gap-1 mt-2">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {new Date(item.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-slate-600 mb-6 line-clamp-2">
                    {item.description}
                  </p>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <Link
                      href={`/items/${item.id}`}
                      className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-3 rounded-xl hover:shadow-lg hover:shadow-indigo-500/50 transition-all duration-300 text-center text-sm font-bold flex items-center justify-center gap-2 group/btn"
                    >
                      <svg className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View
                    </Link>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="px-5 py-3 bg-red-500/10 text-red-600 rounded-xl hover:bg-red-500 hover:text-white transition-all duration-300 text-sm font-bold backdrop-blur-sm ring-2 ring-red-500/50 flex items-center justify-center"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <Link
        href="/items/new"
        className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl shadow-2xl hover:shadow-indigo-500/50 flex items-center justify-center group hover:scale-110 transition-all duration-300 z-50 animate-float"
      >
        <svg className="w-8 h-8 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
        </svg>
      </Link>
    </div>
  );
}
