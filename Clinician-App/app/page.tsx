'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function LandingPage() {
  const [heroText, setHeroText] = useState('assistant');
  const words = ['assistant', 'co-pilot', 'dashboard'];
  
  // Rotating Hero Text
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % words.length;
      setHeroText(words[i]);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Risk Badge Simulation
  const [riskLevel, setRiskLevel] = useState('High Risk');
  const [riskScore, setRiskScore] = useState(85);
  
  useEffect(() => {
    // Pulse the score slightly to feel alive
    const interval = setInterval(() => {
      setRiskScore(prev => prev > 80 ? prev - Math.floor(Math.random() * 3) : 85);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-mesh flex flex-col relative overflow-hidden">
      {/* Decorative background glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-psych-200/20 rounded-full blur-[120px] pointer-events-none animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-psych-300/20 rounded-full blur-[120px] pointer-events-none animate-pulse" style={{ animationDuration: '10s' }} />

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
            <Link href="/auth/login" className="text-sm font-bold text-white bg-psych-500 hover:bg-psych-600 px-6 py-3 rounded-2xl transition-all shadow-lg shadow-psych-500/30 hover:shadow-psych-500/50 hover:-translate-y-0.5 active:translate-y-0 duration-200 border border-psych-500">
              Get started free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative max-w-5xl mx-auto px-6 pt-24 pb-16 text-center z-10 flex-grow">
        {/* Soft centered background glow */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-gradient-to-tr from-psych-100/20 to-psych-200/20 blur-[80px] rounded-full pointer-events-none -z-10" />

        <div className="hero-badge mb-8 inline-flex items-center gap-2 bg-white/40 backdrop-blur-md px-4.5 py-2 rounded-full border border-white/60 shadow-glass text-gray-700 font-medium text-sm">
          <div className="w-2.5 h-2.5 rounded-full bg-psych-500 alert-pulse-badge shadow-[0_0_10px_rgba(124,111,205,0.8)]"></div>
          HIPAA-compliant · Secure · AI-Powered
        </div>

        <h1 className="font-display font-extrabold text-5xl md:text-7xl leading-[1.1] mb-6 tracking-tight text-gray-900 drop-shadow-sm">
          Your intelligent clinical<br />
          <div className="h-[1.2em] relative block overflow-hidden w-full mt-2">
            <span key={heroText} className="gradient-text absolute inset-x-0 mx-auto animate-slide-up leading-tight">
              {heroText}
            </span>
          </div>
        </h1>

        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
          PsychAI empowers therapists and clinicians with AI-driven patient insights, automated session notes, mood tracking analytics, and secure telehealth   all in one safe, private space.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto mb-16">
          <Link href="/auth/login" className="btn-confetti flex items-center justify-center gap-2.5 w-full bg-psych-500 hover:bg-psych-600 border border-psych-500 text-white font-bold text-lg px-10 py-5 rounded-2xl transition-all shadow-xl shadow-psych-500/30 hover:shadow-psych-500/50 hover:-translate-y-1 active:translate-y-0 duration-300">
            Start for free
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="translate-y-[0.5px]">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </Link>
        </div>

        <p className="text-xs text-gray-400 font-bold mb-20 tracking-wider uppercase">No credit card required · Free account · Instant setup</p>

        {/* Dashboard Preview Mockup (Deep Glassmorphism) */}
        <div className="max-w-4xl mx-auto bg-white/30 backdrop-blur-2xl border border-white/60 rounded-3xl p-6 md:p-8 shadow-[0_8px_32px_rgba(31,38,135,0.07)] relative mb-24 hover:shadow-[0_8px_40px_rgba(124,111,205,0.15)] transition-all duration-500 group">
          <div className="absolute top-4 left-4 flex gap-2">
            <span className="w-3 h-3 rounded-full bg-red-400/80 shadow-sm"></span>
            <span className="w-3 h-3 rounded-full bg-yellow-400/80 shadow-sm"></span>
            <span className="w-3 h-3 rounded-full bg-green-400/80 shadow-sm"></span>
          </div>
          <div className="text-xs text-gray-500/70 border-b border-white/30 pb-4 mb-6 font-mono tracking-widest uppercase">PsychAI Clinician Dashboard</div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            {/* Left Mock Panel: Patient Overview */}
            <div className="bg-white/40 backdrop-blur-md rounded-2xl p-5 border border-white/50 flex flex-col justify-between group-hover:-translate-y-1 transition-transform duration-500 shadow-sm">
              <div>
                <span className="text-xs font-bold text-psych-700 bg-psych-100/50 backdrop-blur-sm px-2.5 py-1 rounded-full uppercase tracking-wider">Patient Overview</span>
                <h3 className="font-display font-bold text-xl text-gray-900 mt-3 mb-2">Automated Risk Tracking</h3>
                <p className="text-xs text-gray-600 leading-relaxed mb-4">Instantly monitor patient emotional trajectories and receive alerts for high-risk language.</p>
              </div>
              <div className="flex items-center gap-4 bg-white/70 backdrop-blur-md p-3.5 rounded-xl border border-white/60 shadow-glass mt-4 hover:bg-white/90 transition-colors cursor-default">
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center relative">
                  <div className="absolute inset-0 bg-red-200 rounded-full animate-ping opacity-20"></div>
                  <div className="w-3 h-3 bg-red-500 rounded-full alert-ring relative z-10 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></div>
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-800">Critical Keyword Detected</div>
                  <div className="text-[10px] text-gray-500 font-mono mt-0.5">Alert Score: {riskScore}/100</div>
                </div>
                <div className="ml-auto text-xs font-black text-red-600 bg-red-100/80 backdrop-blur-sm px-2 py-1 rounded-lg border border-red-200">High Risk</div>
              </div>
            </div>

            {/* Right Mock Panel: Session Notes */}
            <div className="bg-white/40 backdrop-blur-md rounded-2xl p-5 border border-white/50 flex flex-col justify-between group-hover:-translate-y-1 transition-transform duration-500 delay-75 shadow-sm">
              <div>
                <span className="text-xs font-bold text-indigo-700 bg-indigo-100/50 backdrop-blur-sm px-2.5 py-1 rounded-full uppercase tracking-wider">AI Session Notes</span>
                <h3 className="font-display font-bold text-xl text-gray-900 mt-3 mb-2">Effortless Documentation</h3>
                <p className="text-xs text-gray-600 leading-relaxed mb-4">Focus on your patient while our clinical NLP models generate structured SOAP notes.</p>
              </div>
              <div className="space-y-2 mt-2">
                <div className="bg-white/80 backdrop-blur-md px-3.5 py-2.5 rounded-2xl border border-white/60 shadow-glass text-xs text-gray-600 w-full leading-relaxed animate-fade-in-up">
                  <div className="font-bold text-indigo-900 mb-1 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div> Subjective
                  </div>
                  Patient reports feeling overwhelmed with upcoming exams but notes breathing exercises have helped mitigate panic attacks.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="max-w-5xl mx-auto px-6 pb-24 relative z-10">
        <div className="text-center mb-16">
          <h2 className="font-display font-extrabold text-3xl md:text-4xl mb-4 text-gray-900">Professional tools, designed for you</h2>
          <p className="text-gray-500 max-w-xl mx-auto text-sm md:text-base">Streamline your practice and enhance patient care with intelligent, time-saving features.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f, idx) => (
            <div key={f.title} className="card p-7 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(124,111,205,0.12)] hover:-translate-y-2 flex flex-col justify-between bg-white/50 backdrop-blur-sm border-white/60 relative group overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-psych-500/0 to-psych-500/0 group-hover:from-psych-500/5 group-hover:to-psych-500/10 transition-colors duration-500" />
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
      <section className="relative bg-psych-50/30 backdrop-blur-md border-t border-b border-psych-100/50 py-24 z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-psych-200/20 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-3xl mx-auto px-6 text-center relative">
          <h2 className="font-display font-extrabold text-4xl mb-5 text-gray-900 drop-shadow-sm">
            Elevate your <span className="gradient-text">clinical practice</span>
          </h2>
          <p className="text-gray-600 font-medium text-lg mb-10 leading-relaxed max-w-xl mx-auto">
            PsychAI provides a secure, powerful, and intuitive platform to manage patients, analyze trends, and reduce administrative burden.
          </p>
          <Link href="/auth/login" className="btn-confetti inline-flex items-center gap-2.5 bg-psych-500 hover:bg-psych-600 border border-psych-500 text-white font-bold px-8 py-4.5 rounded-2xl transition-all shadow-xl shadow-psych-500/30 hover:shadow-psych-500/50 hover:-translate-y-1 active:translate-y-0 duration-300">
            Create Clinician Account
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/40 bg-white/20 backdrop-blur-lg py-12 text-center text-sm text-gray-500 z-10">
        <div className="max-w-4xl mx-auto px-6 space-y-4">
          <p className="leading-relaxed text-xs max-w-2xl mx-auto">
            <strong>Security Guarantee:</strong> PsychAI utilizes end-to-end encryption to ensure all patient data remains strictly confidential and fully HIPAA-compliant.
          </p>
          <div className="h-px w-20 bg-gray-200/50 mx-auto my-6" />
          <p className="text-xs font-semibold tracking-wide">
            © 2026 PsychAI · Empowering mental health professionals
          </p>
        </div>
      </footer>
    </div>
  );
}

const FEATURES = [
  {
    title: 'AI Session Notes',
    desc: 'Automatically transcribe and summarize clinical sessions into structured SOAP format, saving you hours of documentation.',
    bg: '#EBF2FF',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1A56DB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
  },
  {
    title: 'Patient Risk Monitoring',
    desc: 'Real-time alerting system that scans patient logs for distress keywords and notifies you instantly.',
    bg: '#FDE8E8',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E02424" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  },
  {
    title: 'Longitudinal Analytics',
    desc: 'Visualize patient mood, journal entries, and assessment scores over time to better understand treatment progress.',
    bg: '#E6FAF9',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0DA99E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  },
  {
    title: 'Secure Telehealth',
    desc: 'Conduct high-quality, encrypted video sessions directly within the platform with no external links needed.',
    bg: '#EEEDFE',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7C6FCD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>,
  },
  {
    title: 'Treatment Planning',
    desc: 'AI-assisted tools to help formulate treatment goals and track milestones across clinical outcomes.',
    bg: '#FEF3C7',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  },
  {
    title: 'HIPAA-Compliant',
    desc: 'Built from the ground up with military-grade encryption to ensure complete privacy and regulatory compliance.',
    bg: '#DEF7EC',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0E9F6E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  },
];
