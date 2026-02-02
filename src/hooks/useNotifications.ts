import { useState, useEffect, useCallback } from 'react';
import { Notification } from '@/types/auth';

const NOTIFICATIONS_KEY = 'school_notifications';

export function useNotifications(userId?: string) {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const loadNotifications = useCallback(() => {
        const allNotifications = JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY) || '[]');
        if (userId) {
            const userNotifications = allNotifications.filter((n: Notification) => n.userId === userId || n.userId === 'all');
            setNotifications(userNotifications.sort((a: Notification, b: Notification) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            ));
        } else {
            setNotifications(allNotifications);
        }
    }, [userId]);

    useEffect(() => {
        loadNotifications();

        // Polling or event listener for storage changes
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === NOTIFICATIONS_KEY) {
                loadNotifications();
            }
        };

        window.addEventListener('storage', handleStorageChange);

        // Also listen for custom events within the same window
        const handleCustomChange = () => loadNotifications();
        window.addEventListener('notifications-updated', handleCustomChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('notifications-updated', handleCustomChange);
        };
    }, [loadNotifications]);

    const addNotification = (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => {
        const allNotifications = JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY) || '[]');
        const newNotification: Notification = {
            ...notification,
            id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date().toISOString(),
            read: false,
        };

        const updatedNotifications = [...allNotifications, newNotification];
        localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updatedNotifications));

        // Dispatch custom event for same-window updates
        window.dispatchEvent(new CustomEvent('notifications-updated'));
        loadNotifications();
    };

    const markAsRead = (notificationId: string) => {
        const allNotifications = JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY) || '[]');
        const updatedNotifications = allNotifications.map((n: Notification) =>
            n.id === notificationId ? { ...n, read: true } : n
        );

        localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updatedNotifications));
        window.dispatchEvent(new CustomEvent('notifications-updated'));
        loadNotifications();
    };

    const markAllAsRead = () => {
        if (!userId) return;

        const allNotifications = JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY) || '[]');
        const updatedNotifications = allNotifications.map((n: Notification) =>
            (n.userId === userId || n.userId === 'all') ? { ...n, read: true } : n
        );

        localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updatedNotifications));
        window.dispatchEvent(new CustomEvent('notifications-updated'));
        loadNotifications();
    };

    const clearNotifications = () => {
        if (!userId) return;

        const allNotifications = JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY) || '[]');
        const filteredNotifications = allNotifications.filter((n: Notification) =>
            n.userId !== userId && n.userId !== 'all'
        );

        localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(filteredNotifications));
        window.dispatchEvent(new CustomEvent('notifications-updated'));
        loadNotifications();
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
