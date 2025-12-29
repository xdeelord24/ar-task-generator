import React, { useState } from 'react';
import {
    ChevronLeft,
    ChevronRight,
    Plus,
    Search,
    Filter,
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
    Hash,
    ChevronRight as ChevronRightIcon
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
    'calendar': ChevronLeft, // fallback for calendar related icons
    'hash': Hash
};
import {
    DndContext,
    closestCorners,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
    useDraggable,
    useDroppable,
} from '@dnd-kit/core';
import { useAppStore } from '../store/useAppStore';
import {
    format,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isSameMonth,
    addMonths,
    subMonths,
    startOfWeek,
    endOfWeek,
    addDays,
    addWeeks,
    addHours,
    setHours,
    isToday,
    differenceInMinutes
} from 'date-fns';
import type { Task } from '../types';
import '../styles/CalendarView.css';
import '../styles/ListView.css';

interface CalendarViewProps {
    onAddTask: () => void;
    onTaskClick: (taskId: string) => void;
}

interface DraggableTaskProps {
    task: Task;
    onTaskClick: (taskId: string) => void;
}

const DraggableCalendarTask: React.FC<DraggableTaskProps> = ({ task, onTaskClick }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: task.id,
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 100,
    } : undefined;

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className={`calendar-task-tag ${task.status.toLowerCase().replace(' ', '-')} ${isDragging ? 'dragging' : ''}`}
            onClick={() => onTaskClick(task.id)}
        >
            {task.name}
        </div>
    );
};

interface DroppableDayProps {
    day: Date;
    monthStart: Date;
    children: React.ReactNode;
}

const DroppableCalendarDay: React.FC<DroppableDayProps> = ({ day, monthStart, children }) => {
    const { setNodeRef, isOver } = useDroppable({
        id: day.toISOString(),
    });

    const className = `calendar-day ${!isSameMonth(day, monthStart) ? 'other-month' : ''} ${isToday(day) ? 'today' : ''} ${isOver ? 'drag-over' : ''}`;

    return (
        <div ref={setNodeRef} className={className}>
            <span className="day-number">{format(day, 'd')}</span>
            <div className="day-tasks">
                {children}
            </div>
        </div>
    );
};

type CalendarMode = 'day' | '4day' | 'week' | 'month';

