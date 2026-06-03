import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import CreateProjectModal from '../components/CreateProjectModal';
import ViewTeamModal from '../components/ViewTeamModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL;

const SVGIcons = {
  projects: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path></svg>,
  teams: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>,
  search: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>,
  grid: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>,
  list: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path></svg>,
  calendar: <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>,
  teamSmall: <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>,
};

const getProjectIcon = (name: string, index: number) => {
  const icons = [
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>,
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"></path></svg>,
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>,
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>,
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>,
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg>,
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>,
  ];
  const colors = [
    'text-blue-500 bg-blue-50',
    'text-emerald-500 bg-emerald-50',
    'text-sky-500 bg-sky-50',
    'text-amber-500 bg-amber-50',
    'text-rose-500 bg-rose-50',
    'text-teal-500 bg-teal-50',
    'text-orange-500 bg-orange-50'
  ];
  return {
    icon: icons[index % icons.length],
    color: colors[index % colors.length]
  };
};

const formatDate = (dateString: string) => {
  const d = new Date(dateString);
  return `${d.getDate().toString().padStart(2, '0')} ${d.toLocaleString('default', { month: 'short' })}, ${d.getFullYear()}`;
};

const Projects = () => {
  const { role, token } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [viewingTeam, setViewingTeam] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    if (token) {
      fetchProjects();
      fetchTeams();
      if (role !== 'admin') {
        setViewMode('list');
      }
    }
  }, [token, role]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/projects`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch projects');
      const data = await response.json();
      setProjects(data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeams = async () => {
    try {
      const response = await fetch(`${API_URL}/teams`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch teams');
      const data = await response.json();
      setTeams(data);
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      const response = await fetch(`${API_URL}/projects/${projectId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to delete project');
      }
      toast.success('Project deleted successfully');
      setProjects(projects.filter(p => p._id !== projectId));
    } catch (error: any) {
      console.error('Error deleting project:', error);
      toast.error(error.message || 'Failed to delete project');
    }
  };

  const handleViewTeam = (teamIdObj: any) => {
    if (!teamIdObj || !teamIdObj._id) {
      toast.error('This project has no assigned team.');
      return;
    }
    const fullTeam = teams.find(t => t._id === teamIdObj._id);
    if (fullTeam) {
      setViewingTeam(fullTeam);
    } else {
      toast.error('Unable to load team details.');
    }
  };

  const canCreate = role === 'admin';

  const uniqueTeamsCount = new Set(projects.map(p => p.teamId?._id).filter(Boolean)).size;

  const filteredProjects = projects.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="w-full flex flex-col gap-6 p-6 md:p-8 bg-[#FAFAFA] min-h-screen font-sans">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h1 className="text-[28px] font-bold text-slate-900 tracking-tight">Projects</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Manage and organize all your projects in one place.</p>
        </div>
        {canCreate && (
          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 font-medium px-4 h-10 rounded-lg shadow-none"
          >
            + New Project
          </Button>
        )}
      </div>

      <CreateProjectModal
        isOpen={isModalOpen || !!editingProject}
        projectToEdit={editingProject}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProject(null);
        }}
        onSuccess={() => {
          fetchProjects();
        }}
      />

      <ViewTeamModal
        isOpen={!!viewingTeam}
        onClose={() => setViewingTeam(null)}
        team={viewingTeam}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl">
        <div className="bg-white border border-slate-200 rounded-xl p-6 flex items-center gap-5">
          <div className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 text-blue-500 bg-blue-50">
            {SVGIcons.projects}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-slate-600">Total Projects</span>
            <span className="text-2xl font-bold text-slate-900 my-0.5">{projects.length}</span>
            <span className="text-xs font-medium text-slate-500">All Projects</span>
          </div>
        </div>


        {role === 'admin' && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 flex items-center gap-5">
            <div className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 text-emerald-500 bg-emerald-50">
              {SVGIcons.teams}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-slate-600">Teams Assigned</span>
              <span className="text-2xl font-bold text-slate-900 my-0.5">{uniqueTeamsCount}</span>
              <span className="text-xs font-medium text-slate-500">Total Teams</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center bg-white p-4 rounded-xl border border-slate-200">
        <div className="relative flex-1 w-full sm:max-w-md">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            {SVGIcons.search}
          </div>
          <Input
            className="pl-10 h-10 border-slate-200 shadow-sm focus-visible:ring-1 focus-visible:ring-slate-300 rounded-lg bg-white"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="hidden md:flex gap-4 flex-1">
          <div className="h-10 px-4 border border-slate-200 rounded-lg flex items-center justify-between bg-white text-sm text-slate-600 shadow-sm min-w-[160px] cursor-not-allowed opacity-70">
            Filter by team <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
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

      {/* Projects Grid */}
      {loading ? (
        <div className="text-center p-20 text-slate-500">
          <div className="inline-block w-6 h-6 border-2 border-slate-200 border-t-slate-600 rounded-full animate-spin"></div>
          <p className="mt-4 font-medium">Loading projects...</p>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center p-20 border border-slate-200 rounded-xl bg-white">
          <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
            {SVGIcons.projects}
          </div>
          <h3 className="text-lg font-semibold text-slate-700">No projects found</h3>
          <p className="text-slate-500 mt-1">Create your first project to get started.</p>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "flex flex-col gap-4"}>
          {filteredProjects.map((project, idx) => {
            const { icon, color } = getProjectIcon(project.name, idx);
            const teamName = project.teamId?.name || 'Unassigned';

            return (
              <div key={project._id} className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col">
                <div className="flex items-start gap-4 mb-4 relative">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${color}`}>
                    {icon}
                  </div>
                  <div className="flex-1 min-w-0 pr-6">
                    <h3 className="text-[17px] font-bold text-slate-900 truncate">
                      {project.name}
                    </h3>
                    <p className="text-[13px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {project.description || "No description provided."}
                    </p>
                  </div>
                </div>

                <div className="mb-5 flex">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-100">
                    {SVGIcons.teamSmall}
                    {teamName}
                  </span>
                </div>

                <div className="flex flex-col gap-1.5 mb-6 text-[13px] text-slate-500 font-medium">
                  <div className="flex items-center">
                    {SVGIcons.calendar} Created: {formatDate(project.createdAt)}
                  </div>
                </div>

                <div className="flex gap-3 mt-auto pt-4 border-t border-slate-100">
                  <Button
                    variant="outline"
                    onClick={() => handleViewTeam(project.teamId)}
                    className="flex-1 h-9 border-blue-200 text-blue-500"
                  >
                    View
                  </Button>

                  {role === 'admin' && (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => setEditingProject(project)}
                        className="flex-1 h-9 border-amber-200 text-amber-500"
                      >
                        Edit
                      </Button>

                      <Button
                        variant="outline"
                        onClick={() => handleDeleteProject(project._id)}
                        className="flex-1 h-9 border-red-200 text-red-500"
                      >
                        Delete
                      </Button>
                    </>
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

export default Projects;
