import React, { useState } from 'react';
import {
    X, Calendar, Flag, Users, Tag, MoreHorizontal,
    Sparkles, Paperclip, Bell, ChevronDown, Maximize2, Minimize2,
    FileText, LayoutDashboard, Square, ListTodo, Plus,
    Table, Columns, List, File, User, MessageSquare, PenTool
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import type { Priority, Task } from '../types';
import '../styles/TaskModal.css';

interface TaskModalProps {
    onClose: () => void;
    initialStatus?: string;
}

const TaskModal: React.FC<TaskModalProps> = ({ onClose, initialStatus }) => {
    const { addTask, currentSpaceId, currentListId, spaces, lists } = useAppStore();

    const activeList = lists.find(l => l.id === currentListId);
    const activeSpace = spaces.find(s => s.id === currentSpaceId);

    // Default statuses fallback
    const defaultStatuses = [
        { id: 'todo', name: 'TO DO' },
        { id: 'inprogress', name: 'IN PROGRESS' },
        { id: 'completed', name: 'COMPLETED' }
    ];

    const activeStatuses = activeList?.statuses || activeSpace?.statuses || defaultStatuses;

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState<Task['status']>(initialStatus || activeStatuses[0]?.name || 'TO DO');
    const [priority, setPriority] = useState<Priority>('medium');
    const [dueDate, setDueDate] = useState('');
    const [activeTab, setActiveTab] = useState('task');
    const [isMaximized, setIsMaximized] = useState(false);
    const [isPrivate, setIsPrivate] = useState(false);

    const handleSubmit = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!name.trim()) return;

        // Simplify logic for demo purposes - creating task regardless of tab, 
        // normally you'd handle creates for Docs, Reminders, etc. here.
        addTask({
            name,
            description,
            spaceId: currentSpaceId === 'everything' ? 'team-space' : currentSpaceId,
            listId: currentListId || undefined,
            status,
            priority,
            dueDate: dueDate || undefined,
        });
        onClose();
    };

    const tabs = [
        { id: 'task', label: 'Task' },
        { id: 'doc', label: 'Doc' },
        { id: 'reminder', label: 'Reminder' },
        { id: 'chat', label: 'Chat' },
        { id: 'whiteboard', label: 'Whiteboard' },
        { id: 'dashboard', label: 'Dashboard' },
    ];

    const [showCustomFields, setShowCustomFields] = useState(false);
    const [fieldSearch, setFieldSearch] = useState('');

    const fieldOptions = [
        { id: 'text', label: 'Custom Text', icon: <FileText size={16} color="#c026d3" /> },
        { id: 'summary', label: 'Summary', icon: <FileText size={16} color="#c026d3" /> },
        { id: 'progress_updates', label: 'Progress Updates', icon: <FileText size={16} color="#c026d3" /> },
        { id: 'files', label: 'Files', icon: <Paperclip size={16} color="#9333ea" /> },
        { id: 'relationship', label: 'Relationship', icon: <Users size={16} color="#2563eb" /> },
        { id: 'people', label: 'People', icon: <User size={16} color="#ea580c" /> },
        { id: 'progress_auto', label: 'Progress (Auto)', icon: <ListTodo size={16} color="#ea580c" /> },
        { id: 'email', label: 'Email', icon: <MessageSquare size={16} color="#dc2626" /> },
        { id: 'phone', label: 'Phone', icon: <Tag size={16} color="#dc2626" /> },
        { id: 'categorize', label: 'Categorize', icon: <Columns size={16} color="#9333ea" /> },
        { id: 'dropdown', label: 'Custom Dropdown', icon: <ChevronDown size={16} color="#9333ea" /> },
        { id: 'translation', label: 'Translation', icon: <FileText size={16} color="#c026d3" /> },
        { id: 'sentiment', label: 'Sentiment', icon: <Sparkles size={16} color="#9333ea" /> },
        { id: 'tasks', label: 'Tasks', icon: <Square size={16} color="#2563eb" /> },
        { id: 'location', label: 'Location', icon: <Bell size={16} color="#dc2626" /> },
        { id: 'progress_manual', label: 'Progress (Manual)', icon: <List size={16} color="#ea580c" /> },
        { id: 'rating', label: 'Rating', icon: <Tag size={16} color="#ca8a04" /> },
        { id: 'voting', label: 'Voting', icon: <Table size={16} color="#9333ea" /> },
        { id: 'signature', label: 'Signature', icon: <PenTool size={16} color="#059669" /> },
        { id: 'button', label: 'Button', icon: <Square size={16} color="#c026d3" /> },
        { id: 'action_items', label: 'Action Items', icon: <ListTodo size={16} color="#c026d3" /> },
        { id: 'tshirt', label: 'T-shirt Size', icon: <Columns size={16} color="#9333ea" /> },
    ];

    const renderTaskView = () => (
        <>
            {/* Sub-Header Toolbar */}
            <div className="task-toolbar">
                <button className="toolbar-btn">
                    <ListTodo size={14} />
                    Objectives
                    <ChevronDown size={14} />
                </button>
                <button className="toolbar-btn">
                    <Square size={14} />
                    Task
                    <ChevronDown size={14} />
                </button>
            </div>

            {/* Main Form */}
            <div className="task-form">
                <input
                    type="text"
                    className="task-name-input"
                    placeholder="Task Name or type '/' for commands"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    autoFocus
                />

                <div className="description-section">
                    {!description && (
                        <div className="description-placeholder" onClick={() => document.getElementById('desc-input')?.focus()}>
                            <FileText size={16} />
                            Add description
                        </div>
                    )}
                    <textarea
                        id="desc-input"
                        className="task-desc-input"
                        placeholder=""
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                    />
                    <button className="ai-btn">
                        <Sparkles size={14} color="#8b5cf6" />
                        Write with AI
                    </button>
                </div>

                <div className="task-properties">
                    <div className="prop-btn status-btn">
                        <select
                            value={status}
                            onChange={e => setStatus(e.target.value as Task['status'])}
                            style={{ background: 'transparent', border: 'none', fontWeight: 'inherit', color: 'inherit', outline: 'none', cursor: 'pointer', appearance: 'none' }}
                        >
                            {activeStatuses.map(s => (
                                <option key={s.id} value={s.name}>{s.name}</option>
                            ))}
                        </select>
                    </div>

                    <button className="prop-btn">
                        <Users size={14} />
                        Assignee
                    </button>

                    <div className="prop-btn">
                        <Calendar size={14} />
                        <input
                            type="date"
                            value={dueDate}
                            onChange={e => setDueDate(e.target.value)}
                            style={{ background: 'transparent', border: 'none', color: 'inherit', outline: 'none', cursor: 'pointer', width: dueDate ? 'auto' : '65px' }}
                        />
                    </div>

                    <div className="prop-btn">
                        <Flag size={14} />
                        <select
                            value={priority}
                            onChange={e => setPriority(e.target.value as Priority)}
                            style={{ background: 'transparent', border: 'none', color: 'inherit', outline: 'none', cursor: 'pointer', appearance: 'none' }}
                        >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="urgent">Urgent</option>
                        </select>
                    </div>

                    <button className="prop-btn">
                        <Tag size={14} />
                        Tags
                    </button>

                    <button className="prop-btn">
                        <MoreHorizontal size={14} />
                    </button>
                </div>

                <div className="custom-fields-section">
                    <div className="section-label">Custom Fields</div>
                    <div className="custom-fields-wrapper">
                        {showCustomFields && (
                            <div className="custom-fields-dropdown">
                                <div className="field-search-container">
                                    <input
                                        type="text"
                                        className="field-search-input"
                                        placeholder="Search..."
                                        value={fieldSearch}
                                        onChange={e => setFieldSearch(e.target.value)}
                                        autoFocus
                                    />
                                </div>
                                <div className="field-list">
                                    {fieldOptions
                                        .filter(f => f.label.toLowerCase().includes(fieldSearch.toLowerCase()))
                                        .map(field => (
                                            <div key={field.id} className="field-option" onClick={() => setShowCustomFields(false)}>
                                                <div className="field-icon">{field.icon}</div>
                                                {field.label}
                                            </div>
                                        ))
                                    }
                                </div>
                            </div>
                        )}
                        <button className="add-field-btn" onClick={() => setShowCustomFields(!showCustomFields)}>
                            <Plus size={14} />
                            Create new field
                        </button>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="task-modal-footer">
                <div className="footer-left">
                    <button className="footer-btn">
                        <LayoutDashboard size={14} />
                        Templates
                    </button>
                </div>

                <div className="footer-right">
                    <div className="icon-action">
                        <Paperclip size={18} />
                        0
                    </div>
                    <div className="icon-action">
                        <Bell size={18} />
                        1
                    </div>

                    <div className="create-btn-group">
                        <button
                            className="btn-create-main"
                            onClick={() => handleSubmit()}
                            disabled={!name.trim()}
                        >
                            Create Task
                        </button>
                        <button className="btn-create-split" disabled={!name.trim()}>
                            <ChevronDown size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </>
    );

    const renderDocView = () => (
        <>
            <div className="context-dropdown">
                <List size={14} />
                My Docs
                <ChevronDown size={14} />
            </div>

            <div className="task-form">
                <input
                    type="text"
                    className="task-name-input"
                    placeholder="Name this Doc..."
                    value={name}
                    onChange={e => setName(e.target.value)}
                    autoFocus
                />

                <div className="doc-options">
                    <div className="doc-option-row">
                        <File size={16} />
                        Start writing
                    </div>
                    <div className="doc-option-row">
                        <Sparkles size={16} color="#8b5cf6" />
                        Write with AI
                    </div>
                </div>

                <div className="section-label-small">Add new</div>

                <div className="doc-options">
                    <div className="doc-option-row">
                        <Table size={16} />
                        Table
                    </div>
                    <div className="doc-option-row">
                        <Columns size={16} />
                        Column
                    </div>
                    <div className="doc-option-row">
                        <List size={16} />
                        ClickUp List
                    </div>
                </div>
            </div>

            <div className="task-modal-footer simple-footer">
                <div className="private-toggle-wrapper" onClick={() => setIsPrivate(!isPrivate)}>
                    <div className={`toggle-switch ${isPrivate ? 'active' : ''}`}>
                        <div className="toggle-knob" />
                    </div>
                    <span className="private-label">Private</span>
                </div>
                <button className="btn-create-main" style={{ borderRadius: '6px' }}>Create Doc</button>
            </div>
        </>
    );

    const renderReminderView = () => (
        <>
            <div className="task-form" style={{ marginTop: '24px' }}>
                <input
                    type="text"
                    className="task-name-input"
                    placeholder="Reminder name or type '/' for commands"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    autoFocus
                />

                <div className="reminder-controls">
                    <button className="reminder-pill">
                        <Calendar size={14} />
                        Today
                    </button>
                    <button className="reminder-pill avatar-pill">
                        <span style={{ fontSize: '10px', fontWeight: 'bold' }}>J</span>
                        For me
                    </button>
                    <button className="reminder-pill">
                        <Bell size={14} />
                        Notify me
                    </button>
                </div>
            </div>

            <div className="task-modal-footer simple-footer">
                <div style={{ flex: 1 }}></div>
                <div className="icon-action" style={{ marginRight: '16px' }}>
                    <Paperclip size={18} />
                </div>
                <button className="btn-create-main" style={{ borderRadius: '6px' }}>Create Reminder</button>
            </div>
        </>
    );

    const renderChatView = () => (
        <>
            <div className="context-dropdown">
                <MessageSquare size={14} />
                Workspace
                <ChevronDown size={14} />
            </div>

            <div className="task-form">
                <input
                    type="text"
                    className="task-name-input"
                    placeholder="Name this Chat..."
                    value={name}
                    onChange={e => setName(e.target.value)}
                    autoFocus
                />
                <input
                    type="text"
                    placeholder="Add message"
                    className="task-desc-input"
                    style={{ minHeight: '40px', fontSize: '14px', marginTop: '12px' }}
                />
            </div>

            <div className="task-modal-footer simple-footer">
                <div className="private-toggle-wrapper" onClick={() => setIsPrivate(!isPrivate)}>
                    <div className={`toggle-switch ${isPrivate ? 'active' : ''}`}>
                        <div className="toggle-knob" />
                    </div>
                    <span className="private-label">Private</span>
                </div>

                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div className="icon-action">
                        <Bell size={18} />
                    </div>
                    <button className="btn-create-main" style={{ borderRadius: '6px' }}>Create Chat</button>
                </div>
            </div>
        </>
    );

    const renderWhiteboardView = () => (
        <>
            <div className="context-dropdown">
                <PenTool size={14} />
                My Whiteboards
                <ChevronDown size={14} />
            </div>

            <div className="task-form">
                <input
                    type="text"
                    className="task-name-input"
                    placeholder="Name this Whiteboard..."
                    value={name}
                    onChange={e => setName(e.target.value)}
                    autoFocus
                />
            </div>

            <div className="task-modal-footer simple-footer">
                <div className="private-toggle-wrapper" onClick={() => setIsPrivate(!isPrivate)}>
                    <div className={`toggle-switch ${isPrivate ? 'active' : ''}`}>
                        <div className="toggle-knob" />
                    </div>
                    <span className="private-label">Private</span>
                </div>
                <button className="btn-create-main" style={{ borderRadius: '6px' }}>Create Whiteboard</button>
            </div>
        </>
    );

    const renderDashboardView = () => (
        <>
            <div className="context-dropdown">
                <LayoutDashboard size={14} />
                My Dashboards
                <ChevronDown size={14} />
            </div>

            <div className="task-form">
                <input
                    type="text"
                    className="task-name-input"
                    placeholder="Name this Dashboard..."
                    value={name}
                    onChange={e => setName(e.target.value)}
                    autoFocus
                />
            </div>

            <div className="task-modal-footer simple-footer">
                <div className="private-toggle-wrapper" onClick={() => setIsPrivate(!isPrivate)}>
                    <div className={`toggle-switch ${isPrivate ? 'active' : ''}`}>
                        <div className="toggle-knob" />
                    </div>
                    <span className="private-label">Private</span>
                </div>
                <button className="btn-create-main" style={{ borderRadius: '6px' }}>Create Dashboard</button>
            </div>
        </>
    );

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className={`modal-content task-modal ${isMaximized ? 'maximized' : ''}`}
                onClick={e => e.stopPropagation()}
                style={isMaximized ? { width: '95vw', height: '95vh', maxWidth: 'none' } : {}}
            >
                {/* Header Tabs */}
                <div className="task-modal-header">
                    <div className="task-tabs">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                className={`task-tab ${activeTab === tab.id ? 'active' : ''}`}
                                onClick={() => { setActiveTab(tab.id); setName(''); }}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                    <div className="header-controls">
                        <button className="header-icon-btn" onClick={() => setIsMaximized(!isMaximized)}>
                            {isMaximized ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                        </button>
                        <button className="header-icon-btn" onClick={onClose}>
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {activeTab === 'task' && renderTaskView()}
                {activeTab === 'doc' && renderDocView()}
                {activeTab === 'reminder' && renderReminderView()}
                {activeTab === 'chat' && renderChatView()}
                {activeTab === 'whiteboard' && renderWhiteboardView()}
                {activeTab === 'dashboard' && renderDashboardView()}

            </div>
        </div>
    );
};

export default TaskModal;
