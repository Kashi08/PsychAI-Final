'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function LandingPage() {
  const [heroText, setHeroText] = useState('companion');
  const words = ['companion', 'guide', 'safe space'];
  
  // Rotating Hero Text
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % words.length;
      setHeroText(words[i]);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Chat Simulation
  const [chatStep, setChatStep] = useState(0);
  const [userText, setUserText] = useState('');
  const fullUserText = "Feeling overwhelmed with exams but breathing helps.";

  useEffect(() => {
    // Reset cycle every 8 seconds
    const cycle = setInterval(() => {
      setChatStep(0);
      setUserText('');
    }, 8000);
    return () => clearInterval(cycle);
  }, []);

  useEffect(() => {
    if (chatStep === 0) {
      // Step 0: Show AI message, wait 1.5s
      const t = setTimeout(() => setChatStep(1), 1500);
      return () => clearTimeout(t);
    } else if (chatStep === 1) {
      // Step 1: Type out user message
      if (userText.length < fullUserText.length) {
        const t = setTimeout(() => {
          setUserText(fullUserText.slice(0, userText.length + 1));
        }, 40); // typing speed
        return () => clearTimeout(t);
      } else {
        // Step 2: Done typing
        const t = setTimeout(() => setChatStep(2), 500);
        return () => clearTimeout(t);
      }
    }
  }, [chatStep, userText]);

  useEffect(() => {
    const saved = localStorage.getItem('psychai-theme') || 'theme-green';
    document.documentElement.className = 'theme-green';
    return () => {
      document.documentElement.className = saved;
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-mesh flex flex-col relative overflow-hidden">
      {/* Decorative animated background orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-teal-300/20 rounded-full blur-[120px] pointer-events-none animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-300/20 rounded-full blur-[120px] pointer-events-none animate-pulse" style={{ animationDuration: '10s' }} />
      <div className="absolute top-[40%] left-[60%] w-[400px] h-[400px] bg-emerald-200/20 rounded-full blur-[100px] pointer-events-none animate-pulse" style={{ animationDuration: '12s' }} />

      {/* Nav */}
      <nav className="sticky top-0 z-50 w-full bg-white/40 backdrop-blur-xl border-b border-white/50 shadow-sm transition-all duration-300">
        <div className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="PsychAI Logo" className="w-12 h-12 object-contain hover:scale-105 transition-transform duration-200" />
            <span className="font-display font-extrabold text-2xl tracking-tight">
              <span className="gradient-text">PsychAI</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/auth/login" className="text-sm text-gray-600 hover:text-gray-900 font-bold px-4 py-2.5 rounded-2xl transition-colors">
              Sign in
            </Link>
            <Link href="/auth/login" className="text-sm font-bold text-white bg-teal-500 hover:bg-teal-600 px-6 py-3 rounded-2xl transition-all shadow-lg shadow-teal-500/30 hover:shadow-teal-500/50 hover:-translate-y-0.5 active:translate-y-0 duration-200 border border-teal-400">
              Get started free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative max-w-5xl mx-auto px-6 pt-24 pb-16 text-center z-10 flex-grow">
        <div className="hero-badge mb-8 inline-flex items-center gap-2 bg-white/40 backdrop-blur-md px-4.5 py-2 rounded-full border border-white/60 shadow-glass text-gray-700 font-medium text-sm">
          <div className="w-2.5 h-2.5 rounded-full bg-teal-500 status-dot-pulse shadow-[0_0_10px_rgba(20,184,166,0.8)]"></div>
          AI-powered · Completely private · Encrypted & secure
        </div>

        <h1 className="font-display font-extrabold text-5xl md:text-7xl leading-[1.1] mb-6 tracking-tight text-gray-900 drop-shadow-sm">
          Your mental wellness<br />
          <div className="h-[1.2em] relative block overflow-hidden w-full mt-2">
            <span key={heroText} className="gradient-text absolute inset-x-0 mx-auto animate-slide-up leading-tight">
              {heroText}
            </span>
          </div>
        </h1>

        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
          PsychAI combining expert AI models with clinical NLP to give you empathetic support, mood tracking, CBT journaling, and crisis detection — all in one safe, private space.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto mb-16">
          <Link href="/auth/login" className="btn-confetti flex items-center justify-center gap-2.5 w-full bg-teal-500 border border-teal-400 hover:bg-teal-600 text-white font-bold text-lg px-10 py-5 rounded-2xl transition-all shadow-xl shadow-teal-500/30 hover:shadow-teal-500/50 hover:-translate-y-1 active:translate-y-0 duration-300">
            Start for free
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="translate-y-[0.5px]">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </Link>
        </div>

        <p className="text-xs text-gray-400 font-bold mb-20 tracking-wider uppercase">No credit card required · Free account · Instant setup</p>

        {/* Dashboard Preview Mockup (Deep Glassmorphism) */}
        <div className="max-w-4xl mx-auto bg-white/30 backdrop-blur-2xl border border-white/60 rounded-3xl p-6 md:p-8 shadow-[0_8px_32px_rgba(31,38,135,0.07)] relative mb-24 hover:shadow-[0_8px_40px_rgba(20,184,166,0.15)] transition-all duration-500 group">
          <div className="absolute top-4 left-4 flex gap-2">
            <span className="w-3 h-3 rounded-full bg-red-400/80 shadow-sm"></span>
            <span className="w-3 h-3 rounded-full bg-yellow-400/80 shadow-sm"></span>
            <span className="w-3 h-3 rounded-full bg-green-400/80 shadow-sm"></span>
          </div>
          <div className="text-xs text-gray-500/70 border-b border-white/30 pb-4 mb-6 font-mono tracking-widest uppercase">PsychAI Wellness Workspace</div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            {/* Left Mock Panel: Check-in & Stream */}
            <div className="bg-white/40 backdrop-blur-md rounded-2xl p-5 border border-white/50 flex flex-col justify-between group-hover:-translate-y-1 transition-transform duration-500 shadow-sm">
              <div>
                <span className="text-xs font-bold text-teal-700 bg-teal-100/50 backdrop-blur-sm px-2.5 py-1 rounded-full uppercase tracking-wider">Mood Analytics</span>
                <h3 className="font-display font-bold text-xl text-gray-900 mt-3 mb-2">Beautiful mood logs</h3>
                <p className="text-xs text-gray-600 leading-relaxed mb-4">A simple check-in captures complex patterns to give you insight into your emotional cycle.</p>
              </div>
              <div className="flex items-center gap-4 bg-white/70 backdrop-blur-md p-3.5 rounded-xl border border-white/60 shadow-glass mt-4 hover:bg-white/90 transition-colors cursor-default">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center relative">
                  <div className="absolute inset-0 bg-emerald-200 rounded-full animate-ping opacity-20"></div>
                  <svg className="w-6 h-6 text-emerald-600 relative z-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                    <line x1="9" y1="9" x2="9.01" y2="9" strokeWidth="3" strokeLinecap="round" />
                    <line x1="15" y1="9" x2="15.01" y2="9" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-800">Streak is climbing!</div>
                  <div className="text-[10px] text-gray-500">7-Day Perfect Check-In streak</div>
                </div>
                <div className="ml-auto text-xs font-black text-teal-600 bg-teal-50 px-2 py-1 rounded-lg">🔥 7 days</div>
              </div>
            </div>

            {/* Right Mock Panel: Chat Screen */}
            <div className="bg-white/40 backdrop-blur-md rounded-2xl p-5 border border-white/50 flex flex-col justify-between group-hover:-translate-y-1 transition-transform duration-500 delay-75 shadow-sm">
              <div>
                <span className="text-xs font-bold text-purple-700 bg-purple-100/50 backdrop-blur-sm px-2.5 py-1 rounded-full uppercase tracking-wider">Empathy Chat</span>
                <h3 className="font-display font-bold text-xl text-gray-900 mt-3 mb-2">Active listening companion</h3>
                <p className="text-xs text-gray-600 leading-relaxed mb-4">Judgment-free active listening driven by professional CBT parameters, available 24/7.</p>
              </div>
              <div className="space-y-3 mt-2 h-[80px] flex flex-col justify-end">
                <div className="bg-white/80 backdrop-blur-md px-3.5 py-2.5 rounded-2xl rounded-tl-sm border border-white/60 shadow-glass text-xs text-gray-600 max-w-[85%] leading-relaxed animate-fade-in-up">
                  I'm here for you. How has your stress level been today?
                </div>
                {chatStep > 0 && (
                  <div className="bg-gradient-to-r from-teal-500 to-teal-400 text-white px-3.5 py-2.5 rounded-2xl rounded-tr-sm text-xs max-w-[85%] ml-auto leading-relaxed shadow-md animate-fade-in-up">
                    {userText}
                    {chatStep === 1 && <span className="inline-block w-1 h-3 bg-white/70 ml-1 animate-pulse align-middle"></span>}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="max-w-5xl mx-auto px-6 pb-24 relative z-10">
        <div className="text-center mb-16">
          <h2 className="font-display font-extrabold text-3xl md:text-4xl mb-4 text-gray-900">Empathetic tools, simplified for you</h2>
          <p className="text-gray-500 max-w-xl mx-auto text-sm md:text-base">Scientific mental health methodologies packaged in an easy-to-use, gorgeous interface.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f, idx) => (
            <div key={f.title} className="card p-7 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(20,184,166,0.12)] hover:-translate-y-2 flex flex-col justify-between bg-white/50 backdrop-blur-sm border-white/60 relative group overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500/0 to-teal-500/0 group-hover:from-teal-500/5 group-hover:to-purple-500/5 transition-colors duration-500" />
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 border border-white shadow-sm transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3" style={{ background: f.bg }}>
                  {f.icon}
                </div>
                <h3 className="font-display font-bold text-xl text-gray-900 mb-3">{f.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed font-medium">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Inviting supportive CTA section */}
      <section className="relative bg-teal-50/30 backdrop-blur-md border-t border-b border-teal-100/50 py-24 z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-teal-200/20 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-3xl mx-auto px-6 text-center relative">
          <h2 className="font-display font-extrabold text-4xl mb-5 text-gray-900 drop-shadow-sm">
            Take the first step toward a <span className="gradient-text">calmer mind</span>
          </h2>
          <p className="text-gray-600 font-medium text-lg mb-10 leading-relaxed max-w-xl mx-auto">
            PsychAI is a completely free, highly private, encrypted space to log, check, and improve your daily mental well-being.
          </p>
          <Link href="/auth/login" className="btn-confetti inline-flex items-center gap-2.5 bg-teal-500 hover:bg-teal-600 text-white font-bold px-8 py-4.5 rounded-2xl transition-all shadow-xl shadow-teal-500/30 hover:shadow-teal-500/50 hover:-translate-y-1 active:translate-y-0 duration-300 border border-teal-400">
            Create Your Free Account
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/40 bg-white/20 backdrop-blur-lg py-12 text-center text-sm text-gray-500 z-10">
        <div className="max-w-4xl mx-auto px-6 space-y-4">
          <p className="leading-relaxed text-xs max-w-2xl mx-auto">
            <strong>Disclaimer:</strong> PsychAI is not a substitute for professional clinical medical advice or psychiatric diagnostic procedures. If you are experiencing a crisis, please call standard helplines or contact iCall directly: <span className="font-semibold text-teal-700">9152987821</span>
          </p>
          <div className="h-px w-20 bg-gray-200/50 mx-auto my-6" />
          <p className="text-xs font-semibold tracking-wide">
            © 2026 PsychAI · Built with care for mental wellness
          </p>
        </div>
      </footer>
    </div>
  );
}

const FEATURES = [
  {
    title: 'AI Therapy Chat',
    desc: 'Empathetic, non-judgmental conversations with Claude API, structured around active-listening clinical guidelines.',
    bg: '#E6FAF9',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0DA99E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>,
  },
  {
    title: 'Mood Tracker',
    desc: 'Log your feelings with simple emotion tags, write personal notes, and visualise trends over the weeks.',
    bg: '#FDE8E8',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E02424" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>,
  },
  {
    title: 'CBT Journal',
    desc: 'Guided thought records to help you break down negative thoughts and reframe patterns using CBT methodologies.',
    bg: '#EBF2FF',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1A56DB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>,
  },
  {
    title: 'Breathing & Mindfulness',
    desc: 'Interactive visual pacers for 4-7-8, box breathing, and the 5-4-3-2-1 grounding exercise to calm distress in real-time.',
    bg: '#DEF7EC',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0E9F6E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 8v8M8 12h8" /></svg>,
  },
  {
    title: 'Silent Crisis Detection',
    desc: 'Offline crisis keyword matching in English and Hindi. Silently alerts configured guardians without alarming the user.',
    bg: '#FEF3C7',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" /><circle cx="12" cy="10" r="3" /></svg>,
  },
  {
    title: 'Gamification & Streaks',
    desc: 'Reward mental check-ins with levels, streak milestones, and custom badges to stay consistent in wellness habits.',
    bg: '#EEEDFE',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7C6FCD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>,
  },
];
