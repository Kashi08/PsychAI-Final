'use client';
import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { supabase } from '@/lib/supabase';
import { format, startOfToday, isSameDay, isPast, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from 'date-fns';

interface Appointment {
  id: string;
  patient_id: string;
  psychologist_id: string;
  date: string;
  time_slot: string;
  type: string;
  status: string;
  notes: string;
  created_at: string;
}

// ── Curated psychologist directory (shown when no link exists) ──────────────
const NEARBY_PSYCHOLOGISTS = [
  {
    id: 'psych_001',
    name: 'Dr. Anika Sharma',
    credentials: 'PhD, Clinical Psychology · RCI Licensed',
    clinic: 'MindBridge Wellness Centre',
    location: 'Connaught Place, New Delhi · 1.2 km',
    specialties: ['Anxiety & Stress', 'CBT', 'Trauma Recovery'],
    languages: ['English', 'Hindi'],
    rating: 4.9,
    reviews: 218,
    experience: '12 years',
    sessionFee: '₹1,200',
    avatar: 'Anika',
    available: true,
    availableSlot: 'Next: Tomorrow 10 AM',
    color: '#7C6FCD',
    bg: '#EEEDFE',
  },
  {
    id: 'psych_002',
    name: 'Dr. Rohan Mehta',
    credentials: 'MD Psychiatry · NIMHANS Alumni',
    clinic: 'Serenity Mind Clinic',
    location: 'Bandra West, Mumbai · 2.8 km',
    specialties: ['Depression', 'OCD', 'Mindfulness-Based Therapy'],
    languages: ['English', 'Hindi', 'Marathi'],
    rating: 4.8,
    reviews: 174,
    experience: '9 years',
    sessionFee: '₹1,500',
    avatar: 'Rohan',
    available: true,
    availableSlot: 'Next: Today 4 PM',
    color: '#0DA99E',
    bg: '#E6FAF9',
  },
  {
    id: 'psych_003',
    name: 'Dr. Priya Nair',
    credentials: 'MPhil Clinical Psychology · NIMHANS',
    clinic: 'HealSpace Therapy',
    location: 'Koramangala, Bangalore · 3.4 km',
    specialties: ['Relationship Issues', 'Grief & Loss', 'Teen & Adolescent'],
    languages: ['English', 'Malayalam', 'Kannada'],
    rating: 4.7,
    reviews: 142,
    experience: '7 years',
    sessionFee: '₹900',
    avatar: 'Priya',
    available: false,
    availableSlot: 'Next: Wed 11 AM',
    color: '#E11D48',
    bg: '#FFE4EC',
  },
  {
    id: 'psych_004',
    name: 'Dr. Kabir Sen',
    credentials: 'PhD Psychology · Tata Institute Alumni',
    clinic: 'CalmPath Psychology',
    location: 'Salt Lake, Kolkata · 4.1 km',
    specialties: ['Work Burnout', 'ADHD', 'Family Therapy'],
    languages: ['English', 'Bengali', 'Hindi'],
    rating: 4.9,
    reviews: 301,
    experience: '15 years',
    sessionFee: '₹1,800',
    avatar: 'Kabir',
    available: true,
    availableSlot: 'Next: Tomorrow 9 AM',
    color: '#2563EB',
    bg: '#EBF2FF',
  },
  {
    id: 'psych_005',
    name: 'Dr. Meera Joshi',
    credentials: 'MSc Clinical Psychology · RCI Licensed',
    clinic: 'ThoughtSpace Wellness',
    location: 'Anna Nagar, Chennai · 2.2 km',
    specialties: ['Anxiety & Stress', 'Sleep Disorders', 'Women\'s Mental Health'],
    languages: ['English', 'Tamil'],
    rating: 4.6,
    reviews: 98,
    experience: '6 years',
    sessionFee: '₹800',
    avatar: 'Meera',
    available: true,
    availableSlot: 'Next: Today 5:30 PM',
    color: '#0E9F6E',
    bg: '#DEF7EC',
  },
];

const SPECIALTY_FILTERS = ['All', 'Anxiety & Stress', 'Depression', 'CBT', 'Trauma Recovery', 'Mindfulness', 'Family Therapy', 'Burnout', 'Teen & Adolescent'];

const TIME_SLOTS = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '12:00 PM', '02:00 PM',
  '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM',
  '04:30 PM', '05:00 PM',
];

const SESSION_TYPES = [
  { id: 'video', label: 'Video Call', desc: 'Face-to-face via Zoom/Meet' },
  { id: 'audio', label: 'Audio Call', desc: 'Voice only, more private' },
  { id: 'chat',  label: 'Chat Session', desc: 'Text-based session' },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill={i <= Math.round(rating) ? '#FBBF24' : 'none'} stroke="#FBBF24" strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
    </span>
  );
}

function getSessionTypeIcon(type: string, className = 'w-5 h-5') {
  if (type === 'video') return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
    </svg>
  );
  if (type === 'audio') return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
  );
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  );
}

