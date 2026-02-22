'use client';

import { useState, useRef } from 'react';
import { useSettings } from '@/contexts/SettingsContext';
import { useGoals } from '@/contexts/GoalContext';
import { GOAL_CATEGORIES } from '@/lib/templates';
import { Palette, Smile, SlidersHorizontal, Upload, Trash2, Monitor, Moon, Sun, Waves, TreePine } from 'lucide-react';

const THEMES = [
    {
        id: 'midnight',
        label: 'Midnight',
        icon: Moon,
        sidebar: '#0e1425',
        main: '#0a0f1e',
        accent: '#6366f1',
        bar: '#818cf8',
    },
    {
        id: 'light',
        label: 'Light',
        icon: Sun,
        sidebar: '#e2e8f0',
        main: '#f8fafc',
        accent: '#6366f1',
        bar: '#a5b4fc',
    },
    {
        id: 'ocean',
        label: 'Ocean',
        icon: Waves,
        sidebar: '#0c1830',
        main: '#0c1222',
        accent: '#06b6d4',
        bar: '#22d3ee',
    },
    {
        id: 'forest',
        label: 'Forest',
        icon: TreePine,
        sidebar: '#0f1f16',
        main: '#0a1410',
        accent: '#22c55e',
        bar: '#4ade80',
    },
    {
        id: 'sunset',
        label: 'Sunset',
        icon: Sun,
        sidebar: '#2a1610',
        main: '#1a0f0a',
        accent: '#f97316',
        bar: '#fb923c',
    },
];

const EMOJI_CATEGORIES = {
    Study: ['📚', '📝', '📖', '🎓', '💡', '🔬', '📐', '🧮', '💻', '🖊️', '📓', '🎒', '🏫', '📊', '🧠', '🔍'],
    Health: ['💪', '🏋️', '🏃', '🧘', '🚴', '🏊', '🥗', '❤️', '🏅', '⚡', '🏆', '🎯', '💊', '🧬', '🩺', '🥑'],
    Finance: ['💰', '📈', '🏦', '💳', '💎', '📊', '🏠', '🚗', '✈️', '💵', '🪙', '📋', '🐷', '💸', '🏧', '📉'],
    Career: ['🎯', '🚀', '👔', '💼', '🏆', '⭐', '📱', '🌐', '🤝', '📣', '🎨', '🔧', '🛠️', '📡', '🎙️', '🗂️'],
};

