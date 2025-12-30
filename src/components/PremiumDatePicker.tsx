import React, { useState, useRef, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import {
    Calendar as CalendarIcon,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    History,
    MoreHorizontal
} from 'lucide-react';
import {
    format,
    addDays,
    addWeeks,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameDay,
    isSameMonth,
    addMonths,
    subMonths
} from 'date-fns';
import TimePicker from './TimePicker';
import '../styles/PremiumDatePicker.css';

interface PremiumDatePickerProps {
    startDate?: string;
    dueDate?: string;
    onSave: (dates: { startDate?: string; dueDate?: string }) => void;
    onClose: () => void;
    triggerElement?: HTMLElement | null;
}

type PickerView = 'quick' | 'recurring';

const PremiumDatePicker: React.FC<PremiumDatePickerProps> = ({ startDate, dueDate, onSave, onClose, triggerElement }) => {
    const [view, setView] = useState<PickerView>('quick');
    const [tempStart, setTempStart] = useState(startDate);
    const [tempDue, setTempDue] = useState(dueDate);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [activeInput, setActiveInput] = useState<'start' | 'due'>(dueDate ? 'due' : 'start');
    const [timePickerTarget, setTimePickerTarget] = useState<'start' | 'due' | null>(null);
    const [startInputRef, setStartInputRef] = useState<HTMLSpanElement | null>(null);
    const [dueInputRef, setDueInputRef] = useState<HTMLSpanElement | null>(null);

    const pickerRef = useRef<HTMLDivElement>(null);
    const [style, setStyle] = useState<React.CSSProperties>({ visibility: 'hidden' });

    useLayoutEffect(() => {
        if (!pickerRef.current) return;

        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const pickerWidth = pickerRef.current.offsetWidth || 580; // Match CSS width
        const pickerHeight = pickerRef.current.offsetHeight || 380; // Approximate height

        if (triggerElement) {
            const rect = triggerElement.getBoundingClientRect();

            const newStyle: React.CSSProperties = {
                position: 'fixed',
                zIndex: 10001,
                visibility: 'visible',
                maxWidth: '95vw' // Ensure it doesn't exceed viewport width
            };

            // Vertical positioning
            if (rect.bottom + pickerHeight + 10 > viewportHeight) {
                // Flip up
                newStyle.bottom = viewportHeight - rect.top + 5;
                newStyle.top = 'auto';
            } else {
                // Default down
                newStyle.top = rect.bottom + 5;
                newStyle.bottom = 'auto';
            }

            // Horizontal positioning
            if (rect.left + pickerWidth > viewportWidth - 20) { // Add padding margin
                // overflow right, align to right edge of viewport or trigger

                // If aligning right to trigger works, do that
                if (viewportWidth - rect.right + pickerWidth <= viewportWidth) {
                    newStyle.right = viewportWidth - rect.right;
                    newStyle.left = 'auto';
                } else {
                    // Otherwise force stick to right edge of screen
                    newStyle.right = 10;
                    newStyle.left = 'auto';
                }
            } else {
                newStyle.left = rect.left;
                newStyle.right = 'auto';
            }

            setStyle(newStyle);
        } else {
            setStyle({
                position: 'absolute',
                top: '100%',
                left: 0,
                zIndex: 1000,
                marginTop: '8px',
                visibility: 'visible'
            });
        }
    }, [triggerElement, view, currentMonth]); // Re-calc on view change (height might change)

    const formatDisplay = (dateStr?: string) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        if (dateStr.includes('T')) {
            return format(date, 'M/d/yy h:mm a');
        }
        return format(date, 'M/d/yy');
    };

    const handleTimeSelect = (timeStr: string) => {
        if (!timePickerTarget) return;

        const targetDateStr = timePickerTarget === 'start' ? tempStart : tempDue;
        const date = targetDateStr ? new Date(targetDateStr) : new Date();

        const [time, modifier] = timeStr.split(' ');
        let [hours, minutes] = time.split(':').map(Number);

        if (modifier.toLowerCase() === 'pm' && hours < 12) hours += 12;
        if (modifier.toLowerCase() === 'am' && hours === 12) hours = 0;

        date.setHours(hours, minutes, 0, 0);

        if (timePickerTarget === 'start') {
            setTempStart(date.toISOString());
        } else {
            setTempDue(date.toISOString());
        }
        setTimePickerTarget(null);
    };

    const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDateCal = startOfWeek(monthStart);
    const endDateCal = endOfWeek(monthEnd);

    const calendarDays = eachDayOfInterval({
        start: startDateCal,
        end: endDateCal,
    });

    const handleDateClick = (day: Date) => {
        const dateStr = format(day, 'yyyy-MM-dd');
        if (activeInput === 'start') {
            setTempStart(dateStr);
            setActiveInput('due');
        } else {
            setTempDue(dateStr);
        }
    };

    const quickOptions = [
        { label: 'Today', value: new Date(), sub: 'Sun' },
        { label: 'Later', value: addDays(new Date(), 1), sub: '12:12 pm' },
        { label: 'Tomorrow', value: addDays(new Date(), 1), sub: 'Mon' },
        { label: 'Next week', value: addWeeks(new Date(), 1), sub: 'Mon' },
        { label: 'Next weekend', value: addDays(startOfWeek(addWeeks(new Date(), 1)), 6), sub: 'Sat' },
        { label: '2 weeks', value: addWeeks(new Date(), 2), sub: '11 Jan' },
        { label: '4 weeks', value: addWeeks(new Date(), 4), sub: '25 Jan' },
        { label: '8 weeks', value: addWeeks(new Date(), 8), sub: '22 Feb' },
    ];

    const isBetween = (day: Date) => {
        if (!tempStart || !tempDue) return false;
        const start = new Date(tempStart);
        const end = new Date(tempDue);
        return day > start && day < end;
    };

    const content = (
        <div ref={pickerRef} style={style} className="premium-datepicker" onClick={(e) => e.stopPropagation()}>
            <div className="picker-header-inputs">
                <div
                    className={`date-input-field ${activeInput === 'start' ? 'active' : ''}`}
                    onClick={() => setActiveInput('start')}
                >
                    <CalendarIcon size={14} />
                    <div className="input-group-premium">
                        <input
                            placeholder="Start date"
                            value={formatDisplay(tempStart)}
                            readOnly
                        />
                        {tempStart && (
                            <div style={{ position: 'relative' }}>
                                <span className="sub-action" ref={setStartInputRef} onClick={(e) => {
                                    e.stopPropagation();
                                    setTimePickerTarget('start');
                                }}>
                                    {tempStart.includes('T') ? 'Change time' : 'Add time'}
                                </span>
                                {timePickerTarget === 'start' && (
                                    <TimePicker
                                        onSelect={handleTimeSelect}
                                        onClose={() => setTimePickerTarget(null)}
                                        triggerElement={startInputRef}
                                    />
                                )}
                            </div>
                        )}
                    </div>
                </div>
                <div
                    className={`date-input-field ${activeInput === 'due' ? 'active' : ''}`}
                    onClick={() => setActiveInput('due')}
                >
                    <CalendarIcon size={14} />
                    <div className="input-group-premium">
                        <input
                            placeholder="Due date"
                            value={formatDisplay(tempDue)}
                            readOnly
                        />
                        {tempDue && (
                            <div style={{ position: 'relative' }}>
                                <span className="sub-action" ref={setDueInputRef} onClick={(e) => {
                                    e.stopPropagation();
                                    setTimePickerTarget('due');
                                }}>
                                    {tempDue.includes('T') ? 'Change time' : 'Add time'}
                                </span>
                                {timePickerTarget === 'due' && (
                                    <TimePicker
                                        onSelect={handleTimeSelect}
                                        onClose={() => setTimePickerTarget(null)}
                                        triggerElement={dueInputRef}
                                    />
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="picker-body">
                <div className="picker-sidebar">
                    {view === 'quick' ? (
                        <>
                            <div className="quick-options-list">
                                {quickOptions.map((opt, i) => (
                                    <div key={i} className="quick-opt-item" onClick={() => handleDateClick(opt.value)}>
                                        <span className="opt-label">{opt.label}</span>
                                        <span className="opt-sub">{opt.sub}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="sidebar-footer-btn" onClick={() => setView('recurring')}>
                                <span>Set Recurring</span>
                                <ChevronRight size={16} />
                            </div>
                        </>
                    ) : (
                        <div className="recurring-config">
                            <div className="rec-header">
                                <span>Recurring</span>
                                <div className="rec-icons">
                                    <History size={14} />
                                    <MoreHorizontal size={14} />
                                </div>
                            </div>

                            <div className="rec-select-group">
                                <div className="rec-select">
                                    <span>Weekly</span>
                                    <ChevronDown size={14} />
                                </div>
                                <div className="rec-select">
                                    <span>On status change: Completed</span>
                                    <ChevronDown size={14} />
                                </div>
                            </div>

                            <div className="rec-checkboxes">
                                <label className="rec-check-item">
                                    <input type="checkbox" />
                                    <span>Create new task</span>
                                </label>
                                <label className="rec-check-item">
                                    <input type="checkbox" defaultChecked />
                                    <span>Recur forever</span>
                                </label>
                                <label className="rec-check-item">
                                    <input type="checkbox" />
                                    <span>Update status to:</span>
                                </label>
                            </div>

                            <div className="rec-status-picker">
                                <div className="status-dot-gray"></div>
                                <span>BACKLOG</span>
                                <ChevronDown size={14} />
                            </div>

                            <div className="rec-footer-actions">
                                <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={() => setView('quick')}>Cancel</button>
                                <button type="button" className="btn-primary" style={{ flex: 1 }} onClick={() => onSave({ startDate: tempStart, dueDate: tempDue })}>Save</button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="picker-calendar">
                    <div className="cal-header">
                        <span className="month-label">{format(currentMonth, 'MMMM yyyy')}</span>
                        <div className="cal-nav">
                            <span className="today-btn" onClick={() => setCurrentMonth(new Date())}>Today</span>
                            <button className="icon-btn-ghost" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}><ChevronLeft size={16} /></button>
                            <button className="icon-btn-ghost" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}><ChevronRight size={16} /></button>
                        </div>
                    </div>

                    <div className="cal-grid-header">
                        {days.map(d => <div key={d}>{d}</div>)}
                    </div>

                    <div className="cal-days-grid">
                        {calendarDays.map((day, i) => {
                            const isSelect = (tempStart && isSameDay(day, new Date(tempStart))) ||
                                (tempDue && isSameDay(day, new Date(tempDue)));
                            const isToday = isSameDay(day, new Date());
                            const isCurrentMonth = isSameMonth(day, monthStart);
                            const inRange = isBetween(day);

                            return (
                                <div
                                    key={i}
                                    className={`cal-day ${!isCurrentMonth ? 'other-month' : ''} ${isSelect ? 'selected' : ''} ${isToday ? 'today' : ''} ${inRange ? 'in-range' : ''}`}
                                    onClick={() => handleDateClick(day)}
                                >
                                    {format(day, 'd')}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {view === 'quick' && (
                <div className="picker-global-footer">
                    <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
                    <button type="submit" className="btn-primary" onClick={() => onSave({ startDate: tempStart, dueDate: tempDue })}>Save dates</button>
                </div>
            )}
        </div>
    );

    if (triggerElement) {
        return createPortal(
            <>
                <div className="datepicker-backdrop" style={{ position: 'fixed', inset: 0, zIndex: 10000 }} onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                }} />
                {content}
            </>,
            document.body
        );
    }

    return content;
};

export default PremiumDatePicker;
