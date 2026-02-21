'use client';

import { createContext, useContext, useReducer, useEffect } from 'react';
import { loadFromStorage, saveToStorage, STORAGE_KEYS } from '@/lib/storage';

const GoalContext = createContext(null);

const DEFAULT_STATE = {
    lifeStage: null,
    goals: [],       // Active goals with user customizations
    completed: [],   // Completed goals
};

function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function goalReducer(state, action) {
    switch (action.type) {
        case 'SET_LIFE_STAGE':
            return { ...state, lifeStage: action.payload };
        case 'ADD_GOAL': {
            const goal = {
                ...action.payload,
                instanceId: uid(),
                addedAt: new Date().toISOString(),
                progress: 0,
                status: 'active',
                customEmoji: action.payload.emoji,
                notes: '',
                targetDate: action.payload.targetDate || null,
                weeklyHours: action.payload.defaultWeeklyHours || 10,
            };
            return { ...state, goals: [...state.goals, goal] };
        }
        case 'UPDATE_GOAL':
            return {
                ...state,
                goals: state.goals.map(g =>
                    g.instanceId === action.payload.instanceId
                        ? { ...g, ...action.payload.updates }
                        : g
                ),
            };
        case 'REMOVE_GOAL':
            return {
                ...state,
                goals: state.goals.filter(g => g.instanceId !== action.payload),
            };
        case 'COMPLETE_GOAL': {
            const goal = state.goals.find(g => g.instanceId === action.payload);
            if (!goal) return state;
            return {
                ...state,
                goals: state.goals.filter(g => g.instanceId !== action.payload),
                completed: [...state.completed, { ...goal, status: 'completed', completedAt: new Date().toISOString() }],
            };
        }
        case 'UPDATE_PROGRESS':
            return {
                ...state,
                goals: state.goals.map(g =>
                    g.instanceId === action.payload.instanceId
                        ? { ...g, progress: action.payload.progress }
                        : g
                ),
            };
        case 'LOAD_STATE':
            return { ...DEFAULT_STATE, ...action.payload };
        case 'RESET':
            return { ...DEFAULT_STATE };
        default:
            return state;
    }
}

export function GoalProvider({ children }) {
    const [goalState, dispatch] = useReducer(goalReducer, DEFAULT_STATE);

    useEffect(() => {
        const saved = loadFromStorage(STORAGE_KEYS.GOALS);
        if (saved) dispatch({ type: 'LOAD_STATE', payload: saved });
    }, []);

    useEffect(() => {
        saveToStorage(STORAGE_KEYS.GOALS, goalState);
    }, [goalState]);

    return (
        <GoalContext.Provider value={{ goalState, dispatch }}>
            {children}
        </GoalContext.Provider>
    );
}

export function useGoals() {
    const ctx = useContext(GoalContext);
    if (!ctx) throw new Error('useGoals must be used within GoalProvider');
    return ctx;
}
