import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { Toaster } from 'react-hot-toast';

// Pages
import DashboardLayout from './pages/DashboardLayout';
import Projects from './pages/Projects';
import Tasks from './pages/Tasks';
import Team from './pages/Team';
import Chat from './pages/Chat';
import Assistant from './pages/Assistant';
import ActivityLogs from './pages/ActivityLogs';
import Members from './pages/Members';

// Auth pages
import Login from './pages/Login';
import Register from './pages/Register';


function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" />
        <Routes>
          {/* Root path - redirect to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Dashboard Routes */}
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Projects />} />
            <Route path="/dashboard/projects" element={<Projects />} />
            <Route path="/dashboard/tasks" element={<Tasks />} />
            <Route path="/dashboard/team" element={<Team />} />
            <Route path="/dashboard/chat" element={<Chat />} />
            <Route path="/dashboard/assistant" element={<Assistant />} />
            <Route path="/dashboard/activity-logs" element={<ActivityLogs />} />
            <Route path="/dashboard/members" element={<Members />} />
          </Route>

          {/* 404 Route */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
