import React from 'react';
import {
    TrendingUp,
    CheckCircle2,
    AlertCircle,
    Clock,
    Layout
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import '../styles/DashboardView.css';

const DashboardView: React.FC = () => {
    const { tasks } = useAppStore();

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'COMPLETED').length;
    const inProgressTasks = tasks.filter(t => t.status === 'IN PROGRESS').length;
    const todoTasks = tasks.filter(t => t.status === 'TO DO').length;

    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const priorityData = {
        urgent: tasks.filter(t => t.priority === 'urgent').length,
        high: tasks.filter(t => t.priority === 'high').length,
        medium: tasks.filter(t => t.priority === 'medium').length,
        low: tasks.filter(t => t.priority === 'low').length,
    };

    return (
        <div className="view-container">
            <div className="view-header">
                <div className="breadcrumb">
                    <span className="space-name">Dashboards</span>
                    <span className="task-count">Project Overview</span>
                </div>
                <div className="view-controls">
                    <button className="view-mode-btn active">Overview</button>
                    <button className="view-mode-btn">Analytics</button>
                    <button className="view-mode-btn">Workload</button>
                </div>
            </div>

            <div className="dashboard-content">
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon blue">
                            <Layout size={20} />
                        </div>
                        <div className="stat-info">
                            <span className="stat-label">Total Tasks</span>
                            <span className="stat-value">{totalTasks}</span>
                        </div>
                        <div className="stat-trend positive">
                            <TrendingUp size={14} /> 12%
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon green">
                            <CheckCircle2 size={20} />
                        </div>
                        <div className="stat-info">
                            <span className="stat-label">Completed</span>
                            <span className="stat-value">{completedTasks}</span>
                        </div>
                        <div className="stat-progress">
                            <div className="progress-bar">
                                <div className="progress-fill green" style={{ width: `${completionRate}%` }}></div>
                            </div>
                            <span className="progress-text">{completionRate}%</span>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon orange">
                            <Clock size={20} />
                        </div>
                        <div className="stat-info">
                            <span className="stat-label">In Progress</span>
                            <span className="stat-value">{inProgressTasks}</span>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon red">
                            <AlertCircle size={20} />
                        </div>
                        <div className="stat-info">
                            <span className="stat-label">Urgent</span>
                            <span className="stat-value">{priorityData.urgent}</span>
                        </div>
                    </div>
                </div>

                <div className="charts-container">
                    <div className="chart-card">
                        <h3>Task Distribution</h3>
                        <div className="bar-chart">
                            <div className="bar-item">
                                <div className="bar-label">To Do</div>
                                <div className="bar-wrapper">
                                    <div className="bar-fill blue" style={{ height: `${(todoTasks / totalTasks) * 100}%` }}></div>
                                </div>
                                <div className="bar-count">{todoTasks}</div>
                            </div>
                            <div className="bar-item">
                                <div className="bar-label">In Progress</div>
                                <div className="bar-wrapper">
                                    <div className="bar-fill orange" style={{ height: `${(inProgressTasks / totalTasks) * 100}%` }}></div>
                                </div>
                                <div className="bar-count">{inProgressTasks}</div>
                            </div>
                            <div className="bar-item">
                                <div className="bar-label">Completed</div>
                                <div className="bar-wrapper">
                                    <div className="bar-fill green" style={{ height: `${(completedTasks / totalTasks) * 100}%` }}></div>
                                </div>
                                <div className="bar-count">{completedTasks}</div>
                            </div>
                        </div>
                    </div>

                    <div className="chart-card">
                        <h3>Priority Breakdown</h3>
                        <div className="priority-list">
                            {Object.entries(priorityData).map(([priority, count]) => (
                                <div key={priority} className="priority-item">
                                    <div className="priority-info">
                                        <span className={`priority-dot ${priority}`}></span>
                                        <span className="priority-name">{priority}</span>
                                    </div>
                                    <span className="priority-count">{count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardView;
