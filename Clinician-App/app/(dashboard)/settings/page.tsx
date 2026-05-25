'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { AVATAR_SEEDS, getAvatarUrl } from '@/lib/avatars';

const THEMES: Record<string, any> = {
  purple: { name: 'Amethyst Purple', base: '#7C6FCD', colors: {
    '--psych-50': '#F0EDFB',
    '--psych-100': '#D8D0F5',
    '--psych-200': '#C2B5EF',
    '--psych-300': '#AA99E8',
    '--psych-400': '#937EE1',
    '--psych-500': '#7C6FCD',
    '--psych-600': '#5E51B5',
    '--psych-700': '#4A3E9E',
  }},
  blue: { name: 'Ocean Blue', base: '#2563EB', colors: {
    '--psych-50': '#EBF5FF',
    '--psych-100': '#C3E0FF',
    '--psych-200': '#93C5FD',
    '--psych-300': '#60A5FA',
    '--psych-400': '#3B82F6',
    '--psych-500': '#2563EB',
    '--psych-600': '#1D4ED8',
    '--psych-700': '#1E40AF',
  }},
  rose: { name: 'Blossom Rose', base: '#F43F5E', colors: {
    '--psych-50': '#FFF1F2',
    '--psych-100': '#FFE4E6',
    '--psych-200': '#FECDD3',
    '--psych-300': '#FDA4AF',
    '--psych-400': '#FB7185',
    '--psych-500': '#F43F5E',
    '--psych-600': '#E11D48',
    '--psych-700': '#BE123C',
  }},
  green: { name: 'Emerald Green', base: '#10B981', colors: {
    '--psych-50': '#ECFDF5',
    '--psych-100': '#D1FAE5',
    '--psych-200': '#A7F3D0',
    '--psych-300': '#6EE7B7',
    '--psych-400': '#34D399',
    '--psych-500': '#10B981',
    '--psych-600': '#059669',
    '--psych-700': '#047857',
  }}
};

