'use client';
import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

const COLORS = ['#0DA99E','#1A56DB','#7C6FCD','#0E9F6E','#F97316','#E02424','#EC4899','#F59E0B'];
const BADGES = [
  { id:'first_chat',  label:'First Chat',       desc:'Had your first AI chat',         xp:50  },
  { id:'streak_3',    label:'3-Day Streak',      desc:'Checked in 3 days in a row',     xp:100 },
  { id:'streak_7',    label:'Week Warrior',      desc:'7-day check-in streak',          xp:250 },
  { id:'streak_30',   label:'Monthly Hero',      desc:'30-day streak',                  xp:1000},
  { id:'journal_10',  label:'Reflective Mind',   desc:'Wrote 10 journal entries',       xp:200 },
  { id:'mood_30',     label:'Mood Master',       desc:'Logged mood 30 times',           xp:300 },
  { id:'breathe_5',   label:'Breathe Easy',      desc:'Completed 5 breathing sessions', xp:150 },
  { id:'crisis_survivor', label:'Brave Soul',    desc:'Reached out in a tough moment',  xp:500 },
];

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [color, setColor]     = useState(COLORS[0]);
  const [form, setForm]       = useState({ full_name:'', age:'', therapist_code:'', guardian_phone:'' });
  const [saving, setSaving]   = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return;
      supabase.from('profiles').select('*').eq('user_id', data.user.id).single().then(({ data: p }) => {
        if (p) { setProfile(p); setForm({ full_name: p.full_name||'', age: p.age?.toString()||'', therapist_code: p.therapist_code||'', guardian_phone: p.guardian_phone||'' }); }
      });
    });
  }, []);

  const save = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from('profiles').update({ full_name: form.full_name, age: parseInt(form.age)||null, therapist_code: form.therapist_code||null, guardian_phone: form.guardian_phone||null }).eq('user_id', user.id).select().single();
    if (data) setProfile(data);
    setSaving(false); setEditing(false);
  };

  const signOut = async () => { await supabase.auth.signOut(); router.push('/auth/login'); };

  const initials = profile?.full_name?.split(' ').map((n:string) => n[0]).slice(0,2).join('').toUpperCase() || 'U';
  const earned = BADGES.filter(b => profile?.badges?.includes(b.id));
  const locked = BADGES.filter(b => !profile?.badges?.includes(b.id));

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-60 p-8 max-w-4xl animate-fade-in">
        <h1 className="font-display font-extrabold text-3xl text-gray-900 mb-8">Profile</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left col */}
          <div className="space-y-5">
            <div className="card p-6 text-center">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-3 text-white font-extrabold text-2xl" style={{ background: color }}>{initials}</div>
              <div className="flex justify-center gap-2 mb-4 flex-wrap">
                {COLORS.map(c => (
                  <button key={c} onClick={() => setColor(c)} className="w-6 h-6 rounded-full border-2 transition-all" style={{ background: c, borderColor: color===c ? '#111' : 'transparent' }}/>
                ))}
              </div>
              <h2 className="font-display font-extrabold text-xl text-gray-900">{profile?.full_name || 'Your Name'}</h2>
              <p className="text-sm text-gray-500 mt-0.5">Level {profile?.level ?? 1} · {profile?.xp ?? 0} XP</p>
              <div className="flex justify-center gap-4 mt-4">
                {[{v:profile?.streak??0,l:'Streak'},{v:(profile?.wellness_score??50)+'%',l:'Wellness'},{v:earned.length,l:'Badges'}].map(s => (
                  <div key={s.l} className="text-center">
                    <div className="font-extrabold text-lg text-gray-900">{s.v}</div>
                    <div className="text-xs text-gray-400">{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
            <button onClick={signOut} className="w-full card p-4 text-red-500 hover:bg-red-50 font-medium text-sm transition-colors border border-red-100">Sign out</button>
          </div>

          {/* Right col */}
          <div className="lg:col-span-2 space-y-5">
            <div className="card p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-display font-bold text-lg text-gray-900">Personal info</h3>
                <button onClick={() => editing ? save() : setEditing(true)} className="text-sm text-teal-600 font-semibold hover:text-teal-700">
                  {saving ? 'Saving...' : editing ? 'Save' : 'Edit'}
                </button>
              </div>
              <div className="space-y-4">
                {[
                  { key:'full_name',      label:'Name',             placeholder:'Your full name' },
                  { key:'age',            label:'Age',              placeholder:'Your age', type:'number' },
                  { key:'therapist_code', label:'Therapist code',   placeholder:'e.g. DR-SHARMA-2024' },
                  { key:'guardian_phone', label:'Emergency contact', placeholder:'+91 XXXXX XXXXX' },
                ].map(f => (
                  <div key={f.key} className="flex items-center gap-4 py-2 border-b border-gray-50 last:border-0">
                    <span className="w-36 text-sm text-gray-500 flex-shrink-0">{f.label}</span>
                    {editing ? (
                      <input type={f.type||'text'} value={form[f.key as keyof typeof form]} placeholder={f.placeholder}
                        onChange={e => setForm({...form,[f.key]:e.target.value})}
                        className="flex-1 text-sm text-gray-900 border-b border-teal-400 focus:outline-none pb-0.5 bg-transparent"
                      />
                    ) : (
                      <span className="flex-1 text-sm font-medium text-gray-900">{form[f.key as keyof typeof form] || '—'}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-6">
              <h3 className="font-display font-bold text-lg text-gray-900 mb-5">Badges</h3>
              {earned.length > 0 && (
                <div className="space-y-3 mb-5">
                  {earned.map(b => (
                    <div key={b.id} className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="#F59E0B" strokeWidth="1.8" fill="#FEF3C7"/></svg>
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-bold text-gray-900">{b.label}</div>
                        <div className="text-xs text-gray-400">{b.desc}</div>
                      </div>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" stroke="#0E9F6E" strokeWidth="2"/><polyline points="22 4 12 14.01 9 11.01" stroke="#0E9F6E" strokeWidth="2"/></svg>
                    </div>
                  ))}
                </div>
              )}
              {locked.length > 0 && (
                <>
                  <p className="text-xs text-gray-400 font-medium mb-3 uppercase tracking-wide">Locked</p>
                  <div className="space-y-3 opacity-50">
                    {locked.slice(0,3).map(b => (
                      <div key={b.id} className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="#9CA3AF" strokeWidth="1.8"/></svg>
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-bold text-gray-500">{b.label}</div>
                          <div className="text-xs text-gray-400">{b.desc}</div>
                        </div>
                        <span className="text-xs bg-blue-50 text-blue-600 font-bold px-2 py-0.5 rounded-full">+{b.xp} XP</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
