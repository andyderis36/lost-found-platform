'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { getBase64SizeKB, compressBase64Image } from '@/lib/imageCompression';
import ImageCropper from '@/components/ImageCropper';

const CATEGORIES = [
  'Electronics',
  'Personal Items',
  'Bags & Luggage',
  'Jewelry',
  'Documents',
  'Keys',
  'Sports Equipment',
  'Other',
];

export default function NewItemPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    category: 'Electronics',
    description: '',
    image: '',
  });
  const [imagePreview, setImagePreview] = useState<string>('');
  const [imageToCrop, setImageToCrop] = useState<string>('');
  const [customFields, setCustomFields] = useState<Array<{ key: string; value: string }>>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      
      // Build custom fields object
      const customFieldsObj: Record<string, string> = {};
      customFields.forEach(field => {
        if (field.key && field.value) {
          customFieldsObj[field.key] = field.value;
        }
      });

      const response = await fetch('/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          customFields: Object.keys(customFieldsObj).length > 0 ? customFieldsObj : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('API Error:', data);
        throw new Error(data.error || 'Failed to create item');
      }

      // Redirect to the newly created item's detail page
      router.push(`/items/${data.data.id}`);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create item';
      console.error('Create item error:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const addCustomField = () => {
    setCustomFields([...customFields, { key: '', value: '' }]);
  };

  const updateCustomField = (index: number, field: 'key' | 'value', value: string) => {
    const newFields = [...customFields];
    newFields[index][field] = value;
    setCustomFields(newFields);
  };

  const removeCustomField = (index: number) => {
    setCustomFields(customFields.filter((_, i) => i !== index));
  };

  if (authLoading) {
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

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden py-8 pt-24">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-indigo-400/30 rounded-full mix-blend-multiply filter blur-xl animate-float"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-400/30 rounded-full mix-blend-multiply filter blur-xl animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-400/30 rounded-full mix-blend-multiply filter blur-xl animate-float" style={{animationDelay: '4s'}}></div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="mb-8 animate-scale-in">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-indigo-600 hover:text-purple-600 font-bold mb-4 transition-colors group"
          >
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Dashboard</span>
          </Link>
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-3 leading-tight pb-1">
            Register New Item
          </h1>
          <p className="text-slate-600 text-lg">
            Add your item details below. A unique QR code will be generated automatically.
          </p>
        </div>

        {/* Form */}
        <div className="glass p-8 rounded-3xl animate-scale-in" style={{animationDelay: '0.1s'}}>
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

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Item Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                Item Name *
              </label>
              <input
                type="text"
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 glass-dark rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-slate-900 placeholder-slate-400"
                placeholder="e.g., iPhone 15 Pro, MacBook Air, Leather Wallet"
              />
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
                Category *
              </label>
              <select
                id="category"
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 glass-dark rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-slate-900"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                </svg>
                Description *
              </label>
              <textarea
                id="description"
                required
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 glass-dark rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none text-slate-900 placeholder-slate-400"
                placeholder="Provide details about your item (color, model, distinguishing features, etc.)"
              />
            </div>

            {/* Image Upload (Optional) */}
            <div>
              <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
                Item Photo <span className="text-gray-400 text-xs">(Optional)</span>
              </label>
              <input
                type="file"
                id="image"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    try {
                      // Read file as base64 for cropping
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        const base64 = event.target?.result as string;
                        setImageToCrop(base64);
                      };
                      reader.readAsDataURL(file);
                    } catch (error) {
                      console.error('Image reading failed:', error);
                      setError('Failed to read image. Please try a different image.');
                    }
                  }
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-900"
              />
              <p className="text-xs text-gray-500 mt-1">
                Upload a photo of your item (JPEG, PNG, etc.). You can crop it to 1:1 ratio before uploading.
              </p>
              {imagePreview && (
                <div className="mt-4">
                  <div className="w-48 h-48 bg-white p-2 border border-gray-200 rounded-lg">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Preview (compressed size: {getBase64SizeKB(imagePreview)}KB)
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview('');
                      setFormData({ ...formData, image: '' });
                    }}
                    className="mt-2 text-sm text-red-600 hover:text-red-700"
                  >
                    Remove Image
                  </button>
                </div>
              )}
            </div>

            {/* Custom Fields */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Additional Details <span className="text-gray-400 text-xs">(Optional)</span>
                </label>
                <button
                  type="button"
                  onClick={addCustomField}
                  className="text-blue-600 text-sm font-medium hover:underline"
                >
                  + Add Field
                </button>
              </div>

              {customFields.length > 0 && (
                <div className="space-y-3">
                  {customFields.map((field, index) => (
                    <div key={index} className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={field.key}
                        onChange={(e) => updateCustomField(index, 'key', e.target.value)}
                        placeholder="Field name (e.g., Serial Number)"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
                      />
                      <div className="flex gap-2 flex-1">
                        <input
                          type="text"
                          value={field.value}
                          onChange={(e) => updateCustomField(index, 'value', e.target.value)}
                          placeholder="Value"
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
                        />
                        <button
                          type="button"
                          onClick={() => removeCustomField(index)}
                          className="px-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>ℹ️ What happens next:</strong> Once you submit, a unique QR code will be generated for your item. 
                You can then download and print this QR code to attach to your item.
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 py-3 px-4 sm:px-6 rounded-xl font-semibold text-white transition-all flex items-center justify-center gap-2 ${
                  loading
                    ? 'bg-blue-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-lg hover:shadow-indigo-500/50'
                }`}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span className="text-sm sm:text-base">Creating...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="text-sm sm:text-base">Create Item & Generate QR</span>
                  </>
                )}
              </button>
              <Link
                href="/dashboard"
                className="px-4 sm:px-6 py-3 glass-dark rounded-xl font-semibold text-slate-700 hover:bg-white/80 transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span className="text-sm sm:text-base">Cancel</span>
              </Link>
            </div>
          </form>
        </div>

        {/* Image Cropper Modal */}
        {imageToCrop && (
          <ImageCropper
            imageSrc={imageToCrop}
            onCropComplete={async (croppedImage) => {
              try {
                // Compress the cropped image (already base64)
                const compressedBase64 = await compressBase64Image(
                  croppedImage,
                  {
                    maxWidth: 800,
                    maxHeight: 800,
                    quality: 0.8,
                    maxSizeKB: 500,
                  }
                );
                
                const compressedSizeKB = getBase64SizeKB(compressedBase64);
                console.log(`Compressed cropped image: ${compressedSizeKB}KB`);
                
                setFormData({ ...formData, image: compressedBase64 });
                setImagePreview(compressedBase64);
                setImageToCrop('');
              } catch (error) {
                console.error('Image compression failed:', error);
                setError('Failed to process image. Please try again.');
                setImageToCrop('');
              }
            }}
            onCancel={() => {
              setImageToCrop('');
              // Reset file input
              const fileInput = document.getElementById('image') as HTMLInputElement;
              if (fileInput) fileInput.value = '';
            }}
          />
        )}
      </div>
    </div>
  );
}
