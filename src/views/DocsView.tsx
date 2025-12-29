import React, { useState } from 'react';
import {
    FileText,
    Plus,
    Search,
    MoreVertical,
    Star,
    Clock
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { format } from 'date-fns';
import DocEditor from '../components/DocEditor';
import '../styles/DocsView.css';
import '../styles/ListView.css';

const DocsView: React.FC = () => {
    const { docs, addDoc, updateDoc } = useAppStore();
    const [selectedDocId, setSelectedDocId] = useState<string | null>(null);

    const activeDoc = docs.find(d => d.id === selectedDocId);

    return (
        <div className="view-container docs-view">
            <div className="view-header">
                <div className="breadcrumb">
                    <span className="space-name">Documents</span>
                    <span className="task-count">{docs.length}</span>
                </div>
            </div>

            <div className="toolbar">
                <div className="toolbar-left">
                    <button className="btn-secondary" style={{ padding: '6px 14px', fontSize: '13px' }}><Clock size={14} /> Recent</button>
                    <button className="btn-secondary" style={{ padding: '6px 14px', fontSize: '13px' }}><Star size={14} /> Favorites</button>
                </div>
                <div className="toolbar-right">
                    <div className="toolbar-search">
                        <Search size={14} />
                        <input type="text" placeholder="Search docs..." readOnly />
                    </div>
                    <button
                        className="btn-primary"
                        style={{ padding: '8px 16px' }}
                        onClick={() => addDoc({
                            name: 'Untitled Doc',
                            content: '',
                            userId: 'user-1',
                            userName: 'Jundee'
                        })}
                    >
                        <Plus size={16} /> New Doc
                    </button>
                </div>
            </div>

            <div className="docs-grid">
                {docs.map(doc => (
                    <div
                        key={doc.id}
                        className="doc-card"
                        onClick={() => setSelectedDocId(doc.id)}
                    >
                        <div className="doc-preview">
                            <FileText size={48} className="doc-icon" />
                        </div>
                        <div className="doc-info">
                            <div className="doc-title-row">
                                <h4 className="doc-title">{doc.name}</h4>
                                <button
                                    className="icon-btn-ghost"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        console.log('Context menu for', doc.name);
                                    }}
                                >
                                    <MoreVertical size={16} />
                                </button>
                            </div>
                            <div className="doc-meta">
                                <span>Updated {format(new Date(doc.updatedAt), 'MMM d, yyyy')}</span>
                                <span>•</span>
                                <span>{doc.userName}</span>
                            </div>
                        </div>
                    </div>
                ))}
                <div
                    className="doc-card add-new-doc"
                    onClick={() => {
                        const newId = addDoc({
                            name: 'Untitled Doc',
                            content: '',
                            userId: 'user-1',
                            userName: 'Jundee'
                        });
                        setSelectedDocId(newId);
                    }}
                >
                    <div className="add-content">
                        <Plus size={32} />
                        <span>Create New Document</span>
                    </div>
                </div>
            </div>

            {activeDoc && (
                <DocEditor
                    doc={activeDoc}
                    onClose={() => setSelectedDocId(null)}
                    onUpdate={updateDoc}
                />
            )}
        </div>
    );
};

export default DocsView;
