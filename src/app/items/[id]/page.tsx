'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ImageCropper from '@/components/ImageCropper';
import { compressBase64Image } from '@/lib/imageCompression';

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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editData, setEditData] = useState({ name: '', category: '', description: '', status: '' });
  const [editCustomFields, setEditCustomFields] = useState<Array<{ id: string; key: string; value: string }>>([]);
  const [isEditImageModalOpen, setIsEditImageModalOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState('');
  const [selectedImageName, setSelectedImageName] = useState('No file chosen');
  const [, setImageUploading] = useState(false);

  const CATEGORY_OPTIONS = [
    'Electronics',
    'Personal Items',
    'Bags & Luggage',
    'Jewelry',
    'Documents',
    'Keys',
    'Sports Equipment',
    'Other',
  ];

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
      setEditData({
        name: data.data.name || '',
        category: data.data.category || '',
        description: data.data.description || '',
        status: data.data.status || '',
      });
      // populate editCustomFields from item.customFields
      if (data.data.customFields && typeof data.data.customFields === 'object') {
        const entries = Object.entries(data.data.customFields as Record<string, unknown>);
        setEditCustomFields(entries.map(([k, v], i) => ({ id: String(Date.now()) + i, key: k, value: String(v ?? '') })));
      } else {
        setEditCustomFields([]);
      }
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

  // Save full item updates from modal
  const handleSaveItem = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/items/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editData.name,
          category: editData.category,
          description: editData.description,
          status: editData.status,
          customFields: editCustomFields && editCustomFields.length > 0
            ? Object.fromEntries(editCustomFields.filter(f => f.key).map(f => [f.key, f.value]))
            : undefined,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => null);
        throw new Error(err?.error || 'Failed to save item');
      }

      await fetchItemDetails();
      setIsEditModalOpen(false);
      alert('Item updated successfully');
    } catch (err) {
      console.error(err);
      alert('Failed to save item. See console for details.');
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

  // Custom fields helpers for modal
  const handleAddCustomField = () => {
    setEditCustomFields(prev => [...prev, { id: String(Date.now()) + Math.random().toString(36).slice(2,7), key: '', value: '' }]);
  };

  const handleRemoveCustomField = (id: string) => {
    setEditCustomFields(prev => prev.filter(f => f.id !== id));
  };

  const handleCustomFieldChange = (id: string, field: 'key' | 'value', value: string) => {
    setEditCustomFields(prev => prev.map(f => f.id === id ? { ...f, [field]: value } : f));
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-indigo-400/30 rounded-full mix-blend-multiply filter blur-xl animate-float"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-400/30 rounded-full mix-blend-multiply filter blur-xl animate-float" style={{animationDelay: '2s'}}></div>
        </div>
        <div className="text-center relative z-10">
          <div className="relative inline-block">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent absolute top-0 left-0"></div>
          </div>
          <p className="mt-4 text-slate-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !item) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden py-8 pt-24">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-indigo-400/30 rounded-full mix-blend-multiply filter blur-xl animate-float"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-400/30 rounded-full mix-blend-multiply filter blur-xl animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-400/30 rounded-full mix-blend-multiply filter blur-xl animate-float" style={{animationDelay: '4s'}}></div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="mb-8 animate-scale-in">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-indigo-600 hover:text-purple-600 font-bold transition-colors bg-transparent border-none cursor-pointer p-0 group"
          >
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back</span>
          </button>
        </div>

        {error && (
          <div className="glass-dark border-2 border-red-500/50 bg-red-500/10 text-red-700 px-6 py-4 rounded-2xl mb-6 backdrop-blur-sm animate-scale-in">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">{error}</span>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6 md:gap-8 overflow-x-hidden">
          {/* Left Column - QR Code & Actions */}
          <div>
            <div className="glass p-8 rounded-3xl mb-6 animate-scale-in">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6 text-center leading-tight pb-1">
                QR Code
              </h2>
              <div className="flex justify-center mb-6">
                <div className="glass-dark p-6 rounded-2xl">
                  <img 
                    src={item.qrCodeDataUrl} 
                    alt={`QR Code for ${item.name}`}
                    className="w-64 h-64"
                  />
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm text-slate-600 mb-4">
                  Code: <span className="font-mono font-bold text-slate-900 bg-slate-100 px-3 py-1 rounded-lg">{item.qrCode}</span>
                </p>
                <button
                  onClick={handleDownloadQR}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-bold hover:shadow-lg hover:shadow-indigo-500/50 transition-all duration-300 flex items-center justify-center gap-2 mb-6"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download QR Code
                </button>

                {/* Public Scan Link */}
                <div className="mt-6 pt-6 border-t border-slate-200">
                  <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    Public Scan Link
                  </h3>
                  <p className="text-xs text-slate-500 mb-3">
                    Share this link or scan the QR code to view the public page:
                  </p>
                  
                  {/* Link Display with Integrated Copy Button */}
                  <div className="relative group">
                    <div className="glass-dark p-4 pr-14 break-all text-sm text-slate-700 font-mono rounded-xl border border-slate-200 group-hover:border-indigo-300 transition-colors duration-300">
                      {`${typeof window !== 'undefined' ? window.location.origin : ''}/scan/${item.qrCode}`}
                    </div>
                    <button
                      onClick={() => {
                        const link = `${window.location.origin}/scan/${item.qrCode}`;
                        navigator.clipboard.writeText(link);
                        alert('Link copied to clipboard!');
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 text-slate-600 hover:text-indigo-600 glass hover:glass-dark rounded-lg transition-all duration-300 hover:scale-110"
                      title="Copy link"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>

                  {/* Open in New Tab Button */}
                  <button
                    onClick={() => {
                      window.open(`/scan/${item.qrCode}`, '_blank');
                    }}
                    className="w-full mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Open Link
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Item Details */}
          <div className="space-y-6">
            {/* Item Information */}
            <div className="glass p-6 sm:p-8 rounded-3xl animate-scale-in">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-8">
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent leading-tight pb-1 break-words max-w-full">
                  {item.name}
                </h1>
                <span className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wide shadow-lg shrink-0 ${
                    item.status === 'active' ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white' :
                    item.status === 'found' ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' :
                    'glass-dark text-slate-700'
                  }`}>
                  {item.status === 'active' ? 'LOST' : item.status === 'found' ? 'FOUND' : 'INACTIVE'}
                </span>
              </div>

              <div className="space-y-6">
                <div className="glass-dark p-4 sm:p-5 rounded-2xl border border-slate-200">
                  <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2 flex items-center gap-2 leading-tight pb-0.5">
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    Category
                  </h3>
                  <p className="text-slate-900 font-semibold text-lg">{item.category}</p>
                </div>

                <div className="glass-dark p-4 sm:p-5 rounded-2xl border border-slate-200">
                  <h3 className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-2 flex items-center gap-2 leading-tight pb-0.5">
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                    </svg>
                    Description
                  </h3>
                  <p className="text-slate-700 leading-relaxed">{item.description}</p>
                </div>

                {(item.image || item.imageUrl) && (
                  <div className="glass-dark p-4 sm:p-5 rounded-2xl border border-slate-200">
                    <h3 className="text-xs font-bold text-pink-600 uppercase tracking-wider mb-3 flex items-center gap-2 leading-tight pb-0.5">
                      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Image
                    </h3>
                    <div className="max-w-md mx-auto aspect-square glass p-3 rounded-xl">
                      <img 
                        src={item.image || item.imageUrl} 
                        alt={item.name} 
                        className="w-full h-full object-cover rounded-lg shadow-xl transition-transform duration-500 hover:scale-105"
                      />
                    </div>

                    <div className="mt-4 flex justify-center">
                      <button
                        onClick={() => {
                          setImageToCrop('');
                          setIsEditImageModalOpen(true);
                        }}
                        className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-800 font-bold hover:shadow-md transition-all duration-200"
                      >
                        Edit Image
                      </button>
                    </div>
                  </div>
                )}

                {/* Edit Image Modal */}
                {isEditImageModalOpen && (
                  <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40" onClick={() => { setIsEditImageModalOpen(false); setImageToCrop(''); }} />
                    <div className="relative z-[10001] w-full max-w-md mx-4 sm:mx-auto bg-white rounded-2xl shadow-xl p-4 sm:p-6 overflow-auto max-h-[80vh] text-slate-900">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold">Update Item Image</h3>
                        <button onClick={() => { setIsEditImageModalOpen(false); setImageToCrop(''); }} className="text-slate-500 hover:text-slate-800 p-2 rounded-full">
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>

                      {!imageToCrop ? (
                        <div className="space-y-4">
                          <p className="text-sm text-slate-700">Choose an image to upload and crop to 1:1 ratio.</p>
                          <div className="flex items-center gap-3">
                            <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                              <span className="font-semibold">Choose File</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    setSelectedImageName(file.name);
                                    try {
                                      const reader = new FileReader();
                                      reader.onload = (ev) => {
                                        const base64 = ev.target?.result as string;
                                        setImageToCrop(base64);
                                      };
                                      reader.readAsDataURL(file);
                                    } catch (err) {
                                      console.error('Failed to read image', err);
                                    }
                                  } else {
                                    setSelectedImageName('No file chosen');
                                  }
                                }}
                                className="hidden"
                              />
                            </label>
                            <span className="text-sm text-slate-700 truncate">{selectedImageName}</span>
                          </div>
                          <p className="text-xs text-slate-500 mt-2">Supported: JPG, PNG. We will compress the image before upload.</p>
                        </div>
                      ) : (
                        <ImageCropper
                          imageSrc={imageToCrop}
                          onCropComplete={async (croppedImage) => {
                            try {
                              setImageUploading(true);
                              const compressedBase64 = await compressBase64Image(croppedImage, { maxWidth: 1000, maxHeight: 1000, quality: 0.8, maxSizeKB: 600 });
                              const token = localStorage.getItem('token');
                              const response = await fetch(`/api/items/${itemId}`, {
                                method: 'PUT',
                                headers: {
                                  'Content-Type': 'application/json',
                                  'Authorization': `Bearer ${token}`,
                                },
                                body: JSON.stringify({ image: compressedBase64 }),
                              });

                              if (!response.ok) {
                                const err = await response.json().catch(() => null);
                                throw new Error(err?.error || 'Failed to upload image');
                              }

                              await fetchItemDetails();
                              setIsEditImageModalOpen(false);
                              setImageToCrop('');
                              alert('Image updated successfully');
                            } catch (err) {
                              console.error(err);
                              alert('Failed to update image');
                            } finally {
                              setImageUploading(false);
                            }
                          }}
                          onCancel={() => setImageToCrop('')}
                        />
                      )}
                    </div>
                  </div>
                )}

                {item.customFields && Object.keys(item.customFields).length > 0 && (
                  <div className="glass-dark p-4 sm:p-5 rounded-2xl border border-slate-200">
                    <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-3 flex items-center gap-2 leading-tight pb-0.5">
                      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      Additional Details
                    </h3>
                    <div className="space-y-2">
                      {Object.entries(item.customFields).map(([key, value]) => (
                        <div key={key} className="flex items-start gap-3 p-3 glass rounded-lg">
                          <span className="font-bold text-slate-700 min-w-[120px]">{key}:</span>
                          <span className="text-slate-900 flex-1 break-all">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-6 mt-6 border-t border-slate-200">
                  <p className="text-sm text-slate-500 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
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
              <div className="mt-8 flex gap-4">
                <>
                  <button
                    onClick={() => {
                      // open edit modal and populate current values
                      setEditData({
                        name: item.name,
                        category: item.category,
                        description: item.description,
                        status: item.status,
                      });
                      // populate custom fields for modal
                      if (item.customFields && typeof item.customFields === 'object') {
                        const entries = Object.entries(item.customFields as Record<string, unknown>);
                        setEditCustomFields(entries.map(([k, v], i) => ({ id: String(Date.now()) + i, key: k, value: String(v ?? '') })));
                      } else {
                        setEditCustomFields([]);
                      }
                      setIsEditModalOpen(true);
                    }}
                    className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-bold hover:shadow-lg hover:shadow-indigo-500/50 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Item
                  </button>
                  <button
                    onClick={handleDeleteItem}
                    className="px-8 glass-dark text-red-600 rounded-xl font-bold hover:bg-red-50 hover:shadow-lg hover:shadow-red-500/30 transition-all duration-300 flex items-center justify-center gap-2 border-2 border-red-200"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete Item
                  </button>
                </>
              </div>
            </div>

                {/* Edit Item Modal */}
                {isEditModalOpen && (
                  <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4 sm:pt-16">
                    <div className="absolute inset-0 z-[9998] bg-black/40" onClick={() => setIsEditModalOpen(false)} />
                    <div className="relative z-[9999] w-full max-w-[min(92vw,540px)] mx-4 sm:mx-auto sm:my-8 box-border bg-white rounded-t-2xl sm:rounded-2xl shadow-xl p-3 sm:p-5 overflow-hidden max-h-[75vh] text-slate-900 flex flex-col">
                      <div className="overflow-y-auto pr-4 sm:pr-2 space-y-3 flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <h3 className="text-lg sm:text-xl font-bold">Edit Item</h3>
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-slate-800 mb-2">Name</label>
                          <input
                            value={editData.name}
                            onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 text-slate-900"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-800 mb-2">Category</label>
                          <select
                            value={editData.category}
                            onChange={(e) => setEditData(prev => ({ ...prev, category: e.target.value }))}
                            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 text-slate-900"
                          >
                            {CATEGORY_OPTIONS.map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-800 mb-2">Description</label>
                          <textarea
                            value={editData.description}
                            onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                            rows={4}
                            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 resize-none text-slate-900"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-800 mb-2">Status</label>
                          <select
                            value={editData.status}
                            onChange={(e) => setEditData(prev => ({ ...prev, status: e.target.value }))}
                            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 text-slate-900"
                          >
                            <option value="active">Lost</option>
                            <option value="found">Found</option>
                            <option value="inactive">Inactive</option>
                          </select>
                        </div>
                        {/* Additional Details editor */}
                        <div>
                          <h4 className="text-sm font-bold text-slate-800 mb-2">Additional Details</h4>
                          <div className="space-y-2">
                            {editCustomFields.map(field => (
                              <div key={field.id} className="flex flex-col sm:flex-row gap-2 items-start">
                                <input
                                  value={field.key}
                                  onChange={(e) => handleCustomFieldChange(field.id, 'key', e.target.value)}
                                  placeholder="Field name"
                                  className="w-full sm:flex-1 px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
                                />
                                <input
                                  value={field.value}
                                  onChange={(e) => handleCustomFieldChange(field.id, 'value', e.target.value)}
                                  placeholder="Value"
                                  className="w-full sm:flex-1 px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
                                />
                                <button
                                  onClick={() => handleRemoveCustomField(field.id)}
                                  className="text-red-500 ml-0 sm:ml-1 p-2 self-stretch sm:self-auto rounded-lg"
                                  aria-label="Remove field"
                                >
                                  <span className="text-lg">×</span>
                                </button>
                              </div>
                            ))}
                            <div>
                              <button
                                type="button"
                                onClick={handleAddCustomField}
                                className="mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-2 rounded-lg font-bold w-full sm:w-auto"
                              >
                                Add Field
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex-none sticky bottom-0 bg-white/95 backdrop-blur-sm pt-3 sm:pt-4 px-3 sm:px-5 border-t border-slate-200">
                        <div className="flex flex-col sm:flex-row gap-3 justify-end">
                          <button
                            onClick={() => setIsEditModalOpen(false)}
                            className="w-full sm:w-auto px-4 py-3 rounded-xl bg-white border border-slate-200 font-bold"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleSaveItem}
                            className="w-full sm:w-auto px-4 py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Scan History */}
            <div className="glass p-6 sm:p-8 rounded-3xl animate-scale-in">
              <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6 flex items-center gap-3 leading-tight pb-1">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                Scan History ({scans?.length || 0})
              </h2>
              
              {(scans?.length || 0) === 0 ? (
                <div className="glass-dark p-8 rounded-2xl text-center border border-slate-200">
                  <svg className="w-16 h-16 mx-auto mb-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p className="text-slate-600 font-semibold">
                    No scans yet. When someone scans this item&apos;s QR code, it will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 max-w-full overflow-hidden">
                  {scans?.map((scan) => (
                    <div key={scan.id} className="glass-dark border border-slate-200 rounded-2xl p-4 sm:p-6 hover:border-indigo-300 transition-all duration-300 hover:shadow-lg max-w-full">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-3">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-slate-900 text-base sm:text-lg flex items-center gap-2 break-words">
                            <svg className="w-5 h-5 text-indigo-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            {scan.scannerName}
                          </h4>
                          {scan.scannerEmail && (
                            <p className="text-xs sm:text-sm text-slate-600 mt-1 flex items-start gap-2 break-all">
                              <svg className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              {scan.scannerEmail}
                            </p>
                          )}
                          {scan.scannerPhone && (
                            <p className="text-xs sm:text-sm text-slate-600 mt-1 flex items-center gap-2">
                              <svg className="w-4 h-4 text-pink-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                              {scan.scannerPhone}
                            </p>
                          )}
                        </div>
                        <span className="glass px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs text-slate-600 font-bold flex items-center gap-2 whitespace-nowrap shrink-0">
                          <svg className="w-3 h-3 sm:w-4 sm:h-4 text-indigo-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {new Date(scan.scannedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      {scan.location && (
                        <div className="glass p-3 rounded-xl mb-3 max-w-full overflow-hidden">
                          <p className="text-sm text-slate-700 font-semibold mb-1 flex items-center gap-2">
                            <svg className="w-4 h-4 text-red-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Location:
                          </p>
                          <a
                            href={`https://www.google.com/maps?q=${scan.location.latitude},${scan.location.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:text-purple-600 font-bold hover:underline inline-flex items-start gap-2 transition-colors duration-300 break-all text-sm"
                          >
                            <span className="break-all">{scan.location.address || `${scan.location.latitude}, ${scan.location.longitude}`}</span>
                            <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        </div>
                      )}
                      {scan.message && (
                        <div className="glass p-3 sm:p-4 rounded-xl max-w-full overflow-hidden">
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2 leading-tight pb-0.5">
                            <svg className="w-4 h-4 text-purple-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                            </svg>
                            Message
                          </p>
                          <p className="text-sm text-slate-700 leading-relaxed break-words">{scan.message}</p>
                        </div>
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
