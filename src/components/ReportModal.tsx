import React, { useState } from 'react';
import { X, FileText, Download } from 'lucide-react';
import { Packer } from 'docx';
import { saveAs } from 'file-saver';
import { useAppStore, DEFAULT_STATUSES } from '../store/useAppStore';
import { useAuthStore } from '../store/useAuthStore';
import { format, startOfMonth, endOfMonth, isWithinInterval, parseISO, setDate } from 'date-fns';
import type { Task } from '../types';
import { generateReportDocument } from '../utils/reportTemplates';
import '../styles/TaskModal.css';
import '../styles/ReportModal.css';

interface ReportModalProps {
    onClose: () => void;
}

const ReportModal: React.FC<ReportModalProps> = ({ onClose }) => {
    const { tasks, currentSpaceId, spaces, lists, isTaskCompleted, userName } = useAppStore();
    const { user } = useAuthStore();

    const today = new Date();
    const currentDay = today.getDate();
    const initialPeriod = currentDay <= 15 ? '1' : '2';

    // Calculate initial dates based on currentPeriod
    const initialStart = initialPeriod === '1'
        ? format(startOfMonth(today), 'yyyy-MM-01')
        : format(setDate(startOfMonth(today), 15), 'yyyy-MM-15');
    const initialEnd = initialPeriod === '1'
        ? format(setDate(startOfMonth(today), 14), 'yyyy-MM-14')
        : format(endOfMonth(today), 'yyyy-MM-dd');

    const availableSpaces = spaces.filter(s => s.id !== 'everything');

    const [selectedSpaces, setSelectedSpaces] = useState<string[]>(
        currentSpaceId === 'everything'
            ? availableSpaces.map(s => s.id)
            : [currentSpaceId]
    );

    const toggleSpace = (spaceId: string) => {
        setSelectedSpaces(prev => {
            if (prev.includes(spaceId)) {
                return prev.filter(id => id !== spaceId);
            } else {
                return [...prev, spaceId];
            }
        });
    };

    const [formData, setFormData] = useState({
        template: 'general',
        name: user?.name || userName || 'User',
        position: 'Software Engineer',
        office: 'Tech Office',
        year: today.getFullYear(),
        month: today.getMonth() + 1,
        period: initialPeriod,
        dateFrom: initialStart,
        dateTo: initialEnd,
        includeCompleted: true,
        includeInProgress: true,
        includeTodo: true,
        reviewedBy: '',
        verifiedBy: '',
        approvedBy: ''
    });

    const updateDateRange = (year: number, month: number, period: string) => {
        const baseDate = new Date(year, month - 1, 1);
        let start, end;

        if (period === '1') {
            start = format(baseDate, 'yyyy-MM-01');
            end = format(setDate(baseDate, 14), 'yyyy-MM-14');
        } else {
            start = format(setDate(baseDate, 15), 'yyyy-MM-15');
            end = format(endOfMonth(baseDate), 'yyyy-MM-dd');
        }

        setFormData(prev => ({
            ...prev,
            year,
            month,
            period,
            dateFrom: start,
            dateTo: end
        }));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { id, value, type } = e.target;

        if (id === 'year' || id === 'month' || id === 'period') {
            const newYear = id === 'year' ? parseInt(value) : formData.year;
            const newMonth = id === 'month' ? parseInt(value) : formData.month;
            const newPeriod = id === 'period' ? value : formData.period;

            updateDateRange(newYear, newMonth, newPeriod);
        } else if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [id]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [id]: value }));
        }
    };

    const getTaskStatuses = (task: Task) => {
        if (task.listId) {
            const list = lists.find((l) => l.id === task.listId);
            if (list && list.statuses && list.statuses.length > 0) return list.statuses;
        }
        const space = spaces.find((s) => s.id === task.spaceId);
        if (space && space.statuses && space.statuses.length > 0) return space.statuses;
        return DEFAULT_STATUSES;
    };

    const getTaskStatusType = (task: Task) => {
        const statuses = getTaskStatuses(task);
        const statusObj = statuses.find((s) => s.name === task.status);
        if (statusObj) return statusObj.type;
        // Fallback for hardcoded statuses if any
        if (task.status === 'COMPLETED') return 'done';
        if (task.status === 'IN PROGRESS') return 'inprogress';
        if (task.status === 'TO DO') return 'todo';
        return 'todo';
    };

    const generateReport = async () => {
        let reportTasks: Task[] = Object.values(tasks).filter(t =>
            selectedSpaces.includes(t.spaceId)
        );

        if (formData.name) {
            reportTasks = reportTasks.filter(t => {
                const nameFilter = formData.name.toLowerCase().trim();
                const assigneeName = t.assignee?.toLowerCase().trim() || '';

                // Allow partial matches in either direction
                const isAssignee = assigneeName.includes(nameFilter) || nameFilter.includes(assigneeName);

                const isInAssignees = t.assignees?.some(a => {
                    const diffName = a.toLowerCase().trim();
                    return diffName.includes(nameFilter) || nameFilter.includes(diffName);
                }) ?? false;

                return isAssignee || isInAssignees;
            });
        }

        if (formData.dateFrom && formData.dateTo) {
            const start = parseISO(formData.dateFrom);
            const end = parseISO(formData.dateTo);

            // Adjust end date to end of day to include updates on that day
            const endOfDay = new Date(end);
            endOfDay.setHours(23, 59, 59, 999);

            reportTasks = reportTasks.filter(t => {
                // Check if task has a due date in range
                const hasDueInRange = t.dueDate ? isWithinInterval(parseISO(t.dueDate), { start, end: endOfDay }) : false;

                // Check if task was updated/completed in range (for accomplishments)
                const hasUpdateInRange = t.updatedAt ? isWithinInterval(parseISO(t.updatedAt), { start, end: endOfDay }) : false;

                // Include if either matches. If user strictly wants only tasks DUE, they can ignore the "updated" part, 
                // but for an "Accomplishment Report", work done (updated) is usually key.
                return hasDueInRange || hasUpdateInRange;
            });
        }

        reportTasks = reportTasks.filter(t => {
            const statusType = getTaskStatusType(t);

            if (formData.includeCompleted && (statusType === 'done' || statusType === 'closed')) return true;
            if (formData.includeInProgress && statusType === 'inprogress') return true;
            if (formData.includeTodo && statusType === 'todo') return true;

            // Legacy/Fallback checks (optional but safe)
            if (isTaskCompleted(t) && formData.includeCompleted) return true;

            return false;
        });


        const doc = generateReportDocument(reportTasks, formData);
        const blob = await Packer.toBlob(doc);
        const templateName = formData.template === 'general' ? 'General' : 'Custom';
        saveAs(blob, `Accomplishment_Report_${templateName}_${formData.year}_${formData.month}.docx`);
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content report-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="title-group-header">
                        <FileText size={20} />
                        <h2>Generate Accomplishment Report</h2>
                    </div>
                    <button className="close-btn" onClick={onClose}><X size={20} /></button>
                </div>

                <div className="modal-body scrollable">
                    <div className="form-section">
                        <h3>Report Template</h3>
                        <div className="template-selector">
                            <label className={`template-option ${formData.template === 'general' ? 'active' : ''}`}>
                                <input
                                    type="radio"
                                    name="template"
                                    value="general"
                                    checked={formData.template === 'general'}
                                    onChange={(e) => setFormData(prev => ({ ...prev, template: e.target.value }))}
                                />
                                <div className="template-content">
                                    <div className="template-icon">ðŸ“„</div>
                                    <div className="template-details">
                                        <div className="template-title">General Template</div>
                                        <div className="template-desc">Standard accomplishment report format</div>
                                    </div>
                                </div>
                            </label>
                            <label className={`template-option ${formData.template === 'custom' ? 'active' : ''}`}>
                                <input
                                    type="radio"
                                    name="template"
                                    value="custom"
                                    checked={formData.template === 'custom'}
                                    onChange={(e) => setFormData(prev => ({ ...prev, template: e.target.value }))}
                                />
                                <div className="template-content">
                                    <div className="template-icon">âœ¨</div>
                                    <div className="template-details">
                                        <div className="template-title">Custom Template</div>
                                        <div className="template-desc">Enhanced format with detailed sections</div>
                                    </div>
                                </div>
                            </label>
                        </div>
                    </div>

                    <div className="form-section">
                        <h3>Report Scope</h3>
                        <div className="checkbox-group">
                            {availableSpaces.map(space => (
                                <label key={space.id}>
                                    <input
                                        type="checkbox"
                                        checked={selectedSpaces.includes(space.id)}
                                        onChange={() => toggleSpace(space.id)}
                                    />
                                    {space.name}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="form-section">
                        <h3>Personal Information</h3>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Name</label>
                                <input type="text" id="name" value={formData.name} onChange={handleInputChange} />
                            </div>
                            <div className="form-group">
                                <label>Position</label>
                                <input type="text" id="position" value={formData.position} onChange={handleInputChange} />
                            </div>
                            <div className="form-group full-width">
                                <label>Office</label>
                                <input type="text" id="office" value={formData.office} onChange={handleInputChange} />
                            </div>
                        </div>
                    </div>

                    <div className="form-section">
                        <h3>Report Period</h3>
                        <div className="form-grid-three">
                            <div className="form-group">
                                <label>Year</label>
                                <input type="number" id="year" value={formData.year} onChange={handleInputChange} />
                            </div>
                            <div className="form-group">
                                <label>Month</label>
                                <select id="month" value={formData.month} onChange={handleInputChange}>
                                    {Array.from({ length: 12 }, (_, i) => (
                                        <option key={i + 1} value={i + 1}>{format(new Date(2025, i, 1), 'MMMM')}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Period</label>
                                <select id="period" value={formData.period} onChange={handleInputChange}>
                                    <option value="1">1st Half (1-14)</option>
                                    <option value="2">2nd Half (15-31)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="form-section">
                        <h3>Task Configuration</h3>
                        <div className="form-row">
                            <div className="form-group">
                                <label>From</label>
                                <input type="date" id="dateFrom" value={formData.dateFrom} onChange={handleInputChange} />
                            </div>
                            <div className="form-group">
                                <label>To</label>
                                <input type="date" id="dateTo" value={formData.dateTo} onChange={handleInputChange} />
                            </div>
                        </div>
                        <div className="checkbox-group">
                            <label><input type="checkbox" id="includeCompleted" checked={formData.includeCompleted} onChange={handleInputChange} /> Completed</label>
                            <label><input type="checkbox" id="includeInProgress" checked={formData.includeInProgress} onChange={handleInputChange} /> In Progress</label>
                            <label><input type="checkbox" id="includeTodo" checked={formData.includeTodo} onChange={handleInputChange} /> To Do</label>
                        </div>
                    </div>

                    <div className="form-section">
                        <h3>Signatures</h3>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Reviewed By</label>
                                <input type="text" id="reviewedBy" value={formData.reviewedBy} onChange={handleInputChange} />
                            </div>
                            <div className="form-group">
                                <label>Verified By</label>
                                <input type="text" id="verifiedBy" value={formData.verifiedBy} onChange={handleInputChange} />
                            </div>
                            <div className="form-group full-width">
                                <label>Approved By</label>
                                <input type="text" id="approvedBy" value={formData.approvedBy} onChange={handleInputChange} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn-secondary" onClick={onClose}>Cancel</button>
                    <button className="btn-primary" onClick={generateReport} disabled={selectedSpaces.length === 0} style={{ opacity: selectedSpaces.length === 0 ? 0.5 : 1, cursor: selectedSpaces.length === 0 ? 'not-allowed' : 'pointer' }}>
                        <Download size={16} /> Generate & Download
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReportModal;

