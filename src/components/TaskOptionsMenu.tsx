import React from 'react';
import { createPortal } from 'react-dom';
import {
    Link2,
    Copy,
    ExternalLink,
    Edit2,
    Repeat,
    Box,
    Copy as DuplicateIcon,
    Clock,
    BellOff,
    Mail,
    Plus,
    GitMerge,
    ArrowRight,
    Play,
    Link as LinkIcon,
    Archive,
    Trash2,
    Shield,
    ChevronRight
} from 'lucide-react';
import RelationshipMenu from './RelationshipMenu';
import '../styles/TaskOptionsMenu.css';

interface TaskOptionsMenuProps {
    onClose: () => void;
    onRename: () => void;
    onDuplicate: () => void;
    onArchive: () => void;
    onDelete: () => void;
    onConvertToDoc?: () => void;
    onStartTimer?: () => void;
    onMove?: () => void;
    taskId: string;
    triggerElement?: HTMLElement | null;
}

const TaskOptionsMenu: React.FC<TaskOptionsMenuProps> = ({
    onClose,
    onRename,
    onDuplicate,
    onArchive,
    onDelete,
    onConvertToDoc,
    onStartTimer,
    onMove,
    taskId,
    triggerElement
}) => {
    const [isRelationshipMenuOpen, setIsRelationshipMenuOpen] = React.useState(false);
    const menuRef = React.useRef<HTMLDivElement>(null);
    const [style, setStyle] = React.useState<React.CSSProperties>({ visibility: 'hidden' });

    React.useLayoutEffect(() => {
        if (!menuRef.current) return;

        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;
        const menuWidth = 280;
        const menuHeight = menuRef.current.scrollHeight;

        if (triggerElement) {
            const rect = triggerElement.getBoundingClientRect();
            const newStyle: React.CSSProperties = {
                position: 'fixed',
                zIndex: 10000,
                width: `${menuWidth}px`,
                visibility: 'visible'
            };

            // Horizontal positioning: align right edge with trigger's right edge
            let left = rect.right - menuWidth;
            if (left < 10) left = 10;
            if (left + menuWidth > viewportWidth - 10) left = viewportWidth - menuWidth - 10;

            newStyle.left = `${left}px`;

            // Vertical positioning
            if (rect.bottom + menuHeight + 10 > viewportHeight && rect.top > menuHeight + 10) {
                // Open upwards
                newStyle.bottom = `${viewportHeight - rect.top + 8}px`;
                newStyle.top = 'auto';
            } else {
                // Open downwards
                newStyle.top = `${rect.bottom + 8}px`;
            }

            setStyle(newStyle);
        } else {
            // Legacy/Fallback: relative to parent
            const rect = menuRef.current.getBoundingClientRect();
            const newStyle: React.CSSProperties = { visibility: 'visible' };

            if (rect.bottom > viewportHeight) {
                newStyle.top = 'auto';
                newStyle.bottom = '100%';
                newStyle.marginTop = '0';
                newStyle.marginBottom = '8px';
            }

            if (rect.right > viewportWidth) {
                newStyle.right = '0';
                newStyle.left = 'auto';
            } else if (rect.left < 0) {
                newStyle.left = '0';
                newStyle.right = 'auto';
            }

            setStyle(newStyle);
        }
    }, [triggerElement, isRelationshipMenuOpen]);

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
        onClose();
    };

    const handleCopyID = () => {
        navigator.clipboard.writeText(taskId);
        alert('Task ID copied to clipboard!');
        onClose();
    };

    const handleNewTab = () => {
        window.open(window.location.href, '_blank');
        onClose();
    };

    const content = (
        <div
            ref={menuRef}
            className="task-options-menu"
            style={style}
            onClick={e => e.stopPropagation()}
        >
            <div className="menu-header-row">
                <button onClick={handleCopyLink}>
                    <Link2 size={14} />
                    <span>Copy link</span>
                </button>
                <div className="menu-divider-v"></div>
                <button onClick={handleCopyID}>
                    <Copy size={14} />
                    <span>Copy ID</span>
                </button>
                <div className="menu-divider-v"></div>
                <button onClick={handleNewTab}>
                    <ExternalLink size={14} />
                    <span>New tab</span>
                </button>
            </div>

            <div className="menu-main-content">
                <button className="menu-item" onClick={onRename}>
                    <Edit2 size={16} />
                    <span>Rename</span>
                </button>

                <button className="menu-item" onClick={onConvertToDoc}>
                    <Repeat size={16} />
                    <span>Convert to Doc</span>
                    <ChevronRight size={14} className="chevron-right" />
                </button>

                <button className="menu-item">
                    <Box size={16} />
                    <span>Task Type</span>
                    <ChevronRight size={14} className="chevron-right" />
                </button>

                <button className="menu-item" onClick={onDuplicate}>
                    <DuplicateIcon size={16} />
                    <span>Duplicate</span>
                </button>

                <button className="menu-item">
                    <Clock size={16} />
                    <span>Remind me</span>
                </button>

                <button className="menu-item">
                    <BellOff size={16} />
                    <span>Unfollow task</span>
                </button>

                <button className="menu-item">
                    <Mail size={16} />
                    <span>Send email to task</span>
                </button>

                <button className="menu-item">
                    <Plus size={16} />
                    <span>Add To</span>
                    <ChevronRight size={14} className="chevron-right" />
                </button>

                <button className="menu-item">
                    <GitMerge size={16} />
                    <span>Merge</span>
                </button>

                <button className="menu-item" onClick={onMove}>
                    <ArrowRight size={16} />
                    <span>Move</span>
                </button>

                <button className="menu-item" onClick={onStartTimer}>
                    <Play size={16} />
                    <span>Start timer</span>
                </button>

                <div className="menu-divider-h"></div>

                <div className="menu-item-group" style={{ position: 'relative' }}>
                    <button
                        className={`menu-item ${isRelationshipMenuOpen ? 'active' : ''}`}
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsRelationshipMenuOpen(!isRelationshipMenuOpen);
                        }}
                    >
                        <LinkIcon size={16} />
                        <span>Dependencies</span>
                        <ChevronRight size={14} className={`chevron-right ${isRelationshipMenuOpen ? 'rotated' : ''}`} />
                    </button>
                    {isRelationshipMenuOpen && (
                        <RelationshipMenu
                            taskId={taskId}
                            onClose={() => setIsRelationshipMenuOpen(false)}
                            mode="list"
                            isModal={true}
                        />
                    )}
                </div>

                <button className="menu-item" onClick={onArchive}>
                    <Archive size={16} />
                    <span>Archive</span>
                </button>

                <button className="menu-item danger" onClick={onDelete}>
                    <Trash2 size={16} />
                    <span>Delete</span>
                </button>
            </div>

            <div className="menu-footer">
                <button className="btn-sharing">
                    <Shield size={16} />
                    <span>Sharing & Permissions</span>
                </button>
            </div>
        </div>
    );

    return triggerElement ? createPortal(content, document.body) : content;
};

export default TaskOptionsMenu;
