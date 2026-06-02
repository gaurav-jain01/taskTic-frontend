import React from 'react';
import '../styles/CreateTeamModal.css';

const ViewTeamModal = ({ isOpen, onClose, team }) => {
  if (!isOpen || !team) return null;

  const members = team.members || [];

  return (
    <div className="modal-overlay">
      <div className="modal-content team-modal" style={{ maxWidth: '600px' }}>
        <h2>{team.name}</h2>
        {team.description && <p style={{ color: '#666', marginBottom: '20px' }}>{team.description}</p>}
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '16px' }}>Team Members ({members.length})</h3>
        </div>

        <div className="users-list-container" style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #eee', borderRadius: '8px' }}>
          {members.length === 0 ? (
            <p style={{ padding: '1rem', color: '#666', fontSize: '14px' }}>No members in this team.</p>
          ) : (
            members.map(u => (
              <div key={u._id} className="user-selection-item" style={{ cursor: 'default' }}>
                <div className="user-selection-info" style={{ marginLeft: '12px' }}>
                  <span className="user-selection-name">{u.name}</span>
                  <span className="user-selection-email">{u.email}</span>
                  <span className={`role-badge role-${u.role?.toLowerCase()}`}>{u.role}</span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="modal-actions" style={{ marginTop: '24px' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewTeamModal;
