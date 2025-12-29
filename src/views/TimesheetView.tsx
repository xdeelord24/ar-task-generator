import React, { useState } from 'react';
import {
    ChevronLeft,
    ChevronRight,
    Calendar as CalendarIcon,
    Search,
    Plus
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { format, startOfWeek, endOfWeek, addDays, isSameDay } from 'date-fns';
import '../styles/TimesheetView.css';
import '../styles/ListView.css';

const TimesheetView: React.FC = () => {
    const { tasks, currentSpaceId } = useAppStore();
    const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));

    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

    const filteredTasks = tasks.filter(task =>
        currentSpaceId === 'everything' || task.spaceId === currentSpaceId
    );

    const prevWeek = () => setCurrentWeekStart(addDays(currentWeekStart, -7));
    const nextWeek = () => setCurrentWeekStart(addDays(currentWeekStart, 7));

    return (
        <div className="view-container">
            <div className="view-header">
                <div className="breadcrumb">
                    <span className="space-name">Timesheets</span>
                    <span className="task-count">{filteredTasks.length} tasks tracked</span>
                </div>
                <div className="view-controls">
                    <button className="view-mode-btn active">Personal</button>
                    <button className="view-mode-btn">Team</button>
                </div>
            </div>

            <div className="toolbar">
                <div className="toolbar-left">
                    <button className="icon-btn-ghost" onClick={prevWeek} title="Previous Week"><ChevronLeft size={16} /></button>
                    <h2 className="current-range">
                        {format(currentWeekStart, 'MMM d')} - {format(endOfWeek(currentWeekStart, { weekStartsOn: 1 }), 'MMM d, yyyy')}
                    </h2>
                    <button className="icon-btn-ghost" onClick={nextWeek} title="Next Week"><ChevronRight size={16} /></button>
                    <button className="btn-secondary" style={{ marginLeft: '12px', padding: '6px 12px', fontSize: '13px' }} onClick={() => setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))}>
                        <CalendarIcon size={14} /> This Week
                    </button>
                </div>
                <div className="toolbar-right">
                    <div className="toolbar-search">
                        <Search size={14} />
                        <input type="text" placeholder="Search entries..." readOnly />
                    </div>
                    <button className="btn-primary" style={{ padding: '8px 16px' }}>
                        <Plus size={16} /> Add Entry
                    </button>
                </div>
            </div>

            <div className="timesheet-container">
                <table className="timesheet-table">
                    <thead>
                        <tr>
                            <th className="col-task-info">Task</th>
                            {weekDays.map(day => (
                                <th key={day.toISOString()} className={isSameDay(day, new Date()) ? 'today' : ''}>
                                    <div className="day-name">{format(day, 'EEE')}</div>
                                    <div className="day-date">{format(day, 'd')}</div>
                                </th>
                            ))}
                            <th className="col-total">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTasks.map(task => (
                            <tr key={task.id}>
                                <td className="col-task-info">
                                    <div className="task-name">{task.name}</div>
                                    <div className="task-project">Team Space</div>
                                </td>
                                {weekDays.map(day => (
                                    <td key={day.toISOString()} className="time-cell">
                                        <input type="text" placeholder="0:00" />
                                    </td>
                                ))}
                                <td className="col-total">0:00</td>
                            </tr>
                        ))}
                        {filteredTasks.length === 0 && (
                            <tr>
                                <td colSpan={9} className="empty-row">No tasks found in this space.</td>
                            </tr>
                        )}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td className="col-task-info">Total Hours</td>
                            {weekDays.map(day => (
                                <td key={day.toISOString()} className="total-cell">0:00</td>
                            ))}
                            <td className="col-total">0:00</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
};

export default TimesheetView;
