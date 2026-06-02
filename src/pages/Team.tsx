import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import CreateTeamModal from '../components/CreateTeamModal';
import ViewTeamModal from '../components/ViewTeamModal';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const SVGIcons = {
  teams: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>,
  members: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>,
  admins: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>,
  managers: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>,
  search: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>,
  grid: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>,
  list: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>,
  monitor: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>,
  server: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect><rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect><line x1="6" y1="6" x2="6.01" y2="6"></line><line x1="6" y1="18" x2="6.01" y2="18"></line></svg>,
  paint: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"></path><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path><path d="M2 2l7.586 7.586"></path><circle cx="11" cy="11" r="2"></circle></svg>,
  cloud: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path></svg>,
  qa: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
};

const getTeamIcon = (name: string, index: number) => {
  const lower = name?.toLowerCase() || '';
  if (lower.includes('frontend') || lower.includes('ui')) return { icon: SVGIcons.monitor, color: 'text-blue-500 bg-blue-100' };
  if (lower.includes('backend') || lower.includes('api')) return { icon: SVGIcons.server, color: 'text-green-500 bg-green-100' };
  if (lower.includes('design') || lower.includes('ux')) return { icon: SVGIcons.paint, color: 'text-purple-500 bg-purple-100' };
  if (lower.includes('devops') || lower.includes('infra')) return { icon: SVGIcons.cloud, color: 'text-red-500 bg-red-100' };
  if (lower.includes('qa') || lower.includes('test')) return { icon: SVGIcons.qa, color: 'text-yellow-500 bg-yellow-100' };
  
  const colors = ['text-blue-500 bg-blue-100', 'text-green-500 bg-green-100', 'text-purple-500 bg-purple-100', 'text-yellow-500 bg-yellow-100', 'text-red-500 bg-red-100'];
  return { icon: SVGIcons.teams, color: colors[index % colors.length] };
};

