import React, { useState } from 'react';
import {
    ChevronLeft,
    ChevronRight,
    Search,
    Plus,
    ZoomIn,
    ZoomOut,
    Calendar,
    ChevronDown
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
    differenceInMinutes,
    addMonths,
    subMonths,
    eachDayOfInterval,
    endOfMonth,
    addDays,
    parseISO,
    startOfWeek,
    endOfWeek,
    startOfQuarter,
    endOfQuarter,
    startOfYear,
    endOfYear,
    addWeeks,
    addYears,
    isSameMonth,
    isSameYear,
    addHours,
    getWeek,
    isSameDay
} from 'date-fns';
import type { Task } from '../types';
import ViewHeader from '../components/ViewHeader';
import TaskOptionsMenu from '../components/TaskOptionsMenu';
import '../styles/GanttView.css';
import '../styles/ListView.css';
import '../styles/TaskOptionsMenu.css';

interface GanttViewProps {
    onAddTask: () => void;
    onTaskClick: (taskId: string) => void;
}

type TimeUnit = 'hour' | 'day' | 'week' | 'month';

interface DraggableGanttBarProps {
    task: Task;
    viewStart: Date;
    zoom: number;
    onTaskClick: (taskId: string) => void;
    onContextMenu: (taskId: string, trigger: HTMLElement) => void;
    unit: TimeUnit;
    colWidth: number;
}

const DraggableGanttBar: React.FC<DraggableGanttBarProps> = ({ task, viewStart, zoom, onTaskClick, onContextMenu, unit, colWidth }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: task.id,
    });

    const taskStart = task.startDate ? parseISO(task.startDate) : (task.dueDate ? parseISO(task.dueDate) : new Date());
    const taskEnd = task.dueDate ? parseISO(task.dueDate) : taskStart;

    let minsPerUnit = 24 * 60; // Default Day
    if (unit === 'hour') minsPerUnit = 60;
    if (unit === 'week') minsPerUnit = 7 * 24 * 60;
    if (unit === 'month') minsPerUnit = 30.44 * 24 * 60; // Approx

    const diffMins = differenceInMinutes(taskStart, viewStart);
    const timeIndex = diffMins / minsPerUnit;

    const durationMinutes = differenceInMinutes(taskEnd, taskStart);
    let durationUnits = durationMinutes / minsPerUnit;
    if (durationMinutes <= 0) durationUnits = 1; // Min 1 unit width if instant

    const widthPx = Math.max(2, durationUnits * colWidth);
    const leftPx = timeIndex * colWidth;

    const style = {
        left: `${leftPx + (transform?.x || 0)}px`,
        width: `${widthPx}px`,
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
            onContextMenu={(e) => {
                e.preventDefault();
                onContextMenu(task.id, e.currentTarget);
            }}
        >
            <span className="gantt-bar-label">{task.name}</span>
        </div>
    );
};

type TimePeriod = 'Day' | 'Week' | 'Month' | 'Quarter' | 'Year' | 'Flexible';

