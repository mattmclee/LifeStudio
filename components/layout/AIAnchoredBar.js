'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Send, X, Plus, Check } from 'lucide-react';
import { useGoals } from '@/contexts/GoalContext';
import { useCalendar } from '@/contexts/CalendarContext';
import { autoSchedule } from '@/lib/scheduler';

const AMBITION_SUGGESTIONS = {
    'pilot': [
        { title: 'Private Pilot License (PPL)', description: 'Complete flight school theory and 45 hours of flight time.', category: 'career', hours: 200, emoji: '✈️' },
        { title: 'Aviation Theory Mastery', description: 'Study meteorology, navigation, and air law.', category: 'study', hours: 100, emoji: '📚' },
        { title: 'Physical Fitness for Pilots', description: 'Maintain cardiovascular health and vision standards.', category: 'health', hours: 80, emoji: '💪' }
    ],
    'doctor': [
        { title: 'Medical School Entrance Prep', description: 'Intensive study for UCAT/MCAT exams.', category: 'study', hours: 300, emoji: '🩺' },
        { title: 'Anatomy & Physiology Basics', description: 'Pre-study core medical concepts.', category: 'study', hours: 150, emoji: '📖' },
        { title: 'Clinical Volunteering', description: 'Gain 50 hours of experience in a hospital setting.', category: 'career', hours: 100, emoji: '🏥' }
    ],
    'spacex': [
        { title: 'Aerospace Engineering Core', description: 'Master propulsion, aerodynamics, and structural analysis.', category: 'study', hours: 250, emoji: '🚀' },
        { title: 'Python for Engineering', description: 'Learn automation and data analysis for space systems.', category: 'study', hours: 120, emoji: '🐍' },
        { title: 'Physical Endurance Training', description: 'High-intensity intervals for peak cognitive performance.', category: 'health', hours: 100, emoji: '🏃' }
    ],
    'entrepreneur': [
        { title: 'MVP Development', description: 'Build and launch the first version of your product.', category: 'career', hours: 200, emoji: '💡' },
        { title: 'Investment Pitch Deck', description: 'Create and refine your business case for investors.', category: 'finance', hours: 60, emoji: '📊' },
        { title: 'Market Research Sprint', description: 'Analyze competition and validate customer pain points.', category: 'career', hours: 80, emoji: '🔍' }
    ]
};

export default function AIAnchoredBar() {
    const [ambition, setAmbition] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [lastAdded, setLastAdded] = useState(null);
    const { goalDispatch } = useGoals();
    const { dispatch: calendarDispatch } = useCalendar();
    const inputRef = useRef(null);

    useEffect(() => {
        if (lastAdded) {
            const timer = setTimeout(() => setLastAdded(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [lastAdded]);

    const handleSearch = (e) => {
        if (e.key === 'Enter' || e.type === 'click') {
            const query = ambition.toLowerCase();
            let found = [];

            Object.keys(AMBITION_SUGGESTIONS).forEach(key => {
                if (query.includes(key)) {
                    found = [...found, ...AMBITION_SUGGESTIONS[key]];
                }
            });

            if (found.length === 0 && query.length > 3) {
                found = [
                    { title: `Master ${ambition} Fundamentals`, description: `Core learning path for becoming a ${ambition}.`, category: 'study', hours: 120, emoji: '🎯' },
                    { title: `${ambition} Networking`, description: `Build connections in the ${ambition} industry.`, category: 'career', hours: 40, emoji: '🤝' },
                    { title: `${ambition} Fitness & Wellness`, description: `Stay healthy while pursuing ${ambition}.`, category: 'health', hours: 60, emoji: '✨' }
                ];
            }

            if (found.length > 0) {
                setSuggestions(found);
                setShowSuggestions(true);
            }
        }
    };

    const addGoalFromAI = (suggestion) => {
        const id = Date.now() + Math.random().toString(36).substr(2, 9);
        const targetDate = new Date();
        targetDate.setMonth(targetDate.getMonth() + 2); // Default to 2 months out
        const targetDateStr = targetDate.toISOString().split('T')[0];
        const weeklyHours = 10;

        const template = {
            id,
            ...suggestion,
            estimatedHours: suggestion.hours,
            milestones: [
                { title: 'Foundation', percent: 25 },
                { title: 'Core Progress', percent: 50 },
                { title: 'Advanced Practice', percent: 75 },
                { title: 'Goal Achieved', percent: 100 }
            ]
        };

        // 1. Add Goal
        goalDispatch({
            type: 'ADD_GOAL',
            payload: { ...template, targetDate: targetDateStr, weeklyHours },
        });

        // 2. Auto-Schedule Events
        const events = autoSchedule(template, {
            targetDate: targetDateStr,
            hoursPerDay: 2,
            hoursPerWeek: weeklyHours,
            weeksAvailable: 8
        });

        calendarDispatch({
            type: 'ADD_EVENTS',
            payload: events
        });

        setLastAdded(suggestion.title);
        setSuggestions(suggestions.filter(s => s.title !== suggestion.title));
        if (suggestions.length <= 1) setShowSuggestions(false);
    };

    return (
        <div className="ai-anchored-bar-container">
            {lastAdded && (
                <div style={{
                    background: 'var(--success)',
                    color: '#fff',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    marginBottom: 10,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                    animation: 'slideUp 0.3s ease'
                }}>
                    <Check style={{ width: 14, height: 14 }} />
                    Added "{lastAdded}" to your plan!
                </div>
            )}

            {showSuggestions && (
                <div className="ai-suggestions-panel">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                        <h4 style={{ fontSize: '0.9rem', fontWeight: 800 }}>
                            <Sparkles style={{ width: 14, height: 14, display: 'inline', verticalAlign: 'middle', marginRight: 6, color: 'var(--accent-primary)' }} />
                            AI Suggestions
                        </h4>
                        <button className="btn-icon" onClick={() => setShowSuggestions(false)} style={{ width: 24, height: 24 }}>
                            <X style={{ width: 14, height: 14 }} />
                        </button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {suggestions.map((s, idx) => (
                            <div key={idx} className="ai-suggestion-item" onClick={() => addGoalFromAI(s)}>
                                <div className="suggestion-emoji">{s.emoji}</div>
                                <div className="suggestion-content">
                                    <div className="suggestion-title">{s.title}</div>
                                    <div className="suggestion-desc">{s.description}</div>
                                    <div className="suggestion-meta">
                                        <Plus style={{ width: 10, height: 10, display: 'inline', marginRight: 4 }} />
                                        Add {s.hours}h {s.category} plan
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="ai-anchored-bar">
                <div className="ai-icon-pulse">
                    <Sparkles style={{ width: 20, height: 20 }} />
                </div>
                <div className="ai-input-wrapper">
                    <input
                        ref={inputRef}
                        type="text"
                        className="ai-input"
                        placeholder="What is your ambition today? (e.g. Dream Job, Ambition)"
                        value={ambition}
                        onChange={(e) => setAmbition(e.target.value)}
                        onKeyDown={handleSearch}
                    />
                    {ambition && (
                        <button className="btn-icon" onClick={() => handleSearch({ type: 'click' })} style={{ background: 'var(--accent-gradient)', color: '#fff', width: 32, height: 32, borderRadius: '50%' }}>
                            <Send style={{ width: 14, height: 14 }} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
