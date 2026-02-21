'use client';

import { Search, Bell, RefreshCw } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';

export default function Header() {
    const { settings } = useSettings();
    const provider = settings.preferences.calendarProvider;

    return (
        <header className="header">
            <div className="header-search">
                <Search />
                <input type="text" placeholder="Search goals, events, research..." />
            </div>

            <div className="header-right">
                <div className="sync-indicator">
                    <span className="sync-dot" />
                    <span>{provider === 'local' ? 'Local' : provider === 'google' ? 'Google' : 'Outlook'} Sync</span>
                </div>

                <button className="header-btn" title="Notifications">
                    <Bell />
                </button>

                <button className="header-btn" title="Refresh">
                    <RefreshCw />
                </button>
            </div>
        </header>
    );
}
