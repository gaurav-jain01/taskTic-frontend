import React, { useState, useEffect } from 'react';
import '../styles/CreateTaskModal.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const CreateTaskModal = ({ isOpen, onClose, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('todo');
  const [projectId, setProjectId] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  
  const [projectsList, setProjectsList] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  useEffect(() => {
    if (projectId && assignedTo) {
      const selectedProject = projectsList.find((p: any) => p._id === projectId);
      const projectTeamId = selectedProject?.teamId?._id || selectedProject?.teamId;
      const userStillValid = usersList.some((u: any) => u._id === assignedTo && u.teamId === projectTeamId);
      if (!userStillValid) {
        setAssignedTo('');
      }
    }
  }, [projectId, projectsList, usersList]);

  const fetchData = async () => {
    try {
      const [projectsRes, usersRes] = await Promise.all([
        fetch(`${API_URL}/projects`),
        fetch(`${API_URL}/users`)
      ]);
      
      if (!projectsRes.ok || !usersRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const projectsData = await projectsRes.json();
      const usersData = await usersRes.json();

      setProjectsList(projectsData);
      setUsersList(usersData);
    } catch (err) {
      console.error('Error fetching data for task creation:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!projectId) {
      setError('Please select a project.');
      return;
    }
    if (!assignedTo) {
      setError('Please select a user to assign the task to.');
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title,
          description,
          status,
          projectId,
          assignedTo
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create task');
      }

      const newTask = await response.json();
      
      onSuccess(newTask);
      
      // Reset form
      setTitle('');
      setDescription('');
      setStatus('todo');
      setProjectId('');
      setAssignedTo('');
      onClose();

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content task-modal">
        <h2>Assign New Task</h2>
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Task Title *</label>
            <input 
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              required 
              placeholder="E.g., Design Login Page"
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="Provide details about the task..."
            />
          </div>

          <div className="form-group-row">
            <div className="form-group half-width">
              <label>Status *</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                required
                className="task-select-input"
              >
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="review">Review</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div className="form-group half-width">
              <label>Project *</label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                required
                className="task-select-input"
              >
                <option value="" disabled>Select a project</option>
                {projectsList.map(project => (
                  <option key={project._id} value={project._id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Assign To *</label>
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              required
              disabled={!projectId}
              className="task-select-input"
            >
              <option value="" disabled>
                {!projectId ? 'Select a project first' : 'Select a user'}
              </option>
              {usersList
                .filter(user => {
                  if (!projectId) return false;
                  const selectedProject = projectsList.find(p => p._id === projectId);
                  const projectTeamId = selectedProject?.teamId?._id || selectedProject?.teamId;
                  return user.teamId === projectTeamId;
                })
                .map(user => (
                  <option key={user._id} value={user._id}>
                    {user.name} ({user.email}) - {user.role}
                  </option>
                ))}
            </select>
            {projectId && usersList.filter(user => {
              const selectedProject = projectsList.find(p => p._id === projectId);
              const projectTeamId = selectedProject?.teamId?._id || selectedProject?.teamId;
              return user.teamId === projectTeamId;
            }).length === 0 && (
              <span style={{color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block'}}>
                No users found in this project's team.
              </span>
            )}
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Assigning...' : 'Assign Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTaskModal;
