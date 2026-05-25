'use client';
import { useState, useEffect, useRef } from 'react';
import Sidebar from '@/components/Sidebar';
import { ZenAudioSynthesizer } from '@/lib/synth';

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

  // Zen Synthesizer State
  const [synthPlaying, setSynthPlaying] = useState(false);
  const [bowlStriking, setBowlStriking] = useState(false);
  const [volumes, setVolumes] = useState({ ocean: 0.3, rain: 0.2, binaural: 0.15, master: 0.8 });
  const synthRef = useRef<ZenAudioSynthesizer | null>(null);

  useEffect(() => {
    synthRef.current = new ZenAudioSynthesizer();
    return () => {
      synthRef.current?.stop();
    };
  }, []);

  const toggleSynth = () => {
    if (!synthRef.current) return;
    if (synthPlaying) {
      synthRef.current.stop();
      setSynthPlaying(false);
    } else {
      synthRef.current.play();
      synthRef.current.setVolume('ocean', volumes.ocean);
      synthRef.current.setVolume('rain', volumes.rain);
      synthRef.current.setVolume('binaural', volumes.binaural);
      synthRef.current.setVolume('master', volumes.master);
      setSynthPlaying(true);
    }
  };

  const handleVolumeChange = (channel: string, val: number) => {
    setVolumes(prev => ({ ...prev, [channel]: val }));
    synthRef.current?.setVolume(channel, val);
  };

  const strikeBowl = () => {
    if (!synthRef.current) return;
    setBowlStriking(true);
    synthRef.current.strikeSoundBowl();
    setTimeout(() => setBowlStriking(false), 5000);
  };

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
    <div className="flex min-h-screen bg-gradient-mesh">
      <Sidebar />
      <div className="flex-1 md:ml-60 ml-0 min-h-screen pt-16 md:pt-0">
        <div className="p-8 max-w-5xl mx-auto w-full animate-fade-in">
        <h1 className="font-display font-extrabold text-3xl mb-1 flex items-center gap-2">
          <span className="gradient-text">Mindfulness</span>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-teal-500">
            <path d="M9.59 4.59A2 2 0 1113 6H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M11.37 17.59A2 2 0 1115 19H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M14.59 10.59A2 2 0 1118 12H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </h1>
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
            <div className="card tilt-card p-8 flex flex-col items-center relative overflow-hidden float-card-2">
              {running && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute w-2 h-2 rounded-full bg-teal-400/30 animate-ping" style={{ top: '15%', left: '25%', animationDuration: '4s' }}></div>
                  <div className="absolute w-1.5 h-1.5 rounded-full bg-blue-400/40 animate-pulse" style={{ top: '75%', left: '80%', animationDuration: '5s' }}></div>
                  <div className="absolute w-2 h-2 rounded-full bg-emerald-400/30 animate-ping" style={{ top: '85%', left: '15%', animationDuration: '6s' }}></div>
                  <div className="absolute w-2.5 h-2.5 rounded-full bg-teal-400/20 animate-pulse" style={{ top: '25%', left: '75%', animationDuration: '3.5s' }}></div>
                </div>
              )}

              {done ? (
                <div className="text-center py-4 animate-pop-up">
                  <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-100 shadow-sm animate-bounce">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" stroke="#0E9F6E" strokeWidth="2.5"/><polyline points="22 4 12 14.01 9 11.01" stroke="#0E9F6E" strokeWidth="2.5"/></svg>
                  </div>
                  <h3 className="font-display font-extrabold text-xl text-gray-900 mb-1">Session complete</h3>
                  <p className="text-sm text-green-600 font-bold mb-4">4 cycles completed · +15 XP</p>
                  <button onClick={() => setDone(false)} className="text-sm text-teal-600 font-bold hover:text-teal-700 underline underline-offset-4 decoration-2">Go again?</button>
                </div>
              ) : (
                <>
                  <div className="relative w-48 h-48 flex items-center justify-center mb-6">
                    {/* Breathing bubble */}
                    <div 
                      className={`w-36 h-36 rounded-full flex items-center justify-center relative transition-transform ease-in-out`}
                      style={{
                        transform: `scale(${
                          !running ? 0.95 :
                          phase === 'inhale' ? 1.25 :
                          phase === 'hold' ? 1.25 :
                          0.8
                        })`,
                        transitionDuration: !running ? '0.5s' : `${DURATIONS[phase]}s`,
                        background: pat.bg,
                        boxShadow: `0 0 35px ${pat.color}35, inset 0 0 25px ${pat.color}25`,
                        border: `2px solid ${pat.color}40`,
                        animation: running && phase === 'hold' ? 'blink 2s ease-in-out infinite' : undefined,
                      }}
                    >
                      {/* Pulse Ring Indicator */}
                      {running && (
                        <div 
                          className="absolute inset-0 rounded-full animate-ping opacity-25"
                          style={{ border: `3px solid ${pat.color}` }}
                        ></div>
                      )}
                      
                      <div className="text-center z-10">
                        <div className="font-extrabold text-sm mb-0.5 tracking-wide transition-all uppercase" style={{ color: pat.color }}>
                          {LABELS[phase]}
                        </div>
                        {running && (
                          <div className="font-display font-black text-4xl animate-pop-up" style={{ color: pat.color }}>
                            {count}
                          </div>
                        )}
                        {!running && (
                          <div className="text-gray-400 text-xs font-bold">4 cycles</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {running && (
                    <div className="flex gap-2 mb-6">
                      {[0,1,2,3].map(i => (
                        <div 
                          key={i} 
                          className="w-3.5 h-3.5 rounded-full border-2 transition-all duration-300" 
                          style={{ 
                            background: i < cycles ? pat.color : 'transparent', 
                            borderColor: pat.color,
                            transform: i === cycles ? 'scale(1.2)' : 'scale(1)',
                          }}
                        ></div>
                      ))}
                    </div>
                  )}
                  
                  <button onClick={running ? stop : start}
                    className="px-12 py-3.5 rounded-full font-bold text-sm transition-all duration-300 transform active:scale-95 shadow-md hover:shadow-lg"
                    style={{ 
                      background: running ? '#FDE8E8' : pat.color, 
                      color: running ? '#E02424' : 'white',
                      boxShadow: running ? '0 4px 12px rgba(224, 36, 36, 0.15)' : `0 4px 12px ${pat.color}30`
                    }}
                  >
                    {running ? 'Stop Session' : 'Start Session'}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Grounding and Ambient Sound Mixer */}
          <div className="space-y-6">
            {/* Zen Ambient Sound Mixer Card */}
            <div className="card p-6 relative overflow-hidden transition-all duration-300 hover:shadow-md">
              {/* Glowing theme spots */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--theme-primary)]/5 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-display font-extrabold text-lg text-gray-900 flex items-center gap-2">
                    Zen Ambient Mixer
                    {synthPlaying && (
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--theme-primary)] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--theme-primary)]"></span>
                      </span>
                    )}
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">Synthesize organic binaural beats and nature wave swells.</p>
                </div>
                <button
                  onClick={toggleSynth}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 active:scale-90 shadow-md ${
                    synthPlaying
                      ? 'bg-red-500 text-white shadow-red-500/25 hover:bg-red-600'
                      : 'bg-[var(--theme-primary)] text-white shadow-[var(--theme-primary)]/20 hover:scale-105'
                  }`}
                  title={synthPlaying ? "Pause Audio" : "Play Ambient Mix"}
                >
                  {synthPlaying ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="4" y="4" width="16" height="16" rx="2" /></svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="5 3 19 12 5 21 5 3" fill="currentColor"/></svg>
                  )}
                </button>
              </div>

              {/* Visual Equalizer Bars */}
              <div className="flex items-end justify-center gap-1 h-6 mb-6">
                {[...Array(16)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-1 rounded-full bg-[var(--theme-primary)] transition-all duration-300 ${
                      synthPlaying ? 'opacity-80' : 'opacity-20'
                    }`}
                    style={{
                      height: synthPlaying ? `${Math.floor(Math.sin((i + Date.now()/1000) * 1.5) * 10 + 12)}px` : '4px',
                      animation: synthPlaying ? 'float 0.8s ease-in-out infinite alternate' : undefined,
                      animationDelay: `${i * 0.05}s`
                    }}
                  />
                ))}
              </div>

              <div className="space-y-4">
                {/* Ocean Waves Volume */}
                <div>
                  <div className="flex justify-between text-xs font-extrabold text-gray-600 mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><path d="M2 6c.6 0 1.2-.2 1.7-.6l2-1.8c.8-.8 2.1-.8 2.9 0l2 1.8c.5.4 1.1.6 1.7.6s1.2-.2 1.7-.6l2-1.8c.8-.8 2.1-.8 2.9 0l2 1.8c.5.4 1.1.6 1.7.6"/><path d="M2 12c.6 0 1.2-.2 1.7-.6l2-1.8c.8-.8 2.1-.8 2.9 0l2 1.8c.5.4 1.1.6 1.7.6s1.2-.2 1.7-.6l2-1.8c.8-.8 2.1-.8 2.9 0l2 1.8c.5.4 1.1.6 1.7.6"/><path d="M2 18c.6 0 1.2-.2 1.7-.6l2-1.8c.8-.8 2.1-.8 2.9 0l2 1.8c.5.4 1.1.6 1.7.6s1.2-.2 1.7-.6l2-1.8c.8-.8 2.1-.8 2.9 0l2 1.8c.5.4 1.1.6 1.7.6"/></svg>
                      Ocean Swell (Modulated)
                    </span>
                    <span>{Math.round(volumes.ocean * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={volumes.ocean}
                    onChange={e => handleVolumeChange('ocean', parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[var(--theme-primary)] transition-all duration-200"
                  />
                </div>

                {/* Rain Volume */}
                <div>
                  <div className="flex justify-between text-xs font-extrabold text-gray-600 mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M16 14v6"/><path d="M8 14v6"/><path d="M12 16v6"/></svg>
                      Gentle Rain (Filtered)
                    </span>
                    <span>{Math.round(volumes.rain * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={volumes.rain}
                    onChange={e => handleVolumeChange('rain', parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[var(--theme-primary)] transition-all duration-200"
                  />
                </div>

                {/* Binaural beats Volume */}
                <div>
                  <div className="flex justify-between text-xs font-extrabold text-gray-600 mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-pink-500"><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/><path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/><path d="M17.599 6.5a3 3 0 0 0 .399-1.375"/></svg>
                      Binaural Focus (6Hz Theta wave)
                    </span>
                    <span>{Math.round(volumes.binaural * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={volumes.binaural}
                    onChange={e => handleVolumeChange('binaural', parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[var(--theme-primary)] transition-all duration-200"
                  />
                </div>

                {/* Master Volume */}
                <div>
                  <div className="flex justify-between text-xs font-extrabold text-gray-600 mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>
                      Master Volume
                    </span>
                    <span>{Math.round(volumes.master * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={volumes.master}
                    onChange={e => handleVolumeChange('master', parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[var(--theme-primary)] transition-all duration-200"
                  />
                </div>

                {/* Master Chime Bowl Trigger */}
                <div className="pt-2">
                  <button
                    onClick={strikeBowl}
                    className={`w-full py-3.5 px-4 rounded-xl border font-bold text-xs transition-all active:scale-98 flex items-center justify-center gap-2 relative overflow-hidden ${
                      bowlStriking
                        ? 'bg-amber-50 border-amber-200 text-amber-700 shadow-sm'
                        : 'bg-white border-gray-100 hover:border-gray-200 hover:bg-gray-50/50 text-gray-700'
                    }`}
                  >
                    {bowlStriking && (
                      <span className="absolute inset-0 bg-amber-500/5 animate-ping pointer-events-none rounded-xl" />
                    )}
                    <span className={`flex items-center justify-center w-5 h-5 ${bowlStriking ? 'animate-spin' : ''}`}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
                    </span>
                    <span>Strike Tibetan Singing Bowl</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 5-4-3-2-1 Grounding Card */}
            <div>
              <h2 className="font-display font-bold text-lg text-gray-900 mb-3">5-4-3-2-1 Grounding</h2>
              <p className="text-xs text-gray-500 mb-4">For anxiety or panic — anchor yourself to the present moment.</p>
              {gStep === null ? (
                <button onClick={() => setGStep(0)} className="w-full card p-6 flex items-center justify-center gap-3 hover:shadow-md transition-shadow">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-teal-600"><path d="M9.59 4.59A2 2 0 1113 6H2" stroke="currentColor" strokeWidth="1.8"/><path d="M2 12h20" stroke="currentColor" strokeWidth="1.8"/></svg>
                  <span className="font-bold text-teal-600 text-sm">Begin grounding exercise</span>
                </button>
              ) : (
                <div className="card p-6 animate-fade-in">
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-14 h-14 rounded-full bg-teal-500 flex items-center justify-center flex-shrink-0">
                      <span className="font-extrabold text-2xl text-white">{GROUND[gStep].n}</span>
                    </div>
                    <div>
                      <div className="font-display font-extrabold text-2xl text-teal-600">{GROUND[gStep].s}</div>
                      <div className="text-sm text-gray-500">Step {gStep + 1} of 5</div>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-6 leading-relaxed text-sm">{GROUND[gStep].p}</p>
                  <div className="flex items-center justify-between">
                    {gStep > 0 ? (
                      <button onClick={() => setGStep(gStep-1)} className="text-sm text-gray-400 hover:text-gray-600">← Back</button>
                    ) : <div/>}
                    {gStep < GROUND.length - 1 ? (
                      <button onClick={() => setGStep(gStep+1)} className="bg-teal-500 hover:bg-teal-600 text-white font-bold px-6 py-2.5 rounded-xl transition-colors text-sm">Next →</button>
                    ) : (
                      <button onClick={() => setGStep(null)} className="bg-teal-500 hover:bg-teal-600 text-white font-bold px-6 py-2.5 rounded-xl transition-colors text-sm">Done</button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
