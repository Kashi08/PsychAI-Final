'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { getAvatarUrl } from '@/lib/avatars';
import { DEMO_PATIENTS } from '@/lib/demo-patients';

interface Request {
  id: string;
  patient_id: string;
  psychologist_id: string;
  status: string;
  created_at: string;
  patient_name?: string;
  patient_email?: string;
  patient_age?: number;
  patient_avatar?: string;
}

export default function RequestsPage() {
  const [requests, setRequests]   = useState<Request[]>([]);
  const [loading, setLoading]     = useState(true);
  const [userId, setUserId]       = useState('');
  const [actionId, setActionId]   = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    let subscription: any = null;
    let isMounted = true;

    async function loadData() {
      const { data } = await supabase.auth.getUser();
      if (!data.user || !isMounted) return;
      const uid = data.user.id;
      setUserId(uid);

      // Fetch pending connection requests directed at this psychologist
      const { data: reqs } = await supabase
        .from('patient_links')
        .select('*')
        .eq('psychologist_id', uid)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (reqs && reqs.length > 0 && isMounted) {
        // Enrich with patient profile names
        const enriched = await Promise.all(
          reqs.map(async (r: Request) => {
            const { data: prof } = await supabase
              .from('profiles')
              .select('full_name, age, avatar_url')
              .eq('user_id', r.patient_id)
              .maybeSingle();
            const demo = DEMO_PATIENTS[r.patient_id];
            const fallbackName = demo ? demo.name : (r.patient_id === '591a9eca-59d2-48ca-962c-e2fd4243f258' ? 'kashish'
                               : r.patient_id === '144cc8cc-a19a-49f8-af45-add6349afd9b' ? 'Sneha Joshi'
                               : 'Anonymous Patient');
            const fallbackAvatar = demo ? demo.avatar : (r.patient_id === '591a9eca-59d2-48ca-962c-e2fd4243f258' ? 'Felix'
                                 : r.patient_id === '144cc8cc-a19a-49f8-af45-add6349afd9b' ? 'Emma'
                                 : 'Felix');
            return {
              ...r,
              patient_name: prof?.full_name || fallbackName,
              patient_age: prof?.age || null,
              patient_avatar: prof?.avatar_url || fallbackAvatar,
            };
          })
        );
        if (isMounted) setRequests(enriched);
      } else if (isMounted) {
        setRequests([]);
      }
      if (isMounted) setLoading(false);

      // Real-time subscription
      subscription = supabase.channel('requests-channel')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'patient_links', filter: `psychologist_id=eq.${uid}` }, async (payload) => {
          if (payload.new.status === 'pending') {
            const { data: prof } = await supabase.from('profiles').select('full_name, age, avatar_url').eq('user_id', payload.new.patient_id).maybeSingle();
            const demo = DEMO_PATIENTS[payload.new.patient_id];
            const fallbackName = demo ? demo.name : (payload.new.patient_id === '591a9eca-59d2-48ca-962c-e2fd4243f258' ? 'kashish'
                               : payload.new.patient_id === '144cc8cc-a19a-49f8-af45-add6349afd9b' ? 'Sneha Joshi'
                               : 'Anonymous Patient');
            const fallbackAvatar = demo ? demo.avatar : (payload.new.patient_id === '591a9eca-59d2-48ca-962c-e2fd4243f258' ? 'Felix'
                                 : payload.new.patient_id === '144cc8cc-a19a-49f8-af45-add6349afd9b' ? 'Emma'
                                 : 'Felix');
            const newReq = {
              ...payload.new as Request,
              patient_name: prof?.full_name || fallbackName,
              patient_age: prof?.age || null,
              patient_avatar: prof?.avatar_url || fallbackAvatar,
            };
            setRequests(prev => [newReq, ...prev]);
          }
        })
        .subscribe();
    }
    
    loadData();

    return () => {
      isMounted = false;
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, []);

  const handleAction = async (req: Request, action: 'active' | 'rejected') => {
    setActionId(req.id);
    await supabase
      .from('patient_links')
      .update({ status: action })
      .eq('id', req.id);

    setRequests(prev => prev.filter(r => r.id !== req.id));
    setSuccessMsg(
      action === 'active'
        ? `✓ Accepted — ${req.patient_name} is now linked to your account.`
        : `✗ Declined request from ${req.patient_name}.`
    );
    setTimeout(() => setSuccessMsg(''), 4000);
    setActionId(null);
  };

  const initials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="p-7 max-w-4xl mx-auto animate-fade">
      {/* Header */}
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="font-display font-extrabold text-3xl text-gray-900 flex items-center gap-2">
            <span className="gradient-text">Connection Requests</span>
            {requests.length > 0 && (
              <span className="bg-red-500 text-white text-xs font-black w-5 h-5 rounded-full flex items-center justify-center">
                {requests.length}
              </span>
            )}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Patients requesting to link with your account from the PsychAI patient app.
          </p>
        </div>
      </div>

      {/* Success Toast */}
      {successMsg && (
        <div className={`mb-5 px-5 py-3.5 rounded-2xl text-sm font-semibold flex items-center gap-3 animate-fade border ${
          successMsg.startsWith('✓')
            ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
            : 'bg-red-50 border-red-100 text-red-700'
        }`}>
          {successMsg}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-2 border-psych-500 border-t-transparent rounded-full animate-spin"/>
        </div>
      ) : requests.length === 0 ? (
        /* Empty state */
        <div className="card p-14 text-center">
          <div className="w-16 h-16 bg-psych-50 rounded-3xl flex items-center justify-center mx-auto mb-5 border border-psych-100">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--psych-500)" strokeWidth="1.8">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" strokeLinecap="round"/>
            </svg>
          </div>
          <h3 className="font-display font-bold text-gray-900 mb-2">No pending requests</h3>
          <p className="text-sm text-gray-400 max-w-sm mx-auto leading-relaxed">
            When patients discover and request to link with you through the PsychAI patient app, their requests will appear here.
          </p>
          <div className="mt-6 bg-psych-50 border border-psych-100 rounded-2xl px-5 py-4 max-w-sm mx-auto">
            <p className="text-xs text-psych-700 leading-relaxed">
              <strong>Tip:</strong> Share your Psychologist code with patients so they can connect directly from their Profile settings.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map(req => (
            <div
              key={req.id}
              className="card p-6 hover:shadow-md transition-all duration-200 border border-gray-100 hover:border-psych-100"
            >
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="w-14 h-14 rounded-2xl overflow-hidden flex items-center justify-center flex-shrink-0 border border-psych-200 bg-psych-100">
                  <img src={getAvatarUrl(req.patient_avatar || 'Felix')} alt={req.patient_name || 'Patient'} className="w-full h-full object-cover" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <h3 className="font-display font-bold text-gray-900 text-base">
                        {req.patient_name}
                      </h3>
                      <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-2">
                        {req.patient_age && <span>Age {req.patient_age}</span>}
                        {req.patient_age && <span>·</span>}
                        <span>Requested {format(new Date(req.created_at), 'MMM d, yyyy · h:mm a')}</span>
                      </p>
                    </div>
                    <span className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold px-3 py-1 rounded-full flex-shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"/>
                      Pending
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-3 mt-4">
                    <button
                      onClick={() => handleAction(req, 'active')}
                      disabled={actionId === req.id}
                      className="flex items-center gap-2 bg-psych-500 hover:bg-psych-600 disabled:opacity-50 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all active:scale-95 shadow-sm shadow-psych-500/20"
                    >
                      {actionId === req.id ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                      ) : (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      )}
                      Accept & Link
                    </button>
                    <button
                      onClick={() => handleAction(req, 'rejected')}
                      disabled={actionId === req.id}
                      className="flex items-center gap-2 bg-white hover:bg-red-50 border border-gray-200 hover:border-red-200 disabled:opacity-50 text-gray-600 hover:text-red-600 text-sm font-bold px-5 py-2.5 rounded-xl transition-all active:scale-95"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                      Decline
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Info banner */}
          <div className="bg-psych-50 border border-psych-100 rounded-2xl px-5 py-4 flex items-start gap-3">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-psych-500 mt-0.5 flex-shrink-0">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8"/>
              <path d="M12 16v-4M12 8h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <p className="text-xs text-psych-700 leading-relaxed">
              Accepting a request creates a live link between the patient and your clinician account.
              They can immediately book appointments and you'll see their mood logs, journals and wellness scores on your dashboard.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
