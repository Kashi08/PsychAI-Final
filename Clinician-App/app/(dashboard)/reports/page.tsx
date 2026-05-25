'use client';
import { useState } from 'react';

const PATIENTS = [
  { id:'P001', name:'Arjun Mehta',   risk:'HIGH', sessions:8,  wellness:22, phq9:19, gad7:12, diagnosis:'Depression + Suicidal ideation' },
  { id:'P002', name:'Priya Kapoor',  risk:'MED',  sessions:5,  wellness:45, phq9:9,  gad7:16, diagnosis:'Generalized Anxiety Disorder' },
  { id:'P003', name:'Arun Tiwari',   risk:'LOW',  sessions:12, wellness:78, phq9:5,  gad7:4,  diagnosis:'Work-related stress' },
  { id:'P004', name:'Sneha Joshi',   risk:'MED',  sessions:7,  wellness:41, phq9:12, gad7:10, diagnosis:'Insomnia + Depression' },
  { id:'P005', name:'Dev Sharma',    risk:'LOW',  sessions:20, wellness:82, phq9:3,  gad7:2,  diagnosis:'Adjustment disorder' },
];

const RANGE_LABELS: Record<string,string> = {
  last7:'Last 7 days', last30:'Last 30 days', last90:'Last 3 months', all:'All time',
};

const PAST_REPORTS = [
  { name:'Monthly report — March 2026', date:'Apr 1, 2026', pages:6, patients:5 },
  { name:'Arjun Mehta — Progress report', date:'Mar 15, 2026', pages:3, patients:1 },
  { name:'Monthly report — February 2026', date:'Mar 1, 2026', pages:5, patients:4 },
];

