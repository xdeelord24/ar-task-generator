import React from 'react';
import {
    Home,
    Inbox,
    FileText,
    BarChart2,
    Clock,
    Plus,
    ChevronRight,
    ChevronLeft,
    Settings,
    Edit2,
    Trash2,
    Star as StarIcon,
    Layout,
    Users,
    Lock,
    Briefcase,
    Code,
    GraduationCap,
    Music,
    Heart,
    Camera,
    Globe,
    Zap,
    Cloud,
    Moon,
    Book,
    Flag,
    Target,
    Coffee,
    List as ListIcon,
    CheckSquare,
    Calendar,
    Hash,
    Folder
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import ContextMenu, { useContextMenu } from './ContextMenu';
import CreateSpaceModal from './CreateSpaceModal';
import CreateListModal from './CreateListModal';
import CreateFolderModal from './CreateFolderModal';
import '../styles/Sidebar.css';

const IconMap: Record<string, any> = {
    'home': Home,
    'inbox': Inbox,
    'docs': FileText,
    'dashboards': BarChart2,
    'timesheet': Clock,
    'users': Users,
    'layout': Layout,
    'lock': Lock,
    'star': StarIcon,
    'briefcase': Briefcase,
    'code': Code,
    'graduation': GraduationCap,
    'book': Book,
    'globe': Globe,
    'zap': Zap,
    'cloud': Cloud,
    'moon': Moon,
    'flag': Flag,
    'target': Target,
    'coffee': Coffee,
    'heart': Heart,
    'music': Music,
    'camera': Camera,
    'list': ListIcon,
    'check-square': CheckSquare,
    'calendar': Calendar,
    'hash': Hash
};

const Sidebar: React.FC = () => {
    const {
        currentView,
        setCurrentView,
        spaces,
        folders,
        lists,
        currentSpaceId,
        setCurrentSpaceId,
        setCurrentListId,
        currentListId,
        deleteSpace,
        updateSpace,
        deleteFolder,
        updateFolder,
        deleteList,
        updateList
    } = useAppStore();
    const [isCreateSpaceOpen, setIsCreateSpaceOpen] = React.useState(false);
    const [editingSpace, setEditingSpace] = React.useState<any>(null);
    const [editingFolder, setEditingFolder] = React.useState<any>(null);
    const [editingList, setEditingList] = React.useState<any>(null);
    const [createListSpaceId, setCreateListSpaceId] = React.useState<string | null>(null);
    const [createListFolderId, setCreateListFolderId] = React.useState<string | null>(null);
    const [createFolderSpaceId, setCreateFolderSpaceId] = React.useState<string | null>(null);
    const [expandedSpaceIds, setExpandedSpaceIds] = React.useState<Set<string>>(new Set([currentSpaceId]));
    const [expandedFolderIds, setExpandedFolderIds] = React.useState<Set<string>>(new Set());
    const { showContextMenu, contextMenuProps, hideContextMenu } = useContextMenu();

    const toggleSpace = (e: React.MouseEvent, spaceId: string) => {
        e.stopPropagation();
        e.preventDefault();
        setExpandedSpaceIds(prev => {
            const next = new Set(prev);
            if (next.has(spaceId)) next.delete(spaceId);
            else next.add(spaceId);
            return next;
        });
    };

    const toggleFolder = (e: React.MouseEvent, folderId: string) => {
        e.stopPropagation();
        e.preventDefault();
        setExpandedFolderIds(prev => {
            const next = new Set(prev);
            if (next.has(folderId)) next.delete(folderId);
            else next.add(folderId);
            return next;
        });
    };

    const handleSpaceClick = (spaceId: string) => {
        setCurrentSpaceId(spaceId);
        setCurrentListId(null);
        setExpandedSpaceIds(prev => new Set(prev).add(spaceId));

        // Always go to Space Overview when clicking a space
        setCurrentView('space_overview');
    };

    const navItems = [
        { id: 'home', icon: Home, label: 'Home' },
        { id: 'inbox', icon: Inbox, label: 'Inbox' },
        { id: 'dashboards', icon: BarChart2, label: 'Dashboards' },
        { id: 'docs', icon: FileText, label: 'Docs' },
        { id: 'timesheet', icon: Clock, label: 'Timesheets' },
    ];

    const renderIcon = (iconName: string, size = 18, color?: string) => {
        const IconComponent = IconMap[iconName] || StarIcon;
        return <IconComponent size={size} color={color} />;
    };

    return (
        <aside className="sidebar">
            <div className="workspace-selector">
                <div className="workspace-info">
                    <div className="workspace-avatar">M</div>
                    <span>My Workspace</span>
                </div>
                <ChevronLeft size={16} />
            </div>

            <nav className="main-nav">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <a
                            key={item.id}
                            href="#"
                            className={`nav-item ${currentView === item.id ? 'active' : ''}`}
                            onClick={(e) => {
                                e.preventDefault();
                                setCurrentView(item.id as any);
                                setCurrentSpaceId('everything');
                                setCurrentListId(null);
                            }}
                        >
                            <Icon size={18} />
                            <span>{item.label}</span>
                        </a>
                    );
                })}
                <a href="#" className="nav-item">
                    <Plus size={18} />
                    <span>More</span>
                </a>
            </nav>

            <div className="sidebar-section">
                <div className="section-header">
                    <span>Favorites</span>
                    <ChevronRight size={14} />
                </div>
            </div>

            <div className="sidebar-section">
                <div className="section-header">
                    <span>Spaces</span>
                    <button className="add-btn" onClick={() => setIsCreateSpaceOpen(true)}><Plus size={14} /></button>
                </div>
                <div className="spaces-list">
                    {spaces.map(space => {
                        const isExpanded = expandedSpaceIds.has(space.id);
                        return (
                            <div key={space.id} className="space-item-container">
                                <a
                                    href="#"
                                    className={`nav-item space-item ${currentSpaceId === space.id ? 'active' : ''}`}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleSpaceClick(space.id);
                                    }}
                                    onContextMenu={(e) => showContextMenu(e, [
                                        { label: 'Create List', icon: <Plus size={14} />, onClick: () => setCreateListSpaceId(space.id) },
                                        { label: 'Create Folder', icon: <Folder size={14} />, onClick: () => setCreateFolderSpaceId(space.id) },
                                        { label: 'Space Settings', icon: <Settings size={14} />, onClick: () => setEditingSpace(space) },
                                        { label: 'Rename', icon: <Edit2 size={14} />, onClick: () => setEditingSpace(space) },
                                        { label: 'Duplicate', icon: <StarIcon size={14} />, onClick: () => console.log('Duplicate', space.name) },
                                        { label: 'Delete', icon: <Trash2 size={14} />, onClick: () => deleteSpace(space.id), danger: true },
                                    ])}
                                >
                                    <div className="expand-icon-wrapper" onClick={(e) => toggleSpace(e, space.id)}>
                                        <ChevronRight size={14} className={`expand-icon ${isExpanded ? 'expanded' : ''}`} />
                                    </div>
                                    <div className="space-icon" style={{
                                        backgroundColor: space.color ? `${space.color}20` : '#f1f5f9',
                                        width: '22px',
                                        height: '22px',
                                        borderRadius: '6px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: space.color || '#64748b'
                                    }}>
                                        {renderIcon(space.icon || 'star', 14, space.color || '#64748b')}
                                    </div>
                                    <span style={{ fontWeight: currentSpaceId === space.id ? 600 : 400 }}>{space.name}</span>
                                </a>
                                {isExpanded && (
                                    <div className="space-lists">
                                        {/* Render Folders */}
                                        {folders.filter(f => f.spaceId === space.id).map(folder => {
                                            const isFolderExpanded = expandedFolderIds.has(folder.id);
                                            return (
                                                <div key={folder.id} className="folder-item-container">
                                                    <a
                                                        href="#"
                                                        className="nav-item folder-item"
                                                        style={{ paddingLeft: '24px' }}
                                                        onClick={(e) => toggleFolder(e, folder.id)}
                                                        onContextMenu={(e) => showContextMenu(e, [
                                                            { label: 'Create List', icon: <Plus size={14} />, onClick: () => { setCreateListSpaceId(space.id); setCreateListFolderId(folder.id); } },
                                                            { label: 'Rename', icon: <Edit2 size={14} />, onClick: () => setEditingFolder(folder) },
                                                            { label: 'Delete', icon: <Trash2 size={14} />, onClick: () => deleteFolder(folder.id), danger: true },
                                                        ])}
                                                    >
                                                        <div className="expand-icon-wrapper" style={{ marginRight: '4px' }}>
                                                            <ChevronRight size={14} className={`expand-icon ${isFolderExpanded ? 'expanded' : ''}`} />
                                                        </div>
                                                        <Folder size={14} style={{ marginRight: '8px', color: '#64748b' }} />
                                                        <span>{folder.name}</span>
                                                    </a>
                                                    {isFolderExpanded && (
                                                        <div className="folder-lists">
                                                            {lists.filter(l => l.folderId === folder.id).map(list => (
                                                                <a
                                                                    key={list.id}
                                                                    href="#"
                                                                    className={`nav-item list-item ${currentListId === list.id ? 'active' : ''}`}
                                                                    style={{ paddingLeft: '48px' }}
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        setCurrentListId(list.id);
                                                                        const taskViews = ['list', 'kanban', 'calendar', 'gantt'];
                                                                        if (!taskViews.includes(currentView)) {
                                                                            setCurrentView('list');
                                                                        }
                                                                    }}
                                                                    onContextMenu={(e) => showContextMenu(e, [
                                                                        { label: 'Rename', icon: <Edit2 size={14} />, onClick: () => setEditingList({ ...list, id: list.id, spaceId: space.id }) },
                                                                        { label: 'Delete', icon: <Trash2 size={14} />, onClick: () => deleteList(list.id), danger: true },
                                                                    ])}
                                                                >
                                                                    <div style={{ marginRight: '8px', display: 'flex', alignItems: 'center' }}>
                                                                        {list.icon ? renderIcon(list.icon, 14, list.color || space.color || '#64748b') : (
                                                                            <div className="list-dot" style={{ backgroundColor: list.color || space.color || '#64748b' }}></div>
                                                                        )}
                                                                    </div>
                                                                    <span style={{ fontWeight: currentListId === list.id ? 600 : 400 }}>{list.name}</span>
                                                                </a>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}

                                        {/* Render Lists NOT in folders */}
                                        {lists.filter(l => l.spaceId === space.id && !l.folderId).map(list => (
                                            <a
                                                key={list.id}
                                                href="#"
                                                className={`nav-item list-item ${currentListId === list.id ? 'active' : ''}`}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setCurrentListId(list.id);
                                                    const taskViews = ['list', 'kanban', 'calendar', 'gantt'];
                                                    if (!taskViews.includes(currentView)) {
                                                        setCurrentView('list');
                                                    }
                                                }}
                                                onContextMenu={(e) => showContextMenu(e, [
                                                    { label: 'Rename', icon: <Edit2 size={14} />, onClick: () => setEditingList({ ...list, id: list.id, spaceId: space.id }) },
                                                    { label: 'Delete', icon: <Trash2 size={14} />, onClick: () => deleteList(list.id), danger: true },
                                                ])}
                                            >
                                                <div style={{ marginLeft: '4px', marginRight: '8px', display: 'flex', alignItems: 'center' }}>
                                                    {list.icon ? renderIcon(list.icon, 14, list.color || space.color || '#64748b') : (
                                                        <div className="list-dot" style={{ backgroundColor: list.color || space.color || '#64748b' }}></div>
                                                    )}
                                                </div>
                                                <span style={{ fontWeight: currentListId === list.id ? 600 : 400 }}>{list.name}</span>
                                            </a>
                                        ))}

                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <a href="#" className="nav-item add-list-btn" onClick={(e) => {
                                                e.preventDefault();
                                                setCreateListSpaceId(space.id);
                                                setCreateListFolderId(null);
                                            }}>
                                                <Plus size={14} />
                                                <span>Add List</span>
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
                <a href="#" className="nav-item create-space" onClick={(e) => { e.preventDefault(); setIsCreateSpaceOpen(true); }}>
                    <Plus size={18} />
                    <span>Create Space</span>
                </a>
            </div>

            <div className="sidebar-footer">
                <a href="#">Invite</a>
                <a href="#">Help</a>
            </div>

            {isCreateSpaceOpen && <CreateSpaceModal onClose={() => setIsCreateSpaceOpen(false)} />}
            {editingSpace && (
                <CreateSpaceModal
                    editingSpace={editingSpace}
                    onUpdate={updateSpace}
                    onClose={() => setEditingSpace(null)}
                />
            )}
            {editingList && (
                <CreateListModal
                    spaceId={editingList.spaceId}
                    editingList={editingList}
                    onUpdate={updateList}
                    onClose={() => setEditingList(null)}
                />
            )}
            {createListSpaceId && (
                <CreateListModal
                    spaceId={createListSpaceId}
                    folderId={createListFolderId || undefined}
                    onClose={() => { setCreateListSpaceId(null); setCreateListFolderId(null); }}
                />
            )}
            {createFolderSpaceId && (
                <CreateFolderModal
                    spaceId={createFolderSpaceId}
                    onClose={() => setCreateFolderSpaceId(null)}
                />
            )}
            {editingFolder && (
                <CreateFolderModal
                    spaceId={editingFolder.spaceId}
                    editingFolder={editingFolder} // Pass editing folder
                    onUpdate={updateFolder} // Pass update handler
                    onClose={() => setEditingFolder(null)}
                />
            )}
            {contextMenuProps.visible && (
                <ContextMenu
                    x={contextMenuProps.x}
                    y={contextMenuProps.y}
                    items={contextMenuProps.items}
                    onClose={hideContextMenu}
                />
            )}
        </aside>
    );
};

export default Sidebar;
