import React from 'react';
import {
    History,
    CheckCircle2,
    Clock,
    Calendar,
    Star,
    Plus
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { format, isToday, parseISO } from 'date-fns';
import '../styles/HomeView.css';

interface HomeViewProps {
    onAddTask: () => void;
}

const HomeView: React.FC<HomeViewProps> = ({ onAddTask }) => {
    const { tasks } = useAppStore();

    const todayTasks = tasks.filter(t => t.dueDate && isToday(parseISO(t.dueDate)));
    const overdueTasks = tasks.filter(t => t.dueDate && !isToday(parseISO(t.dueDate)) && parseISO(t.dueDate) < new Date() && t.status.toUpperCase() !== 'COMPLETED');

    const recents = tasks.slice(0, 3);

    return (
        <div className="home-container">
            <div className="home-header">
                <div className="header-top">
                    <div>
                        <h1>Good morning, Jundee</h1>
                        <p>Here's what's happening with your projects today.</p>
                    </div>
                    <button className="btn-primary" onClick={onAddTask}>
                        <Plus size={16} /> New Task
                    </button>
                </div>
            </div>

            <div className="home-content-grid">
                <div className="home-main-col">
                    {/* Recents Section */}
                    <section className="home-section">
                        <div className="section-header">
                            <div className="title-group">
                                <History size={18} />
                                <h3>Recents</h3>
                            </div>
                            <button className="btn-secondary" style={{ padding: '4px 10px', fontSize: '12px' }}>See all</button>
                        </div>
                        <div className="recents-grid">
                            {recents.map(task => (
                                <div key={task.id} className="recent-card">
                                    <div className="recent-icon">
                                        <CheckCircle2 size={16} />
                                    </div>
                                    <div className="recent-info">
                                        <span className="recent-name">{task.name}</span>
                                        <span className="recent-meta">Updated {format(parseISO(task.updatedAt), 'MMM d')}</span>
                                    </div>
                                    <Star size={14} className="star-icon" />
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* My Work Section */}
                    <section className="home-section">
                        <div className="section-header">
                            <div className="title-group">
                                <CheckCircle2 size={18} />
                                <h3>My Work</h3>
                            </div>
                            <div className="work-tabs">
                                <button className="tab active">To Do</button>
                                <button className="tab">Done</button>
                                <button className="tab">Delegated</button>
                            </div>
                        </div>

                        <div className="work-groups">
                            <div className="work-group">
                                <div className="group-header">
                                    <span>Today</span>
                                    <span className="count">{todayTasks.length}</span>
                                </div>
                                <div className="group-tasks">
                                    {todayTasks.length > 0 ? todayTasks.map(task => (
                                        <div key={task.id} className="home-task-item">
                                            <div className="task-left">
                                                <div className="checkbox"></div>
                                                <span>{task.name}</span>
                                            </div>
                                            <div className="task-right">
                                                <span className={`priority-tag ${task.priority}`}>{task.priority}</span>
                                            </div>
                                        </div>
                                    )) : <div className="empty-tasks">No tasks for today</div>}
                                </div>
                                <button className="add-task-inline" onClick={onAddTask}>+ Add Task</button>
                            </div>

                            {overdueTasks.length > 0 && (
                                <div className="work-group overdue">
                                    <div className="group-header">
                                        <span>Overdue</span>
                                        <span className="count">{overdueTasks.length}</span>
                                    </div>
                                    <div className="group-tasks">
                                        {overdueTasks.map(task => (
                                            <div key={task.id} className="home-task-item">
                                                <div className="task-left">
                                                    <div className="checkbox"></div>
                                                    <span>{task.name}</span>
                                                </div>
                                                <div className="task-right">
                                                    <span className="date overdue">{task.dueDate}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                <div className="home-side-col">
                    {/* Agenda Section */}
                    <section className="home-section">
                        <div className="section-header">
                            <div className="title-group">
                                <Calendar size={18} />
                                <h3>Agenda</h3>
                            </div>
                        </div>
                        <div className="agenda-card">
                            <div className="agenda-date">
                                <span className="day-name">{format(new Date(), 'EEE')}</span>
                                <span className="day-num">{format(new Date(), 'd')}</span>
                            </div>
                            <div className="agenda-events">
                                {todayTasks.length > 0 ? todayTasks.slice(0, 2).map(task => (
                                    <div key={task.id} className="agenda-event">
                                        <span className="time">All day</span>
                                        <span className="event-name">{task.name}</span>
                                    </div>
                                )) : <div className="empty-agenda">Clean slate for today!</div>}
                            </div>
                        </div>
                    </section>

                    {/* Time Tracking Section */}
                    <section className="home-section">
                        <div className="section-header">
                            <div className="title-group">
                                <Clock size={18} />
                                <h3>Time Tracking</h3>
                            </div>
                        </div>
                        <div className="time-tracking-card">
                            <div className="time-stat">
                                <span className="label">Today</span>
                                <span className="value">0h 00m</span>
                            </div>
                            <div className="time-stat">
                                <span className="label">This week</span>
                                <span className="value">0h 00m</span>
                            </div>
                            <button className="btn-primary" style={{ marginTop: '16px', width: '100%' }}>Start Timer</button>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default HomeView;
