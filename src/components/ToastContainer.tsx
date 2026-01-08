import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { X, CheckCircle, Info, AlertTriangle, Bell, Mail } from 'lucide-react';
import '../styles/Toast.css';

const ToastContainer: React.FC = () => {
    const { toasts, removeToast } = useAppStore();

    if (toasts.length === 0) return null;

    return (
        <div className="toast-container">
            {toasts.map((toast) => (
                <div key={toast.id} className={`toast-item ${toast.type}`}>
                    <div className="toast-icon">
                        {toast.type === 'success' && <CheckCircle size={18} />}
                        {toast.type === 'info' && <Info size={18} />}
                        {toast.type === 'error' && <AlertTriangle size={18} />}
                        {toast.type === 'warning' && <AlertTriangle size={18} />}
                        {toast.type === 'notification' && <Bell size={18} />}
                        {toast.type === 'invite' && <Mail size={18} />}
                    </div>
                    <div className="toast-content">
                        <div className="toast-title">{toast.title}</div>
                        <div className="toast-message">{toast.message}</div>
                    </div>
                    <button className="toast-close" onClick={() => removeToast(toast.id)}>
                        <X size={14} />
                    </button>
                    <div className="toast-progress">
                        <div
                            className="toast-progress-bar"
                            style={{ animationDuration: `${toast.duration || 5000}ms` }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ToastContainer;