const GanttView: React.FC<GanttViewProps> = ({ onAddTask, onTaskClick }) => {
    const { tasks, currentSpaceId, updateTask, duplicateTask, archiveTask, deleteTask } = useAppStore();
    const [viewDate, setViewDate] = useState(new Date());
    const [zoom, setZoom] = useState(1);
    const [openMenuTaskId, setOpenMenuTaskId] = useState<string | null>(null);
    const [menuTrigger, setMenuTrigger] = useState<HTMLElement | null>(null);
    const [timePeriod, setTimePeriod] = useState<TimePeriod>('Week');
    const [isPeriodMenuOpen, setIsPeriodMenuOpen] = useState(false);

    const handleOpenMenu = (taskId: string, trigger: HTMLElement) => {
        setOpenMenuTaskId(taskId);
        setMenuTrigger(trigger);
    };

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        })
    );

    const getViewRange = () => {
        switch (timePeriod) {
            case 'Day':
                return { start: viewDate, end: addDays(viewDate, 1) }; // Show 24h+
            case 'Week':
                return { start: startOfWeek(viewDate, { weekStartsOn: 1 }), end: endOfWeek(viewDate, { weekStartsOn: 1 }) };
            case 'Month':
                return { start: startOfMonth(viewDate), end: endOfMonth(viewDate) };
            case 'Quarter':
                return { start: startOfQuarter(viewDate), end: endOfQuarter(viewDate) };
            case 'Year':
                return { start: startOfYear(viewDate), end: endOfYear(viewDate) };
            case 'Flexible':
                return { start: startOfMonth(viewDate), end: addMonths(endOfMonth(viewDate), 2) }; // 3 months
            default:
                return { start: startOfMonth(viewDate), end: endOfMonth(viewDate) };
        }
    };

    const { start: viewStart, end: viewEnd } = getViewRange();

    const getLayoutSettings = () => {
        switch (timePeriod) {
            case 'Day': return { unit: 'hour' as TimeUnit, baseWidth: 60 };
            case 'Week': return { unit: 'day' as TimeUnit, baseWidth: 50 };
            case 'Month': return { unit: 'day' as TimeUnit, baseWidth: 40 };
            case 'Quarter': return { unit: 'week' as TimeUnit, baseWidth: 120 };
            case 'Year': return { unit: 'month' as TimeUnit, baseWidth: 100 };
            case 'Flexible': return { unit: 'week' as TimeUnit, baseWidth: 100 };
            default: return { unit: 'day' as TimeUnit, baseWidth: 50 };
        }
    };

    const { unit, baseWidth } = getLayoutSettings();
    const colWidth = baseWidth * zoom;

    // Generate Columns
    // Generate Columns and Groups
    const { columns, groups } = (() => {
        const cols = [];
        let iter = new Date(viewStart);
        const end = new Date(viewEnd);
        let count = 0;

        // Groups tracking
        const groups: { label: string, startIndex: number, count: number }[] = [];
        let currentGroupLabel = '';
        let currentGroupCount = 0;
        let currentGroupStartIndex = 0;

        while (iter <= end && count < 2000) {
            let label = '';
            let subLabel = '';
            let groupLabel = '';

            if (unit === 'hour') {
                label = format(iter, 'h a');
                groupLabel = format(iter, 'EEE, MMM d');
            } else if (unit === 'day') {
                // "Fr 11"
                label = `${format(iter, 'EE')} ${format(iter, 'd')}`;
                // Group by Week: "W28 Jul 13 - 19"
                const wNum = getWeek(iter);
                const wStart = startOfWeek(iter, { weekStartsOn: 1 });
                const wEnd = endOfWeek(iter, { weekStartsOn: 1 });
                groupLabel = `W${wNum} ${format(wStart, 'MMM d')} - ${format(wEnd, 'd')}`;
            } else if (unit === 'week') {
                const wNum = getWeek(iter);
                groupLabel = format(iter, 'MMMM yyyy');
                label = `W${wNum}`;
                const wStart = startOfWeek(iter, { weekStartsOn: 1 });
                const wEnd = endOfWeek(iter, { weekStartsOn: 1 });
                subLabel = `${format(wStart, 'd')}-${format(wEnd, 'd')}`;
            } else if (unit === 'month') {
                label = format(iter, 'MMM');
                subLabel = format(iter, 'yyyy');
                groupLabel = format(iter, 'yyyy');
            }

            // Group Logic
            if (groupLabel !== currentGroupLabel) {
                if (currentGroupCount > 0) {
                    groups.push({ label: currentGroupLabel, startIndex: currentGroupStartIndex, count: currentGroupCount });
                }
                currentGroupLabel = groupLabel;
                currentGroupCount = 1;
                currentGroupStartIndex = count;
            } else {
                currentGroupCount++;
            }

            cols.push({ date: new Date(iter), label, subLabel, id: iter.toISOString() });

            if (unit === 'hour') iter = addHours(iter, 1);
            else if (unit === 'day') iter = addDays(iter, 1);
            else if (unit === 'week') iter = addWeeks(iter, 1);
            else if (unit === 'month') iter = addMonths(iter, 1);

            count++;
        }

        // Push last group
        if (currentGroupCount > 0) {
            groups.push({ label: currentGroupLabel, startIndex: currentGroupStartIndex, count: currentGroupCount });
        }

        // If empty
        if (cols.length === 0) {
            cols.push({ date: viewStart, label: 'Now', subLabel: '', id: viewStart.toISOString() });
            groups.push({ label: format(viewStart, 'MMMM yyyy'), startIndex: 0, count: 1 });
        }
        return { columns: cols, groups };
    })();

    const filteredTasks = tasks.filter(task =>
        (currentSpaceId === 'everything' || task.spaceId === currentSpaceId) &&
        (task.dueDate || task.startDate)
    );

    const navigate = (direction: 'next' | 'prev') => {
        const factor = direction === 'next' ? 1 : -1;
        switch (timePeriod) {
            case 'Day':
                setViewDate(addDays(viewDate, factor));
                break;
            case 'Week':
                setViewDate(addWeeks(viewDate, factor));
                break;
            case 'Month':
                setViewDate(addMonths(viewDate, factor));
                break;
            case 'Quarter':
                setViewDate(addMonths(viewDate, factor * 3));
                break;
            case 'Year':
                setViewDate(addYears(viewDate, factor));
                break;
            default:
                setViewDate(addMonths(viewDate, factor));
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, delta } = event;
        const taskId = active.id as string;
        const task = tasks.find(t => t.id === taskId);

        if (!task) return;

        let minutesMoved = 0;

        let minsPerUnit = 24 * 60;
        if (unit === 'hour') minsPerUnit = 60;
        if (unit === 'week') minsPerUnit = 7 * 24 * 60;
        if (unit === 'month') minsPerUnit = 30.44 * 24 * 60;

        const unitsMoved = delta.x / colWidth;
        minutesMoved = Math.round(unitsMoved * minsPerUnit);

        if (minutesMoved !== 0) {
            const currentStart = task.startDate ? parseISO(task.startDate) : (task.dueDate ? parseISO(task.dueDate) : new Date());
            const currentEnd = task.dueDate ? parseISO(task.dueDate) : currentStart;

            const newStart = new Date(currentStart.getTime() + minutesMoved * 60000);
            const newEnd = new Date(currentEnd.getTime() + minutesMoved * 60000);

            updateTask(taskId, {
                startDate: newStart.toISOString(),
                dueDate: newEnd.toISOString()
            });
        }
    };

    const getTitle = () => {
        if (timePeriod === 'Day') return format(viewStart, 'MMMM d, yyyy');
        if (timePeriod === 'Month') return format(viewStart, 'MMMM yyyy');
        if (timePeriod === 'Year') return format(viewStart, 'yyyy');

        // Ranges
        if (isSameMonth(viewStart, viewEnd)) {
            return `${format(viewStart, 'MMMM d')} - ${format(viewEnd, 'd, yyyy')}`;
        }
        if (isSameYear(viewStart, viewEnd)) {
            return `${format(viewStart, 'MMM d')} - ${format(viewEnd, 'MMM d, yyyy')}`;
        }
        return `${format(viewStart, 'MMM d, yyyy')} - ${format(viewEnd, 'MMM d, yyyy')}`;
    };

    // Calculate Current Time Position
    const now = new Date();
    let currentTimeX = -1;
    if (now >= viewStart && now <= viewEnd) {
        let minsPerUnit = 24 * 60;
        if (unit === 'hour') minsPerUnit = 60;
        if (unit === 'week') minsPerUnit = 7 * 24 * 60;
        if (unit === 'month') minsPerUnit = 30.44 * 24 * 60;

        const diffMins = differenceInMinutes(now, viewStart);
        const units = diffMins / minsPerUnit;
        currentTimeX = units * colWidth;
    }

    return (
        <div className="view-container gantt-view">
            <ViewHeader />

            <div className="toolbar">
                <div className="toolbar-left">
                    <button className="btn-secondary" onClick={() => setViewDate(new Date())} style={{ padding: '6px 12px', fontSize: '13px' }}>
                        Today
                    </button>
                    <div className="toolbar-divider"></div>
                    <button className="icon-btn-ghost" onClick={() => navigate('prev')}><ChevronLeft size={16} /></button>
                    <h2 className="current-month">{getTitle()}</h2>
                    <button className="icon-btn-ghost" onClick={() => navigate('next')}><ChevronRight size={16} /></button>

                    <div className="toolbar-divider"></div>

                    {/* Period Selector */}
                    <div className="period-selector" style={{ position: 'relative' }}>
                        <button
                            className="btn-secondary"
                            style={{ padding: '6px 12px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: 6 }}
                            onClick={() => setIsPeriodMenuOpen(!isPeriodMenuOpen)}
                        >
                            <Calendar size={14} />
                            <span>{timePeriod}</span>
                            <ChevronDown size={12} />
                        </button>

                        {isPeriodMenuOpen && (
                            <div className="dropdown-menu" style={{ position: 'absolute', top: '100%', left: 0, marginTop: 4, zIndex: 50, minWidth: 120 }}>
                                <div className="dropdown-header" style={{ padding: '8px 12px', fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 600 }}>
                                    Time period
                                </div>
                                {['Day', 'Week', 'Month', 'Quarter', 'Year', 'Flexible'].map((period) => (
                                    <button
                                        key={period}
                                        className="dropdown-item"
                                        onClick={() => {
                                            setTimePeriod(period as TimePeriod);
                                            setIsPeriodMenuOpen(false);
                                        }}
                                        style={{ display: 'flex', justifyContent: 'space-between' }}
                                    >
                                        {period}
                                        {timePeriod === period && <span style={{ color: 'var(--primary)' }}>✓</span>}
                                    </button>
                                ))}
                            </div>
                        )}
                        {isPeriodMenuOpen && (
                            <div
                                style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 40 }}
                                onClick={() => setIsPeriodMenuOpen(false)}
                            ></div>
                        )}
                    </div>

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
                                <div
                                    key={task.id}
                                    className="gantt-row-label"
                                    onClick={() => onTaskClick(task.id)}
                                    onContextMenu={(e) => {
                                        e.preventDefault();
                                        handleOpenMenu(task.id, e.currentTarget);
                                    }}
                                >
                                    <span className={`priority-indicator ${task.priority}`}></span>
                                    {task.name}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="gantt-main">
                        <div className="gantt-timeline-header-group">
                            {/* Group Header Row */}
                            <div className="gantt-header-row top">
                                {groups.map((group, i) => (
                                    <div
                                        key={i}
                                        className="gantt-header-group-cell"
                                        style={{ width: `${group.count * colWidth}px` }}
                                    >
                                        {group.label}
                                    </div>
                                ))}
                            </div>
                            {/* Base Header Row */}
                            <div className="gantt-header-row bottom">
                                {columns.map(col => (
                                    <div key={col.id} className="gantt-day-header" style={{ width: `${colWidth}px` }}>
                                        <div className="day-name">{col.label}</div>
                                        {col.subLabel && <div className="day-num" style={{ fontSize: '10px' }}>{col.subLabel}</div>}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="gantt-grid">
                            {currentTimeX >= 0 && (
                                <div
                                    className="current-time-line"
                                    style={{ left: `${currentTimeX}px`, height: '100%', position: 'absolute', top: 0, width: '2px', backgroundColor: '#ef4444', zIndex: 20, pointerEvents: 'none' }}
                                >
                                    <div style={{ position: 'absolute', top: '-4px', left: '-4px', width: '10px', height: '10px', backgroundColor: '#ef4444', borderRadius: '50%' }} />
                                </div>
                            )}
                            {filteredTasks.map(task => (
                                <div key={task.id} className="gantt-row">
                                    {columns.map(col => (
                                        <div key={col.id} className="gantt-cell" style={{ width: `${colWidth}px` }}></div>
                                    ))}
                                    <DraggableGanttBar
                                        task={task}
                                        viewStart={viewStart}
                                        zoom={zoom}
                                        onTaskClick={onTaskClick}
                                        onContextMenu={handleOpenMenu}
                                        unit={unit}
                                        colWidth={colWidth}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                {openMenuTaskId && (
                    <TaskOptionsMenu
                        taskId={openMenuTaskId}
                        onClose={() => setOpenMenuTaskId(null)}
                        onRename={() => { onTaskClick(openMenuTaskId); setOpenMenuTaskId(null); }}
                        onDuplicate={() => duplicateTask(openMenuTaskId)}
                        onArchive={() => archiveTask(openMenuTaskId)}
                        onDelete={() => deleteTask(openMenuTaskId)}
                        onConvertToDoc={() => { }}
                        triggerElement={menuTrigger}
                    />
                )}
            </DndContext>

        </div>
    );
};

export default GanttView;
