'use client';
import { useState, useEffect, useRef } from 'react';
import Sidebar from '@/components/Sidebar';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { getAvatarUrl } from '@/lib/avatars';

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  read: boolean;
  created_at: string;
}

export default function PatientMessagesPage() {
  const [messages, setMessages]   = useState<Message[]>([]);
  const [input, setInput]         = useState('');
  const [sending, setSending]     = useState(false);
  const [loading, setLoading]     = useState(true);
  const [userId, setUserId]       = useState('');
  const [psychId, setPsychId]     = useState('');
  const [psychInfo, setPsychInfo] = useState<any>(null);
  const [noLink, setNoLink]       = useState(false);
  const [avatarSeed, setAvatarSeed] = useState('Felix');
  const bottomRef                 = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      const uid = data.user.id;
      setUserId(uid);
      setAvatarSeed(data.user.user_metadata?.avatar_seed || 'Felix');

      // Find linked psychologist
      const { data: link } = await supabase
        .from('patient_links')
        .select('psychologist_id')
        .eq('patient_id', uid)
        .eq('status', 'active')
        .single();

      if (!link) { setNoLink(true); setLoading(false); return; }

      setPsychId(link.psychologist_id);

      // Get psych profile
      const { data: psych } = await supabase
        .from('psychologist_profiles')
        .select('full_name, clinic_name')
        .eq('user_id', link.psychologist_id)
        .single();
      if (psych) setPsychInfo(psych);

      // Load messages
      const { data: msgs } = await supabase
        .from('psych_messages')
        .select('*')
        .or(`sender_id.eq.${uid},receiver_id.eq.${uid}`)
        .order('created_at', { ascending: true });
      if (msgs) setMessages(msgs);

      // Mark as read
      await supabase.from('psych_messages').update({ read: true })
        .eq('receiver_id', uid).eq('read', false);

      setLoading(false);
    });
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Real-time subscription
  useEffect(() => {
    if (!userId) return;
    const channel = supabase.channel('patient_msgs')
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'psych_messages',
        filter: `receiver_id=eq.${userId}`,
      }, (payload) => {
        setMessages(prev => [...prev, payload.new as Message]);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  const send = async () => {
    if (!input.trim() || !userId || !psychId || sending) return;
    const text = input.trim();
    setInput('');
    setSending(true);
    const { data } = await supabase.from('psych_messages')
      .insert({ sender_id: userId, receiver_id: psychId, content: text, read: false })
      .select().single();
    if (data) setMessages(prev => [...prev, data]);
    setSending(false);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const initials = psychInfo?.full_name?.split(' ').map((n:string)=>n[0]).slice(0,2).join('') || 'Dr';

  if (noLink) return (
    <div className="flex min-h-screen bg-gradient-mesh">
      <Sidebar />
      <div className="flex-1 md:ml-60 ml-0 min-h-screen pt-16 md:pt-0 flex items-center justify-center p-8">
        <div className="max-w-md text-center">
          <div className="w-20 h-20 bg-teal-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
              <path d="M12 22s-8-4.5-8-11.8A8 8 0 0112 2a8 8 0 018 8.2c0 7.3-8 11.8-8 11.8z" stroke="#0DA99E" strokeWidth="1.8"/>
              <circle cx="12" cy="10" r="3" stroke="#0DA99E" strokeWidth="1.8"/>
            </svg>
          </div>
          <h2 className="font-display font-extrabold text-2xl text-gray-900 mb-3">No therapist linked yet</h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-6">
            Ask your psychologist for their access code, then go to Profile → Therapist code to connect your accounts.
          </p>
          <div className="bg-teal-50 border border-teal-200 rounded-2xl p-5 text-left">
            <p className="text-sm font-semibold text-teal-800 mb-3">Once linked, you can:</p>
            <div className="space-y-2 text-sm text-teal-700">
              <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-teal-500 flex-shrink-0"></div>Send secure messages to your therapist</div>
              <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-teal-500 flex-shrink-0"></div>Receive session notes and resources</div>
              <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-teal-500 flex-shrink-0"></div>Book and confirm appointments</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gradient-mesh">
      <Sidebar />
      <div className="flex-1 md:ml-60 ml-0 flex flex-col h-screen pt-16 md:pt-0">

        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-3 flex-shrink-0">
          <div className="w-11 h-11 rounded-full bg-purple-100 flex items-center justify-center font-bold text-purple-700 flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1">
            <div className="font-display font-bold text-gray-900">
              {psychInfo?.full_name || 'Your Therapist'}
            </div>
            <div className="text-xs text-gray-500">
              {psychInfo?.clinic_name || 'Mental Health Professional'}
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-green-50 border border-green-200 rounded-full px-3 py-1.5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M12 22s-8-4.5-8-11.8A8 8 0 0112 2a8 8 0 018 8.2c0 7.3-8 11.8-8 11.8z" stroke="#0E9F6E" strokeWidth="2"/><circle cx="12" cy="10" r="3" stroke="#0E9F6E" strokeWidth="2"/></svg>
            <span className="text-xs font-semibold text-green-700">Secure</span>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-teal-50 border-b border-teal-100 px-6 py-2">
          <p className="text-xs text-teal-600 text-center">
            Messages are only visible to you and your therapist. For emergencies, call iCall: 9152987821
          </p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center mb-4">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="#0DA99E" strokeWidth="1.8"/></svg>
              </div>
              <h3 className="font-display font-bold text-lg text-gray-900 mb-2">No messages yet</h3>
              <p className="text-sm text-gray-400">Start the conversation with your therapist below.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((m) => {
                const isMe = m.sender_id === userId;
                return (
                  <div key={m.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                    {!isMe && (
                      <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center font-bold text-purple-700 text-xs flex-shrink-0 mt-1">
                        {initials}
                      </div>
                    )}
                    {isMe && (
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-white/40 border border-gray-100 flex-shrink-0 mt-1 shadow-sm">
                        <img 
                          src={getAvatarUrl(avatarSeed)} 
                          alt="User" 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                    )}
                    <div className={`max-w-lg flex flex-col gap-1 ${isMe ? 'items-end' : 'items-start'}`}>
                      <div className={`px-4 py-3 text-sm leading-relaxed rounded-2xl ${isMe ? 'bg-teal-500 text-white rounded-br-sm' : 'bg-white border border-gray-100 text-gray-800 shadow-sm rounded-bl-sm'}`}>
                        {m.content}
                      </div>
                      <span className="text-xs text-gray-400 px-1">
                        {isMe ? 'You' : (psychInfo?.full_name?.split(' ')[0] || 'Therapist')} · {format(new Date(m.created_at), 'h:mm a')}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="bg-white border-t border-gray-100 px-6 py-4 flex-shrink-0">
          <div className="flex gap-3 items-end">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={onKey}
              placeholder="Message your therapist... (Enter to send)"
              rows={1}
              className="flex-1 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 resize-none bg-gray-50"
              style={{ maxHeight: 120 }}
            />
            <button
              onClick={send}
              disabled={!input.trim() || sending}
              className="w-11 h-11 bg-teal-500 hover:bg-teal-600 disabled:opacity-40 rounded-2xl flex items-center justify-center transition-colors flex-shrink-0"
            >
              {sending ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <line x1="22" y1="2" x2="11" y2="13" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  <polygon points="22 2 15 22 11 13 2 9 22 2" stroke="white" strokeWidth="2" fill="none"/>
                </svg>
              )}
            </button>
          </div>
          <p className="text-xs text-gray-400 text-center mt-2">
            Secure messaging — only you and your therapist can read these
          </p>
        </div>
      </div>
    </div>
  );
}
