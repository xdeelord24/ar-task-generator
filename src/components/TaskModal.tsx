import React from 'react';
import { X, Calendar, Flag, Clock, Users } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import type { Priority, Task } from '../types';
import '../styles/TaskModal.css';

interface TaskModalProps {
    onClose: () => void;
    initialStatus?: string;
}

const TaskModal: React.FC<TaskModalProps> = ({ onClose, initialStatus }) => {
    const { addTask, currentSpaceId, currentListId, spaces, lists } = useAppStore();

    const activeList = lists.find(l => l.id === currentListId);
    const activeSpace = spaces.find(s => s.id === currentSpaceId);

    // Default statuses fallback
    const defaultStatuses = [
        { id: 'todo', name: 'TO DO' },
        { id: 'inprogress', name: 'IN PROGRESS' },
        { id: 'completed', name: 'COMPLETED' }
    ];

    const activeStatuses = activeList?.statuses || activeSpace?.statuses || defaultStatuses;

    const [name, setName] = React.useState('');
    const [description, setDescription] = React.useState('');
    const [status, setStatus] = React.useState<Task['status']>(initialStatus || activeStatuses[0]?.name || 'TO DO');
    const [priority, setPriority] = React.useState<Priority>('medium');
    const [dueDate, setDueDate] = React.useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        addTask({
            name,
            description,
            spaceId: currentSpaceId === 'everything' ? 'team-space' : currentSpaceId,
            listId: currentListId || undefined,
            status,
            priority,
            dueDate: dueDate || undefined,
        });
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Create Task</h2>
                    <button className="close-btn" onClick={onClose}><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <input
                            type="text"
                            className="task-name-input"
                            placeholder="Task name"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <textarea
                            className="task-desc-input"
                            placeholder="Description"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                        />
                    </div>

                    <div className="task-options-grid">
                        <div className="option-item">
                            <Calendar size={16} />
                            <input
                                type="date"
                                value={dueDate}
                                onChange={e => setDueDate(e.target.value)}
                            />
                        </div>

                        <div className="option-item">
                            <Flag size={16} />
                            <select value={priority} onChange={e => setPriority(e.target.value as Priority)}>
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="urgent">Urgent</option>
                            </select>
                        </div>

                        <div className="option-item">
                            <Clock size={16} />
                            <span>Status</span>
                            <select value={status} onChange={e => setStatus(e.target.value as Task['status'])}>
                                {activeStatuses.map(s => (
                                    <option key={s.id} value={s.name}>{s.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="option-item">
                            <Users size={16} />
                            <span>Assignee</span>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-primary" disabled={!name.trim()}>Create Task</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TaskModal;
