import React, { useState } from 'react';
import {
    ChevronLeft,
    ChevronRight,
    Search,
    Plus,
    ZoomIn,
    ZoomOut
} from 'lucide-react';
import {
    DndContext,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
    useDraggable,
} from '@dnd-kit/core';
import { useAppStore } from '../store/useAppStore';
import {
    format,
    startOfMonth,
    differenceInDays,
    addMonths,
    subMonths,
    eachDayOfInterval,
    endOfMonth,
    addDays,
    parseISO,
} from 'date-fns';
import type { Task } from '../types';
import ViewSelectorModal from '../components/ViewSelectorModal';
import ViewContextMenu from '../components/ViewContextMenu';
import '../styles/GanttView.css';
import '../styles/ListView.css';

interface GanttViewProps {
    onAddTask: () => void;
    onTaskClick: (taskId: string) => void;
}

interface DraggableGanttBarProps {
    task: Task;
    monthStart: Date;
    zoom: number;
    onTaskClick: (taskId: string) => void;
}

const DraggableGanttBar: React.FC<DraggableGanttBarProps> = ({ task, monthStart, zoom, onTaskClick }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: task.id,
    });

    const taskStart = task.startDate ? parseISO(task.startDate) : (task.dueDate ? parseISO(task.dueDate) : new Date());
    const taskEnd = task.dueDate ? parseISO(task.dueDate) : taskStart;

    const duration = Math.max(1, differenceInDays(taskEnd, taskStart) + 1);
    const dayIndex = differenceInDays(taskStart, monthStart);
    const dayWidth = 40 * zoom;

    const style = {
        left: `${dayIndex * dayWidth + (transform?.x || 0)}px`,
        width: `${duration * dayWidth}px`,
        top: transform ? `${transform.y}px` : undefined,
        zIndex: isDragging ? 100 : 1,
        opacity: isDragging ? 0.8 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className={`gantt-bar ${task.status.toLowerCase().replace(' ', '-')} ${isDragging ? 'dragging' : ''}`}
            onClick={() => onTaskClick(task.id)}
        >
            <span className="gantt-bar-label">{task.name}</span>
        </div>
    );
};

const GanttView: React.FC<GanttViewProps> = ({ onAddTask, onTaskClick }) => {
    const { tasks, currentSpaceId, setCurrentView, updateTask, savedViews } = useAppStore();
    const [viewDate, setViewDate] = useState(new Date());
    const [zoom, setZoom] = useState(1);
    const [showViewSelector, setShowViewSelector] = useState(false);
    const [contextMenu, setContextMenu] = useState<{ view: any; position: { x: number; y: number } } | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        })
    );

    const monthStart = startOfMonth(viewDate);
    const monthEnd = endOfMonth(monthStart);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    const filteredTasks = tasks.filter(task =>
        (currentSpaceId === 'everything' || task.spaceId === currentSpaceId) &&
        (task.dueDate || task.startDate)
    );

    const prevMonth = () => setViewDate(subMonths(viewDate, 1));
    const nextMonth = () => setViewDate(addMonths(viewDate, 1));

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, delta } = event;
        const taskId = active.id as string;
        const task = tasks.find(t => t.id === taskId);

        if (!task) return;

        const dayWidth = 40 * zoom;
        const daysMoved = Math.round(delta.x / dayWidth);

        if (daysMoved !== 0) {
            const currentStart = task.startDate ? parseISO(task.startDate) : (task.dueDate ? parseISO(task.dueDate) : new Date());
            const currentEnd = task.dueDate ? parseISO(task.dueDate) : currentStart;

            const newStart = addDays(currentStart, daysMoved);
            const newEnd = addDays(currentEnd, daysMoved);

            updateTask(taskId, {
                startDate: format(newStart, 'yyyy-MM-dd'),
                dueDate: format(newEnd, 'yyyy-MM-dd')
            });
        }
    };

    return (
        <div className="view-container gantt-view">
            <div className="view-header">
                <div className="breadcrumb">
                    <span className="space-name">Team Space</span>
                    <span className="task-count">{filteredTasks.length}</span>
                </div>
                <div className="view-controls">
                    {savedViews
                        .filter(v => !v.spaceId || v.spaceId === currentSpaceId)
                        .sort((a, b) => {
                            if (a.isPinned && !b.isPinned) return -1;
                            if (!a.isPinned && b.isPinned) return 1;
                            return 0;
                        })
                        .map(savedView => (
                            <button
                                key={savedView.id}
                                className={`view-mode-btn ${savedView.viewType === 'gantt' ? 'active' : ''}`}
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
                    <button className="icon-btn-ghost" onClick={prevMonth}><ChevronLeft size={16} /></button>
                    <h2 className="current-month">{format(viewDate, 'MMMM yyyy')}</h2>
                    <button className="icon-btn-ghost" onClick={nextMonth}><ChevronRight size={16} /></button>
                    <div className="toolbar-divider"></div>
                    <button className="icon-btn-ghost" onClick={() => setZoom(prev => Math.min(prev + 0.2, 2))}><ZoomIn size={16} /></button>
                    <button className="icon-btn-ghost" onClick={() => setZoom(prev => Math.max(prev - 0.2, 0.5))}><ZoomOut size={16} /></button>
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

            <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                <div className="gantt-container">
                    <div className="gantt-sidebar">
                        <div className="gantt-sidebar-header">Task Name</div>
                        <div className="gantt-sidebar-content">
                            {filteredTasks.map(task => (
                                <div key={task.id} className="gantt-row-label" onClick={() => onTaskClick(task.id)}>
                                    <span className={`priority-indicator ${task.priority}`}></span>
                                    {task.name}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="gantt-main">
                        <div className="gantt-timeline-header">
                            {days.map(day => (
                                <div key={day.toISOString()} className="gantt-day-header" style={{ width: `${40 * zoom}px` }}>
                                    <div className="day-name">{format(day, 'EEEEE')}</div>
                                    <div className="day-num">{format(day, 'd')}</div>
                                </div>
                            ))}
                        </div>

                        <div className="gantt-grid">
                            {filteredTasks.map(task => (
                                <div key={task.id} className="gantt-row">
                                    {days.map(day => (
                                        <div key={day.toISOString()} className="gantt-cell" style={{ width: `${40 * zoom}px` }}></div>
                                    ))}
                                    <DraggableGanttBar
                                        task={task}
                                        monthStart={monthStart}
                                        zoom={zoom}
                                        onTaskClick={onTaskClick}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
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

export default GanttView;
