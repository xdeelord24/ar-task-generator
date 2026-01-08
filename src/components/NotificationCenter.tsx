import { useState, useRef, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import { useAppStore } from '../store/useAppStore';
import { useAuthStore } from '../store/useAuthStore';
import '../styles/NotificationCenter.css';
import { Bell, Clock, UserPlus, CheckCircle2, MessageSquare, AlertCircle, AtSign, Mail } from 'lucide-react';

interface NotificationCenterProps {
    onTaskClick?: (taskId: string) => void;
}

const NotificationCenter = ({ onTaskClick }: NotificationCenterProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { token } = useAuthStore();
    const {
        notifications,
        invitations: storeInvitations,
        setInvitations: setStoreInvitations,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        clearNotification,
        clearAllNotifications,
        syncSharedData
    } = useAppStore();

    // Map invitations to match notification structure
    const mappedInvitations = (storeInvitations || []).map(inv => ({
        id: inv.id,
        type: 'invite',
        title: 'Space Invitation',
        message: `You invited to join ${inv.resource_type}`,
        createdAt: inv.created_at, // Postgres snake_case vs JS camelCase
        isRead: inv.isRead || false,
        isInvitation: true, // Flag to distinguish
        raw: inv
    }));

    const handleAcceptInvitation = async (invite: any) => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/invitations/${invite.id}/accept`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setStoreInvitations((storeInvitations || []).filter(i => i.id !== invite.id));
                await syncSharedData();
            }
        } catch (e) {
            console.error('Failed to accept invite', e);
        }
    };

    const handleDeclineInvitation = async (invite: any) => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/invitations/${invite.id}/decline`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setStoreInvitations((storeInvitations || []).filter(i => i.id !== invite.id));
            }
        } catch (e) {
            console.error('Failed to decline invite', e);
        }
    };

    const allItems = [
        ...mappedInvitations,
        ...notifications.filter(n => n.type !== 'invite')
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const unreadCount = allItems.filter(n => !n.isRead).length;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        // ... existing useEffect
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleNotificationClick = (notification: any) => {
        if (notification.isInvitation) {
            // Navigate to Inbox or just close. 
            // Ideally should redirect to InboxView tab=invites
            setIsOpen(false);
            window.location.hash = '#/inbox'; // Simple nav if using hash router, or just use App router logic
            useAppStore.getState().setCurrentView('inbox');
        } else {
            markNotificationAsRead(notification.id);
            if (notification.taskId && onTaskClick) {
                onTaskClick(notification.taskId);
                setIsOpen(false);
            }
        }
    };

    // ... getNotificationIcon
    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'overdue': return <AlertCircle size={16} className="text-red-500" />;
            case 'due_soon': return <Clock size={16} className="text-orange-500" />;
            case 'task_assigned': return <UserPlus size={16} className="text-green-500" />;
            case 'task_completed': return <CheckCircle2 size={16} className="text-blue-500" />;
            case 'comment_added': return <MessageSquare size={16} className="text-purple-500" />;
            case 'mention': return <AtSign size={16} className="text-blue-500" />;
            case 'invite': return <Mail size={16} className="text-purple-500" />;
            default: return <Bell size={16} className="text-gray-500" />;
        }
    };

    const formatTime = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        // ... existing logic
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
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
                )}
            </button>

            {isOpen && (
                <div className="notification-dropdown">
                    <div className="notification-header">
                        <h3>Notifications</h3>
                        <div className="notification-actions">
                            {allItems.length > 0 && (
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
                        {allItems.length === 0 ? (
                            <div className="notification-empty">
                                <Bell size={48} className="opacity-50 mb-3" />
                                <p>No notifications</p>
                            </div>
                        ) : (
                            allItems.map((notification: any) => (
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
                                        {notification.isInvitation && (
                                            <div className="notification-invite-actions" style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleAcceptInvitation(notification.raw);
                                                    }}
                                                    className="btn-accept-sm"
                                                    style={{
                                                        padding: '4px 8px',
                                                        fontSize: '11px',
                                                        borderRadius: '4px',
                                                        background: 'var(--primary)',
                                                        color: 'white',
                                                        border: 'none',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    Accept
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeclineInvitation(notification.raw);
                                                    }}
                                                    className="btn-decline-sm"
                                                    style={{
                                                        padding: '4px 8px',
                                                        fontSize: '11px',
                                                        borderRadius: '4px',
                                                        background: 'var(--bg-secondary)',
                                                        color: 'var(--text-secondary)',
                                                        border: '1px solid var(--border-color)',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    Decline
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    {!notification.isInvitation && (
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
                                    )}
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
