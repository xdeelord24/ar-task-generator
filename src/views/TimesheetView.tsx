import React, { useState } from 'react';
import {
    ChevronLeft,
    ChevronRight,
    Plus,
    Clock,
    Settings,
    Tag,
    DollarSign,
    Briefcase
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { format, startOfWeek, endOfWeek, addDays, isSameDay, isToday } from 'date-fns';
import type { Task } from '../types';
import '../styles/TimesheetView.css';
import '../styles/ListView.css';

const TimesheetView: React.FC = () => {
    const { tasks, currentSpaceId } = useAppStore();
    const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 0 })); // Week starts on Sunday as per screenshot

    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

    const filteredTasks = tasks.filter(task =>
        currentSpaceId === 'everything' || task.spaceId === currentSpaceId
    );

    const prevWeek = () => setCurrentWeekStart(addDays(currentWeekStart, -7));
    const nextWeek = () => setCurrentWeekStart(addDays(currentWeekStart, 7));

    const formatDuration = (minutes: number) => {
        if (minutes === 0) return '0h';
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (mins === 0) return `${hours}h`;
        return `${hours}h ${mins}m`;
    };

    const getTaskDailyTotal = (task: Task, day: Date) => {
        if (!task.timeEntries) return 0;
        return task.timeEntries
            .filter(entry => isSameDay(new Date(entry.date), day))
            .reduce((acc, curr) => acc + curr.duration, 0);
    };

    const getTaskWeeklyTotal = (task: Task) => {
        return weekDays.reduce((acc, day) => acc + getTaskDailyTotal(task, day), 0);
    };

    const getDailyTotal = (day: Date) => {
        return filteredTasks.reduce((acc, task) => acc + getTaskDailyTotal(task, day), 0);
    };

    const getWeeklyGrandTotal = () => {
        return filteredTasks.reduce((acc, task) => acc + getTaskWeeklyTotal(task), 0);
    };

    const hasTasks = filteredTasks.length > 0;

    return (
        <div className="view-container">
            {/* Header with Tabs */}
            <div className="view-header">
                <div className="header-left">
                    <span className="page-title">Timesheets</span>
                    <div className="h-divider"></div>
                    <div className="ts-tabs">
                        <button className="ts-tab active">My timesheet</button>
                        <button className="ts-tab">All timesheets</button>
                        <button className="ts-tab">Approvals</button>
                    </div>
                </div>
                <button className="btn-configure">
                    <Settings size={14} /> Configure
                </button>
            </div>

            {/* Controls Bar */}
            <div className="ts-controls-bar">
                {/* Date Navigation */}
                <div className="date-nav">
                    <button className="icon-btn-ghost" onClick={prevWeek}><ChevronLeft size={16} /></button>
                    <button className="icon-btn-ghost" onClick={nextWeek}><ChevronRight size={16} /></button>
                    <div className="date-range-display">
                        {format(currentWeekStart, 'MMM d')} - {format(endOfWeek(currentWeekStart, { weekStartsOn: 0 }), 'MMM d')}
                    </div>
                </div>

                {/* Filters Row */}
                <div className="filter-row">
                    <div className="filter-left">
                        <button className="filter-pill"><DollarSign size={13} /> Billable status</button>
                        <button className="filter-pill"><Tag size={13} /> Tag</button>
                        <button className="filter-pill"><Clock size={13} /> Tracked time</button>
                    </div>
                    <div className="view-toggle">
                        <button className="toggle-option active"><Briefcase size={14} /> Timesheet</button>
                        <button className="toggle-option"><span style={{ fontSize: '12px' }}>☰</span> Time entries</button>
                    </div>
                </div>
            </div>

            {/* Timesheet Grid */}
            <div className="timesheet-grid">
                {/* Grid Header Row */}
                <div className="grid-header">
                    <div className="col-task-header">Task / Location</div>
                    {weekDays.map(day => (
                        <div key={day.toISOString()} className={`col-day-header ${isToday(day) ? 'today' : ''}`}>
                            <div className="day-meta">
                                {format(day, 'EEE')}, {format(day, 'MMM d')}
                            </div>
                            <div className="day-total">
                                {formatDuration(getDailyTotal(day))}
                            </div>
                        </div>
                    ))}
                    <div className="col-total-header">
                        <span className="day-meta">Total</span>
                        <span className="day-total">{formatDuration(getWeeklyGrandTotal())}</span>
                    </div>
                </div>

                {/* Grid Body */}
                <div className="grid-body">
                    {!hasTasks ? (
                        <div className="empty-state">
                            <div className="empty-icon-circle">
                                <Clock size={32} strokeWidth={1.5} />
                            </div>
                            <div className="empty-title">No time entries for this week</div>
                            <div className="empty-subtitle">Add tasks or track time to begin.</div>
                            <button className="btn-track-time">
                                <Clock size={16} /> Track time
                            </button>
                        </div>
                    ) : (
                        <div>
                            {filteredTasks.map(task => {
                                const weeklyTotal = getTaskWeeklyTotal(task);
                                return (
                                    <div key={task.id} className="task-row">
                                        <div className="col-task-cell">
                                            <div className="ts-task-name">{task.name}</div>
                                            <div className="ts-task-project">Team Space</div>
                                        </div>
                                        {weekDays.map(day => {
                                            const total = getTaskDailyTotal(task, day);
                                            return (
                                                <div key={day.toISOString()} className="col-time-cell">
                                                    <input
                                                        type="text"
                                                        placeholder="0h"
                                                        value={total > 0 ? formatDuration(total) : ''}
                                                        readOnly
                                                        className="ts-time-input"
                                                    />
                                                </div>
                                            );
                                        })}
                                        <div className="col-total-cell">
                                            {formatDuration(weeklyTotal)}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Floating Add Task Button */}
            <button className="btn-add-task-floating">
                <Plus size={18} /> Add task
            </button>
        </div>
    );
};

export default TimesheetView;
