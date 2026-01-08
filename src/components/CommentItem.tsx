import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { format, parseISO } from 'date-fns';
import type { Comment } from '../types';
import { FileText } from 'lucide-react';

interface CommentItemProps {
    comment: Comment;
    onImageClick: (src: string) => void;
    onAttachmentClick: (attachment: any) => void;
}

const CommentItem: React.FC<CommentItemProps> = React.memo(({ comment, onImageClick, onAttachmentClick }) => {
    return (
        <div className="activity-row" style={{ marginBottom: '16px' }}>
            <div className="activity-avatar">{comment.userName[0]}</div>
            <div className="activity-info">
                <div className="activity-msg-header"><strong>{comment.userName}</strong></div>
                {comment.text && (
                    <div className="activity-msg">
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            urlTransform={(url) => url}
                            components={{
                                img: ({ node, ...props }) => (
                                    <img
                                        {...props}
                                        style={{ maxWidth: '100%', borderRadius: '8px', marginTop: '8px', cursor: 'pointer' }}
                                        onClick={() => onImageClick(props.src || '')}
                                    />
                                ),
                                a: ({ node, ...props }) => (
                                    <a
                                        {...props}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ color: 'var(--primary)', textDecoration: 'underline' }}
                                    />
                                ),
                                strong: ({ node, children, ...props }) => {
                                    const content = children?.toString() || '';
                                    if (content.startsWith('@')) {
                                        return (
                                            <span className="mention-pill" style={{
                                                backgroundColor: '#e0f2fe',
                                                color: '#0369a1',
                                                padding: '2px 6px',
                                                borderRadius: '4px',
                                                fontWeight: 600,
                                                fontSize: '0.9em',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                cursor: 'default'
                                            }}>
                                                {children}
                                            </span>
                                        );
                                    }
                                    return <strong {...props}>{children}</strong>;
                                }
                            }}
                        >
                            {comment.text}
                        </ReactMarkdown>
                    </div>
                )}

                {comment.attachments && comment.attachments.length > 0 && (
                    <div className="activity-attachments" style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {comment.attachments.map((att: any) => {
                            const isImage = att.type.startsWith('image/');
                            return (
                                <div
                                    key={att.id}
                                    className="attachment-chip"
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '6px',
                                        background: 'var(--bg-secondary)', padding: '6px 10px', borderRadius: '6px',
                                        fontSize: '12px', border: '1px solid var(--border)',
                                        textDecoration: 'none', color: 'var(--text-main)',
                                        transition: 'background 0.2s',
                                        cursor: 'pointer',
                                        userSelect: 'none'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onAttachmentClick(att);
                                    }}
                                >
                                    <FileText size={14} style={{ color: 'var(--icon-color, #64748b)' }} />
                                    <span style={{ fontWeight: 500 }}>{att.name}</span>
                                    <span style={{ color: 'var(--text-tertiary)', fontSize: '11px', marginLeft: '4px' }}>
                                        {att.size < 1024 * 1024
                                            ? Math.round(att.size / 1024) + ' KB'
                                            : (att.size / (1024 * 1024)).toFixed(1) + ' MB'}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}

                <div className="activity-time">{format(parseISO(comment.createdAt), 'MMM d, h:mm a')}</div>
            </div>
        </div>
    );
});

CommentItem.displayName = 'CommentItem';

export default CommentItem;
