import React, { useState } from 'react';
import {
    X,
    Wand2,
    Sparkles,
    Loader2,
    Check,
    AlertCircle,
    Folder,
    List,
    Layout,
    ChevronRight
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { generateUUID } from '../utils/uuid';
import type { Status } from '../types';
import '../styles/AITemplateGeneratorModal.css';

interface AITemplateGeneratorModalProps {
    onClose: () => void;
}

interface GeneratedStructure {
    spaceName: string;
    spaceIcon: string;
    folders: {
        name: string;
        lists: {
            name: string;
            statuses?: string[];
        }[];
    }[];
    lists: { // Root level lists
        name: string;
        statuses?: string[];
    }[];
}

const SUGGESTIONS = [
    "Software Development Team",
    "Digital Marketing Agency",
    "HR Recruitment Pipeline",
    "Personal Goal Tracker",
    "Event Planning Workflow"
];

const AITemplateGeneratorModal: React.FC<AITemplateGeneratorModalProps> = ({ onClose }) => {
    const [prompt, setPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedTemplate, setGeneratedTemplate] = useState<GeneratedStructure | null>(null);
    const [error, setError] = useState<string | null>(null);
    const { addSpace, addFolder, addList, aiConfig } = useAppStore();

    const generateTemplate = async (overridePrompt?: string) => {
        const query = (overridePrompt || prompt).trim();
        if (!query) return;

        if (overridePrompt) setPrompt(overridePrompt);

        setIsGenerating(true);
        setError(null);
        setGeneratedTemplate(null);

        try {
            const systemPrompt = `
You are an expert project management architect.
Generate a JSON structure for a Space, Folders, and Lists based on the user's request.
CRITICAL: Tailor the "statuses" for EACH list to match its specific purpose. Do NOT just use "TO DO", "IN PROGRESS", "DONE" for everything. 
For example:
- A "Bugs" list should have: ["Reported", "Confirmed", "Fixing", "Verified", "Closed"]
- A "Recruitment" list should have: ["Applied", "Screening", "Interview", "Offer", "Hired", "Rejected"]
- A "Content" list should have: ["Idea", "Drafting", "Review", "Published"]

The structure must be valid JSON matching this interface:
{
    "spaceName": "string",
    "spaceIcon": "string (lucide-react icon name: layout, star, briefcase, code, graduation, book, globe, zap, cloud, moon, flag, target, coffee, heart, music, camera, list, check-square, calendar, hash, folder)",
    "folders": [
        { 
            "name": "string", 
            "lists": [ 
                { "name": "string", "statuses": ["string", "string", ...] } 
            ] 
        }
    ],
    "lists": [
        { "name": "string", "statuses": ["string", "string", ...] }
    ]
}
Return ONLY the JSON string. No extra text, no markdown code blocks.
User Request: "${query}"
`;

            let responseText = '';

            // 1. Try Configured AI Provider
            if (aiConfig.provider === 'ollama') {
                const response = await fetch(`${aiConfig.ollamaHost}/api/generate`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        model: aiConfig.ollamaModel,
                        prompt: systemPrompt,
                        stream: false,
                        format: 'json',
                        system: "You are a JSON-speaking project structure generator."
                    }),
                });
                if (response.ok) {
                    const data = await response.json();
                    responseText = data.response;
                } else {
                    console.warn("Ollama failed, trying keyword fallback.");
                    throw new Error('FallbackRequested');
                }
            } else {
                // Gemini
                const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
                if (apiKey) {
                    const genAI = new GoogleGenerativeAI(apiKey);
                    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
                    const result = await model.generateContent(systemPrompt);
                    responseText = result.response.text();
                } else {
                    console.warn("Gemini API key missing, trying keyword fallback.");
                    throw new Error('FallbackRequested');
                }
            }

            // Extract JSON from response (handle potential markdown blocks)
            const jsonStr = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
            const data = JSON.parse(jsonStr);
            setGeneratedTemplate(data);
            setIsGenerating(false);
            return;

        } catch (err) {
            if (err instanceof Error && err.message === 'FallbackRequested') {
                // Proceed to keyword matching
            } else {
                console.error("AI Generation failed:", err);
            }

            // Fallback: Keyword Matching
            await new Promise(resolve => setTimeout(resolve, 1500));

            const p = query.toLowerCase();
            let template: GeneratedStructure = {
                spaceName: "Project Space",
                spaceIcon: "layout",
                folders: [],
                lists: []
            };

            if (p.includes('developer') || p.includes('programmer') || p.includes('coding') || p.includes('software')) {
                template = {
                    spaceName: "Development",
                    spaceIcon: "code",
                    folders: [
                        {
                            name: "Frontend",
                            lists: [
                                { name: "Components", statuses: ["To Do", "In Progress", "Review", "Done"] },
                                { name: "Bugs", statuses: ["Open", "In Review", "Resolved"] }
                            ]
                        },
                        {
                            name: "Backend",
                            lists: [
                                { name: "API Operations", statuses: ["Spec", "Dev", "Test", "Deployed"] },
                                { name: "Database Schema", statuses: ["Planning", "Active", "Archived"] }
                            ]
                        }
                    ],
                    lists: [{ name: "Sprint Backlog", statuses: ["Backlog", "Ready", "In Progress", "Done"] }]
                };
            } else if (p.includes('marketing') || p.includes('social') || p.includes('campaign')) {
                template = {
                    spaceName: "Marketing",
                    spaceIcon: "zap",
                    folders: [
                        {
                            name: "Social Media",
                            lists: [
                                { name: "Instagram", statuses: ["Idea", "Drafting", "Scheduled", "Posted"] },
                                { name: "Twitter/X", statuses: ["Idea", "Drafting", "Scheduled", "Posted"] }
                            ]
                        },
                        {
                            name: "Content",
                            lists: [
                                { name: "Blog Posts", statuses: ["Topic", "Writing", "Editing", "Published"] }
                            ]
                        }
                    ],
                    lists: [{ name: "General Tasks", statuses: ["To Do", "In Progress", "Done"] }]
                };
            } else if (p.includes('office') || p.includes('admin') || p.includes('hr') || p.includes('recruit')) {
                template = {
                    spaceName: "HR & Ops",
                    spaceIcon: "building",
                    folders: [
                        {
                            name: "Recruitment",
                            lists: [
                                { name: "Candidates", statuses: ["Applied", "Screening", "Interview", "Offer", "Hired"] },
                                { name: "Open Roles", statuses: ["Draft", "Open", "Filled"] }
                            ]
                        }
                    ],
                    lists: [
                        { name: "Office Supplies", statuses: ["Need", "Ordered", "Received"] },
                        { name: "Employee Onboarding", statuses: ["Pre-start", "Day 1", "Week 1", "Month 1", "Done"] }
                    ]
                };
            } else if (p.includes('event') || p.includes('planning')) {
                template = {
                    spaceName: "Event Planning",
                    spaceIcon: "calendar",
                    folders: [
                        {
                            name: "Logistics",
                            lists: [
                                { name: "Venues", statuses: ["Research", "Contacted", "Visited", "Booked"] },
                                { name: "Catering", statuses: ["Menu Planning", "Tasting", "Finalized"] }
                            ]
                        }
                    ],
                    lists: [
                        { name: "Guest List", statuses: ["Invited", "RSVP Yes", "RSVP No"] },
                        { name: "Run of Show", statuses: ["Draft", "Review", "Final"] }
                    ]
                };
            } else {
                template = {
                    spaceName: query.length < 20 ? query : "New Workspace",
                    spaceIcon: "layout",
                    folders: [
                        {
                            name: "Projects",
                            lists: [
                                { name: "Phase 1", statuses: ["To Do", "Doing", "Done"] }
                            ]
                        }
                    ],
                    lists: [{ name: "Inbox", statuses: ["Open", "Done"] }]
                };
            }

            setGeneratedTemplate(template);

        } finally {
            setIsGenerating(false);
        }
    };

    const handleCreate = () => {
        if (!generatedTemplate) return;

        const getStatusTypeAndColor = (name: string): { type: Status['type'], color: string } => {
            const n = name.trim().toLowerCase();
            if (['todo', 'to do', 'backlog', 'open', 'planned', 'idea', 'research', 'requested'].includes(n))
                return { type: 'todo', color: '#87909e' };

            if (['in progress', 'inprogress', 'doing', 'working', 'review', 'testing', 'building', 'coding', 'writing', 'designing', 'screening', 'interview', 'contracting'].includes(n))
                return { type: 'inprogress', color: '#3b82f6' };

            if (['done', 'completed', 'complete', 'finished', 'resolved', 'success', 'hired', 'published', 'deployed', 'merged', 'won'].includes(n))
                return { type: 'done', color: '#10b981' };

            if (['closed', 'archived', 'cancelled', 'rejected', 'declined', 'lost'].includes(n))
                return { type: 'closed', color: '#ef4444' };

            return { type: 'inprogress', color: '#3b82f6' };
        };

        try {
            // 1. Create Space
            const spaceId = addSpace({
                name: generatedTemplate.spaceName,
                icon: generatedTemplate.spaceIcon,
                color: '#' + Math.floor(Math.random() * 16777215).toString(16),
            });

            // 2. Create Folders & Lists
            if (generatedTemplate.folders) {
                generatedTemplate.folders.forEach(folder => {
                    const folderId = addFolder({
                        name: folder.name,
                        spaceId: spaceId,
                        color: '#' + Math.floor(Math.random() * 16777215).toString(16)
                    });

                    if (folder.lists) {
                        folder.lists.forEach(list => {
                            addList({
                                name: list.name,
                                spaceId: spaceId,
                                folderId: folderId,
                                statuses: list.statuses ? list.statuses.map(s => {
                                    const { type, color } = getStatusTypeAndColor(s);
                                    return {
                                        id: s.toLowerCase().replace(/\s/g, '') + '-' + generateUUID().slice(0, 4),
                                        name: s.trim(),
                                        color: color,
                                        type: type
                                    };
                                }) : undefined
                            });
                        });
                    }
                });
            }

            // 3. Create Space-level Lists
            if (generatedTemplate.lists) {
                generatedTemplate.lists.forEach(list => {
                    addList({
                        name: list.name,
                        spaceId: spaceId,
                        statuses: list.statuses ? list.statuses.map(s => {
                            const { type, color } = getStatusTypeAndColor(s);
                            return {
                                id: s.toLowerCase().replace(/\s/g, '') + '-' + generateUUID().slice(0, 4),
                                name: s.trim(),
                                color: color,
                                type: type
                            };
                        }) : undefined
                    });
                });
            }

            onClose();

        } catch (err) {
            console.error("Error creating template structure:", err);
            setError("Failed to apply template.");
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content ai-template-modal" onClick={e => e.stopPropagation()}>
                <div className="ai-modal-header">
                    <h2>
                        <div className="ai-modal-icon-wrapper">
                            <Wand2 size={20} />
                        </div>
                        AI Space Generator
                    </h2>
                    <button className="close-btn" onClick={onClose}><X size={20} /></button>
                </div>

                <div className="ai-modal-body">
                    <p className="text-secondary" style={{ marginBottom: '24px', lineHeight: '1.5' }}>
                        Describe your <strong>workflow, team, or project type</strong> and our AI will instantly architect a perfect workspace structure for you.
                    </p>

                    <div className="ai-input-group">
                        <div className="ai-input-wrapper">
                            <div style={{ display: 'flex', alignItems: 'center', paddingLeft: '8px', color: 'var(--primary)' }}>
                                <Sparkles size={18} />
                            </div>
                            <input
                                type="text"
                                className="ai-text-input"
                                placeholder="e.g. 'Content Marketing Workflow' or 'Agile Software Development'"
                                value={prompt}
                                onChange={e => setPrompt(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && generateTemplate()}
                                autoFocus
                            />
                            <button
                                className="ai-generate-btn"
                                onClick={() => generateTemplate()}
                                disabled={isGenerating || !prompt.trim()}
                            >
                                {isGenerating ? <Loader2 className="animate-spin" size={16} /> : 'Generate'}
                            </button>
                        </div>

                        {!generatedTemplate && !isGenerating && (
                            <div className="ai-suggestion-pills">
                                {SUGGESTIONS.map((s, i) => (
                                    <div
                                        key={i}
                                        className="ai-pill"
                                        onClick={() => generateTemplate(s)}
                                    >
                                        {s}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {error && (
                        <div className="error-message" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444', marginBottom: '16px', padding: '12px', background: 'var(--error-light)', borderRadius: '8px' }}>
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    {isGenerating && (
                        <div className="ai-loading-container">
                            <Loader2 size={40} className="animate-spin text-primary" />
                            <div className="ai-shimmer-text">Designing your perfect workspace...</div>
                            <p style={{ fontSize: '12px', marginTop: '8px', opacity: 0.7 }}>Analyzing requirements • Constructing hierarchy • defining statuses</p>
                        </div>
                    )}

                    {generatedTemplate && !isGenerating && (
                        <div className="ai-preview-section">
                            <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--success)' }}>
                                <Check size={16} /> Ready to Create
                            </h3>

                            <div className="ai-preview-card">
                                <div className="ai-preview-header">
                                    <span className="ai-preview-title"><Layout size={14} /> Workspace Preview</span>
                                </div>
                                <div className="ai-preview-content">
                                    <div className="tree-node">
                                        <div className="tree-item-row" style={{ fontWeight: 600 }}>
                                            <div className="tree-icon icon-space"><Layout size={16} /></div>
                                            <span className="tree-label">{generatedTemplate.spaceName}</span>
                                            <span className="tree-info">Space</span>
                                        </div>

                                        <div className="tree-children">
                                            {generatedTemplate.folders.map((f, i) => (
                                                <div key={`f-${i}`} className="tree-node">
                                                    <div className="tree-item-row">
                                                        <div className="tree-icon icon-folder">
                                                            <ChevronRight size={14} style={{ marginRight: 2 }} />
                                                            <Folder size={15} />
                                                        </div>
                                                        <span className="tree-label">{f.name}</span>
                                                        <span className="tree-info">Folder</span>
                                                    </div>

                                                    <div className="tree-children">
                                                        {f.lists.map((l, j) => (
                                                            <div key={`fl-${j}`} className="tree-item-row">
                                                                <div className="tree-icon icon-list"><List size={14} /></div>
                                                                <span className="tree-label">{l.name}</span>
                                                                <span className="tree-info" style={{ fontSize: '11px', background: 'var(--bg-side)', padding: '2px 6px', borderRadius: '4px' }}>
                                                                    {l.statuses?.length || 3} Statuses
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}

                                            {generatedTemplate.lists.map((l, i) => (
                                                <div key={`l-${i}`} className="tree-node">
                                                    <div className="tree-item-row">
                                                        <div className="tree-icon icon-list"><List size={15} /></div>
                                                        <span className="tree-label">{l.name}</span>
                                                        <span className="tree-info" style={{ fontSize: '11px', background: 'var(--bg-side)', padding: '2px 6px', borderRadius: '4px' }}>
                                                            {l.statuses?.length || 3} Statuses
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}

                                            {generatedTemplate.folders.length === 0 && generatedTemplate.lists.length === 0 && (
                                                <div style={{ padding: '10px', color: 'var(--text-tertiary)', fontStyle: 'italic', fontSize: '13px' }}>
                                                    Space is empty
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="ai-modal-footer">
                    <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
                    <button
                        className="btn btn-primary"
                        onClick={handleCreate}
                        disabled={!generatedTemplate || isGenerating}
                    >
                        <Wand2 size={16} /> Create Space
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AITemplateGeneratorModal;
