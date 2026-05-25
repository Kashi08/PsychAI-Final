'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [isSignUp, setIsSignUp]   = useState(false);
  const [signUpSuccess, setSignUpSuccess] = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [showPw, setShowPw]       = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('psychai-theme') || 'theme-green';
    document.documentElement.className = 'theme-green';
    return () => {
      document.documentElement.className = saved;
    };
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      if (isSignUp) {
        const { data, error: err } = await supabase.auth.signUp({ email, password });
        if (err) throw err;
        
        // If a session exists, it means email verification is disabled in Supabase,
        // and we are logged in immediately. If session is null, verification is required.
        if (data?.session) {
          router.push('/onboarding');
        } else {
          setSignUpSuccess(true);
        }
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw err;
        router.push('/dashboard');
      }
    } catch (e: any) {
      setError(e.message || 'Something went wrong');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-mesh flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Decorative background glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-teal-200/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-200/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-sm glass bg-white/80 border border-teal-100/50 p-8 rounded-2xl shadow-xl animate-fade-in z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-white/60 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-4 float-card-1 shadow-md border border-teal-100/50 p-2">
            <img src="/logo.png" alt="PsychAI Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="font-display font-extrabold text-3xl text-gray-900">PsychAI</h1>
          <p className="text-gray-500 text-sm mt-1">Your mental wellness companion</p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-4 animate-fade-in">
            {error}
          </div>
        )}

        {signUpSuccess ? (
          <div className="text-center space-y-5 animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-teal-50 flex items-center justify-center mx-auto mb-2 animate-bounce">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-teal-600">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M22 6l-10 7L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 className="font-display font-extrabold text-2xl text-gray-900">Check your inbox</h2>
            <p className="text-gray-500 text-sm leading-relaxed">
              We sent a verification link to <span className="font-semibold text-teal-600 break-all">{email}</span>. Please click the link in the email to activate your account.
            </p>
            <div className="pt-2">
              <button
                onClick={() => {
                  setSignUpSuccess(false);
                  setIsSignUp(false);
                  setPassword('');
                }}
                className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-3.5 rounded-xl transition-colors text-sm shadow-md"
              >
                Back to Sign In
              </button>
            </div>
            <p className="text-xs text-gray-400">
              Didn't receive the email? Check your spam folder or try logging in to trigger a resend.
            </p>
          </div>
        ) : (
          <>
            {/* Form */}
            <form onSubmit={handleAuth} className="space-y-4 animate-fade-in">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">Email</label>
                <input
                  type="email" required
                  value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 bg-gray-50/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'} required
                    value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 bg-gray-50/50 pr-10"
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
          </>
        )}

        <Link href="/" className="block text-center text-xs text-gray-400 mt-6 hover:text-gray-600">
          ← Back to home
        </Link>
      </div>
    </div>
  );
}
