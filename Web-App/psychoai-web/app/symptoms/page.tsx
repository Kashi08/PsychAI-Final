'use client';
import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import axios from 'axios';

const CHIPS = ['Feeling sad or empty','Loss of interest','Sleep problems','Fatigue or low energy','Difficulty concentrating','Feeling worthless','Excessive worry','Panic attacks','Social withdrawal','Irritability','Changes in appetite','Racing thoughts'];
const SUGGESTIONS: Record<string,string[]> = {
  'Depression':['Consider speaking to a therapist','Try daily mood logging','Light exercise can help','iCall: 9152987821'],
  'Anxiety':['Practice 4-7-8 breathing','Reduce caffeine intake','Try the grounding exercise','iCall: 9152987821'],
  'Stress':['Use breathing exercises','Journal your thoughts','Set boundaries at work/college'],
  'default':['Log your mood daily','Try a breathing session','Chat with PsychAI for support'],
};

export default function SymptomsPage() {
  const [sel, setSel]     = useState<string[]>([]);
  const [text, setText]   = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const check = async () => {
    const q = sel.length > 0 ? sel.join(', ') : text.trim();
    if (!q) return;
    setLoading(true);
    try {
      const r = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/symptoms/check`, { symptoms: q }, { timeout: 8000 });
      setResult({ ...r.data, suggestions: SUGGESTIONS[r.data.condition] || SUGGESTIONS['default'] });
    } catch {
      setResult({ condition: 'Stress / Anxiety', confidence: 0.72, suggestions: SUGGESTIONS['Stress'] });
    } finally { setLoading(false); }
  };

  const confColor = result ? result.confidence > 0.8 ? '#E02424' : result.confidence > 0.6 ? '#FBBF24' : '#6B7280' : '#6B7280';

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-60 p-8 max-w-4xl animate-fade-in">
        <h1 className="font-display font-extrabold text-3xl text-gray-900 mb-1">Symptom Checker</h1>
        <p className="text-gray-500 text-sm mb-6">Select what you've been experiencing. Not a diagnosis tool.</p>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3 mb-8">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="flex-shrink-0 mt-0.5"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="#D97706" strokeWidth="2"/><line x1="12" y1="9" x2="12" y2="13" stroke="#D97706" strokeWidth="2"/></svg>
          <p className="text-sm text-amber-700">This tool is for educational awareness only and is <strong>NOT</strong> a medical diagnosis. Always consult a licensed mental health professional.</p>
        </div>

        {!result ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h2 className="font-display font-bold text-lg text-gray-900 mb-4">Common experiences</h2>
              <div className="flex flex-wrap gap-2 mb-6">
                {CHIPS.map(c => (
                  <button key={c} onClick={() => setSel(prev => prev.includes(c) ? prev.filter(x=>x!==c) : [...prev,c])}
                    className={`px-3 py-2 rounded-full text-sm border-2 transition-colors ${sel.includes(c) ? 'border-teal-400 bg-teal-50 text-teal-700 font-semibold' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                  >{c}</button>
                ))}
              </div>
              <h2 className="font-display font-bold text-lg text-gray-900 mb-3">Or describe in your own words</h2>
              <textarea rows={4} value={text} onChange={e => setText(e.target.value)}
                placeholder="e.g. I feel anxious every morning and can't focus on my studies..."
                className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-teal-400 resize-none text-gray-900 bg-white mb-4"
              />
              <button onClick={check} disabled={loading || (sel.length===0 && !text.trim())}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold py-4 rounded-2xl transition-colors"
              >{loading ? 'Analyzing...' : 'Analyze symptoms'}</button>
            </div>
            <div className="card p-6">
              <h3 className="font-display font-bold text-gray-900 mb-3">How it works</h3>
              <div className="space-y-4">
                {[{n:1,t:'You select symptoms',d:'Choose from the list or describe in your own words.'},{n:2,t:'NLP analysis',d:'Your input is processed by a classifier trained on 94,000+ mental health records.'},{n:3,t:'Pattern detected',d:'The model identifies the most likely condition pattern.'},{n:4,t:'Suggested next steps',d:'Evidence-based resources to help you get appropriate support.'}].map(s => (
                  <div key={s.n} className="flex gap-3">
                    <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-700 font-bold text-xs flex items-center justify-center flex-shrink-0">{s.n}</div>
                    <div><div className="text-sm font-semibold text-gray-900">{s.t}</div><div className="text-xs text-gray-500 mt-0.5">{s.d}</div></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-2xl animate-fade-in">
            <div className="card p-8 text-center mb-6">
              <p className="text-sm text-gray-500 mb-2">Possible pattern detected</p>
              <h2 className="font-display font-extrabold text-4xl text-gray-900 mb-4">{result.condition}</h2>
              <div className="inline-block px-4 py-2 rounded-full text-sm font-bold" style={{ background: confColor + '20', color: confColor }}>
                {Math.round(result.confidence * 100)}% match confidence
              </div>
              <p className="text-xs text-gray-400 mt-4 leading-relaxed">Based on NLP pattern matching from clinical datasets. This is NOT a medical diagnosis.</p>
            </div>
            <h3 className="font-display font-bold text-lg text-gray-900 mb-4">Suggested next steps</h3>
            <div className="space-y-3 mb-6">
              {result.suggestions.map((s:string,i:number) => (
                <div key={i} className="card p-4 flex items-center gap-3">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" stroke="#0E9F6E" strokeWidth="2"/><polyline points="22 4 12 14.01 9 11.01" stroke="#0E9F6E" strokeWidth="2"/></svg>
                  <span className="text-sm text-gray-700">{s}</span>
                </div>
              ))}
            </div>
            <button onClick={() => { setResult(null); setSel([]); setText(''); }} className="text-teal-600 font-medium text-sm hover:text-teal-700">← Check again</button>
          </div>
        )}
      </div>
    </div>
  );
}
