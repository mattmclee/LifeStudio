'use client';

import { createContext, useContext, useReducer, useEffect } from 'react';
import { loadFromStorage, saveToStorage, STORAGE_KEYS } from '@/lib/storage';

const SettingsContext = createContext(null);

const DEFAULT_SETTINGS = {
    theme: 'midnight',
    goalEmojis: {},       // { goalId: emoji }
    customStickers: {},   // { goalId: base64DataUrl }
    preferences: {
        defaultCalendarView: 'month',
        weekStartDay: 'monday',
        notifications: true,
        calendarProvider: 'local', // 'local' | 'google' | 'outlook'
    },
};

function settingsReducer(state, action) {
    switch (action.type) {
        case 'SET_THEME':
            return { ...state, theme: action.payload };
        case 'SET_GOAL_EMOJI':
            return {
                ...state,
                goalEmojis: { ...state.goalEmojis, [action.payload.goalId]: action.payload.emoji },
            };
        case 'REMOVE_GOAL_EMOJI': {
            const emojis = { ...state.goalEmojis };
            delete emojis[action.payload];
            return { ...state, goalEmojis: emojis };
        }
        case 'SET_CUSTOM_STICKER':
            return {
                ...state,
                customStickers: { ...state.customStickers, [action.payload.goalId]: action.payload.dataUrl },
            };
        case 'UPDATE_PREFERENCES':
            return {
                ...state,
                preferences: { ...state.preferences, ...action.payload },
            };
        case 'LOAD_SETTINGS':
            return { ...DEFAULT_SETTINGS, ...action.payload };
        case 'RESET':
            return { ...DEFAULT_SETTINGS };
        default:
            return state;
    }
}

export function SettingsProvider({ children }) {
    const [settings, dispatch] = useReducer(settingsReducer, DEFAULT_SETTINGS);

    // Load from localStorage on mount
    useEffect(() => {
        const saved = loadFromStorage(STORAGE_KEYS.SETTINGS);
        if (saved) {
            dispatch({ type: 'LOAD_SETTINGS', payload: saved });
        }
    }, []);

    // Save to localStorage on change
    useEffect(() => {
        saveToStorage(STORAGE_KEYS.SETTINGS, settings);
    }, [settings]);

    // Apply theme to document
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', settings.theme);
    }, [settings.theme]);

    return (
        <SettingsContext.Provider value={{ settings, dispatch }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const ctx = useContext(SettingsContext);
    if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
    return ctx;
}
