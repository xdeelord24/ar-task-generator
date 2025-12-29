import React from 'react';
import {
    User,
    Palette,
    Settings,
    Bell,
    Command,
    Gift,
    Download,
    HelpCircle,
    Trash2,
    LogOut,
    Smile,
    ChevronRight,
    Volume2
} from 'lucide-react';
import '../styles/ProfileDropdown.css';

interface ProfileDropdownProps {
    onClose: () => void;
    position?: 'left' | 'right';
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ onClose, position = 'right' }) => {
    return (
        <div
            className="profile-dropdown"
            onClick={(e) => e.stopPropagation()}
            style={{ [position]: '16px' }}
        >
            <div className="profile-dropdown-header">
                <div className="profile-avatar-large">
                    JM
                    <div className="status-indicator"></div>
                </div>
                <div className="profile-info">
                    <span className="profile-name">Jundee Mark Gerona Molina</span>
                    <span className="profile-status-text">Online</span>
                </div>
            </div>

            <button className="dropdown-item status-box" onClick={onClose}>
                <Smile size={16} className="dropdown-item-icon" />
                <span>Set status</span>
            </button>

            <div className="profile-dropdown-section">
                <button className="dropdown-item" onClick={onClose}>
                    <Volume2 size={18} className="dropdown-item-icon" />
                    <span>Mute notifications</span>
                    <ChevronRight size={14} className="chevron" />
                </button>
            </div>

            <div className="profile-dropdown-section">
                <button className="dropdown-item" onClick={onClose}>
                    <User size={18} className="dropdown-item-icon" />
                    <span>Profile</span>
                </button>
                <button className="dropdown-item" onClick={onClose}>
                    <Palette size={18} className="dropdown-item-icon" />
                    <span>Themes</span>
                </button>
                <button className="dropdown-item" onClick={onClose}>
                    <Settings size={18} className="dropdown-item-icon" />
                    <span>Settings</span>
                </button>
                <button className="dropdown-item" onClick={onClose}>
                    <Bell size={18} className="dropdown-item-icon" />
                    <span>Notification settings</span>
                </button>
            </div>

            <div className="profile-dropdown-section">
                <button className="dropdown-item" onClick={onClose}>
                    <Command size={18} className="dropdown-item-icon" />
                    <span>Keyboard shortcuts</span>
                </button>
                <button className="dropdown-item" onClick={onClose}>
                    <Gift size={18} className="dropdown-item-icon" />
                    <span>Referrals</span>
                </button>
                <button className="dropdown-item" onClick={onClose}>
                    <Download size={18} className="dropdown-item-icon" />
                    <span>Download apps</span>
                </button>
                <button className="dropdown-item" onClick={onClose}>
                    <HelpCircle size={18} className="dropdown-item-icon" />
                    <span>Help</span>
                </button>
            </div>

            <div className="profile-dropdown-section">
                <button className="dropdown-item" onClick={onClose}>
                    <Trash2 size={18} className="dropdown-item-icon" />
                    <span>Trash</span>
                </button>
                <button className="dropdown-item" onClick={onClose}>
                    <LogOut size={18} className="dropdown-item-icon" />
                    <span>Log out</span>
                </button>
            </div>

            <div className="promo-banner">
                <div className="promo-content">
                    <span className="promo-title">A New Era of AR Gen is Here</span>
                    <span className="promo-subtitle">Polished, powerful, and perfectly crafted.</span>
                    <button className="btn-try" onClick={onClose}>Try 4.0</button>
                </div>
            </div>
        </div>
    );
};

export default ProfileDropdown;
