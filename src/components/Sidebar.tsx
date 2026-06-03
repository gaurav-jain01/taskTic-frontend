import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../styles/Sidebar.css';

const Sidebar = ({ isOpen, onToggle }) => {
  const location = useLocation();
  const { logout, user } = useAuth();

  const menuItems = [
    { path: '/dashboard/projects', label: 'Projects', icon: '📁' },
    { path: '/dashboard/tasks', label: 'Tasks', icon: '✓' },
    { path: '/dashboard/team', label: 'Team', icon: '👥' },
    { path: '/dashboard/members', label: 'Members List', icon: '📋' },
    { path: '/dashboard/chat', label: 'Chat', icon: '💬' },
    { path: '/dashboard/assistant', label: 'Assistant', icon: '🤖' },
    { path: '/dashboard/activity-logs', label: 'Activity Logs', icon: '📜' },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-header">
        <h1 className="sidebar-title">TaskTic</h1>
        <button className="sidebar-toggle" onClick={onToggle}>
          {isOpen ? '✕' : '☰'}
        </button>
      </div>

      <div className="sidebar-user">
        {isOpen && (
          <>
            <div className="user-avatar">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="user-info">
              <p className="user-name">{user?.name || 'User'}</p>
              <p className="user-role">{user?.role || 'Member'}</p>
            </div>
          </>
        )}
      </div>

      <nav className="sidebar-nav">
        <ul className="nav-list">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
                title={item.label}
              >
                <span className="nav-icon">{item.icon}</span>
                {isOpen && <span className="nav-label">{item.label}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <button className="logout-btn" onClick={handleLogout} title="Logout">
          <span className="logout-icon">🚪</span>
          {isOpen && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
