import React, { useState, useEffect } from 'react';
import '../styles/ActivityLogs.css';

const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetchActivityLogs();
  }, []);

  const fetchActivityLogs = async () => {
    setLoading(true);
    try {
      // Replace with your actual API endpoint
      // const response = await fetch(`${API_URL}/activity-logs`);
      // const data = await response.json();
      // setLogs(data);
      setLogs([]);
    } catch (error) {
      console.error('Error fetching activity logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type) => {
    const icons = {
      'Task Created': '✨',
      'Task Updated': '✏️',
      'Task Assigned': '👤',
      'Project Created': '📁',
      'Project Updated': '📝',
      'User Added': '👥',
      'User Removed': '❌',
    };
    return icons[type] || '📋';
  };

  const getActivityColor = (type) => {
    if (type.includes('Created')) return 'created';
    if (type.includes('Updated')) return 'updated';
    if (type.includes('Assigned')) return 'assigned';
    if (type.includes('Removed')) return 'removed';
    return 'default';
  };

  const filteredLogs = logs.filter((log) =>
    filter === '' || log.type === filter
  );

  const uniqueTypes = [...new Set(logs.map((log) => log.type))];

  return (
    <div className="page-container activity-logs-page">
      <div className="page-header">
        <h1>Activity Logs</h1>
      </div>

      {/* Filter */}
      <section className="filter-section">
        <div className="filter-controls">
          <label htmlFor="activity-filter">Filter by:</label>
          <select
            id="activity-filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">All Activities</option>
            {uniqueTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* Activity Logs List */}
      <section className="logs-section">
        {loading ? (
          <div className="loading">Loading activity logs...</div>
        ) : filteredLogs.length === 0 ? (
          <div className="empty-state">
            <p>No activity logs found.</p>
          </div>
        ) : (
          <div className="logs-timeline">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className={`log-item log-${getActivityColor(log.type)}`}
              >
                <div className="log-icon">{getActivityIcon(log.type)}</div>
                <div className="log-content">
                  <div className="log-header">
                    <h3 className="log-type">{log.type}</h3>
                    <span className="log-time">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                  {log.description && (
                    <p className="log-description">{log.description}</p>
                  )}
                  {log.user && <p className="log-user">by {log.user}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default ActivityLogs;
