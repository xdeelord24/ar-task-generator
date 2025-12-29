import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import '../styles/TaskPicker.css';

interface TaskPickerProps {
    onSelect: (taskId: string) => void;
    onClose: () => void;
    excludeTaskId: string;
}

const TaskPicker: React.FC<TaskPickerProps> = ({ onSelect, onClose, excludeTaskId }) => {
    const { tasks } = useAppStore();
    const [search, setSearch] = useState('');

    const filteredTasks = tasks.filter(t =>
        t.id !== excludeTaskId &&
        t.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="task-picker-popover">
            <div className="task-picker-header">
                <Search size={14} className="search-icon" />
                <input
                    autoFocus
                    placeholder="Search tasks..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <button onClick={onClose} className="close-btn"><X size={14} /></button>
            </div>
            <div className="task-picker-list">
                {filteredTasks.length > 0 ? (
                    filteredTasks.map(task => (
                        <div
                            key={task.id}
                            className="task-picker-item"
                            onClick={() => onSelect(task.id)}
                        >
                            <span className="task-id">#{task.id.substring(0, 6)}</span>
                            <span className="task-name">{task.name}</span>
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
