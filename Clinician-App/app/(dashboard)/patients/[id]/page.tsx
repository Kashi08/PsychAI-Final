'use client';
import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { supabase } from '@/lib/supabase';
import { getAvatarUrl } from '@/lib/avatars';
import { DEMO_PATIENTS } from '@/lib/demo-patients';

export default function PatientDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const patientId = params.id as string;

  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // FIX: context-aware back navigation
  const fromAlerts = searchParams.get('from') === 'alerts';
  const backHref  = fromAlerts ? '/alerts' : '/patients';
  const backLabel = fromAlerts ? '← Alerts'  : '← Patients';

  const [activeTab, setActiveTab] = useState<'overview'|'chat'|'journal'|'notes'>('overview');
  const [noteText, setNoteText]   = useState('');
  const [aiSummary, setAiSummary] = useState('');
  const [loadingAI, setLoadingAI] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      // 1. fetch profile
      let profData = null;
      const { data: prof } = await supabase.from('profiles').select('*').eq('user_id', patientId).maybeSingle();
      
      if (!prof) {
        const demo = DEMO_PATIENTS[patientId];
        if (demo) {
          profData = {
            user_id: patientId,
            full_name: demo.name,
            age: 28,
            wellness_score: 68,
            created_at: new Date().toISOString(),
            avatar_url: demo.avatar,
            guardian_contact: null
          };
        } else {
          const fallbackName = patientId === '591a9eca-59d2-48ca-962c-e2fd4243f258' ? 'kashish'
                             : patientId === '144cc8cc-a19a-49f8-af45-add6349afd9b' ? 'Sneha Joshi'
                             : null;
          if (fallbackName) {
            profData = {
              user_id: patientId,
              full_name: fallbackName,
              age: 22,
              wellness_score: 68,
              created_at: new Date().toISOString(),
              avatar_url: null,
              guardian_contact: null
            };
          } else {
            if (isMounted) setLoading(false);
            return;
          }
        }
      } else {
        profData = prof;
      }
      
      // 2. fetch mood logs
      const { data: moods } = await supabase.from('mood_logs').select('*').eq('user_id', patientId).order('created_at', { ascending: false }).limit(7);
      
      // 3. fetch journal entries
      const { data: journals } = await supabase.from('journal_entries').select('*').eq('user_id', patientId).order('created_at', { ascending: false }).limit(10);

      // format mood history for charts
      const moodHistory = (moods || []).reverse().map((m: any) => ({
        day: new Date(m.created_at).toLocaleDateString('en-US', { weekday: 'short' }),
        score: m.score,
        date: m.created_at
      }));

      const journalSnippets = (journals || []).map((j: any) => ({
        date: new Date(j.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        prompt: j.prompt_used || 'Free Write',
        excerpt: j.content.length > 100 ? j.content.substring(0, 100) + '...' : j.content
      }));

      const wellness = profData.wellness_score ?? 50;
      const risk = wellness < 40 ? 'HIGH' : wellness < 60 ? 'MED' : 'LOW';
      const joined = new Date(profData.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const fallbackAvatar = patientId === '591a9eca-59d2-48ca-962c-e2fd4243f258' ? 'Felix'
                           : patientId === '144cc8cc-a19a-49f8-af45-add6349afd9b' ? 'Emma'
                           : 'Felix';
      const avatar = profData.avatar_url || fallbackAvatar;

      if (isMounted) {
        setPatient({
          name: profData.full_name || 'Anonymous',
          age: profData.age || 20,
          risk,
          diagnosis: 'General Evaluation',
          wellness,
          sessions: 0,
          joined,
          guardian: profData.guardian_contact || 'None',
          therapist_code: 'Unknown',
          mood_history: moodHistory.length > 0 ? moodHistory : [{ day: 'No Data', score: 0 }],
          chat_history: [], // We don't have a chat table right now
          journal_snippets: journalSnippets,
          crisis_events: [], // We don't have crisis events right now
          phq9: 0,
          gad7: 0,
          avatar
        });
        setLoading(false);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, [patientId]);

  const generateAISummary = async () => {
    setLoadingAI(true);
    try {
      const res = await fetch('/api/ai-summary', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ patient }),
      });
      const data = await res.json();
      setAiSummary(data.summary);
    } catch {
      setAiSummary('Unable to generate summary at this time. Please check your Groq API key.');
    } finally { setLoadingAI(false); }
  };

  const TABS = ['overview','chat','journal','notes'] as const;

  if (loading) {
    return <div className="p-7 max-w-6xl mx-auto flex justify-center py-20"><div className="w-10 h-10 border-4 border-psych-500 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  if (!patient) {
    return <div className="p-7 max-w-6xl mx-auto"><p>Patient not found or you do not have access.</p></div>;
  }

  return (
    <div className="p-7 max-w-6xl mx-auto animate-fade">
      {/* Back + header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href={backHref} className="text-sm text-gray-400 hover:text-gray-700">{backLabel}</Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center bg-psych-100 shadow-sm">
              <img src={getAvatarUrl(patient.avatar)} alt={patient.name} className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display font-extrabold text-2xl text-gray-900"><span className="gradient-text">{patient.name}</span></h1>
                <span className={`risk-${patient.risk.toLowerCase()} text-xs font-bold px-2.5 py-1 rounded-full`}>{patient.risk} RISK</span>
              </div>
              <p className="text-sm text-gray-500">{patient.diagnosis} · Age {patient.age} · {patient.sessions} sessions</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="border border-gray-200 hover:border-psych-300 text-gray-600 text-sm font-medium px-4 py-2 rounded-xl transition-colors">
            Schedule session
          </button>
          <button className="bg-psych-500 hover:bg-psych-600 text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors">
            Send message
          </button>
        </div>
      </div>

      {/* PHQ/GAD scores */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {[
          { label:'Wellness score', value:`${patient.wellness}%`, color: patient.wellness>=60?'#0E9F6E':patient.wellness>=40?'#FBBF24':'#E02424' },
          { label:'PHQ-9 (Depression)', value:patient.phq9, sub: patient.phq9>=20?'Severe':patient.phq9>=15?'Moderately severe':patient.phq9>=10?'Moderate':'Mild', color:'#7C6FCD' },
          { label:'GAD-7 (Anxiety)', value:patient.gad7, sub: patient.gad7>=15?'Severe':patient.gad7>=10?'Moderate':'Mild', color:'#F97316' },
          { label:'Crisis events', value:patient.crisis_events.length, sub: patient.crisis_events.length > 0 ? 'Guardian alerted' : 'None recorded', color: patient.crisis_events.length > 0 ? '#E02424' : '#0E9F6E' },
        ].map(s => (
          <div key={s.label} className="card p-4">
            <div className="text-xs text-gray-500 mb-1">{s.label}</div>
            <div className="font-extrabold text-2xl" style={{ color: s.color }}>{s.value}</div>
            {s.sub && <div className="text-xs text-gray-400 mt-0.5">{s.sub}</div>}
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 mb-6 bg-gray-100/80 p-1.5 rounded-2xl w-fit border border-gray-200/50">
        {TABS.map(t => (
          <button key={t} onClick={()=>setActiveTab(t)}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold capitalize transition-all duration-200 ${activeTab===t?'bg-white text-psych-700 shadow-md border border-gray-200/20':'text-gray-500 hover:text-gray-800 hover:bg-white/40'}`}
          >{t}</button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 animate-slide-up">
          <div className="card p-5">
            <h3 className="font-display font-bold text-gray-900 mb-4">Mood this week</h3>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={patient.mood_history}>
                <XAxis dataKey="day" tick={{ fontSize:11, fill:'#9CA3AF', fontWeight:500 }} axisLine={false} tickLine={false}/>
                <YAxis domain={[0,5]} ticks={[1,2,3,4,5]} tick={{ fontSize:11, fill:'#9CA3AF', fontWeight:500 }} axisLine={false} tickLine={false} width={20}/>
                <Tooltip contentStyle={{ borderRadius:12, fontSize:12 }}/>
                <Bar dataKey="score" fill="var(--psych-500)" radius={[4,4,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-gray-900">AI clinical summary</h3>
              <button onClick={generateAISummary} disabled={loadingAI}
                className="text-xs font-bold bg-psych-50 text-psych-700 hover:bg-psych-100 border border-psych-200/50 px-3.5 py-2 rounded-xl transition-all disabled:opacity-50 flex items-center gap-1.5 shadow-sm hover:scale-[1.02] active:scale-[0.98]">
                <svg className={loadingAI ? 'animate-spin' : ''} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                {loadingAI ? 'Generating...' : 'Generate with Groq'}
              </button>
            </div>
            {aiSummary ? (
              <div className="text-sm text-gray-700 leading-relaxed bg-psych-50/70 rounded-2xl p-4.5 border border-psych-100/50 animate-spring shadow-inner font-medium">{aiSummary}</div>
            ) : (
              <div className="bg-gray-50/60 rounded-2xl p-5 text-sm text-gray-400 text-center border border-dashed border-gray-200/80">
                Click "Generate with Groq" to get an AI clinical summary based on this patient's mood logs, journal entries, and chat history.
              </div>
            )}
          </div>

          <div className="card p-5">
            <h3 className="font-display font-bold text-gray-900 mb-4">Patient information</h3>
            {[
              { label:'Joined', value:patient.joined },
              { label:'Therapist code', value:patient.therapist_code },
              { label:'Guardian contact', value:patient.guardian },
              { label:'Total sessions', value:patient.sessions },
            ].map(f => (
              <div key={f.label} className="flex justify-between py-2.5 border-b border-gray-50 last:border-0">
                <span className="text-sm text-gray-500 font-medium">{f.label}</span>
                <span className="text-sm font-bold text-gray-900 bg-gray-50 rounded-lg px-2 py-0.5 border border-gray-100">{f.value}</span>
              </div>
            ))}
          </div>

          <div className="card p-5">
            <h3 className="font-display font-bold text-gray-900 mb-4">Crisis events</h3>
            {patient.crisis_events.length > 0 ? (
              patient.crisis_events.map((e:any, i:number) => (
                <div key={i} className="bg-red-50/70 border border-red-100 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="#E02424" strokeWidth="2"/></svg>
                    <span className="text-xs font-bold text-red-700">{e.date}</span>
                    {e.twilio_called && <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">Guardian called</span>}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {e.keywords.map((k:string) => <span key={k} className="text-[10px] bg-red-100/60 border border-red-200/20 text-red-600 px-2 py-0.5 rounded-full font-bold">{k}</span>)}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-400 text-center py-4 font-medium">No crisis events recorded.</div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'chat' && (
        <div className="card p-5 max-w-2xl animate-slide-up">
          <h3 className="font-display font-bold text-gray-900 mb-4">Recent chat history</h3>
          {patient.chat_history.length > 0 ? (
            <div className="space-y-4">
              {patient.chat_history.map((m:any, i:number) => (
                <div key={i} className={`flex gap-3 ${m.role==='user'?'flex-row-reverse':''} animate-slide-up`} style={{ animationDelay: `${i * 75}ms` }}>
                  <div className={`max-w-md px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm transition-all duration-200 hover:shadow ${m.role==='user'?'bg-psych-50 text-gray-800 border border-psych-100/50 rounded-tr-none':'bg-gray-50 text-gray-800 border border-gray-100 rounded-tl-none'}`}>
                    <p className="font-medium">{m.content}</p>
                    <div className="text-[10px] text-gray-400 mt-2 font-bold tracking-wide uppercase">{m.role==='user'?patient.name:'PsychAI'} · {m.time}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-400 text-center py-4 font-medium">No chat history recorded.</div>
          )}
        </div>
      )}

      {activeTab === 'journal' && (
        <div className="space-y-4 max-w-2xl animate-slide-up">
          {patient.journal_snippets.length > 0 ? (
            patient.journal_snippets.map((j:any,i:number) => (
              <div key={i} className="card p-5 hover-float cursor-pointer hover:border-psych-200/50">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-bold text-psych-700 bg-psych-50 border border-psych-100/50 px-2.5 py-1 rounded-lg capitalize">{j.prompt}</span>
                  <span className="text-xs text-gray-400 font-bold">{j.date}</span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed italic font-medium">"{j.excerpt}"</p>
              </div>
            ))
          ) : (
            <div className="text-sm text-gray-400 text-center py-4 font-medium">No journal entries recorded.</div>
          )}
        </div>
      )}

      {activeTab === 'notes' && (
        <div className="max-w-2xl animate-slide-up">
          <div className="card p-5 mb-4">
            <h3 className="font-display font-bold text-gray-900 mb-3">Add session note</h3>
            <textarea rows={5} value={noteText} onChange={e=>setNoteText(e.target.value)}
              placeholder="Session observations, treatment plan updates, homework assigned..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-psych-500 focus:ring-4 focus:ring-psych-500/10 resize-none text-gray-900 bg-gray-50 focus:bg-white transition-all mb-4"
            />
            <div className="flex flex-wrap gap-3">
              <select className="border border-gray-200 rounded-xl text-sm px-3 py-2.5 focus:outline-none focus:border-psych-500 bg-white text-gray-600 font-medium">
                <option>PHQ-9 score</option>
                {[...Array(28)].map((_,n)=><option key={n}>{n}</option>)}
              </select>
              <select className="border border-gray-200 rounded-xl text-sm px-3 py-2.5 focus:outline-none focus:border-psych-500 bg-white text-gray-600 font-medium">
                <option>GAD-7 score</option>
                {[...Array(22)].map((_,n)=><option key={n}>{n}</option>)}
              </select>
              <button disabled={!noteText.trim()} className="flex-1 bg-psych-500 hover:bg-psych-600 disabled:opacity-40 text-white font-bold text-sm py-2.5 rounded-xl transition-all shadow-md shadow-psych-500/10 hover:scale-[1.01] active:scale-[0.99]">
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
