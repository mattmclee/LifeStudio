'use client';

import { useState, useMemo } from 'react';
import { useCalendar } from '@/contexts/CalendarContext';
import { useSettings } from '@/contexts/SettingsContext';
import { GOAL_CATEGORIES } from '@/lib/templates';
import { ChevronLeft, ChevronRight, Eye } from 'lucide-react';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAYS_MON = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function CalendarPage() {
    const { calendarState, dispatch } = useCalendar();
    const { settings } = useSettings();
    const [view, setView] = useState(settings.preferences.defaultCalendarView || 'month');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedEvent, setSelectedEvent] = useState(null);

    const events = calendarState.events || [];
    const isMondayStart = settings.preferences.weekStartDay === 'monday';
    const dayLabels = isMondayStart ? DAYS_MON : DAYS;

    // Calendar calculations
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    let startOffset = firstDay.getDay();
    if (isMondayStart) startOffset = startOffset === 0 ? 6 : startOffset - 1;

    const daysInMonth = lastDay.getDate();
    const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;

    const cells = [];
    for (let i = 0; i < totalCells; i++) {
        const dayNum = i - startOffset + 1;
        const d = new Date(year, month, dayNum);
        const dateStr = d.toISOString().split('T')[0];
        const isCurrentMonth = dayNum >= 1 && dayNum <= daysInMonth;
        const isToday = dateStr === todayStr;
        const dayEvents = events.filter(e => e.date === dateStr);
        cells.push({ dayNum, dateStr, date: d, isCurrentMonth, isToday, events: dayEvents });
    }

    // Week view calculations 
    const weekStart = new Date(currentDate);
    const dayOfWeek = weekStart.getDay();
    const mondayOffset = isMondayStart ? (dayOfWeek === 0 ? -6 : 1 - dayOfWeek) : -dayOfWeek;
    weekStart.setDate(weekStart.getDate() + mondayOffset);

    const weekDays = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date(weekStart);
        d.setDate(weekStart.getDate() + i);
        const dateStr = d.toISOString().split('T')[0];
        weekDays.push({
            date: d,
            dateStr,
            label: d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }),
            isToday: dateStr === todayStr,
            events: events.filter(e => e.date === dateStr),
        });
    }

    const hours = Array.from({ length: 14 }, (_, i) => i + 6); // 6 AM to 7 PM

    function navigate(dir) {
        const d = new Date(currentDate);
        if (view === 'month') {
            d.setMonth(d.getMonth() + dir);
        } else {
            d.setDate(d.getDate() + 7 * dir);
        }
        setCurrentDate(d);
    }

    const goalEmojis = settings.goalEmojis || {};

    return (
        <div className="animate-in">
            {/* Calendar Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <div>
                    <h1 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 2 }}>
                        📅 Calendar
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                        {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <div className="tabs" style={{ marginBottom: 0 }}>
                        <button className={`tab ${view === 'month' ? 'active' : ''}`} onClick={() => setView('month')}>Month</button>
                        <button className={`tab ${view === 'week' ? 'active' : ''}`} onClick={() => setView('week')}>Week</button>
                    </div>
                    <button className="btn btn-ghost btn-icon" onClick={() => navigate(-1)}>
                        <ChevronLeft style={{ width: 18, height: 18 }} />
                    </button>
                    <button className="btn btn-secondary btn-sm" onClick={() => setCurrentDate(new Date())}>Today</button>
                    <button className="btn btn-ghost btn-icon" onClick={() => navigate(1)}>
                        <ChevronRight style={{ width: 18, height: 18 }} />
                    </button>
                </div>
            </div>

            {/* Month View */}
            {view === 'month' && (
                <div className="calendar-grid">
                    {dayLabels.map(d => (
                        <div key={d} className="calendar-header-cell">{d}</div>
                    ))}
                    {cells.map((cell, idx) => (
                        <div
                            key={idx}
                            className={`calendar-cell ${cell.isToday ? 'today' : ''} ${!cell.isCurrentMonth ? 'other-month' : ''}`}
                        >
                            <div className="calendar-date">{cell.date.getDate()}</div>
                            {cell.events.slice(0, 3).map(event => {
                                const cat = GOAL_CATEGORIES[event.category];
                                const customEmoji = goalEmojis[event.goalId];
                                return (
                                    <div
                                        key={event.id}
                                        className={`calendar-event ${cat?.eventClass || ''}`}
                                        onClick={() => setSelectedEvent(event)}
                                        title={event.title}
                                    >
                                        {customEmoji && <span style={{ marginRight: 2 }}>{customEmoji}</span>}
                                        {event.title}
                                    </div>
                                );
                            })}
                            {cell.events.length > 3 && (
                                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', padding: '1px 4px' }}>
                                    +{cell.events.length - 3} more
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Week View */}
            {view === 'week' && (
                <div className="week-view">
                    {/* Header row */}
                    <div className="calendar-header-cell" style={{ background: 'var(--bg-secondary)' }}></div>
                    {weekDays.map(wd => (
                        <div key={wd.dateStr} className={`week-day-header ${wd.isToday ? 'today' : ''}`}>
                            {wd.label}
                        </div>
                    ))}

                    {/* Time slots */}
                    {hours.map(hour => (
                        <Fragment key={hour}>
                            <div className="week-time-label">{hour}:00</div>
                            {weekDays.map(wd => {
                                const cellEvents = wd.events.filter(e => e.startHour === hour);
                                return (
                                    <div key={wd.dateStr + hour} className={`week-cell ${wd.isToday ? 'today' : ''}`}>
                                        {cellEvents.map(event => {
                                            const cat = GOAL_CATEGORIES[event.category];
                                            const customEmoji = goalEmojis[event.goalId];
                                            const heightPx = Math.max(24, (event.duration || 1) * 48);
                                            return (
                                                <div
                                                    key={event.id}
                                                    className={`week-event ${cat?.eventClass || ''}`}
                                                    style={{
                                                        top: 0,
                                                        height: `${heightPx}px`,
                                                        background: `${cat?.color || 'var(--accent-primary)'}22`,
                                                        borderLeft: `3px solid ${cat?.color || 'var(--accent-primary)'}`,
                                                        color: cat?.color || 'var(--accent-primary)',
                                                    }}
                                                    onClick={() => setSelectedEvent(event)}
                                                >
                                                    {customEmoji && <span>{customEmoji} </span>}
                                                    {event.title}
                                                </div>
                                            );
                                        })}
                                    </div>
                                );
                            })}
                        </Fragment>
                    ))}
                </div>
            )}

            {/* Event Detail Modal */}
            {selectedEvent && (
                <div className="modal-overlay" onClick={() => setSelectedEvent(null)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                            <h2 style={{ fontSize: '1.1rem' }}>{selectedEvent.title}</h2>
                            <button className="btn btn-ghost btn-icon" onClick={() => setSelectedEvent(null)}>✕</button>
                        </div>
                        <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                            <div>📅 {new Date(selectedEvent.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</div>
                            <div>🕐 {selectedEvent.startHour}:00 — {selectedEvent.startHour + Math.ceil(selectedEvent.duration)}:00 ({selectedEvent.duration}h)</div>
                            <div>📁 {GOAL_CATEGORIES[selectedEvent.category]?.label || selectedEvent.category}</div>
                            {selectedEvent.progress !== undefined && (
                                <div>📊 Progress: {selectedEvent.progress}%</div>
                            )}
                        </div>
                        <div style={{ marginTop: 16, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                            <button className="btn btn-secondary btn-sm" onClick={() => {
                                dispatch({ type: 'REMOVE_EVENT', payload: selectedEvent.id });
                                setSelectedEvent(null);
                            }}>
                                Remove Event
                            </button>
                            <button className="btn btn-primary btn-sm" onClick={() => setSelectedEvent(null)}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Fragment helper for week view
function Fragment({ children }) {
    return <>{children}</>;
}
