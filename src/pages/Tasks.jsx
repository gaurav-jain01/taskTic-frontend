import React, { useState, useEffect } from 'react';
import '../styles/Tasks.css';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTasks();
    fetchActivityLogs();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      // Replace with your actual API endpoint
      // const response = await fetch(`${API_URL}/tasks`);
      // const data = await response.json();
      // setTasks(data);
      setTasks([]);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchActivityLogs = async () => {
    try {
      // Replace with your actual API endpoint
      // const response = await fetch(`${API_URL}/activity-logs`);
      // const data = await response.json();
      // setActivityLogs(data);
      setActivityLogs([]);
    } catch (error) {
      console.error('Error fetching activity logs:', error);
    }
  };

  const getActivityIcon = (type) => {
    const icons = {
      'Task Created': '✨',
      'Task Updated': '✏️',
      'Task Assigned': '👤',
    };
    return icons[type] || '📋';
  };

  return (
    <div className="page-container tasks-page">
      <div className="page-header">
        <h1>Tasks</h1>
      </div>

      <div className="tasks-content">
        {/* Tasks Section */}
        <section className="tasks-section">
          <h2>Your Tasks</h2>
          {loading ? (
            <div className="loading">Loading tasks...</div>
          ) : tasks.length === 0 ? (
            <div className="empty-state">
              <p>No tasks yet.</p>
            </div>
          ) : (
            <div className="tasks-list">
              {tasks.map((task) => (
                <div key={task.id} className="task-card">
                  <h3>{task.title}</h3>
                  <p>{task.description}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Activity Logs Section */}
        <section className="activity-logs-section">
          <h2>Activity Logs</h2>
          <p className="section-subtitle">Don't overcomplicate.</p>
          
          <div className="activity-header">
            <p className="activity-label">Just show:</p>
          </div>

          <div className="activity-logs-box">
            {activityLogs.length === 0 ? (
              <div className="empty-activity">
                <p>
                  <span className="activity-item">Task Created</span>
                </p>
                <p>
                  <span className="activity-item">Task Updated</span>
                </p>
                <p>
                  <span className="activity-item">Task Assigned</span>
                </p>
              </div>
            ) : (
              <ul className="activity-list">
                {activityLogs.map((log) => (
                  <li key={log.id} className="activity-log-item">
                    <span className="activity-icon">{getActivityIcon(log.type)}</span>
                    <div className="activity-details">
                      <p className="activity-type">{log.type}</p>
                      <p className="activity-time">
                        {new Date(log.timestamp).toLocaleString()}
                      </p>
                      {log.user && <p className="activity-user">by {log.user}</p>}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <p className="storage-note">Store as simple records.</p>
        </section>
      </div>
    </div>
  );
};

export default Tasks;
