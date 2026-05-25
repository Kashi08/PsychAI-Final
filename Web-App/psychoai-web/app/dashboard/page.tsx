'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import Link from 'next/link';

const MOOD_COLORS = ['#E02424','#F97316','#FBBF24','#3BD671','#0E9F6E'];
const MOOD_LABELS = ['Struggling','Low','Okay','Good','Great'];

export default function DashboardPage() {
  const [profile, setProfile]   = useState<any>(null);
  const [moodLogs, setMoodLogs] = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const [{ data: prof }, { data: moods }] = await Promise.all([
        supabase.from('profiles').select('*').eq('user_id', user.id).single(),
        supabase.from('mood_logs').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(30),
      ]);
      setProfile(prof);
      setMoodLogs(moods || []);
      setLoading(false);
    })();
  }, []);

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
    <div className="p-8 max-w-5xl animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-gray-500 text-sm">{greet},</p>
          <h1 className="font-display font-extrabold text-3xl text-gray-900">{name}</h1>
        </div>
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-full px-4 py-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 01-14 0C5 14 6 13 6 12c.7 1.4 2 2 2.5 2.5z" stroke="#EF4444" strokeWidth="1.8" fill="#EF4444" fillOpacity="0.2"/></svg>
          <span className="font-extrabold text-red-500 text-base">{streak}</span>
          <span className="text-amber-700 text-xs font-medium">day streak</span>
        </div>
      </div>

      {/* Top cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        {/* Wellness score */}
        <div className="card p-6 md:col-span-1">
          <p className="text-sm text-gray-500 mb-1">Wellness score</p>
          <div className="flex items-end gap-3 mb-4">
            <span className="font-display font-extrabold text-5xl" style={{ color: scoreColor }}>{score}</span>
            <span className="text-gray-400 text-sm mb-1">/ 100</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2 mb-3">
            <div className="h-2 rounded-full transition-all duration-700" style={{ width: `${score}%`, background: scoreColor }}></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-blue-50 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">Lv {level}</div>
            <span className="text-xs text-gray-400">{xp} / {xpNext} XP</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1 mt-1.5">
            <div className="h-1 rounded-full bg-blue-500" style={{ width: `${Math.min((xp/xpNext)*100,100)}%` }}></div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="card p-6 md:col-span-2">
          <p className="text-sm font-semibold text-gray-700 mb-4">Quick actions</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { href: '/chat',        label: 'Chat',    color: '#EBF2FF', tc: '#1A56DB', icon: '💬' },
              { href: '/mood',        label: 'Mood',    color: '#FDE8E8', tc: '#E02424', icon: '❤️' },
              { href: '/journal',     label: 'Journal', color: '#E6FAF9', tc: '#0DA99E', icon: '📓' },
              { href: '/mindfulness', label: 'Breathe', color: '#DEF7EC', tc: '#0E9F6E', icon: '🌬️' },
            ].map(q => (
              <Link key={q.href} href={q.href}
                className="flex flex-col items-center gap-2 p-4 rounded-xl hover:scale-105 transition-transform"
                style={{ background: q.color }}
              >
                <span className="text-2xl">{q.icon}</span>
                <span className="text-xs font-bold" style={{ color: q.tc }}>{q.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Mood chart */}
      {chartData.length > 0 && (
        <div className="card p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-lg text-gray-900">Mood over time</h2>
            <Link href="/mood" className="text-sm text-teal-600 font-medium hover:text-teal-700">View all →</Link>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#0DA99E" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#0DA99E" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false}/>
              <YAxis domain={[1,5]} ticks={[1,2,3,4,5]} tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} width={20}/>
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #F3F4F6', fontSize: 12 }} formatter={(v: any) => [MOOD_LABELS[v-1], 'Mood']}/>
              <Area type="monotone" dataKey="score" stroke="#0DA99E" strokeWidth={2.5} fill="url(#moodGrad)" dot={{ fill: '#0DA99E', r: 4 }}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Daily goals */}
      <div className="card p-6">
        <h2 className="font-display font-bold text-lg text-gray-900 mb-4">Today's goals</h2>
        <div className="space-y-3">
          {[
            { label: 'Mood check-in',  done: moodLogs.length > 0, href: '/mood' },
            { label: 'AI chat session', done: false, href: '/chat' },
            { label: 'Journal entry',  done: false, href: '/journal' },
            { label: 'Mindfulness',    done: false, href: '/mindfulness' },
          ].map(g => (
            <div key={g.label} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
              {g.done ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" stroke="#0E9F6E" strokeWidth="2"/><polyline points="22 4 12 14.01 9 11.01" stroke="#0E9F6E" strokeWidth="2"/></svg>
              ) : (
                <div className="w-[18px] h-[18px] rounded-full border-2 border-gray-200"></div>
              )}
              <span className={`flex-1 text-sm ${g.done ? 'line-through text-gray-400' : 'text-gray-700'}`}>{g.label}</span>
              {!g.done && <Link href={g.href} className="text-xs text-teal-600 font-medium hover:text-teal-700">Start →</Link>}
              {g.done && <span className="bg-green-50 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">Done</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
