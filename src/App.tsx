import { useState, useEffect } from 'react';
import Layout from './components/Layout';
import HomeView from './views/HomeView';
import ListView from './views/ListView';
import KanbanView from './views/KanbanView';
import CalendarView from './views/CalendarView';
import GanttView from './views/GanttView';
import TimesheetView from './views/TimesheetView';
import DashboardView from './views/DashboardView';
import DocsView from './views/DocsView';
import SpaceOverview from './views/SpaceOverview';
import TaskModal from './components/TaskModal';
import TaskDetailModal from './components/TaskDetailModal';
import ReportModal from './components/ReportModal';
import AIModal from './components/AIModal';
import SettingsModal from './components/SettingsModal';
import { useAppStore } from './store/useAppStore';

function App() {
  const { currentView, theme, accentColor } = useAppStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [initialStatus, setInitialStatus] = useState<string | undefined>(undefined);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [settingsState, setSettingsState] = useState<{ open: boolean; tab?: string }>({ open: false });

  const openSettings = (tab?: string) => {
    setSettingsState({ open: true, tab });
  };

  useEffect(() => {
    const root = window.document.documentElement;

    // Apply theme
    root.classList.remove('light', 'dark');
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
      root.setAttribute('data-theme', systemTheme);
    } else {
      root.classList.add(theme);
      root.setAttribute('data-theme', theme);
    }

    // Apply accent color
    root.style.setProperty('--primary', accentColor);
    root.style.setProperty('--primary-hover', accentColor + 'ee');
  }, [theme, accentColor]);

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <HomeView onAddTask={() => setIsModalOpen(true)} onTaskClick={(id) => setSelectedTaskId(id)} />;
      case 'timesheet':
        return <TimesheetView />;
      case 'dashboards':
        return <DashboardView />;
      case 'docs':
        return <DocsView />;
      case 'space_overview':
        return <SpaceOverview />;
      case 'kanban':
        return <KanbanView
          onAddTask={(status) => {
            setInitialStatus(status);
            setIsModalOpen(true);
          }}
          onTaskClick={(id) => setSelectedTaskId(id)}
        />;
      case 'calendar':
        return <CalendarView onAddTask={() => setIsModalOpen(true)} onTaskClick={(id) => setSelectedTaskId(id)} />;
      case 'gantt':
        return <GanttView onAddTask={() => setIsModalOpen(true)} onTaskClick={(id) => setSelectedTaskId(id)} />;
      case 'list':
      default:
        return <ListView onAddTask={() => setIsModalOpen(true)} onTaskClick={(id) => setSelectedTaskId(id)} />;
    }
  };

  return (
    <Layout
      onAddTask={() => setIsModalOpen(true)}
      onOpenReport={() => setIsReportOpen(true)}
      onOpenAI={() => setIsAIOpen(true)}
      onOpenSettings={openSettings}
    >
      {renderView()}
      {isModalOpen && <TaskModal initialStatus={initialStatus} onClose={() => { setIsModalOpen(false); setInitialStatus(undefined); }} />}
      {selectedTaskId && <TaskDetailModal taskId={selectedTaskId} onClose={() => setSelectedTaskId(null)} onTaskClick={(id) => setSelectedTaskId(id)} />}
      {isReportOpen && <ReportModal onClose={() => setIsReportOpen(false)} />}
      {isAIOpen && <AIModal onClose={() => setIsAIOpen(false)} onTaskClick={(id) => setSelectedTaskId(id)} />}
      {settingsState.open && (
        <SettingsModal
          onClose={() => setSettingsState({ open: false })}
          initialTab={settingsState.tab}
        />
      )}
    </Layout>
  );
}

export default App;
