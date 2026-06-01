const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Fetch all activity logs
 */
export const fetchActivityLogs = async (token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/activity-logs`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch activity logs');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    throw error;
  }
};

/**
 * Log a task created activity
 */
export const logTaskCreated = async (token, taskData) => {
  return logActivity(token, 'Task Created', `Task "${taskData.title}" was created`, taskData);
};

/**
 * Log a task updated activity
 */
export const logTaskUpdated = async (token, taskData) => {
  return logActivity(token, 'Task Updated', `Task "${taskData.title}" was updated`, taskData);
};

/**
 * Log a task assigned activity
 */
export const logTaskAssigned = async (token, taskData) => {
  return logActivity(token, 'Task Assigned', `Task "${taskData.title}" was assigned to ${taskData.assignedTo}`, taskData);
};

/**
 * Generic log activity function
 */
export const logActivity = async (token, type, description, metadata = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}/activity-logs`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type,
        description,
        metadata,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to log activity');
    }

    return await response.json();
  } catch (error) {
    console.error('Error logging activity:', error);
    throw error;
  }
};

/**
 * Get activity logs for a specific project
 */
export const getProjectActivityLogs = async (token, projectId) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/projects/${projectId}/activity-logs`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch project activity logs');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching project activity logs:', error);
    throw error;
  }
};

/**
 * Get activity logs for a specific task
 */
export const getTaskActivityLogs = async (token, taskId) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/tasks/${taskId}/activity-logs`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch task activity logs');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching task activity logs:', error);
    throw error;
  }
};
