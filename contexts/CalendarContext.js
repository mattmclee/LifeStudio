'use client';

import { createContext, useContext, useReducer, useEffect } from 'react';
import { loadFromStorage, saveToStorage, STORAGE_KEYS } from '@/lib/storage';

const CalendarContext = createContext(null);

const DEFAULT_STATE = {
    events: [],
    view: 'month', // 'month' | 'week' | 'day'
    currentDate: new Date().toISOString(),
};

function calendarReducer(state, action) {
    switch (action.type) {
        case 'ADD_EVENTS':
            return { ...state, events: [...state.events, ...action.payload] };
        case 'ADD_EVENT':
            return { ...state, events: [...state.events, action.payload] };
        case 'REMOVE_EVENT':
            return { ...state, events: state.events.filter(e => e.id !== action.payload) };
        case 'REMOVE_GOAL_EVENTS':
            return { ...state, events: state.events.filter(e => e.goalId !== action.payload) };
        case 'UPDATE_EVENT':
            return {
                ...state,
                events: state.events.map(e =>
                    e.id === action.payload.id ? { ...e, ...action.payload.updates } : e
                ),
            };
        case 'SET_VIEW':
            return { ...state, view: action.payload };
        case 'SET_DATE':
            return { ...state, currentDate: action.payload };
        case 'LOAD_STATE':
            return { ...DEFAULT_STATE, ...action.payload, currentDate: new Date().toISOString() };
        case 'CLEAR_ALL':
            return { ...DEFAULT_STATE, currentDate: new Date().toISOString() };
        default:
            return state;
    }
}

export function CalendarProvider({ children }) {
    const [calendarState, dispatch] = useReducer(calendarReducer, DEFAULT_STATE);

    useEffect(() => {
        const saved = loadFromStorage(STORAGE_KEYS.EVENTS);
        if (saved) dispatch({ type: 'LOAD_STATE', payload: saved });
    }, []);

    useEffect(() => {
        saveToStorage(STORAGE_KEYS.EVENTS, calendarState);
    }, [calendarState]);

    return (
        <CalendarContext.Provider value={{ calendarState, dispatch }}>
            {children}
        </CalendarContext.Provider>
    );
}

export function useCalendar() {
    const ctx = useContext(CalendarContext);
    if (!ctx) throw new Error('useCalendar must be used within CalendarProvider');
    return ctx;
}
