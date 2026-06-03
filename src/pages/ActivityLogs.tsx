import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

const API_URL = import.meta.env.VITE_API_URL;

const SVGIcons = {
  sparkles: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>,
  pencil: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>,
  user: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>,
  folder: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path></svg>,
  users: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>,
  xCircle: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>,
  clipboardList: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>,
  filter: <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>,
  activity: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>,
};

const ActivityLogs = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('');
  const { token } = useAuth();

  useEffect(() => {
    if (token) {
      fetchActivityLogs();
    }
  }, [token]);

  const fetchActivityLogs = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/activity-logs`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setLogs(data);
    } catch (error) {
      console.error('Error fetching activity logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'Task Created': return SVGIcons.sparkles;
      case 'Task Updated': return SVGIcons.pencil;
      case 'Task Assigned': return SVGIcons.user;
      case 'Project Created': return SVGIcons.folder;
      case 'Project Updated': return SVGIcons.pencil;
      case 'User Added': return SVGIcons.users;
      case 'User Removed': return SVGIcons.xCircle;
      default: return SVGIcons.clipboardList;
    }
  };

  const getActivityTheme = (type: string) => {
    if (type.includes('Created')) return { bg: 'bg-emerald-50', text: 'text-emerald-500', dot: 'bg-emerald-400' };
    if (type.includes('Updated')) return { bg: 'bg-blue-50', text: 'text-blue-500', dot: 'bg-blue-400' };
    if (type.includes('Assigned')) return { bg: 'bg-indigo-50', text: 'text-indigo-500', dot: 'bg-indigo-400' };
    if (type.includes('Removed')) return { bg: 'bg-rose-50', text: 'text-rose-500', dot: 'bg-rose-400' };
    return { bg: 'bg-slate-50', text: 'text-slate-500', dot: 'bg-slate-400' };
  };

  const filteredLogs = logs.filter((log) =>
    filter === '' || log.type === filter
  );

  const uniqueTypes = [...new Set(logs.map((log) => log.type))];

  return (
    <div className="w-full flex flex-col gap-6 p-6 md:p-8 bg-[#FAFAFA] min-h-screen font-sans">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h1 className="text-[28px] font-bold text-slate-900 tracking-tight">Activity Logs</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Keep track of everything happening in your team.</p>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {/* Filter Section */}
        <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg font-medium text-sm">
            {SVGIcons.filter}
            <label htmlFor="activity-filter">Filter by Type</label>
          </div>
          <select
            id="activity-filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="flex-1 max-w-[240px] h-10 px-3 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none bg-white cursor-pointer"
            style={{
              backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 0.75rem center',
              backgroundSize: '1em'
            }}
          >
            <option value="">All Activities</option>
            {uniqueTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Activity Logs Timeline */}
        <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
              <p className="text-slate-500 font-medium text-sm">Loading activities...</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4">
                {SVGIcons.activity}
              </div>
              <h3 className="text-lg font-bold text-slate-700 mb-1">No activities found</h3>
              <p className="text-slate-500 text-sm">When actions are taken in your team, they will appear here.</p>
            </div>
          ) : (
            <div className="relative pl-6 sm:pl-8 border-l-2 border-slate-100 ml-4 sm:ml-6 flex flex-col gap-10">
              {filteredLogs.map((log) => {
                const theme = getActivityTheme(log.type);
                return (
                  <div key={log.id} className="relative group">
                    <div className={`absolute -left-[45px] sm:-left-[53px] top-1 w-3.5 h-3.5 rounded-full ${theme.dot} ring-[6px] ring-white transition-all group-hover:scale-110`}></div>
                    <div className="flex flex-col sm:flex-row gap-5 items-start">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${theme.bg} ${theme.text}`}>
                        {getActivityIcon(log.type)}
                      </div>
                      <div className="flex flex-col min-w-0 flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1.5">
                          <h3 className="text-[15px] font-bold text-slate-900">{log.type}</h3>
                          <span className="text-[12px] font-semibold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-100 shrink-0 self-start sm:self-auto">
                            {new Date(log.timestamp).toLocaleString(undefined, {
                              month: 'short', day: 'numeric', year: 'numeric',
                              hour: 'numeric', minute: '2-digit'
                            })}
                          </span>
                        </div>
                        
                        {log.description && (
                          <div className="text-[14px] text-slate-600 bg-slate-50 border border-slate-100 rounded-lg p-3 my-2 font-medium whitespace-pre-wrap">
                            {log.description}
                          </div>
                        )}
                        
                        {log.user && (
                          <p className="text-[13px] text-slate-500 font-medium flex items-center gap-1.5 mt-1">
                            by <span className="font-bold text-slate-700">{log.user}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityLogs;
