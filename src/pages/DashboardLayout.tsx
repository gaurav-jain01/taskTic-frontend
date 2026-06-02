import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import '../styles/DashboardLayout.css';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="dashboard-layout">
      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
      <main className={`dashboard-main ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
