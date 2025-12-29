import React, { useState } from 'react';
import {
    List as ListIcon,
    Calendar,
    LayoutGrid,
    FileText,
    Table,
    BarChart3,
    Activity,
    Users,
    Lightbulb,
    Kanban,
    GanttChart,
    FormInput,
    Clock,
    Network,
    Search,
    X
} from 'lucide-react';
import '../styles/ViewSelectorModal.css';
import type { ViewType } from '../types';

interface ViewOption {
    id: ViewType;
    name: string;
    description: string;
    icon: React.ElementType;
    category: 'popular' | 'more';
}

const VIEW_OPTIONS: ViewOption[] = [
    {
        id: 'list',
        name: 'List',
        description: 'Track tasks, bugs, people & more',
        icon: ListIcon,
        category: 'popular'
    },
    {
        id: 'gantt',
        name: 'Gantt',
        description: 'Plan dependencies & time',
        icon: GanttChart,
        category: 'popular'
    },
    {
        id: 'calendar',
        name: 'Calendar',
        description: 'Plan, schedule, & delegate',
        icon: Calendar,
        category: 'popular'
    },
    {
        id: 'docs',
        name: 'Doc',
        description: 'Collaborate & document anything',
        icon: FileText,
        category: 'popular'
    },
    {
        id: 'kanban',
        name: 'Board - Kanban',
        description: 'Move tasks between columns',
        icon: Kanban,
        category: 'popular'
    },
    {
        id: 'forms',
        name: 'Form',
        description: 'Collect, track, & report data',
        icon: FormInput,
        category: 'popular'
    },
    {
        id: 'list',
        name: 'Table',
        description: 'Structured table format',
        icon: Table,
        category: 'more'
    },
    {
        id: 'dashboards',
        name: 'Dashboard',
        description: 'Track metrics & insights',
        icon: BarChart3,
        category: 'more'
    },
    {
        id: 'list',
        name: 'Timeline',
        description: 'See tasks by start & due date',
        icon: Clock,
        category: 'more'
    },
    {
        id: 'pulse',
        name: 'Activity',
        description: 'Real-time activity feed',
        icon: Activity,
        category: 'more'
    },
    {
        id: 'list',
        name: 'Workload',
        description: 'Visualize team capacity',
        icon: LayoutGrid,
        category: 'more'
    },
    {
        id: 'whiteboards',
        name: 'Whiteboard',
        description: 'Visualize & brainstorm ideas',
        icon: Lightbulb,
        category: 'more'
    },
    {
        id: 'teams',
        name: 'Team',
        description: 'Monitor work being done',
        icon: Users,
        category: 'more'
    },
    {
        id: 'list',
        name: 'Mind Map',
        description: 'Visual brainstorming of ideas',
        icon: Network,
        category: 'more'
    }
];

interface ViewSelectorModalProps {
    onClose: () => void;
    onSelectView: (viewType: ViewType) => void;
}

const ViewSelectorModal: React.FC<ViewSelectorModalProps> = ({ onClose, onSelectView }) => {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredViews = VIEW_OPTIONS.filter(view =>
        view.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        view.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const popularViews = filteredViews.filter(v => v.category === 'popular');
    const moreViews = filteredViews.filter(v => v.category === 'more');

    const handleSelectView = (viewId: ViewType) => {
        onSelectView(viewId);
        onClose();
    };

    return (
        <>
            <div className="view-selector-overlay" onClick={onClose}></div>
            <div className="view-selector-modal">
                <div className="view-selector-search">
                    <Search size={16} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search views..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        autoFocus
                    />
                    <button className="close-btn" onClick={onClose}>
                        <X size={16} />
                    </button>
                </div>

                <div className="view-selector-content">
                    {popularViews.length > 0 && (
                        <div className="view-section">
                            <h3 className="view-section-title">Popular</h3>
                            <div className="view-grid">
                                {popularViews.map(view => {
                                    const Icon = view.icon;
                                    return (
                                        <button
                                            key={view.name}
                                            className="view-option"
                                            onClick={() => handleSelectView(view.id)}
                                        >
                                            <div className="view-icon">
                                                <Icon size={20} />
                                            </div>
                                            <div className="view-info">
                                                <div className="view-name">{view.name}</div>
                                                <div className="view-description">{view.description}</div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {moreViews.length > 0 && (
                        <div className="view-section">
                            <h3 className="view-section-title">More views</h3>
                            <div className="view-grid">
                                {moreViews.map(view => {
                                    const Icon = view.icon;
                                    return (
                                        <button
                                            key={view.name}
                                            className="view-option"
                                            onClick={() => handleSelectView(view.id)}
                                        >
                                            <div className="view-icon">
                                                <Icon size={20} />
                                            </div>
                                            <div className="view-info">
                                                <div className="view-name">{view.name}</div>
                                                <div className="view-description">{view.description}</div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                <div className="view-selector-footer">
                    <label className="view-option-checkbox">
                        <input type="checkbox" />
                        <span>Private view</span>
                    </label>
                    <label className="view-option-checkbox">
                        <input type="checkbox" />
                        <span>Pin view</span>
                    </label>
                </div>
            </div>
        </>
    );
};

export default ViewSelectorModal;
