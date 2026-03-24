import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  MessageSquare,
  TrendingUp,
  Lightbulb,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  LogOut,
  User,
} from 'lucide-react';
import './Sidebar.css';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/chat', icon: MessageSquare, label: 'AI Assistant' },
  { to: '/simulator', icon: TrendingUp, label: 'Simulator' },
  { to: '/recommendations', icon: Lightbulb, label: 'Insights' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar({ collapsed, onToggle, user, onLogout }) {
  const location = useLocation();

  return (
    <>
      <aside className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''}`}>
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="sidebar-logo">
            <Sparkles size={22} />
          </div>
          {!collapsed && <span className="sidebar-title gradient-text">Finova AI</span>}
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`
              }
              title={collapsed ? label : undefined}
            >
              <Icon size={20} />
              {!collapsed && <span>{label}</span>}
              {!collapsed && location.pathname === to && (
                <div className="sidebar-link-indicator" />
              )}
            </NavLink>
          ))}
        </nav>

        {/* User Section */}
        <div className="sidebar-footer">
          <div className="sidebar-user glass-card-static">
            <div className="user-avatar">
              <User size={18} />
            </div>
            {!collapsed && (
              <div className="user-info">
                <span className="user-name">{user?.name || 'User'}</span>
                <span className="user-plan text-xs text-tertiary">Free Plan</span>
              </div>
            )}
            {!collapsed && (
              <button className="btn-logout" onClick={onLogout} title="Logout">
                <LogOut size={16} />
              </button>
            )}
          </div>
          
          <button className="sidebar-toggle" onClick={onToggle}>
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      <div
        className={`sidebar-overlay ${!collapsed ? 'sidebar-overlay-visible' : ''}`}
        onClick={onToggle}
      />
    </>
  );
}
