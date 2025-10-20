'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Never Lose Your
            <span className="text-blue-600"> Valuable Items</span> Again
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Register your items with unique QR codes. If lost, anyone who finds them can instantly contact you - keeping your personal information private.
          </p>
          
          {user ? (
            <div className="flex gap-4 justify-center">
              <Link
                href="/dashboard"
                className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg"
              >
                Go to Dashboard
              </Link>
              <Link
                href="/items/new"
                className="bg-white text-blue-600 border-2 border-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-50 transition-colors shadow-lg"
              >
                + Add Item
              </Link>
            </div>
          ) : (
            <div className="flex gap-4 justify-center">
              <Link
                href="/register"
                className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg"
              >
                Get Started Free
              </Link>
              <Link
                href="/login"
                className="bg-white text-blue-600 border-2 border-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-50 transition-colors shadow-lg"
              >
                Login
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          How It Works
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-4">📦</div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              1. Register Your Items
            </h3>
            <p className="text-gray-600">
              Add your valuable items with photos and details. Each item gets a unique QR code automatically.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-4">🔲</div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              2. Print & Attach QR Code
            </h3>
            <p className="text-gray-600">
              Download and print the QR code sticker. Attach it to your laptop, phone, bag, or any valuable item.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-4">📱</div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              3. Easy Return If Lost
            </h3>
            <p className="text-gray-600">
              If someone finds your item, they scan the QR code and can contact you directly - no personal info exposed!
            </p>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-blue-50 py-16 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Choose Us?
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl mb-2">🔐</div>
              <h4 className="font-bold text-gray-900 mb-2">Privacy Protected</h4>
              <p className="text-sm text-gray-600">Your contact info stays private until needed</p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl mb-2">⚡</div>
              <h4 className="font-bold text-gray-900 mb-2">Instant Notifications</h4>
              <p className="text-sm text-gray-600">Get notified immediately when someone scans</p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl mb-2">🎯</div>
              <h4 className="font-bold text-gray-900 mb-2">Track Scans</h4>
              <p className="text-sm text-gray-600">See who scanned your item and when</p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl mb-2">💰</div>
              <h4 className="font-bold text-gray-900 mb-2">100% Free</h4>
              <p className="text-sm text-gray-600">No hidden fees, completely free to use</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-6">
          Ready to Protect Your Items?
        </h2>
        <p className="text-xl text-gray-600 mb-8">
          Join thousands of users who never worry about losing their valuable items again.
        </p>
        {!user && (
          <Link
            href="/register"
            className="bg-blue-600 text-white px-10 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg inline-block"
          >
            Create Free Account
          </Link>
        )}
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">
            © 2025 Lost & Found Platform. Made with ❤️ for keeping your items safe.
          </p>
        </div>
      </footer>
    </div>
  );
}
