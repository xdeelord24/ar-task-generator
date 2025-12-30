import React, { useMemo } from 'react';
import {
    Plus,
    Search,
    Filter,
    ArrowUpDown,
    ChevronRight,
    Calendar as CalendarIcon,
    MoreHorizontal,
    GripVertical,
    Flag,
    Tag as TagIcon,
    Pencil
} from 'lucide-react';
import {
    DndContext,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
    useDroppable,
} from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    horizontalListSortingStrategy,
    useSortable,
    arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useAppStore } from '../store/useAppStore';
import { format, isPast, isToday } from 'date-fns';
import type { Task, ColumnSetting, Tag, Status } from '../types';
import TaskOptionsMenu from '../components/TaskOptionsMenu';
import DatePicker from '../components/DatePicker';
import TagMenu from '../components/TagMenu';
import ViewHeader from '../components/ViewHeader';
import StatusEditorModal from '../components/StatusEditorModal';
import { Settings2 } from 'lucide-react';
import '../styles/ListView.css';
import '../styles/TaskOptionsMenu.css';

interface ListViewProps {
    onAddTask: () => void;
    onTaskClick: (taskId: string) => void;
}

interface ColumnHeaderProps {
    column: ColumnSetting;
    onSort?: () => void;
}

const SortableColumnHeader: React.FC<ColumnHeaderProps> = ({ column }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: column.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        width: column.width || 150,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="column-header-cell"
            data-column={column.id}
            {...attributes}
            {...listeners}
        >
            <span>{column.name}</span>
            <ArrowUpDown size={12} className="sort-icon" />
        </div>
    );
};

interface ActivePopover {
    taskId: string;
    field: 'priority' | 'date' | 'tags';
    element: HTMLElement;
}

interface SortableRowProps {
    task: Task;
    columns: ColumnSetting[];
    onTaskClick: (taskId: string) => void;
    getPriorityColor: (priority: Task['priority']) => string;
    getDateStatus: (dateStr?: string) => string | null;
    tags: Tag[];
    onOpenMenu: (taskId: string, trigger: HTMLElement) => void;
    isMenuOpen: boolean;
    onCloseMenu: () => void;
    onDuplicate: (taskId: string) => void;
    onArchive: (taskId: string) => void;
    onDelete: (taskId: string) => void;
    onConvertToDoc: (task: Task) => void;
    onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
    activePopover: ActivePopover | null;
    setActivePopover: (popover: ActivePopover | null) => void;
    onAddTag: (tag: Omit<Tag, 'id'>) => void;
    onUpdateTag: (tagId: string, updates: Partial<Tag>) => void;
    onDeleteTag: (tagId: string) => void;
    onStartTimer: () => void;
    menuTrigger: HTMLElement | null;
}

const priorities: any[] = ['low', 'medium', 'high', 'urgent'];

interface SubtaskRowItemProps {
    task: any;
    columns: ColumnSetting[];
    onTaskClick: (taskId: string) => void;
    getPriorityColor: (priority: any) => string;
    getDateStatus: (dateStr?: string) => string | null;
    tags: Tag[];
    parentId: string;
    onUpdateSubtask: (parentId: string, subtaskId: string, updates: any) => void;
    activePopover: ActivePopover | null;
    setActivePopover: (popover: ActivePopover | null) => void;
    onOpenMenu: (taskId: string, trigger: HTMLElement) => void;
    isMenuOpen: boolean;
    onCloseMenu: () => void;
    menuTrigger: HTMLElement | null;
    onDeleteSubtask: (parentId: string, subtaskId: string) => void;
}

