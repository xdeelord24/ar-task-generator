import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import '../styles/CreateListModal.css'; // Reusing styles

interface CreateFolderModalProps {
    spaceId: string;
    onClose: () => void;
    editingFolder?: { id: string; name: string };
    onUpdate?: (id: string, updates: any) => void;
}

const CreateFolderModal: React.FC<CreateFolderModalProps> = ({ spaceId, onClose, editingFolder, onUpdate }) => {
    const { addFolder, spaces } = useAppStore();
    const [name, setName] = useState(editingFolder?.name || '');

    const space = spaces.find(s => s.id === spaceId);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            if (editingFolder && onUpdate) {
                onUpdate(editingFolder.id, { name: name.trim() });
            } else {
                addFolder({
                    name: name.trim(),
                    spaceId: spaceId
                });
            }
            onClose();
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content create-list-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '440px' }}>
                <div className="modal-header">
                    <h3>{editingFolder ? 'Rename Folder' : `Create Folder in ${space?.name}`}</h3>
                    <button className="close-btn" onClick={onClose}><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit} className="task-form">
                    <div className="form-group">
                        <label style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>Folder Name</label>
                        <input
                            autoFocus
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Development, Marketing, Sprints"
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none', background: 'var(--bg-main)', color: 'var(--text-main)' }}
                        />
                    </div>

                    <div className="modal-footer" style={{ marginTop: '32px' }}>
                        <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-primary" disabled={!name.trim()}>{editingFolder ? 'Update Folder' : 'Create Folder'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateFolderModal;
