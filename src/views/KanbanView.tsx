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
    Calendar as CalendarIcon
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
import '../styles/KanbanView.css';
import '../styles/TaskOptionsMenu.css';

interface KanbanViewProps {
    onAddTask: () => void;
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
    onConvertToDoc
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: task.id });

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
                        onClick={(e) => { e.stopPropagation(); onTaskClick(task.id); }}
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
            </div>
        </div>
    );
};

interface KanbanColumnProps {
    status: Task['status'];
    color: string;
    tasks: Task[];
    onAddTask: () => void;
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
    onConvertToDoc
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
                    <button className="icon-btn-ghost" onClick={onAddTask}><Plus size={16} /></button>
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
                        />
                    ))}
                    <button className="btn-add-card" onClick={onAddTask}>
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
        tags,
        spaces,
        lists
    } = useAppStore();
    const [activeId, setActiveId] = React.useState<string | null>(null);
    const [openMenuTaskId, setOpenMenuTaskId] = React.useState<string | null>(null);
    const [menuOpenUp, setMenuOpenUp] = React.useState(false);

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
        const name = prompt('Enter column name:');
        if (!name) return;

        const targetId = (currentListId || currentSpaceId);
        const isSpace = !currentListId;

        addStatus(targetId, isSpace, {
            name: name.toUpperCase(),
            color: '#64748b',
            type: 'inprogress'
        });
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
                            tasks={filteredTasks.filter(t => t.status === col.name)}
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
                        />
                    ))}
                    <div className="add-column-container" onClick={handleAddColumn}>
                        <div className="add-column-btn">
                            <Plus size={18} />
                            <span>Add Column</span>
                        </div>
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
        </div>
    );
};

export default KanbanView;
