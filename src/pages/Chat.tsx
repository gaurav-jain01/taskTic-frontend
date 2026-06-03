import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import socket from "../socket";

const API_URL = import.meta.env.VITE_API_URL;

const SVGIcons = {
  send: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-5 h-5"
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      <path d="M3.105 3.105a.5.5 0 01.57-.105l13 6a.5.5 0 010 .9l-13 6A.5.5 0 013 15.5V11l7-1-7-1V3.5a.5.5 0 01.105-.395z" />
    </svg>
  ),
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
    if (role !== "admin" && user?.teamId) {
      fetchMyTeam();
    } else if (role === "admin") {
      fetchTeams();
    }
  }, [role, user]);

  const fetchMyTeam = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/teams/${user.teamId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const team = await response.json();
        setSelectedTeam(team);
      }
    } catch (err) {
      console.error("Failed to fetch team", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedTeam?._id) return;

    fetchMessages(selectedTeam._id);

    socket.emit("joinTeam", selectedTeam._id);

    console.log("Joined Team:", selectedTeam._id);
  }, [selectedTeam]);

  useEffect(() => {
    socket.on("newMessage", (message) => {
      console.log("New Message:", message);

      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.off("newMessage");
    };
  }, []);

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

      console.log("USER:", user);
      console.log("TEAM:", selectedTeam);

      console.log({
        content: newMessage,
        senderId: user?._id,
        teamId: selectedTeam?._id,
      });
      const response = await fetch(`${API_URL}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          content: newMessage,
          senderId: user.id,
          teamId: selectedTeam._id
        })
      });



      if (response.ok) {
        await response.json();

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
    if (loading) {
      return (
        <div className="w-full flex items-center justify-center p-8 min-h-[calc(100vh-80px)] bg-[#FAFAFA]">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      );
    }

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
    <div className="flex flex-col h-full w-full bg-[#FAFAFA]">
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
      <div className="flex-1 overflow-y-auto px-8 py-6 flex flex-col gap-4">
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
            const isMe =
              msg.senderId?._id === user.id ||
              msg.senderId === user.id;
            const senderName = msg.senderId?.name || 'Unknown User';
            const time = new Date(msg.timestamp || msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            return (
              <div
                key={msg._id || index}
                className={`flex flex-col ${isMe
                  ? "ml-auto items-end"
                  : "mr-auto items-start"
                  } max-w-[70%] md:max-w-[60%]`}
              >
                {!isMe && (
                  <span className="text-xs font-semibold text-slate-500 mb-1 ml-1">
                    {senderName}
                  </span>
                )}

                <div
                  className={`px-4 py-3 rounded-2xl shadow-sm break-words ${isMe
                    ? "bg-blue-600 text-white rounded-br-md"
                    : "bg-white border border-slate-200 text-slate-800 rounded-bl-md"
                    }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {msg.content}
                  </p>
                </div>

                <span
                  className={`text-[11px] font-medium mt-1 text-slate-400 ${isMe ? "mr-1" : "ml-1"
                    }`}
                >
                  {time}
                </span>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-slate-200 p-4 md:px-8 pb-6 md:pb-8 shrink-0 shadow-[0_-4px_20px_-15px_rgba(0,0,0,0.1)]">
        <form onSubmit={handleSendMessage} className="w-full max-w-6xl mx-auto flex items-center gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 h-14 bg-slate-50 border border-slate-200 rounded-full px-6 text-[15px]"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="
              h-14
              w-14
              flex-shrink-0
              rounded-full
              bg-blue-600
              hover:bg-blue-700
              flex items-center justify-center
              text-white
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

export default Chat;
