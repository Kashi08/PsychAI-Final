'use client';
import { useState } from 'react';
import Link from 'next/link';

const ALERTS = [
  {
    id:'A001', patient:'Arjun Mehta', patient_id:'P001', risk:'HIGH',
    time:'Today, 2:16 PM', message:'I just want to disappear. Nothing matters.',
    keywords:['disappear','hopeless'], twilio_called:true, resolved:false, age:21,
  },
  {
    id:'A002', patient:'Sneha Joshi', patient_id:'P004', risk:'MED',
    time:'Today, 10:43 AM', message:"Can't sleep again. Third night. Feeling hopeless.",
    keywords:['hopeless',"can't sleep"], twilio_called:false, resolved:false, age:22,
  },
  {
    id:'A003', patient:'Priya Kapoor', patient_id:'P002', risk:'MED',
    time:'Yesterday, 4:02 PM', message:'Having a panic attack again. Heart racing.',
    keywords:['panic attack','heart racing'], twilio_called:false, resolved:true, age:19,
  },
];

export default function AlertsPage() {
  const [alerts, setAlerts] = useState(ALERTS);
  const [filter, setFilter] = useState<'all'|'unresolved'|'resolved'>('unresolved');
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; char: string }[]>([]);

  const resolve = (id: string, e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const emojis = ['✅', '✨', '🌟', '🛡️', '💚', '🎉'];
    const newParticles = Array.from({ length: 8 }).map((_, i) => ({
      id: Date.now() + i + Math.random(),
      x: e.clientX - rect.left + (Math.random() * 40 - 20),
      y: e.clientY - rect.top + (Math.random() * 20 - 10),
      char: emojis[Math.floor(Math.random() * emojis.length)],
    }));
    setParticles(prev => [...prev, ...newParticles]);
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)));
    }, 1200);

    setAlerts(prev => prev.map(a => a.id === id ? { ...a, resolved:true } : a));
  };

  const shown = alerts.filter(a => {
    if (filter === 'unresolved') return !a.resolved;
    if (filter === 'resolved')   return a.resolved;
    return true;
  });

  const unresolved = alerts.filter(a => !a.resolved).length;

  return (
    <div className="p-7 max-w-4xl mx-auto animate-fade">
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="font-display font-extrabold text-3xl text-gray-900"><span className="gradient-text">Crisis Alerts</span></h1>
          <p className="text-gray-500 text-sm mt-1">{unresolved} active alerts requiring attention</p>
        </div>
        {unresolved > 0 && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-2">
            <div className="relative">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              <div className="w-2 h-2 rounded-full bg-red-500 absolute inset-0 alert-ring"></div>
            </div>
            <span className="text-sm font-bold text-red-700">{unresolved} need attention</span>
          </div>
        )}
      </div>

      <div className="flex gap-2 mb-6">
        {(['all','unresolved','resolved'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold capitalize transition-all duration-200 ${filter===f?'bg-psych-500 text-white shadow-md shadow-psych-500/10 hover:bg-psych-600':'bg-white text-gray-500 border border-gray-200 hover:border-psych-300'}`}
          >{f}</button>
        ))}
      </div>

      <div className="space-y-4">
        {shown.map((a, idx) => (
          <div key={a.id} 
            className={`card p-5 border-l-4 hover:-translate-y-0.5 hover:shadow-md transition-all duration-300 animate-slide-up ${a.resolved?'border-l-gray-300 opacity-75':a.risk==='HIGH'?'border-l-red-500 hover:border-red-200':'border-l-amber-400 hover:border-amber-200'}`}
            style={{ animationDelay: `${idx * 50}ms` }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 transition-transform group-hover:scale-105 ${a.resolved?'bg-gray-100 text-gray-500':'bg-red-50 text-red-700'}`}>
                  {a.patient.split(' ').map(n=>n[0]).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <span className="font-bold text-gray-800 text-sm">{a.patient}</span>
                    <span className={`risk-${a.risk.toLowerCase()} text-xs font-bold px-2 py-0.5 rounded-full`}>{a.risk}</span>
                    {a.twilio_called && (
                      <span className="bg-blue-50 text-blue-700 border border-blue-200/50 text-[10px] font-bold uppercase tracking-wide px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.75 11" strokeLinecap="round"/></svg>
                        Guardian called
                      </span>
                    )}
                    {a.resolved && <span className="bg-green-50 text-green-700 text-[10px] font-bold uppercase tracking-wide px-2.5 py-0.5 rounded-full border border-green-200">Resolved</span>}
                  </div>
                  <p className="text-sm text-gray-700 bg-gray-50/60 rounded-2xl px-4 py-3 border border-gray-100/50 mb-3 italic font-medium">
                    "{a.message}"
                  </p>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400 font-bold">{a.time}</span>
                    <div className="flex gap-1.5">
                      {a.keywords.map(k => (
                        <span key={k} className="text-[10px] bg-red-50 text-red-600 px-2 py-0.5 rounded-full border border-red-100 font-bold">{k}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2 flex-shrink-0">
                {/* FIX: pass ?from=alerts so patient detail page back-link returns here */}
                <Link href={`/patients/${a.patient_id}?from=alerts`}
                  className="text-xs font-bold bg-psych-50 text-psych-700 hover:bg-psych-100 px-3.5 py-2 rounded-xl transition-all border border-psych-200/50 text-center hover:scale-[1.02] active:scale-[0.98] shadow-sm">
                  View patient
                </Link>
                {!a.resolved && (
                  <button onClick={(e) => resolve(a.id, e)}
                    className="text-xs font-bold bg-green-50 text-green-700 hover:bg-green-100 px-3.5 py-2 rounded-xl transition-all border border-green-200/50 hover:scale-[1.02] active:scale-[0.98] shadow-sm relative overflow-visible">
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
                    Mark resolved
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        {shown.length === 0 && (
          <div className="card p-12 text-center animate-spring">
            <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-bounce-slow">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" stroke="#0E9F6E" strokeWidth="2.5"/><polyline points="22 4 12 14.01 9 11.01" stroke="#0E9F6E" strokeWidth="2.5"/></svg>
            </div>
            <h3 className="font-display font-extrabold text-gray-900 mb-1">All clear</h3>
            <p className="text-gray-400 text-sm font-semibold">No alerts in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
}
