import React, { useMemo, useState } from 'react';
import { MessageCircle, X, Send, Bot } from 'lucide-react';
import chatService from '../services/ChatService';

const PatientChatbot = ({ userName = 'there' }) => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      text: `Hi ${userName}. I am your MediCare assistant. Ask me about appointments, records, or payments.`,
      suggestions: ['Show my upcoming appointments', 'Summarize my records', 'How do I rebook?']
    }
  ]);

  const lastAssistantSuggestions = useMemo(() => {
    const assistant = [...messages].reverse().find((message) => message.role === 'assistant');
    return assistant?.suggestions?.slice(0, 3) || [];
  }, [messages]);

  const sendMessage = async (content) => {
    const question = content.trim();
    if (!question || loading) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      text: question
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await chatService.askPatientAssistant(question);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'assistant',
          text: response?.reply || 'I could not generate a response right now.',
          suggestions: response?.suggestions || []
        }
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'assistant',
          text: 'Chat assistant is temporarily unavailable. Please try again.',
          suggestions: []
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open && (
        <div className="w-[92vw] max-w-sm h-[520px] bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden mb-3">
          <div className="px-4 py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot size={18} />
              <div>
                <p className="text-sm font-semibold">MediCare Assistant</p>
                <p className="text-[11px] text-indigo-100">Patient support bot</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="p-1 rounded hover:bg-white/20">
              <X size={16} />
            </button>
          </div>

          <div className="h-[380px] overflow-y-auto p-3 space-y-3 bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`max-w-[90%] px-3 py-2 rounded-xl text-sm whitespace-pre-wrap ${
                  message.role === 'assistant'
                    ? 'bg-white text-gray-700 border border-gray-200'
                    : 'bg-indigo-600 text-white ml-auto'
                }`}
              >
                {message.text}
              </div>
            ))}
            {loading && (
              <div className="max-w-[70%] px-3 py-2 rounded-xl text-sm bg-white text-gray-500 border border-gray-200">
                Thinking...
              </div>
            )}
          </div>

          <div className="px-3 pt-2 bg-white border-t border-gray-100">
            <div className="flex flex-wrap gap-1.5 mb-2">
              {lastAssistantSuggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => sendMessage(suggestion)}
                  className="text-[11px] px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                >
                  {suggestion}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 pb-3">
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
                placeholder="Ask about appointments, records..."
                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={loading || !input.trim()}
                className="p-2.5 rounded-xl bg-indigo-600 text-white disabled:opacity-50 hover:bg-indigo-700 transition-colors"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((prev) => !prev)}
        className="w-14 h-14 rounded-full bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-xl hover:shadow-2xl transition-all flex items-center justify-center"
        aria-label="Open patient assistant chat"
      >
        <MessageCircle size={22} />
      </button>
    </div>
  );
};

export default PatientChatbot;

