'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { format, isBefore, startOfDay } from 'date-fns';
import { supabase } from '@/lib/supabase';
import { getAvatarUrl } from '@/lib/avatars';
import { DEMO_PATIENTS } from '@/lib/demo-patients';

const SESSION_TYPES = ['video', 'audio', 'chat', 'Individual therapy', 'CBT session', 'Follow-up'];
const EMPTY_FORM = { patient:'', patient_id:'', type:'video', date:'', time:'', duration:'50', status:'pending' as 'confirmed'|'pending', notes:'' };

export default function SessionsPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [view, setView]     = useState<'upcoming'|'past'>('upcoming');
  const [showNew, setShowNew]   = useState(false);
  const [viewSession, setViewSession] = useState<any|null>(null);
  const [form, setForm]         = useState(EMPTY_FORM);
  const [saving, setSaving]     = useState(false);
  const [countdownText, setCountdownText] = useState('Checking sessions...');
  
  const [patientsList, setPatientsList] = useState<{id:string, name:string, avatar:string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState('');

  const today = startOfDay(new Date());

  useEffect(() => {
    let isMounted = true;
    async function loadSessions() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !isMounted) return;
      const uid = user.id;
      setUserId(uid);

      // 1. Fetch active patients
      const { data: links } = await supabase.from('patient_links').select('patient_id').eq('psychologist_id', uid).eq('status', 'active');
      let pList: {id:string, name:string, avatar:string}[] = [];
      if (links && links.length > 0) {
        const pIds = links.map(l => l.patient_id);
        const { data: profiles } = await supabase.from('profiles').select('user_id, full_name, avatar_url').in('user_id', pIds);
        
        pList = pIds.map(pId => {
          const p = profiles?.find(prof => prof.user_id === pId);
          const demo = DEMO_PATIENTS[pId];
          const fallbackName = demo ? demo.name : (pId === '591a9eca-59d2-48ca-962c-e2fd4243f258' ? 'kashish'
                             : pId === '144cc8cc-a19a-49f8-af45-add6349afd9b' ? 'Sneha Joshi'
                             : 'Anonymous Patient');
          const fallbackAvatar = demo ? demo.avatar : (pId === '591a9eca-59d2-48ca-962c-e2fd4243f258' ? 'Felix'
                               : pId === '144cc8cc-a19a-49f8-af45-add6349afd9b' ? 'Emma'
                               : 'Felix');
          return {
            id: pId,
            name: p?.full_name || fallbackName,
            avatar: p?.avatar_url || fallbackAvatar
          };
        });
        setPatientsList(pList);
      }

      // 2. Fetch appointments
      const { data: apts } = await supabase.from('appointments').select('*').eq('psychologist_id', uid);
      if (apts && isMounted) {
        const formatted = apts.map(a => {
          const matchedPatient = pList.find(p => p.id === a.patient_id);
          const pName = matchedPatient?.name || 'Unknown Patient';
          const pAvatar = matchedPatient?.avatar || 'Felix';
          
          let dObj = new Date(a.date);
          try {
            const timeParts = a.time_slot.match(/(\d+):(\d+)\s*(AM|PM)/i);
            if (timeParts) {
              let h = parseInt(timeParts[1]);
              const m = parseInt(timeParts[2]);
              const ampm = timeParts[3].toUpperCase();
              if (ampm === 'PM' && h < 12) h += 12;
              if (ampm === 'AM' && h === 12) h = 0;
              dObj = new Date(a.date);
              dObj.setHours(h, m, 0, 0);
            }
          } catch {}
          return {
            id: a.id,
            patient: pName,
            patient_id: a.patient_id,
            avatar: pAvatar,
            time: a.time_slot,
            date: format(new Date(a.date), 'MMM d, yyyy'),
            dateObj: dObj,
            duration: 50, // default
            status: a.status,
            type: a.type || 'video',
            notes: a.notes || ''
          };
        });
        setSessions(formatted);
      }
      if (isMounted) setLoading(false);
    }
    loadSessions();
    return () => { isMounted = false; };
  }, []);

  // Live countdown timer hook
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const todayStr = format(now, 'MMM d, yyyy');
      // Filter confirmed sessions for today
      const todaySessions = sessions.filter(s => s.date === todayStr && s.status === 'confirmed');
      if (todaySessions.length === 0) {
        setCountdownText('No more sessions scheduled for today');
        return;
      }

      const parseTime = (timeStr: string) => {
        try {
          const [time, modifier] = timeStr.split(' ');
          let [hours, minutes] = time.split(':').map(Number);
          if (modifier === 'PM' && hours < 12) hours += 12;
          if (modifier === 'AM' && hours === 12) hours = 0;
          const d = new Date();
          d.setHours(hours, minutes, 0, 0);
          return d;
        } catch {
          return new Date();
        }
      };

      const upcoming = todaySessions
        .map(s => ({ ...s, timeObj: parseTime(s.time) }))
        .filter(s => s.timeObj.getTime() > now.getTime())
        .sort((a,b) => a.timeObj.getTime() - b.timeObj.getTime());

      if (upcoming.length === 0) {
        setCountdownText('All sessions completed for today 🧘');
        return;
      }

      const next = upcoming[0];
      const diffMs = next.timeObj.getTime() - now.getTime();
      const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      
      if (diffHrs > 0) {
        setCountdownText(`Next session with ${next.patient} starts in ${diffHrs}h ${diffMins}m ⏱️`);
      } else {
        setCountdownText(`Next session with ${next.patient} starts in ${diffMins}m ⏱️`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 30000);
    return () => clearInterval(interval);
  }, [sessions]);

  const filtered = sessions.filter(s => {
    const d = startOfDay(new Date(s.dateObj));
    return view === 'upcoming' ? !isBefore(d, today) : isBefore(d, today);
  }).sort((a,b) =>
    view === 'upcoming'
      ? a.dateObj.getTime() - b.dateObj.getTime()
      : b.dateObj.getTime() - a.dateObj.getTime()
  );

  const upcomingCount = sessions.filter(s => !isBefore(startOfDay(new Date(s.dateObj)), today)).length;
  const pastCount = sessions.length - upcomingCount;

  const handleAdd = async () => {
    if (!form.patient_id || !form.date || !form.time || !userId) return;
    setSaving(true);
    
    // Convert 24h time format to 12h AM/PM
    let time12h = form.time;
    try {
      const [h, m] = form.time.split(':');
      const hi = parseInt(h);
      const ampm = hi >= 12 ? 'PM' : 'AM';
      const hi12 = hi % 12 || 12;
      time12h = `${hi12.toString().padStart(2, '0')}:${m} ${ampm}`;
    } catch {}

    const { data, error } = await supabase.from('appointments').insert({
      patient_id: form.patient_id,
      psychologist_id: userId,
      date: form.date, // 'yyyy-mm-dd'
      time_slot: time12h,
      type: form.type,
      status: form.status,
      notes: form.notes
    }).select().single();

    if (data) {
      let dObj = new Date(data.date);
      try {
        const timeParts = data.time_slot.match(/(\d+):(\d+)\s*(AM|PM)/i);
        if (timeParts) {
          let h = parseInt(timeParts[1]);
          const m = parseInt(timeParts[2]);
          const ampm = timeParts[3].toUpperCase();
          if (ampm === 'PM' && h < 12) h += 12;
          if (ampm === 'AM' && h === 12) h = 0;
          dObj = new Date(data.date);
          dObj.setHours(h, m, 0, 0);
        }
      } catch {}

      const pInfo = patientsList.find(p => p.id === form.patient_id);
      const pName = pInfo?.name || 'Unknown Patient';
      const pAvatar = pInfo?.avatar || 'Felix';
      
      setSessions(prev => [...prev, {
        id: data.id,
        patient: pName,
        patient_id: data.patient_id,
        avatar: pAvatar,
        time: data.time_slot,
        date: format(new Date(data.date),'MMM d, yyyy'),
        dateObj: dObj,
        duration: parseInt(form.duration) || 50,
        status: data.status,
        type: data.type,
        notes: data.notes || ''
      }]);
    }
    setSaving(false);
    setShowNew(false);
    setForm(EMPTY_FORM);
  };

  const confirmSession = async (id: string) => {
    await supabase.from('appointments').update({ status: 'confirmed' }).eq('id', id);
    setSessions(prev => prev.map(s => s.id === id ? { ...s, status: 'confirmed' } : s));
    if (viewSession && viewSession.id === id) {
      setViewSession({ ...viewSession, status: 'confirmed' });
    }
  };

  if (loading) {
     return (
       <div className="p-7 max-w-4xl mx-auto flex flex-col justify-center items-center py-40 gap-4">
         <div className="w-12 h-12 border-4 border-psych-500 border-t-transparent rounded-full animate-spin"></div>
         <p className="text-gray-400 text-sm font-semibold tracking-wide animate-pulse">Syncing clinical calendar...</p>
       </div>
     );
  }

  function getSessionTypeIcon(type: string) {
    const lowercaseType = (type || '').toLowerCase();
    if (lowercaseType.includes('video')) {
      return (
        <span className="w-10 h-10 rounded-2xl flex items-center justify-center bg-blue-50 text-blue-600 border border-blue-100/50 shadow-sm flex-shrink-0 group-hover:scale-110 transition-transform">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 7l-7 5 7 5V7z" />
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
          </svg>
        </span>
      );
    }
    if (lowercaseType.includes('audio') || lowercaseType.includes('call') || lowercaseType.includes('voice')) {
      return (
        <span className="w-10 h-10 rounded-2xl flex items-center justify-center bg-orange-50 text-orange-600 border border-orange-100/50 shadow-sm flex-shrink-0 group-hover:scale-110 transition-transform">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
        </span>
      );
    }
    if (lowercaseType.includes('chat') || lowercaseType.includes('message')) {
      return (
        <span className="w-10 h-10 rounded-2xl flex items-center justify-center bg-emerald-50 text-emerald-600 border border-emerald-100/50 shadow-sm flex-shrink-0 group-hover:scale-110 transition-transform">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </span>
      );
    }
    return (
      <span className="w-10 h-10 rounded-2xl flex items-center justify-center bg-purple-50 text-purple-600 border border-purple-100/50 shadow-sm flex-shrink-0 group-hover:scale-110 transition-transform">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      </span>
    );
  }

  return (
    <div className="p-7 max-w-4xl mx-auto animate-fade">
      {/* Premium title consistent with Patient UI layout style */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="font-display font-extrabold text-3xl mb-1 flex items-center gap-2">
            <span className="gradient-text">Sessions Schedule</span>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-psych-500 animate-pulse">
              <rect x="3" y="4" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="2.2"/>
              <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
            </svg>
          </h1>
          <p className="text-gray-500 text-sm font-semibold tracking-wide">
            {upcomingCount} upcoming appointments · {pastCount} past consultations
          </p>
        </div>
        <button 
          onClick={() => setShowNew(true)}
          className="bg-psych-500 hover:bg-psych-600 active:scale-95 text-white font-bold text-sm px-6 py-3 rounded-2xl transition-all shadow-lg shadow-psych-500/20 flex items-center justify-center gap-2 self-start sm:self-center"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add New Session
        </button>
      </div>

      {/* Countdown Widget */}
      {view === 'upcoming' && (
        <div className="bg-blue-100 backdrop-blur-md border border-blue-200 rounded-3xl p-6 mb-8 text-black shadow-sm flex items-center gap-5 animate-spring relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/30 rounded-full blur-2xl pointer-events-none" />
          <div className="w-12 h-12 bg-white/50 rounded-2xl flex items-center justify-center flex-shrink-0 relative">
            <span className="absolute inset-0 rounded-2xl bg-white/40 animate-ping" />
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2" strokeLinecap="round"/></svg>
          </div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-black/60">Clinical Schedule Assistant</div>
            <div className="text-sm font-extrabold mt-1 tracking-wide leading-relaxed text-black">{countdownText}</div>
          </div>
        </div>
      )}

      {/* Modern Filter Tab Switcher with Counts */}
      <div className="flex bg-gray-100/80 p-1.5 rounded-2xl gap-1 w-fit mb-8 border border-gray-200/50 shadow-inner">
        {(['upcoming', 'past'] as const).map(v => {
          const isActive = view === v;
          const count = v === 'upcoming' ? upcomingCount : pastCount;
          return (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${
                isActive
                  ? 'bg-white text-psych-600 shadow-md shadow-psych-500/5 border-b border-gray-100'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-white/40'
              }`}
            >
              <span className="capitalize">{v} Sessions</span>
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                isActive
                  ? 'bg-psych-50 text-psych-600 border border-psych-100/50'
                  : 'bg-gray-200/60 text-gray-500'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Session list / timeline */}
      <div className="relative pl-8 sm:pl-12 ml-4 space-y-6">
        {filtered.length > 0 && (
          <div className="absolute left-3 top-3 bottom-3 w-0.5 bg-gradient-to-b from-psych-400/80 via-teal-300 to-purple-400/80 rounded-full" />
        )}

        {filtered.length === 0 && (
          <div className="bg-white/70 backdrop-blur-md border border-dashed border-gray-200 rounded-3xl p-16 text-center shadow-xl shadow-psych-500/5 ml-[-2.5rem] animate-slide-up">
            <div className="w-16 h-16 bg-psych-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-psych-100">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--psych-500)" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M8 12h8"/>
              </svg>
            </div>
            <h3 className="font-display font-extrabold text-gray-800 text-lg mb-1">No {view} sessions</h3>
            <p className="text-gray-400 text-sm max-w-sm mx-auto leading-relaxed">
              Your clinical calendar is currently clear. You can schedule a new patient appointment using the button above.
            </p>
            {view === 'upcoming' && (
              <button
                onClick={() => setShowNew(true)}
                className="mt-5 bg-psych-100 hover:bg-psych-200 text-psych-600 text-xs font-black px-5 py-2.5 rounded-xl transition-all shadow-sm active:scale-95"
              >
                Schedule First Appointment
              </button>
            )}
          </div>
        )}

        {filtered.map((s, idx) => {
          const isPending = s.status === 'pending';
          const isConfirmed = s.status === 'confirmed';
          
          return (
            <div key={s.id} 
              onClick={() => setViewSession(s)}
              className="group bg-white/80 backdrop-blur-md border border-white/60 shadow-xl shadow-psych-500/5 rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center gap-5 hover:border-psych-300/60 hover:shadow-psych-500/10 transition-all duration-300 cursor-pointer relative hover:-translate-y-0.5 animate-slide-up"
              style={{ animationDelay: `${idx * 40}ms` }}
            >
              {/* Glowing Timeline Intersection Node based on status */}
              <div className={`absolute -left-[35px] sm:-left-[43px] top-[32px] sm:top-1/2 sm:-translate-y-1/2 w-4 h-4 rounded-full bg-white border-4 ${
                isConfirmed ? 'border-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'border-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.6)]'
              } group-hover:scale-125 transition-transform duration-200`} />

              {/* Glass Date/Time Badge */}
              <div className="text-center bg-gradient-to-br from-psych-50/80 to-purple-50/40 rounded-2xl px-4 py-3 flex-shrink-0 border border-psych-100/30 shadow-sm min-w-[100px] flex flex-col justify-center items-center">
                <div className="text-[10px] text-psych-600 font-extrabold uppercase tracking-wider">{s.date.split(',')[0]}</div>
                <div className="font-display font-black text-psych-800 text-xs mt-1.5 whitespace-nowrap">{s.time}</div>
              </div>

              {/* Styled Session Type Icon */}
              {getSessionTypeIcon(s.type)}

              {/* Info details with Patient Avatar */}
              <div className="flex-1 flex items-center gap-3.5 min-w-0">
                <div className="w-11 h-11 rounded-2xl overflow-hidden flex items-center justify-center flex-shrink-0 bg-psych-50/80 border border-psych-100/40 relative">
                  <img src={getAvatarUrl(s.avatar)} alt={s.patient} className="w-full h-full object-cover" />
                  <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${
                    isConfirmed ? 'bg-green-500' : 'bg-amber-400'
                  }`} />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-gray-800 text-sm group-hover:text-psych-600 transition-colors duration-200 truncate">{s.patient}</h3>
                  <div className="text-xs text-gray-400 mt-1 font-semibold flex items-center gap-1.5 flex-wrap">
                    <span className="capitalize text-psych-500 font-black">{s.type}</span>
                    <span>·</span>
                    <span>{s.duration} min duration</span>
                  </div>
                  {s.notes && (
                    <p className="text-[11px] text-gray-400 font-medium truncate mt-1.5 max-w-sm">
                      📝 {s.notes}
                    </p>
                  )}
                </div>
              </div>

              {/* Status Pill & Action button */}
              <div className="flex items-center justify-between sm:justify-end gap-4 mt-3 sm:mt-0 pt-3 sm:pt-0 border-t border-gray-100 sm:border-t-0">
                <span className={`text-[10px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-full border ${
                  isConfirmed
                    ? 'bg-green-50 text-green-700 border-green-200/50 shadow-sm'
                    : 'bg-amber-50 text-amber-700 border-amber-200/50'
                }`}>
                  {s.status}
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); setViewSession(s); }}
                  className="text-xs font-bold border border-gray-200 hover:border-psych-300 text-gray-600 hover:text-psych-700 px-4 py-2.5 rounded-xl transition-all shadow-sm hover:scale-[1.03] active:scale-[0.97] bg-white hover:bg-psych-50/50"
                >
                  View Details
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── New Session Modal ── */}
      {showNew && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md animate-spring overflow-hidden border border-gray-100">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h2 className="font-display font-extrabold text-gray-900 text-lg">Schedule Appointment</h2>
                <p className="text-sm text-gray-400 mt-0.5 font-medium">Create a new consultation slot</p>
              </div>
              <button 
                onClick={() => { setShowNew(false); setForm(EMPTY_FORM); }}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round"/></svg>
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Warning card if no patients linked yet */}
              {patientsList.length === 0 && (
                <div className="bg-amber-50/80 border border-amber-200/50 rounded-2xl p-4 text-amber-800 flex gap-3.5 shadow-sm animate-spring">
                  <svg className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-amber-900 leading-none">No Active Links</h4>
                    <p className="text-[11px] mt-1 text-amber-700 leading-relaxed font-semibold">
                      You must be connected to patients to schedule sessions. Give your patients your <strong>Therapist Code</strong> in profile.
                    </p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Patient *</label>
                <select 
                  value={form.patient_id} 
                  onChange={e=>setForm(f=>({...f,patient_id:e.target.value}))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-psych-500 bg-gray-50/60 focus:bg-white focus:ring-4 focus:ring-psych-500/10 transition-all text-gray-900 font-medium"
                >
                  <option value="">Select patient</option>
                  {patientsList.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Session Type</label>
                <select 
                  value={form.type} 
                  onChange={e=>setForm(f=>({...f,type:e.target.value}))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-psych-500 bg-gray-50/60 focus:bg-white focus:ring-4 focus:ring-psych-500/10 transition-all text-gray-900 font-medium"
                >
                  {SESSION_TYPES.map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Date *</label>
                  <input 
                    type="date" 
                    value={form.date} 
                    onChange={e=>setForm(f=>({...f,date:e.target.value}))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-psych-500 bg-gray-50/60 focus:bg-white focus:ring-4 focus:ring-psych-500/10 transition-all text-gray-900 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Time *</label>
                  <input 
                    type="time" 
                    value={form.time} 
                    onChange={e=>setForm(f=>({...f,time:e.target.value}))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-psych-500 bg-gray-50/60 focus:bg-white focus:ring-4 focus:ring-psych-500/10 transition-all text-gray-900 font-medium"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Duration (min)</label>
                  <select 
                    value={form.duration} 
                    onChange={e=>setForm(f=>({...f,duration:e.target.value}))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-psych-500 bg-gray-50/60 focus:bg-white focus:ring-4 focus:ring-psych-500/10 transition-all text-gray-900 font-medium"
                  >
                    {['30','45','50','60','90'].map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Status</label>
                  <select 
                    value={form.status} 
                    onChange={e=>setForm(f=>({...f,status:e.target.value as any}))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-psych-500 bg-gray-50/60 focus:bg-white focus:ring-4 focus:ring-psych-500/10 transition-all text-gray-900 font-medium"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Clinical Notes / Agenda <span className="text-gray-400 font-medium">(optional)</span></label>
                <textarea 
                  rows={2}
                  value={form.notes} 
                  onChange={e=>setForm(f=>({...f,notes:e.target.value}))}
                  placeholder="e.g. Cognitive restructuring focus, review weekly journal updates..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-psych-500 bg-gray-50/60 focus:bg-white focus:ring-4 focus:ring-psych-500/10 transition-all text-gray-900 font-medium resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 p-6 pt-0 border-t border-gray-50 mt-4 pt-4">
              <button 
                onClick={() => { setShowNew(false); setForm(EMPTY_FORM); }}
                className="flex-1 border border-gray-200 text-gray-600 font-bold text-sm py-3 rounded-2xl transition-colors hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleAdd} 
                disabled={saving || !form.patient_id || !form.date || !form.time}
                className="flex-1 bg-psych-500 hover:bg-psych-600 disabled:opacity-40 text-white font-bold text-sm py-3 rounded-2xl transition-all shadow-md shadow-psych-500/15 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
              >
                {saving ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>Scheduling...</>
                ) : 'Schedule Session'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── View Session Modal ── */}
      {viewSession && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md animate-spring overflow-hidden border border-gray-100">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="font-display font-extrabold text-gray-900 text-lg">Consultation Overview</h2>
              <button 
                onClick={() => setViewSession(null)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round"/></svg>
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              {/* Date/Time Glass Header */}
              <div className="bg-gradient-to-br from-psych-50 to-purple-50/70 border border-psych-100/50 rounded-2xl p-5 text-center shadow-inner relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-psych-200/10 rounded-full blur-lg" />
                <div className="font-display font-black text-2xl text-psych-700 whitespace-nowrap leading-none">{viewSession.time}</div>
                <div className="text-[10px] text-psych-500 font-extrabold mt-2.5 uppercase tracking-widest leading-none">{viewSession.date}</div>
              </div>

              {/* Patient Profile Quick Summary */}
              <div className="flex items-center gap-3.5 bg-gray-50/80 border border-gray-100 rounded-2xl p-4 shadow-sm">
                <div className="w-12 h-12 rounded-2xl overflow-hidden flex-shrink-0 bg-psych-100 relative shadow-inner">
                  <img src={getAvatarUrl(viewSession.avatar)} alt={viewSession.patient} className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-black text-gray-900 text-sm">{viewSession.patient}</h4>
                  <p className="text-[11px] text-gray-400 font-bold tracking-wide mt-0.5">Active Linked Client</p>
                </div>
              </div>

              <div className="space-y-3.5">
                {[
                  { label:'Session Type', value: viewSession.type },
                  { label:'Duration',     value: `${viewSession.duration} minutes` },
                  { label:'Status',       value: viewSession.status },
                ].map(row => (
                  <div key={row.label} className="flex justify-between py-2 border-b border-gray-50 last:border-0 items-center">
                    <span className="text-xs text-gray-400 font-extrabold uppercase tracking-wider">{row.label}</span>
                    <span className={`text-xs font-black capitalize ${
                      row.label === 'Status'
                        ? (viewSession.status === 'confirmed' ? 'text-green-700 bg-green-50 px-3.5 py-1 rounded-full border border-green-200/50 shadow-sm font-black' : 'text-amber-700 bg-amber-50 px-3.5 py-1 rounded-full border border-amber-200/50 font-black')
                        : 'text-gray-800'
                    }`}>
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Display clinical notes if present */}
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Session Goal / Notes</h4>
                <p className="text-xs text-gray-600 font-medium leading-relaxed">
                  {viewSession.notes || 'No custom notes provided for this appointment slot.'}
                </p>
              </div>

              {/* Direct-Action CTAs inside details card based on session type */}
              {viewSession.status === 'confirmed' && (
                <div className="pt-2 border-t border-gray-50 space-y-2.5 animate-spring">
                  <h4 className="text-[10px] font-black text-psych-600 uppercase tracking-widest text-center">Active Session Launcher</h4>
                  {viewSession.type.toLowerCase().includes('video') && (
                    <a 
                      href={`https://meet.google.com/new`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-3 px-4 rounded-2xl shadow-lg shadow-blue-500/20 active:scale-95 transition-all w-full text-center"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M23 7l-7 5 7 5V7z" />
                        <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                      </svg>
                      Launch Video Consultation
                    </a>
                  )}
                  {(viewSession.type.toLowerCase().includes('audio') || viewSession.type.toLowerCase().includes('call') || viewSession.type.toLowerCase().includes('voice')) && (
                    <button 
                      onClick={() => alert(`Initiating secure high-fidelity audio consultation connection with ${viewSession.patient}...`)}
                      className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm py-3 px-4 rounded-2xl shadow-lg shadow-orange-500/20 active:scale-95 transition-all w-full"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                      Start Audio Call
                    </button>
                  )}
                  {(viewSession.type.toLowerCase().includes('chat') || viewSession.type.toLowerCase().includes('message')) && (
                    <Link 
                      href={`/messages?patient=${viewSession.patient_id}`}
                      className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm py-3 px-4 rounded-2xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all w-full text-center"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                      Open Secure Chat
                    </Link>
                  )}
                  {!['video', 'audio', 'call', 'voice', 'chat', 'message'].some(x => viewSession.type.toLowerCase().includes(x)) && (
                    <button 
                      onClick={() => alert(`Starting customized clinical consultation with ${viewSession.patient}...`)}
                      className="flex items-center justify-center gap-2 bg-psych-600 hover:bg-psych-700 text-white font-bold text-sm py-3 px-4 rounded-2xl shadow-lg shadow-psych-500/20 active:scale-95 transition-all w-full"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      </svg>
                      Start Clinical Consultation
                    </button>
                  )}
                </div>
              )}
            </div>
            
            <div className="p-6 pt-0 flex gap-3 border-t border-gray-50 mt-4 pt-4">
              {viewSession.status === 'pending' && (
                <button 
                  onClick={() => confirmSession(viewSession.id)}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold text-sm py-3 rounded-2xl transition-all shadow-md shadow-green-500/10 active:scale-95"
                >
                  Confirm Appointment
                </button>
              )}
              <button 
                onClick={() => setViewSession(null)}
                className="flex-1 border border-gray-200 text-gray-600 font-bold text-sm py-3 rounded-2xl hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
