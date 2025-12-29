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
    CheckSquare,
    Calendar,
    Hash
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
import '../styles/ListView.css';
import '../styles/TaskOptionsMenu.css';

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
    'calendar': Calendar,
    'hash': Hash
};

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
}

interface SortableRowProps {
    task: Task;
    columns: ColumnSetting[];
    onTaskClick: (taskId: string) => void;
    getPriorityColor: (priority: Task['priority']) => string;
    getDateStatus: (dateStr?: string) => string | null;
    tags: Tag[];
    onOpenMenu: (taskId: string) => void;
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
    onStartTimer: () => void;
}

const SortableRow: React.FC<SortableRowProps> = ({
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
    onStartTimer
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: task.id });

    const [newTagName, setNewTagName] = React.useState('');
    const [newTagColor, setNewTagColor] = React.useState('#3b82f6');

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
        zIndex: isDragging ? 1 : (activePopover?.taskId === task.id ? 50 : 0),
    };

    const priorities: Task['priority'][] = ['urgent', 'high', 'medium', 'low'];
    const tagColors = ['#ef4444', '#f97316', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#64748b'];

    const handleAddTag = () => {
        if (!newTagName.trim()) return;
        onAddTag({ name: newTagName, color: newTagColor });
        setNewTagName('');
    };

    const renderCell = (col: ColumnSetting) => {
        switch (col.id) {
            case 'name':
                return (
                    <div className="task-cell name-cell" style={{ width: col.width || 300, overflow: 'visible' }}>
                        <div className="task-cell-inner" style={{ overflow: 'visible' }}>
                            <input type="checkbox" readOnly checked={task.status === 'COMPLETED'} />
                            <span className="task-name">{task.name}</span>
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
                                <button
                                    className="add-tag-btn-inline"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setActivePopover({ taskId: task.id, field: 'tags' });
                                    }}
                                >
                                    <Plus size={10} />
                                </button>
                                {activePopover?.taskId === task.id && activePopover?.field === 'tags' && (
                                    <div className="inline-popover tags-popover" onClick={e => e.stopPropagation()}>
                                        <div className="popover-header">Select Tags</div>
                                        <div className="popover-content">
                                            {tags.map(tag => {
                                                const isActive = task.tags?.includes(tag.id);
                                                return (
                                                    <div
                                                        key={tag.id}
                                                        className={`popover-item ${isActive ? 'active' : ''}`}
                                                        onClick={() => {
                                                            const newTags = isActive
                                                                ? task.tags?.filter(t => t !== tag.id)
                                                                : [...(task.tags || []), tag.id];
                                                            onUpdateTask(task.id, { tags: newTags });
                                                        }}
                                                    >
                                                        <span className="tag-dot" style={{ background: tag.color }}></span>
                                                        {tag.name}
                                                        {isActive && <CheckSquare size={12} className="check-icon" />}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <div className="popover-footer-create">
                                            <div className="create-tag-input-row">
                                                <input
                                                    type="text"
                                                    placeholder="New tag..."
                                                    value={newTagName}
                                                    onChange={e => setNewTagName(e.target.value)}
                                                    onClick={e => e.stopPropagation()}
                                                    onKeyDown={e => {
                                                        if (e.key === 'Enter') handleAddTag();
                                                    }}
                                                />
                                                <button onClick={(e) => { e.stopPropagation(); handleAddTag(); }}>Add</button>
                                            </div>
                                            <div className="create-tag-colors">
                                                {tagColors.map(color => (
                                                    <div
                                                        key={color}
                                                        className={`color-swatch ${newTagColor === color ? 'selected' : ''}`}
                                                        style={{ background: color }}
                                                        onClick={(e) => { e.stopPropagation(); setNewTagColor(color); }}
                                                    />
                                                ))}
                                            </div>
                                        </div>
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
                    <div className="task-cell date-cell" style={{ width: col.width || 150, position: 'relative', overflow: 'visible' }}>
                        <div
                            className={`date-badge-interactive ${task.dueDate ? getDateStatus(task.dueDate) : 'empty'}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                setActivePopover({ taskId: task.id, field: 'date' });
                            }}
                        >
                            <CalendarIcon size={12} />
                            {task.dueDate ? format(new Date(task.dueDate), 'MMM d') : 'Set Date'}
                        </div>
                        {activePopover?.taskId === task.id && activePopover?.field === 'date' && (
                            <div className="inline-popover date-popover" onClick={e => e.stopPropagation()}>
                                <div className="popover-item" onClick={() => {
                                    onUpdateTask(task.id, { dueDate: new Date().toISOString() });
                                    setActivePopover(null);
                                }}>Today</div>
                                <div className="popover-item" onClick={() => {
                                    const d = new Date();
                                    d.setDate(d.getDate() + 1);
                                    onUpdateTask(task.id, { dueDate: d.toISOString() });
                                    setActivePopover(null);
                                }}>Tomorrow</div>
                                <div className="popover-item" onClick={() => {
                                    const d = new Date();
                                    d.setDate(d.getDate() + 7);
                                    onUpdateTask(task.id, { dueDate: d.toISOString() });
                                    setActivePopover(null);
                                }}>Next Week</div>
                                <div className="popover-divider"></div>
                                <div className="popover-item danger" onClick={() => {
                                    onUpdateTask(task.id, { dueDate: undefined });
                                    setActivePopover(null);
                                }}>Clear Date</div>
                            </div>
                        )}
                    </div>
                );
            case 'priority':
                return (
                    <div className="task-cell priority-cell" style={{ width: col.width || 120, position: 'relative', overflow: 'visible' }}>
                        <div
                            className="priority-badge-interactive"
                            style={{ color: getPriorityColor(task.priority) }}
                            onClick={(e) => {
                                e.stopPropagation();
                                setActivePopover({ taskId: task.id, field: 'priority' });
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
                    <div className="task-cell status-cell" style={{ width: col.width || 120 }}>
                        <span className="status-pill">{task.status}</span>
                    </div>
                );
            default:
                return <div className="task-cell" style={{ width: col.width || 100 }}>-</div>;
        }
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="task-item-row"
            onClick={() => onTaskClick(task.id)}
        >
            <div className="drag-handle" {...attributes} {...listeners}>
                <GripVertical size={14} />
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
                            onOpenMenu(task.id);
                        }
                    }}
                >
                    <MoreHorizontal size={18} />
                </button>
                {isMenuOpen && (
                    <div style={{ position: 'absolute', right: 0, top: '100%', zIndex: 5001 }}>
                        <TaskOptionsMenu
                            taskId={task.id}
                            onClose={onCloseMenu}
                            onRename={() => { onTaskClick(task.id); onCloseMenu(); }}
                            onDuplicate={() => onDuplicate(task.id)}
                            onArchive={() => onArchive(task.id)}
                            onDelete={() => onDelete(task.id)}
                            onConvertToDoc={() => onConvertToDoc(task)}
                            onStartTimer={onStartTimer}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

const ListView: React.FC<ListViewProps> = ({ onAddTask, onTaskClick }) => {
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
        columnSettings,
        setColumnSettings,
        tags,
        spaces,
        lists,
        addTag,
        startTimer,
        addStatus
    } = useAppStore();
    const [collapsedGroups, setCollapsedGroups] = React.useState<Set<string>>(new Set());
    const [openMenuTaskId, setOpenMenuTaskId] = React.useState<string | null>(null);
    const [activePopover, setActivePopover] = React.useState<ActivePopover | null>(null);

    React.useEffect(() => {
        const handleClickOutside = () => {
            setOpenMenuTaskId(null);
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

    const handleAddGroup = () => {
        const name = prompt('Enter group name:');
        if (!name) return;

        const targetId = (currentListId || currentSpaceId);
        const isSpace = !currentListId;

        addStatus(targetId, isSpace, {
            name: name.toUpperCase(),
            color: '#64748b',
            type: 'inprogress'
        });
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

    const renderIcon = (iconName: string, size = 16, color?: string) => {
        const IconComponent = IconMap[iconName] || StarIcon;
        return <IconComponent size={size} color={color} />;
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



    return (
        <div className="view-container list-view">
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
                    <button className={`view-mode-btn ${currentView === 'list' ? 'active' : ''}`} onClick={() => setCurrentView('list')}>List</button>
                    <button className={`view-mode-btn ${currentView === 'kanban' ? 'active' : ''}`} onClick={() => setCurrentView('kanban')}>Board</button>
                    <button className={`view-mode-btn ${currentView === 'calendar' ? 'active' : ''}`} onClick={() => setCurrentView('calendar')}>Calendar</button>
                    <button className={`view-mode-btn ${currentView === 'gantt' ? 'active' : ''}`} onClick={() => setCurrentView('gantt')}>Gantt</button>
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
                            const statusTasks = filteredTasks.filter(t => t.status === statusObj.name);
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
                                                        onOpenMenu={(id) => setOpenMenuTaskId(id)}
                                                        isMenuOpen={openMenuTaskId === task.id}
                                                        onCloseMenu={() => setOpenMenuTaskId(null)}
                                                        onDuplicate={duplicateTask}
                                                        onArchive={archiveTask}
                                                        onDelete={deleteTask}
                                                        onConvertToDoc={handleConvertToDoc}
                                                        onUpdateTask={updateTask}
                                                        activePopover={activePopover}
                                                        setActivePopover={setActivePopover}
                                                        onAddTag={addTag}
                                                        onStartTimer={() => {
                                                            startTimer(task.id);
                                                            setOpenMenuTaskId(null);
                                                        }}
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
                        <div className="add-group-container">
                            <button
                                className="btn-add-group"
                                onClick={handleAddGroup}
                            >
                                <Plus size={14} /> Add Group
                            </button>
                        </div>
                    </div>
                </DndContext>
            </div>
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
