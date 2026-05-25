'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Sidebar from '@/components/Sidebar';
import { format } from 'date-fns';

const MOODS = [
  { score:1, label:'Struggling', color:'#E02424', bg:'#FDE8E8' },
  { score:2, label:'Low',        color:'#F97316', bg:'#FEF0E7' },
  { score:3, label:'Okay',       color:'#FBBF24', bg:'#FEF9E7' },
  { score:4, label:'Good',       color:'#3BD671', bg:'#EDFBF1' },
  { score:5, label:'Great',      color:'#0E9F6E', bg:'#DEF7EC' },
];
const TAGS = ['Anxious','Stressed','Tired','Hopeful','Calm','Sad','Focused','Overwhelmed','Grateful','Lonely','Energized','Irritable'];
const FACE_PATHS: Record<number,string> = {
  1:'M7 15q5-3 10 0', 2:'M8 15q4-1.5 8 0', 3:'M8 15h8',
  4:'M8 14q4 2.5 8 0', 5:'M7 13q5 4 10 0',
};

export default function MoodPage() {
  const [selected, setSelected] = useState<number|null>(null);
  const [tags, setTags]         = useState<string[]>([]);
  const [note, setNote]         = useState('');
  const [logs, setLogs]         = useState<any[]>([]);
  const [saved, setSaved]       = useState(false);
  const [loading, setLoading]   = useState(false);
  const [userId, setUserId]     = useState('');
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; char: string }[]>([]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return;
      setUserId(data.user.id);
      supabase.from('mood_logs').select('*').eq('user_id', data.user.id).order('created_at', { ascending: false }).limit(20).then(({ data: d }) => setLogs(d || []));
    });
  }, []);

  const triggerMoodConfetti = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const emojis = ['😊', '🌈', '🌻', '🎉', '🧠', '✨', '💖', '🌱', '☀️', '🥰'];
    const newParticles = Array.from({ length: 15 }).map((_, i) => ({
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

  const save = async () => {
    if (!selected || !userId) return;
    setLoading(true);
    const mood = MOODS[selected - 1];
    const { data } = await supabase.from('mood_logs').insert({
      user_id: userId, score: selected, label: mood.label,
      note: note || null, tags, nlp_class: null,
    }).select().single();
    if (data) setLogs(prev => [data, ...prev]);
    setLoading(false); setSaved(true);
    setTimeout(() => { setSaved(false); setSelected(null); setNote(''); setTags([]); }, 2000);
  };

  const toggleTag = (t: string) => setTags(prev => prev.includes(t) ? prev.filter(x => x!==t) : [...prev, t]);

  return (
    <div className="flex min-h-screen bg-gradient-mesh">
      <Sidebar />
      <div className="flex-1 md:ml-60 ml-0 min-h-screen pt-16 md:pt-0">
        <div className="p-8 max-w-5xl mx-auto w-full animate-fade-in">
        <h1 className="font-display font-extrabold text-3xl mb-1 flex items-center gap-2">
          <span className="gradient-text">Mood Check-in</span>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-teal-500">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </h1>
        <p className="text-gray-500 text-sm mb-8">How are you really feeling right now?</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Selector */}
          <div className="space-y-5">
            <div className="card tilt-card p-6">
              <p className="font-semibold text-gray-700 mb-5">Select your mood</p>
              <div className="flex gap-3 justify-between">
                {MOODS.map(m => (
                  <button key={m.score} onClick={() => setSelected(m.score)}
                    className="flex-1 flex flex-col items-center gap-2 py-4 rounded-2xl border-2 transition-all hover:scale-105 active:scale-95 hover:shadow-md duration-300 cursor-pointer"
                    style={{ borderColor: selected===m.score ? m.color : '#F3F4F6', background: selected===m.score ? m.bg : 'white' }}
                  >
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="transition-transform duration-300 hover:rotate-12">
                      <circle cx="12" cy="12" r="10" stroke={selected===m.score ? m.color : '#D1D5DB'} strokeWidth="1.6"/>
                      <circle cx="9"  cy="10" r="1.2" fill={selected===m.score ? m.color : '#D1D5DB'}/>
                      <circle cx="15" cy="10" r="1.2" fill={selected===m.score ? m.color : '#D1D5DB'}/>
                      <path d={FACE_PATHS[m.score]} fill="none" stroke={selected===m.score ? m.color : '#D1D5DB'} strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    <span className="text-xs font-bold" style={{ color: selected===m.score ? m.color : '#9CA3AF' }}>{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {selected && (
              <>
                <div className="card tilt-card p-6 animate-fade-in">
                  <p className="font-semibold text-gray-700 mb-3">Emotion tags</p>
                  <div className="flex flex-wrap gap-2">
                    {TAGS.map(t => (
                      <button key={t} onClick={() => toggleTag(t)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-all duration-200 active:scale-95 ${tags.includes(t) ? 'border-teal-400 bg-teal-50 text-teal-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
                      >{t}</button>
                    ))}
                  </div>
                </div>
                <div className="card tilt-card p-6 animate-fade-in">
                  <p className="font-semibold text-gray-700 mb-3">Add a note <span className="text-gray-400 font-normal">(optional)</span></p>
                  <textarea value={note} onChange={e => setNote(e.target.value)} rows={3}
                    placeholder="What's on your mind? Anything you want to remember..."
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-teal-400 resize-none text-gray-900 bg-gray-50 transition-colors focus:bg-white"
                  />
                </div>
                <button onClick={(e) => { triggerMoodConfetti(e); save(); }} disabled={loading}
                  className="btn-confetti w-full py-4 rounded-2xl font-bold text-white text-sm shadow-md transition-all hover:opacity-95 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 relative overflow-visible"
                  style={{ background: MOODS[selected-1].color, boxShadow: `0 4px 14px ${MOODS[selected-1].color}25` }}
                >
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
                  {saved ? 'Saved! +20 XP' : loading ? 'Saving...' : 'Save mood log'}
                </button>
              </>
            )}
          </div>

          {/* History */}
          <div>
            <h2 className="font-display font-bold text-lg text-gray-900 mb-4">Recent history</h2>
            <div className="space-y-3">
              {logs.slice(0,10).map(log => {
                const m = MOODS[log.score - 1];
                return (
                  <div key={log.id} className="card tilt-card p-4 flex items-center gap-4 hover-float">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: m.bg }}>
                      <span className="font-extrabold text-xl" style={{ color: m.color }}>{log.score}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 text-sm">{m.label}</div>
                      <div className="text-xs text-gray-400">{format(new Date(log.created_at), 'MMM d, h:mm a')}</div>
                      {log.tags?.length > 0 && <div className="text-xs text-gray-500 mt-0.5">{log.tags.join(' · ')}</div>}
                    </div>
                  </div>
                );
              })}
              {logs.length === 0 && <p className="text-gray-400 text-sm text-center py-8">No mood logs yet. Log your first mood!</p>}
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