const TimeGrid: React.FC<{
    days: Date[],
    tasks: Task[],
    onTaskClick: (taskId: string) => void
}> = ({ days, tasks, onTaskClick }) => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const [currentTime, setCurrentTime] = useState(new Date());

    React.useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="time-grid-container">
            <div className="time-grid-header">
                <div className="time-gutter"></div>
                {days.map(day => (
                    <div key={day.toISOString()} className={`time-column-header ${isToday(day) ? 'today' : ''}`}>
                        <span className="day-name">{format(day, 'EEE')}</span>
                        <span className="day-number">{format(day, 'd')}</span>
                    </div>
                ))}
            </div>

            <div className="all-day-row">
                <div className="time-gutter">
                    <span className="all-day-label">all-day</span>
                </div>
                {days.map(day => (
                    <div key={day.toISOString()} className="all-day-column">
                        {tasks.filter(t => {
                            if (!t.dueDate) return false;
                            // All day if NO 'T' in dueDate AND NO 'T' in startDate
                            const isAllDay = !t.dueDate.includes('T') && (!t.startDate || !t.startDate.includes('T'));
                            return isAllDay && format(new Date(t.dueDate), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd');
                        }).map(task => (
                            <DraggableCalendarTask key={task.id} task={task} onTaskClick={onTaskClick} />
                        ))}
                    </div>
                ))}
            </div>

            <div className="time-grid-body">
                <div className="time-gutter">
                    {hours.map(hour => (
                        <div key={hour} className="time-label">
                            {format(setHours(new Date(), hour), 'ha')}
                        </div>
                    ))}
                </div>
                <div className="time-columns">
                    {hours.map(hour => (
                        <div key={hour} className="time-slot-row"></div>
                    ))}
                    {days.map(day => (
                        <DroppableTimeColumn
                            key={day.toISOString()}
                            day={day}
                            currentTime={currentTime}
                            tasks={tasks}
                            onTaskClick={onTaskClick}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

const DroppableTimeSlot: React.FC<{
    day: Date;
    hour: number;
    children?: React.ReactNode;
}> = ({ day, hour, children }) => {
    const { setNodeRef, isOver } = useDroppable({
        id: `time-slot|${day.toISOString()}|${hour}`,
    });

    return (
        <div ref={setNodeRef} className={`time-slot ${isOver ? 'drag-over' : ''}`}>
            {children}
        </div>
    );
};

const DroppableTimeColumn: React.FC<{
    day: Date;
    currentTime: Date;
    tasks: Task[];
    onTaskClick: (taskId: string) => void;
}> = ({ day, currentTime, tasks, onTaskClick }) => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const { updateTask } = useAppStore();
    const { setNodeRef } = useDroppable({
        id: day.toISOString(),
    });

    // Local state to track resizing height temporarily for smooth UX
    const [resizingTask, setResizingTask] = useState<{ id: string, height: number } | null>(null);

    const getTimePosition = (date: Date) => {
        const mins = date.getHours() * 60 + date.getMinutes();
        return (mins / (24 * 60)) * 100;
    };

    const handleResizeStart = (e: React.MouseEvent, taskId: string, initialHeight: number) => {
        e.preventDefault();
        e.stopPropagation();

        const startY = e.pageY;

        const onMouseMove = (moveEvent: MouseEvent) => {
            const deltaY = moveEvent.pageY - startY;
            // 1px = 1 minute. 1440px = 100%
            const deltaPercent = (deltaY / 1440) * 100;
            const newHeight = Math.max(initialHeight + deltaPercent, (15 / 1440) * 100); // Min 15 mins
            setResizingTask({ id: taskId, height: newHeight });
        };

        const onMouseUp = (upEvent: MouseEvent) => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);

            const deltaY = upEvent.pageY - startY;
            const deltaMins = Math.round(deltaY);

            const task = tasks.find(t => t.id === taskId);
            if (task) {
                const start = task.startDate ? new Date(task.startDate) : new Date(task.dueDate || '');
                const currentDuration = task.startDate && task.dueDate
                    ? differenceInMinutes(new Date(task.dueDate), new Date(task.startDate))
                    : 60;

                const newDuration = Math.max(currentDuration + deltaMins, 15);
                const newDueDate = new Date(start.getTime() + newDuration * 60000);

                updateTask(taskId, { dueDate: newDueDate.toISOString() });
            }

            setResizingTask(null);
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
    };

    return (
        <div ref={setNodeRef} className="time-column">
            {hours.map(hour => (
                <DroppableTimeSlot key={hour} day={day} hour={hour} />
            ))}

            {isToday(day) && (
                <div
                    className="current-time-line"
                    style={{ top: `${getTimePosition(currentTime)}%` }}
                >
                    <div className="current-time-dot"></div>
                </div>
            )}

            <div className="day-tasks-absolute">
                {tasks
                    .filter(t => {
                        if (!t.dueDate) return false;
                        const taskDate = new Date(t.dueDate);
                        // ONLY timed tasks here
                        const isTimed = t.dueDate.includes('T') || (t.startDate && t.startDate.includes('T'));
                        if (!isTimed) return false;

                        // Compare yyyy-MM-dd to be timezone-safe for daily columns
                        return format(taskDate, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd');
                    })
                    .map(task => {
                        const start = task.startDate ? new Date(task.startDate) : new Date(task.dueDate || '');
                        const end = task.dueDate ? new Date(task.dueDate) : addHours(start, 1);

                        const top = getTimePosition(start);
                        let height = (differenceInMinutes(end, start) / (24 * 60)) * 100;

                        if (resizingTask && resizingTask.id === task.id) {
                            height = resizingTask.height;
                        }

                        return (
                            <div
                                key={task.id}
                                className="draggable-task-wrapper"
                                style={{
                                    position: 'absolute',
                                    top: `${top}%`,
                                    height: `${height}%`,
                                    width: '100%',
                                    zIndex: 5
                                }}
                            >
                                <DraggableCalendarTask task={task} onTaskClick={onTaskClick} />
                                <div
                                    className="resize-handle-bottom"
                                    onMouseDown={(e) => handleResizeStart(e, task.id, height)}
                                />
                            </div>
                        );
                    })}
            </div>
        </div>
    );
};

const CalendarView: React.FC<CalendarViewProps> = ({ onAddTask, onTaskClick }) => {
    const {
        tasks,
        currentSpaceId,
        currentListId,
        setCurrentView,
        updateTask,
        spaces,
        lists
    } = useAppStore();
    const [viewDate, setViewDate] = useState(new Date());
    const [calendarMode, setCalendarMode] = useState<CalendarMode>('month');

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        })
    );

    const activeSpace = spaces.find(s => s.id === currentSpaceId);

    const filteredTasks = tasks.filter(task =>
        currentSpaceId === 'everything' || task.spaceId === currentSpaceId
    );

    const renderIcon = (iconName: string, size = 16, color?: string) => {
        const IconComponent = IconMap[iconName] || StarIcon;
        return <IconComponent size={size} color={color} />;
    };

    const getDays = () => {
        switch (calendarMode) {
            case 'day':
                return [viewDate];
            case '4day':
                return Array.from({ length: 4 }, (_, i) => addDays(viewDate, i));
            case 'week': {
                const start = startOfWeek(viewDate);
                return Array.from({ length: 7 }, (_, i) => addDays(start, i));
            }
            case 'month': {
                const monthStart = startOfMonth(viewDate);
                const monthEnd = endOfMonth(monthStart);
                const calendarStart = startOfWeek(monthStart);
                const calendarEnd = endOfWeek(monthEnd);
                return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
            }
        }
    };

    const days = getDays();
    const monthStart = startOfMonth(viewDate);

    const navigate = (direction: 'next' | 'prev') => {
        const factor = direction === 'next' ? 1 : -1;
        switch (calendarMode) {
            case 'day':
                setViewDate(addDays(viewDate, factor));
                break;
            case '4day':
                setViewDate(addDays(viewDate, factor * 4));
                break;
            case 'week':
                setViewDate(addWeeks(viewDate, factor));
                break;
            case 'month':
                setViewDate(direction === 'next' ? addMonths(viewDate, 1) : subMonths(viewDate, 1));
                break;
        }
    };

    const goToToday = () => setViewDate(new Date());

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over) return;

        const taskId = active.id as string;
        const overId = over.id as string;

        console.log(`Dragging task ${taskId} over ${overId}`);

        if (overId.startsWith('time-slot|')) {
            const parts = overId.split('|');
            const dateIso = parts[1];
            const hour = parseInt(parts[2]);

            const startDate = new Date(dateIso);
            if (!isNaN(startDate.getTime())) {
                startDate.setHours(hour, 0, 0, 0);
                const dueDate = addHours(startDate, 1);
                updateTask(taskId, {
                    startDate: startDate.toISOString(),
                    dueDate: dueDate.toISOString()
                });
            }
        } else {
            // Drop on whole day
            try {
                const parsedDate = new Date(overId);
                if (!isNaN(parsedDate.getTime())) {
                    // Set to local midnight for "all day" task
                    const formattedDate = format(parsedDate, 'yyyy-MM-dd');
                    updateTask(taskId, {
                        dueDate: formattedDate,
                        startDate: undefined
                    });
                }
            } catch (e) {
                console.error("Failed to parse drop date", overId);
            }
        }
    };

    const getTitle = () => {
        if (calendarMode === 'month') return format(viewDate, 'MMMM yyyy');
        if (calendarMode === 'day') return format(viewDate, 'MMMM d, yyyy');
        const start = days[0];
        const end = days[days.length - 1];
        if (isSameMonth(start, end)) {
            return `${format(start, 'MMMM')} ${format(start, 'd')} - ${format(end, 'd')}, ${format(start, 'yyyy')}`;
        }
        return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;
    };

    return (
        <div className="view-container calendar-view">
            <div className="view-header">
                <div className="breadcrumb">
                    <div className="breadcrumb-item">
                        {activeSpace && renderIcon(activeSpace.icon, 18, activeSpace.color || undefined)}
                        <span className="space-name">{activeSpace?.name || 'Space'}</span>
                    </div>
                    {currentListId && (
                        <>
                            <ChevronRightIcon size={14} className="breadcrumb-separator" />
                            <div className="breadcrumb-item">
                                {lists.find(l => l.id === currentListId)?.icon && renderIcon(lists.find(l => l.id === currentListId)?.icon!, 18, lists.find(l => l.id === currentListId)?.color || activeSpace?.color || undefined)}
                                <span className="space-name">{lists.find(l => l.id === currentListId)?.name}</span>
                            </div>
                        </>
                    )}
                    <span className="task-count">{filteredTasks.length}</span>
                </div>
                <div className="view-controls">
                    <button className="view-mode-btn" onClick={() => setCurrentView('list')}>List</button>
                    <button className="view-mode-btn" onClick={() => setCurrentView('kanban')}>Board</button>
                    <button className="view-mode-btn active" onClick={() => setCurrentView('calendar')}>Calendar</button>
                    <button className="view-mode-btn" onClick={() => setCurrentView('gantt')}>Gantt</button>
                </div>
            </div>

            <div className="toolbar">
                <div className="toolbar-left">
                    <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '13px' }} onClick={goToToday}>Today</button>
                    <div className="calendar-nav">
                        <button className="icon-btn-ghost" onClick={() => navigate('prev')}><ChevronLeft size={18} /></button>
                        <h2 className="current-month">{getTitle()}</h2>
                        <button className="icon-btn-ghost" onClick={() => navigate('next')}><ChevronRight size={18} /></button>
                    </div>
                    <div className="toolbar-divider"></div>
                    <div className="calendar-mode-switcher">
                        <button className={`mode-btn ${calendarMode === 'day' ? 'active' : ''}`} onClick={() => setCalendarMode('day')}>Day</button>
                        <button className={`mode-btn ${calendarMode === '4day' ? 'active' : ''}`} onClick={() => setCalendarMode('4day')}>4 Days</button>
                        <button className={`mode-btn ${calendarMode === 'week' ? 'active' : ''}`} onClick={() => setCalendarMode('week')}>Week</button>
                        <button className={`mode-btn ${calendarMode === 'month' ? 'active' : ''}`} onClick={() => setCalendarMode('month')}>Month</button>
                    </div>
                    <div className="toolbar-divider"></div>
                    <button className="btn-secondary" style={{ padding: '6px 14px', fontSize: '13px' }}><Filter size={14} /> Filter</button>
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

            <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
                {calendarMode === 'month' ? (
                    <div className="calendar-grid">
                        <div className="weekdays-header">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                <div key={day} className="weekday">{day}</div>
                            ))}
                        </div>
                        <div className="days-grid">
                            {days.map(day => {
                                const dayTasks = filteredTasks.filter(task => {
                                    if (!task.dueDate) return false;
                                    const taskDate = new Date(task.dueDate);
                                    return format(taskDate, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd');
                                });

                                return (
                                    <DroppableCalendarDay key={day.toISOString()} day={day} monthStart={monthStart}>
                                        {dayTasks.map(task => (
                                            <DraggableCalendarTask key={task.id} task={task} onTaskClick={onTaskClick} />
                                        ))}
                                    </DroppableCalendarDay>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <TimeGrid days={days} tasks={filteredTasks} onTaskClick={onTaskClick} />
                )}
            </DndContext>
        </div>
    );
};

export default CalendarView;
