'use client';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-100 max-w-6xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center">
            <BrainIcon />
          </div>
          <span className="font-display font-extrabold text-xl text-gray-900">PsychAI</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/auth/login" className="text-sm text-gray-500 hover:text-gray-900 font-medium px-4 py-2">
            Sign in
          </Link>
          <Link href="/auth/login" className="text-sm font-bold text-white bg-teal-500 hover:bg-teal-600 px-5 py-2 rounded-full transition-colors">
            Get started free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center animate-fade-in">
        <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-700 text-sm font-semibold px-4 py-2 rounded-full mb-8 border border-teal-100">
          <div className="w-2 h-2 rounded-full bg-teal-500 blink"></div>
          AI-powered · Completely private · Free to use
        </div>
        <h1 className="font-display font-extrabold text-5xl md:text-6xl text-gray-900 leading-tight mb-6">
          Your mental wellness<br />
          <span className="text-teal-500">companion</span>
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          PsychAI combines Claude AI with clinical NLP models to give you empathetic support, mood tracking, CBT journaling, and crisis detection   all in one safe space.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/auth/login" className="w-full sm:w-auto bg-teal-500 hover:bg-teal-600 text-white font-bold text-base px-8 py-4 rounded-2xl transition-colors shadow-md">
            Start for free
          </Link>
          <Link href="/auth/login?demo=true" className="w-full sm:w-auto border-2 border-gray-200 hover:border-teal-300 text-gray-700 font-bold text-base px-8 py-4 rounded-2xl transition-colors">
            Try demo account
          </Link>
        </div>
        <p className="text-xs text-gray-400 mt-4">No signup required for demo</p>
      </section>

      {/* Features grid */}
      <section className="max-w-5xl mx-auto px-6 pb-20 animate-fade-in-delay">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f) => (
            <div key={f.title} className="card p-6 hover:shadow-md transition-shadow">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ background: f.bg }}>
                {f.icon}
              </div>
              <h3 className="font-display font-bold text-lg text-gray-900 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Demo CTA */}
      <section className="bg-teal-50 border-t border-teal-100 py-16">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="font-display font-extrabold text-3xl text-gray-900 mb-4">Try it right now</h2>
          <p className="text-gray-500 mb-2">Use the demo account   pre-loaded with 7 days of data, badges, and a sample chat session.</p>
          <div className="bg-white rounded-2xl border border-teal-200 p-4 mb-6 inline-block">
            <div className="text-sm text-gray-500">Email: <span className="font-mono font-semibold text-gray-900">demo@psychai.app</span></div>
            <div className="text-sm text-gray-500">Password: <span className="font-mono font-semibold text-gray-900">PsychAI@Demo2024</span></div>
          </div>
          <br />
          <Link href="/auth/login?demo=true" className="inline-block bg-teal-500 hover:bg-teal-600 text-white font-bold px-8 py-4 rounded-2xl transition-colors">
            Open demo
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 text-center text-sm text-gray-400">
        PsychAI is not a substitute for professional mental health care. If you are in crisis, call iCall: 9152987821
        <br /><br />
        © 2026 PsychAI · Built with care in India
      </footer>
    </div>
  );
}

const FEATURES = [
  {
    title: 'AI Therapy Chat',
    desc: 'Powered by Claude API with offline NLP fallback. Empathetic, judgment-free conversations 24/7.',
    bg: '#E6FAF9',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="#0DA99E" strokeWidth="1.8"/></svg>,
  },
  {
    title: 'Mood Tracker',
    desc: 'Daily check-ins with emotion tags, notes, and trend charts. See your patterns over weeks.',
    bg: '#FDE8E8',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" stroke="#E02424" strokeWidth="1.8"/></svg>,
  },
  {
    title: 'CBT Journal',
    desc: 'Guided thought records and free writing with CBT prompts. Reframe negative thinking patterns.',
    bg: '#EBF2FF',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke="#1A56DB" strokeWidth="1.8"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" stroke="#1A56DB" strokeWidth="1.8"/></svg>,
  },
  {
    title: 'Breathing & Mindfulness',
    desc: '4-7-8, box breathing, and 5-4-3-2-1 grounding exercises with animated timers.',
    bg: '#DEF7EC',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M9.59 4.59A2 2 0 1113 6" stroke="#0E9F6E" strokeWidth="1.8"/><path d="M2 12h20" stroke="#0E9F6E" strokeWidth="1.8"/></svg>,
  },
  {
    title: 'Silent Crisis Detection',
    desc: 'Keyword detection in English and Hindi. Guardian is quietly alerted via Twilio   patient is never alarmed.',
    bg: '#FEF3C7',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 22s-8-4.5-8-11.8A8 8 0 0112 2a8 8 0 018 8.2c0 7.3-8 11.8-8 11.8z" stroke="#FBBF24" strokeWidth="1.8"/><circle cx="12" cy="10" r="3" stroke="#FBBF24" strokeWidth="1.8"/></svg>,
  },
  {
    title: 'Gamification & Streaks',
    desc: 'XP, levels, daily streaks, and 8 badges. Staying consistent with your mental health actually feels rewarding.',
    bg: '#EEEDFE',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="#7C6FCD" strokeWidth="1.8"/></svg>,
  },
];

function BrainIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M12 5C12 5 8 4 6 7C4 10 5 13 7 14C5 15 4 17 5 19C6 21 9 22 12 21" stroke="#0DA99E" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M12 5C12 5 16 4 18 7C20 10 19 13 17 14C19 15 20 17 19 19C18 21 15 22 12 21" stroke="#0DA99E" strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="12" y1="5" x2="12" y2="21" stroke="#0DA99E" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}
