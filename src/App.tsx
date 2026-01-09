import { useState, useEffect, useMemo, useCallback } from 'react';
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
import ClipsView from './views/ClipsView';
import AgentsView from './views/AgentsView';
import InboxView from './views/InboxView';
import TaskModal from './components/TaskModal';
import TaskDetailModal from './components/TaskDetailModal';
import ReportModal from './components/ReportModal';
import AIModal from './components/AIModal';
import SettingsModal from './components/SettingsModal';
import { useAppStore } from './store/useAppStore';
import { useAuthStore } from './store/useAuthStore';
import { AuthModal } from './components/AuthModal';
import ToastContainer from './components/ToastContainer';

function App() {
  const currentView = useAppStore(state => state.currentView);
  const theme = useAppStore(state => state.theme);
  const accentColor = useAppStore(state => state.accentColor);
  const { isAuthenticated, user: currentUser } = useAuthStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [initialStatus, setInitialStatus] = useState<string | undefined>(undefined);
  const [initialDate, setInitialDate] = useState<Date | undefined>(undefined);
  const [initialStartDate, setInitialStartDate] = useState<Date | undefined>(undefined);
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

  // Check for due dates and sync shared data periodically - ONLY when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;

    const { checkDueDates, syncSharedData, refreshRooms, setupSocket } = useAppStore.getState();

    // Initial setup
    if (currentUser) {
      setupSocket(currentUser.id);
    }

    // Initial runs
    checkDueDates();
    syncSharedData();
    refreshRooms();

    // Watch spaces length for new shared spaces (only if they change)
    const unsubscribe = useAppStore.subscribe(
      (state, prevState) => {
        if (state.spaces.length !== prevState.spaces.length) {
          state.refreshRooms();
        }
      }
    );

    // Check due dates every 5 minutes
    const dueInterval = setInterval(() => {
      checkDueDates();
    }, 5 * 60 * 1000);

    // Sync shared data every 30 seconds for real-time collaboration feel
    const syncInterval = setInterval(() => {
      syncSharedData();
    }, 30 * 1000);

    return () => {
      unsubscribe();
      clearInterval(dueInterval);
      clearInterval(syncInterval);
    };
  }, [isAuthenticated, currentUser]);

  useEffect(() => {
    // Check if we have a token in local storage on mount (simple persistence handled by store middleware)
    // The persist middleware of zustand handles this automatically.
  }, []);


  const handleAddTask = useCallback((status?: string, start?: Date, end?: Date) => {
    if (status) setInitialStatus(status);
    if (start) setInitialStartDate(start);
    if (end) setInitialDate(end);
    setIsModalOpen(true);
  }, []);

  const handleOpenReport = useCallback(() => setIsReportOpen(true), []);
  const handleOpenAI = useCallback(() => setIsAIOpen(true), []);
  const handleOpenSettings = useCallback((tab?: string) => openSettings(tab), []);
  const handleCloseTaskDetail = useCallback(() => setSelectedTaskId(null), []);
  const handleTaskClick = useCallback((id: string) => setSelectedTaskId(id), []);

  const activeView = useMemo(() => {
    switch (currentView) {
      case 'home':
        return <HomeView onAddTask={() => handleAddTask()} onTaskClick={handleTaskClick} />;
      case 'inbox':
        return <InboxView onTaskClick={handleTaskClick} />;
      case 'timesheet':
        return <TimesheetView />;
      case 'dashboards':
        return <DashboardView />;
      case 'docs':
        return <DocsView />;
      case 'clips':
        return <ClipsView />;
      case 'space_overview':
        return <SpaceOverview />;
      case 'agents':
        return <AgentsView />;
      case 'kanban':
        return <KanbanView
          onAddTask={handleAddTask}
          onTaskClick={handleTaskClick}
        />;
      case 'calendar':
        return <CalendarView
          onAddTask={(start, end) => handleAddTask(undefined, start, end)}
          onTaskClick={handleTaskClick}
        />;
      case 'gantt':
        return <GanttView
          onAddTask={() => handleAddTask()}
          onTaskClick={handleTaskClick}
        />;
      case 'table':
        return <ListView
          onAddTask={() => handleAddTask()}
          onTaskClick={handleTaskClick}
          isTableMode={true}
        />;
      case 'list':
      default:
        return (
          <ListView
            onAddTask={() => handleAddTask()}
            onTaskClick={handleTaskClick}
          />
        );
    }
  }, [currentView, handleAddTask, handleTaskClick]);

  if (!isAuthenticated) {
    return <AuthModal isOpen={true} />;
  }

  return (
    <Layout
      onAddTask={() => handleAddTask()}
      onOpenReport={handleOpenReport}
      onOpenAI={handleOpenAI}
      onOpenSettings={handleOpenSettings}
      onTaskClick={handleTaskClick}
    >
      {activeView}
      {isModalOpen && <TaskModal initialStatus={initialStatus} initialDate={initialDate} initialStartDate={initialStartDate} onClose={() => { setIsModalOpen(false); setInitialStatus(undefined); setInitialDate(undefined); setInitialStartDate(undefined); }} />}
      {selectedTaskId && <TaskDetailModal taskId={selectedTaskId} onClose={handleCloseTaskDetail} onTaskClick={handleTaskClick} />}
      {isReportOpen && <ReportModal onClose={() => setIsReportOpen(false)} />}
      {isAIOpen && <AIModal onClose={() => setIsAIOpen(false)} onTaskClick={(id) => setSelectedTaskId(id)} />}
      {settingsState.open && (
        <SettingsModal
          onClose={() => setSettingsState({ open: false })}
          initialTab={settingsState.tab}
        />
      )}
      <ToastContainer />
    </Layout>
  );
}

export default App;
