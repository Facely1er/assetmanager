import { supabase, handleSupabaseError, isSupabaseEnabled } from '../lib/supabase';
import { Notification } from '../types/organization';
import { logError } from '../utils/errorHandling';

export const notificationService = {
  // Get user notifications
  async getNotifications(limit = 50): Promise<Notification[]> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw new Error(handleSupabaseError(error));
      return data || [];
    } catch (error) {
      logError(error, 'notificationService.getNotifications');
      throw error;
    }
  },

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('id', notificationId);

      if (error) throw new Error(handleSupabaseError(error));
    } catch (error) {
      logError(error, 'notificationService.markAsRead');
      throw error;
    }
  },

  // Mark all notifications as read
  async markAllAsRead(): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .is('read_at', null);

      if (error) throw new Error(handleSupabaseError(error));
    } catch (error) {
      logError(error, 'notificationService.markAllAsRead');
      throw error;
    }
  },

  // Get unread count
  async getUnreadCount(): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('id', { count: 'exact' })
        .is('read_at', null);

      if (error) throw new Error(handleSupabaseError(error));
      return count || 0;
    } catch (error) {
      logError(error, 'notificationService.getUnreadCount');
      return 0;
    }
  },

  // Create notification (server-side)
  async createNotification(notification: {
    user_id: string;
    organization_id?: string;
    type: string;
    title: string;
    message: string;
    data?: Record<string, unknown>;
  }): Promise<Notification> {
    if (!isSupabaseEnabled || !supabase) {
      throw new Error('Notifications not available in demo mode');
    }

    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert(notification)
        .select()
        .single();

      if (error) throw new Error(handleSupabaseError(error));
      return data;
    } catch (error) {
      logError(error, 'notificationService.createNotification');
      throw error;
    }
  },

  // Subscribe to real-time notifications
  subscribeToNotifications(callback: (notification: Notification) => void) {
    if (!isSupabaseEnabled || !supabase) {
      // Demo mode - return mock subscription
      return {
        unsubscribe: () => { /* Demo subscription cleanup */ }
      };
    }

    const user = supabase.auth.getUser();

    return supabase
      .channel('notifications')
      .on('postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user}`
        },
        (payload) => callback(payload.new as Notification)
      )
      .subscribe();
  },
};