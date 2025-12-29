import React, { useState } from 'react';
import { X, FileText, Download } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { format, startOfMonth, isWithinInterval, parseISO, addDays } from 'date-fns';
import type { Task } from '../types';
import '../styles/TaskModal.css';
import '../styles/ReportModal.css';

interface ReportModalProps {
    onClose: () => void;
}

const ReportModal: React.FC<ReportModalProps> = ({ onClose }) => {
    const { tasks, currentSpaceId } = useAppStore();

    const [formData, setFormData] = useState({
        name: 'Jundee',
        position: 'Software Engineer',
        office: 'Tech Office',
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        period: '1',
        dateFrom: format(startOfMonth(new Date()), 'yyyy-MM-01'),
        dateTo: format(addDays(startOfMonth(new Date()), 14), 'yyyy-MM-15'),
        includeCompleted: true,
        includeInProgress: false,
        includeTodo: false,
        reviewedBy: '',
        verifiedBy: '',
        approvedBy: ''
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { id, value, type } = e.target;
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [id]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [id]: value }));
        }
    };

    const generateReport = () => {
        let reportTasks: Task[] = tasks.filter(t =>
            currentSpaceId === 'everything' || t.spaceId === currentSpaceId
        );

        if (formData.dateFrom && formData.dateTo) {
            const start = parseISO(formData.dateFrom);
            const end = parseISO(formData.dateTo);
            reportTasks = reportTasks.filter(t => {
                if (!t.dueDate) return false;
                const d = parseISO(t.dueDate);
                return isWithinInterval(d, { start, end });
            });
        }

        reportTasks = reportTasks.filter(t => {
            if (t.status === 'COMPLETED' && formData.includeCompleted) return true;
            if (t.status === 'IN PROGRESS' && formData.includeInProgress) return true;
            if (t.status === 'TO DO' && formData.includeTodo) return true;
            return false;
        });

        let content = `INDIVIDUAL ACCOMPLISHMENT REPORT\n\n`;
        content += `Name: ${formData.name}\n`;
        content += `Position: ${formData.position}\n`;
        content += `Office: ${formData.office}\n\n`;
        content += `Period: ${formData.month}/${formData.year} (${formData.period === '1' ? '1st Half' : '2nd Half'})\n\n`;
        content += `ACCOMPLISHMENTS:\n\n`;

        reportTasks.forEach(t => {
            content += `[${t.status}] ${t.name}\n`;
            if (t.description) content += `  - ${t.description}\n`;
        });

        content += `\n\nSIGNATURES:\n`;
        if (formData.reviewedBy) content += `Reviewed by: ${formData.reviewedBy}\n`;
        if (formData.verifiedBy) content += `Verified by: ${formData.verifiedBy}\n`;
        if (formData.approvedBy) content += `Approved by: ${formData.approvedBy}\n`;

        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Accomplishment_Report_${formData.year}_${formData.month}.txt`;
        a.click();
        onClose();
        URL.revokeObjectURL(url);
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
                                    <option value="1">1st Half (1-15)</option>
                                    <option value="2">2nd Half (16-31)</option>
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
                    <button className="btn-primary" onClick={generateReport}>
                        <Download size={16} /> Generate & Download
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReportModal;
