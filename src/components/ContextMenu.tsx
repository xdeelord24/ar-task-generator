import React, { useEffect, useState, useCallback } from 'react';
import ReactDOM from 'react-dom';

export interface ContextMenuItem {
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
    danger?: boolean;
    divider?: boolean;
}

interface ContextMenuProps {
    x: number;
    y: number;
    items: ContextMenuItem[];
    onClose: () => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, items, onClose }) => {
    const [position, setPosition] = useState({ x, y });

    useEffect(() => {
        const menu = document.getElementById('context-menu');
        if (menu) {
            const rect = menu.getBoundingClientRect();
            let newX = x;
            let newY = y;

            if (x + rect.width > window.innerWidth) {
                newX = x - rect.width;
            }
            if (y + rect.height > window.innerHeight) {
                newY = y - rect.height;
            }

            setPosition({ x: newX, y: newY });
        }
    }, [x, y]);

    return ReactDOM.createPortal(
        <div
            id="context-menu"
            className="context-menu"
            style={{
                position: 'fixed',
                top: position.y,
                left: position.x,
                zIndex: 9999,
                background: 'var(--bg-surface)',
                borderRadius: '8px',
                boxShadow: 'var(--shadow-lg)',
                border: '1px solid var(--border)',
                padding: '4px',
                minWidth: '160px',
            }}
            onClick={(e) => e.stopPropagation()}
        >
            {items.map((item, index) => (
                <React.Fragment key={index}>
                    {item.divider && <div style={{ height: '1px', background: 'var(--border)', margin: '4px 0' }} />}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            console.log('ContextMenu: Item clicked', item.label);
                            item.onClick();
                            onClose();
                        }}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            width: '100%',
                            padding: '8px 12px',
                            borderRadius: '4px',
                            border: 'none',
                            background: 'transparent',
                            color: item.danger ? 'var(--error)' : 'var(--text-main)',
                            fontSize: '13px',
                            fontWeight: 500,
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'background 0.2s',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                        {item.icon}
                        {item.label}
                    </button>
                </React.Fragment>
            ))}
        </div>,
        document.body
    );
};

export const useContextMenu = () => {
    const [state, setState] = useState<{
        visible: boolean;
        x: number;
        y: number;
        items: ContextMenuItem[];
    }>({
        visible: false,
        x: 0,
        y: 0,
        items: [],
    });

    const showContextMenu = useCallback((e: React.MouseEvent, items: ContextMenuItem[]) => {
        e.preventDefault();
        setState({
            visible: true,
            x: e.clientX,
            y: e.clientY,
            items,
        });
    }, []);

    const hideContextMenu = useCallback(() => {
        setState((prev) => ({ ...prev, visible: false }));
    }, []);

    useEffect(() => {
        if (state.visible) {
            window.addEventListener('click', hideContextMenu);
            window.addEventListener('scroll', hideContextMenu);
            return () => {
                window.removeEventListener('click', hideContextMenu);
                window.removeEventListener('scroll', hideContextMenu);
            };
        }
    }, [state.visible, hideContextMenu]);

    return {
        showContextMenu,
        hideContextMenu,
        contextMenuProps: state,
    };
};

export default ContextMenu;
