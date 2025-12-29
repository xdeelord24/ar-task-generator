import React, { useState } from 'react';
import { Search, X, Link2, Circle, Plus } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import '../styles/TaskPicker.css';

interface TaskPickerProps {
    onSelect: (taskId: string) => void;
    onClose: () => void;
    excludeTaskId?: string;
}

const TaskPicker: React.FC<TaskPickerProps> = ({ onSelect, onClose, excludeTaskId }) => {
    const { tasks, spaces, lists } = useAppStore();
    const [search, setSearch] = useState('');

    const filteredTasks = tasks.filter(t =>
        (excludeTaskId ? t.id !== excludeTaskId : true) &&
        t.name.toLowerCase().includes(search.toLowerCase())
    );

    const getTaskPath = (task: any) => {
        const space = spaces.find(s => s.id === task.spaceId);
        const list = lists.find(l => l.id === task.listId);
        if (space && list) return `${space.name} / ${list.name}`;
        if (space) return space.name;
        return '';
    };

    const getStatusColor = (status: string) => {
        const s = status.toLowerCase();
        if (s.includes('todo')) return '#94a3b8';
        if (s.includes('progress')) return '#f59e0b';
        if (s.includes('completed') || s.includes('done')) return '#10b981';
        return '#cbd5e1';
    };

    return (
        <div className="task-picker-popover detailed-picker">
            <div className="task-picker-header">
                <Search size={18} className="search-icon" />
                <input
                    autoFocus
                    placeholder="Search for task (or subtask) name, ID, or URL"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <div className="header-actions">
                    <Plus size={18} className="plus-icon" />
                    <button onClick={onClose} className="close-btn"><X size={18} /></button>
                </div>
            </div>

            <div className="picker-meta-header">
                <span className="section-label">Recent</span>
                <button className="browse-btn">Browse tasks</button>
            </div>

            <div className="task-picker-list">
                {filteredTasks.length > 0 ? (
                    filteredTasks.map(task => (
                        <div
                            key={task.id}
                            className="task-picker-item detailed-item"
                            onClick={() => onSelect(task.id)}
                        >
                            <div className="item-left">
                                <div className="status-icon">
                                    <Circle size={14} fill={getStatusColor(task.status)} color={getStatusColor(task.status)} />
                                </div>
                                <div className="item-info">
                                    <span className="task-name">{task.name}</span>
                                    <div className="task-path">
                                        <Link2 size={12} />
                                        <span>{getTaskPath(task)}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="item-right">
                                {task.assignee && (
                                    <div className="assignee-avatar-xs" style={{ background: '#7c3aed' }}>
                                        {task.assignee[0]}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="no-results">No tasks found</div>
                )}
            </div>
        </div>
    );
};

export default TaskPicker;
