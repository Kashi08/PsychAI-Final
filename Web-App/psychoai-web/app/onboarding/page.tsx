'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const REASONS = ['Anxiety or stress','Depression or low mood','Sleep issues','Relationship problems','Work burnout','Just exploring'];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep]   = useState(0);
  const [name, setName]   = useState('');
  const [age, setAge]     = useState('');
  const [reason, setReason] = useState('');
  const [code, setCode]   = useState('');
  const [loading, setLoading] = useState(false);

  const finish = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('profiles').upsert({
        user_id: user.id, full_name: name, age: parseInt(age)||null,
        therapist_code: code||null, streak:0, wellness_score:50, xp:0, level:1, badges:[], language:'en',
      });
    }
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Progress */}
        <div className="flex gap-2 mb-10">
          {[0,1,2,3].map(i => (
            <div key={i} className="h-1.5 flex-1 rounded-full transition-all" style={{ background: i<=step ? '#0DA99E' : '#E5E7EB' }}/>
          ))}
        </div>

        {step === 0 && (
          <div>
            <div className="w-14 h-14 rounded-2xl bg-teal-50 flex items-center justify-center mb-6">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M12 5C12 5 8 4 6 7C4 10 5 13 7 14C5 15 4 17 5 19C6 21 9 22 12 21" stroke="#0DA99E" strokeWidth="1.8" strokeLinecap="round"/><path d="M12 5C12 5 16 4 18 7C20 10 19 13 17 14C19 15 20 17 19 19C18 21 15 22 12 21" stroke="#0DA99E" strokeWidth="1.8" strokeLinecap="round"/><line x1="12" y1="5" x2="12" y2="21" stroke="#0DA99E" strokeWidth="1.8" strokeLinecap="round"/></svg>
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
            <h1 className="font-display font-extrabold text-3xl text-gray-900 mb-2">What brings you here?</h1>
            <p className="text-gray-500 mb-8">No judgment   helps me support you better.</p>
            <div className="flex flex-wrap gap-3 mb-8">
              {REASONS.map(r => (
                <button key={r} onClick={() => setReason(r)}
                  className={`px-4 py-2.5 rounded-full border-2 text-sm font-medium transition-colors ${reason===r ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                >{r}</button>
              ))}
            </div>
            <button onClick={() => setStep(3)} disabled={!reason}
              className="w-full bg-teal-500 hover:bg-teal-600 disabled:opacity-40 text-white font-bold py-4 rounded-2xl transition-colors">Continue</button>
          </div>
        )}

        {step === 3 && (
          <div>
            <h1 className="font-display font-extrabold text-3xl text-gray-900 mb-2">Therapist code?</h1>
            <p className="text-gray-500 mb-8">If your psychologist gave you a code, enter it here. You can skip this.</p>
            <input value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="e.g. DR-SHARMA-2024" autoFocus
              className="w-full border-2 border-gray-200 focus:border-teal-400 rounded-2xl px-5 py-4 text-lg font-mono text-gray-900 focus:outline-none mb-4"/>
            <p className="text-sm text-gray-400 mb-6 text-center">Don't have one? Skip   you can add it later in Profile.</p>
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
