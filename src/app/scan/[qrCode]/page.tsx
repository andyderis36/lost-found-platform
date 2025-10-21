'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';

interface ItemData {
  id: string;
  name: string;
  category: string;
  description?: string;
  image?: string;
  status: string;
}

export default function ScanPage() {
  const params = useParams();
  const qrCode = params?.qrCode as string;
  
  const [item, setItem] = useState<ItemData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    scannerName: '',
    scannerEmail: '',
    scannerPhone: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Fetch item details by QR code (public, no auth)
  useEffect(() => {
    const fetchItem = async () => {
      try {
        // We'll create a public endpoint for this
        const response = await fetch(`/api/items/public/${qrCode}`);
        const data = await response.json();
        
        if (data.success) {
          setItem(data.data);
        } else {
          setError('Item not found. This QR code may be invalid or deactivated.');
        }
      } catch {
        setError('Failed to load item. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (qrCode) {
      fetchItem();
    }
  }, [qrCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Try to get user's location
      let location = undefined;
      
      if (navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              timeout: 5000,
              maximumAge: 0,
              enableHighAccuracy: true
            });
          });
          
          location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
        } catch (geoError) {
          console.log('Location access denied or unavailable:', geoError);
          // Continue without location - it's optional
        }
      }

      const response = await fetch('/api/scans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qrCode,
          ...formData,
          location,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSubmitted(true);
      } else {
        alert(data.error || 'Failed to submit. Please try again.');
      }
    } catch {
      alert('Failed to submit. Please check your connection.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading item...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Item Not Found</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-green-500 text-5xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Thank You!</h1>
          <p className="text-gray-600 mb-4">
            Your message has been sent to the owner. They will contact you soon!
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Scan Another Item
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Item Card */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
          {item?.image && (
            <img 
              src={item.image} 
              alt={item.name}
              className="w-full h-64 object-cover"
            />
          )}
          
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold text-gray-800">{item?.name}</h1>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                item?.status === 'lost' ? 'bg-red-100 text-red-800' :
                item?.status === 'found' ? 'bg-green-100 text-green-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {item?.status.toUpperCase()}
              </span>
            </div>
            
            <div className="flex items-center gap-2 text-gray-600 mb-4">
              <span className="text-2xl">📦</span>
              <span className="capitalize">{item?.category}</span>
            </div>

            {item?.description && (
              <p className="text-gray-700 mb-4">{item.description}</p>
            )}

            {item?.status === 'lost' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-red-800 font-medium">
                  ⚠️ This item has been reported as LOST
                </p>
                <p className="text-red-600 text-sm mt-1">
                  If you found this item, please fill out the form below to contact the owner.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Contact Owner</h2>
          <p className="text-gray-600 mb-6">
            Found this item? Fill in your details and we&apos;ll notify the owner.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Your Name *
              </label>
              <input
                type="text"
                required
                value={formData.scannerName}
                onChange={(e) => setFormData({ ...formData, scannerName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.scannerEmail}
                onChange={(e) => setFormData({ ...formData, scannerEmail: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.scannerPhone}
                onChange={(e) => setFormData({ ...formData, scannerPhone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="+62 812 3456 7890"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Message (Optional)
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="Where did you find it? Any additional details..."
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-blue-800 text-sm">
                📍 <strong>Location Sharing:</strong> When you submit this form, we&apos;ll ask for your location permission. This helps the owner know where the item was found. You can choose to allow or deny this request.
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? 'Sending...' : 'Contact Owner'}
            </button>

            <p className="text-sm text-gray-500 text-center">
              Your contact information will be shared with the owner so they can reach you.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
