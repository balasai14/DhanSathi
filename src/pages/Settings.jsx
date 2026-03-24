import { useState } from 'react';
import {
  Moon,
  Sun,
  Bell,
  Lock,
  CreditCard,
  Globe,
  HelpCircle,
  LogOut,
  ChevronRight,
  User,
  Shield,
  ShieldCheck,
  EyeOff,
  Database,
  Share2,
} from 'lucide-react';
import { useTheme } from '../components/ThemeProvider';
import './Settings.css';

const settingsSections = [
  {
    title: 'Account',
    items: [
      { icon: User, label: 'Profile Settings', desc: 'Update your name, email, and photo' },
      { icon: Lock, label: 'Security', desc: 'Password, 2FA, and login activity' },
      { icon: CreditCard, label: 'Billing & Subscription', desc: 'Manage your plan and payment methods' },
    ],
  },
  {
    title: 'Preferences',
    items: [
      { icon: Bell, label: 'Notifications', desc: 'Email, push, and in-app alerts' },
      { icon: Globe, label: 'Language & Region', desc: 'English (US), USD' },
    ],
  },
  {
    title: 'Support',
    items: [
      { icon: HelpCircle, label: 'Help Center', desc: 'FAQs, guides, and contact support' },
      { icon: LogOut, label: 'Sign Out', desc: 'Log out of your account', danger: true },
    ],
  },
];

export default function Settings() {
  const { theme, toggleTheme } = useTheme();
  
  // Privacy states
  const [localProcessing, setLocalProcessing] = useState(true);
  const [dataSharing, setDataSharing] = useState(false);

  return (
    <div className="settings">
      <div className="settings-header animate-slide-up">
        <h2>Settings</h2>
        <p className="text-sm text-tertiary">Manage your account and preferences</p>
      </div>

      {/* Theme Toggle */}
      <div className="glass-card-static settings-theme-card animate-slide-up stagger-1">
        <div className="settings-theme-left">
          <div className="settings-theme-icon">
            {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
          </div>
          <div>
            <h3>Appearance</h3>
            <p className="text-sm text-tertiary">
              {theme === 'dark' ? 'Dark mode is active' : 'Light mode is active'}
            </p>
          </div>
        </div>
        <button className="theme-toggle-switch" onClick={toggleTheme}>
          <div className={`theme-toggle-track ${theme === 'light' ? 'theme-toggle-light' : ''}`}>
            <div className="theme-toggle-thumb">
              {theme === 'dark' ? <Moon size={12} /> : <Sun size={12} />}
            </div>
          </div>
        </button>
      </div>

      {/* Privacy Section */}
      <div className="settings-section animate-slide-up stagger-2" style={{ animationFillMode: 'both' }}>
        <h3 className="settings-section-title">Privacy & Security</h3>
        <div className="glass-card-static privacy-card">
          <div className="privacy-card-header">
            <div className="privacy-visual">
              <div className="shield-container">
                <Shield size={32} className="shield-base" />
                <ShieldCheck size={18} className="shield-check" />
                <div className="shield-pulse" />
              </div>
            </div>
            <div className="privacy-title-group">
              <h3>Your Data, Your Control</h3>
              <p className="text-sm text-tertiary">Your security is our highest priority.</p>
            </div>
          </div>

          <div className="privacy-features">
            <div className="privacy-feature">
              <EyeOff size={16} className="feature-icon" />
              <span>We anonymize your financial data</span>
            </div>
            <div className="privacy-feature">
              <Lock size={16} className="feature-icon" />
              <span>Zero-knowledge architecture</span>
            </div>
          </div>

          <div className="privacy-controls">
            <div className="privacy-control">
              <div className="control-info">
                <div className="control-label-row">
                  <Database size={16} />
                  <span>Local Processing</span>
                </div>
                <p className="control-desc">Analyze financial patterns directly on your device.</p>
              </div>
              <button 
                className={`custom-toggle ${localProcessing ? 'active' : ''}`}
                onClick={() => setLocalProcessing(!localProcessing)}
              >
                <div className="custom-toggle-thumb" />
              </button>
            </div>

            <div className="privacy-control">
              <div className="control-info">
                <div className="control-label-row">
                  <Share2 size={16} />
                  <span>Data Sharing</span>
                </div>
                <p className="control-desc">Allow anonymous data sharing to improve AI insights.</p>
              </div>
              <button 
                className={`custom-toggle ${dataSharing ? 'active' : ''}`}
                onClick={() => setDataSharing(!dataSharing)}
              >
                <div className="custom-toggle-thumb" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Sections */}
      {settingsSections.map((section, si) => (
        <div key={section.title} className="settings-section animate-slide-up" style={{ animationDelay: `${(si + 3) * 80}ms`, animationFillMode: 'both' }}>
          <h3 className="settings-section-title">{section.title}</h3>
          <div className="glass-card-static settings-section-card">
            {section.items.map((item, i) => (
              <button
                key={item.label}
                className={`settings-item ${item.danger ? 'settings-item-danger' : ''} ${
                  i < section.items.length - 1 ? 'settings-item-border' : ''
                }`}
              >
                <div className="settings-item-left">
                  <div className={`settings-item-icon ${item.danger ? 'settings-icon-danger' : ''}`}>
                    <item.icon size={18} />
                  </div>
                  <div className="settings-item-text">
                    <span className="settings-item-label">{item.label}</span>
                    <span className="settings-item-desc">{item.desc}</span>
                  </div>
                </div>
                <ChevronRight size={16} className="settings-item-chevron" />
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
