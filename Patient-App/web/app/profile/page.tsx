'use client';
import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/components/ThemeProvider';
import { useRouter } from 'next/navigation';
import { createConfetti } from '@/components/GlobalEffects';

import { AVATAR_SEEDS, getAvatarUrl } from '@/lib/avatars';
const BADGES = [
  { id:'first_chat',  label:'First Chat',       desc:'Had your first AI chat session',         xp:50,   colorClass: 'bg-indigo-50 border-indigo-100 text-indigo-600' },
  { id:'streak_3',    label:'3-Day Streak',      desc:'Checked in 3 days in a row',     xp:100,  colorClass: 'bg-amber-50 border-amber-100 text-amber-600' },
  { id:'streak_7',    label:'Week Warrior',      desc:'7-day check-in streak',          xp:250,  colorClass: 'bg-orange-50 border-orange-100 text-orange-600' },
  { id:'streak_30',   label:'Monthly Hero',      desc:'30-day streak',                  xp:1000, colorClass: 'bg-rose-50 border-rose-100 text-rose-600' },
  { id:'journal_10',  label:'Reflective Mind',   desc:'Wrote 10 journal entries',       xp:200,  colorClass: 'bg-purple-50 border-purple-100 text-purple-600' },
  { id:'mood_30',     label:'Mood Master',       desc:'Logged mood 30 times',           xp:300,  colorClass: 'bg-yellow-50 border-yellow-100 text-yellow-600' },
  { id:'breathe_5',   label:'Breathe Easy',      desc:'Completed 5 breathing sessions', xp:150,  colorClass: 'bg-teal-50 border-teal-100 text-teal-600' },
  { id:'crisis_survivor', label:'Brave Soul',    desc:'Reached out in a tough moment',  xp:500,  colorClass: 'bg-pink-50 border-pink-100 text-pink-600' },
  { id:'grounding_5', label:'Grounded Sage',    desc:'Completed 5 grounding exercises',xp:200,  colorClass: 'bg-emerald-50 border-emerald-100 text-emerald-600' },
  { id:'symptom_check', label:'Mind Detective',  desc:'Performed symptom analysis',     xp:150,  colorClass: 'bg-cyan-50 border-cyan-100 text-cyan-600' },
  { id:'early_bird',  label:'Sunrise Serenity',  desc:'Practiced wellness before 8 AM',  xp:150,  colorClass: 'bg-sky-50 border-sky-100 text-sky-600' },
  { id:'consult_connect', label:'Alliance Builder', desc:'Connected with a professional counselor', xp:300,  colorClass: 'bg-blue-50 border-blue-100 text-blue-600' },
  { id:'night_owl',   label:'Night Owl',         desc:'Wrote journal entry past midnight', xp:150,  colorClass: 'bg-violet-50 border-violet-100 text-violet-600' },
];