export default function SettingsPage() {
  const [form, setForm] = useState({
    full_name: 'Dr. Namrata Sharma',
    clinic: 'SRM University Mental Health Centre',
    license: 'MH-DL-2021-0042',
    email: 'psych@psychai.app',
    access_code: 'DR-DEMO-2024',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);
  const [savingAvatar, setSavingAvatar] = useState(false);
  const [avatarSaved, setAvatarSaved] = useState(false);
  const [notif, setNotif]   = useState({ crisis:true, session:true, message:true, weekly:false });
  const [selectedTheme, setSelectedTheme] = useState('purple');
  const [avatarSeed, setAvatarSeed] = useState('Doctor');

  useEffect(() => {
    const t = localStorage.getItem('psychai-theme') || 'purple';
    setSelectedTheme(t);
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.user_metadata?.avatar_seed) {
        setAvatarSeed(data.user.user_metadata.avatar_seed);
      }
    });
  }, []);

  const changeTheme = (name: string) => {
    localStorage.setItem('psychai-theme', name);
    setSelectedTheme(name);
    const themeColors = THEMES[name]?.colors;
    if (themeColors) {
      Object.entries(themeColors).forEach(([key, val]) => {
        document.documentElement.style.setProperty(key, val as string);
      });
    }
  };

  const save = async () => {
    setSaving(true);
    await supabase.auth.updateUser({
      data: { avatar_seed: avatarSeed }
    });
    // Add realistic delay for other fake settings
    await new Promise(r => setTimeout(r, 500));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const saveAvatar = async () => {
    setSavingAvatar(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.auth.updateUser({
          data: { avatar_seed: avatarSeed }
        });
        setAvatarSaved(true);
        setTimeout(() => setAvatarSaved(false), 3000);
      }
    } catch (err) {
      console.error('Failed to save avatar seed', err);
    } finally {
      setSavingAvatar(false);
    }
  };

  return (
    <div className="p-7 max-w-3xl mx-auto animate-fade">
      <div className="mb-7">
        <h1 className="font-display font-extrabold text-3xl text-gray-900"><span className="gradient-text">Settings</span></h1>
        <p className="text-gray-500 text-sm mt-1">Manage your profile and preferences</p>
      </div>

      {saved && (
        <div className="bg-green-50/70 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-2xl mb-5 flex items-center gap-2 animate-spring">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          Settings saved successfully
        </div>
      )}

      {/* Profile */}
      <div className="card p-6 mb-5">
        <h2 className="font-display font-bold text-gray-900 mb-5 flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--psych-500)" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          Profile information
        </h2>

        {/* Avatar Selection */}
        <div className="flex flex-col md:flex-row gap-6 mb-6 items-start">
          <div className="w-24 h-24 rounded-full border-4 border-white shadow-md overflow-hidden bg-psych-50 shrink-0 mx-auto md:mx-0 relative">
            <img src={getAvatarUrl(avatarSeed)} alt="Doctor Avatar" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 w-full">
            <div className="font-display font-black text-gray-900 leading-none text-xl mb-1">{form.full_name}</div>
            <div className="text-xs text-psych-500 font-bold mb-4">Licensed Clinical Psychologist • {form.clinic}</div>
            
            <p className="text-xs text-gray-400 font-semibold mb-3">Choose your professional avatar:</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {AVATAR_SEEDS.map(seed => (
                <button key={seed} onClick={() => setAvatarSeed(seed)} className={`w-10 h-10 rounded-full border-2 transition-all overflow-hidden bg-gray-50 ${avatarSeed === seed ? 'border-psych-500 scale-110 shadow-sm' : 'border-transparent hover:border-gray-300'}`}>
                  <img src={getAvatarUrl(seed)} alt={seed} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={saveAvatar} 
                disabled={savingAvatar}
                className="bg-gray-900 hover:bg-gray-800 text-white font-bold py-2.5 px-5 rounded-xl transition-all shadow-md text-sm disabled:opacity-50"
              >
                {savingAvatar ? 'Saving...' : 'Save Avatar'}
              </button>
              {avatarSaved && <span className="text-sm font-bold text-green-600 animate-fade-in flex items-center gap-1"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg> Saved!</span>}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {[
            { key:'full_name', label:'Full name', placeholder:'Dr. First Last' },
            { key:'clinic',    label:'Clinic / institution', placeholder:'Hospital or clinic name' },
            { key:'license',   label:'License number', placeholder:'MH-XX-XXXX-XXXX' },
            { key:'email',     label:'Email address', placeholder:'your@email.com', type:'email' },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">{f.label}</label>
              <input
                type={f.type || 'text'}
                value={form[f.key as keyof typeof form]}
                onChange={e => setForm({...form, [f.key]: e.target.value})}
                placeholder={f.placeholder}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-psych-500 focus:ring-4 focus:ring-psych-500/10 bg-gray-50 focus:bg-white transition-all text-gray-900 font-medium"
              />
            </div>
          ))}
        </div>
        
        <div className="mt-6 flex justify-end">
          <button onClick={save} disabled={saving}
            className="bg-psych-500 hover:bg-psych-600 disabled:opacity-50 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md shadow-psych-500/10 hover:scale-[1.02] active:scale-[0.98] text-sm">
            {saving ? 'Saving Profile...' : 'Save Profile'}
          </button>
        </div>
      </div>

      {/* Theme selection */}
      <div className="card p-6 mb-5">
        <h2 className="font-display font-bold text-gray-900 mb-2 flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--psych-500)" strokeWidth="2"><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"/><path d="M12 18C15.3137 18 18 15.3137 18 12C18 8.68629 15.3137 6 12 6C8.68629 6 6 8.68629 6 12C6 15.3137 8.68629 18 12 18Z"/></svg>
          Color theme palette
        </h2>
        <p className="text-xs text-gray-400 mb-4 font-semibold">Customize the application workspace color theme dynamically.</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.entries(THEMES).map(([key, value]) => (
            <button key={key} onClick={() => changeTheme(key)}
              className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between h-20 transition-all duration-200 ${selectedTheme===key?'border-psych-500 bg-psych-50/20 shadow-sm scale-102':'border-gray-200 hover:border-psych-200 hover:bg-gray-50/40'}`}>
              <span className="text-xs font-bold text-gray-800 capitalize leading-none">{key} theme</span>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="w-5.5 h-5.5 rounded-full border border-black/5" style={{ backgroundColor: value.base }}></span>
                {selectedTheme === key && <span className="text-[10px] font-extrabold text-psych-700 uppercase tracking-wider">Active</span>}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Access code */}
      <div className="card p-6 mb-5">
        <h2 className="font-display font-bold text-gray-900 mb-2 flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--psych-500)" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          Patient access code
        </h2>
        <p className="text-xs text-gray-400 mb-4 font-semibold">Share this code with your patients so they can link to your account in the PsychAI patient app.</p>
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-psych-50 border-2 border-psych-200/50 rounded-2xl px-4 py-3.5 font-mono font-black text-psych-700 text-lg tracking-widest text-center shadow-inner">
            {form.access_code}
          </div>
          <button onClick={() => {
              navigator.clipboard.writeText(form.access_code).catch(err => {
                // Fallback for older browsers
                const textArea = document.createElement("textarea");
                textArea.value = form.access_code;
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                try { document.execCommand('copy'); } catch (err) { console.error('Fallback: Oops, unable to copy', err); }
                document.body.removeChild(textArea);
              });
              const btn = document.getElementById('copy-btn');
              if (btn) {
                const originalText = btn.innerText;
                btn.innerText = 'Copied!';
                setTimeout(() => btn.innerText = originalText, 2000);
              }
            }}
            id="copy-btn"
            className="border border-psych-200 text-psych-700 hover:bg-psych-50 font-bold text-sm px-5 py-3.5 rounded-2xl transition-all hover:scale-102 shadow-sm min-w-[80px]">
            Copy
          </button>
        </div>
        <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-wide">Patients enter this code in Settings → Therapist code in the patient app.</p>
      </div>

      {/* Notifications */}
      <div className="card p-6 mb-5">
        <h2 className="font-display font-bold text-gray-900 mb-5 flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--psych-500)" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" strokeLinecap="round"/></svg>
          Notification preferences
        </h2>
        <div className="space-y-4">
          {[
            { key:'crisis',  label:'Crisis alerts',       desc:'Immediate alert when a patient triggers crisis keywords' },
            { key:'session', label:'Session reminders',   desc:'30-minute reminder before each scheduled session' },
            { key:'message', label:'Patient messages',    desc:'Notify when a patient sends you a message' },
            { key:'weekly',  label:'Weekly digest',       desc:'Summary of all patient activity every Monday morning' },
          ].map(n => (
            <div key={n.key} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
              <div>
                <div className="text-sm font-bold text-gray-800">{n.label}</div>
                <div className="text-xs text-gray-400 mt-1 font-semibold">{n.desc}</div>
              </div>
              <button
                onClick={() => setNotif({...notif, [n.key]: !notif[n.key as keyof typeof notif]})}
                className={`relative w-11 h-6 rounded-full transition-all duration-300 ${notif[n.key as keyof typeof notif]?'bg-psych-500 shadow-md shadow-psych-500/10':'bg-gray-200'}`}
              >
                <div 
                  style={{ transition: 'transform 0.35s cubic-bezier(0.68, -0.6, 0.32, 1.6)' }}
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${notif[n.key as keyof typeof notif]?'translate-x-6':'translate-x-1'}`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
