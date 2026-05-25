'use client';
import { useState, useEffect, useRef } from 'react';
import Sidebar from '@/components/Sidebar';

const PATTERNS = [
  { id:'478', name:'4-7-8 Breathing', desc:'Best for anxiety & sleep', inhale:4, hold:7, exhale:8, color:'#0DA99E', bg:'#E6FAF9' },
  { id:'box', name:'Box Breathing',   desc:'Focus & stress relief',    inhale:4, hold:4, exhale:4, color:'#1A56DB', bg:'#EBF2FF' },
  { id:'44',  name:'Equal Breathing', desc:'Balance & calm',           inhale:4, hold:0, exhale:4, color:'#0E9F6E', bg:'#DEF7EC' },
];
const GROUND = [
  {n:5,s:'See',   p:'Name 5 things you can see right now.'},
  {n:4,s:'Touch', p:'4 things you can physically feel.'},
  {n:3,s:'Hear',  p:'3 sounds you can hear.'},
  {n:2,s:'Smell', p:'2 things you can smell.'},
  {n:1,s:'Taste', p:'1 thing you can taste.'},
];

export default function MindfulnessPage() {
  const [pat, setPat]     = useState(PATTERNS[0]);
  const [phase, setPhase] = useState<string>('idle');
  const [count, setCount] = useState(0);
  const [cycles, setCycles] = useState(0);
  const [running, setRunning] = useState(false);
  const [gStep, setGStep] = useState<number|null>(null);
  const [done, setDone]   = useState(false);
  const timer = useRef<any>(null);
  const phaseRef = useRef('idle');
  const countRef = useRef(0);

  const PHASES = pat.hold > 0 ? ['inhale','hold','exhale'] : ['inhale','exhale'];
  const DURATIONS: Record<string,number> = { inhale: pat.inhale, hold: pat.hold, exhale: pat.exhale, idle: 0 };
  const LABELS: Record<string,string>    = { inhale:'Breathe in', hold:'Hold', exhale:'Breathe out', idle:'Ready?' };

  const start = () => {
    setRunning(true); setDone(false); setCycles(0);
    let idx = 0;
    phaseRef.current = PHASES[0]; setPhase(PHASES[0]);
    countRef.current = DURATIONS[PHASES[0]]; setCount(DURATIONS[PHASES[0]]);
    timer.current = setInterval(() => {
      countRef.current -= 1;
      setCount(countRef.current);
      if (countRef.current <= 0) {
        idx = (idx + 1) % PHASES.length;
        if (idx === 0) {
          setCycles(c => {
            if (c + 1 >= 4) { stop(); setDone(true); return c + 1; }
            return c + 1;
          });
        }
        phaseRef.current = PHASES[idx]; setPhase(PHASES[idx]);
        countRef.current = DURATIONS[PHASES[idx]]; setCount(DURATIONS[PHASES[idx]]);
      }
    }, 1000);
  };

  const stop = () => { setRunning(false); setPhase('idle'); clearInterval(timer.current); };
  useEffect(() => () => clearInterval(timer.current), []);

  const totalSeconds = PHASES.reduce((a,p) => a + DURATIONS[p], 0);
  const elapsed = totalSeconds - count;
  const progress = totalSeconds > 0 ? (elapsed / totalSeconds) : 0;
  const circumference = 2 * Math.PI * 70;
  const dashOffset = circumference * (1 - progress);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-60 p-8 max-w-4xl animate-fade-in">
        <h1 className="font-display font-extrabold text-3xl text-gray-900 mb-1">Mindfulness</h1>
        <p className="text-gray-500 text-sm mb-8">Take a moment. Just breathe.</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Breathing */}
          <div className="space-y-5">
            {/* Pattern selector */}
            <div className="flex gap-3">
              {PATTERNS.map(p => (
                <button key={p.id} onClick={() => { setPat(p); stop(); setDone(false); }}
                  className="flex-1 p-3 rounded-xl border-2 text-left transition-all"
                  style={{ borderColor: pat.id===p.id ? p.color : '#F3F4F6', background: pat.id===p.id ? p.bg : 'white' }}
                >
                  <div className="text-xs font-bold" style={{ color: pat.id===p.id ? p.color : '#374151' }}>{p.name}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{p.desc}</div>
                </button>
              ))}
            </div>

            {/* Circle */}
            <div className="card p-8 flex flex-col items-center">
              {done ? (
                <div className="text-center py-4">
                  <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" stroke="#0E9F6E" strokeWidth="2"/><polyline points="22 4 12 14.01 9 11.01" stroke="#0E9F6E" strokeWidth="2"/></svg>
                  </div>
                  <h3 className="font-display font-bold text-xl text-gray-900 mb-1">Session complete</h3>
                  <p className="text-sm text-green-600 mb-4">4 cycles · +15 XP</p>
                  <button onClick={() => setDone(false)} className="text-sm text-teal-600 font-medium hover:text-teal-700">Go again?</button>
                </div>
              ) : (
                <>
                  <div className="relative w-40 h-40 flex items-center justify-center mb-6">
                    <svg width="160" height="160" viewBox="0 0 160 160">
                      <circle cx="80" cy="80" r="70" fill={pat.bg} stroke={pat.color} strokeWidth="1" strokeOpacity="0.3"/>
                      {running && <circle cx="80" cy="80" r="70" fill="none" stroke={pat.color} strokeWidth="4" strokeDasharray={circumference} strokeDashoffset={dashOffset} strokeLinecap="round" transform="rotate(-90 80 80)" style={{ transition: 'stroke-dashoffset 0.9s linear' }}/>}
                    </svg>
                    <div className="absolute text-center">
                      <div className="font-bold text-sm mb-1" style={{ color: pat.color }}>{LABELS[phase]}</div>
                      {running && <div className="font-extrabold text-4xl" style={{ color: pat.color }}>{count}</div>}
                      {!running && <div className="text-gray-400 text-xs">4 cycles</div>}
                    </div>
                  </div>
                  {running && (
                    <div className="flex gap-2 mb-6">
                      {[0,1,2,3].map(i => <div key={i} className="w-3 h-3 rounded-full border-2" style={{ background: i < cycles ? pat.color : 'transparent', borderColor: pat.color }}></div>)}
                    </div>
                  )}
                  <button onClick={running ? stop : start}
                    className="px-10 py-3 rounded-full font-bold text-sm transition-colors"
                    style={{ background: running ? '#FDE8E8' : pat.color, color: running ? '#E02424' : 'white' }}
                  >{running ? 'Stop' : 'Start'}</button>
                </>
              )}
            </div>
          </div>

          {/* Grounding */}
          <div>
            <h2 className="font-display font-bold text-lg text-gray-900 mb-4">5-4-3-2-1 Grounding</h2>
            <p className="text-sm text-gray-500 mb-4">For anxiety or panic — anchor yourself to the present moment.</p>
            {gStep === null ? (
              <button onClick={() => setGStep(0)} className="w-full card p-6 flex items-center justify-center gap-3 hover:shadow-md transition-shadow">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M9.59 4.59A2 2 0 1113 6H2" stroke="#1A56DB" strokeWidth="1.8"/><path d="M2 12h20" stroke="#1A56DB" strokeWidth="1.8"/></svg>
                <span className="font-bold text-blue-600">Begin grounding exercise</span>
              </button>
            ) : (
              <div className="card p-6 animate-fade-in">
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-14 h-14 rounded-full bg-blue-500 flex items-center justify-center">
                    <span className="font-extrabold text-2xl text-white">{GROUND[gStep].n}</span>
                  </div>
                  <div>
                    <div className="font-display font-extrabold text-2xl text-blue-600">{GROUND[gStep].s}</div>
                    <div className="text-sm text-gray-500">Step {gStep + 1} of 5</div>
                  </div>
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">{GROUND[gStep].p}</p>
                <div className="flex items-center justify-between">
                  {gStep > 0 ? (
                    <button onClick={() => setGStep(gStep-1)} className="text-sm text-gray-400 hover:text-gray-600">← Back</button>
                  ) : <div/>}
                  {gStep < GROUND.length - 1 ? (
                    <button onClick={() => setGStep(gStep+1)} className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-6 py-2.5 rounded-xl transition-colors text-sm">Next →</button>
                  ) : (
                    <button onClick={() => setGStep(null)} className="bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-2.5 rounded-xl transition-colors text-sm">Done</button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
