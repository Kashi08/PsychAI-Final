'use client';
import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Sidebar from '@/components/Sidebar';
import axios from 'axios';

const WELCOME = { role: 'assistant', content: "Hello! I'm PsychAI, your mental wellness companion. This is a safe, judgment-free space. How are you feeling today?" };

const CLASS_COLORS: Record<string,string> = {
  Normal:'#0E9F6E', Anxiety:'#FBBF24', Depression:'#7C6FCD',
  Stress:'#F97316', Bipolar:'#06B6D4', Suicidal:'#E02424',
};

export default function ChatPage() {
  const [messages, setMessages] = useState<any[]>([WELCOME]);
  const [input, setInput]       = useState('');
  const [typing, setTyping]     = useState(false);
  const [userId, setUserId]     = useState('');
  const bottomRef               = useRef<HTMLDivElement>(null);
  const inputRef                = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUserId(data.user.id);
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
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/chat/claude`, {
        messages: [...history, { role: 'user', content: text }],
      }, { timeout: 20000 });
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: res.data.response,
        mh_class: res.data.mh_class,
        confidence: res.data.confidence,
      }]);
      if (userId) {
        await supabase.from('chat_messages').insert([
          { user_id: userId, role: 'user', content: text, is_crisis: false },
          { user_id: userId, role: 'assistant', content: res.data.response, mh_class: res.data.mh_class, confidence: res.data.confidence, is_crisis: false },
        ]);
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm here for you. Can you tell me more about what you're feeling right now?" }]);
    } finally { setTyping(false); }
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-60 flex flex-col h-screen">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 5C12 5 8 4 6 7C4 10 5 13 7 14C5 15 4 17 5 19C6 21 9 22 12 21" stroke="#0DA99E" strokeWidth="1.8" strokeLinecap="round"/><path d="M12 5C12 5 16 4 18 7C20 10 19 13 17 14C19 15 20 17 19 19C18 21 15 22 12 21" stroke="#0DA99E" strokeWidth="1.8" strokeLinecap="round"/><line x1="12" y1="5" x2="12" y2="21" stroke="#0DA99E" strokeWidth="1.8" strokeLinecap="round"/></svg>
          </div>
          <div>
            <div className="font-display font-bold text-gray-900">PsychAI</div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
              <span className="text-xs text-gray-500">Always here for you</span>
            </div>
          </div>
          <div className="ml-auto bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">Claude + NLP</div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
              {m.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center flex-shrink-0 mt-1">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5C12 5 8 4 6 7C4 10 5 13 7 14" stroke="#0DA99E" strokeWidth="2" strokeLinecap="round"/><path d="M12 5C12 5 16 4 18 7C20 10 19 13 17 14" stroke="#0DA99E" strokeWidth="2" strokeLinecap="round"/><line x1="12" y1="5" x2="12" y2="19" stroke="#0DA99E" strokeWidth="2" strokeLinecap="round"/></svg>
                </div>
              )}
              <div className={`max-w-lg ${m.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                {m.mh_class && m.mh_class !== 'Normal' && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: (CLASS_COLORS[m.mh_class] || '#9CA3AF') + '20', color: CLASS_COLORS[m.mh_class] || '#9CA3AF' }}>
                    {m.mh_class} · {Math.round((m.confidence || 0) * 100)}%
                  </span>
                )}
                <div className={`px-4 py-3 text-sm leading-relaxed ${m.role === 'user' ? 'bubble-user' : 'bubble-ai text-gray-800'}`}>
                  {m.content}
                </div>
              </div>
            </div>
          ))}
          {typing && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center flex-shrink-0">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5C12 5 8 4 6 7C4 10 5 13 7 14" stroke="#0DA99E" strokeWidth="2" strokeLinecap="round"/></svg>
              </div>
              <div className="bubble-ai px-4 py-3 flex items-center gap-1.5">
                {[0,1,2].map(i => <div key={i} className="w-2 h-2 rounded-full bg-gray-300 blink" style={{ animationDelay: `${i*0.2}s` }}></div>)}
              </div>
            </div>
          )}
          <div ref={bottomRef}/>
        </div>

        {/* Input */}
        <div className="bg-white border-t border-gray-100 px-6 py-4">
          <div className="flex gap-3 items-end">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={onKey}
              placeholder="Share what's on your mind... (Enter to send)"
              rows={1}
              className="flex-1 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 resize-none bg-gray-50"
              style={{ maxHeight: 120 }}
            />
            <button onClick={send} disabled={!input.trim() || typing}
              className="w-11 h-11 bg-teal-500 hover:bg-teal-600 disabled:opacity-40 rounded-2xl flex items-center justify-center transition-colors flex-shrink-0"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><line x1="22" y1="2" x2="11" y2="13" stroke="white" strokeWidth="2"/><polygon points="22 2 15 22 11 13 2 9 22 2" stroke="white" strokeWidth="2" fill="none"/></svg>
            </button>
          </div>
          <p className="text-xs text-gray-400 text-center mt-2">PsychAI is not a crisis service. Emergency: iCall 9152987821</p>
        </div>
      </div>
    </div>
  );
}
