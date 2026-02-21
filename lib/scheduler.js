// Smart Scheduling Engine
// Implements backward scheduling, skill learning, financial, and health schedulers

import { GOAL_CATEGORIES } from './templates';

// Generate a unique ID
function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// Get dates between two dates (inclusive), optionally filtered by weekdays
function getDateRange(startDate, endDate, skipWeekends = false) {
    const dates = [];
    const current = new Date(startDate);
    const end = new Date(endDate);
    while (current <= end) {
        if (!skipWeekends || (current.getDay() !== 0 && current.getDay() !== 6)) {
            dates.push(new Date(current));
        }
        current.setDate(current.getDate() + 1);
    }
    return dates;
}

// Format date to YYYY-MM-DD
function formatDate(date) {
    return date.toISOString().split('T')[0];
}

/**
 * Backward Scheduler - schedules from target date working backwards
 * Used for exam prep, deadlines, etc.
 */
export function backwardSchedule(goal, targetDate, hoursPerDay = 2, startDate = null) {
    const start = startDate ? new Date(startDate) : new Date();
    const end = new Date(targetDate);
    const availableDays = getDateRange(start, end);

    if (availableDays.length === 0) return [];

    const totalHours = goal.estimatedHours || 100;
    const milestones = goal.milestones || [];
    const category = goal.category || 'study';
    const events = [];

    // Distribute hours with increasing intensity near the deadline
    // Spaced repetition curve: lighter at start, heavier near end
    const totalSlots = availableDays.length;
    const weights = availableDays.map((_, i) => {
        const progress = i / totalSlots;
        // Sigmoid-like curve for intensity ramp-up
        return 0.5 + 0.5 * Math.pow(progress, 0.7);
    });

    const totalWeight = weights.reduce((a, b) => a + b, 0);

    let cumulativeHours = 0;
    let currentMilestoneIdx = 0;

    for (let i = 0; i < availableDays.length; i++) {
        const dayHours = Math.min(
            hoursPerDay,
            Math.max(0.5, (totalHours * weights[i]) / totalWeight)
        );

        cumulativeHours += dayHours;
        const progress = (cumulativeHours / totalHours) * 100;

        // Determine which milestone this session falls under
        while (
            currentMilestoneIdx < milestones.length - 1 &&
            progress > milestones[currentMilestoneIdx].percent
        ) {
            currentMilestoneIdx++;
        }

        const milestone = milestones[currentMilestoneIdx] || { title: 'Study Session' };
        const startHour = 9; // Default start at 9 AM

        events.push({
            id: uid(),
            goalId: goal.id,
            title: `${goal.emoji || '📝'} ${milestone.title}`,
            date: formatDate(availableDays[i]),
            startHour,
            duration: Math.round(dayHours * 10) / 10,
            category,
            type: 'scheduled',
            progress: Math.min(100, Math.round(progress)),
        });
    }

    return events;
}

/**
 * Skill Learning Scheduler - progressive sessions with practice spacing
 */
export function skillSchedule(goal, weeksAvailable = 12, hoursPerWeek = 10) {
    const events = [];
    const start = new Date();
    const totalHours = goal.estimatedHours || 200;
    const milestones = goal.milestones || [];
    const category = goal.category || 'study';

    const sessionsPerWeek = Math.min(6, Math.max(3, Math.ceil(hoursPerWeek / 2)));
    const hoursPerSession = hoursPerWeek / sessionsPerWeek;

    // Distribute sessions across weeks
    const sessionDays = [1, 3, 5]; // Mon, Wed, Fri default
    if (sessionsPerWeek >= 4) sessionDays.push(2); // Add Tue
    if (sessionsPerWeek >= 5) sessionDays.push(4); // Add Thu
    if (sessionsPerWeek >= 6) sessionDays.push(6); // Add Sat

    let cumulativeHours = 0;

    for (let week = 0; week < weeksAvailable; week++) {
        for (const dayOfWeek of sessionDays) {
            const sessionDate = new Date(start);
            sessionDate.setDate(start.getDate() + week * 7 + (dayOfWeek - start.getDay()));

            if (sessionDate <= start) continue;
            if (cumulativeHours >= totalHours) break;

            cumulativeHours += hoursPerSession;
            const progress = (cumulativeHours / totalHours) * 100;

            // Find current milestone
            const milestone = milestones.find(m => progress <= m.percent) || milestones[milestones.length - 1] || { title: 'Practice Session' };

            events.push({
                id: uid(),
                goalId: goal.id,
                title: `${goal.emoji || '📚'} ${milestone.title}`,
                date: formatDate(sessionDate),
                startHour: 10,
                duration: Math.round(hoursPerSession * 10) / 10,
                category,
                type: 'scheduled',
                progress: Math.min(100, Math.round(progress)),
            });
        }
    }

    return events;
}

