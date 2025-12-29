import React, { useState, useEffect } from 'react';
import { Search, Bell, Calendar, Grid, FileText, ChevronDown, Sparkles } from 'lucide-react';
import ProfileDropdown from './ProfileDropdown';
import '../styles/Header.css';

interface HeaderProps {
    onAddTask: () => void;
    onOpenReport: () => void;
    onOpenAI: () => void;
}

const Header: React.FC<HeaderProps> = ({ onAddTask, onOpenReport, onOpenAI }) => {
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const [dropdownPosition, setDropdownPosition] = useState<'left' | 'right'>('right');

    useEffect(() => {
        const handleClickOutside = () => setShowProfileDropdown(false);
        if (showProfileDropdown) {
            window.addEventListener('click', handleClickOutside);
            return () => window.removeEventListener('click', handleClickOutside);
        }
    }, [showProfileDropdown]);

    const toggleDropdown = (e: React.MouseEvent, pos: 'left' | 'right') => {
        e.stopPropagation();
        if (showProfileDropdown && dropdownPosition === pos) {
            setShowProfileDropdown(false);
        } else {
            setDropdownPosition(pos);
            setShowProfileDropdown(true);
        }
    };

    return (
        <header className="top-header">
            <div className="header-left">
                <div
                    className="logo"
                    onClick={(e) => toggleDropdown(e, 'left')}
                    style={{ cursor: 'pointer' }}
                >
                    AR
                </div>
                <div className="header-icons">
                    <button className="icon-btn"><Bell size={18} /></button>
                    <button className="icon-btn"><Calendar size={18} /></button>
                </div>
                <div className="search-bar">
                    <Search size={16} />
                    <input type="text" placeholder="Search" />
                </div>
            </div>

            <div className="header-right">
                <button className="btn-ai" onClick={onOpenAI}>
                    <Sparkles size={16} /> AI
                </button>
                <button className="btn-primary" onClick={onOpenReport}>
                    <FileText size={16} /> Generate Report
                </button>
                <button className="btn-new" onClick={onAddTask}>New</button>

                <div className="header-utility-icons">
                    <button className="icon-btn"><Grid size={18} /></button>
                </div>

                <div
                    className="user-profile"
                    onClick={(e) => toggleDropdown(e, 'right')}
                >
                    <div className="profile-circle">J</div>
                    <ChevronDown size={14} />
                </div>
            </div>

            {showProfileDropdown && (
                <ProfileDropdown
                    onClose={() => setShowProfileDropdown(false)}
                    position={dropdownPosition}
                />
            )}
        </header>
    );
};

export default Header;