export default function SettingsPage() {
    const { settings, dispatch } = useSettings();
    const { goalState } = useGoals();
    const [activeTab, setActiveTab] = useState('theme');
    const [selectedGoalForEmoji, setSelectedGoalForEmoji] = useState(null);
    const fileInputRef = useRef(null);

    const activeGoals = goalState.goals || [];

    function handleThemeChange(themeId) {
        dispatch({ type: 'SET_THEME', payload: themeId });
    }

    function handleEmojiSelect(emoji) {
        if (!selectedGoalForEmoji) return;
        dispatch({
            type: 'SET_GOAL_EMOJI',
            payload: { goalId: selectedGoalForEmoji, emoji },
        });
    }

    function handleRemoveEmoji(goalId) {
        dispatch({ type: 'REMOVE_GOAL_EMOJI', payload: goalId });
    }

    function handleStickerUpload(e) {
        if (!selectedGoalForEmoji || !e.target.files?.[0]) return;
        const file = e.target.files[0];
        if (file.size > 50000) {
            alert('Sticker too large. Max 50KB.');
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            dispatch({
                type: 'SET_CUSTOM_STICKER',
                payload: { goalId: selectedGoalForEmoji, dataUrl: reader.result },
            });
        };
        reader.readAsDataURL(file);
    }

    function handlePreferenceChange(key, value) {
        dispatch({ type: 'UPDATE_PREFERENCES', payload: { [key]: value } });
    }

    return (
        <div className="animate-in settings-layout">
            <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 4 }}>
                    ⚙️ Settings
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    Personalize your Life Studio experience.
                </p>
            </div>

            {/* Tabs */}
            <div className="tabs">
                <button className={`tab ${activeTab === 'theme' ? 'active' : ''}`} onClick={() => setActiveTab('theme')}>
                    <Palette style={{ width: 14, height: 14, display: 'inline', verticalAlign: 'middle' }} /> Themes
                </button>
                <button className={`tab ${activeTab === 'emoji' ? 'active' : ''}`} onClick={() => setActiveTab('emoji')}>
                    <Smile style={{ width: 14, height: 14, display: 'inline', verticalAlign: 'middle' }} /> Emoji & Stickers
                </button>
                <button className={`tab ${activeTab === 'preferences' ? 'active' : ''}`} onClick={() => setActiveTab('preferences')}>
                    <SlidersHorizontal style={{ width: 14, height: 14, display: 'inline', verticalAlign: 'middle' }} /> Preferences
                </button>
            </div>

            {/* Theme Tab */}
            {activeTab === 'theme' && (
                <div className="settings-section">
                    <div className="settings-section-title">
                        <Palette /> Choose Theme
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 20 }}>
                        Select a theme that suits your style. Changes apply instantly.
                    </p>
                    <div className="theme-grid">
                        {THEMES.map(theme => {
                            const isActive = settings.theme === theme.id;
                            return (
                                <div
                                    key={theme.id}
                                    className={`theme-swatch ${isActive ? 'active' : ''}`}
                                    onClick={() => handleThemeChange(theme.id)}
                                >
                                    <div className="theme-preview">
                                        <div className="theme-preview-sidebar" style={{ background: theme.sidebar }} />
                                        <div className="theme-preview-main" style={{ background: theme.main }}>
                                            <div className="theme-preview-bar" style={{ background: theme.accent }} />
                                            <div className="theme-preview-bar" style={{ background: theme.bar, width: '60%' }} />
                                            <div className="theme-preview-bar" style={{ background: theme.bar, width: '40%', opacity: 0.5 }} />
                                        </div>
                                    </div>
                                    <div className="theme-swatch-label">
                                        {isActive && '✓ '}{theme.label}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Emoji & Stickers Tab */}
            {activeTab === 'emoji' && (
                <div className="settings-section">
                    <div className="settings-section-title">
                        <Smile /> Goal Emoji & Stickers
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 20 }}>
                        Assign custom emoji or stickers to your goals. They&apos;ll appear on calendar events for easy visual scanning.
                    </p>

                    {activeGoals.length === 0 ? (
                        <div className="card" style={{ textAlign: 'center', padding: 30 }}>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                Add some goals first to customize their emoji.<br />
                                Go to <a href="/goals" style={{ color: 'var(--accent-primary)' }}>My Goals</a> to get started.
                            </p>
                        </div>
                    ) : (
                        <div>
                            {/* Goal Selector */}
                            <label className="form-label">Select a goal to customize</label>
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
                                {activeGoals.map(goal => {
                                    const cat = GOAL_CATEGORIES[goal.category];
                                    const isSelected = selectedGoalForEmoji === goal.id;
                                    const customEmoji = settings.goalEmojis[goal.id];
                                    return (
                                        <button
                                            key={goal.instanceId}
                                            className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                                            onClick={() => setSelectedGoalForEmoji(isSelected ? null : goal.id)}
                                        >
                                            <span style={{ fontSize: '1.1rem' }}>{customEmoji || goal.customEmoji || cat?.emoji || '🎯'}</span>
                                            {goal.title}
                                        </button>
                                    );
                                })}
                            </div>

                            {selectedGoalForEmoji && (
                                <div className="card" style={{ marginBottom: 20 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                        <h3 style={{ fontSize: '0.95rem', fontWeight: 600 }}>
                                            Pick an emoji
                                        </h3>
                                        {settings.goalEmojis[selectedGoalForEmoji] && (
                                            <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }} onClick={() => handleRemoveEmoji(selectedGoalForEmoji)}>
                                                <Trash2 style={{ width: 13, height: 13 }} /> Remove
                                            </button>
                                        )}
                                    </div>

                                    {Object.entries(EMOJI_CATEGORIES).map(([catName, emojis]) => (
                                        <div key={catName} style={{ marginBottom: 16 }}>
                                            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8 }}>
                                                {catName}
                                            </div>
                                            <div className="emoji-grid">
                                                {emojis.map(emoji => (
                                                    <button
                                                        key={emoji}
                                                        className={`emoji-btn ${settings.goalEmojis[selectedGoalForEmoji] === emoji ? 'selected' : ''}`}
                                                        onClick={() => handleEmojiSelect(emoji)}
                                                    >
                                                        {emoji}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}

                                    {/* Custom Sticker Upload */}
                                    <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 16, marginTop: 8 }}>
                                        <div style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: 8 }}>
                                            Or upload a custom sticker
                                        </div>
                                        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                                            <button className="btn btn-secondary btn-sm" onClick={() => fileInputRef.current?.click()}>
                                                <Upload style={{ width: 13, height: 13 }} /> Upload Image
                                            </button>
                                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Max 50KB, PNG/SVG/GIF</span>
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/png,image/svg+xml,image/gif"
                                                style={{ display: 'none' }}
                                                onChange={handleStickerUpload}
                                            />
                                        </div>
                                        {settings.customStickers[selectedGoalForEmoji] && (
                                            <div style={{ marginTop: 10 }}>
                                                <img
                                                    src={settings.customStickers[selectedGoalForEmoji]}
                                                    alt="Custom sticker"
                                                    style={{ width: 40, height: 40, objectFit: 'contain', borderRadius: 4 }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Current Emoji Assignments */}
                            {Object.keys(settings.goalEmojis).length > 0 && (
                                <div>
                                    <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 12 }}>Current Assignments</h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        {activeGoals.filter(g => settings.goalEmojis[g.id]).map(goal => (
                                            <div key={goal.instanceId} className="card-flat" style={{ padding: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
                                                <span style={{ fontSize: '1.5rem' }}>{settings.goalEmojis[goal.id]}</span>
                                                <span style={{ flex: 1, fontSize: '0.88rem', fontWeight: 500 }}>{goal.title}</span>
                                                <button className="btn btn-ghost btn-sm" onClick={() => handleRemoveEmoji(goal.id)}>
                                                    <Trash2 style={{ width: 12, height: 12 }} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
                <div className="settings-section">
                    <div className="settings-section-title">
                        <SlidersHorizontal /> General Preferences
                    </div>

                    <div className="card" style={{ marginBottom: 16 }}>
                        <div className="form-group">
                            <label className="form-label">Default Calendar View</label>
                            <select
                                className="form-select"
                                value={settings.preferences.defaultCalendarView}
                                onChange={e => handlePreferenceChange('defaultCalendarView', e.target.value)}
                            >
                                <option value="month">Month</option>
                                <option value="week">Week</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Week Starts On</label>
                            <select
                                className="form-select"
                                value={settings.preferences.weekStartDay}
                                onChange={e => handlePreferenceChange('weekStartDay', e.target.value)}
                            >
                                <option value="sunday">Sunday</option>
                                <option value="monday">Monday</option>
                            </select>
                        </div>

                        <div className="toggle-wrapper">
                            <div>
                                <div className="toggle-label">Browser Notifications</div>
                                <div className="toggle-sublabel">Get reminders for scheduled events</div>
                            </div>
                            <label className="toggle">
                                <input
                                    type="checkbox"
                                    checked={settings.preferences.notifications}
                                    onChange={e => handlePreferenceChange('notifications', e.target.checked)}
                                />
                                <span className="toggle-slider" />
                            </label>
                        </div>
                    </div>

                    <div className="card">
                        <div className="settings-section-title" style={{ marginBottom: 12 }}>
                            <Monitor style={{ width: 18, height: 18, color: 'var(--accent-primary)' }} /> Calendar Sync
                        </div>

                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Calendar Provider</label>
                            <select
                                className="form-select"
                                value={settings.preferences.calendarProvider}
                                onChange={e => handlePreferenceChange('calendarProvider', e.target.value)}
                            >
                                <option value="local">Local (In-App Only)</option>
                                <option value="google">Google Calendar</option>
                                <option value="outlook">Microsoft Outlook</option>
                            </select>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 8 }}>
                                {settings.preferences.calendarProvider === 'local'
                                    ? 'Events are stored locally in your browser.'
                                    : `OAuth integration with ${settings.preferences.calendarProvider === 'google' ? 'Google Calendar' : 'Microsoft Outlook'} requires API credentials in .env.local`
                                }
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