const SubtaskRowItem: React.FC<SubtaskRowItemProps> = ({
    task,
    columns,
    onTaskClick,
    getPriorityColor,
    getDateStatus,
    onUpdateSubtask,
    parentId,
    activePopover,
    setActivePopover,
    onOpenMenu,
    isMenuOpen,
    onCloseMenu,
    menuTrigger,
    onDeleteSubtask,
    tags
}) => {
    const [isRenaming, setIsRenaming] = React.useState(false);
    const [renameValue, setRenameValue] = React.useState(task.name);
    const inputRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        if (isRenaming && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isRenaming]);

    const handleRenameSubmit = () => {
        if (renameValue.trim() && renameValue !== task.name) {
            onUpdateSubtask(parentId, task.id, { name: renameValue.trim() });
        }
        setIsRenaming(false);
    };

    const renderCell = (col: ColumnSetting) => {
        switch (col.id) {
            case 'name':
                return (
                    <div className="task-cell name-cell" style={{ width: col.width || 350, overflow: 'visible', paddingLeft: '48px' }}>
                        <div className="task-cell-inner" style={{ overflow: 'visible' }}>
                            <div className="subtask-indent-line"></div>
                            <input
                                type="checkbox"
                                checked={task.status === 'COMPLETED'}
                                onChange={(e) => {
                                    e.stopPropagation();
                                    onUpdateSubtask(parentId, task.id, { status: e.target.checked ? 'COMPLETED' : 'TO DO' });
                                }}
                            />
                            {isRenaming ? (
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={renameValue}
                                    onChange={e => setRenameValue(e.target.value)}
                                    onBlur={handleRenameSubmit}
                                    onKeyDown={e => {
                                        if (e.key === 'Enter') handleRenameSubmit();
                                        if (e.key === 'Escape') { setRenameValue(task.name); setIsRenaming(false); }
                                        e.stopPropagation();
                                    }}
                                    onClick={e => e.stopPropagation()}
                                    className="task-name-input"
                                    style={{ flex: 1, minWidth: 0, height: 24, padding: '0 4px', border: '1px solid var(--primary)', borderRadius: 4, background: 'var(--bg-main)', color: 'var(--text-main)' }}
                                />
                            ) : (
                                <span className="task-name" style={{ color: task.status === 'COMPLETED' ? 'var(--text-tertiary)' : 'inherit', textDecoration: task.status === 'COMPLETED' ? 'line-through' : 'none' }}>
                                    {task.name}
                                </span>
                            )}
                            <div className="task-tags">
                                {task.tags?.map((tagId: string) => {
                                    const tag = tags.find(t => t.id === tagId);
                                    if (!tag) return null;
                                    return (
                                        <span key={tagId} className="tag-pill" style={{ backgroundColor: tag.color + '20', color: tag.color }}>
                                            {tag.name}
                                        </span>
                                    );
                                })}
                                {activePopover?.taskId === task.id && activePopover?.field === 'tags' && (
                                    <div style={{ position: 'absolute', top: '100%', left: 0, zIndex: 100 }}>
                                        <TagMenu
                                            tags={tags}
                                            selectedTagIds={task.tags || []}
                                            onToggleTag={(tagId) => {
                                                const currentTags: string[] = task.tags || [];
                                                const newTags = currentTags.includes(tagId) ? currentTags.filter(t => t !== tagId) : [...currentTags, tagId];
                                                onUpdateSubtask(parentId, task.id, { tags: newTags });
                                            }}
                                            onClose={() => setActivePopover(null)}
                                            onCreateTag={() => { }}
                                            onUpdateTag={() => { }}
                                            onDeleteTag={() => { }}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            case 'assignee':
                return (
                    <div className="task-cell assignee-cell" style={{ width: col.width || 150 }}>
                        <div className="assignee-avatar">
                            {task.assignee?.[0] || '?'}
                        </div>
                        <span>{task.assignee || 'Unassigned'}</span>
                    </div>
                );
            case 'dueDate':
                return (
                    <div className="task-cell date-cell" style={{ width: col.width || 130 }}>
                        <div
                            className={`date-badge-interactive ${task.dueDate ? getDateStatus(task.dueDate) : 'empty'}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                setActivePopover({ taskId: task.id, field: 'date', element: e.currentTarget });
                            }}
                        >
                            <CalendarIcon size={12} />
                            {task.dueDate ? format(new Date(task.dueDate), 'MMM d') : '-'}
                        </div>
                        {activePopover?.taskId === task.id && activePopover?.field === 'date' && (
                            <DatePicker
                                initialDate={task.dueDate ? new Date(task.dueDate) : undefined}
                                onSelect={(date) => {
                                    onUpdateSubtask(parentId, task.id, { dueDate: date?.toISOString() });
                                    setActivePopover(null);
                                }}
                                onClose={() => setActivePopover(null)}
                                triggerElement={activePopover.element}
                            />
                        )}
                    </div>
                );
            case 'priority':
                return (
                    <div className="task-cell priority-cell" style={{ width: col.width || 110, overflow: 'visible', position: 'relative' }}>
                        <div
                            className="priority-badge-interactive"
                            style={{ color: getPriorityColor(task.priority), display: 'flex', alignItems: 'center' }}
                            onClick={(e) => {
                                e.stopPropagation();
                                setActivePopover({ taskId: task.id, field: 'priority', element: e.currentTarget });
                            }}
                        >
                            <Flag size={12} style={{ color: getPriorityColor(task.priority), marginRight: 6 }} />
                            <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>{task.priority || '-'}</span>
                        </div>
                        {activePopover?.taskId === task.id && activePopover?.field === 'priority' && (
                            <div className="inline-popover priority-popover" onClick={e => e.stopPropagation()} style={{ zIndex: 101 }}>
                                {priorities.map((p: any) => (
                                    <div
                                        key={p}
                                        className="popover-item"
                                        style={{ color: getPriorityColor(p), fontWeight: 700, textTransform: 'uppercase', fontSize: '11px' }}
                                        onClick={() => {
                                            onUpdateSubtask(parentId, task.id, { priority: p });
                                            setActivePopover(null);
                                        }}
                                    >
                                        <Flag size={12} style={{ marginRight: 8 }} />
                                        {p}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );
            case 'status':
                return (
                    <div className="task-cell status-cell" style={{ width: col.width || 130 }}>
                        <span className="status-pill">{task.status}</span>
                    </div>
                );
            default:
                return <div className="task-cell" style={{ width: col.width || 100 }}></div>;
        }
    };

    return (
        <div className="task-item-row subtask-item-row" onClick={() => onTaskClick(task.id)}>
            <div className="drag-handle-placeholder" style={{ width: 30 }}></div>
            {columns.filter(c => c.visible).map(col => (
                <React.Fragment key={col.id}>
                    {renderCell(col)}
                </React.Fragment>
            ))}
            <div className="task-cell actions-cell" style={{ width: 50, position: 'relative', overflow: 'visible' }}>
                <button
                    className="icon-btn-ghost"
                    onClick={(e) => {
                        e.stopPropagation();
                        if (isMenuOpen) onCloseMenu();
                        else onOpenMenu(task.id, e.currentTarget);
                    }}
                >
                    <MoreHorizontal size={16} />
                </button>
                {isMenuOpen && (
                    <TaskOptionsMenu
                        taskId={task.id}
                        onClose={onCloseMenu}
                        onRename={() => {
                            setRenameValue(task.name);
                            setIsRenaming(true);
                            onCloseMenu();
                        }}
                        onDelete={() => onDeleteSubtask(parentId, task.id)}
                        onDuplicate={() => { }}
                        onArchive={() => { }}
                        triggerElement={menuTrigger}
                        onConvertToDoc={() => { }}
                        onStartTimer={() => { }}
                    />
                )}
            </div>
        </div>
    );
};

interface SortableRowPropsWithUpdateSubtask extends SortableRowProps {
    onUpdateSubtask: (parentId: string, subtaskId: string, updates: any) => void;
    onAddSubtask: (taskId: string, name: string) => void;
    onDeleteSubtask: (parentId: string, subtaskId: string) => void;
    openMenuTaskId: string | null;
}

const SortableRow: React.FC<SortableRowPropsWithUpdateSubtask> = ({
    task,
    columns,
    onTaskClick,
    getPriorityColor,
    getDateStatus,
    tags,
    onOpenMenu,
    isMenuOpen,
    onCloseMenu,
    onDuplicate,
    onArchive,
    onDelete,
    onConvertToDoc,
    onUpdateTask,
    activePopover,
    setActivePopover,
    onAddTag,
    onUpdateTag,
    onDeleteTag,
    onStartTimer,
    onUpdateSubtask,
    onAddSubtask,
    onDeleteSubtask,
    menuTrigger,
    openMenuTaskId
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: task.id });

    const [isExpanded, setIsExpanded] = React.useState(false);
    const [isRenaming, setIsRenaming] = React.useState(false);
    const [renameValue, setRenameValue] = React.useState(task.name);
    const inputRef = React.useRef<HTMLInputElement>(null);

    const [isAddingSubtask, setIsAddingSubtask] = React.useState(false);
    const [newSubtaskName, setNewSubtaskName] = React.useState('');
    const newSubtaskInputRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        if (isAddingSubtask && newSubtaskInputRef.current) {
            newSubtaskInputRef.current.focus();
        }
    }, [isAddingSubtask]);

    React.useEffect(() => {
        if (isRenaming && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isRenaming]);

    const handleRenameSubmit = () => {
        if (renameValue.trim() && renameValue !== task.name) {
            onUpdateTask(task.id, { name: renameValue.trim() });
        }
        setIsRenaming(false);
    };

    const handleSubtaskSubmit = () => {
        if (newSubtaskName.trim()) {
            onAddSubtask(task.id, newSubtaskName.trim());
            setIsAddingSubtask(false);
            setNewSubtaskName('');
        } else {
            setIsAddingSubtask(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleRenameSubmit();
        } else if (e.key === 'Escape') {
            setRenameValue(task.name);
            setIsRenaming(false);
        }
        e.stopPropagation();
    };

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
        zIndex: isDragging ? 1 : (activePopover?.taskId === task.id ? 50 : 0),
    };

    const priorities: Task['priority'][] = ['urgent', 'high', 'medium', 'low'];
    const hasSubtasks = task.subtasks && task.subtasks.length > 0;

    const renderCell = (col: ColumnSetting) => {
        switch (col.id) {
            case 'name':
                return (
                    <div className="task-cell name-cell" style={{ width: col.width || 350, overflow: 'visible' }}>
                        <div className="task-cell-inner" style={{ overflow: 'visible' }}>
                            <div
                                style={{ width: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginRight: 4 }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsExpanded(!isExpanded);
                                }}
                                title={isExpanded ? "Collapse subtasks" : "Expand subtasks"}
                            >
                                {hasSubtasks && (
                                    <div className={`subtask-toggle-btn ${isExpanded ? 'expanded' : ''}`}>
                                        <ChevronRight size={14} />
                                    </div>
                                )}
                            </div>

                            <input type="checkbox" readOnly checked={task.status === 'COMPLETED'} />

                            {isRenaming ? (
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={renameValue}
                                    onChange={(e) => setRenameValue(e.target.value)}
                                    onBlur={handleRenameSubmit}
                                    onKeyDown={handleKeyDown}
                                    onClick={(e) => e.stopPropagation()}
                                    className="task-name-input"
                                    style={{
                                        flex: 1,
                                        minWidth: 0,
                                        border: '1px solid #3b82f6',
                                        borderRadius: '4px',
                                        padding: '0 4px',
                                        fontSize: 'inherit',
                                        fontFamily: 'inherit',
                                        background: 'white',
                                        color: 'inherit',
                                        height: '24px'
                                    }}
                                />
                            ) : (
                                <span className="task-name">{task.name}</span>
                            )}
                            <div className="task-tags">
                                {task.tags?.map(tagId => {
                                    const tag = tags.find(t => t.id === tagId);
                                    if (!tag) return null;
                                    return (
                                        <span key={tagId} className="tag-pill" style={{ backgroundColor: tag.color + '20', color: tag.color }}>
                                            {tag.name}
                                        </span>
                                    );
                                })}

                                {activePopover?.taskId === task.id && activePopover?.field === 'tags' && (
                                    <div style={{ position: 'absolute', top: '100%', left: 0, zIndex: 100 }}>
                                        <TagMenu
                                            tags={tags}
                                            selectedTagIds={task.tags || []}
                                            onToggleTag={(tagId) => {
                                                const currentTags = task.tags || [];
                                                const newTags = currentTags.includes(tagId)
                                                    ? currentTags.filter(t => t !== tagId)
                                                    : [...currentTags, tagId];
                                                onUpdateTask(task.id, { tags: newTags });
                                            }}
                                            onCreateTag={onAddTag}
                                            onUpdateTag={onUpdateTag}
                                            onDeleteTag={onDeleteTag}
                                            onClose={() => setActivePopover(null)}
                                            triggerElement={activePopover.element}
                                        />
                                    </div>
                                )}
                            </div>

                            {hasSubtasks && (
                                <div style={{ fontSize: '11px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 2, marginLeft: 6 }}>
                                    <div style={{ width: 1, height: 12, background: '#cbd5e1', transform: 'rotate(15deg)' }}></div>
                                    {task.subtasks!.length}
                                </div>
                            )}

                            <div className="row-hover-actions">
                                <button
                                    className="row-action-btn"
                                    title="Add subtask"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsAddingSubtask(true);
                                        setIsExpanded(true);
                                    }}
                                >
                                    <Plus size={18} />
                                </button>
                                <button
                                    className="row-action-btn"
                                    title="Edit tags"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setActivePopover({ taskId: task.id, field: 'tags', element: e.currentTarget });
                                    }}
                                >
                                    <TagIcon size={18} />
                                </button>
                                <button
                                    className="row-action-btn"
                                    title="Rename"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setRenameValue(task.name);
                                        setIsRenaming(true);
                                    }}
                                >
                                    <Pencil size={18} />
                                </button>
                            </div>

                        </div>
                    </div>
                );
            case 'assignee':
                return (
                    <div className="task-cell assignee-cell" style={{ width: col.width || 150 }}>
                        <div className="assignee-avatar">
                            {task.assignee?.[0] || '?'}
                        </div>
                        <span>{task.assignee || 'Unassigned'}</span>
                    </div>
                );
            case 'dueDate':
                return (
                    <div className="task-cell date-cell" style={{ width: col.width || 130, position: 'relative', overflow: 'visible' }}>
                        <div
                            className={`date-badge-interactive ${task.dueDate ? getDateStatus(task.dueDate) : 'empty'}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                setActivePopover({ taskId: task.id, field: 'date', element: e.currentTarget });
                            }}
                        >
                            <CalendarIcon size={12} />
                            {task.dueDate ? format(new Date(task.dueDate), 'MMM d') : 'Set Date'}
                        </div>
                        {activePopover?.taskId === task.id && activePopover?.field === 'date' && (
                            <DatePicker
                                initialDate={task.dueDate ? new Date(task.dueDate) : undefined}
                                onSelect={(date: Date | null) => {
                                    onUpdateTask(task.id, { dueDate: date ? date.toISOString() : undefined });
                                    setActivePopover(null);
                                }}
                                onClose={() => setActivePopover(null)}
                                triggerElement={activePopover.element}
                            />
                        )}
                    </div>
                );
            case 'priority':
                return (
                    <div className="task-cell priority-cell" style={{ width: col.width || 110, position: 'relative', overflow: 'visible' }}>
                        <div
                            className="priority-badge-interactive"
                            style={{ color: getPriorityColor(task.priority) }}
                            onClick={(e) => {
                                e.stopPropagation();
                                setActivePopover({ taskId: task.id, field: 'priority', element: e.currentTarget });
                            }}
                        >
                            {task.priority || '-'}
                        </div>
                        {activePopover?.taskId === task.id && activePopover?.field === 'priority' && (
                            <div className="inline-popover priority-popover" onClick={e => e.stopPropagation()}>
                                {priorities.map(p => (
                                    <div
                                        key={p}
                                        className="popover-item"
                                        style={{ color: getPriorityColor(p), fontWeight: 700, textTransform: 'uppercase', fontSize: '11px' }}
                                        onClick={() => {
                                            onUpdateTask(task.id, { priority: p });
                                            setActivePopover(null);
                                        }}
                                    >
                                        <Flag size={12} style={{ marginRight: 8 }} />
                                        {p}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );
            case 'status':
                return (
                    <div className="task-cell status-cell" style={{ width: col.width || 130 }}>
                        <span className="status-pill">{task.status}</span>
                    </div>
                );
            default:
                return <div className="task-cell" style={{ width: col.width || 100 }}>-</div>;
        }
    };

    return (
        <div ref={setNodeRef} style={style} className="task-row-wrapper">
            <div
                className="task-item-row"
                onClick={() => onTaskClick(task.id)}
            >
                <div className="drag-handle" {...attributes} {...listeners}>
                    <GripVertical size={16} />
                </div>
                {columns.filter(c => c.visible).map(col => (
                    <React.Fragment key={col.id}>
                        {renderCell(col)}
                    </React.Fragment>
                ))}
                <div className="task-cell actions-cell" style={{ width: 50, position: 'relative', overflow: 'visible' }}>
                    <button
                        className="icon-btn-ghost"
                        style={{ zIndex: 10, position: 'relative' }}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (isMenuOpen) {
                                onCloseMenu();
                            } else {
                                onOpenMenu(task.id, e.currentTarget);
                            }
                        }}
                    >
                        <MoreHorizontal size={18} />
                    </button>
                    {isMenuOpen && (
                        <TaskOptionsMenu
                            taskId={task.id}
                            onClose={onCloseMenu}
                            onRename={() => { onTaskClick(task.id); onCloseMenu(); }}
                            onDuplicate={() => onDuplicate(task.id)}
                            onArchive={() => onArchive(task.id)}
                            onDelete={() => onDelete(task.id)}
                            onConvertToDoc={() => onConvertToDoc(task)}
                            onStartTimer={onStartTimer}
                            triggerElement={menuTrigger}
                        />
                    )}
                </div>
            </div>

            {((hasSubtasks && isExpanded) || isAddingSubtask) && (
                <div className="subtasks-container">
                    {task.subtasks?.map(st => (
                        <SubtaskRowItem
                            key={st.id}
                            task={st}
                            columns={columns}
                            onTaskClick={onTaskClick}
                            getPriorityColor={getPriorityColor}
                            getDateStatus={getDateStatus}
                            tags={tags}
                            onUpdateSubtask={onUpdateSubtask}
                            parentId={task.id}
                            activePopover={activePopover}
                            setActivePopover={setActivePopover}
                            onOpenMenu={onOpenMenu}
                            isMenuOpen={openMenuTaskId === st.id}
                            onCloseMenu={onCloseMenu}
                            menuTrigger={menuTrigger}
                            onDeleteSubtask={onDeleteSubtask}
                        />

                    ))}
                    {isAddingSubtask && (
                        <div className="task-item-row subtask-item-row">
                            <div className="drag-handle-placeholder" style={{ width: 30 }}></div>
                            {columns.filter(c => c.visible).map(col => {
                                if (col.id === 'name') {
                                    return (
                                        <div key={col.id} className="task-cell name-cell" style={{ width: col.width || 350, overflow: 'visible', paddingLeft: '48px' }}>
                                            <div className="task-cell-inner" style={{ overflow: 'visible' }}>
                                                <div className="subtask-indent-line"></div>
                                                <input
                                                    ref={newSubtaskInputRef}
                                                    type="text"
                                                    className="task-name-input"
                                                    placeholder="Enter subtask name..."
                                                    value={newSubtaskName}
                                                    onChange={e => setNewSubtaskName(e.target.value)}
                                                    onKeyDown={e => {
                                                        if (e.key === 'Enter') handleSubtaskSubmit();
                                                        if (e.key === 'Escape') { setIsAddingSubtask(false); setNewSubtaskName(''); }
                                                        e.stopPropagation();
                                                    }}
                                                    onBlur={() => handleSubtaskSubmit()}
                                                    onClick={e => e.stopPropagation()}
                                                    style={{ flex: 1, border: '1px solid var(--primary)', borderRadius: 4, padding: '4px 8px', fontSize: 13, height: 28, background: 'var(--bg-main)', color: 'var(--text-main)' }}
                                                />
                                            </div>
                                        </div>
                                    );
                                }
                                return <div key={col.id} className={`task-cell ${col.id}-cell`} style={{ width: col.width }}></div>
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const ListView: React.FC<ListViewProps> = ({ onAddTask, onTaskClick }) => {
    const {
        tasks,
        currentSpaceId,
        currentListId,
        addDoc,
        columnSettings,
        setColumnSettings,
        tags,
        addTag,
        updateTag,
        deleteTag,
        startTimer,
        updateSubtask,
        deleteSubtask,
        addStatus,
        spaces,
        lists,
        updateTask,
        deleteTask,
        duplicateTask,
        archiveTask,
        updateSpace,
        updateList,
        addSubtask
    } = useAppStore();
    const [collapsedGroups, setCollapsedGroups] = React.useState<Set<string>>(new Set());
    const [openMenuTaskId, setOpenMenuTaskId] = React.useState<string | null>(null);
    const [menuTrigger, setMenuTrigger] = React.useState<HTMLElement | null>(null);
    const [activePopover, setActivePopover] = React.useState<ActivePopover | null>(null);
    const [isAddingGroup, setIsAddingGroup] = React.useState(false);
    const [newGroupName, setNewGroupName] = React.useState('');
    const [isStatusEditorOpen, setIsStatusEditorOpen] = React.useState(false);

    React.useEffect(() => {
        const handleClickOutside = () => {
            setOpenMenuTaskId(null);
            setMenuTrigger(null);
            setActivePopover(null);
        };
        // Only attach if menu or popover is open
        if (openMenuTaskId || activePopover) {
            window.addEventListener('click', handleClickOutside);
            return () => window.removeEventListener('click', handleClickOutside);
        }
    }, [openMenuTaskId, activePopover]);

    const toggleGroup = (status: string) => {
        const newCollapsed = new Set(collapsedGroups);
        if (newCollapsed.has(status)) {
            newCollapsed.delete(status);
        } else {
            newCollapsed.add(status);
        }
        setCollapsedGroups(newCollapsed);
    };

    const handleConvertToDoc = (task: Task) => {
        if (!task.description) {
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

        updateTask(task.id, { linkedDocId: docId });
        alert('Converted to Doc successfully!');
        setOpenMenuTaskId(null);
    };

    const activeColumns = useMemo(() => {
        return columnSettings[currentSpaceId] || columnSettings['default'] || [];
    }, [columnSettings, currentSpaceId]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const filteredTasks = tasks.filter(task => {
        const matchesSpace = currentSpaceId === 'everything' || task.spaceId === currentSpaceId;
        const matchesList = !currentListId || task.listId === currentListId;
        return matchesSpace && matchesList;
    });

    const activeSpace = spaces.find(s => s.id === currentSpaceId);

    const activeList = lists.find(l => l.id === currentListId);

    const activeStatuses: Status[] = activeList?.statuses || activeSpace?.statuses || [
        { id: 'todo', name: 'TO DO', color: '#3b82f6', type: 'todo' },
        { id: 'inprogress', name: 'IN PROGRESS', color: '#f59e0b', type: 'inprogress' },
        { id: 'completed', name: 'COMPLETED', color: '#10b981', type: 'done' }
    ];

    const handleConfirmAddGroup = () => {
        if (!newGroupName.trim()) {
            setIsAddingGroup(false);
            return;
        }

        const targetId = (currentListId || currentSpaceId);
        const isSpace = !currentListId;

        addStatus(targetId, isSpace, {
            name: newGroupName.trim().toUpperCase(),
            color: '#64748b',
            type: 'inprogress'
        });

        setNewGroupName('');
        setIsAddingGroup(false);
    };

    const getPriorityColor = (priority: Task['priority']) => {
        switch (priority) {
            case 'urgent': return '#ef4444';
            case 'high': return '#f97316';
            case 'medium': return '#f59e0b';
            case 'low': return '#10b981';
            default: return '#64748b';
        }
    };

    const getDateStatus = (dateStr?: string) => {
        if (!dateStr) return null;
        const date = new Date(dateStr);
        if (isPast(date) && !isToday(date)) return 'overdue';
        if (isToday(date)) return 'today';
        return 'upcoming';
    };


    const handleTaskDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        // Status group dropping
        if (activeStatuses.some(s => s.name === overId)) {
            updateTask(activeId, { status: overId as Task['status'] });
            return;
        }

        // Row reordering or status change via row drop
        const overTask = tasks.find(t => t.id === overId);
        const activeTask = tasks.find(t => t.id === activeId);

        if (activeTask && overTask && activeTask.status !== overTask.status) {
            updateTask(activeId, { status: overTask.status });
        }
    };

    const handleColumnDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = activeColumns.findIndex(c => c.id === active.id);
        const newIndex = activeColumns.findIndex(c => c.id === over.id);

        const newColumns = arrayMove(activeColumns, oldIndex, newIndex);
        setColumnSettings(currentSpaceId || 'default', newColumns);
    };



    const handleSaveStatuses = (newStatuses: Status[]) => {
        const targetId = currentListId || currentSpaceId;
        const isSpace = !currentListId;

        if (isSpace) {
            updateSpace(targetId, { statuses: newStatuses });
        } else {
            updateList(targetId, { statuses: newStatuses });
        }
    };

    return (
        <div className="view-container list-view">
            <ViewHeader />

            <div className="toolbar">
                <div className="toolbar-left">
                    <button className="btn-secondary" style={{ padding: '6px 14px', fontSize: '13px' }}><Filter size={14} /> Filter</button>
                    <button className="btn-secondary" style={{ padding: '6px 14px', fontSize: '13px' }}><ArrowUpDown size={14} /> Sort</button>
                </div>
                <div className="toolbar-right">
                    <div className="toolbar-search">
                        <Search size={14} />
                        <input type="text" placeholder="Search tasks..." readOnly />
                    </div>
                    <button className="btn-primary" onClick={onAddTask} style={{ padding: '8px 16px' }}>
                        <Plus size={16} /> Add Task
                    </button>
                </div>
            </div>

            <div className="list-table-container">
                {/* Column Headers */}
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCorners}
                    onDragEnd={handleColumnDragEnd}
                >
                    <div className="list-table-header">
                        <div className="drag-handle-placeholder"></div>
                        <SortableContext
                            items={activeColumns.filter(c => c.visible).map(c => c.id)}
                            strategy={horizontalListSortingStrategy}
                        >
                            {activeColumns.filter(c => c.visible).map(col => (
                                <SortableColumnHeader key={col.id} column={col} />
                            ))}
                        </SortableContext>
                        <div className="column-header-cell actions-cell" style={{ width: 50 }}></div>
                    </div>
                </DndContext>

                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCorners}
                    onDragEnd={handleTaskDragEnd}
                >
                    <div className="list-body">
                        {activeStatuses.map(statusObj => {
                            const statusTasks = filteredTasks.filter(t =>
                                t.status.toLowerCase() === statusObj.name.toLowerCase() ||
                                t.status === statusObj.id
                            );



                            return (
                                <div key={statusObj.id} className="status-group-container">
                                    <DroppableStatusHeader
                                        status={statusObj.name}
                                        color={statusObj.color}
                                        count={statusTasks.length}
                                        isCollapsed={collapsedGroups.has(statusObj.name)}
                                        onToggle={() => toggleGroup(statusObj.name)}
                                    />
                                    {!collapsedGroups.has(statusObj.name) && (
                                        <SortableContext
                                            items={statusTasks.map(t => t.id)}
                                            strategy={verticalListSortingStrategy}
                                        >
                                            <div className="task-list">
                                                {statusTasks.map(task => (
                                                    <SortableRow
                                                        key={task.id}
                                                        task={task}
                                                        columns={activeColumns}
                                                        onTaskClick={onTaskClick}
                                                        getPriorityColor={getPriorityColor}
                                                        getDateStatus={getDateStatus}
                                                        tags={tags}
                                                        onOpenMenu={(id, trigger) => {
                                                            setOpenMenuTaskId(id);
                                                            setMenuTrigger(trigger);
                                                        }}
                                                        isMenuOpen={openMenuTaskId === task.id}
                                                        onCloseMenu={() => {
                                                            setOpenMenuTaskId(null);
                                                            setMenuTrigger(null);
                                                        }}
                                                        onDuplicate={duplicateTask}
                                                        onArchive={archiveTask}
                                                        onDelete={deleteTask}
                                                        onConvertToDoc={handleConvertToDoc}
                                                        onUpdateTask={updateTask}
                                                        activePopover={activePopover}
                                                        setActivePopover={setActivePopover}
                                                        onAddTag={addTag}
                                                        onUpdateTag={updateTag}
                                                        onDeleteTag={deleteTag}
                                                        onStartTimer={() => {
                                                            startTimer(task.id);
                                                            setOpenMenuTaskId(null);
                                                            setMenuTrigger(null);
                                                        }}
                                                        onUpdateSubtask={updateSubtask}
                                                        onAddSubtask={(taskId, name) => addSubtask(taskId, { name, status: 'TO DO' })}
                                                        onDeleteSubtask={deleteSubtask}
                                                        openMenuTaskId={openMenuTaskId}
                                                        menuTrigger={menuTrigger}
                                                    />
                                                ))}
                                                <button className="btn-inline-add" onClick={onAddTask}>
                                                    <Plus size={14} /> New Task
                                                </button>
                                            </div>
                                        </SortableContext>
                                    )}
                                </div>
                            );
                        })}

                        {/* Uncategorized Tasks */}
                        {(() => {
                            const uncategorizedTasks = filteredTasks.filter(t =>
                                !activeStatuses.some(s =>
                                    t.status.toLowerCase() === s.name.toLowerCase() ||
                                    t.status === s.id
                                )
                            );

                            if (uncategorizedTasks.length === 0) return null;

                            return (
                                <div className="status-group-container">
                                    <DroppableStatusHeader
                                        status="UNCATEGORIZED"
                                        color="#94a3b8"
                                        count={uncategorizedTasks.length}
                                        isCollapsed={collapsedGroups.has('UNCATEGORIZED')}
                                        onToggle={() => toggleGroup('UNCATEGORIZED')}
                                    />
                                    {!collapsedGroups.has('UNCATEGORIZED') && (
                                        <div className="task-list">
                                            {uncategorizedTasks.map(task => (
                                                <SortableRow
                                                    key={task.id}
                                                    task={task}
                                                    columns={activeColumns}
                                                    onTaskClick={onTaskClick}
                                                    getPriorityColor={getPriorityColor}
                                                    getDateStatus={getDateStatus}
                                                    tags={tags}
                                                    onOpenMenu={(id, trigger) => {
                                                        setOpenMenuTaskId(id);
                                                        setMenuTrigger(trigger);
                                                    }}
                                                    isMenuOpen={openMenuTaskId === task.id}
                                                    onCloseMenu={() => {
                                                        setOpenMenuTaskId(null);
                                                        setMenuTrigger(null);
                                                    }}
                                                    onDuplicate={duplicateTask}
                                                    onArchive={archiveTask}
                                                    onDelete={deleteTask}
                                                    onConvertToDoc={handleConvertToDoc}
                                                    onUpdateTask={updateTask}
                                                    activePopover={activePopover}
                                                    setActivePopover={setActivePopover}
                                                    onAddTag={addTag}
                                                    onUpdateTag={updateTag}
                                                    onDeleteTag={deleteTag}
                                                    onStartTimer={() => {
                                                        startTimer(task.id);
                                                        setOpenMenuTaskId(null);
                                                        setMenuTrigger(null);
                                                    }}
                                                    onUpdateSubtask={updateSubtask}
                                                    onAddSubtask={(taskId, name) => addSubtask(taskId, { name, status: 'TO DO' })}
                                                    onDeleteSubtask={deleteSubtask}
                                                    openMenuTaskId={openMenuTaskId}
                                                    menuTrigger={menuTrigger}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })()}

                        <div className="add-group-container">
                            {isAddingGroup ? (
                                <div className="add-group-input-wrapper" style={{ display: 'flex', gap: '8px' }}>
                                    <input
                                        autoFocus
                                        type="text"
                                        className="form-input"
                                        style={{ height: '36px', fontSize: '13px' }}
                                        placeholder="Group name..."
                                        value={newGroupName}
                                        onChange={(e) => setNewGroupName(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleConfirmAddGroup();
                                            if (e.key === 'Escape') setIsAddingGroup(false);
                                        }}
                                        onBlur={() => {
                                            // Delay slightly to allow click on confirm button
                                            setTimeout(() => {
                                                // Optional: auto-save on blur or cancel
                                                // setIsAddingGroup(false);
                                            }, 200);
                                        }}
                                    />
                                    <button className="btn-primary" onClick={handleConfirmAddGroup}>Add</button>
                                    <button className="icon-btn-ghost" onClick={() => setIsAddingGroup(false)}><Plus size={16} style={{ transform: 'rotate(45deg)' }} /></button>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', gap: 8, width: '100%' }}>
                                    <button
                                        className="btn-add-group"
                                        onClick={() => setIsAddingGroup(true)}
                                    >
                                        <Plus size={14} /> Add Group
                                    </button>
                                    <button
                                        className="btn-add-group"
                                        style={{ width: 'auto', padding: '10px' }}
                                        onClick={() => setIsStatusEditorOpen(true)}
                                        title="Manage Statuses"
                                    >
                                        <Settings2 size={16} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </DndContext>
            </div>

            {isStatusEditorOpen && (
                <StatusEditorModal
                    isOpen={isStatusEditorOpen}
                    onClose={() => setIsStatusEditorOpen(false)}
                    currentStatuses={activeStatuses}
                    onSave={handleSaveStatuses}
                />
            )}
        </div>
    );
};

const DroppableStatusHeader: React.FC<{
    status: string,
    color: string,
    count: number,
    isCollapsed: boolean,
    onToggle: () => void
}> = ({ status, color, count, isCollapsed, onToggle }) => {
    const { setNodeRef, isOver } = useDroppable({
        id: status,
    });

    return (
        <div
            ref={setNodeRef}
            className={`status-header ${isOver ? 'drag-over' : ''} ${isCollapsed ? 'collapsed' : ''}`}
            onClick={onToggle}
        >
            <ChevronRight size={16} className={`expand-icon ${!isCollapsed ? 'expanded' : ''}`} />
            <span className="status-dot" style={{ backgroundColor: color }}></span>
            <span className="status-name">{status}</span>
            <span className="status-count">{count}</span>
        </div>
    );
};

export default ListView;
