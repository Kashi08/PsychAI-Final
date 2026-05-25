'use client';
import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import axios from 'axios';

const CHIPS = [
  'Feeling sad or empty','Loss of interest','Sleep problems','Fatigue or low energy',
  'Difficulty concentrating','Feeling worthless','Excessive worry','Panic attacks',
  'Social withdrawal','Irritability','Changes in appetite','Racing thoughts',
  'Feeling happy','Feeling calm','Feeling grateful','Feeling excited',
];

// Keys must match EXACTLY what the model returns
const SUGGESTIONS: Record<string, string[]> = {
  'Positive Wellbeing': [
    'You\'re in a great place — keep nurturing your mental wellness!',
    'Maintain your routine: sleep well, eat well, stay active',
    'Share your positivity — it uplifts others around you',
    'Consider journaling to capture this feeling',
  ],
  'Anxiety / Panic Disorder': [
    'Practice 4-7-8 breathing (in 4, hold 4, out 8)',
    'Try the 5-4-3-2-1 grounding exercise in Mindfulness',
    'Reduce caffeine and screen time before bed',
    'iCall helpline: 9152987821',
  ],
  'Depression': [
    'Consider speaking to a therapist or counsellor',
    'Try daily mood logging in the Mood tab',
    'Light exercise (even a 10-min walk) can help',
    'iCall helpline: 9152987821',
  ],
  'Stress / Burnout': [
    'Use breathing exercises in the Mindfulness tab',
    'Journal your thoughts — offload the mental load',
    'Set small, achievable goals for today',
    'Talk to someone you trust',
  ],
  'Anger / Irritability Disorder': [
    'Try box breathing before reacting (in 4, hold 4, out 4, hold 4)',
    'Identify your triggers — journaling helps',
    'Physical activity can release pent-up frustration',
    'iCall helpline: 9152987821',
  ],
  'Insomnia / Sleep Disorder': [
    'Avoid screens 30 minutes before bed',
    'Try the 4-7-8 breathing technique at bedtime',
    'Keep a consistent sleep and wake time',
    'Write a worry list before bed to clear your mind',
  ],
  'Loneliness / Social Isolation': [
    'Reach out to one person today — a text is enough',
    'Join a club, class, or online community',
    'Chat with PsychAI — you\'re not alone',
    'iCall helpline: 9152987821',
  ],
  'Grief / Loss': [
    'Allow yourself to grieve — there\'s no timeline',
    'Talk to someone who knew the person you lost',
    'Consider grief counselling',
    'iCall helpline: 9152987821',
  ],
  'Trauma / PTSD': [
    'Trauma-focused therapy (EMDR, CBT) is very effective',
    'Ground yourself: name 5 things you can see right now',
    'Avoid re-exposing yourself to triggers unnecessarily',
    'iCall helpline: 9152987821',
  ],
  'Suicidal Ideation': [
    'Please call iCall RIGHT NOW: 9152987821',
    'You are not alone — help is available 24/7',
    'Go to your nearest hospital emergency if you feel unsafe',
    'Tell someone you trust how you are feeling',
  ],
  'OCD': [
    'ERP therapy (Exposure & Response Prevention) is the gold standard',
    'Avoid giving in to compulsions — delay them by 5 minutes',
    'Speak to a psychiatrist — OCD responds well to treatment',
    'iCall helpline: 9152987821',
  ],
  'Bipolar Disorder': [
    'Mood tracking daily is essential — use the Mood tab',
    'A psychiatrist can help with mood stabilisation',
    'Maintain a consistent sleep schedule',
    'iCall helpline: 9152987821',
  ],
  'Eating Disorder': [
    'Speak to a nutritionist and a therapist together',
    'National Alliance for Eating Disorders helpline for support',
    'Avoid diet culture content — curate your feed',
    'iCall helpline: 9152987821',
  ],
  'Substance Dependency': [
    'Speak to a doctor about a safe withdrawal plan',
    'Identify your triggers and avoid them where possible',
    'Support groups (AA, NA) can be very helpful',
    'iCall helpline: 9152987821',
  ],
  'ADHD': [
    'Break tasks into tiny steps with timers (Pomodoro technique)',
    'A psychiatrist can assess and advise on treatment',
    'Physical exercise significantly helps ADHD symptoms',
    'Use the Journal tab to track focus patterns',
  ],
  'default': [
    'Log your mood daily in the Mood tab',
    'Try a breathing session in Mindfulness',
    'Chat with PsychAI for personalised support',
    'iCall helpline: 9152987821',
  ],
};

