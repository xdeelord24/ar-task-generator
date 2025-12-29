import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Sparkles, Bot, User, Trash2, History } from 'lucide-react';
import '../styles/AIModal.css';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

interface AIModalProps {
    onClose: () => void;
}

const AIModal: React.FC<AIModalProps> = ({ onClose }) => {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage: Message = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        // Simulate AI response
        setTimeout(() => {
            const assistantMessage: Message = {
                role: 'assistant',
                content: `I've analyzed your current tasks. You have 3 pending tasks for today. Would you like me to help you prioritize them?`
            };
            setMessages(prev => [...prev, assistantMessage]);
            setIsLoading(false);
        }, 1000);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content ai-modal" onClick={e => e.stopPropagation()}>
                <div className="ai-modal-header">
                    <div className="ai-title">
                        <Sparkles size={20} className="sparkle-icon" />
                        <span>AI Assistant</span>
                    </div>
                    <div className="ai-actions">
                        <button className="icon-btn-ghost"><History size={18} /></button>
                        <button className="icon-btn-ghost" onClick={() => setMessages([])}><Trash2 size={18} /></button>
                        <button className="icon-btn-ghost" onClick={onClose}><X size={20} /></button>
                    </div>
                </div>

                <div className="ai-chat-container" ref={scrollRef}>
                    {messages.length === 0 ? (
                        <div className="ai-welcome">
                            <div className="ai-avatar-large">
                                <Bot size={40} />
                            </div>
                            <h2>How can I help you today?</h2>
                            <p>Ask me to summarize tasks, generate reports, or provide insights into your work.</p>
                            <div className="ai-suggestions">
                                <button className="btn-secondary" onClick={() => setInput('What are my top priorities today?')}>"What are my top priorities today?"</button>
                                <button className="btn-secondary" onClick={() => setInput('Summarize my progress this week')}>"Summarize my progress this week"</button>
                                <button className="btn-secondary" onClick={() => setInput('Help me draft an accomplishment report')}>"Help me draft an accomplishment report"</button>
                            </div>
                        </div>
                    ) : (
                        <div className="ai-messages">
                            {messages.map((m, i) => (
                                <div key={i} className={`ai-message-row ${m.role}`}>
                                    <div className="ai-message-avatar">
                                        {m.role === 'assistant' ? <Bot size={16} /> : <User size={16} />}
                                    </div>
                                    <div className="ai-message-bubble">
                                        {m.content}
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="ai-message-row assistant">
                                    <div className="ai-message-avatar">
                                        <Bot size={16} />
                                    </div>
                                    <div className="ai-message-bubble loading">
                                        <div className="dot"></div>
                                        <div className="dot"></div>
                                        <div className="dot"></div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="ai-input-area">
                    <div className="ai-input-wrapper">
                        <input
                            type="text"
                            placeholder="Ask me anything..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            autoFocus
                        />
                        <button className="send-btn" onClick={handleSend} disabled={!input.trim() || isLoading}>
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIModal;
