import React, { useMemo, useState } from 'react';
import { MessageCircle, X, Send, Bot } from 'lucide-react';
import chatService from '../services/ChatService';

const DoctorChatbot = ({ doctorName = 'Doctor', onQuickAction }) => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      text: `Hi Dr. ${doctorName}. I can help with today's schedule, pending requests, and performance stats.`,
      suggestions: ['Show today appointments', 'How many pending requests?', 'Show my revenue summary']
    }
  ]);



  const lastAssistantSuggestions = useMemo(() => {
    const assistant = [...messages].reverse().find((message) => message.role === 'assistant');
    return assistant?.suggestions?.slice(0, 3) || [];
  }, [messages]);

  const sendMessage = async (content) => {
    const question = content.trim();
    if (!question || loading) return;

    setMessages((prev) => [...prev, { id: Date.now(), role: 'user', text: question }]);
    setInput('');
    setLoading(true);

    try {
      const response = await chatService.askDoctorAssistant(question);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'assistant',
          intent: response?.intent || '',
          text: response?.reply || 'Unable to generate reply right now.',
          suggestions: response?.suggestions || [],
          quickActions: getQuickActions(response?.intent || '')
        }
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'assistant',
          text: 'Doctor assistant is unavailable right now. Please try again.',
          suggestions: []
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getQuickActions = (intent) => {
    const key = String(intent || '').toUpperCase();
    if (key === 'PENDING_REQUESTS') {
      return [
        { label: 'Open Pending Requests', action: 'OPEN_PENDING_REQUESTS' },
        { label: 'Open Appointments', action: 'OPEN_APPOINTMENTS' }
      ];
    }
    if (key === 'TODAY_SCHEDULE') {
      return [
        { label: 'Open Overview', action: 'OPEN_OVERVIEW' },
        { label: 'Open Confirmed', action: 'OPEN_CONFIRMED_APPOINTMENTS' }
      ];
    }
    if (key === 'UPCOMING_APPOINTMENTS') {
      return [{ label: 'Open Appointments', action: 'OPEN_APPOINTMENTS' }];
    }
    if (key === 'PERFORMANCE_SUMMARY') {
      return [{ label: 'Open Overview', action: 'OPEN_OVERVIEW' }];
    }
    return [];
  };

  return (
    <div className="fixed bottom-10 right-6 z-50">
      {open && (
        <div className="w-[92vw] max-w-sm h-[520px] bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden mb-3 flex flex-col">
          <div className="px-4 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot size={18} />
              <div>
                <p className="text-sm font-semibold">Doctor Assistant</p>
                <p className="text-[11px] text-cyan-100">MediCare AI helper</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="p-1 rounded hover:bg-white/20">
              <X size={16} />
            </button>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-3 bg-slate-50">
            {messages.map((message) => (
              <div key={message.id} className={message.role === 'assistant' ? 'max-w-[90%]' : 'max-w-[90%] ml-auto'}>
                <div
                  className={`px-3 py-2 rounded-xl text-sm whitespace-pre-wrap ${
                    message.role === 'assistant'
                      ? 'bg-white text-slate-700 border border-slate-200'
                      : 'bg-cyan-600 text-white'
                  }`}
                >
                  {message.text}
                </div>
                {message.role === 'assistant' && (message.quickActions || []).length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {message.quickActions.map((item) => (
                      <button
                        key={item.action}
                        onClick={() => onQuickAction?.(item.action)}
                        className="text-[11px] px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="max-w-[70%] px-3 py-2 rounded-xl text-sm bg-white text-slate-500 border border-slate-200">
                Thinking...
              </div>
            )}
          </div>

          <div className="px-3 py-2 bg-white border-t border-slate-100">
            <div className="flex flex-wrap gap-1.5 mb-2">
              {lastAssistantSuggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => sendMessage(suggestion)}
                  className="text-[11px] px-2.5 py-1 rounded-full bg-cyan-50 text-cyan-700 hover:bg-cyan-100"
                >
                  {suggestion}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 pb-1">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    sendMessage(input);
                  }
                }}
                placeholder="Ask about schedule, pending, stats..."
                className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-200 focus:border-cyan-400"
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={loading || !input.trim()}
                className="p-2.5 rounded-xl bg-cyan-600 text-white disabled:opacity-50 hover:bg-cyan-700 transition-colors"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}


      <button
        onClick={() => setOpen((prev) => !prev)}
        className="w-14 h-14 rounded-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-xl hover:shadow-2xl transition-all flex items-center justify-center"
        aria-label="Open doctor assistant chat"
      >
        <MessageCircle size={22} />
      </button>
    </div>
  );
};

export default DoctorChatbot;

