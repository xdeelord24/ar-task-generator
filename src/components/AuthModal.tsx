import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { Mail, Lock, User, Facebook, Chrome, ArrowRight, CheckCircle2 } from 'lucide-react';
import '../styles/AuthModal.css';

interface AuthModalProps {
    isOpen: boolean;
    onClose?: () => void;
}

import { API_BASE_URL } from '../config';

const SERVER_URL = `${API_BASE_URL}/api/auth`;

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const login = useAuthStore((state) => state.login);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const endpoint = isLogin ? '/login' : '/register';
            const body = isLogin ? { email, password } : { email, password, name };

            const res = await fetch(`${SERVER_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Authentication failed');
            }

            login(data.user, data.token);
            if (onClose) onClose();

            // Force reload to ensure fresh store state is fetched from server
            setTimeout(() => {
                window.location.reload();
            }, 100);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSocialLogin = async (provider: 'google' | 'facebook') => {
        const mockUser = {
            email: `demo.${provider}@example.com`,
            name: `Demo ${provider} User`,
            picture: `https://ui-avatars.com/api/?name=${provider}&background=random`,
            sub: `mock-${provider}-id-${Math.random()}`
        };

        try {
            setIsLoading(true);
            const res = await fetch(`${SERVER_URL}/${provider}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token: 'mock-client-token',
                    user: mockUser,
                    accessToken: 'mock-access-token',
                    userID: mockUser.sub,
                    userInfo: mockUser
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            login(data.user, data.token);
            if (onClose) onClose();

            // Force reload
            setTimeout(() => {
                window.location.reload();
            }, 100);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-modal-overlay">
            {/* Background Decoration */}
            <div className="auth-bg-decoration">
                <div className="bg-orb blue" />
                <div className="bg-orb purple" />
            </div>

            <div className="auth-card">

                {/* Visual Side */}
                <div className="auth-visual-side">
                    <div className="visual-content">
                        <div className="brand-header">
                            <div className="brand-icon">
                                <CheckCircle2 color="white" size={24} />
                            </div>
                            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>AR Generator</h1>
                        </div>
                        <h2 className="visual-heading">
                            Manage your tasks <br /> with <span className="highlight-text">Artificial Intelligence</span>
                        </h2>
                        <p className="visual-description">
                            Organize, automate, and accelerate your productivity with our next-gen platform.
                        </p>
                    </div>

                    <div className="visual-footer">
                        <div style={{ display: 'flex', gap: '-10px', marginBottom: '1rem' }}>
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} style={{ width: 40, height: 40, borderRadius: '50%', overflow: 'hidden', border: '2px solid #6366f1', marginLeft: i > 1 ? -15 : 0, zIndex: 10 - i, background: 'white' }}>
                                    <img src={`https://ui-avatars.com/api/?name=User+${i}&background=random`} alt="User" style={{ width: '100%', height: '100%' }} />
                                </div>
                            ))}
                        </div>
                        <p style={{ fontSize: '0.875rem', fontWeight: 500, color: '#dbeafe' }}>Trusted by over 2,000 teams relying on Autopilot.</p>
                    </div>

                    {/* Abstract Shapes */}
                    <div className="spin-shape large" />
                    <div className="spin-shape medium" />
                </div>

                {/* Form Side */}
                <div className="auth-form-side">
                    <div className="form-container">
                        <div className="auth-header">
                            <h2 className="auth-title">
                                {isLogin ? 'Welcome Back' : 'Create Account'}
                            </h2>
                            <p className="auth-subtitle">
                                {isLogin ? 'Enter your credentials to access your account' : 'Start your journey with us today'}
                            </p>
                        </div>

                        {/* Social Auth */}
                        <div className="social-buttons">
                            <button onClick={() => handleSocialLogin('google')} className="btn-social">
                                <Chrome size={20} color="white" />
                                Google
                            </button>
                            <button onClick={() => handleSocialLogin('facebook')} className="btn-social">
                                <Facebook size={20} color="#3b82f6" />
                                Facebook
                            </button>
                        </div>

                        <div className="auth-divider">
                            <span className="divider-text">Or continue with</span>
                        </div>

                        <form onSubmit={handleSubmit}>
                            {error && (
                                <div className="error-box">
                                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444' }}></span>
                                    {error}
                                </div>
                            )}

                            {!isLogin && (
                                <div className="form-group">
                                    <label className="input-label">Full Name</label>
                                    <div className="input-wrapper">
                                        <User className="input-icon" size={20} />
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="John Doe"
                                            required
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="form-group">
                                <label className="input-label">Email</label>
                                <div className="input-wrapper">
                                    <Mail className="input-icon" size={20} />
                                    <input
                                        type="email"
                                        className="form-input"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="name@example.com"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="input-label">Password</label>
                                <div className="input-wrapper">
                                    <Lock className="input-icon" size={20} />
                                    <input
                                        type="password"
                                        className="form-input"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>

                            <button type="submit" disabled={isLoading} className="btn-submit">
                                {isLoading ? (
                                    <span style={{ display: 'inline-block', width: 20, height: 20, border: '3px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></span>
                                ) : (
                                    <>
                                        {isLogin ? 'Sign In' : 'Create Account'}
                                        <ArrowRight size={20} />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="auth-footer">
                            <p>
                                {isLogin ? "Don't have an account?" : "Already have an account?"}
                                <button
                                    onClick={() => setIsLogin(!isLogin)}
                                    className="link-toggle"
                                >
                                    {isLogin ? 'Sign Up Now' : 'Sign In'}
                                </button>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
