import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { ThemeProvider } from './components/ThemeProvider';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import AIChat from './pages/AIChat';
import Simulator from './pages/Simulator';
import Recommendations from './pages/Recommendations';
import Settings from './pages/Settings';
import Auth from './pages/Auth';

import './index.css';

// Higher-order component to protect private routes
function ProtectedRoute({ children }) {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex-center min-h-screen bg-black">
        <div className="loader-pulse" />
      </div>
    );
  }
  
  if (!currentUser) {
    return <Navigate to="/auth" />;
  }
  
  return children;
}

function AppShell() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const toggleSidebar = () => setSidebarCollapsed((prev) => !prev);
  const location = useLocation();
  const { currentUser, logout } = useAuth();

  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState('fadeIn');

  useEffect(() => {
    if (location !== displayLocation) setTransitionStage('fadeOut');
  }, [location, displayLocation]);

  const onAnimationEnd = () => {
    if (transitionStage === 'fadeOut') {
      setTransitionStage('fadeIn');
      setDisplayLocation(location);
    }
  };

  if (location.pathname === '/landing' || location.pathname === '/auth') {
    return (
      <Routes>
        <Route path="/landing" element={<Landing />} />
        <Route path="/auth" element={currentUser ? <Navigate to="/" /> : <Auth />} />
      </Routes>
    );
  }

  return (
    <div className="app-layout">
      <div className="bg-gradient-orb bg-gradient-orb-1" />
      <div className="bg-gradient-orb bg-gradient-orb-2" />

      <Sidebar 
        collapsed={sidebarCollapsed} 
        onToggle={toggleSidebar} 
        user={currentUser}
        onLogout={logout}
      />

      <div className={`main-area ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <Topbar onMenuClick={toggleSidebar} user={currentUser} />
        
        <main 
          key={location.pathname} 
          className="page-content page-transition"
          onAnimationEnd={onAnimationEnd}
        >
          <Routes location={location}>
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute><AIChat /></ProtectedRoute>} />
            <Route path="/simulator" element={<ProtectedRoute><Simulator /></ProtectedRoute>} />
            <Route path="/recommendations" element={<ProtectedRoute><Recommendations /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppShell />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