const STATUS_STYLE: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  pending:   { bg: 'bg-amber-50',  text: 'text-amber-700',  dot: 'bg-amber-400',  label: 'Pending'   },
  confirmed: { bg: 'bg-green-50',  text: 'text-green-700',  dot: 'bg-green-400',  label: 'Confirmed' },
  completed: { bg: 'bg-gray-50',   text: 'text-gray-500',   dot: 'bg-gray-400',   label: 'Completed' },
  cancelled: { bg: 'bg-red-50',    text: 'text-red-600',    dot: 'bg-red-400',    label: 'Cancelled' },
};

// ── Find Psychologists Panel ────────────────────────────────────────────────
function FindPsychologistsPanel({ userId, onLinked }: { userId: string; onLinked: () => void }) {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sentIds, setSentIds] = useState<string[]>([]);
  const [requestModal, setRequestModal] = useState<typeof NEARBY_PSYCHOLOGISTS[0] | null>(null);
  const [requestMsg, setRequestMsg] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  // ── Therapist Code state ───────────────────────────────────────
  const [code, setCode]           = useState('');
  const [codeError, setCodeError] = useState('');
  const [codeLoading, setCodeLoading] = useState(false);
  const [codeSuccess, setCodeSuccess] = useState('');

  const submitCode = async () => {
    if (!code.trim()) return;
    setCodeLoading(true);
    setCodeError('');
    setCodeSuccess('');
    const trimmed = code.trim().toUpperCase();
    // Look up psychologist by access_code
    const { data: psych } = await supabase
      .from('psychologist_profiles')
      .select('user_id, full_name, clinic_name')
      .eq('access_code', trimmed)
      .maybeSingle();

    if (!psych) {
      setCodeError('Invalid code. Please check with your therapist and try again.');
      setCodeLoading(false);
      return;
    }
    // Check if already linked
    const { data: existing } = await supabase
      .from('patient_links')
      .select('id, status')
      .eq('patient_id', userId)
      .eq('psychologist_id', psych.user_id)
      .maybeSingle();

    if (existing) {
      if (existing.status === 'active') {
        setCodeSuccess(`Already linked to ${psych.full_name}! Refreshing…`);
        setTimeout(() => onLinked(), 1500);
        setCodeLoading(false);
        return;
      }
      // Update to active if pending/rejected
      await supabase.from('patient_links').update({ status: 'active' }).eq('id', existing.id);
    } else {
      // Insert as active directly (code = immediate trust)
      const { error: insertErr } = await supabase.from('patient_links').insert({
        patient_id: userId,
        psychologist_id: psych.user_id,
        status: 'active',
      });
      if (insertErr) {
        console.error('Insert error:', insertErr);
        setCodeError('Database error: ' + insertErr.message);
        setCodeLoading(false);
        return;
      }
    }
    setCodeSuccess(`✓ Linked with ${psych.full_name} at ${psych.clinic_name || 'their clinic'}! Refreshing…`);
    setTimeout(() => onLinked(), 1800);
    setCodeLoading(false);
  };

  // ── Fetch Real Clinician UUID for Demo ──────────────────────────
  const [realClinicianId, setRealClinicianId] = useState<string | null>(null);
  useEffect(() => {
    if (!userId) return;
    supabase.from('psychologist_profiles').select('user_id').limit(1).maybeSingle().then(({ data }) => {
      if (data?.user_id) {
        setRealClinicianId(data.user_id);
        // Check if there is already a pending link
        supabase.from('patient_links').select('status')
          .eq('patient_id', userId)
          .eq('psychologist_id', data.user_id)
          .eq('status', 'pending')
          .maybeSingle()
          .then(({ data: linkData }) => {
            if (linkData) {
              setSentIds(NEARBY_PSYCHOLOGISTS.map(p => p.id));
            }
          });
      }
    });
  }, [userId]);

  const filtered = NEARBY_PSYCHOLOGISTS.filter(p => {
    const matchFilter = filter === 'All' || p.specialties.some(s => s.toLowerCase().includes(filter.toLowerCase()));
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.clinic.toLowerCase().includes(search.toLowerCase()) || p.specialties.some(s => s.toLowerCase().includes(search.toLowerCase()));
    return matchFilter && matchSearch;
  });

  const sendRequest = async () => {
    if (!requestModal || !userId) return;
    setSending(true);
    try {
      // Use real UUID if available, otherwise fallback (which will fail FK constraint)
      const targetPsychId = realClinicianId || requestModal.id;
      
      const { error: reqErr } = await supabase.from('patient_links').insert({
        patient_id: userId,
        psychologist_id: targetPsychId,
        status: 'pending',
      });

      if (reqErr) {
        console.error('Request insert error:', reqErr);
        alert('Database error: ' + reqErr.message);
        setSending(false);
        return;
      }
    } catch (err) {
      console.error(err);
    }
    setSentIds(prev => [...prev, requestModal.id]);
    setSent(true);
    setTimeout(() => {
      setSending(false);
      setSent(false);
      setRequestModal(null);
      setRequestMsg('');
    }, 2200);
  };

  return (
    <div className="animate-fade-in">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl mb-8 p-8" style={{ background: 'linear-gradient(135deg, #0DA99E15, #7C6FCD10)' }}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-400/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-400/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-white shadow-sm border border-teal-100 flex items-center justify-center flex-shrink-0">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="#0DA99E" strokeWidth="1.8" strokeLinecap="round"/>
              <circle cx="9" cy="7" r="4" stroke="#0DA99E" strokeWidth="1.8"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="#7C6FCD" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="flex-1">
            <h2 className="font-display font-extrabold text-2xl text-gray-900 mb-1">
              Find a Psychologist Near You
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed max-w-xl">
              You're not linked to a mental health professional yet. Browse verified psychologists below, check their specialties, and send a connection request — they'll review and link your account.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white border border-amber-200 rounded-xl px-4 py-2.5 shadow-sm flex-shrink-0">
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-xs font-bold text-amber-700">No psychologist linked</span>
          </div>
        </div>
      </div>

      {/* Therapist Code */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 mb-8 shadow-sm flex flex-col md:flex-row items-start md:items-center gap-6 animate-slide-up">
        <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center flex-shrink-0">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="#7C6FCD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M9 12l2 2 4-4" stroke="#7C6FCD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="font-display font-bold text-gray-900 text-base mb-1">Have a Therapist Code?</h3>
          <p className="text-gray-500 text-sm">Enter the code provided by your psychologist to instantly connect your accounts.</p>
        </div>
        <div className="w-full md:w-auto flex flex-col gap-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. DR-DEMO-2024"
              className="flex-1 md:w-48 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium tracking-wide focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 uppercase"
              disabled={codeLoading}
            />
            <button
              onClick={submitCode}
              disabled={!code.trim() || codeLoading}
              className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold px-5 py-2.5 rounded-xl transition-all shadow-sm active:scale-95 text-sm flex items-center justify-center min-w-[100px]"
            >
              {codeLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Connect'}
            </button>
          </div>
          {codeError && <p className="text-xs text-red-500 font-medium">{codeError}</p>}
          {codeSuccess && <p className="text-xs text-green-600 font-bold">{codeSuccess}</p>}
        </div>
      </div>

      {/* Search + Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
            <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, clinic, or specialty…"
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-2xl text-sm text-gray-900 bg-white focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all"
          />
        </div>
        <div className="flex items-center gap-2 bg-white border border-gray-100 rounded-2xl px-2 py-1.5 shadow-sm overflow-x-auto flex-shrink-0">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-gray-400 ml-1 flex-shrink-0">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {SPECIALTY_FILTERS.slice(0, 5).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 ${
                filter === f
                  ? 'bg-teal-500 text-white shadow-sm'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <p className="text-xs text-gray-400 font-semibold mb-4 ml-1">
        {filtered.length} verified psychologists near you
      </p>

      {/* Psychologist Cards */}
      <div className="space-y-4">
        {filtered.map(psych => {
          const isExpanded = expandedId === psych.id;
          const isRequested = sentIds.includes(psych.id);

          return (
            <div
              key={psych.id}
              className={`bg-white border rounded-3xl overflow-hidden shadow-sm transition-all duration-300 ${
                isExpanded ? 'border-teal-200 shadow-md' : 'border-gray-100 hover:border-gray-200 hover:shadow-md'
              }`}
            >
              {/* Card Header */}
              <div className="p-5 flex items-start gap-4">
                {/* Avatar */}
                <div
                  className="w-16 h-16 rounded-2xl flex-shrink-0 flex items-center justify-center overflow-hidden relative"
                  style={{ background: psych.bg, border: `1.5px solid ${psych.color}20` }}
                >
                  <img
                    src={`https://api.dicebear.com/7.x/micah/svg?seed=${psych.avatar}&backgroundColor=${psych.bg.replace('#','')}`}
                    alt={psych.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <h3 className="font-display font-extrabold text-gray-900 text-base">{psych.name}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">{psych.credentials}</p>
                    </div>
                    {/* Available badge */}
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold flex-shrink-0 ${
                      psych.available
                        ? 'bg-emerald-50 border border-emerald-100 text-emerald-700'
                        : 'bg-gray-50 border border-gray-100 text-gray-400'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${psych.available ? 'bg-emerald-400 animate-pulse' : 'bg-gray-300'}`}/>
                      {psych.available ? 'Available' : 'Busy'}
                    </div>
                  </div>

                  {/* Clinic & Location */}
                  <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-400">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    <span>{psych.clinic} · {psych.location}</span>
                  </div>

                  {/* Specialties */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {psych.specialties.map(s => (
                      <span key={s} className="text-[10px] font-bold px-2 py-0.5 rounded-full border" style={{ color: psych.color, background: psych.bg, borderColor: `${psych.color}30` }}>
                        {s}
                      </span>
                    ))}
                  </div>

                  {/* Rating + Meta row */}
                  <div className="flex items-center flex-wrap gap-4 mt-3">
                    <div className="flex items-center gap-1.5">
                      <StarRating rating={psych.rating} />
                      <span className="text-xs font-bold text-gray-700">{psych.rating}</span>
                      <span className="text-xs text-gray-400">({psych.reviews} reviews)</span>
                    </div>
                    <span className="text-xs text-gray-400">·</span>
                    <span className="text-xs text-gray-500 font-medium">{psych.experience} exp.</span>
                    <span className="text-xs text-gray-400">·</span>
                    <span className="text-xs font-bold text-teal-600">{psych.sessionFee}/session</span>
                    <span className="text-xs text-gray-400">·</span>
                    <span className="text-xs text-gray-500">{psych.availableSlot}</span>
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="border-t border-gray-50 px-5 py-3.5 flex items-center justify-between gap-3">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : psych.id)}
                  className="text-xs font-bold text-gray-500 hover:text-gray-700 flex items-center gap-1.5 transition-colors"
                >
                  {isExpanded ? (
                    <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 15l-6-6-6 6"/></svg> Hide details</>
                  ) : (
                    <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6"/></svg> View profile</>
                  )}
                </button>

                <div className="flex items-center gap-2">
                  {/* Languages badge */}
                  <span className="hidden sm:flex items-center gap-1 text-[10px] text-gray-400 bg-gray-50 border border-gray-100 rounded-lg px-2 py-1 font-medium">
                    🌐 {psych.languages.join(', ')}
                  </span>

                  {isRequested ? (
                    <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold px-4 py-2 rounded-xl">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                      Request Sent
                    </div>
                  ) : (
                    <button
                      onClick={() => setRequestModal(psych)}
                      className="flex items-center gap-1.5 bg-teal-500 hover:bg-teal-600 active:scale-95 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm shadow-teal-100 hover:shadow-teal-200/50"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72"/><path d="M15 2.05a9 9 0 0 1 6 6.95"/><polyline points="20 2 22 4 18 8"/></svg>
                      Request to Connect
                    </button>
                  )}
                </div>
              </div>

              {/* Expanded Profile */}
              {isExpanded && (
                <div className="border-t border-gray-50 px-5 py-5 bg-gray-50/50 animate-fade-in grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div className="sm:col-span-2 space-y-4">
                    <div>
                      <h4 className="text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-2">About</h4>
                      <p className="text-sm text-gray-500 leading-relaxed">
                        {psych.name} is a highly regarded {psych.credentials} specialising in {psych.specialties.slice(0, 2).join(' and ')}. With {psych.experience} of clinical experience, they provide compassionate, evidence-based therapy through {psych.clinic}.
                      </p>
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-2">Session Formats</h4>
                      <div className="flex flex-wrap gap-2">
                        {SESSION_TYPES.map(t => (
                          <div key={t.id} className="flex items-center gap-1.5 bg-white border border-gray-100 rounded-xl px-3 py-2 text-xs font-semibold text-gray-600 shadow-xs">
                            {getSessionTypeIcon(t.id, 'w-3.5 h-3.5 text-teal-500')}
                            {t.label}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-xs">
                      <h4 className="text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-3">Quick Info</h4>
                      {[
                        { label: 'Experience', value: psych.experience },
                        { label: 'Session Fee', value: psych.sessionFee },
                        { label: 'Languages', value: psych.languages.join(', ') },
                        { label: 'Rating', value: `${psych.rating} ★ (${psych.reviews})` },
                        { label: 'Next Slot', value: psych.availableSlot },
                      ].map(r => (
                        <div key={r.label} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                          <span className="text-xs text-gray-400">{r.label}</span>
                          <span className="text-xs font-bold text-gray-700">{r.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="bg-white border border-dashed border-gray-200 rounded-3xl p-12 text-center">
            <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.8">
                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
              </svg>
            </div>
            <h3 className="font-display font-bold text-gray-700 mb-1">No results found</h3>
            <p className="text-sm text-gray-400">Try a different specialty filter or search term.</p>
            <button onClick={() => { setFilter('All'); setSearch(''); }} className="mt-4 text-xs font-bold text-teal-600 hover:text-teal-700 underline underline-offset-4">Clear filters</button>
          </div>
        )}
      </div>

      {/* Help tip */}
      <div className="mt-6 bg-blue-50 border border-blue-100 rounded-2xl px-5 py-4 flex items-start gap-3">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-blue-400 mt-0.5 flex-shrink-0">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8"/>
          <path d="M12 16v-4M12 8h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        <p className="text-xs text-blue-600 leading-relaxed">
          <strong>How it works:</strong> Once a psychologist accepts your connection request, they'll appear as your linked therapist and you can book appointments directly. You can also enter a <strong>Therapist Code</strong> in <a href="/profile" className="underline">Profile Settings</a> if your professional has given you one.
        </p>
      </div>

      {/* Connection Request Modal */}
      {requestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-7 relative animate-pop-up">
            {/* Close */}
            <button
              onClick={() => { setRequestModal(null); setRequestMsg(''); }}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>

            {sent ? (
              <div className="text-center py-4 animate-pop-up">
                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" stroke="#0E9F6E" strokeWidth="2.5"/><polyline points="22 4 12 14.01 9 11.01" stroke="#0E9F6E" strokeWidth="2.5"/></svg>
                </div>
                <h3 className="font-display font-extrabold text-xl text-gray-900 mb-1">Request Sent!</h3>
                <p className="text-sm text-gray-500">
                  Your connection request to <strong>{requestModal.name}</strong> has been sent. They'll review and link your account shortly.
                </p>
              </div>
            ) : (
              <>
                {/* Modal header */}
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 rounded-2xl overflow-hidden flex-shrink-0" style={{ background: requestModal.bg }}>
                    <img src={`https://api.dicebear.com/7.x/micah/svg?seed=${requestModal.avatar}&backgroundColor=${requestModal.bg.replace('#','')}`} alt={requestModal.name} className="w-full h-full object-cover"/>
                  </div>
                  <div>
                    <h3 className="font-display font-extrabold text-gray-900">Send Connection Request</h3>
                    <p className="text-xs text-gray-500 mt-0.5">To {requestModal.name} · {requestModal.clinic}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Summary */}
                  <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 space-y-2">
                    {[
                      { label: 'Specialties', value: requestModal.specialties.slice(0,2).join(', ') },
                      { label: 'Session Fee', value: requestModal.sessionFee },
                      { label: 'Next Available', value: requestModal.availableSlot },
                    ].map(r => (
                      <div key={r.label} className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">{r.label}</span>
                        <span className="text-xs font-bold text-gray-700">{r.value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Personal message */}
                  <div>
                    <label className="block text-xs font-extrabold text-gray-700 mb-1.5">
                      Personal message <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <textarea
                      rows={3}
                      value={requestMsg}
                      onChange={e => setRequestMsg(e.target.value)}
                      placeholder={`Hi Dr. ${requestModal.name.split(' ').pop()}, I'd like to connect for support with…`}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 resize-none bg-gray-50 transition-all"
                    />
                  </div>

                  <div className="bg-teal-50 border border-teal-100 rounded-xl px-4 py-3">
                    <p className="text-xs text-teal-700 leading-relaxed">
                      Your request will be sent to the psychologist. Once they accept, you'll be linked and can book appointments directly from this page.
                    </p>
                  </div>

                  <button
                    onClick={sendRequest}
                    disabled={sending}
                    className="w-full bg-teal-500 hover:bg-teal-600 disabled:opacity-60 text-white font-bold py-4 rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2 shadow-md shadow-teal-100"
                  >
                    {sending ? (
                      <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/> Sending…</>
                    ) : (
                      <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2" fill="currentColor"/></svg> Send Request</>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Appointments Page ──────────────────────────────────────────────────
export default function AppointmentsPage() {
  const [view, setView]             = useState<'upcoming' | 'book'>('upcoming');
  const [step, setStep]             = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [selectedType, setSelectedType] = useState('video');
  const [notes, setNotes]           = useState('');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading]       = useState(true);
  const [booking, setBooking]       = useState(false);
  const [success, setSuccess]       = useState(false);
  const [userId, setUserId]         = useState('');
  const [psychId, setPsychId]       = useState('');
  const [psychInfo, setPsychInfo]   = useState<any>(null);
  const [noLink, setNoLink]         = useState(false);
  const [currentMonth, setCurrentMonth] = useState(startOfToday());

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      const uid = data.user.id;
      setUserId(uid);

      const { data: link } = await supabase
        .from('patient_links')
        .select('psychologist_id')
        .eq('patient_id', uid)
        .eq('status', 'active')
        .single();

      if (!link) { setNoLink(true); setLoading(false); return; }
      setPsychId(link.psychologist_id);

      const { data: psych } = await supabase
        .from('psychologist_profiles')
        .select('full_name, clinic_name, avatar_url')
        .eq('user_id', link.psychologist_id)
        .single();
      if (psych) setPsychInfo(psych);

      const { data: apts } = await supabase
        .from('appointments')
        .select('*')
        .eq('patient_id', uid)
        .order('date', { ascending: true });
      if (apts) setAppointments(apts);

      setLoading(false);
    });
  }, []);

  const monthStart  = startOfMonth(currentMonth);
  const monthEnd    = endOfMonth(currentMonth);
  const calDays     = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startPad    = getDay(monthStart);
  const today       = startOfToday();

  const isBooked = (date: Date) =>
    appointments.some(a => isSameDay(new Date(a.date), date) && a.status !== 'cancelled');

  const bookAppointment = async () => {
    if (!selectedDate || !selectedSlot || !userId || !psychId) return;
    setBooking(true);
    const { data, error } = await supabase
      .from('appointments')
      .insert({
        patient_id:      userId,
        psychologist_id: psychId,
        date:            format(selectedDate, 'yyyy-MM-dd'),
        time_slot:       selectedSlot,
        type:            selectedType,
        status:          'pending',
        notes:           notes.trim(),
      })
      .select()
      .single();

    if (data) {
      setAppointments(prev => [...prev, data]);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setView('upcoming');
        setStep(1);
        setSelectedDate(null);
        setSelectedSlot('');
        setNotes('');
      }, 2200);
    }
    setBooking(false);
  };

  const cancelAppointment = async (id: string) => {
    await supabase.from('appointments').update({ status: 'cancelled' }).eq('id', id);
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'cancelled' } : a));
  };

  const upcoming = appointments.filter(a => a.status !== 'cancelled' && !isPast(new Date(a.date + 'T23:59:59')));
  const past     = appointments.filter(a => a.status === 'completed' || isPast(new Date(a.date + 'T23:59:59')));

  // ── No link → show find psychologist panel ────────────────────────────────
  if (noLink) return (
    <div className="flex min-h-screen bg-gradient-mesh">
      <Sidebar />
      <div className="flex-1 md:ml-60 ml-0 min-h-screen pt-16 md:pt-0">
        <div className="p-8 max-w-5xl mx-auto w-full animate-fade-in">
          <h1 className="font-display font-extrabold text-3xl mb-1 flex items-center gap-2">
            <span className="gradient-text">Appointments</span>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-teal-500">
              <rect x="3" y="4" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="2"/>
              <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </h1>
          <p className="text-gray-500 text-sm mb-8">Connect with a mental health professional</p>
          <FindPsychologistsPanel userId={userId} onLinked={() => window.location.reload()} />
        </div>
      </div>
    </div>
  );

  // ── Linked → normal appointments UI ──────────────────────────────────────
  return (
    <div className="flex min-h-screen bg-gradient-mesh">
      <Sidebar />
      <div className="flex-1 md:ml-60 ml-0 min-h-screen pt-16 md:pt-0">
        <div className="p-8 max-w-5xl mx-auto w-full">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display font-extrabold text-3xl mb-1 flex items-center gap-2">
              <span className="gradient-text">Appointments</span>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-teal-500">
                <rect x="3" y="4" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="2"/>
                <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </h1>
            <p className="text-gray-500 text-sm">Book and manage sessions with your therapist</p>
          </div>
          <button
            onClick={() => { setView(view === 'book' ? 'upcoming' : 'book'); setStep(1); }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold transition-all ${
              view === 'book'
                ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                : 'bg-teal-500 hover:bg-teal-600 text-white shadow-lg shadow-teal-100'
            }`}
          >
            {view === 'book' ? (
              <><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg> Back</>
            ) : (
              <><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2.5" strokeLinecap="round"/></svg> Book Session</>
            )}
          </button>
        </div>

        {/* Therapist card */}
        {psychInfo && (
          <div className="bg-white border border-gray-100 rounded-3xl p-5 flex items-center gap-4 mb-8 shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-purple-50 overflow-hidden flex-shrink-0 border border-purple-100">
              <img src={`https://api.dicebear.com/7.x/micah/svg?seed=${psychInfo.full_name}&backgroundColor=f3e8ff`} alt="Therapist" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <div className="font-display font-bold text-gray-900">{psychInfo.full_name}</div>
              <div className="text-sm text-gray-500">{psychInfo.clinic_name || 'Mental Health Professional'}</div>
            </div>
            <div className="flex items-center gap-1.5 bg-green-50 border border-green-100 rounded-full px-3 py-1.5">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"/>
              <span className="text-xs font-semibold text-green-700">Linked</span>
            </div>
          </div>
        )}

        {/* UPCOMING VIEW */}
        {view === 'upcoming' && (
          <div className="space-y-8">
            {loading ? (
              <div className="flex items-center justify-center h-48">
                <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"/>
              </div>
            ) : (
              <>
                <section>
                  <h2 className="font-display font-bold text-lg text-gray-900 mb-4">Upcoming</h2>
                  {upcoming.length === 0 ? (
                    <div className="bg-white border border-dashed border-gray-200 rounded-3xl p-10 text-center">
                      <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="3" stroke="#0DA99E" strokeWidth="1.8"/><path d="M16 2v4M8 2v4M3 10h18" stroke="#0DA99E" strokeWidth="1.8" strokeLinecap="round"/></svg>
                      </div>
                      <h3 className="font-display font-bold text-gray-900 mb-1">No upcoming sessions</h3>
                      <p className="text-sm text-gray-400 mb-5">Book your first session with your therapist</p>
                      <button onClick={() => setView('book')} className="bg-teal-500 hover:bg-teal-600 text-white text-sm font-bold px-6 py-2.5 rounded-xl transition-colors">
                        Book now
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {upcoming.map(apt => {
                        const st = STATUS_STYLE[apt.status] || STATUS_STYLE.pending;
                        const typeObj = SESSION_TYPES.find(t => t.id === apt.type);
                        return (
                          <div key={apt.id} className="bg-white border border-gray-100 rounded-3xl p-5 flex items-center gap-5 shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-16 h-16 bg-teal-50 rounded-2xl flex flex-col items-center justify-center flex-shrink-0">
                              <span className="text-xs font-bold text-teal-500 uppercase tracking-wider">{format(new Date(apt.date), 'MMM')}</span>
                              <span className="text-2xl font-extrabold text-teal-700 leading-none">{format(new Date(apt.date), 'd')}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-display font-bold text-gray-900">{apt.time_slot}</span>
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${st.bg} ${st.text}`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`}/>
                                  {st.label}
                                </span>
                              </div>
                              <div className="text-sm text-gray-500 flex items-center gap-1.5 mt-0.5">
                                {getSessionTypeIcon(apt.type, 'w-4 h-4 text-gray-400')}
                                <span>{typeObj?.label} · {format(new Date(apt.date), 'EEEE, MMMM d yyyy')}</span>
                              </div>
                              {apt.notes && <div className="text-xs text-gray-400 mt-1 truncate">Note: {apt.notes}</div>}
                            </div>
                            {apt.status === 'pending' && (
                              <button onClick={() => cancelAppointment(apt.id)} className="text-xs text-red-400 hover:text-red-600 font-medium px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors flex-shrink-0">
                                Cancel
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>

                {past.length > 0 && (
                  <section>
                    <h2 className="font-display font-bold text-lg text-gray-900 mb-4">Past Sessions</h2>
                    <div className="space-y-3">
                      {past.slice(0, 5).map(apt => {
                        const typeObj = SESSION_TYPES.find(t => t.id === apt.type);
                        return (
                          <div key={apt.id} className="bg-white border border-gray-100 rounded-3xl p-4 flex items-center gap-4 opacity-70">
                            <div className="w-12 h-12 bg-gray-100 rounded-xl flex flex-col items-center justify-center flex-shrink-0">
                              <span className="text-xs font-bold text-gray-400 uppercase">{format(new Date(apt.date), 'MMM')}</span>
                              <span className="text-lg font-extrabold text-gray-500 leading-none">{format(new Date(apt.date), 'd')}</span>
                            </div>
                            <div className="flex-1">
                              <div className="text-sm font-semibold text-gray-600">{apt.time_slot} · {typeObj?.label}</div>
                              <div className="text-xs text-gray-400">{format(new Date(apt.date), 'EEEE, MMMM d yyyy')}</div>
                            </div>
                            <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full font-medium">
                              {STATUS_STYLE[apt.status]?.label || apt.status}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                )}
              </>
            )}
          </div>
        )}

        {/* BOOK VIEW */}
        {view === 'book' && (
          <div>
            {/* Progress steps */}
            <div className="flex items-center gap-2 mb-8">
              {['Pick a date', 'Choose time', 'Confirm'].map((label, i) => {
                const n = i + 1;
                const done   = step > n;
                const active = step === n;
                return (
                  <div key={n} className="flex items-center gap-2 flex-1">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors ${
                      done ? 'bg-teal-500 text-white' : active ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {done ? '✓' : n}
                    </div>
                    <span className={`text-sm font-medium ${active ? 'text-gray-900' : 'text-gray-400'}`}>{label}</span>
                    {i < 2 && <div className={`flex-1 h-px ${step > n ? 'bg-teal-400' : 'bg-gray-200'}`}/>}
                  </div>
                );
              })}
            </div>

            {/* Step 1 — Calendar */}
            {step === 1 && (
              <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                <h2 className="font-display font-bold text-xl text-gray-900 mb-6">Select a date</h2>
                <div className="flex items-center justify-between mb-5">
                  <button onClick={() => setCurrentMonth(m => addMonths(m, -1))} disabled={format(currentMonth, 'yyyy-MM') <= format(today, 'yyyy-MM')} className="w-9 h-9 rounded-xl bg-gray-50 hover:bg-gray-100 disabled:opacity-30 flex items-center justify-center transition-colors">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="#374151" strokeWidth="2" strokeLinecap="round"/></svg>
                  </button>
                  <span className="font-display font-bold text-gray-900">{format(currentMonth, 'MMMM yyyy')}</span>
                  <button onClick={() => setCurrentMonth(m => addMonths(m, 1))} className="w-9 h-9 rounded-xl bg-gray-50 hover:bg-gray-100 flex items-center justify-center transition-colors">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="#374151" strokeWidth="2" strokeLinecap="round"/></svg>
                  </button>
                </div>
                <div className="grid grid-cols-7 mb-2">
                  {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
                    <div key={d} className="text-center text-xs font-semibold text-gray-400 py-1">{d}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: startPad }).map((_, i) => <div key={`pad-${i}`}/>)}
                  {calDays.map(day => {
                    const isToday    = isSameDay(day, today);
                    const isPastDay  = isPast(day) && !isToday;
                    const isSelected = selectedDate && isSameDay(day, selectedDate);
                    const booked     = isBooked(day);
                    const isWeekend  = getDay(day) === 0 || getDay(day) === 6;
                    return (
                      <button
                        key={day.toISOString()}
                        onClick={() => !isPastDay && !isWeekend && !booked && setSelectedDate(day)}
                        disabled={isPastDay || isWeekend || booked}
                        className={`relative h-10 w-full rounded-xl text-sm font-medium transition-all
                          ${isSelected ? 'bg-teal-500 text-white shadow-md shadow-teal-100' : ''}
                          ${isToday && !isSelected ? 'border-2 border-teal-400 text-teal-600' : ''}
                          ${!isSelected && !isToday && !isPastDay && !isWeekend && !booked ? 'hover:bg-teal-50 text-gray-700' : ''}
                          ${isPastDay || isWeekend ? 'text-gray-300 cursor-not-allowed' : ''}
                          ${booked && !isSelected ? 'text-gray-300 cursor-not-allowed' : ''}
                        `}
                      >
                        {format(day, 'd')}
                        {booked && <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-teal-400"/>}
                      </button>
                    );
                  })}
                </div>
                <div className="flex items-center gap-4 mt-5 text-xs text-gray-400">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-teal-400 inline-block"/>Already booked</span>
                  <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded border-2 border-teal-400 inline-block"/>Today</span>
                  <span>Weekends unavailable</span>
                </div>
                <button onClick={() => setStep(2)} disabled={!selectedDate} className="w-full mt-6 bg-teal-500 hover:bg-teal-600 disabled:opacity-40 text-white font-bold py-4 rounded-2xl transition-colors">
                  Continue → {selectedDate ? format(selectedDate, 'MMM d') : ''}
                </button>
              </div>
            )}

            {/* Step 2 — Time + Type */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                  <h2 className="font-display font-bold text-xl text-gray-900 mb-1">Choose a time</h2>
                  <p className="text-sm text-gray-400 mb-5">{selectedDate && format(selectedDate, 'EEEE, MMMM d yyyy')}</p>
                  <div className="grid grid-cols-4 gap-2">
                    {TIME_SLOTS.map(slot => (
                      <button key={slot} onClick={() => setSelectedSlot(slot)} className={`py-3 rounded-xl text-sm font-semibold border-2 transition-all ${selectedSlot === slot ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-gray-100 text-gray-600 hover:border-teal-200 hover:bg-teal-50/50'}`}>
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                  <h2 className="font-display font-bold text-xl text-gray-900 mb-5">Session type</h2>
                  <div className="grid grid-cols-3 gap-3">
                    {SESSION_TYPES.map(t => (
                      <button key={t.id} onClick={() => setSelectedType(t.id)} className={`p-4 rounded-2xl border-2 text-left transition-all ${selectedType === t.id ? 'border-teal-500 bg-teal-50' : 'border-gray-100 hover:border-teal-200'}`}>
                        {getSessionTypeIcon(t.id, 'w-6 h-6 mb-2 text-teal-600')}
                        <div className="text-sm font-bold text-gray-900">{t.label}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{t.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                  <h2 className="font-display font-bold text-xl text-gray-900 mb-2">Add a note <span className="text-gray-400 font-normal text-sm">(optional)</span></h2>
                  <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g. I'd like to discuss my anxiety around exams..." rows={3} className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-teal-400 resize-none bg-gray-50"/>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setStep(1)} className="flex-1 py-4 rounded-2xl border-2 border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-colors">← Back</button>
                  <button onClick={() => setStep(3)} disabled={!selectedSlot} className="flex-[2] bg-teal-500 hover:bg-teal-600 disabled:opacity-40 text-white font-bold py-4 rounded-2xl transition-colors">Review booking</button>
                </div>
              </div>
            )}

            {/* Step 3 — Confirm */}
            {step === 3 && (
              <div className="space-y-5">
                <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
                  <h2 className="font-display font-bold text-xl text-gray-900 mb-6">Confirm your booking</h2>
                  <div className="space-y-4">
                    {[
                      { label: 'Therapist',    value: psychInfo?.full_name || 'Your Therapist' },
                      { label: 'Date',         value: selectedDate ? format(selectedDate, 'EEEE, MMMM d yyyy') : '' },
                      { label: 'Time',         value: selectedSlot },
                      { label: 'Session type', value: SESSION_TYPES.find(t => t.id === selectedType)?.label || '' },
                    ].map(row => (
                      <div key={row.label} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                        <span className="text-sm text-gray-400">{row.label}</span>
                        <span className="text-sm font-semibold text-gray-900">{row.value}</span>
                      </div>
                    ))}
                    {notes && (
                      <div className="flex items-start justify-between py-3">
                        <span className="text-sm text-gray-400">Note</span>
                        <span className="text-sm text-gray-600 max-w-xs text-right">{notes}</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-6 bg-teal-50 border border-teal-100 rounded-2xl px-4 py-3">
                    <p className="text-xs text-teal-600 text-center">Your therapist will confirm this appointment. You'll see the status update in your upcoming sessions.</p>
                  </div>
                </div>
                {success && (
                  <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3 animate-pulse">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" stroke="#0E9F6E" strokeWidth="2"/><polyline points="22 4 12 14.01 9 11.01" stroke="#0E9F6E" strokeWidth="2"/></svg>
                    <span className="text-sm font-semibold text-green-700">Booking sent! Redirecting…</span>
                  </div>
                )}
                <div className="flex gap-3">
                  <button onClick={() => setStep(2)} className="flex-1 py-4 rounded-2xl border-2 border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-colors">← Edit</button>
                  <button onClick={bookAppointment} disabled={booking || success} className="flex-[2] bg-teal-500 hover:bg-teal-600 disabled:opacity-60 text-white font-bold py-4 rounded-2xl transition-colors flex items-center justify-center gap-2">
                    {booking ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/> Booking…</> : '✓ Confirm booking'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
