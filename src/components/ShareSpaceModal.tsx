import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { X, Link, Lock, ChevronDown, User, Check, AlertCircle } from 'lucide-react';
import '../styles/ShareSpaceModal.css';

interface ShareSpaceModalProps {
    spaceId: string;
    spaceName: string;
    onClose: () => void;
}

const ShareSpaceModal: React.FC<ShareSpaceModalProps> = ({ spaceId, spaceName, onClose }) => {
    const [email, setEmail] = useState('');
    const [permission, setPermission] = useState('Full edit');
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const { token } = useAuthStore();

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setIsLoading(true);
        setStatus('idle');
        setMessage('');

        try {
            const res = await fetch('http://localhost:3001/api/invite', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    email,
                    resourceType: 'space',
                    resourceId: spaceId,
                    permission: permission === 'Full edit' ? 'edit' : 'view'
                })
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error);

            setStatus('success');
            setMessage('Invitation sent successfully!');
            setEmail('');
            setTimeout(() => setStatus('idle'), 3000);
        } catch (err: any) {
            setStatus('error');
            setMessage(err.message || 'Failed to send invite');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="share-modal" onClick={e => e.stopPropagation()}>
                <div className="share-header">
                    <div>
                        <div className="share-title-row">
                            <h2 className="share-title">Share this Space</h2>
                        </div>
                        <div className="share-subtitle">
                            Sharing Space with all views <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>• {spaceName}</span>
                        </div>
                    </div>
                    <button className="close-share-btn" onClick={onClose}>
                        <X size={18} />
                    </button>
                </div>

                <div className="share-body">
                    <form onSubmit={handleInvite} className="invite-section">
                        <div className="invite-input-row">
                            <input
                                type="text"
                                className="invite-input"
                                placeholder="Invite by name or email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                            />
                            <button
                                type="submit"
                                className="invite-btn"
                                disabled={!email || isLoading}
                                style={{ opacity: isLoading ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: '6px' }}
                            >
                                {isLoading ? 'Sending...' : 'Invite'}
                            </button>
                        </div>
                        {status !== 'idle' && (
                            <div style={{
                                marginTop: '8px',
                                fontSize: '13px',
                                color: status === 'success' ? '#10b981' : '#ef4444',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}>
                                {status === 'success' ? <Check size={14} /> : <AlertCircle size={14} />}
                                {message}
                            </div>
                        )}
                    </form>

                    <div className="link-section">
                        <div className="link-left">
                            <Link size={16} />
                            <span>Private link</span>
                            <span style={{ color: 'var(--text-tertiary)' }}>(i)</span>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                                className="copy-link-btn"
                                onClick={() => {
                                    navigator.clipboard.writeText(window.location.href);
                                    setMessage('Link copied to clipboard');
                                    setStatus('success');
                                    setTimeout(() => {
                                        setStatus('idle');
                                        setMessage('');
                                    }, 2000);
                                }}
                            >
                                Copy link
                            </button>
                        </div>
                    </div>

                    <div className="link-section">
                        <div className="link-left">
                            <User size={16} />
                            <span>Default permission</span>
                        </div>
                        <div className="permission-selector">
                            <button
                                className="copy-link-btn"
                                style={{ minWidth: '100px', justifyContent: 'space-between' }}
                                onClick={() => setPermission(prev => prev === 'Full edit' ? 'View only' : 'Full edit')}
                            >
                                {permission} <ChevronDown size={14} />
                            </button>
                        </div>
                    </div>

                    <div className="members-section">
                        <h4>Share with</h4>
                        <div className="member-list">

                            {/* Workspace */}
                            <div className="member-item">
                                <div className="member-info">
                                    <div className="member-avatar" style={{ background: '#10b981' }}>M</div>
                                    <div className="member-details">
                                        <span className="member-name">My Workspace</span>
                                        <span className="member-email" style={{ fontSize: '11px', background: 'var(--bg-active)', padding: '2px 6px', borderRadius: '4px', width: 'fit-content' }}>Workspace</span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <div className="member-avatars-small" style={{ display: 'flex' }}>
                                        <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#64748b', color: 'white', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>RM</div>
                                        <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#6366f1', color: 'white', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: '-8px' }}>JM</div>
                                    </div>
                                    <div style={{ width: 36, height: 20, background: '#3b82f6', borderRadius: '10px', position: 'relative' }}>
                                        <div style={{ width: 16, height: 16, background: 'white', borderRadius: '50%', position: 'absolute', right: 2, top: 2 }}></div>
                                    </div>
                                </div>
                            </div>

                            {/* People Group */}
                            <div className="member-item" style={{ marginTop: '12px' }}>
                                <div className="member-info">
                                    <div style={{ width: 32, display: 'flex', justifyContent: 'center' }}><User size={18} /></div>
                                    <div className="member-details">
                                        <span className="member-name">People</span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#6366f1', color: 'white', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>JM</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="share-footer">
                    <button
                        className="make-private-btn"
                        onClick={() => {
                            setMessage('Space is now private');
                            setStatus('success');
                            setTimeout(() => {
                                setStatus('idle');
                                setMessage('');
                            }, 2000);
                        }}
                    >
                        <Lock size={14} />
                        Make Private
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ShareSpaceModal;
