import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import '../styles/Projects.css';

const Projects = () => {
  const { user, role } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch projects from API
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      // Replace with your actual API endpoint
      // const response = await fetch(`${API_URL}/projects`);
      // const data = await response.json();
      // setProjects(data);
      setProjects([]);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const canCreate = role === 'admin' || role === 'manager';
  const canEdit = role === 'admin' || role === 'manager';
  const canDelete = role === 'admin';

  const handleCreate = () => {
    // Navigate to create project page or open modal
    console.log('Create new project');
  };

  const handleEdit = (projectId) => {
    // Navigate to edit project page or open modal
    console.log('Edit project:', projectId);
  };

  const handleDelete = (projectId) => {
    // Delete project with confirmation
    console.log('Delete project:', projectId);
  };

  return (
    <div className="page-container projects-page">
      <div className="page-header">
        <h1>Projects</h1>
        {canCreate && (
          <button className="btn btn-primary" onClick={handleCreate}>
            + New Project
          </button>
        )}
      </div>

      {/* Admin Section */}
      {role === 'admin' && (
        <section className="role-section admin-section">
          <h2>Admin</h2>
          <div className="permissions-box">
            <button className="permission-btn" onClick={handleCreate}>
              Create
            </button>
            <button className="permission-btn" onClick={() => handleEdit('demo')}>
              Edit
            </button>
            <button className="permission-btn delete" onClick={() => handleDelete('demo')}>
              Delete
            </button>
          </div>
        </section>
      )}

      {/* Manager Section */}
      {(role === 'manager' || role === 'admin') && (
        <section className="role-section manager-section">
          <h2>Manager</h2>
          <div className="permissions-box">
            <button className="permission-btn" onClick={handleCreate}>
              Create
            </button>
            <button className="permission-btn" onClick={() => handleEdit('demo')}>
              Edit
            </button>
          </div>
        </section>
      )}

      {/* Member Section */}
      {role === 'member' && (
        <section className="role-section member-section">
          <h2>Member</h2>
          <div className="permissions-box">
            <button className="permission-btn view">
              View
            </button>
          </div>
        </section>
      )}

      {/* Projects List */}
      <section className="projects-list-section">
        <h2>Your Projects</h2>
        {loading ? (
          <div className="loading">Loading projects...</div>
        ) : projects.length === 0 ? (
          <div className="empty-state">
            <p>No projects yet. {canCreate && 'Create your first project!'}</p>
          </div>
        ) : (
          <div className="projects-grid">
            {projects.map((project) => (
              <div key={project.id} className="project-card">
                <h3>{project.name}</h3>
                <p>{project.description}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Projects;
