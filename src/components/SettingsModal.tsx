import React, { useState } from 'react';
import {
    X, User, Palette, Settings, Bell, Command,
    Gift, Download, HelpCircle, Trash2, LogOut,
    Check, Moon, Sun, Monitor, Coffee
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import '../styles/SettingsModal.css';

interface SettingsModalProps {
    onClose: () => void;
    initialTab?: string;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose, initialTab = 'profile' }) => {
    const [activeTab, setActiveTab] = useState(initialTab);
    const { theme, setTheme, accentColor, setAccentColor } = useAppStore();

    const sidebarItems = [
        { id: 'profile', icon: User, label: 'My Profile' },
        { id: 'themes', icon: Palette, label: 'Themes' },
        { id: 'settings', icon: Settings, label: 'General Settings' },
        { id: 'notifications', icon: Bell, label: 'Notifications' },
        { id: 'shortcuts', icon: Command, label: 'Keyboard Shortcuts' },
        { id: 'support', icon: Coffee, label: 'Support' },
    ];

    const secondaryItems = [
        { id: 'referrals', icon: Gift, label: 'Referrals' },
        { id: 'downloads', icon: Download, label: 'Downloads' },
        { id: 'help', icon: HelpCircle, label: 'Help Center' },
        { id: 'trash', icon: Trash2, label: 'Trash' },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'profile':
                return (
                    <div className="settings-content-pane">
                        <h2>My Profile</h2>
                        <div className="profile-edit-section">
                            <div className="profile-avatar-upload">
                                <div className="avatar-preview">JM</div>
                                <button className="btn-secondary">Change Photo</button>
                            </div>
                            <div className="form-group">
                                <label>Full Name</label>
                                <input type="text" defaultValue="Jundee Mark Gerona Molina" />
                            </div>
                            <div className="form-group">
                                <label>Email Address</label>
                                <input type="email" defaultValue="jundee@example.com" />
                            </div>
                            <div className="form-group">
                                <label>Job Title</label>
                                <input type="text" defaultValue="Full Stack Developer" />
                            </div>
                        </div>
                    </div>
                );
            case 'themes':
                return (
                    <div className="settings-content-pane">
                        <h2>Themes</h2>
                        <div className="themes-grid">
                            {[
                                { id: 'light', icon: Sun, label: 'Light' },
                                { id: 'dark', icon: Moon, label: 'Dark' },
                                { id: 'system', icon: Monitor, label: 'System' }
                            ].map((t) => (
                                <div
                                    key={t.id}
                                    className={`theme-card ${theme === t.id ? 'active' : ''}`}
                                    onClick={() => setTheme(t.id as any)}
                                >
                                    <t.icon size={24} />
                                    <span>{t.label}</span>
                                    {theme === t.id && <Check size={16} className="check-icon" />}
                                </div>
                            ))}
                        </div>
                        <div className="color-presets">
                            <h3>Accent Color</h3>
                            <div className="colors-row">
                                {['#2563eb', '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981'].map(color => (
                                    <div
                                        key={color}
                                        className={`color-circle ${accentColor === color ? 'active' : ''}`}
                                        style={{ backgroundColor: color }}
                                        onClick={() => setAccentColor(color)}
                                    >
                                        {accentColor === color && <Check size={14} color="white" />}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            case 'shortcuts':
                return (
                    <div className="settings-content-pane">
                        <h2>Keyboard Shortcuts</h2>
                        <div className="shortcuts-list">
                            <div className="shortcut-group">
                                <h3>Common</h3>
                                <div className="shortcut-item">
                                    <span>Create new task</span>
                                    <kbd>t</kbd>
                                </div>
                                <div className="shortcut-item">
                                    <span>Quick search</span>
                                    <kbd>/</kbd>
                                </div>
                                <div className="shortcut-item">
                                    <span>Close modal</span>
                                    <kbd>esc</kbd>
                                </div>
                            </div>
                            <div className="shortcut-group">
                                <h3>Navigation</h3>
                                <div className="shortcut-item">
                                    <span>Go to Home</span>
                                    <kbd>g</kbd> <kbd>h</kbd>
                                </div>
                                <div className="shortcut-item">
                                    <span>Go to Inbox</span>
                                    <kbd>g</kbd> <kbd>i</kbd>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'support':
                return (
                    <div className="settings-content-pane">
                        <h2>Support this Project</h2>
                        <div className="support-info">
                            <div className="support-message">
                                <Coffee size={48} style={{ marginBottom: '16px', color: 'var(--primary)' }} />
                                <p style={{ fontSize: '16px', marginBottom: '24px', color: 'var(--text-secondary)' }}>
                                    This is an open-source project. If you find it helpful, please consider supporting its development! 💝
                                </p>
                            </div>
                            <div className="qr-support-container" style={{ display: 'flex', gap: '24px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '32px' }}>
                                <div className="qr-support-card" style={{ textAlign: 'center', padding: '20px', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                                    <h4 style={{ marginBottom: '16px' }}>Maribank</h4>
                                    <div id="maribank-qr-settings" style={{ background: 'white', padding: '12px', borderRadius: '8px', display: 'inline-block' }}></div>
                                    <p style={{ marginTop: '12px', fontSize: '14px', color: 'var(--text-secondary)' }}>JUNDEE MARK M.</p>
                                </div>
                                <div className="qr-support-card" style={{ textAlign: 'center', padding: '20px', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                                    <h4 style={{ marginBottom: '16px' }}>Landbank</h4>
                                    <div id="landbank-qr-settings" style={{ background: 'white', padding: '12px', borderRadius: '8px', display: 'inline-block' }}></div>
                                    <p style={{ marginTop: '12px', fontSize: '14px', color: 'var(--text-secondary)' }}>JUNDEE MARK MOLINA</p>
                                </div>
                            </div>
                            <script dangerouslySetInnerHTML={{
                                __html: `
                                setTimeout(() => {
                                    if (typeof QRCode !== 'undefined') {
                                        const maribankEl = document.getElementById('maribank-qr-settings');
                                        const landbankEl = document.getElementById('landbank-qr-settings');
                                        if (maribankEl && !maribankEl.querySelector('canvas')) {
                                            new QRCode(maribankEl, {
                                                text: '00020101021127580012com.p2pqrpay0111LAUIPHM2XXX0208999644030411150909797605204601653036085802PH5914JUNDEE MARK M.6009Pagsanjan63049744',
                                                width: 150,
                                                height: 150
                                            });
                                        }
                                        if (landbankEl && !landbankEl.querySelector('canvas')) {
                                            new QRCode(landbankEl, {
                                                text: '00020101021127750012com.p2pqrpay0111TLBPPHMMXXX020899964403041059470298880514+63-94546802805204601653036085802PH5918JUNDEE MARK MOLINA6006Manila6304EECF',
                                                width: 150,
                                                height: 150
                                            });
                                        }
                                    }
                                }, 200);
                            ` }} />
                        </div>
                    </div>
                );
            default:
                return (
                    <div className="settings-content-pane">
                        <h2>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Settings</h2>
                        <p>Settings for {activeTab} will appear here.</p>
                    </div>
                );
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="settings-modal" onClick={e => e.stopPropagation()}>
                <div className="settings-sidebar">
                    <div className="sidebar-header">
                        <h3>Settings</h3>
                    </div>
                    <div className="sidebar-nav">
                        {sidebarItems.map(item => (
                            <button
                                key={item.id}
                                className={`sidebar-item ${activeTab === item.id ? 'active' : ''}`}
                                onClick={() => setActiveTab(item.id)}
                            >
                                <item.icon size={18} />
                                <span>{item.label}</span>
                            </button>
                        ))}
                        <div className="sidebar-divider"></div>
                        {secondaryItems.map(item => (
                            <button
                                key={item.id}
                                className={`sidebar-item ${activeTab === item.id ? 'active' : ''}`}
                                onClick={() => setActiveTab(item.id)}
                            >
                                <item.icon size={18} />
                                <span>{item.label}</span>
                            </button>
                        ))}
                    </div>
                    <div className="sidebar-footer">
                        <button className="logout-btn" onClick={() => {
                            localStorage.clear();
                            window.location.reload();
                        }}>
                            <LogOut size={18} />
                            <span>Log Out</span>
                        </button>
                    </div>
                </div>

                <div className="settings-main">
                    <button className="close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                    <div className="settings-content">
                        {renderContent()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
