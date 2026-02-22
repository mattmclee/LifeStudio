'use client';

import { useState } from 'react';
import { useGoals } from '@/contexts/GoalContext';
import { useCalendar } from '@/contexts/CalendarContext';
import { LIFE_STAGES, GOAL_TEMPLATES, GOAL_CATEGORIES } from '@/lib/templates';
import { autoSchedule } from '@/lib/scheduler';
import { Clock, Zap, Plus, Check, ChevronRight, Sparkles, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function GoalsPage() {
    const { goalState, dispatch: goalDispatch } = useGoals();
    const { dispatch: calendarDispatch } = useCalendar();
    const [selectedStage, setSelectedStage] = useState(goalState.lifeStage || null);
    const [addedGoalIds, setAddedGoalIds] = useState(new Set(goalState.goals.map(g => g.id)));
    const [showScheduleModal, setShowScheduleModal] = useState(null);
    const [showCustomModal, setShowCustomModal] = useState(false);
    const [targetDate, setTargetDate] = useState('');
    const [weeklyHours, setWeeklyHours] = useState(10);

    // Custom goal form state
    const [customGoal, setCustomGoal] = useState({
        title: '',
        description: '',
        category: 'study',
        estimatedHours: 40,
        emoji: '🎯'
    });

    const activeGoals = goalState.goals || [];
    const templates = selectedStage ? GOAL_TEMPLATES[selectedStage] || [] : [];

    function handleStageSelect(stageId) {
        setSelectedStage(stageId);
        goalDispatch({ type: 'SET_LIFE_STAGE', payload: stageId });
    }

    function handleAddGoal(template) {
        setShowScheduleModal(template);
        // Default target date to 3 months from now
        const target = new Date();
        target.setMonth(target.getMonth() + 3);
        setTargetDate(target.toISOString().split('T')[0]);
        setWeeklyHours(template.defaultWeeklyHours || 10);
    }

    function handleCreateCustomGoal() {
        // Just switch to the schedule modal with the custom goal data
        const id = 'custom-' + Date.now().toString(36);
        const template = {
            id,
            ...customGoal,
            milestones: [
                { title: 'Foundation', percent: 25 },
                { title: 'Core Progress', percent: 50 },
                { title: 'Advanced Practice', percent: 75 },
                { title: 'Goal Achieved', percent: 100 }
            ]
        };
        setShowCustomModal(false);
        handleAddGoal(template);
    }

    function confirmAddGoal() {
        if (!showScheduleModal) return;
        const template = showScheduleModal;

        // Add goal
        goalDispatch({
            type: 'ADD_GOAL',
            payload: { ...template, targetDate, weeklyHours },
        });

        // Auto-schedule events
        const events = autoSchedule(template, {
            targetDate: targetDate || undefined,
            hoursPerWeek: weeklyHours,
            weeksAvailable: 12,
            monthsAvailable: 12,
            sessionsPerWeek: 4,
        });

        if (events.length > 0) {
            calendarDispatch({ type: 'ADD_EVENTS', payload: events });
        }

        setAddedGoalIds(prev => new Set([...prev, template.id]));
        setShowScheduleModal(null);
    }

    const difficultyColor = (d) => {
        if (d === 'Easy') return 'var(--success)';
        if (d === 'Medium') return 'var(--warning)';
        return 'var(--danger)';
    };

    return (
        <div className="animate-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
                <div>
                    <h1 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 4 }}>
                        🎯 Goals
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        Select your life stage, pick goals, or create your own custom plan.
                    </p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowCustomModal(true)}>
                    <Plus style={{ width: 16, height: 16 }} /> Create Custom Goal
                </button>
            </div>

            {/* Life Stage Selector */}
            <div className="section-header">
                <h2>Choose Your Life Stage</h2>
            </div>
            <div className="stage-grid">
                {LIFE_STAGES.map(stage => (
                    <div
                        key={stage.id}
                        className={`stage-card ${selectedStage === stage.id ? 'selected' : ''}`}
                        onClick={() => handleStageSelect(stage.id)}
                    >
                        <div className="stage-emoji">{stage.emoji}</div>
                        <div className="stage-title">{stage.title}</div>
                        <div className="stage-age">{stage.ageRange}</div>
                    </div>
                ))}
            </div>

            {/* Active Goals Summary */}
            {activeGoals.length > 0 && (
                <div style={{ marginBottom: 28 }}>
                    <div className="section-header">
                        <h2>Your Active Goals ({activeGoals.length})</h2>
                    </div>
                    <div className="grid-3">
                        {activeGoals.map(goal => {
                            const cat = GOAL_CATEGORIES[goal.category];
                            return (
                                <Link key={goal.instanceId} href={`/goals/${goal.instanceId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <div className="goal-card">
                                        <div className="goal-card-emoji">{goal.customEmoji || cat?.emoji || '🎯'}</div>
                                        <div className="goal-card-title">{goal.title}</div>
                                        <div className="goal-card-desc">{goal.description}</div>
                                        <div className="progress-bar" style={{ marginBottom: 10 }}>
                                            <div className="progress-fill" style={{ width: `${goal.progress || 0}%` }} />
                                        </div>
                                        <div className="goal-card-meta">
                                            <span className={`badge ${cat?.badgeClass || ''}`}>{cat?.label || goal.category}</span>
                                            <span>{goal.progress || 0}% complete</span>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Goal Templates Grid */}
            {selectedStage && (
                <div>
                    <div className="section-header">
                        <div>
                            <h2>Available Goals</h2>
                            <p>Goals recommended for {LIFE_STAGES.find(s => s.id === selectedStage)?.title || 'your stage'}</p>
                        </div>
                    </div>
                    <div className="grid-3">
                        {templates.map(template => {
                            const cat = GOAL_CATEGORIES[template.category];
                            const isAdded = addedGoalIds.has(template.id);
                            return (
                                <div key={template.id} className="goal-card" style={{ cursor: 'default' }}>
                                    <div className="goal-card-emoji">{template.emoji}</div>
                                    <div className="goal-card-title">{template.title}</div>
                                    <div className="goal-card-desc">{template.description}</div>
                                    <div className="goal-card-meta" style={{ marginBottom: 14 }}>
                                        <span className={`badge ${cat?.badgeClass || ''}`}>{cat?.label?.split(' ')[0]}</span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <Clock style={{ width: 12, height: 12 }} /> {template.estimatedHours}h
                                        </span>
                                        <span style={{ color: difficultyColor(template.difficulty) }}>
                                            <Zap style={{ width: 12, height: 12, display: 'inline', verticalAlign: 'middle' }} /> {template.difficulty}
                                        </span>
                                    </div>
                                    {isAdded ? (
                                        <button className="btn btn-secondary btn-sm" disabled style={{ width: '100%', justifyContent: 'center', opacity: 0.6 }}>
                                            <Check style={{ width: 14, height: 14 }} /> Added
                                        </button>
                                    ) : (
                                        <button className="btn btn-primary btn-sm" style={{ width: '100%', justifyContent: 'center' }} onClick={() => handleAddGoal(template)}>
                                            <Plus style={{ width: 14, height: 14 }} /> Add & Schedule
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {!selectedStage && (
                <div className="empty-state">
                    <div className="empty-state-icon">👆</div>
                    <h3>Select a life stage above</h3>
                    <p>We&apos;ll show you recommended goals with smart scheduling suggestions based on your life stage.</p>
                </div>
            )}

            {/* Custom Goal Modal */}
            {showCustomModal && (
                <div className="modal-overlay" onClick={() => setShowCustomModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <h2 style={{ marginBottom: 4, fontSize: '1.15rem' }}>✨ Create Custom Goal</h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 20 }}>
                            Enter the details for your personalized goal.
                        </p>

                        <div className="form-group">
                            <label className="form-label">Goal Title</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="e.g. Learn Piano, Write a Book..."
                                value={customGoal.title}
                                onChange={e => setCustomGoal({ ...customGoal, title: e.target.value })}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Description</label>
                            <textarea
                                className="form-input"
                                style={{ minHeight: 80, resize: 'vertical' }}
                                placeholder="Describe your objective..."
                                value={customGoal.description}
                                onChange={e => setCustomGoal({ ...customGoal, description: e.target.value })}
                            />
                        </div>

                        <div className="grid-2">
                            <div className="form-group">
                                <label className="form-label">Category</label>
                                <select
                                    className="form-input"
                                    value={customGoal.category}
                                    onChange={e => setCustomGoal({ ...customGoal, category: e.target.value })}
                                >
                                    {Object.entries(GOAL_CATEGORIES).map(([id, cat]) => (
                                        <option key={id} value={id}>{cat.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Total Est. Hours</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    value={customGoal.estimatedHours}
                                    onChange={e => setCustomGoal({ ...customGoal, estimatedHours: Number(e.target.value) })}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 10 }}>
                            <button className="btn btn-secondary" onClick={() => setShowCustomModal(false)}>
                                Cancel
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleCreateCustomGoal}
                                disabled={!customGoal.title}
                            >
                                Next: Schedule <ChevronRight style={{ width: 14, height: 14 }} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Schedule Modal */}
            {showScheduleModal && (
                <div className="modal-overlay" onClick={() => setShowScheduleModal(null)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <h2 style={{ marginBottom: 4, fontSize: '1.15rem' }}>
                            {showScheduleModal.emoji} Schedule: {showScheduleModal.title}
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 20 }}>
                            Configure your schedule and we&apos;ll auto-generate calendar events.
                        </p>

                        <div className="form-group">
                            <label className="form-label">Target Completion Date</label>
                            <input
                                type="date"
                                className="form-input"
                                value={targetDate}
                                onChange={e => setTargetDate(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Weekly Hours Available</label>
                            <input
                                type="range"
                                min="2"
                                max="30"
                                value={weeklyHours}
                                onChange={e => setWeeklyHours(Number(e.target.value))}
                                style={{ width: '100%' }}
                            />
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                <span>2h/week</span>
                                <span style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>{weeklyHours}h/week</span>
                                <span>30h/week</span>
                            </div>
                        </div>

                        <div className="card-flat" style={{ marginBottom: 20, padding: 14 }}>
                            <div style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: 8 }}>
                                <Sparkles style={{ width: 14, height: 14, display: 'inline', verticalAlign: 'middle', color: 'var(--accent-primary)' }} /> Smart Schedule Preview
                            </div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                <div>• Total: ~{showScheduleModal.estimatedHours} hours over {Math.ceil(showScheduleModal.estimatedHours / weeklyHours)} weeks</div>
                                <div>• Sessions: {Math.ceil(weeklyHours / 2)}x per week, ~{(weeklyHours / Math.ceil(weeklyHours / 2)).toFixed(1)}h each</div>
                                <div>• {showScheduleModal.milestones?.length || 0} milestones auto-tracked</div>
                                <div>
                                    <Calendar style={{ width: 12, height: 12, display: 'inline', verticalAlign: 'middle' }} /> Events auto-added to your calendar
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                            <button className="btn btn-secondary" onClick={() => setShowScheduleModal(null)}>
                                Cancel
                            </button>
                            <button className="btn btn-primary" onClick={confirmAddGoal}>
                                <Sparkles style={{ width: 14, height: 14 }} /> Add & Auto-Schedule
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
