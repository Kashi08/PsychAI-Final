'use client';
import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Sidebar from '@/components/Sidebar';
import { getAvatarUrl } from '@/lib/avatars';

const WELCOME = {
  role: 'assistant',
  content: "Hello! I'm PsychAI, your mental wellness companion. This is a safe, judgment-free space. How are you feeling today?",
};

const CLASS_COLORS: Record<string, string> = {
  Normal: '#0E9F6E', Anxiety: '#FBBF24', Depression: '#7C6FCD',
  Stress: '#F97316', Bipolar: '#06B6D4', Suicidal: '#E02424',
};

export default function ChatPage() {
  const [messages, setMessages] = useState<any[]>([WELCOME]);
  const [input, setInput]       = useState('');
  const [typing, setTyping]     = useState(false);
  const [userId, setUserId]     = useState('');
  const [avatarSeed, setAvatarSeed] = useState('Felix');
  const bottomRef               = useRef<HTMLDivElement>(null);
  const inputRef                = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserId(data.user.id);
        setAvatarSeed(data.user.user_metadata?.avatar_seed || 'Felix');
      }
    });
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const send = async () => {
    if (!input.trim() || typing) return;
    const text = input.trim();
    setInput('');

    const userMsg = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setTyping(true);

    try {
      const history = messages.slice(-10).map(m => ({ role: m.role, content: m.content }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...history, { role: 'user', content: text }],
        }),
      });

      const data = await res.json();
      const aiMsg = {
        role: 'assistant',
        content: data.response,
        source: data.source,
      };

      setMessages(prev => [...prev, aiMsg]);

      // Save to Supabase
      if (userId) {
        await supabase.from('chat_messages').insert([
          { user_id: userId, role: 'user',      content: text,          is_crisis: false },
          { user_id: userId, role: 'assistant', content: data.response, is_crisis: false },
        ]);
      }
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm here for you. Can you tell me more about what you're feeling right now?",
        source: 'fallback',
      }]);
    } finally {
      setTyping(false);
    }
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  return (
    <div className="flex min-h-screen bg-gradient-mesh">
      <Sidebar />
      <div className="flex-1 md:ml-60 ml-0 flex flex-col h-screen pt-16 md:pt-0">

        {/* Header */}
        <div className="bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex items-center gap-3 flex-shrink-0 shadow-sm">
          <div className="w-12 h-12 flex items-center justify-center flex-shrink-0">
            <img src="/logo.png" alt="PsychAI Logo" className="w-12 h-12 object-contain hover:scale-105 transition-transform duration-200" />
          </div>
          <div>
            <div className="font-display font-bold"><span className="gradient-text">PsychAI</span></div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 status-dot-pulse"></div>
              <span className="text-xs text-gray-500">Always here for you</span>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="hero-badge text-[11px] py-1 px-3 flex items-center gap-1">
              Your Companion
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-teal-500">
                <path d="M8 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 21a9 9 0 100-18 9 9 0 000 18z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
              {m.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-white border border-teal-100/60 flex items-center justify-center flex-shrink-0 mt-1 shadow-xs overflow-hidden p-0.5 animate-fade-in">
                  <img 
                    src="/robot_avatar.png" 
                    alt="AI Assistant" 
                    className="w-full h-full object-cover rounded-full" 
                  />
                </div>
              )}
              {m.role === 'user' && (
                <div className="w-8 h-8 rounded-full overflow-hidden bg-white/40 border border-gray-100 flex-shrink-0 mt-1 shadow-sm">
                  <img 
                    src={getAvatarUrl(avatarSeed)} 
                    alt="User" 
                    className="w-full h-full object-cover" 
                  />
                </div>
              )}
              <div className={`max-w-lg flex flex-col gap-1 ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`px-4 py-3 text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bubble-user bg-teal-500 text-white'
                    : 'bubble-ai bg-white border border-gray-100 text-gray-800'
                }`}>
                  {m.content}
                </div>
                {m.source && m.role === 'assistant' && (
                  <span className="text-xs text-gray-300 px-1">
                    {m.source === 'groq' ? 'Psych AI' : m.source === 'nlp' ? 'NLP model' : 'Offline'}
                  </span>
                )}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {typing && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-white border border-teal-100/60 flex items-center justify-center flex-shrink-0 shadow-xs overflow-hidden p-0.5">
                <img 
                  src="/robot_avatar.png" 
                  alt="AI Assistant" 
                  className="w-full h-full object-cover rounded-full" 
                />
              </div>
              <div className="bg-white border border-gray-100 rounded-[18px_18px_18px_4px] px-4 py-3 shadow-sm flex items-center gap-1.5">
                {[0, 1, 2].map(i => (
                  <div key={i} className="w-2 h-2 rounded-full bg-gray-300"
                    style={{ animation: `blink 1.4s ease-in-out ${i * 0.2}s infinite` }}
                  />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="bg-white border-t border-gray-100 px-6 py-4 flex-shrink-0">
          <div className="flex gap-3 items-end">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={onKey}
              placeholder="Share what's on your mind... (Enter to send, Shift+Enter for new line)"
              rows={1}
              className="flex-1 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 resize-none bg-gray-50"
              style={{ maxHeight: 120 }}
            />
            <button
              onClick={send}
              disabled={!input.trim() || typing}
              className="w-11 h-11 bg-teal-500 hover:bg-teal-600 disabled:opacity-40 rounded-2xl flex items-center justify-center transition-colors flex-shrink-0"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <line x1="22" y1="2" x2="11" y2="13" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2" stroke="white" strokeWidth="2" fill="none"/>
              </svg>
            </button>
          </div>
          <p className="text-xs text-gray-400 text-center mt-2">
            PsychAI is not a crisis service. Emergency helpline: iCall 9152987821
          </p>
        </div>
      </div>
    </div>
  );
}
