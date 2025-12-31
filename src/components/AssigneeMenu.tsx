import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Search, Check } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import '../styles/AssigneeMenu.css';

interface AssigneeMenuProps {
    taskId: string;
    spaceId: string;
    assignees: string[]; // Current assignee names
    onUpdateAssignees: (newAssignees: string[]) => void;
    onClose: () => void;
    triggerElement?: HTMLElement | null;
}

const AssigneeMenu: React.FC<AssigneeMenuProps> = ({
    spaceId,
    assignees,
    onUpdateAssignees,
    onClose,
    triggerElement
}) => {
    const [search, setSearch] = useState('');
    const [members, setMembers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const { token } = useAuthStore();
    const menuRef = useRef<HTMLDivElement>(null);
    const [style, setStyle] = useState<React.CSSProperties>({ visibility: 'hidden' });

    // Fetch members when mounted
    useEffect(() => {
        const fetchMembers = async () => {
            if (!spaceId || !token) return;
            setLoading(true);
            try {
                // Fetch space members
                const spaceRes = await fetch(`http://localhost:3001/api/resource/members?resourceType=space&resourceId=${spaceId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (spaceRes.ok) {
                    const data = await spaceRes.json();

                    // Also robustly fetch owner if needed, but for now rely on the recent backend fix which includes owner in this endpoint
                    setMembers(data);
                }
            } catch (error) {
                console.error('Failed to fetch members for assignee menu', error);
            } finally {
                setLoading(false);
            }
        };
        fetchMembers();
    }, [spaceId, token]);

    // Positioning Logic (reused from TagMenu)
    React.useLayoutEffect(() => {
        if (!menuRef.current || !triggerElement) return;

        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;
        const menuWidth = 260;
        const rect = triggerElement.getBoundingClientRect();
        const menuHeight = menuRef.current.offsetHeight || 300; // Warning: offsetHeight might be 0 if hidden initially without content

        const newStyle: React.CSSProperties = {
            position: 'fixed',
            zIndex: 10001,
            width: `${menuWidth}px`,
            visibility: 'visible'
        };

        // Horizontal positioning
        let left = rect.left;
        if (left + menuWidth > viewportWidth - 10) left = viewportWidth - menuWidth - 10;
        if (left < 10) left = 10;
        newStyle.left = `${left}px`;

        // Vertical positioning
        if (rect.bottom + menuHeight + 10 > viewportHeight && rect.top > menuHeight + 10) {
            newStyle.bottom = `${viewportHeight - rect.top + 8}px`;
            newStyle.top = 'auto';
        } else {
            newStyle.top = `${rect.bottom + 8}px`;
        }

        setStyle(newStyle);
    }, [triggerElement, members.length, loading]);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    const toggleAssignee = (memberName: string) => {
        const current = assignees || [];
        const isAssigned = current.includes(memberName);
        let newAssignees;
        if (isAssigned) {
            newAssignees = current.filter(n => n !== memberName);
        } else {
            newAssignees = [...current, memberName];
        }
        onUpdateAssignees(newAssignees);
    };

    const filteredMembers = members.filter(m => {
        const name = m.user_name || m.name || m.email || '';
        return name.toLowerCase().includes(search.toLowerCase());
    });

    const content = (
        <div className="assignee-menu-dropdown" ref={menuRef} style={style} onClick={e => e.stopPropagation()}>
            <div className="assignee-menu-header">
                <Search size={14} className="search-icon" />
                <input
                    type="text"
                    placeholder="Search people..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    autoFocus
                />
            </div>

            <div className="assignee-list-content">
                {loading && <div className="assignee-loading">Loading members...</div>}
                {!loading && filteredMembers.length === 0 && <div className="assignee-empty">No members found</div>}

                {!loading && filteredMembers.map(member => {
                    const name = member.user_name || member.name || member.email;
                    const isSelected = assignees && assignees.includes(name);

                    return (
                        <div
                            key={member.id || member.user_id}
                            className={`assignee-item-row ${isSelected ? 'selected' : ''}`}
                            onClick={() => toggleAssignee(name)}
                        >
                            <div className="assignee-avatar-wrapper">
                                {member.avatar_url ? (
                                    <img src={member.avatar_url} alt={name} className="assignee-menu-avatar" />
                                ) : (
                                    <div className="assignee-menu-avatar-fallback">
                                        {name ? name.charAt(0).toUpperCase() : '?'}
                                    </div>
                                )}
                            </div>
                            <span className="assignee-name">{name}</span>
                            {isSelected && <Check size={14} className="assignee-check" />}
                        </div>
                    );
                })}
            </div>
        </div>
    );

    return triggerElement ? createPortal(content, document.body) : null;
};

export default AssigneeMenu;
