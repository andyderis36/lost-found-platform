'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            My Dashboard
          </h1>
          <p className="text-gray-600">
            Welcome back, {user.name}! Manage your registered items below.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-blue-600 mb-1">
              {items?.length || 0}
            </div>
            <div className="text-gray-600 text-sm">Total Items</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-red-600 mb-1">
              {items?.filter(i => i.status === 'active').length || 0}
            </div>
            <div className="text-gray-600 text-sm font-semibold">Lost Items</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-green-600 mb-1">
              {items?.filter(i => i.status === 'found').length || 0}
            </div>
            <div className="text-gray-600 text-sm font-semibold">Found Items</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-gray-600 mb-1">
              {items?.filter(i => i.status === 'inactive').length || 0}
            </div>
            <div className="text-gray-600 text-sm">Inactive</div>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="bg-white rounded-lg shadow p-4 mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({items?.length || 0})
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                filter === 'active'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Lost ({items?.filter(i => i.status === 'active').length || 0})
            </button>
            <button
              onClick={() => setFilter('found')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                filter === 'found'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Found ({items?.filter(i => i.status === 'found').length || 0})
            </button>
            <button
              onClick={() => setFilter('inactive')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'inactive'
                  ? 'bg-gray-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Inactive ({items?.filter(i => i.status === 'inactive').length || 0})
            </button>
          </div>

          <Link
            href="/items/new"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            + Add New Item
          </Link>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Items Grid */}
        {filteredItems.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No items found
            </h3>
            <p className="text-gray-600 mb-6">
              {filter === 'all' 
                ? 'Start by adding your first item to protect it with a QR code.'
                : `You don't have any ${filter} items yet.`
              }
            </p>
            {filter === 'all' && (
              <Link
                href="/items/new"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-block"
              >
                Add Your First Item
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden">
                {/* Item Image or QR Code - Square 1:1 */}
                {item.image ? (
                  <div className="w-full aspect-square bg-white p-4">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                ) : (
                  <div className="w-full aspect-square bg-gray-50 flex items-center justify-center p-6">
                    <img 
                      src={item.qrCodeDataUrl} 
                      alt={`QR Code for ${item.name}`}
                      className="max-w-full max-h-full"
                    />
                  </div>
                )}

                {/* Item Details */}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-bold text-gray-900">
                      {item.name}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                      item.status === 'active' ? 'bg-red-100 text-red-800' :
                      item.status === 'found' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {item.status === 'active' ? 'LOST' : item.status === 'found' ? 'FOUND' : 'INACTIVE'}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Category:</strong> {item.category}
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>QR Code:</strong> {item.qrCode}
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    Created: {new Date(item.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-gray-700 mb-4 line-clamp-2">
                    {item.description}
                  </p>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link
                      href={`/items/${item.id}`}
                      className="flex-1 bg-blue-600 text-white text-center py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                      View Details
                    </Link>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="px-4 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
