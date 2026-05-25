'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getAvatarUrl } from '@/lib/avatars';
import { DEMO_PATIENTS } from '@/lib/demo-patients';

type Risk = 'HIGH' | 'MED' | 'LOW';

interface Patient {
  id: string; // the patient's user_id from DB
  name: string;
  age: number;
  risk: Risk;
  diagnosis: string;
  sessions: number;
  wellness: number;
  mood_avg: number;
  last_active: string;
  joined: string;
  keywords: string[];
  avatar: string;
}

const EMPTY_FORM = { name:'', age:'', risk:'MED' as Risk, diagnosis:'', guardian:'' };

export default function PatientsPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [filter, setFilter]     = useState<'ALL'|Risk>('ALL');
  const [sortBy, setSortBy]     = useState<'name'|'risk'|'wellness'>('risk');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]           = useState(EMPTY_FORM);

  useEffect(() => {
    let isMounted = true;
    async function fetchPatients() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !isMounted) return;

      const { data: links } = await supabase
        .from('patient_links')
        .select('patient_id, created_at')
        .eq('psychologist_id', user.id)
        .eq('status', 'active');

      let patientLinks = links || [];
      if (patientLinks.length === 0) {
        patientLinks = Object.keys(DEMO_PATIENTS).map(id => ({
          patient_id: id,
          created_at: new Date().toISOString()
        }));
      }

      if (patientLinks.length > 0) {
        const enriched = await Promise.all(
          patientLinks.map(async (link) => {
            const { data: prof } = await supabase
              .from('profiles')
              .select('full_name, age, wellness_score, created_at, avatar_url')
              .eq('user_id', link.patient_id)
              .maybeSingle();
            
            const wScore = prof?.wellness_score ?? 50;
            const risk: Risk = wScore < 40 ? 'HIGH' : wScore < 60 ? 'MED' : 'LOW';

            const demo = DEMO_PATIENTS[link.patient_id];

            const fallbackName = demo ? demo.name : (link.patient_id === '591a9eca-59d2-48ca-962c-e2fd4243f258' ? 'kashish'
                               : link.patient_id === '144cc8cc-a19a-49f8-af45-add6349afd9b' ? 'Sneha Joshi'
                               : 'Anonymous Patient');
            const fallbackAvatar = demo ? demo.avatar : (link.patient_id === '591a9eca-59d2-48ca-962c-e2fd4243f258' ? 'Felix'
                                 : link.patient_id === '144cc8cc-a19a-49f8-af45-add6349afd9b' ? 'Emma'
                                 : 'Felix');
            const avatar = prof?.avatar_url || fallbackAvatar;

            return {
              id: link.patient_id,
              name: prof?.full_name || fallbackName,
              age: prof?.age || 20,
              risk,
              diagnosis: demo ? demo.focus : 'General Evaluation', // we don't have diagnosis in DB right now
              sessions: 0,
              wellness: wScore,
              mood_avg: 3.0,
              last_active: 'Recently',
              joined: new Date(prof?.created_at || link.created_at).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' }),
              keywords: [],
              avatar,
            };
          })
        );
        if (isMounted) setPatients(enriched);
      } else if (isMounted) {
        setPatients([]);
      }
      if (isMounted) setLoading(false);
    }
    fetchPatients();
    return () => { isMounted = false; };
  }, []);

  const riskOrder: Record<Risk, number> = { HIGH:0, MED:1, LOW:2 };

  const filtered = patients
    .filter(p => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.diagnosis.toLowerCase().includes(search.toLowerCase());
      const matchFilter = filter === 'ALL' || p.risk === filter;
      return matchSearch && matchFilter;
    })
    .sort((a, b) => {
      if (sortBy === 'risk') return riskOrder[a.risk] - riskOrder[b.risk];
      if (sortBy === 'wellness') return a.wellness - b.wellness;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });

  const handleAdd = async () => {
    alert('Please ask the patient to request a connection from their PsychAI app using your Therapist Code. We will add a manual link feature in a future update.');
    setShowModal(false);
  };

  const wColor = (w: number) => w >= 60 ? '#0E9F6E' : w >= 40 ? '#FBBF24' : '#E02424';

  return (
    <div className="p-7 max-w-6xl mx-auto animate-fade">
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="font-display font-extrabold text-3xl text-gray-900"><span className="gradient-text">Patients</span></h1>
          <p className="text-gray-500 text-sm mt-1">{patients.length} active · {patients.filter(p=>p.risk==='HIGH').length} high risk</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="bg-psych-500 hover:bg-psych-600 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-colors shadow-sm flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><line x1="12" y1="5" x2="12" y2="19" stroke="white" strokeWidth="2" strokeLinecap="round"/><line x1="5" y1="12" x2="19" y2="12" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>
          Add patient
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="relative flex-1 min-w-48">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="8" stroke="#9CA3AF" strokeWidth="1.8"/><path d="M21 21l-4.35-4.35" stroke="#9CA3AF" strokeWidth="1.8" strokeLinecap="round"/></svg>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search patients or diagnosis..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 hover:border-psych-300 rounded-xl text-sm focus:outline-none focus:border-psych-500 focus:ring-4 focus:ring-psych-500/10 bg-white transition-all duration-300 text-gray-900"/>
        </div>
        <div className="flex gap-2">
          {(['ALL','HIGH','MED','LOW'] as const).map(f => (
            <button key={f} onClick={()=>setFilter(f)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${filter===f?'bg-psych-500 text-white shadow-md shadow-psych-500/10 hover:bg-psych-600':'bg-white text-gray-500 border border-gray-200 hover:border-psych-300'}`}
            >{f === 'ALL' ? 'All' : f}</button>
          ))}
        </div>
        <select value={sortBy} onChange={e=>setSortBy(e.target.value as any)}
          className="border border-gray-200 hover:border-psych-300 rounded-xl text-sm px-3 py-2.5 focus:outline-none focus:border-psych-500 bg-white text-gray-600 transition-colors font-medium">
          <option value="risk">Sort: Risk level</option>
          <option value="wellness">Sort: Wellness</option>
          <option value="name">Sort: Name</option>
        </select>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              {['Patient','Risk','Wellness','Sessions','Last active',''].map(h => (
                <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-12">
                  <div className="inline-block w-8 h-8 border-2 border-psych-500 border-t-transparent rounded-full animate-spin"></div>
                </td>
              </tr>
            ) : filtered.map((p, idx) => (
              <tr key={p.id} 
                onClick={(e) => {
                  if (!(e.target as HTMLElement).closest('a')) {
                    router.push(`/patients/${p.id}`);
                  }
                }}
                className="border-b border-gray-50 hover:bg-psych-50/50 hover:-translate-y-[1px] hover:shadow-sm transition-all duration-200 cursor-pointer group animate-slide-up"
                style={{ animationDelay: `${idx * 40}ms` }}
              >
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-200 bg-psych-100">
                      <img src={getAvatarUrl(p.avatar)} alt={p.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <div className="font-bold text-gray-800 text-sm group-hover:text-psych-600 transition-colors">{p.name}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{p.diagnosis} · Age {p.age}</div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span className={`risk-${p.risk.toLowerCase()} text-xs font-bold px-2.5 py-1 rounded-full`}>{p.risk}</span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                      <div className="h-1.5 rounded-full transition-all duration-500" style={{ width:`${p.wellness}%`, background: wColor(p.wellness) }}></div>
                    </div>
                    <span className="text-xs font-bold text-gray-700">{p.wellness}%</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-sm text-gray-600 font-medium">{p.sessions}</td>
                <td className="px-5 py-4 text-sm text-gray-400 font-medium">{p.last_active}</td>
                <td className="px-5 py-4">
                  <Link href={`/patients/${p.id}`}
                    className="text-xs font-bold text-psych-500 hover:text-psych-700 opacity-0 group-hover:opacity-100 transition-opacity">
                    View →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm font-medium">No patients found.</div>
        )}
      </div>

      {/* ── Add Patient Modal ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md animate-spring overflow-hidden border border-gray-100">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h2 className="font-display font-extrabold text-gray-900 text-lg">Add new patient</h2>
                <p className="text-sm text-gray-400 mt-0.5 font-medium">Add a patient to your roster</p>
              </div>
              <button onClick={() => { setShowModal(false); setForm(EMPTY_FORM); }}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              </button>
            </div>
            
            <div className="p-8 text-center text-sm text-gray-600 leading-relaxed">
              <div className="w-16 h-16 bg-psych-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-psych-100">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--psych-500)" strokeWidth="1.8">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" strokeLinecap="round"/>
                </svg>
              </div>
              <p className="mb-4 text-gray-700">
                To link securely with a patient, please provide them with your <strong>Therapist Code</strong>.
              </p>
              <p className="text-xs text-gray-500">
                They can enter this code in their PsychAI app under <strong>Profile &gt; Connect to Clinician</strong> or when booking an appointment.
              </p>
            </div>

            <div className="flex gap-3 p-6 pt-0">
              <button onClick={() => { setShowModal(false); setForm(EMPTY_FORM); }}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-sm py-3 rounded-xl transition-all shadow-sm">
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
