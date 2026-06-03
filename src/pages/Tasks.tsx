import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import CreateTaskModal from '../components/CreateTaskModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const API_URL = import.meta.env.VITE_API_URL;

const SVGIcons = {
  tasksBlue: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>,
  tasksYellow: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>,
  tasksGreen: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>,
  tasksPurple: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>,
  search: <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>,
  grid: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>,
  list: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path></svg>,
  more: <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path></svg>,
  edit: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>,
  delete: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>,
  folderBlue: <svg className="w-4 h-4 mr-2 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path></svg>,
  userBlue: <svg className="w-4 h-4 mr-2 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>,
  taskIcon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>,
  checkCircle: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>,
  userSolid: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>,
  folderSolid: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path></svg>,
  chevronLeft: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>,
  chevronRight: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>,
};

const formatDate = (dateString: string) => {
  const d = new Date(dateString);
  return `${d.getDate().toString().padStart(2, '0')} ${d.toLocaleString('default', { month: 'short' })} ${d.getFullYear()}`;
};

const formatTime = (dateString: string) => {
  const d = new Date(dateString);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

const getStatusDetails = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'todo': return { label: 'Todo', bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-500' };
    case 'in-progress': return { label: 'In Progress', bg: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-500' };
    case 'review': return { label: 'Review', bg: 'bg-blue-50', text: 'text-blue-600', dot: 'bg-blue-500' };
    case 'done': return { label: 'Completed', bg: 'bg-purple-50', text: 'text-purple-600', dot: 'bg-purple-500' };
    default: return { label: 'Todo', bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-500' };
  }
};

const Tasks = () => {
  const { user, role, token } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const canAssign = role === 'admin' || role === 'manager';

  useEffect(() => {
    if (token) {
      fetchTasks();
    }
  }, [token]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/tasks`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch tasks');
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const onDragEnd = async (result: any) => {
    if (!result.destination) return;

    const destStatus = result.destination.droppableId;
    const taskId = result.draggableId;
    const task = tasks.find(t => t._id === taskId);
    
    if (!task || task.status === destStatus) return;

    // Optimistic update
    const previousTasks = [...tasks];
    setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status: destStatus } : t));

    try {
      const response = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: destStatus })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update task status');
      }

      fetchTasks();
    } catch (error: any) {
      console.error("Drag update error:", error);
      alert(error.message);
      // Revert optimistic update
      setTasks(previousTasks);
    }
  };

  const handleDelete = async (taskId: string) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete task");
      }

      // Refresh tasks
      fetchTasks();

      // Clear selected task if deleted
      if (selectedTask?._id === taskId) {
        setSelectedTask(null);
      }

    } catch (error: any) {
      console.error("Delete error:", error);
      alert(error.message);
    }
  };

  const visibleTasks = role === 'member'
    ? tasks.filter(t => t.assignedTo?._id === user?.id)
    : tasks;

  const filteredTasks = visibleTasks.filter(t =>
    t.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const todoCount = visibleTasks.filter(t => t.status === 'todo').length;
  const inProgressCount = visibleTasks.filter(t => t.status === 'in-progress').length;
  const reviewCount = visibleTasks.filter(t => t.status === 'review').length;
  const completedCount = visibleTasks.filter(t => t.status === 'done').length;

  return (
    <div className="w-full flex flex-col gap-6 p-6 md:p-8 bg-[#FAFAFA] min-h-screen font-sans">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h1 className="text-[28px] font-bold text-slate-900 tracking-tight">Tasks</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Manage and track all tasks across your projects.</p>
        </div>
        {canAssign && (
          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 font-medium px-4 h-10 rounded-lg shadow-none flex items-center gap-1.5"
          >
            <span>+</span> Assign Task
          </Button>
        )}
      </div>
      <CreateTaskModal
        isOpen={isModalOpen}
        token={token}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          fetchTasks();
          setIsModalOpen(false);
        }}
      />

      <CreateTaskModal
        isOpen={isEditModalOpen}
        token={token}
        task={editingTask}
        isEdit={true}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingTask(null);
        }}
        onSuccess={() => {
          fetchTasks();
          setIsEditModalOpen(false);
          setEditingTask(null);
        }}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6 flex items-center gap-5 shadow-sm">
          <div className="w-14 h-14 rounded-full flex items-center justify-center shrink-0 text-slate-500 bg-slate-100">
            {SVGIcons.tasksBlue}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-slate-600">Total Tasks</span>
            <span className="text-2xl font-bold text-slate-900 my-0.5">{visibleTasks.length}</span>
            <span className="text-[13px] font-medium text-slate-500">All tasks</span>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-6 flex items-center gap-5 shadow-sm">
          <div className="w-14 h-14 rounded-full flex items-center justify-center shrink-0 text-amber-500 bg-amber-50">
            {SVGIcons.tasksYellow}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-slate-600">Todo</span>
            <span className="text-2xl font-bold text-slate-900 my-0.5">{todoCount}</span>
            <span className="text-[13px] font-medium text-slate-500">Tasks to do</span>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-6 flex items-center gap-5 shadow-sm">
          <div className="w-14 h-14 rounded-full flex items-center justify-center shrink-0 text-emerald-500 bg-emerald-50">
            {SVGIcons.tasksGreen}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-slate-600">In Progress</span>
            <span className="text-2xl font-bold text-slate-900 my-0.5">{inProgressCount}</span>
            <span className="text-[13px] font-medium text-slate-500">Tasks in progress</span>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-6 flex items-center gap-5 shadow-sm">
          <div className="w-14 h-14 rounded-full flex items-center justify-center shrink-0 text-blue-500 bg-blue-50">
            {SVGIcons.taskIcon}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-slate-600">Review</span>
            <span className="text-2xl font-bold text-slate-900 my-0.5">{reviewCount}</span>
            <span className="text-[13px] font-medium text-slate-500">Pending review</span>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-6 flex items-center gap-5 shadow-sm">
          <div className="w-14 h-14 rounded-full flex items-center justify-center shrink-0 text-purple-500 bg-purple-50">
            {SVGIcons.tasksPurple}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-slate-600">Completed</span>
            <span className="text-2xl font-bold text-slate-900 my-0.5">{completedCount}</span>
            <span className="text-[13px] font-medium text-slate-500">Completed tasks</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-6 mt-2">
        <div className="flex-1 flex flex-col gap-5 min-w-0">
          <h2 className="text-[20px] font-bold text-slate-900">All Tasks</h2>

          <div className="flex flex-col sm:flex-row gap-4 items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="relative flex-1 w-full sm:max-w-[280px]">
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                {SVGIcons.search}
              </div>
              <Input
                className="pl-10 h-10 border-slate-200 shadow-sm focus-visible:ring-1 focus-visible:ring-slate-300 rounded-lg bg-white"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="hidden md:flex gap-3 flex-1">
              <div className="h-10 px-4 border border-slate-200 rounded-lg flex items-center justify-between bg-white text-sm text-slate-600 shadow-sm min-w-[160px] cursor-not-allowed opacity-70">
                Filter by project <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
              <div className="h-10 px-4 border border-slate-200 rounded-lg flex items-center justify-between bg-white text-sm text-slate-600 shadow-sm min-w-[160px] cursor-not-allowed opacity-70">
                Filter by status <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>

            <div className="flex gap-2 ml-auto shrink-0 bg-slate-50 p-1 rounded-lg border border-slate-100">
              <Button
                variant="ghost" size="sm"
                onClick={() => setViewMode('grid')}
                className={`h-8 w-10 px-0 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm border border-slate-200 text-blue-600' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}
              >
                {SVGIcons.grid}
              </Button>
              <Button
                variant="ghost" size="sm"
                onClick={() => setViewMode('list')}
                className={`h-8 w-10 px-0 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm border border-slate-200 text-blue-600' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}
              >
                {SVGIcons.list}
              </Button>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            {viewMode === 'grid' ? (
              <DragDropContext onDragEnd={onDragEnd}>
                <div className="flex flex-col md:flex-row gap-6 p-6 h-full overflow-x-auto min-h-[600px] bg-slate-50/50">
                  {['todo', 'in-progress', 'review', 'done'].map((statusKey) => {
                    const statusUi = getStatusDetails(statusKey);
                    const colTasks = filteredTasks.filter(t => t.status === statusKey);
                    
                    return (
                      <div key={statusKey} className="flex-1 min-w-[280px] bg-slate-100 rounded-xl p-4 flex flex-col gap-3">
                        <div className="flex justify-between items-center px-1 mb-2">
                          <h3 className="font-bold text-slate-800 uppercase text-xs tracking-wider flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${statusUi.dot}`}></span>
                            {statusUi.label}
                          </h3>
                          <span className="text-xs font-semibold text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">
                            {colTasks.length}
                          </span>
                        </div>
                        
                        <Droppable droppableId={statusKey}>
                          {(provided, snapshot) => (
                            <div
                              {...provided.droppableProps}
                              ref={provided.innerRef}
                              className={`flex-1 flex flex-col gap-3 min-h-[150px] transition-colors rounded-lg ${snapshot.isDraggingOver ? 'bg-slate-200/50' : ''}`}
                            >
                              {colTasks.map((task, index) => (
                                <Draggable key={task._id} draggableId={task._id} index={index}>
                                  {(provided, snapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      onClick={() => setSelectedTask(task)}
                                      className={`bg-white p-4 rounded-xl shadow-sm border border-slate-200 cursor-grab active:cursor-grabbing transition-all hover:shadow-md ${snapshot.isDragging ? 'shadow-lg ring-2 ring-blue-500/20' : ''} ${selectedTask?._id === task._id ? 'ring-2 ring-blue-500 border-blue-500' : ''}`}
                                    >
                                      <h4 className="font-bold text-sm text-slate-900 mb-1">{task.title}</h4>
                                      {task.projectId && (
                                        <div className="text-xs text-blue-600 font-medium mb-3 flex items-center gap-1">
                                          {SVGIcons.folderBlue}
                                          {task.projectId.name}
                                        </div>
                                      )}
                                      
                                      <div className="flex justify-between items-end mt-4">
                                        <div className="flex items-center gap-2">
                                          {task.assignedTo ? (
                                            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold" title={task.assignedTo.name}>
                                              {task.assignedTo.name.charAt(0).toUpperCase()}
                                            </div>
                                          ) : (
                                            <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-[10px] font-bold" title="Unassigned">
                                              ?
                                            </div>
                                          )}
                                        </div>
                                        
                                        <div className="flex gap-1">
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setEditingTask(task);
                                              setIsEditModalOpen(true);
                                            }}
                                            className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600"
                                          >
                                            {SVGIcons.edit}
                                          </button>
                                          {canAssign && (
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(task._id);
                                              }}
                                              className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600"
                                            >
                                              {SVGIcons.delete}
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                      </div>
                    );
                  })}
                </div>
              </DragDropContext>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50">
                        <th className="px-6 py-4 text-xs font-bold text-slate-800 tracking-wide w-[25%]">Task</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-800 tracking-wide w-[20%]">Project</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-800 tracking-wide w-[20%]">Assigned To</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-800 tracking-wide w-[15%]">Status</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-800 tracking-wide w-[15%]">Created At</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-800 tracking-wide w-[5%]">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {loading ? (
                        <tr>
                          <td colSpan={6} className="text-center p-10 text-slate-500 font-medium">Loading tasks...</td>
                        </tr>
                      ) : filteredTasks.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center p-16 text-slate-500">
                            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
                              {SVGIcons.tasksBlue}
                            </div>
                            <p className="font-medium text-slate-700">No tasks found</p>
                          </td>
                        </tr>
                      ) : (
                        filteredTasks.map((task) => {
                          const statusUi = getStatusDetails(task.status);
                          return (
                            <tr
                              key={task._id}
                              onClick={() => setSelectedTask(task)}
                              className={`cursor-pointer transition-colors ${selectedTask?._id === task._id ? 'bg-blue-50/50' : 'hover:bg-slate-50/50'}`}
                            >
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-purple-50 text-purple-600">
                                    {SVGIcons.taskIcon}
                                  </div>
                                  <div className="flex flex-col min-w-0">
                                    <span className="font-bold text-[15px] text-slate-900 truncate">{task.title}</span>
                                    {task.description && (
                                      <span className="text-[13px] text-slate-500 truncate mt-0.5">{task.description}</span>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                {task.projectId ? (
                                  <div className="inline-flex items-center px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-[13px] font-semibold max-w-[160px]">
                                    {SVGIcons.folderBlue}
                                    <span className="truncate">{task.projectId.name}</span>
                                  </div>
                                ) : (
                                  <span className="text-[13px] text-slate-400 font-medium">—</span>
                                )}
                              </td>
                              <td className="px-6 py-4">
                                {task.assignedTo ? (
                                  <div className="inline-flex items-center px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-[13px] font-semibold max-w-[160px]">
                                    {SVGIcons.userBlue}
                                    <span className="truncate">{task.assignedTo.name}</span>
                                  </div>
                                ) : (
                                  <span className="text-[13px] text-slate-400 font-medium">Unassigned</span>
                                )}
                              </td>
                              <td className="px-6 py-4">
                                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border border-white shadow-sm ${statusUi.bg} ${statusUi.text}`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${statusUi.dot}`}></span>
                                  {statusUi.label}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex flex-col text-[13px] font-medium text-slate-600">
                                  <span>{formatDate(task.createdAt)}</span>
                                  <span className="text-slate-400 mt-0.5">{formatTime(task.createdAt)}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingTask(task);
                                    setIsEditModalOpen(true);
                                  }}
                                  className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                  {SVGIcons.edit}
                                </button>
                                {canAssign && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDelete(task._id);
                                    }}
                                    className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                                  >
                                    {SVGIcons.delete}
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {!loading && filteredTasks.length > 0 && (
                  <div className="flex justify-center p-4 border-t border-slate-100">
                    <div className="flex gap-2 items-center">
                      <button className="w-9 h-9 rounded-lg flex items-center justify-center border border-slate-200 bg-white text-slate-400 disabled:opacity-50" disabled>
                        {SVGIcons.chevronLeft}
                      </button>
                      <button className="w-9 h-9 rounded-lg flex items-center justify-center bg-blue-600 text-white font-semibold text-sm shadow-sm shadow-blue-600/20">
                        1
                      </button>
                      <button className="w-9 h-9 rounded-lg flex items-center justify-center border border-slate-200 bg-white text-slate-400 disabled:opacity-50" disabled>
                        {SVGIcons.chevronRight}
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div className="w-full xl:w-[360px] shrink-0 flex flex-col gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-7 shadow-sm">
            <h2 className="text-[20px] font-bold text-slate-900">Activity Logs</h2>
            <p className="text-[13px] text-slate-500 mt-1 mb-8 italic">
              {selectedTask ? `Activity for "${selectedTask.title}"` : 'Select a task to view activity.'}
            </p>

            {!selectedTask ? (
              <div className="text-center py-8">
                <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-300">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"></path></svg>
                </div>
                <p className="text-[14px] font-medium text-slate-600">Click a task</p>
                <p className="text-[12px] text-slate-400 mt-1">Actions on the task will appear here.</p>
              </div>
            ) : (
              <div className="relative pl-7 border-l-2 border-slate-100 ml-4 flex flex-col gap-8">
                {(() => {
                  const logs = [];

                  if (selectedTask.status !== 'todo') {
                    const statusUi = getStatusDetails(selectedTask.status);
                    const colorMap: Record<string, string> = {
                      'bg-emerald-50': 'emerald',
                      'bg-purple-50': 'purple'
                    };
                    const c = colorMap[statusUi.bg] || 'blue';
                    logs.push({
                      id: 'status',
                      type: 'Status Updated',
                      text: `Moved to ${statusUi.label}`,
                      timestamp: selectedTask.updatedAt || selectedTask.createdAt,
                      color: c,
                      icon: SVGIcons.tasksBlue
                    });
                  }

                  if (selectedTask.assignedTo) {
                    logs.push({
                      id: 'assigned',
                      type: 'Assigned',
                      text: `Assigned to ${selectedTask.assignedTo.name}`,
                      timestamp: selectedTask.createdAt,
                      color: 'indigo',
                      icon: SVGIcons.userSolid
                    });
                  }

                  if (selectedTask.projectId) {
                    logs.push({
                      id: 'project',
                      type: 'Added to Project',
                      text: `Added to ${selectedTask.projectId.name}`,
                      timestamp: selectedTask.createdAt,
                      color: 'amber',
                      icon: SVGIcons.folderSolid
                    });
                  }

                  logs.push({
                    id: 'created',
                    type: 'Task created',
                    text: `"${selectedTask.title}" was created`,
                    timestamp: selectedTask.createdAt,
                    color: 'emerald',
                    icon: SVGIcons.checkCircle
                  });

                  // Sort by descending timestamp, though since they're mostly same timestamp, we just rely on push order.
                  // Status update has updatedAt, so it will be first correctly.
                  logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

                  return logs.map((log) => (
                    <div key={log.id} className="relative">
                      <div className={`absolute -left-[35px] top-1 w-[11px] h-[11px] rounded-full bg-${log.color}-500 ring-[4px] ring-white`}></div>
                      <div className="flex gap-4 items-start">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-${log.color}-50 text-${log.color}-500`}>
                          {log.icon}
                        </div>
                        <div className="flex flex-col mt-0.5">
                          <span className="text-[14px] font-bold text-slate-900">{log.type}</span>
                          <span className="text-[13px] text-slate-500 mt-1 font-medium">{log.text}</span>
                          <div className="flex items-center gap-3 mt-2 text-[12px] text-slate-400 font-medium">
                            <span>{formatDate(log.timestamp)}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                            <span>{formatTime(log.timestamp)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tasks;
