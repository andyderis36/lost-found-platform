'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface NotificationData {
  _id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
  itemId?: {
    _id: string;
    name: string;
  };
}

interface AblyMessage {
  data: {
    title?: string;
    message?: string;
    type?: string;
  };
}

export default function NotificationCenter() {
  const { user, token } = useAuth();
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const ablyChannelRef = useRef<{ unsubscribe: () => void } | null>(null);

  // Fetch notifications on mount and when user changes
  useEffect(() => {
    if (!user) return;
    fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Subscribe to real-time notifications via Ably
  useEffect(() => {
    if (!user) return;

    const initAbly = async () => {
      try {
        if (!token) {
          console.warn('No auth token available');
          return;
        }

        // Fetch the Ably token with proper authentication
        const tokenResponse = await fetch('/api/notifications/auth', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!tokenResponse.ok) {
          console.warn(`Failed to get Ably token: HTTP ${tokenResponse.status}`);
          return;
        }

        const tokenData = await tokenResponse.json();
        const ablyToken = tokenData.token;

        if (!ablyToken) {
          console.warn('No token received from auth endpoint');
          return;
        }

        // Dynamically import Ably to avoid SSR issues
        const { Realtime } = await import('ably');

        // Initialize Ably with the token directly (not authUrl)
        const client = new Realtime({
          token: ablyToken,
        });

        // Subscribe to notifications channel for this user
        const channelName = `notifications-${user?.id}`;
        const channel = client.channels.get(channelName);
        ablyChannelRef.current = channel;

        // Listen for incoming notifications
        channel.subscribe('item_scanned', (message: unknown) => {
          // Add new notification to the top
          const typedMessage = message as AblyMessage;
          const newNotification: NotificationData = {
            _id: Date.now().toString(),
            title: typedMessage.data.title || 'New Notification',
            message: typedMessage.data.message || '',
            type: typedMessage.data.type || 'system',
            read: false,
            createdAt: new Date().toISOString(),
          };
          setNotifications((prev) => [newNotification, ...prev]);
          setUnreadCount((prev) => prev + 1);
          console.log('✅ Received real-time notification via Ably');
        });

        // Handle connection errors gracefully
        client.connection.on('failed', (reason: unknown) => {
          console.warn('⚠️ Ably connection failed (notifications still work via polling):', reason);
          // Notifications still work via API polling, so this is not a critical error
        });

        console.log('✅ Connected to Ably notifications channel:', channelName);
      } catch (error) {
        console.error('Failed to initialize Ably:', error);
        // Gracefully continue without real-time updates - API polling still works
      }
    };

    initAbly();

    return () => {
      if (ablyChannelRef.current) {
        try {
          ablyChannelRef.current.unsubscribe();
        } catch (error) {
          console.error('Error unsubscribing from Ably channel:', error);
        }
      }
    };
  }, [user, token]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/notifications?limit=20&read=false', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      });
      const data = await response.json();

      if (data.data) {
        setNotifications(data.data.notifications || []);
        setUnreadCount(data.data.notifications.filter((n: NotificationData) => !n.read).length);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ read: true }),
      });

      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      });

      setNotifications((prev) => prev.filter((n) => n._id !== notificationId));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
        aria-label="Notifications"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {Math.min(unreadCount, 9)}
            {unreadCount > 9 ? '+' : ''}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-gray-50 px-4 py-3 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            <p className="text-sm text-gray-500">{unreadCount} unread</p>
          </div>

          {/* Notifications List */}
          {isLoading ? (
            <div className="px-4 py-8 text-center">
              <p className="text-gray-500">Loading...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-gray-500">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`px-4 py-3 hover:bg-gray-50 transition-colors ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                >
                  <div
                    className="mb-2 cursor-pointer"
                    onClick={() => !notification.read && markAsRead(notification._id)}
                  >
                    <div className="flex items-start justify-between">
                      <h4 className="font-medium text-gray-900 text-sm">
                        {notification.title}
                      </h4>
                      {!notification.read && (
                        <span className="inline-block w-2 h-2 bg-blue-600 rounded-full ml-2 flex-shrink-0"></span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                    {notification.itemId && (
                      <p className="text-xs text-gray-500 mt-2">
                        Item: {notification.itemId.name}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notification._id);
                    }}
                    className="text-xs text-red-600 hover:text-red-700 font-medium"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="sticky bottom-0 bg-gray-50 px-4 py-2 border-t border-gray-200 text-center">
              <a
                href="/dashboard"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                View all notifications
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
