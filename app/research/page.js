'use client';

import { useState } from 'react';
import { useGoals } from '@/contexts/GoalContext';
import { useCalendar } from '@/contexts/CalendarContext';
import { searchResearch, getSuggestions } from '@/lib/suggestions';
import { GOAL_CATEGORIES } from '@/lib/templates';
import { Search, Sparkles, BookOpen, Plus, CheckCircle, ExternalLink, FileText } from 'lucide-react';

export default function ResearchPage() {
    const { goalState } = useGoals();
    const { dispatch: calendarDispatch } = useCalendar();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [selectedResult, setSelectedResult] = useState(null);
    const [selectedGoal, setSelectedGoal] = useState(null);
    const [acceptedSuggestions, setAcceptedSuggestions] = useState(new Set());
    const activeGoals = goalState.goals || [];

    function handleSearch(e) {
        e.preventDefault();
        if (!query.trim()) return;
        const found = searchResearch(query);
        setResults(found);
        setSelectedResult(found[0] || null);
    }

    const suggestions = selectedGoal ? getSuggestions(selectedGoal.category) : [];

    function handleAcceptSuggestion(sug) {
        setAcceptedSuggestions(prev => new Set([...prev, sug.id]));
        if (sug.autoSchedule && selectedGoal) {
            const uid = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            calendarDispatch({
                type: 'ADD_EVENT',
                payload: {
                    id: uid,
                    goalId: selectedGoal.id,
                    title: `${selectedGoal.customEmoji || '📝'} ${selectedGoal.title} : ${sug.title}`,
                    date: tomorrow.toISOString().split('T')[0],
                    startHour: 10,
                    duration: sug.timeAdded || 1,
                    category: selectedGoal.category,
                    type: 'suggestion',
                },
            });
        }
    }

    return (
        <div className="animate-in">
            <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 4 }}>
                    🔬 Research & Discover
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    Search for information related to your goals. Get AI-powered suggestions and add them to your calendar.
                </p>
            </div>

            {/* Goal Selector */}
            {activeGoals.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                    <label className="form-label">Select a goal for contextual suggestions</label>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {activeGoals.map(goal => {
                            const cat = GOAL_CATEGORIES[goal.category];
                            const isSelected = selectedGoal?.instanceId === goal.instanceId;
                            return (
                                <button
                                    key={goal.instanceId}
                                    className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                                    onClick={() => setSelectedGoal(isSelected ? null : goal)}
                                >
                                    {goal.customEmoji || cat?.emoji || '🎯'} {goal.title}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            <div className="research-layout">
                {/* Search Sidebar */}
                <div className="research-sidebar">
                    <form onSubmit={handleSearch}>
                        <div style={{ position: 'relative' }}>
                            <Search style={{
                                position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                                width: 16, height: 16, color: 'var(--text-muted)',
                            }} />
                            <input
                                type="text"
                                className="form-input"
                                style={{ paddingLeft: 38 }}
                                placeholder="Search topics (e.g., exam preparation, muscle building)..."
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                            />
                        </div>
                    </form>

                    {/* Suggestions for selected goal */}
                    {selectedGoal && suggestions.length > 0 && (
                        <div>
                            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', padding: '8px 2px', display: 'flex', alignItems: 'center', gap: 6 }}>
                                <Sparkles style={{ width: 13, height: 13, color: 'var(--accent-primary)' }} />
                                SUGGESTIONS FOR {selectedGoal.title.toUpperCase()}
                            </div>
                            {suggestions.map(sug => {
                                const accepted = acceptedSuggestions.has(sug.id);
                                return (
                                    <div key={sug.id} className="suggestion-card" style={{ marginBottom: 8 }}>
                                        <div className="suggestion-header">
                                            <span className="suggestion-type">{sug.type}</span>
                                            <span style={{ fontSize: '0.68rem', color: sug.impact === 'High' ? 'var(--success)' : 'var(--warning)' }}>
                                                {sug.impact}
                                            </span>
                                        </div>
                                        <div className="suggestion-title" style={{ fontSize: '0.85rem' }}>{sug.title}</div>
                                        <div className="suggestion-desc" style={{ fontSize: '0.78rem' }}>{sug.description}</div>
                                        <div className="suggestion-actions">
                                            {accepted ? (
                                                <span style={{ fontSize: '0.75rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                                    <CheckCircle style={{ width: 13, height: 13 }} /> Added to calendar
                                                </span>
                                            ) : (
                                                <button className="btn btn-primary btn-sm" onClick={() => handleAcceptSuggestion(sug)}>
                                                    <Plus style={{ width: 12, height: 12 }} /> Add to Schedule
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Search Results */}
                    {results.length > 0 && (
                        <div>
                            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', padding: '8px 2px', display: 'flex', alignItems: 'center', gap: 6 }}>
                                <BookOpen style={{ width: 13, height: 13 }} />
                                SEARCH RESULTS ({results.length})
                            </div>
                            {results.map(r => (
                                <div
                                    key={r.id}
                                    className={`search-result-card ${selectedResult?.id === r.id ? 'active' : ''}`}
                                    onClick={() => setSelectedResult(r)}
                                >
                                    <div className="search-result-title">{r.title}</div>
                                    <div className="search-result-snippet">{r.snippet}</div>
                                    <div className="search-result-source">
                                        <FileText style={{ width: 11, height: 11, display: 'inline', verticalAlign: 'middle' }} /> {r.source}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Main Content Area */}
                <div className="research-main">
                    {selectedResult ? (
                        <div className="animate-in-right">
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <ExternalLink style={{ width: 12, height: 12 }} /> {selectedResult.source}
                                </span>
                            </div>
                            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 16, lineHeight: 1.4 }}>
                                {selectedResult.title}
                            </h2>
                            <div style={{
                                padding: 16, background: 'var(--bg-hover)', borderRadius: 'var(--radius-md)',
                                marginBottom: 20, borderLeft: '3px solid var(--accent-primary)',
                            }}>
                                <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--accent-primary)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <Sparkles style={{ width: 13, height: 13 }} /> AI Summary
                                </div>
                                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                                    {selectedResult.content}
                                </p>
                            </div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>Key Takeaways</h3>
                                <ul style={{ paddingLeft: 20 }}>
                                    {selectedResult.content.split('. ').slice(0, 4).map((sentence, i) => (
                                        <li key={i} style={{ marginBottom: 8 }}>{sentence.trim()}{sentence.endsWith('.') ? '' : '.'}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ) : (
                        <div className="empty-state">
                            <div className="empty-state-icon">🔍</div>
                            <h3>Search for a topic</h3>
                            <p>Try searching for &quot;exam preparation&quot;, &quot;muscle building&quot;, &quot;financial planning&quot;, or &quot;career development&quot;.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
