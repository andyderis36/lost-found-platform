'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface Item {
  _id: string;
  name: string;
  category: string;
  description: string;
  status: 'active' | 'found' | 'inactive';
  qrCode: string;
  qrCodeDataUrl: string;
  image?: string;
  imageUrl?: string;
  customFields?: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

interface Scan {
  id: string;
  scannerName: string;
  scannerEmail?: string;
  scannerPhone?: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  message?: string;
  scannedAt: string;
}

export default function ItemDetailPage() {
  const router = useRouter();
  const params = useParams();
  const itemId = params.id as string;
  const { user, loading: authLoading } = useAuth();

  const [item, setItem] = useState<Item | null>(null);
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({ status: '' });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && itemId) {
      fetchItemDetails();
      fetchScans();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, itemId]);

  const fetchItemDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/items/${itemId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        throw new Error(errorData.error || 'Failed to fetch item details');
      }

      const data = await response.json();
      setItem(data.data);
      setEditData({ status: data.data.status });
    } catch (err) {
      setError('Failed to load item details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchScans = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/scans/${itemId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setScans(data.data.scans || []);
      }
    } catch (err) {
      console.error('Failed to fetch scans:', err);
      setScans([]);
    }
  };

  const handleDownloadQR = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/items/${itemId}/qr`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to download QR code');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${item?.qrCode}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert('Failed to download QR code');
      console.error(err);
    }
  };

  const handleUpdateStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/items/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: editData.status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update item');
      }

      // Refresh item data to show updated status
      await fetchItemDetails();
      setEditMode(false);
      
      // Show success message
      alert('Item status updated successfully!');
    } catch (err) {
      alert('Failed to update item status');
      console.error(err);
    }
  };

  const handleDeleteItem = async () => {
    if (!confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
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

      router.push('/dashboard');
    } catch (err) {
      alert('Failed to delete item');
      console.error(err);
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

  if (!user || !item) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:underline mb-4 inline-block cursor-pointer bg-transparent border-none"
          >
            ← Back
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Column - QR Code & Actions */}
          <div>
            <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">
                QR Code
              </h2>
              <div className="flex justify-center mb-6">
                <img 
                  src={item.qrCodeDataUrl} 
                  alt={`QR Code for ${item.name}`}
                  className="w-64 h-64"
                />
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-4">
                  Code: <span className="font-mono font-bold text-gray-900">{item.qrCode}</span>
                </p>
                <button
                  onClick={handleDownloadQR}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  📥 Download QR Code
                </button>
              </div>
            </div>

            {/* Public Link */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="font-bold text-gray-900 mb-2">Public Scan Link</h3>
              <p className="text-sm text-gray-600 mb-3">
                Share this link or scan the QR code to view the public page:
              </p>
              <div className="bg-gray-100 p-3 rounded text-sm break-all text-gray-900">
                {typeof window !== 'undefined' && `${window.location.origin}/scan/${item.qrCode}`}
              </div>
            </div>
          </div>

          {/* Right Column - Item Details */}
          <div className="space-y-6">
            {/* Item Information */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex justify-between items-start mb-6">
                <h1 className="text-3xl font-bold text-gray-900">
                  {item.name}
                </h1>
                {!editMode ? (
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                    item.status === 'active' ? 'bg-green-100 text-green-800' :
                    item.status === 'found' ? 'bg-purple-100 text-purple-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {item.status}
                  </span>
                ) : (
                  <select
                    value={editData.status}
                    onChange={(e) => setEditData({ status: e.target.value })}
                    className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-900"
                  >
                    <option value="active">Active</option>
                    <option value="found">Found</option>
                    <option value="inactive">Inactive</option>
                  </select>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">Category</h3>
                  <p className="text-gray-900">{item.category}</p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">Description</h3>
                  <p className="text-gray-900">{item.description}</p>
                </div>

                {(item.image || item.imageUrl) && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">Image</h3>
                    <div className="max-w-md mx-auto aspect-square bg-white p-4">
                      <img 
                        src={item.image || item.imageUrl} 
                        alt={item.name} 
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                  </div>
                )}

                {item.customFields && Object.keys(item.customFields).length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">Additional Details</h3>
                    <div className="space-y-2">
                      {Object.entries(item.customFields).map(([key, value]) => (
                        <div key={key} className="flex">
                          <span className="font-medium text-gray-700 mr-2">{key}:</span>
                          <span className="text-gray-900">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500">
                    Created: {new Date(item.createdAt).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex gap-3">
                {!editMode ? (
                  <>
                    <button
                      onClick={() => setEditMode(true)}
                      className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                      Edit Status
                    </button>
                    <button
                      onClick={handleDeleteItem}
                      className="px-6 bg-red-50 text-red-600 rounded-lg font-semibold hover:bg-red-100 transition-colors"
                    >
                      Delete Item
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleUpdateStatus}
                      className="flex-1 bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={() => {
                        setEditMode(false);
                        setEditData({ status: item.status });
                      }}
                      className="px-6 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Scan History */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Scan History ({scans?.length || 0})
              </h2>
              
              {(scans?.length || 0) === 0 ? (
                <p className="text-gray-600 text-center py-6">
                  No scans yet. When someone scans this item&apos;s QR code, it will appear here.
                </p>
              ) : (
                <div className="space-y-4">
                  {scans?.map((scan) => (
                    <div key={scan.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-bold text-gray-900">{scan.scannerName}</h4>
                          {scan.scannerEmail && (
                            <p className="text-sm text-gray-600">{scan.scannerEmail}</p>
                          )}
                          {scan.scannerPhone && (
                            <p className="text-sm text-gray-600">{scan.scannerPhone}</p>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(scan.scannedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      {scan.location && (
                        <div className="text-sm text-gray-700 mb-1">
                          <strong>Location:</strong>{' '}
                          <a
                            href={`https://www.google.com/maps?q=${scan.location.latitude},${scan.location.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-1"
                          >
                            📍 {scan.location.address || `${scan.location.latitude}, ${scan.location.longitude}`}
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        </div>
                      )}
                      {scan.message && (
                        <p className="text-sm text-gray-700">
                          <strong>Message:</strong> {scan.message}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
