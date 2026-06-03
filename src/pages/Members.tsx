import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const API_URL = import.meta.env.VITE_API_URL;

const Members = () => {
  const { user, token } = useAuth();
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    name: '',
    email: '',
    role: '',
  });

  useEffect(() => {
    if (token) {
      fetchMembers();
    }
  }, [token]);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/users`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setMembers(data);
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: string, currentRole: string) => {
    if (!newRole || newRole === currentRole) return;

    const validRoles = ['admin', 'manager', 'member'];
    if (!validRoles.includes(newRole.toLowerCase())) {
      toast.error('Invalid role selected.');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole.toLowerCase() })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update role');
      }

      setMembers(members.map(m => (m._id === userId || m.id === userId) ? { ...m, role: newRole.toLowerCase() } : m));
      toast.success('User role updated successfully!');
    } catch (error: any) {
      console.error('Error updating role:', error);
      toast.error(`Failed to update role: ${error.message}`);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to remove this user?')) return;

    try {
      const response = await fetch(`${API_URL}/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete user');
      }

      setMembers(members.filter(m => m._id !== userId && m.id !== userId));
      toast.success('User deleted successfully!');
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast.error(`Failed to delete user: ${error.message}`);
    }
  };

  const filteredMembers = members.filter((member) => {
    return (
      (filters.name === '' || member.name.toLowerCase().includes(filters.name.toLowerCase())) &&
      (filters.email === '' || member.email.toLowerCase().includes(filters.email.toLowerCase())) &&
      (filters.role === '' || member.role === filters.role)
    );
  });

  return (
    <div className="w-full flex flex-col gap-6 p-6 md:p-8 bg-[#FAFAFA] min-h-screen font-sans">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h1 className="text-[28px] font-bold text-slate-900 tracking-tight">Members List</h1>
        </div>
      </div>

      {/* Filters Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 bg-white p-6 rounded-xl border border-slate-200">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-slate-800">Name</label>
          <Input
            className="bg-white border-slate-200 h-10 shadow-sm focus-visible:ring-1 focus-visible:ring-slate-300 rounded-lg"
            placeholder="Filter by name..."
            value={filters.name}
            onChange={(e) => setFilters(prev => ({ ...prev, name: e.target.value }))}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-slate-800">Email</label>
          <Input
            className="bg-white border-slate-200 h-10 shadow-sm focus-visible:ring-1 focus-visible:ring-slate-300 rounded-lg"
            placeholder="Filter by email..."
            value={filters.email}
            onChange={(e) => setFilters(prev => ({ ...prev, email: e.target.value }))}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-slate-800">Role</label>
          <Select value={filters.role} onValueChange={(value) => setFilters(prev => ({ ...prev, role: value === 'all' ? '' : value }))}>
            <SelectTrigger className="bg-white border-slate-200 h-10 shadow-sm focus:ring-1 focus:ring-slate-300 rounded-lg">
              <SelectValue placeholder="Filter by role..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="manager">Manager</SelectItem>
              <SelectItem value="member">Member</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="text-center p-20 text-slate-500">
            <div className="inline-block w-6 h-6 border-2 border-slate-200 border-t-slate-600 rounded-full animate-spin"></div>
            <p className="mt-4 font-medium">Loading members...</p>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="text-center p-16">
            <p className="text-slate-500 font-medium">No members found.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-[#F9FAFB] hover:bg-[#F9FAFB] border-b border-slate-100">
                <TableHead className="py-4 px-6 font-semibold text-slate-800 h-auto">Name</TableHead>
                <TableHead className="py-4 px-6 font-semibold text-slate-800 h-auto">Email</TableHead>
                <TableHead className="py-4 px-6 font-semibold text-slate-800 h-auto">Role</TableHead>
                <TableHead className="py-4 px-6 font-semibold text-slate-800 h-auto">Joined</TableHead>
                {user?.role === 'admin' && <TableHead className="py-4 px-6 font-semibold text-slate-800 h-auto">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMembers.map((member) => (
                <TableRow key={member._id || member.id} className="hover:bg-slate-50/50 border-b border-slate-100 last:border-0">
                  <TableCell className="py-4 px-6">
                    <span className="text-slate-700 font-medium">{member.name}</span>
                  </TableCell>
                  <TableCell className="py-4 px-6 text-slate-600">{member.email}</TableCell>
                  <TableCell className="py-4 px-6">
                    {user?.role === 'admin' ? (
                      <Select
                        value={member.role?.toLowerCase()}
                        onValueChange={(value) => handleUpdateRole(member._id || member.id, value, member.role)}
                      >
                        <SelectTrigger className={`w-32 h-9 border-none shadow-none font-medium
                          ${member.role === 'admin' ? 'bg-red-50 text-red-500' :
                            member.role === 'manager' ? 'bg-amber-50 text-amber-500' :
                              'bg-blue-50 text-blue-500'}
                        `}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="member">Member</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <span className={`px-4 py-1.5 rounded-full text-sm font-medium
                        ${member.role === 'admin' ? 'bg-red-50 text-red-500' :
                          member.role === 'manager' ? 'bg-amber-50 text-amber-500' :
                            'bg-blue-50 text-blue-500'}
                      `}>
                        {member.role ? member.role.charAt(0).toUpperCase() + member.role.slice(1) : ''}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="py-4 px-6 text-slate-600">
                    {new Date(member.createdAt).toLocaleDateString('en-GB')}
                  </TableCell>
                  {user?.role === 'admin' && (
                    <TableCell className="py-4 px-6">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteUser(member._id || member.id)}
                        className="border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600 hover:border-red-300 font-medium h-9 px-4"
                      >
                        Remove
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};

export default Members;
