'use client';
import {
  ComposedChart, Area, Line, CartesianGrid,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

const WEEKLY_MOOD = [
  {week:'Week 1',avg:2.4,high:1.8,low:3.2},{week:'Week 2',avg:2.6,high:2.0,low:3.5},
  {week:'Week 3',avg:2.9,high:2.1,low:3.8},{week:'Week 4',avg:3.1,high:2.4,low:4.0},
  {week:'Week 5',avg:3.0,high:2.2,low:3.9},{week:'Week 6',avg:3.3,high:2.5,low:4.1},
];

const ENGAGEMENT = [
  {day:'Mon',checkins:4,journals:2,chats:5},{day:'Tue',checkins:3,journals:3,chats:4},
  {day:'Wed',checkins:5,journals:1,chats:6},{day:'Thu',checkins:4,journals:4,chats:5},
  {day:'Fri',checkins:3,journals:2,chats:3},{day:'Sat',checkins:2,journals:1,chats:2},
  {day:'Sun',checkins:3,journals:2,chats:4},
];

const DIAGNOSIS_DIST = [
  {name:'Anxiety',value:2,color:'#FBBF24'},{name:'Depression',value:1,color:'#7C6FCD'},
  {name:'Stress',value:1,color:'#F97316'},{name:'Mixed',value:1,color:'#06B6D4'},
];

const WELLNESS_PROGRESS = [
  {name:'Arjun', before:15, after:22},{name:'Priya', before:38, after:45},
  {name:'Arun', before:55, after:78},{name:'Sneha', before:32, after:41},
  {name:'Dev', before:62, after:82},
];

const COMMON_KEYWORDS = [
  {word:'anxiety',count:18},{word:'stress',count:15},{word:'hopeless',count:9},
  {word:'sleep',count:12},{word:'panic',count:7},{word:'worthless',count:5},
  {word:'grateful',count:8},{word:'better',count:11},
];

const KEYWORD_COLORS: Record<string,string> = {
  anxiety:'#7C6FCD', stress:'#F97316', hopeless:'#E02424', sleep:'#06B6D4',
  panic:'#FBBF24', worthless:'#EF4444', grateful:'#0E9F6E', better:'#0DA99E',
};

// Custom Tooltip for Recharts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass p-3 rounded-xl border border-white/40 shadow-xl shadow-psych-500/10">
        <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">{label}</p>
        <div className="space-y-1.5">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-2 text-sm font-bold text-gray-700">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                {entry.name}
              </span>
              <span className="text-sm font-black" style={{ color: entry.color }}>
                {entry.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export default function AnalyticsPage() {
  return (
    <div className="p-7 max-w-7xl mx-auto animate-fade">
      <div className="mb-7">
        <h1 className="font-display font-extrabold text-3xl text-gray-900"><span className="gradient-text">Analytics</span></h1>
        <p className="text-gray-500 text-sm mt-1">Aggregate insights across all 5 patients · Last 6 weeks</p>
      </div>

      {/* Summary stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          {label:'Avg wellness score', value:'53%', change:'+8% this month', up:true },
          {label:'Total check-ins',    value:'168',  change:'24 this week',   up:true },
          {label:'Journal entries',    value:'47',   change:'12 this week',   up:true },
          {label:'Crisis events',      value:'3',    change:'1 resolved',     up:false},
        ].map((s, idx) => (
          <div key={s.label} 
               className="glass p-5 rounded-[20px] relative overflow-hidden group hover:-translate-y-2 hover:rotate-1 transition-all duration-500 ease-out animate-slide-up shadow-lg border border-white/50 hover:shadow-psych-500/20 z-0 hover:z-10"
               style={{ animationDelay: `${idx * 50}ms` }}>
            {/* Animated glowing border background effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-psych-400/0 via-psych-400/0 to-psych-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
            <div className={`absolute -right-8 -top-8 w-24 h-24 rounded-full blur-2xl opacity-10 transition-all duration-700 group-hover:opacity-80 group-hover:scale-[2] ${s.up ? 'bg-green-400' : 'bg-psych-500'} pointer-events-none`} />
            
            <div className="text-xs text-gray-500 mb-1 font-bold relative z-10 uppercase tracking-wide group-hover:text-psych-600 transition-colors duration-300">{s.label}</div>
            <div className="font-display font-black text-3xl text-gray-900 relative z-10 group-hover:scale-105 origin-left transition-transform duration-300">{s.value}</div>
            <div className={`text-xs mt-2 font-bold relative z-10 flex items-center gap-1 ${s.up?'text-green-600':'text-amber-600'}`}>
              {s.up ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="18 15 12 9 6 15"/></svg> : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="6 9 12 15 18 9"/></svg>}
              {s.change}
            </div>
          </div>
        ))}
      </div>

      {/* Hero Chart - Full Width Group Mood Trend */}
      <div className="glass p-6 rounded-[24px] mb-6 border border-white/50 shadow-xl shadow-psych-500/5 hover:shadow-psych-500/10 transition-shadow duration-500">
        <h3 className="font-display font-bold text-gray-900 mb-1 text-lg">Group mood trend</h3>
        <p className="text-xs text-gray-400 mb-6">Average · High risk · Low risk patients</p>
        <ResponsiveContainer width="100%" height={240}>
          <ComposedChart data={WEEKLY_MOOD} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="avgGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="var(--psych-500, #7C6FCD)" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="var(--psych-500, #7C6FCD)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" opacity={0.6}/>
            <XAxis dataKey="week" tick={{fontSize:11,fill:'#9CA3AF',fontWeight:600}} axisLine={false} tickLine={false} dy={10}/>
            <YAxis domain={[1,5]} ticks={[1,2,3,4,5]} tick={{fontSize:11,fill:'#9CA3AF',fontWeight:600}} axisLine={false} tickLine={false} width={30}/>
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#7C6FCD', strokeWidth: 1, strokeDasharray: '4 4', fill: 'transparent' }}/>
            <Area  type="monotone" dataKey="avg"  stroke="#7C6FCD" strokeWidth={3} fill="url(#avgGrad)" name="Average Score" animationDuration={2000}/>
            <Line  type="monotone" dataKey="high" stroke="#E02424" strokeWidth={2} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} strokeDasharray="4 4" name="High Risk Group" animationDuration={2000}/>
            <Line  type="monotone" dataKey="low"  stroke="#0E9F6E" strokeWidth={2} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} strokeDasharray="4 4" name="Low Risk Group" animationDuration={2000}/>
            <Legend iconType="circle" iconSize={10} wrapperStyle={{fontSize:12,paddingTop:15,fontWeight:600, color: '#4B5563'}}/>
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Grid for other charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
        {/* Daily engagement */}
        <div className="glass p-6 rounded-[24px] border border-white/50 shadow-xl shadow-psych-500/5 hover:shadow-psych-500/10 transition-shadow duration-500 xl:col-span-2">
          <h3 className="font-display font-bold text-gray-900 mb-1">Daily engagement</h3>
          <p className="text-xs text-gray-400 mb-6">Check-ins · Journals · Chat sessions this week</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={ENGAGEMENT} barGap={6} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" opacity={0.6}/>
              <XAxis dataKey="day" tick={{fontSize:11,fill:'#9CA3AF',fontWeight:600}} axisLine={false} tickLine={false} dy={10}/>
              <YAxis tick={{fontSize:11,fill:'#9CA3AF',fontWeight:600}} axisLine={false} tickLine={false} width={30}/>
              <Tooltip content={<CustomTooltip />} cursor={{fill:'rgba(124, 111, 205, 0.05)'}}/>
              <Legend iconType="circle" iconSize={10} wrapperStyle={{fontSize:12,paddingTop:15,fontWeight:600}}/>
              <Bar dataKey="checkins" fill="var(--psych-500, #7C6FCD)" radius={[6,6,0,0]} name="Check-ins" animationDuration={1500}/>
              <Bar dataKey="journals" fill="#0DA99E" radius={[6,6,0,0]} name="Journals" animationDuration={1500}/>
              <Bar dataKey="chats"    fill="#F97316" radius={[6,6,0,0]} name="Chats" animationDuration={1500}/>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Diagnosis Breakdown */}
        <div className="glass p-6 rounded-[24px] border border-white/50 shadow-xl shadow-psych-500/5 hover:shadow-psych-500/10 transition-shadow duration-500 flex flex-col justify-between">
          <div>
            <h3 className="font-display font-bold text-gray-900 mb-1">Patient diagnosis</h3>
            <p className="text-xs text-gray-400 mb-2">Primary presenting concerns</p>
          </div>
          
          <div className="relative w-full h-[180px] flex items-center justify-center my-2 select-none">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={DIAGNOSIS_DIST} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" strokeWidth={3} stroke="rgba(255,255,255,0.5)" isAnimationActive={true} animationDuration={1200} paddingAngle={4}>
                  {DIAGNOSIS_DIST.map((d,i) => <Cell key={i} fill={d.color} className="drop-shadow-md hover:opacity-85 transition-opacity cursor-pointer outline-none focus:outline-none hover:scale-105 origin-center"/>)}
                </Pie>
                <Tooltip content={<CustomTooltip />}/>
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center Donut Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-4xl font-black text-gray-900 leading-none drop-shadow-sm">5</span>
              <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mt-1">Patients</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2 mt-2">
            {DIAGNOSIS_DIST.map(d => (
              <div key={d.name} className="flex items-center gap-2 group p-1.5 rounded-lg hover:bg-white/40 transition-colors">
                <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ background: d.color }}></div>
                <span className="text-xs font-bold text-gray-700">{d.name}</span>
                <span className="text-[10px] font-black ml-auto" style={{ color: d.color }}>{Math.round((d.value / 5) * 100)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Wellness progress */}
        <div className="glass p-6 rounded-[24px] border border-white/50 shadow-xl shadow-psych-500/5 hover:shadow-psych-500/10 transition-shadow duration-500">
          <h3 className="font-display font-bold text-gray-900 mb-1">Wellness improvement</h3>
          <p className="text-xs text-gray-400 mb-6">Start of treatment vs current</p>
          <div className="space-y-5">
            {WELLNESS_PROGRESS.map(p => {
              const diff = p.after - p.before;
              return (
                <div key={p.name} className="group/item hover:bg-white/50 p-3 -mx-3 rounded-2xl border border-transparent hover:border-white/60 transition-all duration-300">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-psych-100 to-psych-200/50 flex items-center justify-center font-bold text-sm text-psych-700 shadow-sm border border-white/60 group-hover/item:scale-110 transition-transform">
                        {p.name[0]}
                      </div>
                      <span className="text-sm font-bold text-gray-800">{p.name}</span>
                    </div>
                    <span className="text-xs font-black bg-emerald-50/80 text-emerald-600 border border-emerald-200/50 px-3 py-1.5 rounded-full flex items-center gap-1 shadow-sm transition-transform group-hover/item:scale-105">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="18 15 12 9 6 15"/></svg>
                      +{diff}%
                    </span>
                  </div>
                  
                  {/* Segmented Range Track */}
                  <div className="relative h-4 bg-gray-200/50 backdrop-blur-sm rounded-full border border-white/60 overflow-hidden shadow-inner flex">
                    {/* Baseline Segment (Before) */}
                    <div 
                      className="h-full bg-gradient-to-r from-gray-300 to-gray-400/80 transition-all duration-1000 ease-out" 
                      style={{ width: `${p.before}%` }}
                    />
                    {/* Improvement Segment (Growth) */}
                    <div 
                      className="h-full bg-gradient-to-r from-psych-400 to-emerald-400 relative transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(16,185,129,0.3)]" 
                      style={{ width: `${p.after - p.before}%` }}
                    >
                      {/* Pulse effect */}
                      <div className="absolute inset-0 bg-white/20 animate-pulse" />
                      {/* Current Score Glow Dot at the very end */}
                      <div className="absolute right-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,1)] animate-ping" />
                      <div className="absolute right-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white border-2 border-emerald-400" />
                    </div>
                  </div>

                  <div className="flex justify-between text-xs text-gray-500 mt-2 font-semibold px-1">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-gray-400 inline-block"></span>
                      Baseline: {p.before}%
                    </span>
                    <span className="flex items-center gap-1.5 text-psych-600 font-bold">
                      <span className="w-2 h-2 rounded-full bg-psych-500 inline-block animate-pulse"></span>
                      Current: {p.after}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top emotional keywords */}
        <div className="glass p-6 rounded-[24px] border border-white/50 shadow-xl shadow-psych-500/5 hover:shadow-psych-500/10 transition-shadow duration-500">
          <h3 className="font-display font-bold text-gray-900 mb-1">Top emotional keywords</h3>
          <p className="text-xs text-gray-400 mb-6">Across all patient journals and chats</p>
          <div className="space-y-4">
            {COMMON_KEYWORDS.sort((a,b)=>b.count-a.count).map(k => {
              const color = KEYWORD_COLORS[k.word] || '#7C6FCD';
              return (
                <div key={k.word} className="group flex items-center gap-4 hover:bg-white/50 p-2 -mx-2 rounded-2xl border border-transparent hover:border-white/60 transition-all duration-300">
                  <span className="text-xs font-bold text-gray-700 capitalize bg-white/80 border border-white px-3 py-2 rounded-xl w-28 flex-shrink-0 text-center shadow-sm group-hover:border-psych-200 transition-all group-hover:scale-105 backdrop-blur-md">
                    {k.word}
                  </span>
                  
                  <div className="flex-1 bg-gray-200/50 backdrop-blur-sm rounded-full h-4 overflow-hidden shadow-inner border border-white/60 relative">
                    <div
                      className="h-full rounded-full transition-all duration-1000 ease-out relative group-hover:brightness-110"
                      style={{
                        width: `${(k.count / 18) * 100}%`,
                        background: `linear-gradient(90deg, ${color}99, ${color})`,
                        boxShadow: `0 2px 10px ${color}40`,
                      }}
                    >
                      <div className="absolute inset-0 bg-white/20" />
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                    </div>
                  </div>
                  
                  <span className="text-xs font-black text-gray-600 bg-white border border-gray-100 w-10 h-8 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-psych-500 group-hover:text-white group-hover:border-psych-500 shadow-sm transition-all group-hover:scale-110">
                    {k.count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
