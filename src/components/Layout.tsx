import React from 'react';
import '../styles/Layout.css';
import Header from './Header';
import Sidebar from './Sidebar';

interface LayoutProps {
    children: React.ReactNode;
    onAddTask: () => void;
    onOpenReport: () => void;
    onOpenAI: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, onAddTask, onOpenReport, onOpenAI }) => {
    return (
        <div className="app-container">
            <Header onAddTask={onAddTask} onOpenReport={onOpenReport} onOpenAI={onOpenAI} />
            <div className="main-layout">
                <Sidebar />
                <main className="content-area">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;
