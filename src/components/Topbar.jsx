import { useLocation } from 'react-router-dom';
import { Search, Bell, Moon, Sun, Menu } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import './Topbar.css';

const pageTitles = {
  '/': 'Dashboard',
  '/chat': 'AI Assistant',
  '/simulator': 'Scenario Simulator',
  '/recommendations': 'Insights & Recommendations',
  '/settings': 'Settings',
};

export default function Topbar({ onMenuClick, user }) {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  
  // Clean path for dynamic titles (handles potential id params later)
  const path = location.pathname;
  const title = pageTitles[path] || 'Dashboard';

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="topbar-menu-btn" onClick={onMenuClick}>
          <Menu size={20} />
        </button>
        <div>
          <h1 className="topbar-title">{title}</h1>
        </div>
      </div>

      <div className="topbar-right">
        <div className="topbar-actions">
          <button className="hq-icon-btn" onClick={toggleTheme} title="Toggle theme">
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          <button className="hq-icon-btn hq-notif-btn" title="Notifications">
            <Bell size={17} />
            <span className="hq-notif-badge" />
          </button>

          <div className="hq-avatar" title={user?.name || 'User Profile'}>
            <div className="hq-avatar-inner">
              {user?.name?.[0].toUpperCase() || 'S'}
            </div>
            <div className="hq-avatar-ring" />
          </div>
        </div>
      </div>
    </header>
  );
}
