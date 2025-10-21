'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Don't show navbar on scan pages
  if (pathname?.startsWith('/scan/')) {
    return null;
  }

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl">🔍</span>
              <span className="text-lg sm:text-xl font-bold text-gray-800">
                Lost & Found
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md font-medium text-sm lg:text-base"
                >
                  Dashboard
                </Link>
                <Link
                  href="/items/new"
                  className="bg-blue-600 text-white hover:bg-blue-700 px-3 lg:px-4 py-2 rounded-lg font-medium transition-colors text-sm lg:text-base whitespace-nowrap"
                >
                  + Add Item
                </Link>
                <div className="flex items-center space-x-2 lg:space-x-3">
                  <span className="text-gray-700 text-sm lg:text-base">👤 {user.name}</span>
                  <button
                    onClick={logout}
                    className="text-red-600 hover:text-red-700 px-3 py-2 rounded-md font-medium text-sm lg:text-base"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md font-medium"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100 focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              {!mobileMenuOpen ? (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {user ? (
              <>
                <div className="px-3 py-2 text-gray-700 font-medium border-b border-gray-200">
                  👤 {user.name}
                </div>
                <Link
                  href="/dashboard"
                  className="block text-gray-700 hover:bg-gray-100 hover:text-blue-600 px-3 py-2 rounded-md font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  href="/items/new"
                  className="block text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-md font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  + Add Item
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left text-red-600 hover:bg-red-50 px-3 py-2 rounded-md font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="block text-gray-700 hover:bg-gray-100 hover:text-blue-600 px-3 py-2 rounded-md font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="block text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-md font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
