import React, { useState } from 'react';
import {
    X,
    Trash2,
    CheckCircle2,
    Calendar,
    Plus,
    MoreVertical,
    ChevronDown,
    MessageSquare,
    Link as LinkIcon,
    Link2,
    Clock3,
    AlertCircle,
    Send,
    Check,
    ChevronRight,
    ExternalLink,
    FileText as DocIcon,
    Users,
    Flag,
    MoreHorizontal,
    Tag,
    Edit2
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { format, parseISO } from 'date-fns';
import type { Task, Subtask } from '../types';
import PremiumDatePicker from './PremiumDatePicker';
import TimePicker from './TimePicker';
import RichTextEditor from './RichTextEditor';
import TaskOptionsMenu from './TaskOptionsMenu';
import RelationshipMenu from './RelationshipMenu';
import '../styles/TaskDetailModal.css';

interface TaskDetailModalProps {
    taskId: string;
    onClose: () => void;
    onTaskClick?: (id: string) => void;
}

type SidebarTab = 'activity' | 'links' | 'more';

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ taskId, onClose, onTaskClick }) => {
    const {
        tasks,
        spaces,
        lists,
        updateTask,
        deleteTask,
        addSubtask,
        updateSubtask,
        tags,
        docs,
        addDoc,
        setCurrentView,
        addComment,
        addTimeEntry,
        duplicateTask,
        archiveTask
    } = useAppStore();

    // Logic to find task or subtask
    let task: Task | undefined = tasks.find(t => t.id === taskId);
    let isSubtask = false;
    let parentTask: Task | undefined = undefined;

    if (!task) {
        for (const t of tasks) {
            if (t.subtasks) {
                const sub = t.subtasks.find(s => s.id === taskId);
                if (sub) {
                    // Create a pseudo-Task object from the subtask
                    task = {
                        ...sub,
                        description: '',
                        spaceId: t.spaceId,
                        listId: t.listId,
                        tags: [],
                        subtasks: [],
                        comments: [],
                        timeEntries: [],
                        relationships: [],
                        linkedDocId: undefined,
                        startDate: undefined
                    } as unknown as Task;
                    isSubtask = true;
                    parentTask = t;
                    break;
                }
            }
        }
    }

    const [activeTab, setActiveTab] = useState<'details' | 'subtasks'>('details');
    const [sidebarTab, setSidebarTab] = useState<SidebarTab>('activity');
    const [newSubtaskName, setNewSubtaskName] = useState('');
    const [isOptionsMenuOpen, setIsOptionsMenuOpen] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [isTagPickerOpen, setIsTagPickerOpen] = useState(false);
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
    const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
    const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);

    if (!task) return null;

    const handleUpdate = (updates: Partial<Task>) => {
        if (isSubtask && parentTask) {
            const validSubtaskKeys = ['name', 'status', 'priority', 'assignee', 'dueDate'];
            const subtaskUpdates: any = {};

            Object.keys(updates).forEach(key => {
                if (validSubtaskKeys.includes(key)) {
                    subtaskUpdates[key] = updates[key as keyof Task];
                }
            });

            if (Object.keys(subtaskUpdates).length > 0) {
                updateSubtask(parentTask.id, taskId, subtaskUpdates);
            }
        } else {
            updateTask(taskId, updates);
        }
    };

    const handleConvertToDoc = () => {
        if (isSubtask) {
            alert('Cannot convert subtask to doc yet.');
            return;
        }
        if (!task || !task.description) {
            alert('This task has no description to convert!');
            return;
        }

        const docId = addDoc({
            name: `${task.name} - Specification`,
            content: task.description,
            userId: 'user-1',
            userName: 'Jundee',
            spaceId: task.spaceId
        });

        handleUpdate({ linkedDocId: docId });
        alert('Converted to Doc successfully!');
    };

    const handleOpenLinkedDoc = () => {
        if (task?.linkedDocId) {
            setCurrentView('docs');
            onClose();
        }
    };

    const handleDuplicate = () => {
        if (isSubtask) {
            alert('Cannot duplicate subtask yet.');
            return;
        }
        duplicateTask(taskId);
        setIsOptionsMenuOpen(false);
    };

    const handleArchive = () => {
        if (isSubtask) {
            // Treat as delete for now or update status
            handleUpdate({ status: 'COMPLETED' });
            return;
        }
        archiveTask(taskId);
        setIsOptionsMenuOpen(false);
    };

    const handleRename = () => {
        const titleInput = document.querySelector('.detail-title-input') as HTMLInputElement;
        if (titleInput) titleInput.focus();
        setIsOptionsMenuOpen(false);
    };

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this task?')) {
            if (isSubtask && parentTask) {
                const newSubtasks = parentTask.subtasks?.filter(st => st.id !== taskId) || [];
                updateTask(parentTask.id, { subtasks: newSubtasks });
            } else {
                deleteTask(taskId);
            }
            onClose();
        }
    };

    const handleAddSubtask = (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubtask) return; // Prevent adding subtasks to subtasks
        if (!newSubtaskName.trim()) return;
        addSubtask(taskId, {
            name: newSubtaskName,
            status: 'TO DO'
        });
        setNewSubtaskName('');
    };

    const handleAddComment = () => {
        if (isSubtask) {
            alert('Comments on subtasks not supported locally yet.');
            return;
        }
        if (!commentText.trim()) return;
        addComment(taskId, {
            userId: 'user-1',
            userName: 'Jundee',
            text: commentText
        });
        setCommentText('');
    };

    const handleAddTime = (time: string) => {
        // Log the time entry with the selected slot name
        addTimeEntry(taskId, {
            duration: 30, // Default slot duration
            date: new Date().toISOString(),
            userId: 'user-1',
            // note: `Slotted for ${time}` // Optionally add metadata if your type supports it
        });
        console.log(`Time logged for slot: ${time}`);
        setIsTimePickerOpen(false);
    };

    const toggleTag = (tagId: string) => {
        const currentTags = task.tags || [];
        const newTags = currentTags.includes(tagId)
            ? currentTags.filter(t => t !== tagId)
            : [...currentTags, tagId];
        handleUpdate({ tags: newTags });
    };

    const currentSpace = spaces.find(s => s.id === task.spaceId);
    const currentList = lists.find(l => l.id === task.listId);

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content task-detail-modal" onClick={e => e.stopPropagation()}>
                <div className="detail-location-bar">
                    <div className="location-breadcrumb" onClick={() => setIsLocationPickerOpen(!isLocationPickerOpen)}>
                        <div className="space-dot" style={{ backgroundColor: currentSpace?.color || '#cbd5e1' }}></div>
                        <span className="location-text">{currentSpace?.name || 'No Space'}</span>
                        <ChevronRight size={12} />
                        <span className="location-text">{currentList?.name || 'No List'}</span>
                        <ChevronDown size={14} />
                    </div>
                    {isLocationPickerOpen && (
                        <div className="location-dropdown">
                            {spaces.map(s => (
                                <div key={s.id} className="location-space-group">
                                    <div className="location-space-item" onClick={() => handleUpdate({ spaceId: s.id })}>
                                        <div className="space-dot" style={{ backgroundColor: s.color || '#cbd5e1' }}></div>
                                        <span>{s.name}</span>
                                    </div>
                                    <div className="location-lists">
                                        {lists.filter(l => l.spaceId === s.id).map(l => (
                                            <div
                                                key={l.id}
                                                className={`location-list-item ${task.listId === l.id ? 'active' : ''}`}
                                                onClick={() => {
                                                    handleUpdate({ spaceId: s.id, listId: l.id });
                                                    setIsLocationPickerOpen(false);
                                                }}
                                            >
                                                {l.name}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="detail-header">
                    <div className="detail-header-left">
                        <button className="status-badge-detail" style={{ background: task.status === 'COMPLETED' ? '#22c55e' : '#3b82f6' }}>
                            <CheckCircle2 size={14} />
                            {task.status}
                            <ChevronDown size={14} />
                        </button>
                        <span className="task-id">ID: {task.id.substring(0, 8)}</span>
                    </div>
                    <div className="detail-header-right">
                        <button className="icon-btn-ghost" onClick={handleDelete} title="Delete Task">
                            <Trash2 size={18} />
                        </button>
                        <div style={{ position: 'relative' }}>
                            <button className="icon-btn-ghost" onClick={() => setIsOptionsMenuOpen(!isOptionsMenuOpen)}>
                                <MoreVertical size={18} />
                            </button>
                            {isOptionsMenuOpen && (
                                <TaskOptionsMenu
                                    taskId={taskId}
                                    onClose={() => setIsOptionsMenuOpen(false)}
                                    onRename={handleRename}
                                    onDuplicate={handleDuplicate}
                                    onArchive={handleArchive}
                                    onDelete={handleDelete}
                                    onConvertToDoc={handleConvertToDoc}
                                    onMove={() => { setIsLocationPickerOpen(true); setIsOptionsMenuOpen(false); }}
                                    onStartTimer={() => { alert('Timer started for task ' + taskId); setIsOptionsMenuOpen(false); }}
                                />
                            )}
                        </div>
                        <button className="icon-btn-ghost" onClick={onClose}><X size={20} /></button>
                    </div>
                </div>

                <div className="detail-body">
                    <div className="detail-main">
                        <input
                            className="detail-title-input"
                            value={task.name}
                            onChange={(e) => handleUpdate({ name: e.target.value })}
                            placeholder="Task name"
                        />

                        <div className="detail-meta-grid">
                            <div className="meta-left-col">
                                <div className="meta-item">
                                    <span className="meta-label">Status</span>
                                    <div className="meta-inline-val">
                                        <span className="status-dot-small" style={{ backgroundColor: task.status === 'COMPLETED' ? '#22c55e' : '#3b82f6' }}></span>
                                        {task.status}
                                    </div>
                                </div>
                                <div className="meta-item">
                                    <span className="meta-label">Dates</span>
                                    <div className="meta-inline-val">
                                        <div
                                            className="date-range-display-premium"
                                            onClick={() => setIsDatePickerOpen(true)}
                                        >
                                            <Calendar size={14} />
                                            <span className="date-text">
                                                {task.startDate ? (
                                                    task.startDate.includes('T')
                                                        ? format(new Date(task.startDate), 'M/d/yy h:mm a')
                                                        : format(new Date(task.startDate), 'M/d/yy')
                                                ) : 'Set start'}
                                                <span className="arrow"> → </span>
                                                {task.dueDate ? (
                                                    task.dueDate.includes('T')
                                                        ? format(new Date(task.dueDate), 'M/d/yy h:mm a')
                                                        : format(new Date(task.dueDate), 'M/d/yy')
                                                ) : 'Set due'}
                                            </span>
                                        </div>

                                        {isDatePickerOpen && (
                                            <div className="datepicker-popper-wrapper">
                                                <div className="datepicker-backdrop" onClick={(e) => {
                                                    e.stopPropagation();
                                                    setIsDatePickerOpen(false);
                                                }} />
                                                <PremiumDatePicker
                                                    startDate={task.startDate}
                                                    dueDate={task.dueDate}
                                                    onSave={(dates) => {
                                                        handleUpdate(dates);
                                                        setIsDatePickerOpen(false);
                                                    }}
                                                    onClose={() => setIsDatePickerOpen(false)}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="meta-item">
                                    <span className="meta-label">Track Time</span>
                                    <div className="meta-inline-val">
                                        <Clock3 size={14} />
                                        <div style={{ position: 'relative' }}>
                                            <button className="text-btn-picker" onClick={() => setIsTimePickerOpen(true)}>
                                                {task.timeEntries && task.timeEntries.length > 0
                                                    ? `${task.timeEntries.reduce((acc, curr) => acc + curr.duration, 0)}m tracked`
                                                    : 'Add time'}
                                            </button>
                                            {isTimePickerOpen && (
                                                <div style={{ position: 'absolute', top: '100%', left: 0, zIndex: 2200 }}>
                                                    <TimePicker
                                                        onSelect={handleAddTime}
                                                        onClose={() => setIsTimePickerOpen(false)}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="meta-item">
                                    <span className="meta-label">Relationships</span>
                                    <div className="meta-inline-val">
                                        <div className="rel-list-inline">
                                            {task.relationships && task.relationships.map(rel => {
                                                const relatedTask = tasks.find(t => t.id === rel.taskId);
                                                return (
                                                    <span key={rel.id} className="rel-pill-small">
                                                        {rel.type}: {relatedTask ? relatedTask.name.substring(0, 10) + '...' : rel.taskId.substring(0, 4)}
                                                    </span>
                                                );
                                            })}
                                            {(!task.relationships || task.relationships.length === 0) && (
                                                <span className="empty-val">Empty</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="meta-right-col">
                                <div className="meta-item">
                                    <span className="meta-label">Assignees</span>
                                    <div className="meta-inline-val">
                                        <div className="assignee-avatar-xs">{task.assignee?.[0] || 'U'}</div>
                                        <input
                                            className="meta-inline-input"
                                            value={task.assignee || ''}
                                            onChange={(e) => handleUpdate({ assignee: e.target.value })}
                                            placeholder="Unassigned"
                                        />
                                    </div>
                                </div>
                                <div className="meta-item">
                                    <span className="meta-label">Priority</span>
                                    <div className="meta-inline-val">
                                        <AlertCircle size={14} style={{ color: task.priority === 'urgent' ? '#ef4444' : '#64748b' }} />
                                        <span style={{ color: task.priority === 'urgent' ? '#ef4444' : '#64748b' }}>{task.priority || 'Empty'}</span>
                                    </div>
                                </div>
                                <div className="meta-item">
                                    <span className="meta-label">Tags</span>
                                    <div className="tags-container-detail">
                                        {task.tags?.map(tagId => {
                                            const tag = tags.find(t => t.id === tagId);
                                            return tag ? (
                                                <span key={tagId} className="tag-pill" style={{ backgroundColor: tag.color + '20', color: tag.color }}>
                                                    {tag.name}
                                                    <X size={10} style={{ marginLeft: '4px', cursor: 'pointer' }} onClick={() => toggleTag(tagId)} />
                                                </span>
                                            ) : null;
                                        })}
                                        <div style={{ position: 'relative' }}>
                                            <button className="add-tag-btn" onClick={() => setIsTagPickerOpen(!isTagPickerOpen)}>
                                                <Plus size={12} />
                                            </button>
                                            {isTagPickerOpen && (
                                                <div className="tag-picker-dropdown">
                                                    <div className="tag-picker-header">Select Tags</div>
                                                    <div className="tag-picker-list">
                                                        {tags.map(tag => (
                                                            <div
                                                                key={tag.id}
                                                                className="tag-picker-item"
                                                                onClick={() => toggleTag(tag.id)}
                                                            >
                                                                <span className="tag-dot" style={{ backgroundColor: tag.color }}></span>
                                                                <span className="tag-name">{tag.name}</span>
                                                                {task.tags?.includes(tag.id) && <Check size={12} className="check-icon" />}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="detail-tabs">
                            <button
                                className={`tab ${activeTab === 'details' ? 'active' : ''}`}
                                onClick={() => setActiveTab('details')}
                            >
                                Details
                            </button>
                            {!isSubtask && (
                                <button
                                    className={`tab ${activeTab === 'subtasks' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('subtasks')}
                                >
                                    Subtasks ({task.subtasks?.length || 0})
                                </button>
                            )}
                        </div>

                        <div className="tab-content">
                            {activeTab === 'details' && (
                                <div className="description-container">
                                    <div className="description-doc-header">
                                        <DocIcon size={14} className="doc-icon" />
                                        <span>Description</span>
                                        {!isSubtask && !task.linkedDocId && task.description && (
                                            <button className="btn-convert-doc" onClick={handleConvertToDoc}>
                                                <Plus size={12} /> Convert to Doc
                                            </button>
                                        )}
                                    </div>
                                    <RichTextEditor
                                        value={task.description || ''}
                                        onChange={(val) => handleUpdate({ description: val })}
                                        placeholder={isSubtask ? "No description for subtasks" : "Type your description here like a document..."}
                                        readOnly={isSubtask}
                                    />
                                    {task.linkedDocId && (
                                        <div className="linked-doc-pill" onClick={handleOpenLinkedDoc}>
                                            <DocIcon size={14} />
                                            <span>Linked Doc: {docs.find(d => d.id === task.linkedDocId)?.name || 'Document'}</span>
                                            <ExternalLink size={12} style={{ marginLeft: '4px' }} />
                                        </div>
                                    )}
                                </div>
                            )}
                            {activeTab === 'subtasks' && !isSubtask && (
                                <div className="subtasks-wrapper">
                                    <div className="subtasks-header-row">
                                        <div className="st-col-name">Name</div>
                                        <div className="st-col-assignee">Assignee</div>
                                        <div className="st-col-prio">Priority</div>
                                        <div className="st-col-date">Due date</div>
                                        <div className="st-col-actions"></div>
                                    </div>
                                    <div className="subtasks-list-new">
                                        {task.subtasks?.map((st: Subtask) => (
                                            <div key={st.id} className="subtask-row-item">
                                                <div className="st-cell-name">
                                                    <div className="st-checkbox-area">
                                                        <div
                                                            className={`st-status-circle ${st.status === 'COMPLETED' ? 'completed' : ''}`}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                updateSubtask(taskId, st.id, { status: st.status === 'COMPLETED' ? 'TO DO' : 'COMPLETED' });
                                                            }}
                                                        >
                                                            {st.status === 'COMPLETED' && <Check size={10} strokeWidth={4} />}
                                                        </div>
                                                    </div>
                                                    <div className="st-name-group">
                                                        {st.status === 'COMPLETED' ? (
                                                            <span className="st-name-text completed">{st.name}</span>
                                                        ) : (
                                                            <span
                                                                className="st-name-text link"
                                                                onClick={() => onTaskClick && onTaskClick(st.id)}
                                                            >
                                                                {st.name}
                                                            </span>
                                                        )}
                                                        <div className="st-hover-actions">
                                                            <button className="icon-btn-ghost-st" title="Add tags">
                                                                <Tag size={12} />
                                                            </button>
                                                            <button className="icon-btn-ghost-st" title="Rename" onClick={() => {/* Toggle rename */ }}>
                                                                <Edit2 size={12} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="st-cell-assignee">
                                                    <div className="icon-box-st">
                                                        <Users size={14} />
                                                    </div>
                                                </div>
                                                <div className="st-cell-prio">
                                                    <div className="icon-box-st">
                                                        <Flag size={14} />
                                                    </div>
                                                </div>
                                                <div className="st-cell-date">
                                                    <div className="icon-box-st">
                                                        <Calendar size={14} />
                                                    </div>
                                                </div>
                                                <div className="st-cell-actions">
                                                    <button className="icon-btn-ghost-st">
                                                        <MoreHorizontal size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}

                                        <form onSubmit={handleAddSubtask} className="subtask-add-row">
                                            <div className="st-cell-name">
                                                <Plus size={14} className="plus-icon-st" />
                                                <input
                                                    placeholder="Add Task"
                                                    value={newSubtaskName}
                                                    onChange={(e) => setNewSubtaskName(e.target.value)}
                                                />
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="sidebar-container-new">
                        <div className="sidebar-content-area">
                            {sidebarTab === 'activity' && (
                                <div className="activity-panel">
                                    <div className="panel-header">Activity</div>
                                    <div className="activity-feed">
                                        {task.comments && task.comments.map(comment => (
                                            <div key={comment.id} className="activity-row" style={{ marginBottom: '16px' }}>
                                                <div className="activity-avatar">{comment.userName[0]}</div>
                                                <div className="activity-info">
                                                    <div className="activity-msg"><strong>{comment.userName}</strong>: {comment.text}</div>
                                                    <div className="activity-time">{format(parseISO(comment.createdAt), 'MMM d, h:mm a')}</div>
                                                </div>
                                            </div>
                                        ))}
                                        <div className="activity-row">
                                            <div className="activity-avatar">J</div>
                                            <div className="activity-info">
                                                <div className="activity-msg"><strong>Jundee</strong> created this task</div>
                                                <div className="activity-time">{format(parseISO(task.createdAt), 'MMM d, h:mm a')}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="comment-composer">
                                        <input
                                            placeholder="Write a comment..."
                                            value={commentText}
                                            onChange={(e) => setCommentText(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                                        />
                                        <div className="composer-actions">
                                            <button className="icon-btn-sm" onClick={handleAddComment}><Send size={14} /></button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {sidebarTab === 'links' && (
                                <div className="links-panel">
                                    <div className="panel-header">Links</div>
                                    <div className="empty-panel-content">
                                        <Link2 size={32} />
                                        <p>No links yet</p>
                                    </div>
                                </div>
                            )}

                            {sidebarTab === 'more' && (
                                <div className="more-panel">
                                    <div className="panel-header">Add to this task</div>

                                    <div className="more-section">
                                        <h5>Connect a URL</h5>
                                        <div className="url-input-container">
                                            <input placeholder="Paste any link..." />
                                        </div>
                                    </div>

                                    <div className="more-section">
                                        <h5>Add Relationship</h5>
                                        <RelationshipMenu
                                            taskId={taskId}
                                            onClose={() => { }}
                                            inline
                                            modalPicker
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="sidebar-tabs-vertical">
                            <button
                                className={`vertical-tab ${sidebarTab === 'activity' ? 'active' : ''}`}
                                onClick={() => setSidebarTab('activity')}
                            >
                                <MessageSquare size={18} />
                                <span className="tab-label">Activity</span>
                            </button>
                            <button
                                className={`vertical-tab ${sidebarTab === 'links' ? 'active' : ''}`}
                                onClick={() => setSidebarTab('links')}
                            >
                                <LinkIcon size={18} />
                                <span className="tab-label">Links</span>
                            </button>
                            <button
                                className={`vertical-tab ${sidebarTab === 'more' ? 'active' : ''}`}
                                onClick={() => setSidebarTab('more')}
                            >
                                <Plus size={18} />
                                <span className="tab-label">More</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaskDetailModal;
