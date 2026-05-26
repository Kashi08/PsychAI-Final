'use client';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { getAvatarUrl } from '@/lib/avatars';
import { DEMO_PATIENTS } from '@/lib/demo-patients';

const FALLBACK_PATIENTS: Record<string, { name: string, initials: string, avatar: string }> = {
  '591a9eca-59d2-48ca-962c-e2fd4243f258': { name: 'kashish', initials: 'K', avatar: 'Felix' },
  '144cc8cc-a19a-49f8-af45-add6349afd9b': { name: 'Sneha Joshi', initials: 'SJ', avatar: 'Emma' },
};

function resolvePatientInfo(patientId: string, dbFullName?: string | null, dbAvatarUrl?: string | null) {
  const demo = DEMO_PATIENTS[patientId];
  const fallback = demo ? { name: demo.name, initials: demo.name.substring(0, 2), avatar: demo.avatar } : (FALLBACK_PATIENTS[patientId] || { name: 'Anonymous Patient', initials: 'AP', avatar: 'Felix' });
  return {
    name: dbFullName || fallback.name,
    initials: dbFullName ? dbFullName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : fallback.initials,
    avatar: dbAvatarUrl || fallback.avatar
  };
}

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  read: boolean;
  created_at: string;
}

interface LinkedPatient {
  patient_id: string;
  patient_name: string;
  patient_initials: string;
  patient_avatar: string;
  link_id: string;
}

const DEMO_THREADS = [
  { id:'M001', patient:'Arjun Mehta',   last:'Thank you for checking in, Doctor.', time:'2:30 PM', unread:true,  initials:'AM', risk:'HIGH' },
  { id:'M002', patient:'Priya Kapoor',  last:'I tried the breathing exercise and it helped!', time:'11:45 AM', unread:true, initials:'PK', risk:'MED' },
  { id:'M003', patient:'Arun Tiwari',   last:"I'll see you Thursday. Thank you!", time:'Yesterday', unread:false, initials:'AT', risk:'LOW' },
];

const DEMO_MESSAGES: Record<string, any[]> = {
  M001: [
    { role:'patient', content:"Doctor, I've been having a very tough week. The thoughts are coming back.", time:'2:10 PM' },
    { role:'psych',   content:"Thank you for reaching out. I'm glad you did. Can you tell me more about what's been happening? Are you safe right now?", time:'2:15 PM' },
    { role:'patient', content:'Yes, I am safe. Just feeling very low. The exam results were bad.', time:'2:20 PM' },
    { role:'psych',   content:"I hear you. Academic setbacks can feel overwhelming. Remember what we discussed   one result does not define you. Let's talk more in our session Thursday. Can you do the thought record exercise tonight?", time:'2:25 PM' },
    { role:'patient', content:'Thank you for checking in, Doctor.', time:'2:30 PM' },
  ],
  M002: [
    { role:'patient', content:'Hello doctor, I had another anxious moment during the lecture today.', time:'11:30 AM' },
    { role:'psych',   content:'Hi Priya, I understand. Were you able to use the box breathing technique we practiced last session?', time:'11:40 AM' },
    { role:'patient', content:'I tried the breathing exercise and it helped!', time:'11:45 AM' },
  ],
};

const RESPONSE_TEMPLATES = [
  { label: '📝 CBT Homework',        text: "Please remember to complete your CBT thought record tonight." },
  { label: '🗓️ Session Discuss',     text: "Thank you for reaching out. Let's discuss this further in our upcoming session." },
  { label: '🫁 Breathing Practice',  text: "I'm glad to hear it helped. Keep practicing the breathing exercises we worked on." },
  { label: '🚨 Crisis Support',      text: "If you feel you are in immediate danger, please use the crisis emergency button or contact emergency services." },
];

