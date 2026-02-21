'use client';

import { useParams } from 'next/navigation';
import { useGoals } from '@/contexts/GoalContext';
import { useCalendar } from '@/contexts/CalendarContext';
import { GOAL_CATEGORIES } from '@/lib/templates';
import { getSuggestions } from '@/lib/suggestions';
import { ArrowLeft, Trash2, Award, Clock, Calendar, CheckCircle, Sparkles, Plus, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function GoalDetailPage() {
    const params = useParams();
    const { goalState, dispatch: goalDispatch } = useGoals();
    const { calendarState, dispatch: calendarDispatch } = useCalendar();
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [acceptedSuggestions, setAcceptedSuggestions] = useState(new Set());

    const goal = goalState.goals.find(g => g.instanceId === params.id);

    if (!goal) {
        return (
            <div className="animate-in empty-state">
                <div className="empty-state-icon">🔍</div>
                <h3>Goal not found</h3>
                <p>This goal may have been removed or completed.</p>
                <Link href="/goals" className="btn btn-primary" style={{ marginTop: 16 }}>
                    <ArrowLeft style={{ width: 14, height: 14 }} /> Back to Goals
                </Link>
            </div>
        );
    }

    const cat = GOAL_CATEGORIES[goal.category];
    const goalEvents = calendarState.events.filter(e => e.goalId === goal.id);
    const suggestions = getSuggestions(goal.category);

    const handleProgressUpdate = (newProgress) => {
        goalDispatch({
            type: 'UPDATE_PROGRESS',
            payload: { instanceId: goal.instanceId, progress: newProgress },
        });
    };

    const handleRemoveGoal = () => {
        calendarDispatch({ type: 'REMOVE_GOAL_EVENTS', payload: goal.id });
        goalDispatch({ type: 'REMOVE_GOAL', payload: goal.instanceId });
    };

    const handleAcceptSuggestion = (suggestion) => {
        setAcceptedSuggestions(prev => new Set([...prev, suggestion.id]));
        // If suggestion adds time, we could create extra events here
        if (suggestion.autoSchedule && suggestion.timeAdded > 0) {
            const uid = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            calendarDispatch({
                type: 'ADD_EVENT',
                payload: {
                    id: uid,
                    goalId: goal.id,
                    title: `${goal.customEmoji || cat?.emoji || '📝'} ${suggestion.title}`,
                    date: tomorrow.toISOString().split('T')[0],
                    startHour: 10,
                    duration: suggestion.timeAdded,
                    category: goal.category,
                    type: 'suggestion',
                },
            });
        }
    };

    return (
        <div className="animate-in">
            {/* Back nav */}
            <Link href="/goals" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 20, textDecoration: 'none' }}>
                <ArrowLeft style={{ width: 16, height: 16 }} /> Back to Goals
            </Link>

            {/* Goal Header */}
            <div className="card" style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                    <span style={{ fontSize: '2.5rem' }}>{goal.customEmoji || cat?.emoji || '🎯'}</span>
                    <div style={{ flex: 1 }}>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 4 }}>{goal.title}</h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: 12 }}>{goal.description}</p>
                        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                            <span className={`badge ${cat?.badgeClass || ''}`}>{cat?.label || goal.category}</span>
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                <Clock style={{ width: 13, height: 13 }} /> {goal.estimatedHours}h total
                            </span>
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                <Calendar style={{ width: 13, height: 13 }} /> {goalEvents.length} events scheduled
                            </span>
                        </div>
                    </div>
                    <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }} onClick={handleRemoveGoal}>
                        <Trash2 style={{ width: 14, height: 14 }} /> Remove
                    </button>
                </div>
            </div>

            <div className="grid-2">
                {/* Progress & Milestones */}
                <div>
                    <div className="section-header">
                        <h2>📊 Progress</h2>
                    </div>

                    <div className="card" style={{ marginBottom: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Overall Progress</span>
                            <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-primary)' }}>{goal.progress || 0}%</span>
                        </div>
                        <div className="progress-bar" style={{ height: 10, marginBottom: 16 }}>
                            <div className="progress-fill" style={{ width: `${goal.progress || 0}%` }} />
                        </div>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            {[0, 25, 50, 75, 100].map(p => (
                                <button
                                    key={p}
                                    className={`btn btn-sm ${(goal.progress || 0) >= p ? 'btn-primary' : 'btn-secondary'}`}
                                    onClick={() => handleProgressUpdate(p)}
                                >
                                    {p}%
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Milestones */}
                    <div className="card">
                        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 16 }}>
                            <Award style={{ width: 16, height: 16, display: 'inline', verticalAlign: 'middle', color: 'var(--accent-primary)' }} /> Milestones
                        </h3>
                        {(goal.milestones || []).map((ms, idx) => {
                            const reached = (goal.progress || 0) >= ms.percent;
                            return (
                                <div key={idx} style={{
                                    display: 'flex', alignItems: 'center', gap: 12,
                                    padding: '10px 0',
                                    borderBottom: idx < goal.milestones.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                                    opacity: reached ? 1 : 0.5,
                                }}>
                                    <CheckCircle style={{
                                        width: 18, height: 18,
                                        color: reached ? 'var(--success)' : 'var(--text-muted)',
                                        flexShrink: 0,
                                    }} />
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '0.85rem', fontWeight: reached ? 600 : 400 }}>{ms.title}</div>
                                    </div>
                                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{ms.percent}%</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Suggestions & Events */}
                <div>
                    <div className="section-header">
                        <h2>💡 AI Suggestions</h2>
                        <button className="btn btn-secondary btn-sm" onClick={() => setShowSuggestions(!showSuggestions)}>
                            {showSuggestions ? 'Hide' : 'Show'} Suggestions
                        </button>
                    </div>

                    {showSuggestions && (
                        <div style={{ marginBottom: 20 }}>
                            {suggestions.map(sug => {
                                const accepted = acceptedSuggestions.has(sug.id);
                                return (
                                    <div key={sug.id} className="suggestion-card">
                                        <div className="suggestion-header">
                                            <span className="suggestion-type">{sug.type}</span>
                                            <span style={{ fontSize: '0.72rem', color: sug.impact === 'High' ? 'var(--success)' : 'var(--warning)' }}>
                                                {sug.impact} Impact
                                            </span>
                                        </div>
                                        <div className="suggestion-title">{sug.title}</div>
                                        <div className="suggestion-desc">{sug.description}</div>
                                        <div className="suggestion-actions">
                                            {accepted ? (
                                                <button className="btn btn-secondary btn-sm" disabled style={{ opacity: 0.6 }}>
                                                    <CheckCircle style={{ width: 13, height: 13 }} /> Accepted
                                                </button>
                                            ) : (
                                                <>
                                                    <button className="btn btn-primary btn-sm" onClick={() => handleAcceptSuggestion(sug)}>
                                                        <Plus style={{ width: 13, height: 13 }} /> Accept
                                                    </button>
                                                    <button className="btn btn-ghost btn-sm">
                                                        <X style={{ width: 13, height: 13 }} /> Dismiss
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Upcoming events for this goal */}
                    <div className="section-header">
                        <h2>📅 Scheduled Sessions</h2>
                    </div>
                    {goalEvents.length === 0 ? (
                        <div className="card" style={{ textAlign: 'center', padding: 30 }}>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No events scheduled yet.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {goalEvents.slice(0, 10).map(event => (
                                <div key={event.id} className="card-flat" style={{ padding: 12 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <div style={{
                                            width: 4, height: 30, borderRadius: 2,
                                            background: cat?.color || 'var(--accent-primary)',
                                        }} />
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>{event.title}</div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                                {new Date(event.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                                {' · '}{event.startHour}:00 · {event.duration}h
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {goalEvents.length > 10 && (
                                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center', padding: 8 }}>
                                    +{goalEvents.length - 10} more events
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