/**
 * Financial Planning Scheduler - monthly reviews and quarterly checkpoints
 */
export function financeSchedule(goal, monthsAvailable = 12) {
    const events = [];
    const start = new Date();
    const milestones = goal.milestones || [];
    const category = 'finance';

    for (let month = 0; month < monthsAvailable; month++) {
        const reviewDate = new Date(start);
        reviewDate.setMonth(start.getMonth() + month + 1);
        reviewDate.setDate(1); // First of each month

        const progress = ((month + 1) / monthsAvailable) * 100;
        const milestone = milestones.find(m => progress <= m.percent) || milestones[milestones.length - 1] || { title: 'Financial Review' };

        // Monthly review event
        events.push({
            id: uid(),
            goalId: goal.id,
            title: `${goal.emoji || '💰'} ${milestone.title}`,
            date: formatDate(reviewDate),
            startHour: 19,
            duration: 1,
            category,
            type: 'review',
            progress: Math.min(100, Math.round(progress)),
        });

        // Quarterly deep review
        if ((month + 1) % 3 === 0) {
            const quarterDate = new Date(reviewDate);
            quarterDate.setDate(15);
            events.push({
                id: uid(),
                goalId: goal.id,
                title: `${goal.emoji || '📊'} Quarterly Deep Review`,
                date: formatDate(quarterDate),
                startHour: 14,
                duration: 2,
                category,
                type: 'checkpoint',
                progress: Math.min(100, Math.round(progress)),
            });
        }
    }

    return events;
}

/**
 * Health/Fitness Scheduler - workout splits with rest days and deloads
 */
export function healthSchedule(goal, weeksAvailable = 16, sessionsPerWeek = 4) {
    const events = [];
    const start = new Date();
    const milestones = goal.milestones || [];
    const category = 'health';

    // Define workout types based on sessions per week
    const workoutTypes = sessionsPerWeek >= 4
        ? ['Upper Body', 'Lower Body', 'Cardio', 'Full Body', 'Active Recovery']
        : ['Full Body', 'Cardio', 'Full Body'];

    const sessionDays = [1, 2, 4, 5, 6].slice(0, sessionsPerWeek); // Mon-Sat

    for (let week = 0; week < weeksAvailable; week++) {
        const isDeloadWeek = (week + 1) % 4 === 0;
        const progress = ((week + 1) / weeksAvailable) * 100;
        const milestone = milestones.find(m => progress <= m.percent) || milestones[milestones.length - 1] || { title: 'Workout' };

        for (let s = 0; s < sessionsPerWeek; s++) {
            const sessionDate = new Date(start);
            sessionDate.setDate(start.getDate() + week * 7 + (sessionDays[s] - start.getDay()));

            if (sessionDate <= start) continue;

            const workoutType = workoutTypes[s % workoutTypes.length];
            const duration = isDeloadWeek ? 0.75 : 1.25;

            events.push({
                id: uid(),
                goalId: goal.id,
                title: `${goal.emoji || '💪'} ${isDeloadWeek ? '(Deload) ' : ''}${workoutType}`,
                date: formatDate(sessionDate),
                startHour: 7,
                duration,
                category,
                type: isDeloadWeek ? 'deload' : 'scheduled',
                progress: Math.min(100, Math.round(progress)),
            });
        }
    }

    return events;
}

/**
 * Auto-select the best scheduler based on goal category
 */
export function autoSchedule(goal, options = {}) {
    const {
        targetDate,
        hoursPerDay = 2,
        weeksAvailable = 12,
        hoursPerWeek = 10,
        monthsAvailable = 12,
        sessionsPerWeek = 4,
    } = options;

    switch (goal.category) {
        case 'study':
            if (targetDate) {
                return backwardSchedule(goal, targetDate, hoursPerDay);
            }
            return skillSchedule(goal, weeksAvailable, hoursPerWeek);
        case 'health':
            return healthSchedule(goal, weeksAvailable, sessionsPerWeek);
        case 'finance':
            return financeSchedule(goal, monthsAvailable);
        case 'career':
            if (targetDate) {
                return backwardSchedule(goal, targetDate, hoursPerDay);
            }
            return skillSchedule(goal, weeksAvailable, hoursPerWeek);
        default:
            return skillSchedule(goal, weeksAvailable, hoursPerWeek);
    }
}
