import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import '../styles/CreateTeamModal.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const CreateTeamModal = ({ isOpen, onClose, onSuccess, teamToEdit }) => {
  const { user, token } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [usersList, setUsersList] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
      if (teamToEdit) {
        setName(teamToEdit.name);
        setDescription(teamToEdit.description || '');
        setSelectedMembers(teamToEdit.members ? teamToEdit.members.map(m => m._id) : []);
      } else {
        setName('');
        setDescription('');
        setSelectedMembers([]);
      }
    }
  }, [isOpen, teamToEdit]);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/users`);
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      
      // Filter out the current admin from the selection list if desired, 
      // though it's okay to let them select themselves. Let's just exclude them 
      // from the checklist to avoid confusion, they will be added as admin anyway.
      const filteredData = data.filter(u => u._id !== user.id);
      setUsersList(filteredData);
    } catch (err) {
      console.error('Error fetching users for team creation:', err);
    }
  };

  const handleToggleMember = (userId) => {
    setSelectedMembers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const url = teamToEdit ? `${API_URL}/teams/${teamToEdit._id}` : `${API_URL}/teams`;
      const method = teamToEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          description,
          adminId: user.id,
          memberIds: selectedMembers
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${teamToEdit ? 'update' : 'create'} team`);
      }

      const updatedTeam = await response.json();
      
      toast.success(teamToEdit ? 'Team updated successfully!' : 'Team created successfully!');
      onSuccess(updatedTeam.team);
      
      // Reset form
      setName('');
      setDescription('');
      setSelectedMembers([]);
      setSearchQuery('');
      onClose();

    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const filteredUsers = usersList.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="modal-overlay">
      <div className="modal-content team-modal">
        <h2>{teamToEdit ? 'Edit Team' : 'Create New Team'}</h2>
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Team Name *</label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
              placeholder="E.g., Engineering Team"
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="What is this team responsible for?"
            />
          </div>

          <div className="form-group members-selection">
            <label>Select Team Members</label>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="member-search-input"
            />
            <div className="users-list-container">
              {filteredUsers.length === 0 ? (
                <p style={{ padding: '1rem', color: '#666', fontSize: '14px' }}>No users found.</p>
              ) : (
                filteredUsers.map(u => (
                  <div key={u._id} className="user-selection-item" onClick={() => handleToggleMember(u._id)}>
                    <input 
                      type="checkbox" 
                      checked={selectedMembers.includes(u._id)} 
                      readOnly
                    />
                    <div className="user-selection-info">
                      <span className="user-selection-name">{u.name}</span>
                      <span className="user-selection-email">{u.email}</span>
                      <span className={`role-badge role-${u.role?.toLowerCase()}`}>{u.role}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? (teamToEdit ? 'Updating...' : 'Creating...') : (teamToEdit ? 'Update Team' : 'Create Team')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTeamModal;
