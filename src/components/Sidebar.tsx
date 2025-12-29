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
    Folder,
    Video
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
    'hash': Hash,
    'clips': Video
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
        updateList,
        sidebarCollapsed,
        toggleSidebar,
        dashboards,
        currentDashboardId,
        setCurrentDashboardId,
        updateDashboard,
        deleteDashboard
    } = useAppStore();

    const [isCreateSpaceOpen, setIsCreateSpaceOpen] = React.useState(false);
    const [editingSpace, setEditingSpace] = React.useState<any>(null);
    const [editingFolder, setEditingFolder] = React.useState<any>(null);
    const [editingList, setEditingList] = React.useState<any>(null);
    const [renamingDashboardId, setRenamingDashboardId] = React.useState<string | null>(null);
    const [dashboardNewName, setDashboardNewName] = React.useState('');
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
        setCurrentView('space_overview');
    };

    const navItems = [
        { id: 'home', icon: Home, label: 'Home' },
        { id: 'inbox', icon: Inbox, label: 'Inbox' },
        { id: 'dashboards', icon: BarChart2, label: 'Dashboards' },
        { id: 'docs', icon: FileText, label: 'Docs' },
        { id: 'clips', icon: Video, label: 'Clips' },
        { id: 'timesheet', icon: Clock, label: 'Timesheets' },
    ];

    const renderIcon = (iconName: string, size = 18, color?: string) => {
        const IconComponent = IconMap[iconName] || StarIcon;
        return <IconComponent size={size} color={color} />;
    };

    return (
        <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
            <div className="workspace-selector">
                <div className="workspace-info">
                    <div className="workspace-avatar">M</div>
                    {!sidebarCollapsed && <span>My Workspace</span>}
                </div>
                <button className="sidebar-toggle-btn" onClick={toggleSidebar}>
                    {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                </button>
            </div>

            <nav className="main-nav">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const currentDash = dashboards.find(d => d.id === currentDashboardId);
                    const isGlobalDashboard = item.id === 'dashboards' &&
                        currentView === 'dashboards' &&
                        (!currentDashboardId || (!currentDash?.spaceId && !currentDash?.listId));

                    const isActive = item.id === 'dashboards' ? isGlobalDashboard : currentView === item.id;

                    return (
                        <a
                            key={item.id}
                            href="#"
                            className={`nav-item ${isActive ? 'active' : ''}`}
                            onClick={(e) => {
                                e.preventDefault();
                                setCurrentView(item.id as any);
                                if (item.id === 'dashboards') {
                                    setCurrentDashboardId(null);
                                }
                            }}
                        >
                            <Icon size={18} />
                            {!sidebarCollapsed && <span>{item.label}</span>}
                        </a>
                    );
                })}
            </nav>

            <div className="sidebar-section">
                <div className="section-header">
                    {!sidebarCollapsed && <span>SPACES</span>}
                    <button className="add-btn" onClick={() => setIsCreateSpaceOpen(true)}><Plus size={14} /></button>
                </div>
                <div className="spaces-list">
                    <a
                        href="#"
                        className={`nav-item space-item ${currentSpaceId === 'everything' ? 'active' : ''}`}
                        onClick={(e) => {
                            e.preventDefault();
                            setCurrentSpaceId('everything');
                            setCurrentView('space_overview');
                            setCurrentListId(null);
                        }}
                    >
                        <div className="expand-icon-wrapper invisible">
                            <ChevronRight size={14} />
                        </div>
                        <div className="space-icon star-icon">
                            <StarIcon size={14} />
                        </div>
                        {!sidebarCollapsed && <span>Everything</span>}
                    </a>

                    {spaces.map(space => {
                        const isExpanded = expandedSpaceIds.has(space.id);
                        return (
                            <div key={space.id} className="space-item-container">
                                <div
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
                                        { label: 'Delete', icon: <Trash2 size={14} />, onClick: () => deleteSpace(space.id), danger: true },
                                    ])}
                                >
                                    <div
                                        className="expand-icon-wrapper"
                                        onClick={(e) => toggleSpace(e, space.id)}
                                    >
                                        <ChevronRight size={14} className={`expand-icon ${isExpanded ? 'expanded' : ''}`} />
                                    </div>
                                    <div className="space-icon" style={{
                                        color: space.color || '#64748b',
                                        background: `${space.color || '#64748b'}20`
                                    }}>
                                        {renderIcon(space.icon || 'star', 14, space.color || '#64748b')}
                                    </div>
                                    {!sidebarCollapsed && <span className="space-name">{space.name}</span>}
                                </div>

                                {isExpanded && !sidebarCollapsed && (
                                    <div className="space-children">
                                        {folders.filter(f => f.spaceId === space.id).map(folder => {
                                            const isFolderExpanded = expandedFolderIds.has(folder.id);
                                            return (
                                                <div key={folder.id} className="folder-container">
                                                    <div
                                                        className="nav-item folder-item"
                                                        onClick={(e) => toggleFolder(e, folder.id)}
                                                        onContextMenu={(e) => showContextMenu(e, [
                                                            { label: 'Create List', icon: <Plus size={14} />, onClick: () => { setCreateListSpaceId(space.id); setCreateListFolderId(folder.id); } },
                                                            { label: 'Rename', icon: <Edit2 size={14} />, onClick: () => setEditingFolder(folder) },
                                                            { label: 'Delete', icon: <Trash2 size={14} />, onClick: () => deleteFolder(folder.id), danger: true },
                                                        ])}
                                                    >
                                                        <div className="expand-icon-wrapper">
                                                            <ChevronRight size={14} className={`expand-icon ${isFolderExpanded ? 'expanded' : ''}`} />
                                                        </div>
                                                        <Folder size={14} className="folder-icon" />
                                                        <span>{folder.name}</span>
                                                    </div>
                                                    {isFolderExpanded && (
                                                        <div className="folder-children">
                                                            {lists.filter(l => l.folderId === folder.id).map(list => (
                                                                <React.Fragment key={list.id}>
                                                                    <a
                                                                        href="#"
                                                                        className={`nav-item list-item ${currentListId === list.id ? 'active' : ''}`}
                                                                        onClick={(e) => {
                                                                            e.preventDefault();
                                                                            setCurrentListId(list.id);
                                                                            if (!['list', 'kanban', 'calendar', 'gantt'].includes(currentView)) {
                                                                                setCurrentView('list');
                                                                            }
                                                                        }}
                                                                        onContextMenu={(e) => showContextMenu(e, [
                                                                            { label: 'Rename', icon: <Edit2 size={14} />, onClick: () => setEditingList({ ...list, id: list.id, spaceId: space.id }) },
                                                                            { label: 'Delete', icon: <Trash2 size={14} />, onClick: () => deleteList(list.id), danger: true },
                                                                        ])}
                                                                    >
                                                                        <div className="list-icon-wrapper">
                                                                            {list.icon ? renderIcon(list.icon, 14, list.color || space.color || undefined) : (
                                                                                <div className="list-dot" style={{ backgroundColor: list.color || space.color || '#64748b' }}></div>
                                                                            )}
                                                                        </div>
                                                                        <span>{list.name}</span>
                                                                    </a>
                                                                    {dashboards.filter(d => d.listId === list.id).map(dash => (
                                                                        <a
                                                                            key={dash.id}
                                                                            href="#"
                                                                            className={`nav-item dashboard-sub-item ${currentDashboardId === dash.id ? 'active' : ''}`}
                                                                            onClick={(e) => {
                                                                                e.preventDefault();
                                                                                setCurrentSpaceId(space.id);
                                                                                setCurrentListId(list.id);
                                                                                setCurrentDashboardId(dash.id);
                                                                                setCurrentView('dashboards');
                                                                            }}
                                                                            onContextMenu={(e) => showContextMenu(e, [
                                                                                { label: 'Rename', icon: <Edit2 size={14} />, onClick: () => { setRenamingDashboardId(dash.id); setDashboardNewName(dash.name); } },
                                                                                { label: 'Delete', icon: <Trash2 size={14} />, onClick: () => deleteDashboard(dash.id), danger: true },
                                                                            ])}
                                                                        >
                                                                            <div className="list-icon-wrapper" style={{ paddingLeft: '12px' }}>
                                                                                <BarChart2 size={12} />
                                                                            </div>
                                                                            {renamingDashboardId === dash.id ? (
                                                                                <input
                                                                                    type="text"
                                                                                    value={dashboardNewName}
                                                                                    onChange={(e) => setDashboardNewName(e.target.value)}
                                                                                    onKeyDown={(e) => {
                                                                                        if (e.key === 'Enter') {
                                                                                            updateDashboard(dash.id, { name: dashboardNewName });
                                                                                            setRenamingDashboardId(null);
                                                                                        }
                                                                                        if (e.key === 'Escape') setRenamingDashboardId(null);
                                                                                        e.stopPropagation();
                                                                                    }}
                                                                                    onBlur={() => {
                                                                                        if (dashboardNewName.trim()) {
                                                                                            updateDashboard(dash.id, { name: dashboardNewName });
                                                                                        }
                                                                                        setRenamingDashboardId(null);
                                                                                    }}
                                                                                    onClick={(e) => e.stopPropagation()}
                                                                                    autoFocus
                                                                                    className="sidebar-rename-input"
                                                                                />
                                                                            ) : (
                                                                                <span>{dash.name}</span>
                                                                            )}
                                                                        </a>
                                                                    ))}
                                                                </React.Fragment>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}

                                        {lists.filter(l => l.spaceId === space.id && !l.folderId).map(list => (
                                            <React.Fragment key={list.id}>
                                                <a
                                                    href="#"
                                                    className={`nav-item list-item ${currentListId === list.id ? 'active' : ''}`}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        setCurrentListId(list.id);
                                                        if (!['list', 'kanban', 'calendar', 'gantt'].includes(currentView)) {
                                                            setCurrentView('list');
                                                        }
                                                    }}
                                                    onContextMenu={(e) => showContextMenu(e, [
                                                        { label: 'Rename', icon: <Edit2 size={14} />, onClick: () => setEditingList({ ...list, id: list.id, spaceId: space.id }) },
                                                        { label: 'Delete', icon: <Trash2 size={14} />, onClick: () => deleteList(list.id), danger: true },
                                                    ])}
                                                >
                                                    <div className="list-icon-wrapper">
                                                        {list.icon ? renderIcon(list.icon, 14, list.color || space.color || undefined) : <ListIcon size={14} color={list.color || space.color || undefined} />}
                                                    </div>
                                                    <span>{list.name}</span>
                                                </a>
                                                {dashboards.filter(d => d.listId === list.id).map(dash => (
                                                    <a
                                                        key={dash.id}
                                                        href="#"
                                                        className={`nav-item dashboard-sub-item ${currentDashboardId === dash.id ? 'active' : ''}`}
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            setCurrentSpaceId(space.id);
                                                            setCurrentListId(list.id);
                                                            setCurrentDashboardId(dash.id);
                                                            setCurrentView('dashboards');
                                                        }}
                                                        onContextMenu={(e) => showContextMenu(e, [
                                                            { label: 'Rename', icon: <Edit2 size={14} />, onClick: () => { setRenamingDashboardId(dash.id); setDashboardNewName(dash.name); } },
                                                            { label: 'Delete', icon: <Trash2 size={14} />, onClick: () => deleteDashboard(dash.id), danger: true },
                                                        ])}
                                                    >
                                                        <div className="list-icon-wrapper" style={{ paddingLeft: '12px' }}>
                                                            <BarChart2 size={12} />
                                                        </div>
                                                        {renamingDashboardId === dash.id ? (
                                                            <input
                                                                type="text"
                                                                value={dashboardNewName}
                                                                onChange={(e) => setDashboardNewName(e.target.value)}
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter') {
                                                                        updateDashboard(dash.id, { name: dashboardNewName });
                                                                        setRenamingDashboardId(null);
                                                                    }
                                                                    if (e.key === 'Escape') setRenamingDashboardId(null);
                                                                    e.stopPropagation();
                                                                }}
                                                                onBlur={() => {
                                                                    if (dashboardNewName.trim()) {
                                                                        updateDashboard(dash.id, { name: dashboardNewName });
                                                                    }
                                                                    setRenamingDashboardId(null);
                                                                }}
                                                                onClick={(e) => e.stopPropagation()}
                                                                autoFocus
                                                                className="sidebar-rename-input"
                                                            />
                                                        ) : (
                                                            <span>{dash.name}</span>
                                                        )}
                                                    </a>
                                                ))}
                                            </React.Fragment>
                                        ))}

                                        {dashboards.filter(d => d.spaceId === space.id && !d.listId).map(dash => (
                                            <a
                                                key={dash.id}
                                                href="#"
                                                className={`nav-item dashboard-sub-item ${currentDashboardId === dash.id ? 'active' : ''}`}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setCurrentSpaceId(space.id);
                                                    setCurrentListId(null);
                                                    setCurrentDashboardId(dash.id);
                                                    setCurrentView('dashboards');
                                                }}
                                                onContextMenu={(e) => showContextMenu(e, [
                                                    { label: 'Rename', icon: <Edit2 size={14} />, onClick: () => { setRenamingDashboardId(dash.id); setDashboardNewName(dash.name); } },
                                                    { label: 'Delete', icon: <Trash2 size={14} />, onClick: () => deleteDashboard(dash.id), danger: true },
                                                ])}
                                            >
                                                <div className="list-icon-wrapper">
                                                    <BarChart2 size={14} />
                                                </div>
                                                {renamingDashboardId === dash.id ? (
                                                    <input
                                                        type="text"
                                                        value={dashboardNewName}
                                                        onChange={(e) => setDashboardNewName(e.target.value)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                updateDashboard(dash.id, { name: dashboardNewName });
                                                                setRenamingDashboardId(null);
                                                            }
                                                            if (e.key === 'Escape') setRenamingDashboardId(null);
                                                            e.stopPropagation();
                                                        }}
                                                        onBlur={() => {
                                                            if (dashboardNewName.trim()) {
                                                                updateDashboard(dash.id, { name: dashboardNewName });
                                                            }
                                                            setRenamingDashboardId(null);
                                                        }}
                                                        onClick={(e) => e.stopPropagation()}
                                                        autoFocus
                                                        className="sidebar-rename-input"
                                                    />
                                                ) : (
                                                    <span>{dash.name}</span>
                                                )}
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
                {!sidebarCollapsed && (
                    <a href="#" className="nav-item create-space-btn" onClick={(e) => { e.preventDefault(); setIsCreateSpaceOpen(true); }}>
                        <Plus size={14} />
                        <span>New Space</span>
                    </a>
                )}
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
                    editingFolder={editingFolder}
                    onUpdate={updateFolder}
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
