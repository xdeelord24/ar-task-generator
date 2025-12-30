import React, { useState } from 'react';
import { Image as ImageIcon, Sparkles, Send, X } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

interface CommentComposerProps {
    taskId: string;
    isSubtask: boolean;
    onAIRequest?: (query: string) => Promise<void>;
}

const CommentComposer: React.FC<CommentComposerProps> = ({ taskId, isSubtask, onAIRequest }) => {
    const { addComment } = useAppStore();
    const [commentText, setCommentText] = useState('');
    const [pastedImages, setPastedImages] = useState<string[]>([]);

    const handleAddComment = () => {
        if (isSubtask) {
            alert('Comments on subtasks not supported locally yet.');
            return;
        }
        if (!commentText.trim() && pastedImages.length === 0) return;

        // Auto-convert plain URLs to markdown links if not already markdown
        let formattedText = commentText;
        const urlRegex = /(?<!\()https?:\/\/[^\s]+(?!\))/g;
        formattedText = formattedText.replace(urlRegex, (url) => `[${url}](${url})`);

        // Append images
        if (pastedImages.length > 0) {
            formattedText += '\n\n' + pastedImages.map(img => `![Image](${img})`).join('\n\n');
        }

        addComment(taskId, {
            userId: 'user-1',
            userName: 'Jundee',
            text: formattedText
        });

        // AI Logic
        if (commentText.includes('@AI') && onAIRequest) {
            const query = commentText.replace(/@AI/g, '').trim();
            onAIRequest(query);
        }

        setCommentText('');
        setPastedImages([]);
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        const items = e.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const file = items[i].getAsFile();
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        const base64 = event.target?.result;
                        if (typeof base64 === 'string') {
                            setPastedImages(prev => [...prev, base64]);
                        }
                    };
                    reader.readAsDataURL(file);
                }
            }
        }
    };

    return (
        <div className="comment-composer">
            {pastedImages.length > 0 && (
                <div className="pasted-images-preview">
                    {pastedImages.map((img, index) => (
                        <div key={index} className="preview-image-container">
                            <img src={img} alt="Pasted" className="preview-image" />
                            <button
                                className="remove-image-btn"
                                onClick={() => setPastedImages(prev => prev.filter((_, i) => i !== index))}
                            >
                                <X size={12} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
            <textarea
                placeholder="Write a comment... use @AI to ask AI"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleAddComment();
                    }
                }}
                onPaste={handlePaste}
                rows={1}
                style={{
                    height: 'auto',
                    minHeight: '40px',
                    maxHeight: '120px',
                    resize: 'none'
                }}
            />
            <div className="composer-actions">
                <button className="icon-btn-sm" title="Paste Image (Experimental)">
                    <ImageIcon size={14} />
                </button>
                <button
                    className="icon-btn-sm"
                    title="Ask AI"
                    onClick={() => setCommentText(prev => prev.includes('@AI') ? prev : prev + '@AI ')}
                    style={{ color: '#a855f7' }}
                >
                    <Sparkles size={14} />
                </button>
                <button
                    className="icon-btn-sm"
                    onClick={handleAddComment}
                    disabled={!commentText.trim() && pastedImages.length === 0}
                >
                    <Send size={14} />
                </button>
            </div>
        </div>
    );
};

export default CommentComposer;
