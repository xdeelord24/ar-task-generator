import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
    X,
    Search,
    Folder,
    Layout,
    List,
    ChevronRight,
    ArrowLeft,
    Check
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import '../styles/MoveTaskModal.css';

interface MoveTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    taskId: string;
}

const MoveTaskModal: React.FC<MoveTaskModalProps> = ({ isOpen, onClose, taskId }) => {
    const { spaces, folders, lists, updateTask, tasks } = useAppStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSpaceId, setSelectedSpaceId] = useState<string | null>(null);
    const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

    const task = useMemo(() => tasks.find(t => t.id === taskId), [tasks, taskId]);

    if (!isOpen || !task) return null;

    const handleMove = (targetSpaceId: string, targetListId: string) => {
        updateTask(taskId, {
            spaceId: targetSpaceId,
            listId: targetListId
        });
        onClose();
    };

    // Filter logic
    const filteredSpaces = spaces.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Get folders/lists for selected space
    const spaceFolders = folders.filter(f => f.spaceId === selectedSpaceId);
    const spaceLists = lists.filter(l => l.spaceId === selectedSpaceId && !l.folderId);

    // Get lists for selected folder
    const folderLists = lists.filter(l => l.folderId === selectedFolderId);

    const resetSelection = () => {
        if (selectedFolderId) {
            setSelectedFolderId(null);
        } else {
            setSelectedSpaceId(null);
        }
    };

    const renderContent = () => {
        // Step 1: Select Space
        if (!selectedSpaceId) {
            return (
                <div className="move-modal-list">
                    <div className="move-modal-header-text">Select Space</div>
                    {filteredSpaces.map(space => (
                        <div
                            key={space.id}
                            className="move-modal-item"
                            onClick={() => setSelectedSpaceId(space.id)}
                        >
                            <div className="move-item-icon" style={{ backgroundColor: space.color || '#888' }}>
                                <Layout size={16} />
                            </div>
                            <span className="move-item-name">{space.name}</span>
                            <ChevronRight size={16} className="move-item-chevron" />
                        </div>
                    ))}
                    {filteredSpaces.length === 0 && (
                        <div className="move-modal-empty">No spaces found</div>
                    )}
                </div>
            );
        }

        // Step 2: Select Folder or List (in Space)
        if (!selectedFolderId) {
            return (
                <div className="move-modal-list">
                    <div className="move-modal-header-text">Select Folder or List</div>

                    {/* Folders in Space */}
                    {spaceFolders.map(folder => (
                        <div
                            key={folder.id}
                            className="move-modal-item"
                            onClick={() => setSelectedFolderId(folder.id)}
                        >
                            <div className="move-item-icon folder-icon">
                                <Folder size={16} />
                            </div>
                            <span className="move-item-name">{folder.name}</span>
                            <ChevronRight size={16} className="move-item-chevron" />
                        </div>
                    ))}

                    {/* Lists in Space (no folder) */}
                    {spaceLists.map(list => (
                        <div
                            key={list.id}
                            className="move-modal-item"
                            onClick={() => handleMove(selectedSpaceId, list.id)}
                        >
                            <div className="move-item-icon list-icon" style={{ color: list.color }}>
                                <List size={16} />
                            </div>
                            <span className="move-item-name">{list.name}</span>
                            {task.listId === list.id && <Check size={14} className="current-check" />}
                        </div>
                    ))}

                    {spaceFolders.length === 0 && spaceLists.length === 0 && (
                        <div className="move-modal-empty">No folders or lists in this space</div>
                    )}
                </div>
            );
        }

        // Step 3: Select List (in Folder)
        return (
            <div className="move-modal-list">
                <div className="move-modal-header-text">Select List</div>
                {folderLists.map(list => (
                    <div
                        key={list.id}
                        className="move-modal-item"
                        onClick={() => handleMove(selectedSpaceId, list.id)}
                    >
                        <div className="move-item-icon list-icon" style={{ color: list.color }}>
                            <List size={16} />
                        </div>
                        <span className="move-item-name">{list.name}</span>
                        {task.listId === list.id && <Check size={14} className="current-check" />}
                    </div>
                ))}
                {folderLists.length === 0 && (
                    <div className="move-modal-empty">No lists in this folder</div>
                )}
            </div>
        );
    };

    return createPortal(
        <div className="move-task-modal-overlay" onClick={onClose}>
            <div className="move-task-modal" onClick={e => e.stopPropagation()}>
                <div className="move-modal-header">
                    <div className="move-modal-title">
                        {selectedSpaceId && (
                            <button className="move-back-btn" onClick={resetSelection}>
                                <ArrowLeft size={16} />
                            </button>
                        )}
                        <span>Move Task</span>
                    </div>
                    <button className="move-close-btn" onClick={onClose}>
                        <X size={18} />
                    </button>
                </div>

                <div className="move-modal-search">
                    <Search size={16} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        autoFocus
                    />
                </div>

                <div className="move-modal-content">
                    {renderContent()}
                </div>
            </div>
        </div>,
        document.body
    );
};

export default MoveTaskModal;
