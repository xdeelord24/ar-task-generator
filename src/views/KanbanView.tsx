import React from 'react';
import { type Status } from '../types';
import {
    Plus,
    PlusCircle,
    Pencil,
    MoreHorizontal,
    MessageSquare,
    CheckSquare,
    Search,
    Filter,
    ArrowUpDown,
    Layout,
    Users,
    Lock,
    Star as StarIcon,
    Briefcase,
    Code,
    GraduationCap,
    Music,
    Heart,
    Camera,
    Globe,
    Zap,
    Cloud,
    Moon,
    Book,
    Flag,
    Target,
    Coffee,
    List as ListIcon,
    Hash,
    ChevronRight,
    Calendar as CalendarIcon,
    X,
    Check,
    ChevronDown,
    User,
    CircleDashed
} from 'lucide-react';

const IconMap: Record<string, any> = {
    'users': Users,
    'layout': Layout,
    'lock': Lock,
    'star': StarIcon,
    'briefcase': Briefcase,
    'code': Code,
    'graduation': GraduationCap,
    'book': Book,
    'globe': Globe,
    'zap': Zap,
    'cloud': Cloud,
    'moon': Moon,
    'flag': Flag,
    'target': Target,
    'coffee': Coffee,
    'heart': Heart,
    'music': Music,
    'camera': Camera,
    'list': ListIcon,
    'check-square': CheckSquare,
    'calendar': CalendarIcon,
    'hash': Hash
};
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragStartEvent,
    type DragEndEvent,
    useDroppable,
} from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useAppStore } from '../store/useAppStore';
import type { Task, Tag } from '../types';
import TaskOptionsMenu from '../components/TaskOptionsMenu';
import ViewSelectorModal from '../components/ViewSelectorModal';
import ViewContextMenu from '../components/ViewContextMenu';
import '../styles/KanbanView.css';
import '../styles/TaskOptionsMenu.css';
import QuickAddSubtask from '../components/QuickAddSubtask';
import type { Subtask } from '../types';

interface KanbanViewProps {
    onAddTask: (status?: string) => void;
    onTaskClick: (taskId: string) => void;
}

