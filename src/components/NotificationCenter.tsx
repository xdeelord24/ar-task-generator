import { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import '../styles/NotificationCenter.css';

interface NotificationCenterProps {
    onTaskClick?: (taskId: string) => void;
}

const NotificationCenter = ({ onTaskClick }: NotificationCenterProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const {
        notifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        clearNotification,
        clearAllNotifications
    } = useAppStore();

    const unreadCount = notifications.filter(n => !n.isRead).length;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleNotificationClick = (notification: any) => {
        markNotificationAsRead(notification.id);
        if (notification.taskId && onTaskClick) {
            onTaskClick(notification.taskId);
            setIsOpen(false);
        }
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'overdue': return '⚠️';
            case 'due_soon': return '⏰';
            case 'task_assigned': return '👤';
            case 'task_completed': return '✅';
            case 'comment_added': return '💬';
            default: return '🔔';
        }
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="notification-center" ref={dropdownRef}>
            <button
                className="notification-bell"
                onClick={() => setIsOpen(!isOpen)}
                title="Notifications"
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                {unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
                )}
            </button>

            {isOpen && (
                <div className="notification-dropdown">
                    <div className="notification-header">
                        <h3>Notifications</h3>
                        <div className="notification-actions">
                            {notifications.length > 0 && (
                                <>
                                    {unreadCount > 0 && (
                                        <button
                                            className="mark-all-read"
                                            onClick={markAllNotificationsAsRead}
                                            title="Mark all as read"
                                        >
                                            Mark all read
                                        </button>
                                    )}
                                    <button
                                        className="clear-all"
                                        onClick={clearAllNotifications}
                                        title="Clear all"
                                    >
                                        Clear all
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="notification-list">
                        {notifications.length === 0 ? (
                            <div className="notification-empty">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                                </svg>
                                <p>No notifications</p>
                            </div>
                        ) : (
                            notifications.map(notification => (
                                <div
                                    key={notification.id}
                                    className={`notification-item ${!notification.isRead ? 'unread' : ''} ${notification.taskId ? 'clickable' : ''}`}
                                    onClick={() => handleNotificationClick(notification)}
                                >
                                    <div className="notification-icon">
                                        {getNotificationIcon(notification.type)}
                                    </div>
                                    <div className="notification-content">
                                        <div className="notification-title">{notification.title}</div>
                                        <div className="notification-message">{notification.message}</div>
                                        <div className="notification-time">{formatTime(notification.createdAt)}</div>
                                    </div>
                                    <button
                                        className="notification-close"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            clearNotification(notification.id);
                                        }}
                                        title="Dismiss"
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <line x1="18" y1="6" x2="6" y2="18" />
                                            <line x1="6" y1="6" x2="18" y2="18" />
                                        </svg>
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationCenter;
