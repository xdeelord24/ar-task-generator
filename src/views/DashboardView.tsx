import React, { useState } from 'react';
import {
    Plus,
    Layout as LayoutIcon,
    BarChart3,
    PieChart,
    Activity,
    ArrowLeft
} from 'lucide-react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy,
} from '@dnd-kit/sortable';
import { restrictToFirstScrollableAncestor } from '@dnd-kit/modifiers';

import { useAppStore } from '../store/useAppStore';
import DashboardCard from '../components/DashboardCard';
import '../styles/DashboardView.css';

const DashboardView: React.FC = () => {
    const {
        tasks,
        dashboardItems,
        setDashboardItems,
        addDashboardItem,
        updateDashboardItem,
        deleteDashboardItem
    } = useAppStore();

    const [isAddingChart, setIsAddingChart] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = dashboardItems.findIndex((item) => item.id === active.id);
            const newIndex = dashboardItems.findIndex((item) => item.id === over.id);
            setDashboardItems(arrayMove(dashboardItems, oldIndex, newIndex));
        }
    };

    const handleResize = (id: string) => {
        const item = dashboardItems.find(i => i.id === id);
        if (!item) return;

        const sizes: ('small' | 'medium' | 'large' | 'full')[] = ['small', 'medium', 'large', 'full'];
        const currentIndex = sizes.indexOf(item.size);
        const nextSize = sizes[(currentIndex + 1) % sizes.length];

        updateDashboardItem(id, { size: nextSize });
    };

    const addNewChart = (type: any, title: string) => {
        addDashboardItem({
            type,
            title,
            size: 'medium',
            config: type === 'stat' ? { metric: 'total' } : {}
        });
        setIsAddingChart(false);
    };

    return (
        <div className="view-container">
            <div className="view-header dash-header">
                <div className="breadcrumb">
                    <span className="space-name">Dashboards</span>
                    <span className="task-count">Project Overview</span>
                </div>
                <div className="view-controls">
                    <button className="view-mode-btn active">Overview</button>
                    <button className="view-mode-btn">Analytics</button>
                    <button className="view-mode-btn">Workload</button>
                    <div className="h-divider"></div>
                    <button className="btn-primary" onClick={() => setIsAddingChart(!isAddingChart)}>
                        <Plus size={16} /> Add Chart
                    </button>
                </div>
            </div>

            <div className="dashboard-content">
                {isAddingChart && (
                    <div className="add-chart-bar">
                        <div className="bar-header">
                            <h4>Select Chart Type</h4>
                            <button className="icon-btn" onClick={() => setIsAddingChart(false)}>
                                <ArrowLeft size={16} /> Back
                            </button>
                        </div>
                        <div className="chart-options">
                            <button className="chart-opt-btn" onClick={() => addNewChart('stat', 'New Metric')}>
                                <LayoutIcon size={20} />
                                <span>Stat Card</span>
                            </button>
                            <button className="chart-opt-btn" onClick={() => addNewChart('bar', 'Task Distribution')}>
                                <BarChart3 size={20} />
                                <span>Bar Chart</span>
                            </button>
                            <button className="chart-opt-btn" onClick={() => addNewChart('pie', 'Progress Wheel')}>
                                <PieChart size={20} />
                                <span>Pie Chart</span>
                            </button>
                            <button className="chart-opt-btn" onClick={() => addNewChart('priority', 'Priority Level')}>
                                <Activity size={20} />
                                <span>Priority Map</span>
                            </button>
                        </div>
                    </div>
                )}

                <div className="dashboard-grid">
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                        modifiers={[restrictToFirstScrollableAncestor]}
                    >
                        <SortableContext
                            items={dashboardItems.map(i => i.id)}
                            strategy={rectSortingStrategy}
                        >
                            {dashboardItems.map((item) => (
                                <DashboardCard
                                    key={item.id}
                                    item={item}
                                    tasks={tasks}
                                    onDelete={deleteDashboardItem}
                                    onResize={handleResize}
                                />
                            ))}
                        </SortableContext>
                    </DndContext>
                </div>
            </div>
        </div>
    );
};

export default DashboardView;
