import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

const ChatAssistant = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // 1. Initialize Hooks
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  // Initial Context Message
  useEffect(() => {
    if (location.pathname === '/report' && messages.length === 0) {
        const score = location.state?.feedback?.score || "N/A";
        setMessages([{ 
            role: 'ai', 
            text: `Assessment Complete! Your global score is ${score}/100. I'm here to explain your results or help you practice.` 
        }]);
    }
  }, [location.pathname]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input;
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setInput("");
    setIsTyping(true);

    try {
        // Connect to Real Backend (Accesses 50+ Models via Failover)
        const res = await axios.post('http://localhost:8000/chat', { 
            message: userText,
            context: { page: "Report", details: location.state } 
        });

        setMessages(prev => [...prev, { role: 'ai', text: res.data.reply }]);
    } catch (error) {
        console.error("Chat Error:", error);
        setMessages(prev => [...prev, { role: 'ai', text: "Connection unstable. I can't reach the main server right now." }]);
    } finally {
        setIsTyping(false);
    }
  };

  // 2. Logic Check: Only render on Report Page
  if (location.pathname !== '/report') {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
      
      {/* CHAT WINDOW */}
      {isOpen && (
        <div className="bg-white w-80 md:w-96 h-96 shadow-2xl rounded-2xl border border-gray-200 overflow-hidden flex flex-col pointer-events-auto animate-slide-up mb-4">
            <div className="bg-slate-900 p-4 text-white flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="font-bold text-sm">MockShield Mentor</span>
                </div>
                <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
                    <i className="fa-solid fa-times"></i>
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-3">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-3 rounded-xl text-sm ${
                            msg.role === 'user' 
                            ? 'bg-blue-600 text-white rounded-br-none' 
                            : 'bg-white border border-gray-200 text-slate-700 rounded-bl-none shadow-sm'
                        }`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                {isTyping && <div className="text-xs text-gray-400 ml-2">AI is thinking...</div>}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100 flex gap-2">
                <input
                    className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ask about your feedback..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                />
                <button type="submit" className="w-9 h-9 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700">
                    <i className="fa-solid fa-paper-plane text-xs"></i>
                </button>
            </form>
        </div>
      )}

      {/* FLOATING BUTTON */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="pointer-events-auto w-14 h-14 bg-slate-900 hover:bg-slate-800 text-white rounded-full shadow-2xl flex items-center justify-center transition-transform hover:scale-110 active:scale-95 group"
      >
        {isOpen ? (
            <i className="fa-solid fa-chevron-down text-lg"></i>
        ) : (
            <i className="fa-solid fa-robot text-xl group-hover:animate-bounce"></i>
        )}
      </button>

    </div>
  );
};

export default ChatAssistant;