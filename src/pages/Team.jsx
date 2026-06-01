import React, { useState, useEffect } from 'react';
import '../styles/Team.css';

const Team = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    name: '',
    email: '',
    role: '',
  });

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    setLoading(true);
    try {
      // Replace with your actual API endpoint
      // const response = await fetch(`${API_URL}/team`);
      // const data = await response.json();
      // setTeamMembers(data);
      setTeamMembers([]);
    } catch (error) {
      console.error('Error fetching team members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const filteredMembers = teamMembers.filter((member) => {
    return (
      (filters.name === '' || member.name.toLowerCase().includes(filters.name.toLowerCase())) &&
      (filters.email === '' || member.email.toLowerCase().includes(filters.email.toLowerCase())) &&
      (filters.role === '' || member.role === filters.role)
    );
  });

  return (
    <div className="page-container team-page">
      <div className="page-header">
        <h1>Team</h1>
      </div>

      {/* Show Filters */}
      <section className="filters-section">
        <h2>Show:</h2>
        <div className="filters-box">
          <div className="filter-group">
            <label htmlFor="filter-name">Name</label>
            <input
              id="filter-name"
              type="text"
              name="name"
              placeholder="Filter by name..."
              value={filters.name}
              onChange={handleFilterChange}
              className="filter-input"
            />
          </div>

          <div className="filter-group">
            <label htmlFor="filter-email">Email</label>
            <input
              id="filter-email"
              type="text"
              name="email"
              placeholder="Filter by email..."
              value={filters.email}
              onChange={handleFilterChange}
              className="filter-input"
            />
          </div>

          <div className="filter-group">
            <label htmlFor="filter-role">Role</label>
            <select
              id="filter-role"
              name="role"
              value={filters.role}
              onChange={handleFilterChange}
              className="filter-input"
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="member">Member</option>
            </select>
          </div>
        </div>
      </section>

      {/* Team Members Table */}
      <section className="team-list-section">
        {loading ? (
          <div className="loading">Loading team members...</div>
        ) : filteredMembers.length === 0 ? (
          <div className="empty-state">
            <p>No team members found.</p>
          </div>
        ) : (
          <div className="team-table-wrapper">
            <table className="team-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((member) => (
                  <tr key={member.id}>
                    <td>{member.name}</td>
                    <td>{member.email}</td>
                    <td>
                      <span className={`role-badge role-${member.role?.toLowerCase()}`}>
                        {member.role}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="action-btn view">View</button>
                        <button className="action-btn edit">Edit</button>
                        <button className="action-btn remove">Remove</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default Team;