function getBadgeIcon(id: string) {
  switch (id) {
    case 'first_chat':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          <circle cx="8" cy="11.5" r="1.2" fill="currentColor" />
          <circle cx="13" cy="11.5" r="1.2" fill="currentColor" />
        </svg>
      );
    case 'streak_3':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.5 1-2.5 1-3.5.7 1.4 2 2 2.5 2.5z" />
        </svg>
      );
    case 'streak_7':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2c0 0-4 3.5-4 8 0 4.5 3 6.5 4 12 1-5.5 4-7.5 4-12 0-4.5-4-8-4-8z" />
          <path d="M12 12c0 0-1.5 1.5-1.5 3.5 0 2.5 1.5 4.5 1.5 6.5.5-2 1.5-4 1.5-6.5C13.5 13.5 12 12 12 12z" fill="currentColor" opacity="0.4" />
        </svg>
      );
    case 'streak_30':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z" />
          <path d="M3 20h18a1 1 0 0 0 1-1v-1a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1z" />
        </svg>
      );
    case 'journal_10':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          <path d="M12 6h4M12 10h4M12 14h4" />
        </svg>
      );
    case 'mood_30':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M8 14s1.5 2 4 2 4-2 4-2" />
          <circle cx="9" cy="9" r="1.2" fill="currentColor" />
          <circle cx="15" cy="9" r="1.2" fill="currentColor" />
        </svg>
      );
    case 'breathe_5':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9.59 4.59A2 2 0 1 1 13 6H2" />
          <path d="M11.37 17.59A2 2 0 1 1 15 19H2" />
          <path d="M14.59 10.59A2 2 0 1 1 18 12H2" />
        </svg>
      );
    case 'crisis_survivor':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="M12 8a2.5 2.5 0 0 0-4 3c0 2 4 5 4 5s4-3 4-5a2.5 2.5 0 0 0-4-3z" fill="currentColor" fillOpacity="0.4" />
        </svg>
      );
    case 'grounding_5':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v20M5 12h14" />
          <path d="M12 22a7 7 0 0 1-7-7c0-2 1.5-3.5 3-3.5s3 1.5 4 3c1-1.5 2.5-3 4-3s3 1.5 3 3.5a7 7 0 0 1-7 7z" />
          <circle cx="12" cy="5" r="3" />
        </svg>
      );
    case 'symptom_check':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
          <path d="M11 7v8M8 11h6" />
        </svg>
      );
    case 'early_bird':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v2M4.93 4.93l1.41 1.41M2 12h2M18 12h2M17.66 4.93l-1.41 1.41M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12z" />
          <path d="M2 22h20" />
        </svg>
      );
    case 'consult_connect':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case 'night_owl':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          <circle cx="12" cy="18" r="0.6" fill="currentColor" />
          <circle cx="16" cy="14" r="0.6" fill="currentColor" />
        </svg>
      );
    default:
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      );
  }
}

