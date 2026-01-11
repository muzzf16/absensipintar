import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check } from 'lucide-react';
import api from '../utils/axiosConfig';

const NotificationDropdown = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const lastNotifIdRef = useRef(null);

    // Request Notification Permission on mount
    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

    // Polling Logic
    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const res = await api.get('/notifications');
                const { notifications: newNotifs, unreadCount: count } = res.data;

                // Check for new notification to trigger Browser Popup
                if (newNotifs.length > 0) {
                    const latest = newNotifs[0];
                    if (lastNotifIdRef.current && latest.id !== lastNotifIdRef.current) {
                        // Trigger Browser Notification
                        if ('Notification' in window && Notification.permission === 'granted') {
                            new Notification(latest.title, {
                                body: latest.message,
                                icon: '/icon-192.png' // Corrected path
                            });
                        }
                    }
                    lastNotifIdRef.current = latest.id;
                }

                setNotifications(newNotifs);
                setUnreadCount(count);
            } catch (error) {
                console.error('Error fetching notifications:', error);
            }
        };

        fetchNotifications(); // Initial fetch
        const interval = setInterval(fetchNotifications, 30000); // Poll every 30s

        return () => clearInterval(interval);
    }, []);

    const markAsRead = async (id, e) => {
        e.stopPropagation();
        try {
            await api.put(`/notifications/${id}/read`);
            // Optimistic update
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking read:', error);
        }
    };

    const markAllRead = async () => {
        try {
            await api.put('/notifications/all/read');
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all read:', error);
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                title="Notifikasi"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
                )}
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-100 rounded-xl shadow-lg z-50 max-h-[400px] overflow-hidden flex flex-col">
                        <div className="p-3 border-b border-gray-50 flex justify-between items-center bg-gray-50">
                            <h3 className="text-sm font-bold text-gray-800">Notifikasi</h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllRead}
                                    className="text-[10px] text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    Tandai semua dibaca
                                </button>
                            )}
                        </div>

                        <div className="overflow-y-auto flex-1 p-2 space-y-1">
                            {notifications.length > 0 ? (
                                notifications.map((notif) => (
                                    <div
                                        key={notif.id}
                                        className={`p-3 rounded-lg text-left transition-colors ${notif.isRead ? 'bg-white hover:bg-gray-50' : 'bg-blue-50/50 hover:bg-blue-50'}`}
                                    >
                                        <div className="flex justify-between items-start gap-2">
                                            <div>
                                                <h4 className={`text-xs font-bold ${notif.isRead ? 'text-gray-700' : 'text-blue-700'}`}>
                                                    {notif.title}
                                                </h4>
                                                <p className="text-xs text-gray-500 mt-0.5 leading-snug">
                                                    {notif.message}
                                                </p>
                                                <p className="text-[10px] text-gray-400 mt-1">
                                                    {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(notif.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                            {!notif.isRead && (
                                                <button
                                                    onClick={(e) => markAsRead(notif.id, e)}
                                                    className="text-blue-400 hover:text-blue-600 p-1"
                                                    title="Tandai dibaca"
                                                >
                                                    <Check size={12} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-8 text-center">
                                    <p className="text-xs text-gray-400">Tidak ada notifikasi baru.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default NotificationDropdown;
