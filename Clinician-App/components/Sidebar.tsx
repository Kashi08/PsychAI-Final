'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import clsx from 'clsx';

const NAV = [
  { href:'/overview',   label:'Overview',   icon:GridIcon,    badge:null },
  { href:'/patients',   label:'Patients',   icon:UsersIcon,   badge:null },
  { href:'/requests',   label:'Requests',   icon:ConnectIcon, badge:null },
  { href:'/alerts',     label:'Alerts',     icon:AlertIcon,   badge:'3'  },
  { href:'/sessions',   label:'Sessions',   icon:CalIcon,     badge:null },
  { href:'/messages',   label:'Messages',   icon:MsgIcon,     badge:'2'  },
  { href:'/analytics',  label:'Analytics',  icon:ChartIcon,   badge:null },
  { href:'/reports',    label:'Reports',    icon:FileIcon,    badge:null },
  { href:'/settings',   label:'Settings',   icon:CogIcon,     badge:null },
];

export default function Sidebar({ psychName }: { psychName?: string }) {
  const path   = usePathname();
  const router = useRouter();
  const [pendingRequests, setPendingRequests] = useState(0);
  const [toast, setToast] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      const uid = data.user.id;

      // Initial count
      const { count } = await supabase
        .from('patient_links')
        .select('*', { count: 'exact', head: true })
        .eq('psychologist_id', uid)
        .eq('status', 'pending');
      
      if (count !== null) setPendingRequests(count);

      // Subscribe to new requests
      const channelId = `sidebar_requests_${uid}_${Date.now()}`;
      const channel = supabase.channel(channelId)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'patient_links', filter: `psychologist_id=eq.${uid}` }, (payload) => {
          if (payload.new.status === 'pending') {
            setPendingRequests(prev => prev + 1);
            setToast('New connection request!');
            setTimeout(() => setToast(''), 4000);
          }
        })
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'patient_links', filter: `psychologist_id=eq.${uid}` }, (payload) => {
          if (payload.old.status === 'pending' && payload.new.status !== 'pending') {
            setPendingRequests(prev => Math.max(0, prev - 1));
          } else if (payload.old.status !== 'pending' && payload.new.status === 'pending') {
            setPendingRequests(prev => prev + 1);
          }
        })
        .subscribe();
      
      return () => { supabase.removeChannel(channel); };
    });
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  return (
    <aside className="w-56 glass bg-white/80 border-r border-purple-100/50 h-screen flex flex-col fixed left-0 top-0 z-40 shadow-sm transition-all duration-300">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-purple-50/50">
        <div className="flex items-center gap-3.5 mb-2">
          <div className="w-12 h-12 flex items-center justify-center flex-shrink-0">
            <img src="/logo.png" alt="PsychAI Logo" className="w-12 h-12 object-contain hover:scale-105 transition-transform duration-200" />
          </div>
          <div>
            <div className="font-display font-extrabold text-lg text-gray-900 leading-none">PsychAI</div>
            <div className="text-sm text-blue-600 font-semibold leading-none mt-1.5">Clinician</div>
          </div>
        </div>

      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV.map(({ href, label, icon: Icon, badge }) => {
          const active = path === href || path.startsWith(href + '/');
          const finalBadge = href === '/requests' && pendingRequests > 0 ? pendingRequests.toString() : badge;
          return (
            <Link key={href} href={href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 group',
                active
                  ? 'bg-gradient-to-r from-psych-500 to-psych-600 text-white shadow-md shadow-psych-500/20'
                  : 'text-gray-500 hover:bg-psych-50 hover:text-psych-600 hover:translate-x-1'
              )}
            >
              <Icon active={active} />
              <span className="flex-1">{label}</span>
              {finalBadge && (
                <span className={clsx(
                  'text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200',
                  active ? 'bg-white text-psych-600 shadow-sm' : 'bg-red-500 text-white group-hover:scale-105'
                )}>{finalBadge}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Live indicator + sign out */}
      <div className="px-4 py-4 border-t border-purple-50/50 space-y-3">
        <div className="flex items-center gap-2 px-3 py-2.5 bg-green-50/80 border border-green-100/50 rounded-xl shadow-sm">
          <div className="relative flex-shrink-0">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_#10B981] alert-pulse-badge" style={{ '--alert-pulse-color': '16, 185, 129' } as any}></div>
          </div>
          <span className="text-xs text-green-700 font-bold">Live monitoring</span>
        </div>
        <button onClick={signOut}
          className="flex items-center gap-2 px-3 py-2 text-xs text-gray-400 hover:text-red-500 hover:bg-red-50/50 rounded-xl w-full transition-all duration-200 font-bold group">
          <svg className="transition-transform duration-200 group-hover:-translate-x-0.5" width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><polyline points="16 17 21 12 16 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
          Sign out
        </button>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-4 left-60 bg-psych-600 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-slide-up z-50">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
          <span className="text-sm font-bold">{toast}</span>
        </div>
      )}
    </aside>
  );
}

function GridIcon({active}:{active:boolean}) { return <svg className="transition-transform duration-300 group-hover:scale-110" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>; }
function UsersIcon({active}:{active:boolean}) { return <svg className="transition-transform duration-300 group-hover:scale-110" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" strokeLinecap="round"/></svg>; }
function AlertIcon({active}:{active:boolean}) { return <svg className="transition-transform duration-300 group-hover:scale-110" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" strokeLinecap="round"/></svg>; }
function CalIcon({active}:{active:boolean}) { return <svg className="transition-transform duration-300 group-hover:scale-110" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6" strokeLinecap="round"/><line x1="8" y1="2" x2="8" y2="6" strokeLinecap="round"/><line x1="3" y1="10" x2="21" y2="10" strokeLinecap="round"/></svg>; }
function MsgIcon({active}:{active:boolean}) { return <svg className="transition-transform duration-300 group-hover:scale-110" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>; }
function ChartIcon({active}:{active:boolean}) { return <svg className="transition-transform duration-300 group-hover:scale-110" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><line x1="18" y1="20" x2="18" y2="10" strokeLinecap="round"/><line x1="12" y1="20" x2="12" y2="4" strokeLinecap="round"/><line x1="6" y1="20" x2="6" y2="14" strokeLinecap="round"/></svg>; }
function FileIcon({active}:{active:boolean}) { return <svg className="transition-transform duration-300 group-hover:scale-110" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13" strokeLinecap="round"/><line x1="16" y1="17" x2="8" y2="17" strokeLinecap="round"/></svg>; }
function CogIcon({active}:{active:boolean}) { return <svg className="transition-transform duration-500 group-hover:rotate-90" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>; }
function ConnectIcon({active}:{active:boolean}) { return <svg className="transition-transform duration-300 group-hover:scale-110" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14" strokeLinecap="round"/><line x1="22" y1="11" x2="16" y2="11" strokeLinecap="round"/></svg>; }
