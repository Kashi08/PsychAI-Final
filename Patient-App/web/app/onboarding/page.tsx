'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const REASONS = ['Anxiety or stress','Depression or low mood','Sleep issues','Relationship problems','Work burnout','Just exploring'];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep]   = useState(0);
  const [name, setName]   = useState('');
  const [age, setAge]     = useState('');
  const [phone, setPhone] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [reason, setReason] = useState('');
  const [code, setCode]   = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('psychai-theme') || 'theme-green';
    document.documentElement.className = 'theme-green';
    return () => {
      document.documentElement.className = saved;
    };
  }, []);

  const finish = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // Save personal phone to Supabase Auth metadata
      await supabase.auth.updateUser({
        data: { phone: phone }
      });

      // Upsert profile info
      await supabase.from('profiles').upsert({
        user_id: user.id,
        full_name: name,
        age: parseInt(age)||null,
        guardian_phone: guardianPhone||null,
        therapist_code: code||null,
        streak: 0,
        wellness_score: 50,
        xp: 0,
        level: 1,
        badges: [],
        language: 'en',
      });
    }
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Progress */}
        <div className="flex gap-2 mb-10">
          {[0,1,2,3,4].map(i => (
            <div key={i} className="h-1.5 flex-1 rounded-full transition-all" style={{ background: i<=step ? '#0DA99E' : '#E5E7EB' }}/>
          ))}
        </div>

        {step === 0 && (
          <div>
            <div className="w-20 h-20 bg-white shadow-md border border-teal-100/50 flex items-center justify-center mb-6 rounded-2xl p-2 float-card-1">
              <img src="/logo.png" alt="PsychAI Logo" className="w-full h-full object-contain" />
            </div>
            <h1 className="font-display font-extrabold text-3xl text-gray-900 mb-2">What's your name?</h1>
            <p className="text-gray-500 mb-8">I'll use this to make our conversations more personal.</p>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Your first name" autoFocus
              className="w-full border-2 border-gray-200 focus:border-teal-400 rounded-2xl px-5 py-4 text-lg text-gray-900 focus:outline-none mb-6"/>
            <button onClick={() => setStep(1)} disabled={name.trim().length < 2}
              className="w-full bg-teal-500 hover:bg-teal-600 disabled:opacity-40 text-white font-bold py-4 rounded-2xl transition-colors">Continue</button>
          </div>
        )}

        {step === 1 && (
          <div>
            <h1 className="font-display font-extrabold text-3xl text-gray-900 mb-2">How old are you?</h1>
            <p className="text-gray-500 mb-8">Helps me understand where you're at in life.</p>
            <input value={age} onChange={e => setAge(e.target.value.replace(/\D/,''))} placeholder="Your age" type="number" autoFocus maxLength={3}
              className="w-full border-2 border-gray-200 focus:border-teal-400 rounded-2xl px-5 py-4 text-lg text-gray-900 focus:outline-none mb-6"/>
            <button onClick={() => setStep(2)} disabled={!age || parseInt(age)<10}
              className="w-full bg-teal-500 hover:bg-teal-600 disabled:opacity-40 text-white font-bold py-4 rounded-2xl transition-colors">Continue</button>
          </div>
        )}

        {step === 2 && (
          <div>
            <div className="w-14 h-14 rounded-2xl bg-teal-50 flex items-center justify-center mb-6">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-teal-600">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h1 className="font-display font-extrabold text-3xl text-gray-900 mb-2">Let's stay connected</h1>
            <p className="text-gray-500 mb-6">We use this to secure your account and support you in difficult times.</p>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Your Phone Number</label>
                <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="e.g. +91 98765 43210" autoFocus
                  className="w-full border-2 border-gray-200 focus:border-teal-400 rounded-2xl px-5 py-3.5 text-lg text-gray-900 focus:outline-none"/>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Guardian / Emergency Number</label>
                <input value={guardianPhone} onChange={e => setGuardianPhone(e.target.value)} placeholder="e.g. +91 98765 43210"
                  className="w-full border-2 border-gray-200 focus:border-teal-400 rounded-2xl px-5 py-3.5 text-lg text-gray-900 focus:outline-none"/>
                <div className="mt-2.5 flex items-start gap-2 bg-amber-50/50 border border-amber-100 rounded-xl p-3">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-amber-600 flex-shrink-0 mt-0.5">
                    <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <p className="text-xs text-amber-800 leading-normal">
                    <strong>Privacy First:</strong> Your emergency contact is only notified automatically via silent Twilio alerts during critical moments.
                  </p>
                </div>
              </div>
            </div>

            <button onClick={() => setStep(3)} disabled={phone.trim().length < 8 || guardianPhone.trim().length < 8}
              className="w-full bg-teal-500 hover:bg-teal-600 disabled:opacity-40 text-white font-bold py-4 rounded-2xl transition-colors">Continue</button>
          </div>
        )}

        {step === 3 && (
          <div>
            <h1 className="font-display font-extrabold text-3xl text-gray-900 mb-2">What brings you here?</h1>
            <p className="text-gray-500 mb-8">No judgment — helps me support you better.</p>
            <div className="flex flex-wrap gap-3 mb-8">
              {REASONS.map(r => (
                <button key={r} onClick={() => setReason(r)}
                  className={`px-4 py-2.5 rounded-full border-2 text-sm font-medium transition-colors ${reason===r ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                >{r}</button>
              ))}
            </div>
            <button onClick={() => setStep(4)} disabled={!reason}
              className="w-full bg-teal-500 hover:bg-teal-600 disabled:opacity-40 text-white font-bold py-4 rounded-2xl transition-colors">Continue</button>
          </div>
        )}

        {step === 4 && (
          <div>
            <h1 className="font-display font-extrabold text-3xl text-gray-900 mb-2">Therapist code?</h1>
            <p className="text-gray-500 mb-8">If your psychologist gave you a code, enter it here. You can skip this.</p>
            <input value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="e.g. DR-SHARMA-2024" autoFocus
              className="w-full border-2 border-gray-200 focus:border-teal-400 rounded-2xl px-5 py-4 text-lg font-mono text-gray-900 focus:outline-none mb-4"/>
            <p className="text-sm text-gray-400 mb-6 text-center">Don't have one? Skip — you can add it later in Profile.</p>
            <button onClick={finish} disabled={loading}
              className="w-full bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-white font-bold py-4 rounded-2xl transition-colors">
              {loading ? 'Setting up...' : "Let's go"}
            </button>
            <button onClick={finish} className="w-full text-center text-sm text-gray-400 mt-3 hover:text-gray-600 py-2">Skip for now</button>
          </div>
        )}
      </div>
    </div>
  );
}