export default function ProfilePage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [profile, setProfile] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [avatarSeed, setAvatarSeed] = useState(AVATAR_SEEDS[0]);
  const [form, setForm]       = useState({ full_name:'', age:'', therapist_code:'', guardian_phone:'', phone:'' });
  const [saving, setSaving]   = useState(false);
  const [savingAvatar, setSavingAvatar] = useState(false);
  const [avatarSaved, setAvatarSaved] = useState(false);
  const [badgeFilter, setBadgeFilter] = useState<'all' | 'earned' | 'locked'>('all');

  const [activeCelebrationBadge, setActiveCelebrationBadge] = useState<{
    badge: any;
    isNew: boolean;
    leveledUp: boolean;
  } | null>(null);

  const achieveBadge = async (badge: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const hasBadge = profile?.badges?.includes(badge.id);
      
      const triggerConfettiExplosion = () => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        // Beautiful dynamic confetti explosions
        createConfetti(width / 2, height / 3, 35);
        setTimeout(() => createConfetti(width / 3, height / 2.2, 25), 200);
        setTimeout(() => createConfetti((width * 2) / 3, height / 2.2, 25), 400);
      };

      if (hasBadge) {
        // Re-play the celebration
        setActiveCelebrationBadge({ badge, isNew: false, leveledUp: false });
        triggerConfettiExplosion();
        return;
      }

      // Add badge to profile
      const currentBadges = profile?.badges || [];
      const updatedBadges = [...currentBadges, badge.id];
      
      const currentXp = profile?.xp || 0;
      const newXp = currentXp + badge.xp;
      
      const currentLevel = profile?.level || 1;
      const newLevel = Math.floor(newXp / 500) + 1;
      const leveledUp = newLevel > currentLevel;

      // Update Supabase profiles
      const { data: updatedProfile, error } = await supabase
        .from('profiles')
        .update({
          badges: updatedBadges,
          xp: newXp,
          level: newLevel
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      if (updatedProfile) {
        setProfile(updatedProfile);
      }

      // Show celebration modal
      setActiveCelebrationBadge({ badge, isNew: true, leveledUp });
      triggerConfettiExplosion();
    } catch (err) {
      console.error('Failed to achieve badge:', err);
    }
  };

  const saveAvatar = async () => {
    setSavingAvatar(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.auth.updateUser({
          data: { avatar_seed: avatarSeed }
        });
        await supabase.from('profiles').update({
          avatar_url: avatarSeed
        }).eq('user_id', user.id);
        setAvatarSaved(true);
        setTimeout(() => setAvatarSaved(false), 3000);
      }
    } catch (err) {
      console.error('Failed to save avatar seed', err);
    } finally {
      setSavingAvatar(false);
    }
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return;
      const authUser = data.user;
      const userPhone = authUser.phone || authUser.user_metadata?.phone || '';
      const userAvatarSeed = authUser.user_metadata?.avatar_seed || AVATAR_SEEDS[0];
      setAvatarSeed(userAvatarSeed);
      supabase.from('profiles').select('*').eq('user_id', authUser.id).single().then(({ data: p }) => {
        if (p) {
          setProfile(p);
          setForm({
            full_name: p.full_name||'',
            age: p.age?.toString()||'',
            therapist_code: p.therapist_code||'',
            guardian_phone: p.guardian_phone||'',
            phone: userPhone,
          });
        }
      });
    });
  }, []);

  const save = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    // Save personal phone number and avatar seed in Supabase Auth metadata
    await supabase.auth.updateUser({
      data: { phone: form.phone, avatar_seed: avatarSeed }
    });

    const { data } = await supabase.from('profiles').update({
      full_name: form.full_name,
      age: parseInt(form.age)||null,
      therapist_code: form.therapist_code||null,
      guardian_phone: form.guardian_phone||null,
      avatar_url: avatarSeed
    }).eq('user_id', user.id).select().single();

    if (data) setProfile(data);
    setSaving(false); setEditing(false);
  };

  const signOut = async () => { await supabase.auth.signOut(); router.push('/auth/login'); };

  const initials = profile?.full_name?.split(' ').map((n:string) => n[0]).slice(0,2).join('').toUpperCase() || 'U';
  const earned = BADGES.filter(b => profile?.badges?.includes(b.id));
  const locked = BADGES.filter(b => !profile?.badges?.includes(b.id));
  const filteredBadges = BADGES.filter(b => {
    const hasBadge = profile?.badges?.includes(b.id);
    if (badgeFilter === 'earned') return hasBadge;
    if (badgeFilter === 'locked') return !hasBadge;
    return true;
  });

  return (
    <div className="flex min-h-screen bg-gradient-mesh">
      <Sidebar />
      <div className="flex-1 md:ml-60 ml-0 min-h-screen pt-16 md:pt-0">
        <div className="p-8 max-w-5xl mx-auto w-full animate-fade-in">
        <h1 className="font-display font-extrabold text-3xl mb-8 flex items-center gap-2">
          <span className="gradient-text">Profile</span>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-teal-500">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
          </svg>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left col */}
          <div className="space-y-5">
            <div className="card tilt-card p-6 text-center">
              <div className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-white shadow-md overflow-hidden bg-teal-50">
                <img src={getAvatarUrl(avatarSeed)} alt="Avatar" className="w-full h-full object-cover" />
              </div>
              <div className="flex justify-center gap-2 mb-4 flex-wrap px-4">
                {AVATAR_SEEDS.map(seed => (
                  <button key={seed} onClick={() => setAvatarSeed(seed)} className={`w-8 h-8 rounded-full border-2 transition-all overflow-hidden bg-gray-50 ${avatarSeed === seed ? 'border-teal-500 scale-110 shadow-sm' : 'border-transparent hover:border-gray-300'}`}>
                    <img src={getAvatarUrl(seed)} alt={seed} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
              <button 
                onClick={saveAvatar} 
                disabled={savingAvatar}
                className={`w-full max-w-[165px] mx-auto mb-5 py-2 px-4 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95 ${
                  avatarSaved 
                    ? 'bg-emerald-500 text-white shadow-emerald-500/20' 
                    : 'bg-teal-500 hover:bg-teal-600 text-white hover:shadow-md shadow-teal-500/10'
                }`}
              >
                {savingAvatar ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : avatarSaved ? (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    Saved!
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                    Save Avatar
                  </>
                )}
              </button>
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
            <div className="card tilt-card p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-display font-bold text-lg text-gray-900">Personal info</h3>
                <button onClick={() => editing ? save() : setEditing(true)} className="text-sm text-teal-600 font-semibold hover:text-teal-700">
                  {editing ? 'Save changes' : 'Edit profile'}
                </button>
              </div>
              <div className="space-y-4">
                {[
                  { key:'full_name',      label:'Name',             placeholder:'Your full name' },
                  { key:'age',            label:'Age',              placeholder:'Your age', type:'number' },
                  { key:'phone',          label:'Phone number',     placeholder:'+91 XXXXX XXXXX' },
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

            <div className="card tilt-card p-6">
              <h3 className="font-display font-bold text-lg text-gray-900 mb-2">Settings</h3>
              <p className="text-sm text-gray-500 mb-6">Manage your profile and preferences</p>
              
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-5 h-5 rounded-full border-2 border-teal-500 flex items-center justify-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-teal-500"></div>
                  </div>
                  <h4 className="font-display font-bold text-gray-900">Color theme palette</h4>
                </div>
                <p className="text-xs text-gray-500 mb-4 ml-7">Customize the application workspace color theme dynamically.</p>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 ml-7">
                  {[
                    { id: 'theme-purple', label: 'Purple Theme', color: '#7C6FCD' },
                    { id: 'theme-blue', label: 'Blue Theme', color: '#2563EB' },
                    { id: 'theme-rose', label: 'Rose Theme', color: '#E11D48' },
                    { id: 'theme-green', label: 'Green Theme', color: '#0DA99E' }
                  ].map(t => (
                    <button key={t.id} onClick={() => setTheme(t.id as any)}
                      className={`relative text-left p-4 rounded-xl border-2 transition-all hover:shadow-md ${theme === t.id ? 'border-teal-500 bg-teal-50/30' : 'border-gray-100 bg-white hover:border-gray-200'}`}
                    >
                      <div className="text-sm font-bold text-gray-900 mb-6">{t.label}</div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: t.color }}></div>
                        {theme === t.id && <span className="text-[10px] font-bold text-teal-600 tracking-wider uppercase">Active</span>}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="card tilt-card p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <h3 className="font-display font-bold text-lg text-gray-900">Trophy Case</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Collect milestones and earn bonus XP! Click a badge to celebrate or achieve it.</p>
                </div>
                {/* Tabs filter */}
                <div className="flex bg-gray-50 border border-gray-100/80 rounded-xl p-1 self-start sm:self-center">
                  {[
                    { id: 'all', label: 'All' },
                    { id: 'earned', label: 'Unlocked' },
                    { id: 'locked', label: 'Locked' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setBadgeFilter(tab.id as any)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        badgeFilter === tab.id
                          ? 'bg-white text-teal-600 shadow-sm border border-gray-100'
                          : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      {tab.label} {tab.id === 'all' ? `(${BADGES.length})` : tab.id === 'earned' ? `(${earned.length})` : `(${locked.length})`}
                    </button>
                  ))}
                </div>
              </div>

              {filteredBadges.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredBadges.map(b => {
                    const hasBadge = profile?.badges?.includes(b.id);
                    return (
                      <div
                        key={b.id}
                        onClick={() => achieveBadge(b)}
                        className={`flex gap-4 p-4 rounded-2xl border transition-all duration-300 transform relative cursor-pointer select-none active:scale-[0.98] ${
                          hasBadge
                            ? 'bg-white border-gray-100 hover:shadow-md hover:scale-[1.02] hover:border-[var(--theme-100)] shadow-sm'
                            : 'bg-gray-50/50 border-gray-100 opacity-60 hover:opacity-90 hover:scale-[1.01] border-dashed hover:border-gray-300'
                        }`}
                      >
                        {/* Icon Box */}
                        <div
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 hover:rotate-12 ${
                            hasBadge
                              ? 'bg-[var(--theme-50)] text-[var(--theme-primary)] border border-[var(--theme-100)]'
                              : 'bg-gray-100 text-gray-400 border border-gray-200'
                          }`}
                        >
                          {getBadgeIcon(b.id)}
                        </div>

                        {/* Text details */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <div className={`text-sm font-extrabold truncate ${hasBadge ? 'text-gray-900' : 'text-gray-500'}`}>
                              {b.label}
                            </div>
                            <div className="text-xs text-gray-400 line-clamp-2 mt-0.5 leading-snug">
                              {b.desc}
                            </div>
                          </div>

                          <div className="flex items-center justify-between mt-3 gap-2">
                            {hasBadge ? (
                              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold py-0.5 px-2 rounded-full border border-emerald-100 shadow-xs">
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                Unlocked
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-500 text-[10px] font-bold py-0.5 px-2 rounded-full border border-gray-200">
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                                Locked
                              </span>
                            )}
                            <span className={`text-[10px] font-black tracking-wide px-2 py-0.5 rounded-full border ${hasBadge ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-gray-50 text-gray-400 border-gray-200'}`}>
                              +{b.xp} XP
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-10 border-2 border-dashed border-gray-100 rounded-2xl">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-gray-300 mb-2">
                    <circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/>
                  </svg>
                  <p className="text-xs text-gray-400 font-bold">No badges found under this filter.</p>
                </div>
              )}
            </div>
          </div>
        </div>
        </div>
      </div>

      {/* Celebration Modal Overlay */}
      {activeCelebrationBadge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-all duration-500 animate-fade-in">
          <div className="relative max-w-md w-full rounded-3xl p-8 text-center shadow-2xl border border-gray-100 bg-white/95 backdrop-blur-lg transform scale-100 animate-pop-up overflow-hidden">
            {/* Glowing theme-colored background spots */}
            <div className="absolute inset-0 bg-gradient-to-b from-[var(--theme-50)]/40 to-white/95 pointer-events-none" />
            <div className="absolute -top-12 -left-12 w-40 h-40 bg-[var(--theme-primary)]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={() => setActiveCelebrationBadge(null)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            {/* Celebration Badge Icon */}
            <div className="relative w-32 h-32 mx-auto mb-6 flex items-center justify-center rounded-3xl bg-[var(--theme-50)] border border-[var(--theme-100)] text-[var(--theme-primary)] shadow-xl shadow-[var(--theme-primary)]/10 rotate-3 transition-transform hover:rotate-12 duration-500">
              <div className="absolute inset-0 rounded-3xl bg-[var(--theme-primary)]/5 animate-pulse" />
              <div className="scale-[1.8] flex items-center justify-center">
                {getBadgeIcon(activeCelebrationBadge.badge.id)}
              </div>
            </div>

            {/* Level Up Banner */}
            {activeCelebrationBadge.leveledUp && (
              <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-500 text-white font-extrabold text-xs tracking-wider uppercase shadow-md shadow-amber-500/20 mb-4 animate-bounce">
                ⭐ LEVEL UP! ⭐
              </div>
            )}

            {/* Title & Celebration Label */}
            <h4 className="text-2xl font-black text-gray-900 mb-1 font-display">
              {activeCelebrationBadge.isNew ? 'Achievement Unlocked!' : 'Achievement Earned!'}
            </h4>
            <div className="text-xl font-extrabold text-[var(--theme-primary)] mb-2 font-display">
              {activeCelebrationBadge.badge.label}
            </div>
            
            {/* Description */}
            <p className="text-sm text-gray-500 max-w-xs mx-auto mb-6 leading-relaxed">
              {activeCelebrationBadge.badge.desc}
            </p>

            {/* Reward */}
            <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-2xl px-5 py-2.5 mb-8 shadow-xs">
              <span className="text-xl">🏆</span>
              <span className="text-sm font-black text-amber-700">+{activeCelebrationBadge.badge.xp} XP Granted</span>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={() => setActiveCelebrationBadge(null)}
                className="w-full py-3.5 px-6 rounded-2xl bg-[var(--theme-primary)] hover:bg-[var(--theme-600)] text-white font-bold text-sm shadow-lg shadow-[var(--theme-primary)]/20 hover:shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                Awesome!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
