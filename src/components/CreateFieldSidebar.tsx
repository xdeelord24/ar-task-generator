import React from 'react';
import {
    X, Search, ChevronLeft, List, Type, Calendar, AlignLeft,
    Hash, Tag, CheckSquare, DollarSign, Globe, FunctionSquare,
    FileText, BarChart, Paperclip, Users, User, Settings2,
    Mail, Phone, LayoutGrid, Languages, Smile, MapPin,
    Star, ThumbsUp, PenTool, Layers, MousePointer2, ClipboardList, Shirt
} from 'lucide-react';
import '../styles/CreateFieldSidebar.css';

interface CreateFieldSidebarProps {
    onClose: () => void;
    onAddField: (field: { id: string; name: string; type: string }) => void;
}

const suggestedFields = [
    { id: 'objective-type', name: 'Objective Type', icon: List, color: '#10b981' },
    { id: 'responsible-member', name: 'Responsible Team Member', icon: User, color: '#ef4444' },
    { id: 'completion-criteria', name: 'Completion Criteria', icon: Type, color: '#a855f7' },
    { id: 'review-date', name: 'Review Date', icon: Calendar, color: '#92400e' },
];

const aiFields = [
    { id: 'summary', name: 'Summary', icon: FileText, color: '#8b5cf6' },
    { id: 'custom-text', name: 'Custom Text', icon: LayoutGrid, color: '#8b5cf6' },
    { id: 'custom-dropdown', name: 'Custom Dropdown', icon: List, color: '#8b5cf6' },
];

const allFields = [
    { id: 'dropdown', name: 'Dropdown', icon: List, color: '#10b981' },
    { id: 'text', name: 'Text', icon: Type, color: '#3b82f6' },
    { id: 'date', name: 'Date', icon: Calendar, color: '#f59e0b' },
    { id: 'textarea', name: 'Text area (Long Text)', icon: AlignLeft, color: '#3b82f6' },
    { id: 'number', name: 'Number', icon: Hash, color: '#10b981' },
    { id: 'labels', name: 'Labels', icon: Tag, color: '#10b981' },
    { id: 'checkbox', name: 'Checkbox', icon: CheckSquare, color: '#ef4444' },
    { id: 'money', name: 'Money', icon: DollarSign, color: '#10b981' },
    { id: 'website', name: 'Website', icon: Globe, color: '#ef4444' },
    { id: 'formula', name: 'Formula', icon: FunctionSquare, color: '#10b981' },
    { id: 'progress-updates', name: 'Progress Updates', icon: BarChart, color: '#8b5cf6' },
    { id: 'files', name: 'Files', icon: Paperclip, color: '#8b5cf6' },
    { id: 'relationship', name: 'Relationship', icon: Users, color: '#3b82f6' },
    { id: 'people', name: 'People', icon: User, color: '#ef4444' },
    { id: 'progress-auto', name: 'Progress (Auto)', icon: Settings2, color: '#8b5cf6' },
    { id: 'email', name: 'Email', icon: Mail, color: '#ef4444' },
    { id: 'phone', name: 'Phone', icon: Phone, color: '#ef4444' },
    { id: 'categorize', name: 'Categorize', icon: LayoutGrid, color: '#8b5cf6' },
    { id: 'translation', name: 'Translation', icon: Languages, color: '#8b5cf6' },
    { id: 'sentiment', name: 'Sentiment', icon: Smile, color: '#8b5cf6' },
    { id: 'tasks', name: 'Tasks', icon: LayoutGrid, color: '#3b82f6' },
    { id: 'location', name: 'Location', icon: MapPin, color: '#ef4444' },
    { id: 'progress-manual', name: 'Progress (Manual)', icon: Settings2, color: '#842000' },
    { id: 'rating', name: 'Rating', icon: Star, color: '#842000' },
    { id: 'voting', name: 'Voting', icon: ThumbsUp, color: '#8b5cf6' },
    { id: 'signature', name: 'Signature', icon: PenTool, color: '#10b981' },
    { id: 'rollup', name: 'Rollup', icon: Layers, color: '#3b82f6' },
    { id: 'button', name: 'Button', icon: MousePointer2, color: '#8b5cf6' },
    { id: 'action-items', name: 'Action Items', icon: ClipboardList, color: '#8b5cf6' },
    { id: 't-shirt-size', name: 'T-shirt Size', icon: Shirt, color: '#8b5cf6' },
];

const CreateFieldSidebar: React.FC<CreateFieldSidebarProps> = ({ onClose, onAddField }) => {
    const [searchQuery, setSearchQuery] = React.useState('');

    const renderFieldItem = (field: any) => (
        <button
            key={field.id}
            className="field-type-item"
            onClick={() => onAddField({ id: field.id, name: field.name, type: field.id })}
        >
            <field.icon size={18} style={{ color: field.color }} />
            <span>{field.name}</span>
        </button>
    );

    const filterFields = (fields: any[]) =>
        fields.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const filteredSuggested = filterFields(suggestedFields);
    const filteredAI = filterFields(aiFields);
    const filteredAll = filterFields(allFields);

    return (
        <div className="create-field-sidebar">
            <div className="sidebar-header">
                <button className="back-btn" onClick={onClose}>
                    <ChevronLeft size={20} />
                </button>
                <h3>Create field</h3>
                <button className="close-btn" onClick={onClose}>
                    <X size={20} />
                </button>
            </div>

            <div className="sidebar-search">
                <Search size={18} className="search-icon" />
                <input
                    type="text"
                    placeholder="Search for new or existing fields"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <div className="sidebar-content">
                {searchQuery ? (
                    <div className="search-results">
                        {[...filteredSuggested, ...filteredAI, ...filteredAll].map(renderFieldItem)}
                    </div>
                ) : (
                    <>
                        <div className="sidebar-section">
                            <h4 className="section-title">Suggested</h4>
                            {filteredSuggested.map(renderFieldItem)}
                        </div>

                        <div className="sidebar-divider"></div>

                        <div className="sidebar-section">
                            <h4 className="section-title">AI fields</h4>
                            {filteredAI.map(renderFieldItem)}
                        </div>

                        <div className="sidebar-divider"></div>

                        <div className="sidebar-section">
                            <h4 className="section-title">All</h4>
                            {filteredAll.map(renderFieldItem)}
                        </div>
                    </>
                )}
            </div>

            <div className="sidebar-footer">
                <button className="add-existing-btn">
                    <PlusIcon size={16} style={{ color: '#3b82f6', marginRight: 8 }} />
                    Add existing fields
                </button>
            </div>
        </div>
    );
};

const PlusIcon = ({ size, style }: { size: number, style?: React.CSSProperties }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={style}
    >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="16" />
        <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
);

export default CreateFieldSidebar;