export default function ReportsPage() {
  const [selected, setSelected]   = useState('');
  const [dateRange, setDateRange] = useState('last30');
  const [sections, setSections]   = useState([
    'Mood trends','Journal highlights','Chat summaries','Crisis events','PHQ-9 / GAD-7 scores','AI clinical summary',
  ]);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated]   = useState(false);
  const [progressVal, setProgressVal] = useState(0);
  const [stepText, setStepText]       = useState('');
  const [stepIcon, setStepIcon]       = useState<React.ReactNode>(null);

  const toggleSection = (s: string) =>
    setSections(prev => prev.includes(s) ? prev.filter(x=>x!==s) : [...prev,s]);

  const generate = async () => {
    setGenerating(true);
    setGenerated(false);
    
    const steps = [
      { pct: 20, text: "Scanning clinical wellness index...", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> },
      { pct: 45, text: "Compiling Weekly PHQ-9 & GAD-7 trends...", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> },
      { pct: 70, text: "Analysing patient sentiment log layers...", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg> },
      { pct: 90, text: "Synthesizing clinical summary data...", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9.5 2A2.5 2.5 0 0112 4.5v15a2.5 2.5 0 01-2.5 2.5M14.5 2A2.5 2.5 0 0012 4.5v15a2.5 2.5 0 002.5 2.5"/><path d="M12 4.5A4.5 4.5 0 007.5 9c0 1.5.8 2.8 2 3.5A4.5 4.5 0 009.5 22"/><path d="M12 4.5A4.5 4.5 0 0116.5 9c0 1.5-.8 2.8-2 3.5A4.5 4.5 0 0114.5 22"/></svg> },
      { pct: 100, text: "Formulating clean export report document...", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> }
    ];

    for (const step of steps) {
      setStepText(step.text);
      setStepIcon(step.icon);
      // smoothly increase progress
      let current = progressVal;
      while (current < step.pct) {
        current += 2;
        setProgressVal(Math.min(current, 100));
        await new Promise(r => setTimeout(r, 25));
      }
      await new Promise(r => setTimeout(r, 150));
    }

    setGenerating(false);
    setGenerated(true);
  };

  // FIX: actually generate and download a report as HTML
  const downloadReport = () => {
    const covered = selected ? PATIENTS.filter(p=>p.id===selected) : PATIENTS;
    const rangeLabel = RANGE_LABELS[dateRange];
    const now = new Date().toLocaleDateString('en-US', { month:'long', day:'numeric', year:'numeric' });

    const rows = covered.map(p => `
      <tr>
        <td>${p.name}</td>
        <td><span class="risk risk-${p.risk.toLowerCase()}">${p.risk}</span></td>
        <td>${p.diagnosis}</td>
        <td>${p.sessions}</td>
        <td>${p.wellness}%</td>
        <td>${p.phq9}</td>
        <td>${p.gad7}</td>
      </tr>`).join('');

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>PsychAI Report — ${now}</title>
<style>
  body { font-family: 'Segoe UI', sans-serif; color: #111827; margin: 40px; background: #fff; }
  h1   { color: #7C6FCD; font-size: 24px; margin-bottom: 4px; }
  .meta { color: #6B7280; font-size: 13px; margin-bottom: 32px; }
  h2   { font-size: 16px; color: #374151; border-bottom: 2px solid #EDE9F8; padding-bottom: 6px; margin-top: 28px; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; margin-top: 12px; }
  th   { background: #F5F3FF; color: #5E51B5; text-align: left; padding: 10px 12px; font-size: 11px; text-transform: uppercase; letter-spacing: .05em; }
  td   { padding: 10px 12px; border-bottom: 1px solid #F3F4F6; }
  tr:hover td { background: #F9F8FF; }
  .risk { padding: 2px 8px; border-radius: 99px; font-weight: 700; font-size: 11px; }
  .risk-high { background:#FDE8E8; color:#9B1C1C; }
  .risk-med  { background:#FEF3C7; color:#92400E; }
  .risk-low  { background:#DEF7EC; color:#065F46; }
  .footer { margin-top: 48px; font-size: 11px; color: #9CA3AF; border-top: 1px solid #E5E7EB; padding-top: 12px; }
  .included { background:#F0EDFB; border-radius:8px; padding:12px 16px; margin-top:12px; }
  .included span { display:inline-block; background:#7C6FCD; color:white; border-radius:99px; font-size:11px; padding:2px 10px; margin:2px; }
</style>
</head>
<body>
<h1>PsychAI Clinical Report</h1>
<p class="meta">Generated: ${now} &nbsp;·&nbsp; Period: ${rangeLabel} &nbsp;·&nbsp; Patients: ${covered.length}</p>

<h2>Included Sections</h2>
<div class="included">
  ${sections.map(s=>`<span>${s}</span>`).join(' ')}
</div>

<h2>Patient Summary</h2>
<table>
  <thead>
    <tr>
      <th>Name</th><th>Risk</th><th>Diagnosis</th><th>Sessions</th>
      <th>Wellness</th><th>PHQ-9</th><th>GAD-7</th>
    </tr>
  </thead>
  <tbody>${rows}</tbody>
</table>

<h2>Crisis Events</h2>
<p style="font-size:13px;color:#374151;">
  ${covered.some(p=>p.risk==='HIGH')
    ? 'HIGH risk patients detected. Please review individual crisis logs in the PsychAI dashboard.'
    : 'No high-risk patients in this report period.'}
</p>

<h2>Aggregate Statistics</h2>
<table>
  <thead><tr><th>Metric</th><th>Value</th></tr></thead>
  <tbody>
    <tr><td>Average wellness score</td><td>${Math.round(covered.reduce((s,p)=>s+p.wellness,0)/covered.length)}%</td></tr>
    <tr><td>Total sessions (period)</td><td>${covered.reduce((s,p)=>s+p.sessions,0)}</td></tr>
    <tr><td>Average PHQ-9</td><td>${(covered.reduce((s,p)=>s+p.phq9,0)/covered.length).toFixed(1)}</td></tr>
    <tr><td>Average GAD-7</td><td>${(covered.reduce((s,p)=>s+p.gad7,0)/covered.length).toFixed(1)}</td></tr>
    <tr><td>High-risk patients</td><td>${covered.filter(p=>p.risk==='HIGH').length}</td></tr>
  </tbody>
</table>

<div class="footer">
  Confidential — PsychAI · This report is for clinical use only · ${now}
</div>
</body>
</html>`;

    const blob = new Blob([html], { type:'text/html' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `PsychAI_Report_${new Date().toISOString().slice(0,10)}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-7 max-w-4xl mx-auto animate-fade">
      <div className="mb-7">
        <h1 className="font-display font-extrabold text-3xl text-gray-900"><span className="gradient-text">Reports</span></h1>
        <p className="text-gray-500 text-sm mt-1">Generate patient progress reports</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Report builder */}
        <div className="card p-6">
          <h2 className="font-display font-bold text-gray-900 mb-5">Generate report</h2>
          <div className="space-y-4.5">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Select patient</label>
              <select value={selected} onChange={e=>{ setSelected(e.target.value); setGenerated(false); }}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-psych-500 bg-gray-50/60 focus:bg-white transition-all text-gray-900 font-medium">
                <option value="">All patients</option>
                {PATIENTS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Date range</label>
              <select value={dateRange} onChange={e=>{ setDateRange(e.target.value); setGenerated(false); }}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-psych-500 bg-gray-50/60 focus:bg-white transition-all text-gray-900 font-medium">
                <option value="last7">Last 7 days</option>
                <option value="last30">Last 30 days</option>
                <option value="last90">Last 3 months</option>
                <option value="all">All time</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Include sections</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {['Mood trends','Journal highlights','Chat summaries','Crisis events','PHQ-9 / GAD-7 scores','AI clinical summary'].map(s => (
                  <label key={s} className="flex items-center gap-2.5 cursor-pointer group">
                    <input type="checkbox" checked={sections.includes(s)} onChange={()=>toggleSection(s)}
                      className="w-4.5 h-4.5 accent-psych-500 rounded border-gray-200 focus:ring-psych-500/20"/>
                    <span className="text-xs text-gray-600 font-bold group-hover:text-gray-900 transition-colors">{s}</span>
                  </label>
                ))}
              </div>
            </div>
            <button onClick={generate} disabled={generating}
              className="w-full mt-6 bg-psych-500 hover:bg-psych-600 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all shadow-md shadow-psych-500/10 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2">
              {generating ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>Generating...</>
              ) : (
                <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>Generate report</>
              )}
            </button>
          </div>
        </div>

        {/* Preview / download */}
        <div className="card p-6 flex flex-col justify-between min-h-[350px]">
          <div>
            <h2 className="font-display font-bold text-gray-900 mb-5">Report preview</h2>
            
            {generating && (
              <div className="animate-spring p-5 border border-psych-100 bg-psych-50/40 rounded-2xl">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[11px] font-bold text-psych-700 uppercase tracking-wider">Sediment Analysis</span>
                  <span className="text-xs font-black text-psych-700">{progressVal}%</span>
                </div>
                
                {/* Progress bar container */}
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden mb-4 border border-gray-200/45">
                  <div className="h-full bg-gradient-to-r from-psych-400 to-psych-600 transition-all duration-150 ease-out" style={{ width: `${progressVal}%` }}></div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-4 h-4 border-2 border-psych-500 border-t-transparent rounded-full animate-spin flex-shrink-0"></div>
                  <span className="text-psych-500 animate-pulse">{stepIcon}</span>
                  <span className="text-xs font-bold text-gray-700 animate-pulse">{stepText}</span>
                </div>
              </div>
            )}

            {generated && !generating && (
              <div className="animate-fade">
                <div className="bg-psych-50 border border-psych-200/50 rounded-2xl p-4.5 mb-4 shadow-inner">
                  <div className="flex items-center gap-3.5 mb-3.5">
                    <div className="w-10 h-10 bg-psych-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md shadow-psych-500/10">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    </div>
                    <div>
                      <div className="font-bold text-psych-800 text-xs truncate max-w-[200px]">
                        PsychAI_Report_{new Date().toISOString().slice(0,10)}.html
                      </div>
                      <div className="text-[10px] text-psych-500 font-extrabold uppercase tracking-wide mt-0.5">Generated just now · {selected ? '1' : '5'} patients</div>
                    </div>
                  </div>
                  <div className="text-xs text-psych-700 space-y-1.5 font-bold">
                    <div className="flex justify-between"><span>Patients covered</span><span className="text-gray-900 bg-white border border-gray-100 rounded px-1.5">{selected ? '1' : '5'}</span></div>
                    <div className="flex justify-between"><span>Date range</span><span className="text-gray-900 bg-white border border-gray-100 rounded px-1.5">{RANGE_LABELS[dateRange]}</span></div>
                    <div className="flex justify-between"><span>Sections included</span><span className="text-gray-900 bg-white border border-gray-100 rounded px-1.5">{sections.length}</span></div>
                  </div>
                </div>
                <button onClick={downloadReport}
                  className="w-full border border-psych-300 text-psych-700 hover:bg-psych-50 font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] shadow-sm">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" strokeLinecap="round"/>
                    <polyline points="7 10 12 15 17 10" strokeLinecap="round"/>
                    <line x1="12" y1="15" x2="12" y2="3" strokeLinecap="round"/>
                  </svg>
                  Download report
                </button>
              </div>
            )}

            {!generated && !generating && (
              <div className="text-center py-16 text-gray-400">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="mx-auto mb-3 opacity-30">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="currentColor" strokeWidth="1.5"/>
                  <polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="1.5"/>
                  <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <p className="text-sm font-semibold">Configure and generate a report to preview it here</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Past reports */}
      <div className="card p-6 mt-6">
        <h2 className="font-display font-bold text-gray-900 mb-4">Past reports</h2>
        <div className="space-y-3">
          {PAST_REPORTS.map((r, idx) => (
            <div key={r.name} 
              className="flex items-center justify-between p-4 bg-gray-50/60 hover:bg-gray-50 rounded-2xl border border-gray-100/50 hover:border-gray-200/50 transition-all hover-float animate-slide-up"
              style={{ animationDelay: `${idx * 40}ms` }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-psych-100/80 rounded-xl flex items-center justify-center shadow-sm">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--psych-600)" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                </div>
                <div>
                  <div className="font-bold text-gray-800 text-sm">{r.name}</div>
                  <div className="text-xs text-gray-400 font-semibold mt-0.5">{r.date} · {r.pages} pages · {r.patients} patient{r.patients>1?'s':''}</div>
                </div>
              </div>
              <button
                onClick={() => {
                  const blob = new Blob(
                    [`<html><body><h1>${r.name}</h1><p>Report date: ${r.date}</p><p>${r.patients} patients · ${r.pages} pages</p><p><em>This is a placeholder for the archived report.</em></p></body></html>`],
                    { type:'text/html' }
                  );
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = r.name.replace(/[^a-z0-9]/gi,'_') + '.html';
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="text-xs font-bold text-psych-600 hover:text-psych-800 border border-psych-200 hover:border-psych-300 px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 hover:bg-white shadow-sm">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Download
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
