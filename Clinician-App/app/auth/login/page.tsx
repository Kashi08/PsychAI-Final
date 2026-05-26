'use client';
export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function PsychLogin() {
  const router = useRouter();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);

  const [error, setError]       = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) { setError(err.message); setLoading(false); return; }
    router.push('/overview');
  };


  return (
    <div className="min-h-screen bg-gradient-mesh flex items-center justify-center px-4 relative overflow-hidden">
      {/* Decorative floating blur bubbles */}
      <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-psych-100/30 blur-3xl animate-pulse duration-[6000ms] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-teal-100/20 blur-3xl animate-pulse duration-[8000ms] pointer-events-none" />
      
      <div className="w-full max-w-md glass bg-white/70 border border-white/40 shadow-2xl rounded-3xl p-8 animate-spring relative z-10">

        {/* Header */}
        <div className="text-center mb-8 animate-slide-up delay-1">
          <div className="w-20 h-20 bg-white/60 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-4 animate-bounce-slow shadow-md border border-psych-100/50 p-2">
            <img src="/logo.png" alt="PsychAI Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="font-display font-extrabold text-3xl text-gray-900">PsychAI</h1>
          <p className="text-xs text-psych-600 font-bold tracking-wider uppercase mt-1">Clinician Portal</p>
          <p className="text-gray-500 text-sm mt-2">Secure access for licensed mental health professionals</p>
        </div>


        {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-2xl mb-4 animate-shake">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-4 animate-slide-up delay-3">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Professional email</label>
            <input type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="dr.sharma@hospital.com"
              className="w-full border border-gray-200 hover:border-psych-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-psych-500 focus:ring-4 focus:ring-psych-500/10 bg-white/80 transition-all duration-200 text-gray-900"/>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Password</label>
            <input type="password" required value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••"
              className="w-full border border-gray-200 hover:border-psych-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-psych-500 focus:ring-4 focus:ring-psych-500/10 bg-white/80 transition-all duration-200 text-gray-900"/>
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-psych-500 hover:bg-psych-600 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-psych-500/20 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2">
            {loading ? (
              <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"/>Signing in...</>
            ) : 'Sign in to dashboard'}
          </button>
        </form>


        <p className="text-[10px] text-gray-400 text-center mt-6 leading-relaxed animate-slide-up delay-5">
          This portal is for licensed mental health professionals only.<br/>Patient data is protected under applicable privacy laws.
        </p>
      </div>
    </div>
  );
}


