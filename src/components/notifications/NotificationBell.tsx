import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { notificationService } from '../../services/notificationService';
import { NotificationCenter } from './NotificationCenter';
import { logger } from '../../utils/logger';

export const NotificationBell: React.FC = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [showCenter, setShowCenter] = useState(false);

  useEffect(() => {
    loadUnreadCount();
    
    // Subscribe to real-time notifications
    const subscription = notificationService.subscribeToNotifications((notification) => {
      setUnreadCount(prev => prev + 1);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadUnreadCount = async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      logger.error('Failed to load unread count', error instanceof Error ? error : undefined);
    }
  };

  const handleClick = () => {
    setShowCenter(true);
  };

  const handleClose = () => {
    setShowCenter(false);
    loadUnreadCount(); // Refresh count after viewing
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="relative p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-lg"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      <NotificationCenter isOpen={showCenter} onClose={handleClose} />
    </>
  );
};