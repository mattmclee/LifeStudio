'use client';

import { useGoals } from '@/contexts/GoalContext';
import { useCalendar } from '@/contexts/CalendarContext';
import { GOAL_CATEGORIES } from '@/lib/templates';
import { Target, Calendar, TrendingUp, Clock, ChevronRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
  const { goalState } = useGoals();
  const { calendarState } = useCalendar();
  const activeGoals = goalState.goals || [];
  const events = calendarState.events || [];

  const today = new Date().toISOString().split('T')[0];
  const todayEvents = events.filter(e => e.date === today);

  // Upcoming events (next 7 days)
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  const upcomingEvents = events
    .filter(e => e.date >= today && e.date <= nextWeek.toISOString().split('T')[0])
    .sort((a, b) => a.date.localeCompare(b.date) || a.startHour - b.startHour)
    .slice(0, 8);

  const totalHoursScheduled = events.reduce((sum, e) => sum + (e.duration || 0), 0);
  const avgProgress = activeGoals.length > 0
    ? Math.round(activeGoals.reduce((sum, g) => sum + (g.progress || 0), 0) / activeGoals.length)
    : 0;

  return (
    <div className="animate-in">
      {/* Welcome Section */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 4 }}>
          Welcome back! 👋
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Here&apos;s your life planning overview for today.
        </p>
      </div>

      {/* Stats Row */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-label">Active Goals</div>
          <div className="stat-value">{activeGoals.length}</div>
          <div className="stat-change">
            <Target style={{ width: 12, height: 12, display: 'inline', verticalAlign: 'middle' }} /> across {Object.keys(GOAL_CATEGORIES).length} categories
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Today&apos;s Events</div>
          <div className="stat-value">{todayEvents.length}</div>
          <div className="stat-change">
            <Calendar style={{ width: 12, height: 12, display: 'inline', verticalAlign: 'middle' }} /> scheduled tasks
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Avg. Progress</div>
          <div className="stat-value">{avgProgress}%</div>
          <div className="stat-change">
            <TrendingUp style={{ width: 12, height: 12, display: 'inline', verticalAlign: 'middle' }} /> across all goals
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Hours Scheduled</div>
          <div className="stat-value">{Math.round(totalHoursScheduled)}</div>
          <div className="stat-change">
            <Clock style={{ width: 12, height: 12, display: 'inline', verticalAlign: 'middle' }} /> total planned hours
          </div>
        </div>
      </div>

      <div className="grid-2">
        {/* Active Goals */}
        <div>
          <div className="section-header">
            <div>
              <h2>🎯 Active Goals</h2>
              <p>{activeGoals.length} goals in progress</p>
            </div>
            <Link href="/goals" className="btn btn-ghost btn-sm">
              View all <ChevronRight style={{ width: 14, height: 14 }} />
            </Link>
          </div>

          {activeGoals.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 40 }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🚀</div>
              <h3 style={{ marginBottom: 8, fontWeight: 600 }}>No goals yet</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 16 }}>
                Start by selecting your life stage and adding your first goal.
              </p>
              <Link href="/goals" className="btn btn-primary">
                <Sparkles style={{ width: 16, height: 16 }} /> Get Started
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {activeGoals.slice(0, 4).map(goal => {
                const cat = GOAL_CATEGORIES[goal.category];
                return (
                  <Link key={goal.instanceId} href={`/goals/${goal.instanceId}`} style={{ textDecoration: 'none' }}>
                    <div className="goal-card">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                        <span style={{ fontSize: '1.5rem' }}>{goal.customEmoji || cat?.emoji || '🎯'}</span>
                        <div style={{ flex: 1 }}>
                          <div className="goal-card-title">{goal.title}</div>
                          <span className={`badge ${cat?.badgeClass || ''}`}>{cat?.label || goal.category}</span>
                        </div>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
                          {goal.progress || 0}%
                        </span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${goal.progress || 0}%` }} />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Upcoming Events */}
        <div>
          <div className="section-header">
            <div>
              <h2>📅 Upcoming</h2>
              <p>Next 7 days</p>
            </div>
            <Link href="/calendar" className="btn btn-ghost btn-sm">
              Full Calendar <ChevronRight style={{ width: 14, height: 14 }} />
            </Link>
          </div>

          {upcomingEvents.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 40 }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>📭</div>
              <h3 style={{ marginBottom: 8, fontWeight: 600 }}>No upcoming events</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Add goals and auto-schedule them to see events here.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {upcomingEvents.map(event => {
                const cat = GOAL_CATEGORIES[event.category];
                const isToday = event.date === today;
                return (
                  <div key={event.id} className="card-flat" style={{ padding: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 4, height: 36, borderRadius: 2,
                        background: cat?.color || 'var(--accent-primary)',
                        flexShrink: 0,
                      }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 2 }}>
                          {event.title}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {isToday ? 'Today' : new Date(event.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                          {' · '}
                          {event.startHour}:00 — {event.duration}h
                        </div>
                      </div>
                      <span className={`badge ${cat?.badgeClass || ''}`} style={{ fontSize: '0.65rem' }}>
                        {cat?.label?.split(' ')[0] || event.category}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