// Color for confidence badge — green for positive, amber/red for concerns
function getBadgeColor(condition: string, confidence: number) {
  if (condition === 'Positive Wellbeing') return '#0E9F6E';
  if (confidence > 0.8) return '#E02424';
  if (confidence > 0.6) return '#FBBF24';
  return '#6B7280';
}

// Aesthetic SVG Icons for the results
function getConditionSvg(condition: string) {
  if (condition === 'Positive Wellbeing') {
    return (
      <svg className="w-16 h-16 mx-auto text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m11.314 11.314l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" fill="rgba(16,185,129,0.1)" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
  }
  if (condition === 'Suicidal Ideation') {
    return (
      <svg className="w-16 h-16 mx-auto text-red-600 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="9" fill="rgba(239,68,68,0.1)"/>
        <path d="M12 8v4m0 4h.01" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/>
        <circle cx="12" cy="12" r="4" strokeDasharray="3 3"/>
      </svg>
    );
  }
  if (condition.includes('Anxiety')) {
    return (
      <svg className="w-16 h-16 mx-auto text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 5a3 3 0 00-3 3v2a3 3 0 006 0V8a3 3 0 00-3-3z" fill="rgba(245,158,11,0.05)"/>
      </svg>
    );
  }
  if (condition === 'Depression') {
    return (
      <svg className="w-16 h-16 mx-auto text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M20 17.58A5 5 0 0018 8h-1.26A8 8 0 104 16.25" fill="rgba(99,102,241,0.1)" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M8 21v-2m4 2v-2m4 2v-2" strokeLinecap="round"/>
      </svg>
    );
  }
  if (condition.includes('Stress')) {
    return (
      <svg className="w-16 h-16 mx-auto text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="7" width="16" height="10" rx="2" fill="rgba(249,115,22,0.1)"/>
        <path d="M22 11v2" strokeLinecap="round" strokeWidth="2"/>
        <path d="M6 10l2 2-2 2m4-4l2 2-2 2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
  }
  if (condition.includes('Sleep') || condition.includes('Insomnia')) {
    return (
      <svg className="w-16 h-16 mx-auto text-violet-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" fill="rgba(139,92,246,0.1)" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M19 3v4M17 5h4" strokeLinecap="round"/>
      </svg>
    );
  }
  if (condition.includes('Anger')) {
    return (
      <svg className="w-16 h-16 mx-auto text-rose-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 01-14 0C5 14 6 13 6 12c.7 1.4 2 2 2.5 2.5z" fill="rgba(244,63,94,0.1)" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
  }
  if (condition.includes('Lonely') || condition.includes('Loneliness')) {
    return (
      <svg className="w-16 h-16 mx-auto text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 21a9 9 0 100-18 9 9 0 000 18z" fill="rgba(100,116,139,0.05)"/>
        <circle cx="12" cy="12" r="3" strokeDasharray="2 2"/>
      </svg>
    );
  }
  return (
    <svg className="w-16 h-16 mx-auto text-teal-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M9.5 2A2.5 2.5 0 0112 4.5v15a2.5 2.5 0 01-2.5 2.5M14.5 2a2.5 2.5 0 00-2.5 2.5v15a2.5 2.5 0 002.5 2.5" strokeLinecap="round"/>
      <path d="M12 4.5A4.5 4.5 0 007.5 9c0 1.5.8 2.8 2 3.5A4.5 4.5 0 009.5 22" fill="rgba(13,169,158,0.05)" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 4.5A4.5 4.5 0 0116.5 9c0 1.5-.8 2.8-2 3.5A4.5 4.5 0 0114.5 22" fill="rgba(13,169,158,0.05)" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export default function SymptomsPage() {
  const [sel, setSel]       = useState<string[]>([]);
  const [text, setText]     = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');

  const check = async () => {
    const q = sel.length > 0 ? sel.join(', ') : text.trim();
    if (!q) return;
    setLoading(true);
    setError('');
    try {
      const r = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/symptoms/check`,
        { symptoms: q },
        { timeout: 10000 }
      );
      const condition = r.data.condition as string;
      const suggestions = SUGGESTIONS[condition] ?? SUGGESTIONS['default'];
      setResult({ ...r.data, suggestions });
    } catch (err) {
      setError('Could not reach the server. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-mesh">
      <Sidebar />
      <div className="flex-1 md:ml-60 ml-0 min-h-screen pt-16 md:pt-0">
        <div className="p-8 max-w-5xl mx-auto w-full animate-fade-in">
        <h1 className="font-display font-extrabold text-3xl mb-1 flex items-center gap-2">
          <span className="gradient-text">Symptom Checker</span>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-teal-500">
            <path d="M12 4c-3.3 0-6 2.7-6 6 0 1.5.5 2.8 1.4 3.8C6.5 15.1 6 16.5 6 18c0 .6.4 1 1 1h10c.6 0 1-.4 1-1 0-1.5-.5-2.9-1.4-4.2.9-1 1.4-2.3 1.4-3.8 0-3.3-2.7-6-6-6zm0 13H8.2c.2-.5.5-1 .8-1.5C10 13.9 10.5 12 10.5 10c0-.8.7-1.5 1.5-1.5s1.5.7 1.5 1.5c0 2 .5 3.9 1.5 5.5.3.5.6 1 .8 1.5H12z" fill="currentColor"/>
          </svg>
        </h1>
        <p className="text-gray-500 text-sm mb-6">Select what you've been experiencing. Not a diagnosis tool.</p>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3 mb-8">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="flex-shrink-0 mt-0.5">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="#D97706" strokeWidth="2"/>
            <line x1="12" y1="9" x2="12" y2="13" stroke="#D97706" strokeWidth="2"/>
          </svg>
          <p className="text-sm text-amber-700">
            This tool is for educational awareness only and is <strong>NOT</strong> a medical diagnosis.
            Always consult a licensed mental health professional.
          </p>
        </div>

        {!result ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h2 className="font-display font-bold text-lg text-gray-900 mb-4">Common experiences</h2>
              <div className="flex flex-wrap gap-2 mb-6">
                {CHIPS.map(c => (
                  <button
                    key={c}
                    onClick={() => setSel(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c])}
                    className={`px-3 py-2 rounded-full text-sm border-2 transition-colors ${
                      sel.includes(c)
                        ? 'border-teal-400 bg-teal-50 text-teal-700 font-semibold'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >{c}</button>
                ))}
              </div>

              <h2 className="font-display font-bold text-lg text-gray-900 mb-3">Or describe in your own words</h2>
              <textarea
                rows={4}
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="e.g. I feel happy today / I feel anxious every morning..."
                className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-teal-400 resize-none text-gray-900 bg-white mb-4"
              />

              {error && (
                <div className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  {error}
                </div>
              )}

              <button
                onClick={check}
                disabled={loading || (sel.length === 0 && !text.trim())}
                className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white font-bold py-4 rounded-2xl transition-colors"
              >
                {loading ? 'Analyzing…' : 'Analyze symptoms'}
              </button>
            </div>

            <div className="card p-6">
              <h3 className="font-display font-bold text-gray-900 mb-3">How it works</h3>
              <div className="space-y-4">
                {[
                  { n: 1, t: 'You select symptoms', d: 'Choose from the list or describe in your own words — including positive feelings!' },
                  { n: 2, t: 'NLP analysis', d: 'Your input is processed by a classifier trained on mental health records across 15 conditions.' },
                  { n: 3, t: 'Pattern detected', d: 'The model identifies the most likely condition — including Positive Wellbeing.' },
                  { n: 4, t: 'Suggested next steps', d: 'Evidence-based resources tailored to the detected pattern.' },
                ].map(s => (
                  <div key={s.n} className="flex gap-3">
                    <div className="w-7 h-7 rounded-full bg-teal-50 text-teal-700 font-bold text-xs flex items-center justify-center flex-shrink-0">{s.n}</div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">{s.t}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{s.d}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-2xl animate-fade-in">
            <div className="card p-8 text-center mb-6">
              <div className="mb-3">{getConditionSvg(result.condition)}</div>
              <p className="text-sm text-gray-500 mb-2">Possible pattern detected</p>
              <h2 className="font-display font-extrabold text-4xl text-gray-900 mb-4">{result.condition}</h2>
              <div
                className="inline-block px-4 py-2 rounded-full text-sm font-bold"
                style={{
                  background: getBadgeColor(result.condition, result.confidence) + '20',
                  color: getBadgeColor(result.condition, result.confidence),
                }}
              >
                {Math.round(result.confidence * 100)}% match confidence
              </div>
              <p className="text-xs text-gray-400 mt-4 leading-relaxed">
                Based on NLP pattern matching. This is NOT a medical diagnosis.
              </p>
            </div>

            <h3 className="font-display font-bold text-lg text-gray-900 mb-4">Suggested next steps</h3>
            <div className="space-y-3 mb-6">
              {result.suggestions.map((s: string, i: number) => (
                <div key={i} className="card p-4 flex items-center gap-3">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" stroke="#0E9F6E" strokeWidth="2"/>
                    <polyline points="22 4 12 14.01 9 11.01" stroke="#0E9F6E" strokeWidth="2"/>
                  </svg>
                  <span className="text-sm text-gray-700">{s}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => { setResult(null); setSel([]); setText(''); setError(''); }}
              className="text-teal-600 font-medium text-sm hover:text-teal-700"
            >← Check again</button>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}