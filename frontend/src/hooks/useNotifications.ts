import { useState, useEffect, useCallback } from 'react';
import { Notification } from '@/types/auth';
import api from '@/lib/api';

export function useNotifications(userId?: string) {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const loadNotifications = useCallback(async () => {
        try {
            // If userId is provided, filter; otherwise global (for admins)
            const url = userId ? `/notifications?userId=${userId}` : '/notifications';
            const res = await api.get(url);
            // Sort by latest created first
            const sorted = res.data.sort((a: Notification, b: Notification) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            setNotifications(sorted);
        } catch (error) {
           console.error("Failed to load notifications", error);
        }
    }, [userId]);

    useEffect(() => {
        loadNotifications();
        
        // Listen to events triggered from other components making mutations
        const handleCustomChange = () => loadNotifications();
        window.addEventListener('notifications-updated', handleCustomChange);

        return () => {
            window.removeEventListener('notifications-updated', handleCustomChange);
        };
    }, [loadNotifications]);

    // Used to sync global state across components when a change happens
    const notifyUpdate = () => {
       window.dispatchEvent(new CustomEvent('notifications-updated'));
    };

    const addNotification = async (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => {
        try {
            const payload: Notification = {
                ...notification,
                id: "temp",
                createdAt: new Date().toISOString(),
                read: false,
            };
            await api.post('/notifications', payload);
            notifyUpdate();
            await loadNotifications();
        } catch (e) {
            console.error("Failed to add notification", e);
        }
    };

    const markAsRead = async (notificationId: string) => {
        try {
            await api.put(`/notifications/${notificationId}/read`);
            notifyUpdate();
            await loadNotifications();
        } catch (e) {
             console.error("Failed to mark as read", e);
        }
    };

    const markAllAsRead = async () => {
        if (!userId) return;
        try {
           await api.put(`/notifications/read-all?userId=${userId}`);
           notifyUpdate();
           await loadNotifications();
        } catch(e) {
             console.error("Failed to mark all as read", e);
        }
    };

    const clearNotifications = async () => {
        if (!userId) return;
        try {
           await api.delete(`/notifications?userId=${userId}`);
           notifyUpdate();
           await loadNotifications();
        } catch(e) {
             console.error("Failed to clear notifications", e);
        }
    };

    return {
        notifications,
        unreadCount: notifications.filter(n => !n.read).length,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearNotifications,
        refresh: loadNotifications,
    };
}
