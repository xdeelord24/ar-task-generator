import { useState } from 'react';
import Layout from './components/Layout';
import HomeView from './views/HomeView';
import ListView from './views/ListView';
import KanbanView from './views/KanbanView';
import CalendarView from './views/CalendarView';
import GanttView from './views/GanttView';
import TimesheetView from './views/TimesheetView';
import DashboardView from './views/DashboardView';
import DocsView from './views/DocsView';
import TaskModal from './components/TaskModal';
import TaskDetailModal from './components/TaskDetailModal';
import ReportModal from './components/ReportModal';
import AIModal from './components/AIModal';
import { useAppStore } from './store/useAppStore';

function App() {
  const { currentView } = useAppStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <HomeView onAddTask={() => setIsModalOpen(true)} />;
      case 'timesheet':
        return <TimesheetView />;
      case 'dashboards':
        return <DashboardView />;
      case 'docs':
        return <DocsView />;
      case 'kanban':
        return <KanbanView onAddTask={() => setIsModalOpen(true)} onTaskClick={(id) => setSelectedTaskId(id)} />;
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
    >
      {renderView()}
      {isModalOpen && <TaskModal onClose={() => setIsModalOpen(false)} />}
      {selectedTaskId && <TaskDetailModal taskId={selectedTaskId} onClose={() => setSelectedTaskId(null)} />}
      {isReportOpen && <ReportModal onClose={() => setIsReportOpen(false)} />}
      {isAIOpen && <AIModal onClose={() => setIsAIOpen(false)} />}
    </Layout>
  );
}

export default App;
