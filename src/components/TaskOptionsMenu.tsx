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

        if (triggerElement) {
            const rect = triggerElement.getBoundingClientRect();
            const menuWidth = menuRef.current.offsetWidth;
            const menuHeight = menuRef.current.offsetHeight;

            const newStyle: React.CSSProperties = {
                position: 'fixed',
                zIndex: 10000,
                width: `${menuWidth}px`,
                visibility: 'visible'
            };

            // Horizontal positioning: align right edge with trigger's right edge
            let left = rect.right - menuWidth;
            // If that pushes it off-screen to the left (unlikely for small menus), clamp it
            if (left < 10) left = 10;

            // If aligned left, check overflow right
            if (left + menuWidth > viewportWidth - 10) left = viewportWidth - menuWidth - 10;

            newStyle.left = `${left}px`;

            // Vertical positioning
            const spaceBelow = viewportHeight - rect.bottom;
            const spaceAbove = rect.top;

            if (spaceBelow >= menuHeight + 10) {
                // Fits below
                newStyle.top = `${rect.bottom + 8}px`;
            } else if (spaceAbove >= menuHeight + 10) {
                // Fits above
                newStyle.bottom = `${viewportHeight - rect.top + 8}px`;
                newStyle.top = 'auto';
            } else {
                // Fits nowhere? Clamp to largest space or bottom edge
                if (spaceBelow > spaceAbove) {
                    newStyle.top = `${rect.bottom + 8}px`;
                    // Could set max-height here: newStyle.maxHeight = spaceBelow - 20
                    newStyle.maxHeight = `${spaceBelow - 20}px`;
                    newStyle.overflowY = 'auto';
                } else {
                    newStyle.bottom = `${viewportHeight - rect.top + 8}px`;
                    newStyle.top = 'auto';
                    newStyle.maxHeight = `${spaceAbove - 20}px`;
                    newStyle.overflowY = 'auto';
                }
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
                    <Edit2 className="menu-icon" size={18} />
                    <span className="menu-label">Rename</span>
                </button>

                <button className="menu-item has-chevron" onClick={onConvertToDoc}>
                    <Repeat className="menu-icon" size={18} />
                    <span className="menu-label">Convert to Doc</span>
                    <ChevronRight size={14} className="chevron-right" />
                </button>

                <button className="menu-item has-chevron">
                    <Box className="menu-icon" size={18} />
                    <span className="menu-label">Task Type</span>
                    <ChevronRight size={14} className="chevron-right" />
                </button>

                <button className="menu-item" onClick={onDuplicate}>
                    <DuplicateIcon className="menu-icon" size={18} />
                    <span className="menu-label">Duplicate</span>
                </button>

                <button className="menu-item">
                    <Clock className="menu-icon" size={18} />
                    <span className="menu-label">Remind me</span>
                </button>

                <button className="menu-item">
                    <BellOff className="menu-icon" size={18} />
                    <span className="menu-label">Unfollow task</span>
                </button>

                <button className="menu-item">
                    <Mail className="menu-icon" size={18} />
                    <span className="menu-label">Send email to task</span>
                </button>

                <button className="menu-item has-chevron">
                    <Plus className="menu-icon" size={18} />
                    <span className="menu-label">Add To</span>
                    <ChevronRight size={14} className="chevron-right" />
                </button>

                <button className="menu-item">
                    <GitMerge className="menu-icon" size={18} />
                    <span className="menu-label">Merge</span>
                </button>

                <button className="menu-item" onClick={onMove}>
                    <ArrowRight className="menu-icon" size={18} />
                    <span className="menu-label">Move</span>
                </button>

                <button className="menu-item" onClick={onStartTimer}>
                    <Play className="menu-icon" size={18} />
                    <span className="menu-label">Start timer</span>
                </button>

                <div className="menu-divider-h"></div>

                <div className="menu-item-group" style={{ position: 'relative' }}>
                    <button
                        className={`menu-item has-chevron ${isRelationshipMenuOpen ? 'active' : ''}`}
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsRelationshipMenuOpen(!isRelationshipMenuOpen);
                        }}
                    >
                        <LinkIcon className="menu-icon" size={18} />
                        <span className="menu-label">Dependencies</span>
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
                    <Archive className="menu-icon" size={18} />
                    <span className="menu-label">Archive</span>
                </button>

                <button className="menu-item danger" onClick={onDelete}>
                    <Trash2 className="menu-icon" size={18} />
                    <span className="menu-label">Delete</span>
                </button>
            </div>

            <div className="menu-footer">
                <button className="btn-sharing">
                    <Shield size={20} />
                    <span>Sharing & Permissions</span>
                </button>
            </div>
        </div>
    );

    return triggerElement ? createPortal(content, document.body) : content;
};

export default TaskOptionsMenu;