export default function MessagesPage() {
  const [psychId, setPsychId]         = useState('');
  const [linkedPatients, setLinkedPatients] = useState<LinkedPatient[]>([]);
  const [activePatientId, setActivePatientId] = useState<string | null>(null);

  // Live messages for selected real patient
  const [liveMessages, setLiveMessages] = useState<Message[]>([]);
  const [loadingMsgs, setLoadingMsgs]   = useState(false);

  // Demo mode state
  const [demoActive, setDemoActive]     = useState('M001');
  const [demoMessages, setDemoMessages] = useState(DEMO_MESSAGES);

  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Load psychologist + linked patients
  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      const uid = data.user.id;
      setPsychId(uid);

      const { data: links, error: linksErr } = await supabase
        .from('patient_links')
        .select('id, patient_id')
        .eq('psychologist_id', uid)
        .eq('status', 'active');

      console.log('Fetched links:', { links, linksErr, uid });

      if (!links || links.length === 0) return;

      // Enrich with patient names
      const enriched: LinkedPatient[] = await Promise.all(
        links.map(async (lk: any) => {
          const { data: prof } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('user_id', lk.patient_id)
            .maybeSingle();
          const info = resolvePatientInfo(lk.patient_id, prof?.full_name, prof?.avatar_url);
          return {
            patient_id: lk.patient_id,
            patient_name: info.name,
            patient_initials: info.initials,
            patient_avatar: info.avatar,
            link_id: lk.id,
          };
        })
      );
      setLinkedPatients(enriched);
      if (enriched.length > 0) setActivePatientId(enriched[0].patient_id);
    });
  }, []);

  // Load messages when active real patient changes
  useEffect(() => {
    if (!activePatientId || !psychId) return;
    setLoadingMsgs(true);

    supabase
      .from('psych_messages')
      .select('*')
      .or(
        `and(sender_id.eq.${psychId},receiver_id.eq.${activePatientId}),and(sender_id.eq.${activePatientId},receiver_id.eq.${psychId})`
      )
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        setLiveMessages(data || []);
        setLoadingMsgs(false);
        // Mark incoming as read
        supabase.from('psych_messages')
          .update({ read: true })
          .eq('sender_id', activePatientId)
          .eq('receiver_id', psychId)
          .eq('read', false);
      });
  }, [activePatientId, psychId]);

  // Real-time subscription for incoming messages
  useEffect(() => {
    if (!psychId || !activePatientId) return;
    const channel = supabase.channel(`psych_msgs_${activePatientId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'psych_messages',
        filter: `receiver_id=eq.${psychId}`,
      }, (payload) => {
        const msg = payload.new as Message;
        if (msg.sender_id === activePatientId) {
          setLiveMessages(prev => [...prev, msg]);
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [psychId, activePatientId]);

  // Real-time subscription for new patient links
  useEffect(() => {
    if (!psychId) return;
    
    const refreshLinks = async () => {
      const { data: links } = await supabase.from('patient_links').select('id, patient_id').eq('psychologist_id', psychId).eq('status', 'active');
      if (!links || links.length === 0) return;
      const enriched: LinkedPatient[] = await Promise.all(links.map(async (lk: any) => {
        const { data: prof } = await supabase.from('profiles').select('full_name, avatar_url').eq('user_id', lk.patient_id).maybeSingle();
        const info = resolvePatientInfo(lk.patient_id, prof?.full_name, prof?.avatar_url);
        return { patient_id: lk.patient_id, patient_name: info.name, patient_initials: info.initials, patient_avatar: info.avatar, link_id: lk.id };
      }));
      setLinkedPatients(enriched);
      if (enriched.length > 0 && !activePatientId) setActivePatientId(enriched[0].patient_id);
    };

    const linkChannel = supabase.channel('clinician_active_links')
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'patient_links',
        filter: `psychologist_id=eq.${psychId}`
      }, () => {
        refreshLinks();
      })
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'patient_links',
        filter: `psychologist_id=eq.${psychId}`
      }, () => {
        refreshLinks();
      })
      .subscribe();

    return () => { supabase.removeChannel(linkChannel); };
  }, [psychId, activePatientId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [liveMessages, demoMessages, demoActive]);

  // Send real message to linked patient
  const sendLive = async () => {
    if (!input.trim() || !psychId || !activePatientId || sending) return;
    const text = input.trim();
    setInput('');
    setSending(true);
    const { data } = await supabase.from('psych_messages')
      .insert({ sender_id: psychId, receiver_id: activePatientId, content: text, read: false })
      .select().single();
    if (data) setLiveMessages(prev => [...prev, data]);
    setSending(false);
  };

  // Send demo message
  const sendDemo = () => {
    if (!input.trim()) return;
    const now = new Date();
    setDemoMessages(prev => ({
      ...prev,
      [demoActive]: [...(prev[demoActive] || []), { role: 'psych', content: input, time: format(now, 'h:mm a') }],
    }));
    setInput('');
  };

  const isRealMode = linkedPatients.length > 0;
  const activeThread = isRealMode
    ? linkedPatients.find(p => p.patient_id === activePatientId)
    : DEMO_THREADS.find(t => t.id === demoActive);
  const msgs = isRealMode ? liveMessages : (demoMessages[demoActive] || []);

  const handleSend = () => isRealMode ? sendLive() : sendDemo();
  const handleKey = (e: React.KeyboardEvent) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } };

  return (
    <div className="flex h-[calc(100vh-2rem)] my-4 mr-4 bg-white border border-purple-100/50 rounded-3xl overflow-hidden shadow-sm animate-fade">

      {/* ── Thread list ─────────────────────────────────────────── */}
      <div className="w-80 bg-white border-r border-purple-50/50 flex flex-col overflow-hidden">
        <div className="p-5 border-b border-purple-50/50">
          <h1 className="font-display font-extrabold text-gray-900 text-lg">Messages</h1>
          <p className="text-xs text-gray-400 mt-1 font-semibold">Secure clinical communication</p>
          {isRealMode && (
            <div className="mt-2 flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-lg px-2.5 py-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"/>
              Live   {linkedPatients.length} linked patient{linkedPatients.length > 1 ? 's' : ''}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-gray-50/50">
          {/* Real linked patients */}
          {isRealMode && linkedPatients.map((p, idx) => (
            <button key={p.patient_id} onClick={() => setActivePatientId(p.patient_id)}
              className={`w-full flex items-center gap-3.5 px-5 py-4 hover:bg-psych-50/40 transition-all text-left animate-slide-up ${activePatientId === p.patient_id ? 'bg-psych-50/60 border-r-2 border-r-psych-500' : ''}`}
              style={{ animationDelay: `${idx * 40}ms` }}
            >
              <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 relative shadow-sm bg-psych-100/80">
                <img src={getAvatarUrl(p.patient_avatar)} alt={p.patient_name} className="w-full h-full object-cover" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white absolute -top-0.5 -right-0.5"/>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-gray-800 text-sm">{p.patient_name}</div>
                <div className="text-[10px] text-emerald-600 font-bold uppercase tracking-wide mt-0.5">● Live linked</div>
              </div>
            </button>
          ))}

          {/* Demo threads (always shown as demo) */}
          {!isRealMode && DEMO_THREADS.map((t, idx) => (
            <button key={t.id} onClick={() => setDemoActive(t.id)}
              className={`w-full flex items-center gap-3.5 px-5 py-4 hover:bg-psych-50/40 transition-all text-left animate-slide-up ${demoActive === t.id ? 'bg-psych-50/60 border-r-2 border-r-psych-500' : ''}`}
              style={{ animationDelay: `${idx * 40}ms` }}
            >
              <div className="w-10 h-10 rounded-xl bg-psych-100/80 flex items-center justify-center font-bold text-psych-700 text-sm flex-shrink-0 relative shadow-sm">
                {t.initials}
                {t.unread && <div className="w-3 h-3 rounded-full bg-red-500 border-2 border-white absolute -top-0.5 -right-0.5 animate-pulse"/>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="font-bold text-gray-800 text-sm">{t.patient}</span>
                  <span className="text-[10px] text-gray-400 font-bold">{t.time}</span>
                </div>
                <p className="text-xs text-gray-500 truncate font-medium">{t.last}</p>
              </div>
            </button>
          ))}

          {/* Demo watermark when no real patients */}
          {!isRealMode && (
            <div className="px-5 py-3 bg-amber-50 border-t border-amber-100">
              <p className="text-[10px] text-amber-600 font-bold">⚠ Demo mode   accept a patient request to enable live messaging</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Chat panel ──────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col bg-gray-50/40">
        {activeThread ? (
          <>
            {/* Header */}
            <div className="bg-white border-b border-purple-50/50 px-6 py-4 flex items-center gap-3.5 shadow-sm">
              <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 shadow-sm bg-psych-100">
                <img 
                  src={getAvatarUrl(isRealMode ? (activeThread as LinkedPatient).patient_avatar : (activeThread as typeof DEMO_THREADS[0]).initials)} 
                  alt={isRealMode ? (activeThread as LinkedPatient).patient_name : (activeThread as typeof DEMO_THREADS[0]).patient} 
                  className="w-full h-full object-cover" 
                />
              </div>
              <div>
                <div className="font-display font-extrabold text-gray-900 text-sm">
                  {isRealMode
                    ? (activeThread as LinkedPatient).patient_name
                    : (activeThread as typeof DEMO_THREADS[0]).patient
                  }
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {isRealMode ? (
                    <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wide flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"/>Live Secure Link
                    </span>
                  ) : (
                    <>
                      <span className={`risk-${(activeThread as any).risk?.toLowerCase()} text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide`}>
                        {(activeThread as any).risk} risk
                      </span>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">Demo</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              {loadingMsgs ? (
                <div className="flex items-center justify-center h-full">
                  <div className="w-7 h-7 border-2 border-psych-500 border-t-transparent rounded-full animate-spin"/>
                </div>
              ) : msgs.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-14 h-14 bg-psych-50 rounded-2xl flex items-center justify-center mb-3 border border-psych-100">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--psych-500)" strokeWidth="1.8">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                  </div>
                  <p className="text-sm font-bold text-gray-700">No messages yet</p>
                  <p className="text-xs text-gray-400 mt-1">Start the conversation below</p>
                </div>
              ) : isRealMode ? (
                // Live messages from Supabase
                liveMessages.map((m) => {
                  const isMe = m.sender_id === psychId;
                  return (
                    <div key={m.id} className={`flex ${isMe ? 'flex-row-reverse' : ''} gap-3.5 items-end animate-slide-up`}>
                      <div className={`max-w-md px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${isMe ? 'bg-psych-500 text-white rounded-tr-none' : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none'}`}>
                        <p className="font-medium">{m.content}</p>
                        <div className={`flex items-center gap-1 mt-1.5 text-[9px] font-bold uppercase tracking-wide ${isMe ? 'text-psych-200 justify-end' : 'text-gray-400'}`}>
                          {format(new Date(m.created_at), 'h:mm a')}
                          {isMe && (
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                // Demo messages
                (demoMessages[demoActive] || []).map((m: any, i: number) => (
                  <div key={i} className={`flex ${m.role === 'psych' ? 'flex-row-reverse' : ''} gap-3.5 items-end animate-slide-up`}>
                    <div className={`max-w-md px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${m.role === 'psych' ? 'bg-psych-500 text-white rounded-tr-none' : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none'}`}>
                      <p className="font-medium">{m.content}</p>
                      <div className={`text-[9px] mt-1.5 font-bold tracking-wide uppercase ${m.role === 'psych' ? 'text-psych-200' : 'text-gray-400'}`}>{m.time}</div>
                    </div>
                  </div>
                ))
              )}
              <div ref={bottomRef}/>
            </div>

            {/* Input + templates */}
            <div className="bg-white border-t border-purple-50/50 px-6 py-4">
              <div className="flex gap-2 overflow-x-auto pb-3 mb-1 no-scrollbar">
                {RESPONSE_TEMPLATES.map((tmpl, idx) => (
                  <button key={idx} onClick={() => setInput(tmpl.text)}
                    className="text-[11px] font-bold bg-gray-50 hover:bg-psych-50 hover:text-psych-700 text-gray-600 border border-gray-200/60 px-3 py-1.5 rounded-xl transition-all flex-shrink-0">
                    {tmpl.label}
                  </button>
                ))}
              </div>
              <div className="flex gap-3 items-center">
                <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey}
                  placeholder={isRealMode ? `Message ${(activeThread as LinkedPatient).patient_name}…` : 'Type a message… (demo mode)'}
                  className="flex-1 border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-psych-500 focus:ring-4 focus:ring-psych-500/10 bg-gray-50 focus:bg-white transition-all text-gray-900 font-medium"
                />
                <button onClick={handleSend} disabled={!input.trim() || sending}
                  className="w-11 h-11 bg-psych-500 hover:bg-psych-600 disabled:opacity-40 rounded-2xl flex items-center justify-center transition-all flex-shrink-0 shadow-md shadow-psych-500/10">
                  {sending ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <line x1="22" y1="2" x2="11" y2="13" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                      <polygon points="22 2 15 22 11 13 2 9 22 2" stroke="white" strokeWidth="2.5" fill="none"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <p className="text-sm">Select a thread to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}