interface SortableCardProps {
    task: Task;
    onTaskClick: (taskId: string) => void;
    tags: Tag[];
    onOpenMenu: (taskId: string, openUp: boolean) => void;
    isMenuOpen: boolean;
    menuOpenUp?: boolean;
    onCloseMenu: () => void;
    onDuplicate: (taskId: string) => void;
    onArchive: (taskId: string) => void;
    onDelete: (taskId: string) => void;
    onConvertToDoc: (task: Task) => void;
    isAddingSubtask: boolean;
    onStartAddSubtask: (taskId: string) => void;
    onCancelAddSubtask: () => void;
    onAddSubtask: (subtask: Omit<Subtask, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

const SortableCard: React.FC<SortableCardProps> = ({
    task,
    onTaskClick,
    tags,
    onOpenMenu,
    isMenuOpen,
    menuOpenUp,
    onCloseMenu,
    onDuplicate,
    onArchive,
    onDelete,
    onConvertToDoc,
    isAddingSubtask,
    onStartAddSubtask,
    onCancelAddSubtask,
    onAddSubtask
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

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="kanban-card"
            onClick={() => onTaskClick(task.id)}
        >
            <div className="card-tags">
                {task.tags?.map(tagId => {
                    const tag = tags.find(t => t.id === tagId);
                    if (!tag) return null;
                    return (
                        <span
                            key={tagId}
                            className="tag-pill-small"
                            style={{ backgroundColor: tag.color }}
                            title={tag.name}
                        ></span>
                    );
                })}
            </div>
            <div className="card-header">
                <h4 className="card-title">{task.name}</h4>
                <div className="card-hover-actions">
                    <button
                        className="hover-action-item"
                        onClick={(e) => { e.stopPropagation(); onStartAddSubtask(task.id); }}
                        title="Add subtask"
                    >
                        <PlusCircle size={20} />
                    </button>
                    <button
                        className="hover-action-item"
                        onClick={(e) => { e.stopPropagation(); onTaskClick(task.id); }}
                        title="Rename"
                    >
                        <Pencil size={20} />
                    </button>
                    <div style={{ position: 'relative', overflow: 'visible' }}>
                        <button
                            className="hover-action-item"
                            onClick={(e) => {
                                e.stopPropagation();
                                if (isMenuOpen) {
                                    onCloseMenu();
                                } else {
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    const openUp = rect.top > window.innerHeight / 2;
                                    onOpenMenu(task.id, openUp);
                                }
                            }}
                            title="More actions"
                        >
                            <MoreHorizontal size={20} />
                        </button>
                        {isMenuOpen && (
                            <div style={{
                                position: 'absolute',
                                right: 0,
                                [menuOpenUp ? 'bottom' : 'top']: '100%',
                                zIndex: 5001,
                                marginBottom: menuOpenUp ? '8px' : '0',
                                marginTop: menuOpenUp ? '0' : '8px'
                            }}>
                                <TaskOptionsMenu
                                    taskId={task.id}
                                    onClose={onCloseMenu}
                                    onRename={() => { onTaskClick(task.id); onCloseMenu(); }}
                                    onDuplicate={() => onDuplicate(task.id)}
                                    onArchive={() => onArchive(task.id)}
                                    onDelete={() => onDelete(task.id)}
                                    onConvertToDoc={() => onConvertToDoc(task)}
                                    onStartTimer={() => { alert('Timer started for task ' + task.id); onCloseMenu(); }}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div className="card-meta">
                {task.dueDate && (
                    <div className="card-date">
                        <CalendarIcon size={12} />
                        {task.dueDate}
                    </div>
                )}
                <div className="card-footer">
                    <div className="card-icons">
                        {task.subtasks && task.subtasks.length > 0 && (
                            <span><CheckSquare size={12} /> {task.subtasks.length}</span>
                        )}
                        <span><MessageSquare size={12} /> 2</span>
                    </div>
                    <div className="assignee-avatar-small">
                        {task.assignee?.[0] || '?'}
                    </div>
                </div>

                {task.subtasks && task.subtasks.length > 0 && (
                    <>
                        <div
                            className="subtask-toggle-bar"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsExpanded(!isExpanded);
                            }}
                        >
                            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            <span>{task.subtasks.length} subtask{task.subtasks.length > 1 ? 's' : ''}</span>
                        </div>

                        {isExpanded && (
                            <div className="subtasks-list">
                                {task.subtasks.map(subtask => (
                                    <div key={subtask.id} className="subtask-card" onClick={(e) => {
                                        e.stopPropagation();
                                        onTaskClick(subtask.id);
                                    }}>
                                        <div className="subtask-header">
                                            <span className="subtask-title">{subtask.name}</span>
                                        </div>
                                        <div className="subtask-footer">
                                            <div className="subtask-option-pill">
                                                <CircleDashed size={10} className="status-spinner-icon" />
                                                <span>{subtask.status || 'TO DO'}</span>
                                            </div>

                                            <div className="subtask-option-icon" title="Assignee">
                                                {subtask.assignee ? (
                                                    <div className="assignee-avatar-xs">{subtask.assignee[0]}</div>
                                                ) : (
                                                    <User size={12} />
                                                )}
                                            </div>

                                            <div className="subtask-option-icon" title="Due Date">
                                                <CalendarIcon size={12} />
                                                {subtask.dueDate && <span className="option-text-xs">{subtask.dueDate.substring(5, 10)}</span>}
                                            </div>

                                            <div className={`subtask-option-icon ${subtask.priority ? 'has-priority' : ''}`} title="Priority">
                                                <Flag size={12} className={subtask.priority ? `text-priority-${subtask.priority}` : ''} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
            {isAddingSubtask && (
                <div onClick={e => e.stopPropagation()} style={{ marginTop: '12px', cursor: 'default' }}>
                    <QuickAddSubtask
                        onAdd={(subtask) => onAddSubtask(subtask)}
                        onCancel={onCancelAddSubtask}
                    />
                </div>
            )}
        </div>
    );
};

interface KanbanColumnProps {
    status: Task['status'];
    color: string;
    tasks: Task[];
    onAddTask: (status?: string) => void;
    onTaskClick: (taskId: string) => void;
    tags: Tag[];
    openMenuTaskId: string | null;
    menuOpenUp: boolean;
    onOpenMenu: (taskId: string, openUp: boolean) => void;
    onCloseMenu: () => void;
    onDuplicate: (taskId: string) => void;
    onArchive: (taskId: string) => void;
    onDelete: (taskId: string) => void;
    onConvertToDoc: (task: Task) => void;
    addSubtaskTaskId: string | null;
    onStartAddSubtask: (taskId: string) => void;
    onCancelAddSubtask: () => void;
    onAddSubtask: (taskId: string, subtask: Omit<Subtask, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({
    status,
    color,
    tasks,
    onAddTask,
    onTaskClick,
    tags,
    openMenuTaskId,
    menuOpenUp,
    onOpenMenu,
    onCloseMenu,
    onDuplicate,
    onArchive,
    onDelete,
    onConvertToDoc,
    addSubtaskTaskId,
    onStartAddSubtask,
    onCancelAddSubtask,
    onAddSubtask
}) => {
    const { setNodeRef, isOver } = useDroppable({
        id: status,
    });

    return (
        <div ref={setNodeRef} className={`kanban-column ${isOver ? 'drag-over' : ''}`}>
            <div className="column-header">
                <div className="column-title">
                    <span className="column-dot" style={{ backgroundColor: color }}></span>
                    <h3>{status}</h3>
                    <span className="column-count">{tasks.length}</span>
                </div>
                <div className="column-actions">
                    <button className="icon-btn-ghost" onClick={() => onAddTask(status)}><Plus size={16} /></button>
                    <button className="icon-btn-ghost"><MoreHorizontal size={16} /></button>
                </div>
            </div>
            <SortableContext
                id={status}
                items={tasks.map(t => t.id)}
                strategy={verticalListSortingStrategy}
            >
                <div className="column-tasks">
                    {tasks.map(task => (
                        <SortableCard
                            key={task.id}
                            task={task}
                            onTaskClick={onTaskClick}
                            tags={tags}
                            onOpenMenu={onOpenMenu}
                            isMenuOpen={openMenuTaskId === task.id}
                            menuOpenUp={menuOpenUp}
                            onCloseMenu={onCloseMenu}
                            onDuplicate={onDuplicate}
                            onArchive={onArchive}
                            onDelete={onDelete}
                            onConvertToDoc={onConvertToDoc}
                            isAddingSubtask={addSubtaskTaskId === task.id}
                            onStartAddSubtask={onStartAddSubtask}
                            onCancelAddSubtask={onCancelAddSubtask}
                            onAddSubtask={(subtask) => onAddSubtask(task.id, subtask)}
                        />
                    ))}
                    <button className="btn-add-card" onClick={() => onAddTask(status)}>
                        <Plus size={14} /> Add Task
                    </button>
                </div>
            </SortableContext>
        </div>
    );
};

const KanbanView: React.FC<KanbanViewProps> = ({ onAddTask, onTaskClick }) => {
    const {
        tasks,
        currentSpaceId,
        currentListId,
        currentView,
        setCurrentView,
        updateTask,
        deleteTask,
        duplicateTask,
        archiveTask,
        addDoc,
        addStatus,
        addSubtask,
        tags,
        spaces,
        lists,
        savedViews
    } = useAppStore();
    const [activeId, setActiveId] = React.useState<string | null>(null);
    const [openMenuTaskId, setOpenMenuTaskId] = React.useState<string | null>(null);
    const [menuOpenUp, setMenuOpenUp] = React.useState(false);
    const [isAddingColumn, setIsAddingColumn] = React.useState(false);
    const [newColumnName, setNewColumnName] = React.useState('');
    const [showViewSelector, setShowViewSelector] = React.useState(false);
    const [addSubtaskTaskId, setAddSubtaskTaskId] = React.useState<string | null>(null);
    const [contextMenu, setContextMenu] = React.useState<{ view: any; position: { x: number; y: number } } | null>(null);

    const handleOpenMenu = (taskId: string, openUp: boolean) => {
        setOpenMenuTaskId(taskId);
        setMenuOpenUp(openUp);
    };

    React.useEffect(() => {
        const handleClickOutside = () => setOpenMenuTaskId(null);
        if (openMenuTaskId) {
            window.addEventListener('click', handleClickOutside);
            return () => window.removeEventListener('click', handleClickOutside);
        }
    }, [openMenuTaskId]);

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

    const activeList = lists.find(l => l.id === currentListId);
    const activeSpace = spaces.find(s => s.id === currentSpaceId);

    const renderIcon = (iconName: string, size = 16, color?: string) => {
        const IconComponent = IconMap[iconName] || StarIcon;
        return <IconComponent size={size} color={color} />;
    };

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


    const boardStatuses: Status[] = activeList?.statuses || activeSpace?.statuses || [
        { id: 'todo', name: 'TO DO', color: '#3b82f6', type: 'todo' },
        { id: 'inprogress', name: 'IN PROGRESS', color: '#f59e0b', type: 'inprogress' },
        { id: 'completed', name: 'COMPLETED', color: '#10b981', type: 'done' }
    ];

    const handleAddColumn = () => {
        if (!newColumnName.trim()) return;

        const targetId = (currentListId || currentSpaceId);
        const isSpace = !currentListId;

        addStatus(targetId, isSpace, {
            name: newColumnName.toUpperCase(),
            color: '#64748b',
            type: 'inprogress'
        });
        setNewColumnName('');
        setIsAddingColumn(false);
    };

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over) return;

        const activeTaskId = active.id as string;
        const overId = over.id as string;

        // If dropped over a column
        if (boardStatuses.some(col => col.name === overId)) {
            updateTask(activeTaskId, { status: overId });
            return;
        }

        // If dropped over another task
        const overTask = tasks.find(t => t.id === overId);
        const activeTaskObj = tasks.find(t => t.id === activeTaskId);
        if (overTask && activeTaskObj && overTask.status !== activeTaskObj.status) {
            updateTask(activeTaskId, { status: overTask.status });
        }
    };

    const activeTask = activeId ? tasks.find(t => t.id === activeId) : null;

    return (
        <div className="view-container kanban-view">
            <div className="view-header">
                <div className="breadcrumb">
                    <div className="breadcrumb-item">
                        {activeSpace && renderIcon(activeSpace.icon, 18, activeSpace.color || undefined)}
                        <span className="space-name">{activeSpace?.name || 'Space'}</span>
                    </div>
                    {currentListId && (
                        <>
                            <ChevronRight size={14} className="breadcrumb-separator" />
                            <div className="breadcrumb-item">
                                {lists.find(l => l.id === currentListId)?.icon && renderIcon(lists.find(l => l.id === currentListId)?.icon!, 18, lists.find(l => l.id === currentListId)?.color || activeSpace?.color || undefined)}
                                <span className="space-name">{lists.find(l => l.id === currentListId)?.name}</span>
                            </div>
                        </>
                    )}
                    <span className="task-count">{filteredTasks.length}</span>
                </div>
                <div className="view-controls">
                    {savedViews
                        .filter(v => !v.spaceId || v.spaceId === currentSpaceId)
                        .filter(v => !v.listId || v.listId === currentListId)
                        .sort((a, b) => {
                            if (a.isPinned && !b.isPinned) return -1;
                            if (!a.isPinned && b.isPinned) return 1;
                            return 0;
                        })
                        .map(savedView => (
                            <button
                                key={savedView.id}
                                className={`view-mode-btn ${currentView === savedView.viewType ? 'active' : ''}`}
                                onClick={() => setCurrentView(savedView.viewType)}
                                onContextMenu={(e) => {
                                    e.preventDefault();
                                    setContextMenu({
                                        view: savedView,
                                        position: { x: e.clientX, y: e.clientY }
                                    });
                                }}
                            >
                                {savedView.name}
                            </button>
                        ))
                    }
                    <button className="view-mode-btn add-view-btn" onClick={() => setShowViewSelector(true)}>
                        <Plus size={14} /> View
                    </button>
                </div>
            </div>

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
                    <button className="btn-primary" onClick={() => onAddTask()} style={{ padding: '8px 16px' }}>
                        <Plus size={16} /> Add Task
                    </button>
                </div>
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className="kanban-board">
                    {boardStatuses.map(col => (
                        <KanbanColumn
                            key={col.id}
                            status={col.name}
                            color={col.color}
                            tasks={filteredTasks.filter(t =>
                                t.status.toLowerCase() === col.name.toLowerCase() ||
                                t.status === col.id
                            )}
                            onAddTask={onAddTask}
                            onTaskClick={onTaskClick}
                            tags={tags}
                            openMenuTaskId={openMenuTaskId}
                            menuOpenUp={menuOpenUp}
                            onOpenMenu={handleOpenMenu}
                            onCloseMenu={() => setOpenMenuTaskId(null)}
                            onDuplicate={duplicateTask}
                            onArchive={archiveTask}
                            onDelete={deleteTask}
                            onConvertToDoc={handleConvertToDoc}
                            addSubtaskTaskId={addSubtaskTaskId}
                            onStartAddSubtask={setAddSubtaskTaskId}
                            onCancelAddSubtask={() => setAddSubtaskTaskId(null)}
                            onAddSubtask={(taskId, subtask) => {
                                addSubtask(taskId, subtask);
                                setAddSubtaskTaskId(null);
                            }}
                        />
                    ))}
                    <div className="add-column-container">
                        {!isAddingColumn ? (
                            <div className="add-column-btn" onClick={() => setIsAddingColumn(true)}>
                                <Plus size={18} />
                                <span>Add Column</span>
                            </div>
                        ) : (
                            <div className="add-column-form" style={{
                                padding: '16px',
                                backgroundColor: 'var(--bg-side)',
                                borderRadius: '12px',
                                border: '1px solid var(--border)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '12px',
                                minWidth: '320px'
                            }}>
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="Column Name"
                                    value={newColumnName}
                                    onChange={(e) => setNewColumnName(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleAddColumn();
                                        if (e.key === 'Escape') {
                                            setIsAddingColumn(false);
                                            setNewColumnName('');
                                        }
                                    }}
                                    style={{
                                        background: 'var(--bg-surface)',
                                        border: '1px solid var(--border)',
                                        color: 'var(--text-main)',
                                        padding: '10px',
                                        borderRadius: '8px',
                                        outline: 'none',
                                        fontSize: '14px',
                                        width: '100%'
                                    }}
                                />
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button
                                        onClick={handleAddColumn}
                                        style={{
                                            flex: 1,
                                            padding: '8px',
                                            borderRadius: '6px',
                                            background: 'var(--primary)',
                                            color: 'white',
                                            border: 'none',
                                            cursor: 'pointer',
                                            fontWeight: 500,
                                            fontSize: '13px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '6px'
                                        }}
                                    >
                                        <Check size={14} /> Add
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIsAddingColumn(false);
                                            setNewColumnName('');
                                        }}
                                        style={{
                                            padding: '8px',
                                            borderRadius: '6px',
                                            background: 'transparent',
                                            color: 'var(--text-secondary)',
                                            border: '1px solid var(--border)',
                                            cursor: 'pointer',
                                            fontWeight: 500,
                                            fontSize: '13px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <DragOverlay>
                    {activeTask ? (
                        <div className="kanban-card dragging">
                            <h4 className="card-title">{activeTask.name}</h4>
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>

            {showViewSelector && (
                <ViewSelectorModal
                    onClose={() => setShowViewSelector(false)}
                    onSelectView={(viewType) => {
                        setCurrentView(viewType);
                    }}
                />
            )}

            {contextMenu && (
                <ViewContextMenu
                    view={contextMenu.view}
                    position={contextMenu.position}
                    onClose={() => setContextMenu(null)}
                />
            )}
        </div>
    );
};

export default KanbanView;