const Team = () => {
  const { user, token } = useAuth();
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<any>(null);
  const [viewingTeam, setViewingTeam] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  
  // Calculate summary stats
  const totalTeams = teams.length;
  let totalMembers = 0;
  let adminCount = 0;
  let managerCount = 0;

  teams.forEach(team => {
    if (team.members) {
      totalMembers += team.members.length;
      team.members.forEach((member: any) => {
        if (member.role === 'admin') adminCount++;
        if (member.role === 'manager') managerCount++;
      });
    }
  });

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/teams`);
      if (!response.ok) throw new Error('Failed to fetch teams');
      const data = await response.json();
      setTeams(data);
    } catch (error) {
      console.error('Error fetching teams:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    if (!window.confirm('Are you sure you want to delete this team?')) return;

    try {
      const response = await fetch(`${API_URL}/teams/${teamId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to delete team');
      }
      
      setTeams(teams.filter(t => t._id !== teamId));
      toast.success('Team deleted successfully!');
    } catch (error: any) {
      console.error('Error deleting team:', error);
      toast.error(`Failed to delete team: ${error.message}`);
    }
  };

  const filteredTeams = teams.filter(team => 
    team.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (team.description && team.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="w-full flex flex-col gap-6 p-6 md:p-8 bg-[#FAFAFA] min-h-screen font-sans">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h1 className="text-[28px] font-bold text-slate-900 tracking-tight">Teams</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Manage your teams and their members</p>
        </div>
        {(user?.role === 'admin' || user?.role === 'manager') && (
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 font-medium px-4 h-10 rounded-lg shadow-none"
          >
            + Create Team
          </Button>
        )}
      </div>

      <CreateTeamModal 
        isOpen={isModalOpen || !!editingTeam} 
        teamToEdit={editingTeam}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTeam(null);
        }} 
        onSuccess={() => {
          fetchTeams();
        }} 
      />

      <ViewTeamModal
        isOpen={!!viewingTeam}
        team={viewingTeam}
        onClose={() => setViewingTeam(null)}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { icon: SVGIcons.teams, label: 'Total Teams', value: totalTeams, sub: 'Active teams', color: 'text-blue-500 bg-blue-50' },
          { icon: SVGIcons.members, label: 'Total Members', value: totalMembers, sub: 'Across all teams', color: 'text-emerald-500 bg-emerald-50' },
          { icon: SVGIcons.admins, label: 'Admins', value: adminCount, sub: 'Team administrators', color: 'text-purple-500 bg-purple-50' },
          { icon: SVGIcons.managers, label: 'Managers', value: managerCount, sub: 'Team managers', color: 'text-amber-500 bg-amber-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-xl p-6 flex items-center gap-5">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 ${stat.color}`}>
              {stat.icon}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-slate-600">{stat.label}</span>
              <span className="text-2xl font-bold text-slate-900 my-0.5">{stat.value}</span>
              <span className="text-xs font-medium text-slate-500">{stat.sub}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center bg-white p-4 rounded-xl border border-slate-200">
        <div className="relative flex-1 w-full sm:max-w-md">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            {SVGIcons.search}
          </div>
          <Input 
            className="pl-10 h-10 border-slate-200 shadow-sm focus-visible:ring-1 focus-visible:ring-slate-300 rounded-lg bg-white"
            placeholder="Search teams..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {/* Placeholder for Filter & Sort as per UI */}
        <div className="hidden md:flex gap-4 flex-1">
          <div className="h-10 px-4 border border-slate-200 rounded-lg flex items-center justify-between bg-white text-sm text-slate-600 shadow-sm min-w-[140px] cursor-not-allowed opacity-70">
            Filter by role <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </div>
          <div className="h-10 px-4 border border-slate-200 rounded-lg flex items-center justify-between bg-white text-sm text-slate-600 shadow-sm min-w-[120px] cursor-not-allowed opacity-70">
            Sort by <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </div>
        </div>

        <div className="flex gap-2 ml-auto shrink-0 bg-slate-50 p-1 rounded-lg border border-slate-100">
          <Button 
            variant="ghost"
            size="sm" 
            onClick={() => setViewMode('grid')}
            className={`h-8 w-10 px-0 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm border border-slate-200 text-blue-600' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}
          >
            {SVGIcons.grid}
          </Button>
          <Button 
            variant="ghost"
            size="sm" 
            onClick={() => setViewMode('list')}
            className={`h-8 w-10 px-0 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm border border-slate-200 text-blue-600' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}
          >
            {SVGIcons.list}
          </Button>
        </div>
      </div>

      {/* Teams Grid */}
      {loading ? (
        <div className="text-center p-20 text-slate-500">
          <div className="inline-block w-6 h-6 border-2 border-slate-200 border-t-slate-600 rounded-full animate-spin"></div>
          <p className="mt-4 font-medium">Loading teams...</p>
        </div>
      ) : filteredTeams.length === 0 ? (
        <div className="text-center p-20 border border-slate-200 rounded-xl bg-white">
          <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
            {SVGIcons.teams}
          </div>
          <h3 className="text-lg font-semibold text-slate-700">No teams found</h3>
          <p className="text-slate-500 mt-1">Try adjusting your search or create a new team.</p>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "flex flex-col gap-4"}>
          {filteredTeams.map((team, idx) => {
            const { icon, color } = getTeamIcon(team.name, idx);
            const members = team.members || [];
            const displayMembers = members.slice(0, 3);
            const remainingCount = members.length - 3;
            
            // Derive pill color from icon color roughly
            const pillColor = color.includes('blue') ? 'bg-blue-50 text-blue-500' : 
                              color.includes('green') || color.includes('emerald') ? 'bg-emerald-50 text-emerald-500' : 
                              color.includes('purple') ? 'bg-purple-50 text-purple-500' :
                              color.includes('amber') || color.includes('yellow') ? 'bg-amber-50 text-amber-500' :
                              color.includes('red') ? 'bg-red-50 text-red-500' : 'bg-slate-100 text-slate-500';

            return (
              <div key={team._id} className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col">
                <div className="flex items-start gap-4 mb-5">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${color}`}>
                    {icon}
                  </div>
                  <div className="flex-1 min-w-0 pr-2">
                    <h3 className="text-lg font-bold text-slate-900 truncate">
                      {team.name}
                    </h3>
                    <p className="text-sm text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {team.description || "No description provided."}
                    </p>
                  </div>
                  <div className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 ${pillColor}`}>
                    {members.length} Members
                  </div>
                </div>
                
                <div className="flex -space-x-3 mb-6">
                  {displayMembers.length > 0 ? (
                    displayMembers.map((member: any, i: number) => (
                      <img 
                        key={member._id || i}
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=random&color=fff&bold=true`} 
                        alt={member.name}
                        className="w-10 h-10 rounded-full border-2 border-white object-cover bg-slate-100"
                        title={member.name}
                      />
                    ))
                  ) : (
                    <div className="text-sm text-slate-400 italic">No members yet</div>
                  )}
                  {remainingCount > 0 && (
                    <div className={`w-10 h-10 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold z-10 ${pillColor}`}>
                      +{remainingCount}
                    </div>
                  )}
                </div>
                
                <div className="flex gap-3 mt-auto pt-5 border-t border-slate-100">
                  <Button 
                    variant="outline" 
                    className="flex-1 h-9 border-blue-200 text-blue-500 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 font-medium"
                    onClick={() => setViewingTeam(team)}
                  >
                    View Team
                  </Button>
                  {(user?.role === 'admin' || user?.role === 'manager') && (
                    <Button 
                      variant="outline" 
                      className="flex-1 h-9 border-amber-200 text-amber-500 hover:bg-amber-50 hover:text-amber-600 hover:border-amber-300 font-medium"
                      onClick={() => setEditingTeam(team)}
                    >
                      Edit Team
                    </Button>
                  )}
                  {user?.role === 'admin' && (
                    <Button 
                      variant="outline" 
                      className="flex-1 h-9 border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600 hover:border-red-300 font-medium"
                      onClick={() => handleDeleteTeam(team._id)}
                    >
                      Delete
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Team;

