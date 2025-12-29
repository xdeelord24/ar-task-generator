import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Sparkles, Bot, User, Trash2, History } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import type { Task, Space } from '../types';
import { GoogleGenerativeAI } from '@google/generative-ai';
import ReactMarkdown from 'react-markdown';
import '../styles/AIModal.css';

const AI_MODEL_NAME = 'gemini-1.5-flash';

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
    const { tasks, spaces, currentSpaceId, aiConfig } = useAppStore();

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async (overrideInput?: string) => {
        const query = overrideInput || input;
        if (!query.trim()) return;

        const userMessage: Message = { role: 'user', content: query };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        const systemPrompt = `You are an intelligent task management assistant for an application called "AR Generator". 
        You have access to the user's current workspace data:
        - Current Space: ${spaces.find((s: Space) => s.id === currentSpaceId)?.name || 'Unknown'}
        - All Tasks: ${JSON.stringify(tasks.map((t: Task) => ({ name: t.name, status: t.status, priority: t.priority, dueDate: t.dueDate })))}
        
        Your goal is to help the user manage their workload, prioritize tasks, and provide insights. 
        Be concise, helpful, and professional. If the user asks about specific tasks, use the data provided above.`;

        try {
            if (aiConfig.provider === 'ollama') {
                const response = await fetch(`${aiConfig.ollamaHost}/api/generate`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        model: aiConfig.ollamaModel,
                        system: systemPrompt,
                        prompt: query,
                        stream: false,
                    }),
                });

                if (!response.ok) throw new Error('OLLAMA_CONNECTION_ERROR');

                const data = await response.json();
                const assistantMessage: Message = {
                    role: 'assistant',
                    content: data.response
                };
                setMessages(prev => [...prev, assistantMessage]);
            } else {
                // Gemini Provider
                const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

                if (!apiKey || apiKey === 'your_gemini_api_key_here') {
                    throw new Error('API_KEY_NOT_SET');
                }

                const genAI = new GoogleGenerativeAI(apiKey);
                const model = genAI.getGenerativeModel({
                    model: AI_MODEL_NAME,
                    systemInstruction: systemPrompt,
                });

                const result = await model.generateContent(query);
                const responseText = result.response.text();

                const assistantMessage: Message = {
                    role: 'assistant',
                    content: responseText
                };
                setMessages(prev => [...prev, assistantMessage]);
            }
        } catch (error: any) {
            let errorMsg = "I'm sorry, I encountered an error while processing your request.";

            if (error.message === 'API_KEY_NOT_SET') {
                errorMsg = "I'm ready to help, but I need a Gemini API Key to function. Please add your key to the `.env` file or switch to Ollama in Settings.";
            } else if (error.message === 'OLLAMA_CONNECTION_ERROR' || error.name === 'TypeError') {
                errorMsg = "I couldn't connect to Ollama. Please ensure your Ollama server is running at " + aiConfig.ollamaHost + " and CORS is enabled.";
            }

            const assistantMessage: Message = {
                role: 'assistant',
                content: errorMsg
            };
            setMessages(prev => [...prev, assistantMessage]);
            console.error('AI Error:', error);
        } finally {
            setIsLoading(false);
        }
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
                        <button className="icon-btn-ghost" title="View History"><History size={18} /></button>
                        <button className="icon-btn-ghost" title="Clear Chat" onClick={() => setMessages([])}><Trash2 size={18} /></button>
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
                                <button className="btn-secondary" onClick={() => handleSend('What are my top priorities?')}>"What are my top priorities?"</button>
                                <button className="btn-secondary" onClick={() => handleSend('How many tasks are in progress?')}>"How many tasks are in progress?"</button>
                                <button className="btn-secondary" onClick={() => handleSend('What is due today?')}>"What is due today?"</button>
                                <button className="btn-secondary" onClick={() => handleSend('Summarize my progress')}>"Summarize my progress"</button>
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
                                        {m.role === 'assistant' ? (
                                            <ReactMarkdown>{m.content}</ReactMarkdown>
                                        ) : (
                                            m.content
                                        )}
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
                        <button className="send-btn" onClick={() => handleSend()} disabled={!input.trim() || isLoading}>
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIModal;
