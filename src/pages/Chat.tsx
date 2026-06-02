import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const SVGIcons = {
  send: <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>,
  back: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>,
  team: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
};

const Chat = () => {
  const { user, role, token } = useAuth();
  const [teams, setTeams] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize selectedTeam based on role
  useEffect(() => {
    if (role !== 'admin' && user?.teamId) {
      // For non-admins, they go directly into their team's chat.
      setSelectedTeam({ _id: user.teamId, name: 'My Team' });
    } else if (role === 'admin') {
      fetchTeams();
    }
  }, [role, user]);

  useEffect(() => {
    if (selectedTeam) {
      fetchMessages(selectedTeam._id);
      // Optional: Poll for new messages every 5 seconds
      const interval = setInterval(() => fetchMessages(selectedTeam._id), 5000);
      return () => clearInterval(interval);
    }
  }, [selectedTeam]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchTeams = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/teams`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setTeams(data);
      }
    } catch (err) {
      console.error('Failed to fetch teams', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (teamId: string) => {
    try {
      const response = await fetch(`${API_URL}/messages?teamId=${teamId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (err) {
      console.error('Failed to fetch messages', err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedTeam) return;

    try {
      const response = await fetch(`${API_URL}/messages`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          content: newMessage,
          senderId: user._id,
          teamId: selectedTeam._id
        })
      });

      if (response.ok) {
        const newMsg = await response.json();
        setMessages(prev => [...prev, newMsg]);
        setNewMessage('');
      }
    } catch (err) {
      console.error('Failed to send message', err);
    }
  };

  if (role === 'admin' && !selectedTeam) {
    return (
      <div className="w-full flex flex-col gap-6 p-6 md:p-8 bg-[#FAFAFA] min-h-[calc(100vh-80px)] font-sans overflow-y-auto">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Team Chats</h1>
          <p className="text-slate-500 mt-2 font-medium">Select a team to enter their chat room.</p>
        </div>

        {loading ? (
          <div className="flex justify-center p-12"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
            {teams.map(team => (
              <div 
                key={team._id}
                onClick={() => setSelectedTeam(team)}
                className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group flex flex-col gap-4"
              >
                <div className="w-14 h-14 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  {SVGIcons.team}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{team.name}</h3>
                  <p className="text-slate-500 text-sm mt-1">{team.description || 'No description provided'}</p>
                </div>
                <div className="mt-auto pt-4 border-t border-slate-100 flex items-center text-blue-600 font-semibold text-sm">
                  Join Chat <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (!selectedTeam) {
    return (
      <div className="w-full flex items-center justify-center p-8 min-h-[calc(100vh-80px)] bg-[#FAFAFA]">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-5 text-slate-400">
            {SVGIcons.team}
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">No Team Assigned</h2>
          <p className="text-slate-500 mt-3 font-medium">You must be part of a team to access the chat. Please contact your administrator.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[calc(100vh-80px)] max-h-[calc(100vh-80px)] flex flex-col bg-[#FAFAFA] font-sans -mt-8 -ml-8 -mr-8 border-l border-slate-200" style={{ width: 'calc(100% + 4rem)', marginLeft: '-2rem', marginTop: '-2rem' }}>
      {/* Header */}
      <div className="bg-white border-b border-slate-200 p-4 md:px-8 flex items-center gap-4 shrink-0 shadow-sm z-10 sticky top-0">
        {role === 'admin' && (
          <button 
            onClick={() => setSelectedTeam(null)}
            className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
          >
            {SVGIcons.back}
          </button>
        )}
        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-lg shadow-sm">
          {selectedTeam.name?.charAt(0) || 'T'}
        </div>
        <div className="flex flex-col">
          <h1 className="text-lg font-extrabold text-slate-900">{selectedTeam.name}</h1>
          <span className="text-xs font-semibold text-emerald-500 flex items-center gap-1.5 mt-0.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Chat Room Active
          </span>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col gap-6">
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center opacity-60">
            <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mb-5 text-slate-400">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
            </div>
            <p className="font-extrabold text-slate-700 text-lg">No messages yet</p>
            <p className="font-medium text-slate-500 mt-1">Be the first to say hello!</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMe = msg.senderId?._id === user._id || msg.senderId === user._id;
            const senderName = msg.senderId?.name || 'Unknown User';
            const time = new Date(msg.timestamp || msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            return (
              <div key={msg._id || index} className={`flex flex-col max-w-[75%] md:max-w-[60%] ${isMe ? 'self-end items-end' : 'self-start items-start'}`}>
                {!isMe && <span className="text-[12px] font-bold text-slate-500 mb-1 ml-1">{senderName}</span>}
                <div className={`px-5 py-3.5 rounded-2xl shadow-sm relative ${isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'}`}>
                  <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>
                </div>
                <span className={`text-[11px] font-bold mt-1 text-slate-400 ${isMe ? 'mr-1' : 'ml-1'}`}>{time}</span>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-slate-200 p-4 md:px-8 pb-6 md:pb-8 shrink-0 shadow-[0_-4px_20px_-15px_rgba(0,0,0,0.1)]">
        <form onSubmit={handleSendMessage} className="max-w-5xl mx-auto flex gap-3 relative">
          <input 
            type="text" 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-6 py-4 text-[15px] text-slate-800 font-medium focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-400"
          />
          <button 
            type="submit"
            disabled={!newMessage.trim()}
            className="w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center text-white shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50 disabled:hover:bg-blue-600 hover:scale-105 active:scale-95 shrink-0"
          >
            {SVGIcons.send}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
