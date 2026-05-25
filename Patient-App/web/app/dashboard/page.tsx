'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import Link from 'next/link';
import { getAvatarUrl } from '@/lib/avatars';
import { useTheme } from '@/components/ThemeProvider';

const MOOD_COLORS = ['#E02424','#F97316','#FBBF24','#3BD671','#0E9F6E'];
const MOOD_LABELS = ['Struggling','Low','Okay','Good','Great'];
const THEME_COLORS: Record<string, string> = {
  'theme-green': '#0DA99E',
  'theme-purple': '#7C6FCD',
  'theme-blue': '#2563EB',
  'theme-rose': '#E11D48',
};

export default function DashboardPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const themeHex = THEME_COLORS[theme] || '#0DA99E';
  const [profile, setProfile]   = useState<any>(null);
  const [moodLogs, setMoodLogs] = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; char: string }[]>([]);
  const [avatarSeed, setAvatarSeed] = useState<string>('Felix');

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login');
        return;
      }
      setAvatarSeed(user.user_metadata?.avatar_seed || 'Felix');
      const [{ data: prof }, { data: moods }] = await Promise.all([
        supabase.from('profiles').select('*').eq('user_id', user.id).maybeSingle(),
        supabase.from('mood_logs').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(30),
      ]);
      
      if (!prof) {
        router.push('/onboarding');
        return;
      }

      setProfile(prof);
      setMoodLogs(moods || []);
      setLoading(false);
    })();
  }, []);

  const triggerStreakConfetti = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const emojis = ['🔥', '✨', '💖', '⭐', '🎉', '🧠', '🎈', '🙌', '💯', '🌸'];
    const newParticles = Array.from({ length: 12 }).map((_, i) => ({
      id: Date.now() + i + Math.random(),
      x: e.clientX - rect.left + (Math.random() * 60 - 30),
      y: e.clientY - rect.top + (Math.random() * 20 - 10),
      char: emojis[Math.floor(Math.random() * emojis.length)],
    }));
    setParticles(prev => [...prev, ...newParticles]);
    // Cleanup particles after animation completes
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)));
    }, 1200);
  };

  const score   = profile?.wellness_score ?? 50;
  const streak  = profile?.streak ?? 0;
  const level   = profile?.level ?? 1;
  const xp      = profile?.xp ?? 0;
  const xpNext  = level * 500;
  const name    = profile?.full_name?.split(' ')[0] ?? 'Friend';
  const hour    = new Date().getHours();
  const greet   = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const scoreColor = score >= 70 ? '#0E9F6E' : score >= 45 ? '#FBBF24' : '#E02424';

  const chartData = [...moodLogs].reverse().slice(-14).map(m => ({
    day: new Date(m.created_at).toLocaleDateString('en', { weekday: 'short' }),
    score: m.score,
  }));

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="p-8 max-w-5xl mx-auto w-full animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full overflow-hidden bg-white/40 backdrop-blur-md border-2 border-white shadow-sm p-1 flex-shrink-0 animate-scale-up float-card-1">
            <img 
              src={getAvatarUrl(avatarSeed)} 
              alt="Avatar" 
              className="w-full h-full object-cover" 
            />
          </div>
          <div>
            <p className="text-gray-500 text-sm animate-fade-in">{greet},</p>
            <h1 className="font-display font-extrabold text-3xl animate-fade-in delay-1 flex items-center gap-2">
              <span className="gradient-text">{greet},</span> {name} 
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="inline-block text-yellow-500 animate-wave origin-bottom-right">
                <path d="M14.5 9.5L16.29 7.71C16.6 7.4 16.6 6.9 16.29 6.59L15.41 5.71C15.1 5.4 14.6 5.4 14.29 5.71L10 10V18C10 19.1 10.9 20 12 20H15.5C16.3 20 17 19.3 17 18.5V13C17 12.4 16.6 12 16 12H15V9.5z" fill="currentColor"/>
                <path d="M8 12C6.9 12 6 12.9 6 14V18C6 19.1 6.9 20 8 20V12z" fill="currentColor" opacity="0.6"/>
                <path d="M12 2L10 4V10L14 6L12 2z" fill="currentColor" opacity="0.3"/>
              </svg>
            </h1>
          </div>
        </div>
        <div 
          onClick={triggerStreakConfetti}
          className="btn-confetti flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-full px-4 py-2 cursor-pointer hover:scale-105 active:scale-95 transition-all relative overflow-visible select-none hover:shadow-md"
          title="Click for a confetti surprise!"
        >
          {particles.map(p => (
            <span
              key={p.id}
              className="particle"
              style={{ left: `${p.x}px`, top: `${p.y}px` }}
            >
              {p.char}
            </span>
          ))}
          <svg className="animate-bounce" width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 01-14 0C5 14 6 13 6 12c.7 1.4 2 2 2.5 2.5z" stroke="#EF4444" strokeWidth="1.8" fill="#EF4444" fillOpacity="0.2"/></svg>
          <span className="font-extrabold text-red-500 text-base">{streak}</span>
          <span className="text-amber-700 text-xs font-semibold flex items-center gap-1">
            day streak 
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-orange-500">
              <path d="M12 2c0 0-4 3.5-4 8 0 4.5 3 6.5 4 12 1-5.5 4-7.5 4-12 0-4.5-4-8-4-8z" fill="currentColor"/>
              <path d="M12 12c0 0-1.5 1.5-1.5 3.5 0 2.5 1.5 4.5 1.5 6.5.5-2 1.5-4 1.5-6.5C13.5 13.5 12 12 12 12z" fill="#FFF8F1"/>
            </svg>
          </span>
        </div>
      </div>

      {/* Top cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        {/* Wellness score */}
        <div className="card tilt-card p-6 md:col-span-1 hover-float animate-fade-in-delay float-card-1">
          <p className="text-sm text-gray-500 mb-1">Wellness score</p>
          <div className="flex items-end gap-3 mb-4">
            <span className="font-display font-extrabold text-5xl transition-all duration-500" style={{ color: scoreColor, textShadow: `0 2px 8px ${scoreColor}20` }}>{score}</span>
            <span className="text-gray-400 text-sm mb-1">/ 100</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5 mb-3 overflow-hidden">
            <div className="h-2.5 rounded-full transition-all duration-700 ease-out" style={{ width: `${score}%`, background: scoreColor, boxShadow: `0 0 8px ${scoreColor}` }}></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-teal-50 text-teal-700 text-xs font-bold px-2.5 py-0.5 rounded-full animate-pulse">Lv {level}</div>
            <span className="text-xs text-gray-400 font-medium">{xp} / {xpNext} XP</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div className="h-1.5 rounded-full bg-teal-500 transition-all duration-1000 ease-out" style={{ width: `${Math.min((xp/xpNext)*100,100)}%`, boxShadow: `0 0 6px ${themeHex}80` }}></div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="card tilt-card p-6 md:col-span-2 hover-float animate-fade-in-delay-2">
          <p className="text-sm font-bold text-gray-700 mb-4">Quick actions</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { href: '/chat',        label: 'Chat',    color: '#EBF2FF', tc: '#1A56DB', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> },
              { href: '/mood',        label: 'Mood',    color: '#FDE8E8', tc: '#E02424', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> },
              { href: '/journal',     label: 'Journal', color: '#E6FAF9', tc: '#0DA99E', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg> },
              { href: '/mindfulness', label: 'Breathe', color: '#DEF7EC', tc: '#0E9F6E', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M9.59 4.59A2 2 0 1113 6H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M11.37 17.59A2 2 0 1115 19H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M14.59 10.59A2 2 0 1118 12H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg> },
            ].map((q, idx) => (
              <Link key={q.href} href={q.href}
                className={`btn-confetti flex flex-col items-center gap-2 p-4 rounded-xl hover:scale-105 active:scale-95 hover:shadow-md transition-all duration-300 transform ${
                  idx === 0 ? 'float-card-1' : idx === 1 ? 'float-card-2' : idx === 2 ? 'float-card-3' : ''
                }`}
                style={{ background: q.color, animation: `popUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) ${idx * 0.05 + 0.2}s both` }}
              >
                <span className="text-2xl transition-transform hover:rotate-12 duration-200" style={{ color: q.tc }}>{q.icon}</span>
                <span className="text-xs font-extrabold" style={{ color: q.tc }}>{q.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Mood chart */}
      {chartData.length > 0 && (
        <div className="card tilt-card p-6 mb-6 hover-float animate-fade-in-delay-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-lg text-gray-900">Mood over time</h2>
            <Link href="/mood" className="text-sm text-teal-600 font-semibold hover:text-teal-700 flex items-center gap-1 transition-transform hover:translate-x-1 duration-200">
              View all <span>→</span>
            </Link>
          </div>
          <div className="transition-all duration-300">
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id={`moodGrad-${theme}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={themeHex} stopOpacity={0.25}/>
                    <stop offset="95%" stopColor={themeHex} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false}/>
                <YAxis domain={[1,5]} ticks={[1,2,3,4,5]} tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} width={20}/>
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #EFF1F6', fontSize: 12, boxShadow: '0 8px 16px rgba(0,0,0,0.03)' }} formatter={(v: any) => [MOOD_LABELS[v-1], 'Mood']}/>
                <Area type="monotone" dataKey="score" stroke={themeHex} strokeWidth={3} fill={`url(#moodGrad-${theme})`} dot={{ fill: themeHex, strokeWidth: 2, r: 5 }} activeDot={{ r: 7, strokeWidth: 0 }}/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Daily goals */}
      <div className="card tilt-card p-6 hover-float animate-fade-in-delay-3">
        <h2 className="font-display font-bold text-lg text-gray-900 mb-4">Today's goals</h2>
        <div className="space-y-3">
          {[
            { label: 'Mood check-in',  done: moodLogs.length > 0, href: '/mood' },
            { label: 'AI chat session', done: false, href: '/chat' },
            { label: 'Journal entry',  done: false, href: '/journal' },
            { label: 'Mindfulness',    done: false, href: '/mindfulness' },
          ].map((g, idx) => (
            <div key={g.label} 
              className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 px-2 rounded-lg transition-colors"
              style={{ animation: `fadeIn 0.3s ease ${idx * 0.05 + 0.4}s both` }}
            >
              {g.done ? (
                <div className="animate-pop-up">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" stroke="#0E9F6E" strokeWidth="2"/><polyline points="22 4 12 14.01 9 11.01" stroke="#0E9F6E" strokeWidth="2"/></svg>
                </div>
              ) : (
                <div className="w-[18px] h-[18px] rounded-full border-2 border-gray-200 transition-colors hover:border-teal-400"></div>
              )}
              <span className={`flex-1 text-sm transition-colors ${g.done ? 'line-through text-gray-400' : 'text-gray-700 font-medium'}`}>{g.label}</span>
              {!g.done && <Link href={g.href} className="text-xs text-teal-600 font-bold hover:text-teal-700 transition-colors">Start →</Link>}
              {g.done && <span className="bg-green-50 text-green-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-green-100">Done</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
