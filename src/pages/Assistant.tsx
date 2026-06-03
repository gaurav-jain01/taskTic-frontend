import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

const API_URL = import.meta.env.VITE_API_URL;

const SVGIcons = {
  send: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
    </svg>
  ),
  bot: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
    </svg>
  ),
  user: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
    </svg>
  ),
  refresh: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
    </svg>
  )
};

type Option = {
  label: string;
  value: string;
  action?: () => void;
};

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  options?: Option[];
  isError?: boolean;
  timestamp: Date;
};

const Assistant = () => {
  const { user, token } = useAuth();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [projects, setProjects] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);

  const [step, setStep] = useState('INITIAL');
  const [contextData, setContextData] = useState<any>({});
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Fetch initial data
  useEffect(() => {
    if (token) {
      fetchProjects();
      fetchUsers();
      fetchTasks();
    }
  }, [token]);

  const fetchProjects = async () => {
    try {
      const res = await fetch(`${API_URL}/projects`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setProjects(await res.json());
    } catch (e) { console.error(e); }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/users`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setUsersList(await res.json());
    } catch (e) { console.error(e); }
  };

  const fetchTasks = async () => {
    try {
      const res = await fetch(`${API_URL}/tasks`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setTasks(await res.json());
    } catch (e) { console.error(e); }
  };

  // Start Interaction
  useEffect(() => {
    if (messages.length === 0) {
      showInitialOptions();
    }
  }, []);

  const addBotMessage = (content: string, options?: Option[], isError = false) => {
    setMessages(prev => {
      // Remove options from previous messages to prevent interacting with old state
      const cleaned = prev.map(m => ({ ...m, options: undefined }));
      return [...cleaned, {
        id: Date.now().toString(),
        role: 'assistant',
        content,
        options,
        isError,
        timestamp: new Date()
      }];
    });
  };

  const addUserMessage = (content: string) => {
    setMessages(prev => {
      const cleaned = prev.map(m => ({ ...m, options: undefined }));
      return [...cleaned, {
        id: Date.now().toString(),
        role: 'user',
        content,
        timestamp: new Date()
      }];
    });
  };

  const handleOptionClick = (option: Option) => {
    addUserMessage(option.label);
    if (option.action) {
      option.action();
    }
  };

  const showInitialOptions = () => {
    setStep('INITIAL');
    setContextData({});
    
    const options: Option[] = [];
    
    if (user?.role === 'admin' || user?.role === 'manager') {
      options.push({ label: 'Create a Task', value: 'CREATE', action: () => handleCreateTaskStart() });
    }
    
    options.push({ label: 'Edit a Task', value: 'EDIT', action: () => handleEditTaskStart() });
    
    if (user?.role === 'admin' || user?.role === 'manager') {
      options.push({ label: 'Delete a Task', value: 'DELETE', action: () => handleDeleteTaskStart() });
    }
    
    addBotMessage(`Hello ${user?.name || 'there'}! What would you like to do today?`, options);
  };

  // --- CREATE TASK FLOW ---
  const handleCreateTaskStart = () => {
    setStep('CREATE_TITLE');
    addBotMessage("Great! Let's create a new task. What should be the title of the task? (Please type it below)");
  };

  const handleCreateTitleSubmit = (title: string) => {
    setContextData(prev => ({ ...prev, title }));
    setStep('CREATE_PROJECT');
    
    if (projects.length === 0) {
      addBotMessage("You don't have any projects available. Please create a project first.", [
        { label: 'Start Over', value: 'RESET', action: () => showInitialOptions() }
      ], true);
      return;
    }

    const projectOptions = projects.map(p => ({
      label: p.name,
      value: p._id,
      action: () => handleCreateProjectSelect(p._id, p.name)
    }));

    addBotMessage(`Got it. The title is "${title}". Now, select the project for this task:`, projectOptions);
  };

  const handleCreateProjectSelect = (projectId: string, projectName: string) => {
    setContextData(prev => ({ ...prev, projectId }));
    setStep('CREATE_USER');

    const project = projects.find(p => p._id === projectId);
    const teamId = project?.teamId?._id || project?.teamId;
    
    // Filter users by the selected project's team
    const validUsers = usersList.filter(u => u.teamId?.toString() === teamId?.toString());
    
    const userOptions = validUsers.map(u => ({
      label: u.name,
      value: u._id,
      action: () => handleCreateUserSelect(u._id, u.name)
    }));

    userOptions.push({
      label: 'Leave Unassigned',
      value: 'UNASSIGNED',
      action: () => handleCreateUserSelect('', 'Unassigned')
    });

    addBotMessage(`Project set to "${projectName}". Who should be assigned to this task?`, userOptions);
  };

  const handleCreateUserSelect = async (userId: string, userName: string) => {
    const finalData = { ...contextData, assignedTo: userId || null };
    setLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title: finalData.title,
          projectId: finalData.projectId,
          assignedTo: finalData.assignedTo,
          status: 'todo'
        })
      });
      
      if (!response.ok) throw new Error('Failed to create task');
      
      await fetchTasks(); // Refresh tasks
      
      addBotMessage(`Success! Task "${finalData.title}" has been created and assigned to ${userName}.`, [
        { label: 'Do something else', value: 'RESTART', action: () => showInitialOptions() }
      ]);
    } catch (err) {
      addBotMessage("Oops, failed to create the task. Please try again.", [
        { label: 'Start Over', value: 'RESET', action: () => showInitialOptions() }
      ], true);
    } finally {
      setLoading(false);
    }
  };

  // --- EDIT TASK FLOW ---
  const handleEditTaskStart = async () => {
    setStep('EDIT_SELECT');
    setLoading(true);
    let currentTasks = tasks;
    try {
      const res = await fetch(`${API_URL}/tasks`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        currentTasks = await res.json();
        setTasks(currentTasks);
      }
    } catch (e) { console.error(e); }
    setLoading(false);

    if (currentTasks.length === 0) {
      addBotMessage("You don't have any tasks to edit.", [
        { label: 'Start Over', value: 'RESET', action: () => showInitialOptions() }
      ]);
      return;
    }

    const taskOptions = currentTasks.slice(0, 10).map(t => ({
      label: t.title,
      value: t._id,
      action: () => handleEditTaskSelect(t)
    }));

    if (tasks.length > 10) {
      addBotMessage("Here are your 10 most recent tasks. Which one would you like to edit?", taskOptions);
    } else {
      addBotMessage("Which task would you like to edit?", taskOptions);
    }
  };

  const handleEditTaskSelect = (task: any) => {
    setContextData(prev => ({ ...prev, selectedTask: task }));
    setStep('EDIT_ACTION');
    
    const options: Option[] = [
      { label: 'Change Status', value: 'STATUS', action: () => handleEditActionSelect('STATUS', task) }
    ];
    
    if (user?.role === 'admin' || user?.role === 'manager') {
      options.push({ label: 'Reassign User', value: 'USER', action: () => handleEditActionSelect('USER', task) });
    }
    
    options.push({ label: 'Cancel', value: 'CANCEL', action: () => showInitialOptions() });

    addBotMessage(`Selected "${task.title}". What would you like to change?`, options);
  };

  const handleEditActionSelect = (action: string, task: any) => {
    if (action === 'STATUS') {
      setStep('EDIT_STATUS');
      const statusOptions = [
        { label: 'To Do', value: 'todo', action: () => handleEditExecute(task._id, { status: 'todo' }) },
        { label: 'In Progress', value: 'in-progress', action: () => handleEditExecute(task._id, { status: 'in-progress' }) },
        { label: 'Review', value: 'review', action: () => handleEditExecute(task._id, { status: 'review' }) },
        { label: 'Done', value: 'done', action: () => handleEditExecute(task._id, { status: 'done' }) }
      ];
      addBotMessage(`What should the new status be?`, statusOptions);
    } else if (action === 'USER') {
      setStep('EDIT_USER');
      const teamId = task.projectId?.teamId?._id || task.projectId?.teamId;
      const validUsers = usersList.filter(u => u.teamId?.toString() === teamId?.toString());
      
      const userOptions = validUsers.map(u => ({
        label: u.name,
        value: u._id,
        action: () => handleEditExecute(task._id, { assignedTo: u._id })
      }));
      
      userOptions.push({
        label: 'Unassign',
        value: 'UNASSIGNED',
        action: () => handleEditExecute(task._id, { assignedTo: null })
      });

      addBotMessage(`Who should be assigned to this task?`, userOptions);
    }
  };

  const handleEditExecute = async (taskId: string, updateData: any) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(updateData)
      });
      
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to update task');
      }
      
      await fetchTasks();
      addBotMessage(`Success! Task updated successfully.`, [
        { label: 'Do something else', value: 'RESTART', action: () => showInitialOptions() }
      ]);
    } catch (err: any) {
      addBotMessage(`Failed to update task: ${err.message}`, [
        { label: 'Start Over', value: 'RESET', action: () => showInitialOptions() }
      ], true);
    } finally {
      setLoading(false);
    }
  };

  // --- DELETE TASK FLOW ---
  const handleDeleteTaskStart = async () => {
    setStep('DELETE_SELECT');
    setLoading(true);
    let currentTasks = tasks;
    try {
      const res = await fetch(`${API_URL}/tasks`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        currentTasks = await res.json();
        setTasks(currentTasks);
      }
    } catch (e) { console.error(e); }
    setLoading(false);

    if (currentTasks.length === 0) {
      addBotMessage("You don't have any tasks to delete.", [
        { label: 'Start Over', value: 'RESET', action: () => showInitialOptions() }
      ]);
      return;
    }

    const taskOptions = currentTasks.slice(0, 10).map(t => ({
      label: t.title,
      value: t._id,
      action: () => handleDeleteTaskConfirm(t)
    }));

    addBotMessage("Select a task to delete:", taskOptions);
  };

  const handleDeleteTaskConfirm = (task: any) => {
    setStep('DELETE_CONFIRM');
    addBotMessage(`Are you sure you want to delete "${task.title}"? This cannot be undone.`, [
      { label: 'Yes, Delete it', value: 'YES', action: () => handleDeleteExecute(task._id) },
      { label: 'Cancel', value: 'NO', action: () => showInitialOptions() }
    ]);
  };

  const handleDeleteExecute = async (taskId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Failed to delete task');
      
      setTasks(tasks.filter(t => t._id !== taskId));
      addBotMessage(`Task deleted successfully.`, [
        { label: 'Do something else', value: 'RESTART', action: () => showInitialOptions() }
      ]);
    } catch (err: any) {
      addBotMessage(`Failed to delete task.`, [
        { label: 'Start Over', value: 'RESET', action: () => showInitialOptions() }
      ], true);
    } finally {
      setLoading(false);
    }
  };

  // Input Handling
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const val = input.trim();
    setInput('');
    addUserMessage(val);

    if (step === 'CREATE_TITLE') {
      handleCreateTitleSubmit(val);
    } else {
      addBotMessage("Please select one of the options above, or start over.", [
        { label: 'Start Over', value: 'RESET', action: () => showInitialOptions() }
      ]);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#FAFAFA] min-h-[calc(100vh-80px)] relative">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 p-4 md:px-8 flex items-center justify-between shadow-sm z-10 sticky top-0 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-tr from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center text-white shadow-md">
            {SVGIcons.bot}
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Interactive Assistant</h1>
            <p className="text-slate-500 text-sm font-medium">Guided task management</p>
          </div>
        </div>
        <button
          onClick={showInitialOptions}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-lg flex items-center gap-2 transition-colors"
        >
          {SVGIcons.refresh} Restart
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 md:px-12 py-8 flex flex-col gap-6">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          const time = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

          return (
            <div key={msg.id} className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex max-w-[90%] md:max-w-[75%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-end gap-3`}>
                
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center shadow-sm mb-1 ${
                  isUser 
                    ? 'bg-blue-100 text-blue-600' 
                    : msg.isError 
                      ? 'bg-red-100 text-red-500' 
                      : 'bg-purple-100 text-purple-600'
                }`}>
                  {isUser ? SVGIcons.user : SVGIcons.bot}
                </div>

                {/* Bubble Container */}
                <div className="flex flex-col gap-1 w-full">
                  <div
                    className={`px-5 py-3.5 rounded-2xl shadow-sm text-[15px] leading-relaxed whitespace-pre-wrap ${
                      isUser
                        ? 'bg-blue-600 text-white rounded-br-sm'
                        : msg.isError
                          ? 'bg-red-50 text-red-700 border border-red-100 rounded-bl-sm'
                          : 'bg-white border border-slate-200 text-slate-800 rounded-bl-sm'
                    }`}
                  >
                    {msg.content}
                  </div>
                  <span className={`text-[11px] font-medium text-slate-400 ${isUser ? 'text-right mr-1' : 'ml-1'}`}>
                    {time}
                  </span>

                  {/* Options */}
                  {msg.options && msg.options.length > 0 && (
                    <div className={`flex flex-wrap gap-2 mt-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
                      {msg.options.map((opt, i) => (
                        <button
                          key={i}
                          onClick={() => handleOptionClick(opt)}
                          disabled={loading}
                          className="px-4 py-2 bg-white border border-slate-200 hover:border-purple-300 hover:bg-purple-50 hover:text-purple-700 text-slate-700 text-sm font-semibold rounded-xl shadow-sm transition-all disabled:opacity-50"
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {loading && (
          <div className="flex justify-start w-full">
            <div className="flex max-w-[85%] flex-row items-end gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shadow-sm shrink-0">
                {SVGIcons.bot}
              </div>
              <div className="bg-white border border-slate-200 px-5 py-4 rounded-2xl rounded-bl-sm flex gap-1.5 items-center">
                <div className="w-2 h-2 rounded-full bg-slate-300 animate-bounce"></div>
                <div className="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                <div className="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '0.3s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className={`bg-white border-t border-slate-200 p-4 md:p-6 shrink-0 shadow-[0_-4px_20px_-15px_rgba(0,0,0,0.1)] transition-all ${step === 'CREATE_TITLE' ? 'opacity-100 pointer-events-auto' : 'opacity-50 pointer-events-none'}`}>
        <form onSubmit={handleSubmit} className="w-full max-w-4xl mx-auto flex items-center gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={step === 'CREATE_TITLE' ? "Type task title here..." : "Select an option above"}
              className="w-full h-14 bg-slate-50 border border-slate-200 focus:border-purple-400 focus:ring-4 focus:ring-purple-100 rounded-2xl pl-5 pr-12 text-[15px] text-slate-800 transition-all outline-none"
              disabled={loading || step !== 'CREATE_TITLE'}
            />
          </div>
          <button
            type="submit"
            disabled={!input.trim() || loading || step !== 'CREATE_TITLE'}
            className="
              h-14
              w-14
              shrink-0
              rounded-2xl
              bg-gradient-to-tr from-purple-600 to-indigo-600
              hover:from-purple-700 hover:to-indigo-700
              disabled:from-slate-300 disabled:to-slate-300
              flex items-center justify-center
              text-white
              shadow-md
              transition-all
            "
          >
            {SVGIcons.send}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Assistant;
