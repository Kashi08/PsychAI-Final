'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Sidebar from '@/components/Sidebar';
import { format } from 'date-fns';

const CBT = [
  { id:'event',   label:'What happened?',          hint:'Describe the situation.' },
  { id:'thought', label:'What were you thinking?', hint:'What thoughts went through your mind?' },
  { id:'feeling', label:'How did it make you feel?',hint:'Name emotions + rate intensity 1-10.' },
  { id:'reframe', label:'Balanced perspective',    hint:'What would a supportive friend say?' },
  { id:'positive',label:'One small positive thing',hint:'Even tiny — what went well today?' },
];
const FREE_PROMPTS = [
  "What's been on your mind today?",
  "Describe your mood in three words — then explain each one.",
  "What drained your energy this week? What gave you energy?",
  "Write a letter to your past self from 3 months ago.",
  "What would you do today if you weren't afraid?",
];

export default function JournalPage() {
  const [mode, setMode]         = useState<'choose'|'cbt'|'free'|'done'>('choose');
  const [cbtAns, setCbtAns]     = useState<Record<string,string>>({});
  const [freeText, setFreeText] = useState('');
  const [prompt, setPrompt]     = useState(FREE_PROMPTS[0]);
  const [entries, setEntries]   = useState<any[]>([]);
  const [loading, setLoading]   = useState(false);
  const [userId, setUserId]     = useState('');
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; char: string }[]>([]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return;
      setUserId(data.user.id);
      supabase.from('journal_entries').select('*').eq('user_id', data.user.id).order('created_at', { ascending: false }).limit(10).then(({ data: d }) => setEntries(d || []));
    });
  }, []);

  const triggerJournalConfetti = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const emojis = ['✍️', '✨', '📖', '🎉', '🌱', '🌟', '📝', '🧠', '💖', '🍀'];
    const newParticles = Array.from({ length: 12 }).map((_, i) => ({
      id: Date.now() + i + Math.random(),
      x: e.clientX - rect.left + (Math.random() * 80 - 40),
      y: e.clientY - rect.top + (Math.random() * 20 - 10),
      char: emojis[Math.floor(Math.random() * emojis.length)],
    }));
    setParticles(prev => [...prev, ...newParticles]);
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)));
    }, 1200);
  };

  const saveCBT = async (e: React.MouseEvent<HTMLButtonElement>) => {
    triggerJournalConfetti(e);
    setLoading(true);
    const content = CBT.map(p => cbtAns[p.id] ? `**${p.label}**\n${cbtAns[p.id]}` : '').filter(Boolean).join('\n\n');
    const { data } = await supabase.from('journal_entries').insert({ user_id: userId, prompt: 'CBT Thought Record', content }).select().single();
    if (data) setEntries(prev => [data, ...prev]);
    setTimeout(() => {
      setLoading(false); setMode('done');
    }, 800);
  };

  const saveFree = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!freeText.trim()) return;
    triggerJournalConfetti(e);
    setLoading(true);
    const { data } = await supabase.from('journal_entries').insert({ user_id: userId, prompt, content: freeText }).select().single();
    if (data) setEntries(prev => [data, ...prev]);
    setTimeout(() => {
      setLoading(false); setMode('done');
    }, 800);
  };

  return (
    <div className="flex min-h-screen bg-gradient-mesh">
      <Sidebar />
      <div className="flex-1 md:ml-60 ml-0 min-h-screen pt-16 md:pt-0">
        <div className="p-8 max-w-5xl mx-auto w-full animate-fade-in">
        <h1 className="font-display font-extrabold text-3xl mb-1 flex items-center gap-2">
          <span className="gradient-text">Journal</span>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-teal-500">
            <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </h1>
        <p className="text-gray-500 text-sm mb-8">Writing is thinking. Express yourself freely.</p>

        {mode === 'done' && (
          <div className="card p-10 text-center animate-fade-in">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" stroke="#0E9F6E" strokeWidth="2"/><polyline points="22 4 12 14.01 9 11.01" stroke="#0E9F6E" strokeWidth="2"/></svg>
            </div>
            <h2 className="font-display font-extrabold text-2xl text-gray-900 mb-2">Entry saved</h2>
            <p className="text-gray-500 text-sm mb-6">+30 XP · Keep writing to unlock badges</p>
            <button onClick={() => setMode('choose')} className="bg-teal-500 hover:bg-teal-600 text-white font-bold px-8 py-3 rounded-xl transition-colors">Write another entry</button>
          </div>
        )}

        {mode === 'choose' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <button onClick={() => setMode('cbt')} className="btn-confetti w-full card tilt-card p-6 flex items-center gap-4 hover-float hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all text-left border-l-4 border-teal-500 float-card-1">
                <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke="#0DA99E" strokeWidth="1.8"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" stroke="#0DA99E" strokeWidth="1.8"/></svg>
                </div>
                <div>
                  <h3 className="font-display font-bold text-gray-900">CBT Thought Record</h3>
                  <p className="text-sm text-gray-500 mt-0.5">Guided prompts to reframe negative thoughts</p>
                </div>
              </button>
              <button onClick={() => { setMode('free'); setPrompt(FREE_PROMPTS[Math.floor(Math.random()*FREE_PROMPTS.length)]); }}
                className="btn-confetti w-full card tilt-card p-6 flex items-center gap-4 hover-float hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all text-left border-l-4 border-teal-500 float-card-2">
                <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-teal-600"><path d="M12 20h9" stroke="currentColor" strokeWidth="1.8"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" stroke="currentColor" strokeWidth="1.8"/></svg>
                </div>
                <div>
                  <h3 className="font-display font-bold text-gray-900">Free Write</h3>
                  <p className="text-sm text-gray-500 mt-0.5">Open canvas — write anything on your mind</p>
                </div>
              </button>
            </div>
            <div>
              <h2 className="font-display font-bold text-lg text-gray-900 mb-4">Past entries</h2>
              <div className="space-y-3">
                {entries.slice(0,5).map(e => (
                  <div key={e.id} className="card p-4">
                    <div className="text-xs text-teal-600 font-semibold mb-1">{e.prompt}</div>
                    <div className="text-sm text-gray-700 line-clamp-2 leading-relaxed">{e.content.replace(/\*\*/g,'')}</div>
                    <div className="text-xs text-gray-400 mt-2">{format(new Date(e.created_at), 'MMM d, yyyy')}</div>
                  </div>
                ))}
                {entries.length === 0 && <p className="text-gray-400 text-sm text-center py-6">No entries yet.</p>}
              </div>
            </div>
          </div>
        )}

        {mode === 'cbt' && (
          <div className="max-w-2xl animate-fade-in">
            <button onClick={() => setMode('choose')} className="text-sm text-teal-600 font-medium mb-6 hover:text-teal-700">← Back</button>
            <div className="space-y-5">
              {CBT.map((p,i) => (
                <div key={p.id} className="card p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-7 h-7 rounded-full bg-teal-50 flex items-center justify-center text-teal-700 text-sm font-bold">{i+1}</div>
                    <h3 className="font-display font-bold text-gray-900">{p.label}</h3>
                  </div>
                  <p className="text-xs text-gray-400 mb-3">{p.hint}</p>
                  <textarea rows={3} value={cbtAns[p.id]||''} onChange={e => setCbtAns({...cbtAns,[p.id]:e.target.value})}
                    placeholder="Write freely..."
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-teal-400 resize-none text-gray-900 bg-gray-50"
                  />
                </div>
              ))}
              <button onClick={(e) => saveCBT(e)} disabled={loading} className="btn-confetti w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-4 rounded-2xl transition-all duration-200 active:scale-95 shadow-md hover:shadow-lg disabled:opacity-50 relative overflow-visible">
                {particles.map(p => (
                  <span
                    key={p.id}
                    className="particle"
                    style={{
                      left: `${p.x}px`,
                      top: `${p.y}px`,
                    }}
                  >
                    {p.char}
                  </span>
                ))}
                {loading ? 'Saving...' : 'Save entry'}
              </button>
            </div>
          </div>
        )}

        {mode === 'free' && (
          <div className="max-w-2xl animate-fade-in">
            <button onClick={() => setMode('choose')} className="text-sm text-teal-600 font-medium mb-6 hover:text-teal-700">← Back</button>
            <div className="card p-5 mb-4 bg-teal-50 border border-teal-100">
              <p className="text-sm text-teal-700 italic">"{prompt}"</p>
              <button onClick={() => setPrompt(FREE_PROMPTS[Math.floor(Math.random()*FREE_PROMPTS.length)])} className="text-xs text-teal-600 font-medium mt-2 hover:text-teal-700">Try another prompt</button>
            </div>
            <div className="card p-6 mb-4">
              <textarea rows={10} value={freeText} onChange={e => setFreeText(e.target.value)} autoFocus
                placeholder="Start writing... this is just for you."
                className="w-full text-sm leading-relaxed focus:outline-none resize-none text-gray-900 bg-transparent"
              />
              <div className="text-right text-xs text-gray-400 mt-2">{freeText.split(/\s+/).filter(Boolean).length} words</div>
            </div>
            <button onClick={(e) => saveFree(e)} disabled={!freeText.trim()||loading} className="btn-confetti w-full bg-teal-500 hover:bg-teal-600 disabled:opacity-40 text-white font-bold py-4 rounded-2xl transition-all duration-200 active:scale-95 shadow-md hover:shadow-lg relative overflow-visible">
              {particles.map(p => (
                <span
                  key={p.id}
                  className="particle"
                  style={{
                    left: `${p.x}px`,
                    top: `${p.y}px`,
                  }}
                >
                  {p.char}
                </span>
              ))}
              {loading ? 'Saving...' : 'Save entry'}
            </button>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
