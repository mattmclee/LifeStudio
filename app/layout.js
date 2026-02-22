import './globals.css';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { GoalProvider } from '@/contexts/GoalContext';
import { CalendarProvider } from '@/contexts/CalendarContext';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';

export const metadata = {
  title: 'Life Studio — Goal-Driven Life Planner',
  description: 'Plan your life with smart scheduling, research-backed suggestions, and calendar integration. Cover studies, health, finances, and career goals.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="midnight" suppressHydrationWarning>
      <body>
        <SettingsProvider>
          <GoalProvider>
            <CalendarProvider>
              <div className="app-layout">
                <Sidebar />
                <div className="main-area">
                  <Header />
                  <main className="page-content">
                    {children}
                  </main>
                </div>
              </div>
            </CalendarProvider>
          </GoalProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
