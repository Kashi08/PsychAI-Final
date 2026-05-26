'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { format } from 'date-fns';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { getAvatarUrl } from '@/lib/avatars';
import { DEMO_PATIENTS } from '@/lib/demo-patients';

const CLINICAL_QUOTES = [
  { text: "“Healing is a matter of time, but it is sometimes also a matter of opportunity.”", author: "Hippocrates" },
  { text: "“The good life is a process, not a state of being. It is a direction, not a destination.”", author: "Carl Rogers" },
  { text: "“The curious paradox is that when I accept myself just as I am, then I can change.”", author: "Carl Rogers" },
  { text: "“What we do not consciously bring to awareness becomes our fate.”", author: "Carl Jung" },
];

function RiskBadge({ risk }: { risk: string }) {
  return (
    <span className={`risk-${risk.toLowerCase()} text-xs font-bold px-2.5 py-1 rounded-full`}>
      {risk}
    </span>
  );
}

export default function OverviewPage() {
  const [greeting, setGreeting] = useState('Good morning');
  const [quoteIdx, setQuoteIdx] = useState(0);
  
  const [patients, setPatients] = useState<any[]>([]);
  const [moodTrend, setMoodTrend] = useState<any[]>([]);
  const [riskDist, setRiskDist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const hr = new Date().getHours();
    if (hr < 12) setGreeting('Good morning');
    else if (hr < 17) setGreeting('Good afternoon');
    else setGreeting('Good evening');

    // Auto rotate quote
    const interval = setInterval(() => {
      setQuoteIdx(prev => (prev + 1) % CLINICAL_QUOTES.length);
    }, 9000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function loadDashboard() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !isMounted) return;

      const { data: links } = await supabase
        .from('patient_links')
        .select('patient_id, created_at')
        .eq('psychologist_id', user.id)
        .eq('status', 'active');

      let patientLinks = links || [];
      if (patientLinks.length === 0) {
        patientLinks = Object.keys(DEMO_PATIENTS).map(id => ({
          patient_id: id,
          created_at: new Date().toISOString()
        }));
      }

      const patientIds = patientLinks.map(l => l.patient_id);

      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, wellness_score, avatar_url')
        .in('user_id', patientIds);

      const { data: moods } = await supabase
        .from('mood_logs')
        .select('user_id, score, created_at')
        .in('user_id', patientIds)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      let high = 0, med = 0, low = 0;
      const formattedPatients = patientIds.map(id => {
        const p = (profiles || []).find(prof => prof.user_id === id);
        const demo = DEMO_PATIENTS[id];
        
        const wellness = p?.wellness_score ?? (demo ? 50 : 50);
        const risk = wellness < 40 ? 'HIGH' : wellness < 60 ? 'MED' : 'LOW';
        if (risk === 'HIGH') high++;
        else if (risk === 'MED') med++;
        else low++;

        const fallbackName = demo ? demo.name : (id === '591a9eca-59d2-48ca-962c-e2fd4243f258' ? 'kashish'
                           : id === '144cc8cc-a19a-49f8-af45-add6349afd9b' ? 'Sneha Joshi'
                           : 'Anonymous Patient');
        const fallbackAvatar = demo ? demo.avatar : (id === '591a9eca-59d2-48ca-962c-e2fd4243f258' ? 'Felix'
                             : id === '144cc8cc-a19a-49f8-af45-add6349afd9b' ? 'Emma'
                             : 'Felix');
        const avatar = p?.avatar_url || fallbackAvatar;

        return {
          id: id,
          name: p?.full_name || fallbackName,
          risk,
          wellness,
          last_msg: 'No recent messages',
          last_active: 'Recently',
          avatar,
        };
      });

      // Format mood trend
      const daysObj: Record<string, { sum: number, count: number }> = {};
      (moods || []).forEach(m => {
        const d = new Date(m.created_at).toLocaleDateString('en-US', { weekday: 'short' });
        if (!daysObj[d]) daysObj[d] = { sum: 0, count: 0 };
        daysObj[d].sum += m.score;
        daysObj[d].count++;
      });
      const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
      const mTrend = days.map(d => ({
        day: d,
        avg: daysObj[d] ? +(daysObj[d].sum / daysObj[d].count).toFixed(1) : 3.0
      }));

      if (isMounted) {
        setPatients(formattedPatients);
        setRiskDist([
          { name: 'High', value: high, color: '#E02424' },
          { name: 'Medium', value: med, color: '#FBBF24' },
          { name: 'Low', value: low, color: '#0E9F6E' },
        ].filter(d => d.value > 0));
        setMoodTrend(mTrend);
        setLoading(false);
      }
    }
    loadDashboard();
    return () => { isMounted = false; };
  }, []);

  const KEYWORD_STATS = [
    { label:'Anxiety',    count:12, color:'#FBBF24' },
    { label:'Depression', count:7,  color:'#7C6FCD' },
    { label:'Sleep',      count:9,  color:'#06B6D4' },
    { label:'Crisis',     count:2,  color:'#E02424' },
    { label:'Stress',     count:11, color:'#F97316' },
  ];

  const highRisk = patients.filter(p => p.risk === 'HIGH').length;

  return (
    <div className="p-7 max-w-7xl mx-auto animate-fade">
      {/* Header and Quotes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-7 items-center">
        <div className="md:col-span-2">
          <h1 className="font-display font-extrabold text-3xl transition-all duration-300">
            <span className="gradient-text">
              {greeting === 'Good morning' ? 'Good morning, Doctor ☀️' : greeting === 'Good afternoon' ? 'Good afternoon, Doctor 🌤️' : 'Good evening, Doctor 🌙'}
            </span>
          </h1>
          <p className="text-gray-500 text-sm mt-1.5 font-medium">{format(new Date(), 'EEEE, MMMM d yyyy')} · <span className="text-psych-600 font-bold">{patients.length} active patients</span> monitored</p>
        </div>

        {/* Dynamic Quotes Box */}
        <div 
          onClick={() => setQuoteIdx(prev => (prev + 1) % CLINICAL_QUOTES.length)}
          className="bg-gradient-to-br from-psych-50/70 to-purple-50/40 border border-psych-100/30 rounded-2xl p-4 cursor-pointer hover:shadow-md hover:scale-[1.01] transition-all duration-300 shadow-sm flex flex-col justify-between min-h-[92px] group"
        >
          <p className="text-xs italic text-psych-700 line-clamp-2 transition-all duration-300 font-medium group-hover:text-psych-800">
            {CLINICAL_QUOTES[quoteIdx].text}
          </p>
          <span className="text-[10px] text-psych-500/80 font-bold self-end mt-1 uppercase tracking-wider group-hover:text-psych-600">
              {CLINICAL_QUOTES[quoteIdx].author}
          </span>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label:'Total patients',  value:patients.length, sub:'Active this week',  color:'#7C6FCD', bg:'#F0EDFB', hoverClass:'hover:shadow-psych-500/10 hover:border-psych-200' },
          { label:'High risk',       value:highRisk, sub:'Need attention now', color:'#E02424', bg:'#FDE8E8', hoverClass:'hover:shadow-red-500/10 hover:border-red-200' },
          { label:'Sessions today',  value:loading ? 0 : 3, sub:'2 pending confirm',   color:'#0DA99E', bg:'#E6FAF9', hoverClass:'hover:shadow-teal-500/10 hover:border-teal-200' },
          { label:'Crisis alerts',   value:loading ? 0 : 2, sub:'This week',           color:'#F97316', bg:'#FEF0E7', hoverClass:'hover:shadow-orange-500/10 hover:border-orange-200' },
        ].map((s, idx) => (
          <div key={s.label} className={`card p-5 hover-float cursor-pointer ${s.hoverClass} animate-slide-up`} style={{ animationDelay: `${idx * 75}ms` }}>
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300" style={{ background: s.bg }}>
              <span className="font-black text-xl" style={{ color: s.color }}>{s.value}</span>
            </div>
            <div className="font-display font-bold text-gray-800 text-sm">{s.label}</div>
            <div className="text-xs text-gray-400 mt-1 font-medium">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        {/* Mood trend chart */}
        <div className="card p-5 lg:col-span-2 animate-slide-up delay-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-gray-900">Group mood trend</h2>
            <span className="text-xs text-gray-400 font-semibold bg-gray-100 rounded-lg px-2.5 py-1">Last 7 days · avg score</span>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            {loading ? (
              <div className="w-full h-full flex items-center justify-center"><div className="w-8 h-8 border-2 border-psych-500 border-t-transparent rounded-full animate-spin"></div></div>
            ) : (
              <AreaChart data={moodTrend.length > 0 ? moodTrend : [{day:'No Data', avg:3}]}>
                <defs>
                  <linearGradient id="mg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--psych-500)" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="var(--psych-500)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{ fontSize:11, fill:'#9CA3AF', fontWeight:500 }} axisLine={false} tickLine={false}/>
                <YAxis domain={[1,5]} ticks={[1,2,3,4,5]} tick={{ fontSize:11, fill:'#9CA3AF', fontWeight:500 }} axisLine={false} tickLine={false} width={20}/>
                <Tooltip contentStyle={{ borderRadius:12, border:'1px solid #EEECF8', fontSize:12, boxShadow:'0 4px 12px rgba(0,0,0,0.03)' }}/>
                <Area type="monotone" dataKey="avg" stroke="var(--psych-500)" strokeWidth={2.8} fill="url(#mg)" dot={{ fill:'var(--psych-500)', r:4.5 }} activeDot={{ r: 6, strokeWidth: 0 }}/>
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Risk distribution */}
        <div className="card p-5 animate-slide-up delay-2">
          <h2 className="font-display font-bold text-gray-900 mb-4">Risk distribution</h2>
          <div className="flex items-center justify-center mb-4 transition-transform duration-300 hover:scale-105">
            {loading ? (
              <div className="w-[130px] h-[130px] flex items-center justify-center"><div className="w-8 h-8 border-2 border-psych-500 border-t-transparent rounded-full animate-spin"></div></div>
            ) : (
              <PieChart width={130} height={130}>
                <Pie data={riskDist.length > 0 ? riskDist : [{name:'None', value:1, color:'#E5E7EB'}]} cx={65} cy={65} innerRadius={40} outerRadius={60} dataKey="value" strokeWidth={2}>
                  {(riskDist.length > 0 ? riskDist : [{name:'None', value:1, color:'#E5E7EB'}]).map((d,i) => <Cell key={i} fill={d.color}/>)}
                </Pie>
              </PieChart>
            )}
          </div>
          {!loading && riskDist.map(d => (
            <div key={d.name} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ background: d.color }}></div>
                <span className="text-sm text-gray-600 font-medium">{d.name} risk</span>
              </div>
              <span className="font-bold text-gray-900 text-sm bg-gray-50 rounded-lg px-2 py-0.5 border border-gray-100">{d.value}</span>
            </div>
          ))}
          {!loading && riskDist.length === 0 && <div className="text-center text-sm text-gray-400 mt-2">No active patients</div>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Patient list */}
        <div className="card p-5 lg:col-span-2 animate-slide-up delay-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-gray-900">Patient status</h2>
            <Link href="/patients" className="text-sm text-psych-500 font-bold hover:text-psych-700 transition-colors">View all →</Link>
          </div>
          <div className="space-y-3">
            {loading ? (
               <div className="py-8 flex justify-center"><div className="w-8 h-8 border-2 border-psych-500 border-t-transparent rounded-full animate-spin"></div></div>
            ) : patients.length === 0 ? (
               <div className="py-8 text-center text-sm text-gray-400">No active patients.</div>
            ) : patients.map(p => (
              <Link key={p.id} href={`/patients/${p.id}`}
                className="flex items-center gap-3 p-3 rounded-2xl hover:bg-psych-50/50 hover:translate-x-1 border border-transparent hover:border-psych-100/30 transition-all duration-200 group"
              >
                <div className="relative flex-shrink-0 group-hover:scale-105 transition-transform duration-200">
                  <div className="w-9 h-9 rounded-xl overflow-hidden bg-psych-100 flex items-center justify-center">
                    <img src={getAvatarUrl(p.avatar)} alt={p.name} className="w-full h-full object-cover" />
                  </div>
                  {p.risk === 'HIGH' && (
                    <div className="absolute inset-0 rounded-xl border-2 border-red-500 animate-ping opacity-60"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-bold text-gray-800 text-sm group-hover:text-psych-600 transition-colors">{p.name}</span>
                    <RiskBadge risk={p.risk} />
                  </div>
                  <p className="text-xs text-gray-400 truncate font-medium">{p.last_msg}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-[10px] text-gray-400 font-medium">{p.last_active}</div>
                  <div className="text-xs font-bold mt-1" style={{ color: p.wellness>=60?'#0E9F6E':p.wellness>=40?'#FBBF24':'#E02424' }}>
                    {p.wellness}% wellness
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Top keywords */}
        <div className="card p-5 animate-slide-up delay-3">
          <h2 className="font-display font-bold text-gray-900 mb-4">Top keywords this week</h2>
          <div className="space-y-3.5">
            {KEYWORD_STATS.map(k => (
              <div key={k.label} className="group">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-gray-600 font-medium group-hover:text-gray-950 transition-colors">{k.label}</span>
                  <span className="text-xs font-bold text-gray-800 bg-gray-100 px-2 py-0.5 rounded-md border border-gray-200">{k.count}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                  <div className="h-1.5 rounded-full transition-all duration-500 group-hover:brightness-105" style={{ width:`${(k.count/12)*100}%`, background:k.color }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
