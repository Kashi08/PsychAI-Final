'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

const DEMO_EMAIL = 'demo@psychai.app';
const DEMO_PASS  = 'PsychAI@Demo2024';

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [isSignUp, setIsSignUp]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [demoLoad, setDemoLoad]   = useState(false);
  const [error, setError]         = useState('');
  const [showPw, setShowPw]       = useState(false);

  useEffect(() => {
    if (params.get('demo') === 'true') handleDemo();
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      if (isSignUp) {
        const { error: err } = await supabase.auth.signUp({ email, password });
        if (err) throw err;
        router.push('/onboarding');
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw err;
        router.push('/dashboard');
      }
    } catch (e: any) {
      setError(e.message || 'Something went wrong');
    } finally { setLoading(false); }
  };

  const handleDemo = async () => {
    setDemoLoad(true); setError('');
    try {
      const { error: err } = await supabase.auth.signInWithPassword({
        email: DEMO_EMAIL, password: DEMO_PASS,
      });
      if (err) throw err;
      router.push('/dashboard');
    } catch {
      // Try to create demo account
      try {
        await supabase.auth.signUp({ email: DEMO_EMAIL, password: DEMO_PASS });
        const { error: err2 } = await supabase.auth.signInWithPassword({ email: DEMO_EMAIL, password: DEMO_PASS });
        if (err2) throw err2;
        router.push('/dashboard');
      } catch (e: any) {
        setError('Demo unavailable. Please create a free account.');
      }
    } finally { setDemoLoad(false); }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-teal-50 flex items-center justify-center mx-auto mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M12 5C12 5 8 4 6 7C4 10 5 13 7 14C5 15 4 17 5 19C6 21 9 22 12 21" stroke="#0DA99E" strokeWidth="1.8" strokeLinecap="round"/>
              <path d="M12 5C12 5 16 4 18 7C20 10 19 13 17 14C19 15 20 17 19 19C18 21 15 22 12 21" stroke="#0DA99E" strokeWidth="1.8" strokeLinecap="round"/>
              <line x1="12" y1="5" x2="12" y2="21" stroke="#0DA99E" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </div>
          <h1 className="font-display font-extrabold text-3xl text-gray-900">PsychAI</h1>
          <p className="text-gray-500 text-sm mt-1">Your mental wellness companion</p>
        </div>

        {/* Demo button */}
        <button
          onClick={handleDemo}
          disabled={demoLoad}
          className="w-full flex items-center gap-3 bg-teal-50 border border-teal-200 hover:border-teal-400 rounded-2xl p-4 mb-6 transition-colors group"
        >
          <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="#0DA99E" strokeWidth="2" strokeLinecap="round"/></svg>
          </div>
          <div className="text-left flex-1">
            <div className="text-sm font-bold text-teal-800">{demoLoad ? 'Signing in...' : 'Try with demo account'}</div>
            <div className="text-xs text-teal-600">Pre-filled data · No signup needed</div>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="#0DA99E" strokeWidth="2" strokeLinecap="round"/></svg>
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-gray-200"></div>
          <span className="text-xs text-gray-400">or sign in with email</span>
          <div className="flex-1 h-px bg-gray-200"></div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">Email</label>
            <input
              type="email" required
              value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'} required
                value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 bg-gray-50 pr-10"
              />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="1.8"/><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8"/></svg>
              </button>
            </div>
          </div>
          <button
            type="submit" disabled={loading}
            className="w-full bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-colors text-sm shadow-md"
          >
            {loading ? 'Please wait...' : isSignUp ? 'Create account' : 'Sign in'}
          </button>
        </form>

        <button onClick={() => setIsSignUp(!isSignUp)} className="w-full text-center text-sm text-gray-500 mt-4 hover:text-gray-700">
          {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
          <span className="text-teal-600 font-semibold">{isSignUp ? 'Sign in' : 'Sign up free'}</span>
        </button>

        <Link href="/" className="block text-center text-xs text-gray-400 mt-6 hover:text-gray-600">
          ← Back to home
        </Link>
      </div>
    </div>
  );
}
