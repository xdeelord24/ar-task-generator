import React from 'react';
import { X, ExternalLink, Download, FileText } from 'lucide-react';
import type { Attachment } from '../types';

interface FilePreviewModalProps {
    attachment: Attachment;
    onClose: () => void;
}

const FilePreviewModal: React.FC<FilePreviewModalProps> = ({ attachment, onClose }) => {
    const isImage = attachment.type.startsWith('image/');
    const isPDF = attachment.type === 'application/pdf';

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = attachment.url;
        link.download = attachment.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleOpenFullscreen = () => {
        const newWindow = window.open();
        if (newWindow) {
            if (isImage) {
                newWindow.document.write(`<img src="${attachment.url}" style="max-width:100%; height:auto;" />`);
            } else if (isPDF) {
                newWindow.document.write(
                    `<iframe src="${attachment.url}" frameborder="0" style="position:fixed; top:0; left:0; bottom:0; right:0; width:100%; height:100%; border:none; margin:0; padding:0; overflow:hidden;"></iframe>`
                );
            } else {
                newWindow.location.href = attachment.url;
            }
            newWindow.document.title = attachment.name;
        }
    };

    return (
        <div className="modal-overlay" style={{ zIndex: 3000 }} onClick={onClose}>
            <div
                className="modal-content file-preview-modal"
                onClick={e => e.stopPropagation()}
                style={{
                    width: '80vw',
                    height: '80vh',
                    maxWidth: '1200px',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: 0,
                    background: 'var(--bg-surface)',
                    borderRadius: '12px',
                    overflow: 'hidden'
                }}
            >
                <div className="preview-header" style={{
                    padding: '16px 24px',
                    borderBottom: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'var(--bg-surface)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
                        <div style={{
                            width: '32px', height: '32px', borderRadius: '6px',
                            background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <FileText size={18} style={{ color: 'var(--text-secondary)' }} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                            <span style={{ fontWeight: 600, fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {attachment.name}
                            </span>
                            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                                {attachment.size < 1024 * 1024
                                    ? Math.round(attachment.size / 1024) + ' KB'
                                    : (attachment.size / (1024 * 1024)).toFixed(1) + ' MB'}
                            </span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            className="btn-secondary"
                            onClick={handleOpenFullscreen}
                            title="Open in new tab"
                            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px' }}
                        >
                            <ExternalLink size={14} />
                            <span>Open New Tab</span>
                        </button>
                        <button
                            className="btn-primary"
                            onClick={handleDownload}
                            title="Download"
                            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px' }}
                        >
                            <Download size={14} />
                            <span>Download</span>
                        </button>
                        <button
                            className="icon-btn-ghost"
                            onClick={onClose}
                            style={{ marginLeft: '8px' }}
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="preview-body" style={{
                    flex: 1,
                    background: 'var(--bg-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    position: 'relative'
                }}>
                    {isImage ? (
                        <img
                            src={attachment.url}
                            alt={attachment.name}
                            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                        />
                    ) : (
                        <iframe
                            src={attachment.url}
                            style={{ width: '100%', height: '100%', border: 'none' }}
                            title="File Preview"
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default FilePreviewModal;
