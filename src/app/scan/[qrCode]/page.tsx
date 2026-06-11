'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
          <div className="absolute top-40 right-20 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
          <div className="absolute -bottom-32 left-1/2 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '4s' }}></div>
        </div>

        <div className="text-center relative z-10">
          <div className="glass p-8 rounded-3xl inline-block">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200 mx-auto"></div>
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-indigo-600 border-r-purple-600 absolute top-0 left-1/2 -translate-x-1/2"></div>
            </div>
            <p className="mt-6 text-slate-700 font-bold text-lg">Loading item...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
          <div className="absolute top-40 right-20 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="glass p-10 rounded-3xl max-w-md w-full text-center relative z-10 animate-scale-in">
          <svg className="w-20 h-20 mx-auto mb-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-3">Item Not Found</h1>
          <p className="text-slate-600 leading-relaxed">{error}</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-96 h-96 bg-green-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
          <div className="absolute top-40 right-20 w-96 h-96 bg-emerald-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="glass p-10 rounded-3xl max-w-md w-full text-center relative z-10 animate-scale-in">
          <svg className="w-20 h-20 mx-auto mb-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-3">Thank You!</h1>
          <p className="text-slate-600 mb-6 leading-relaxed">
            Your message has been sent to the owner. They will contact you soon!
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-xl font-bold hover:shadow-lg hover:shadow-green-500/50 transition-all duration-300"
          >
            Scan Another Item
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute -bottom-32 left-1/2 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="max-w-2xl mx-auto relative z-10">
        {/* Logo Header */}
        <div className="flex justify-center mb-8 animate-scale-in">
          <div className="glass p-4 rounded-2xl hover-glow">
            <img 
              src="/logos/logo-black.png" 
              alt="Lost & Found Platform Logo" 
              className="h-16 w-16"
            />
          </div>
        </div>

        {/* Item Card */}
        <div className="glass rounded-3xl overflow-hidden mb-8 animate-scale-in">
          {item?.image && (
            <div className="w-full max-w-md mx-auto aspect-square glass-dark p-6 m-6 rounded-2xl">
              <img 
                src={item.image} 
                alt={item.name}
                className="w-full h-full object-cover rounded-xl shadow-xl transition-transform duration-500 hover:scale-105"
              />
            </div>
          )}
          
          <div className="p-8">
            <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{item?.name}</h1>
              <span className={`px-6 py-2.5 rounded-full text-sm font-bold uppercase tracking-wide shadow-lg ${
                item?.status === 'active' ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white' :
                item?.status === 'found' ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' :
                item?.status === 'inactive' ? 'glass-dark text-slate-700' :
                'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
              }`}>
                {item?.status === 'active' ? 'LOST' : 
                 item?.status === 'found' ? 'FOUND' : 
                 item?.status === 'inactive' ? 'INACTIVE' : 
                 item?.status.toUpperCase()}
              </span>
            </div>
            
            <div className="flex items-center gap-3 glass-dark p-4 rounded-xl mb-6 w-fit">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <span className="capitalize font-bold text-slate-700">{item?.category}</span>
            </div>

            {item?.description && (
              <div className="glass-dark p-5 rounded-2xl mb-6 border border-slate-200">
                <p className="text-slate-700 leading-relaxed">{item.description}</p>
              </div>
            )}

            {item?.status === 'active' && (
              <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-2xl p-6 shadow-lg">
                <p className="font-bold text-lg mb-2 flex items-center gap-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  This item has been reported as LOST
                </p>
                <p className="text-white/90">
                  If you found this item, please fill out the form below to contact the owner.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Contact Form - Only show if status is NOT inactive */}
        {item?.status !== 'inactive' && (
          <div className="glass p-8 rounded-3xl animate-scale-in">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">Contact Owner</h2>
            <p className="text-slate-600 mb-8">
              Found this item? Fill in your details and we&apos;ll notify the owner.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-slate-700 font-bold mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Your Name *
              </label>
              <input
                type="text"
                required
                value={formData.scannerName}
                onChange={(e) => setFormData({ ...formData, scannerName: e.target.value })}
                className="w-full px-5 py-4 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 glass-dark transition-all duration-300"
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Email
              </label>
              <input
                type="email"
                value={formData.scannerEmail}
                onChange={(e) => setFormData({ ...formData, scannerEmail: e.target.value })}
                className="w-full px-5 py-4 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-slate-900 glass-dark transition-all duration-300"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Phone Number
              </label>
              <PhoneInput
                international
                defaultCountry="ID"
                value={formData.scannerPhone}
                onChange={(value) => setFormData({ ...formData, scannerPhone: value || '' })}
                className="phone-input w-full [&>input]:px-5 [&>input]:py-4 [&>input]:border-2 [&>input]:border-slate-200 [&>input]:rounded-xl [&>input]:glass-dark [&>input]:text-slate-900"
                placeholder="Enter phone number"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                Message (Optional)
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={4}
                className="w-full px-5 py-4 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 glass-dark transition-all duration-300 resize-none"
                placeholder="Where did you find it? Any additional details..."
              />
            </div>

            <div className="glass-dark border-2 border-blue-300 rounded-2xl p-5">
              <p className="text-blue-800 text-sm flex items-start gap-3">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span><strong className="font-bold">Location Sharing:</strong> When you submit this form, we&apos;ll ask for your location permission. This helps the owner know where the item was found. You can choose to allow or deny this request.</span>
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-5 rounded-xl font-bold hover:shadow-lg hover:shadow-indigo-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  Sending...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Contact Owner
                </>
              )}
            </button>

            <p className="text-sm text-slate-500 text-center leading-relaxed">
              Your contact information will be shared with the owner so they can reach you.
            </p>
          </form>
        </div>
        )}

        {/* Message for inactive items */}
        {item?.status === 'inactive' && (
          <div className="glass-dark border-2 border-slate-300 rounded-3xl p-10 text-center animate-scale-in">
            <svg className="w-20 h-20 mx-auto mb-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <h3 className="text-2xl font-bold text-slate-700 mb-3">Item Inactive</h3>
            <p className="text-slate-600 leading-relaxed">
              This item has been marked as inactive. The owner is not currently accepting contact requests.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
