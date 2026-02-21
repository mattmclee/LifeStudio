'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard, Target, Calendar, Search, Settings,
    TrendingUp, ChevronRight
} from 'lucide-react';
import { useGoals } from '@/contexts/GoalContext';
import { GOAL_CATEGORIES } from '@/lib/templates';

const NAV_ITEMS = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/goals', label: 'My Goals', icon: Target },
    { href: '/calendar', label: 'Calendar', icon: Calendar },
    { href: '/research', label: 'Research', icon: Search },
    { href: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
    const pathname = usePathname();
    const { goalState } = useGoals();
    const activeGoals = goalState.goals || [];

    return (
        <aside className="sidebar">
            <div className="sidebar-brand">
                <h1>⚡ LifeForge</h1>
                <p>Goal-Driven Life Planner</p>
            </div>

            <nav className="sidebar-nav">
                <div className="nav-section-label">Navigation</div>
                {NAV_ITEMS.map(item => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href ||
                        (item.href !== '/' && pathname.startsWith(item.href));
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`nav-link ${isActive ? 'active' : ''}`}
                        >
                            <Icon />
                            <span>{item.label}</span>
                            {item.href === '/goals' && activeGoals.length > 0 && (
                                <span className="nav-badge">{activeGoals.length}</span>
                            )}
                        </Link>
                    );
                })}

                {activeGoals.length > 0 && (
                    <>
                        <div className="nav-section-label" style={{ marginTop: 8 }}>Active Goals</div>
                        {activeGoals.slice(0, 5).map(goal => {
                            const cat = GOAL_CATEGORIES[goal.category];
                            return (
                                <Link
                                    key={goal.instanceId}
                                    href={`/goals/${goal.instanceId}`}
                                    className="nav-link"
                                    style={{ fontSize: '0.82rem' }}
                                >
                                    <span style={{ fontSize: '1.1rem' }}>{goal.customEmoji || cat?.emoji || '🎯'}</span>
                                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {goal.title}
                                    </span>
                                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                        {goal.progress || 0}%
                                    </span>
                                </Link>
                            );
                        })}
                    </>
                )}
            </nav>

            <div style={{ padding: '16px', borderTop: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                        width: 36, height: 36, borderRadius: '50%',
                        background: 'var(--accent-gradient)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.85rem', fontWeight: 700, color: '#fff'
                    }}>
                        U
                    </div>
                    <div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>User</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Free Plan</div>
                    </div>
                </div>
            </div>
        </aside>
    );
}
