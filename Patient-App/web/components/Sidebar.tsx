'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import clsx from 'clsx';

const NAV = [
  { href: '/dashboard',   label: 'Home',      icon: HomeIcon },
  { href: '/chat',        label: 'AI Chat',   icon: ChatIcon },
  { href: '/mood',        label: 'Mood',      icon: HeartIcon },
  { href: '/journal',     label: 'Journal',   icon: BookIcon },
  { href: '/mindfulness', label: 'Breathe',   icon: WindIcon },
  { href: '/symptoms',    label: 'Symptoms',  icon: AlertIcon },
  { href: '/messages',     label: 'Messages',     icon: MessageIcon },
  { href: '/appointments', label: 'Appointments', icon: CalendarIcon },
  { href: '/profile',     label: 'Profile',   icon: UserIcon },
];

export default function Sidebar() {
  const path   = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  return (
    <>
      {/* Mobile Top Header Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 glass bg-white/80 border-b border-teal-100/50 flex items-center justify-between px-4 z-40 shadow-sm">
        <button 
          onClick={() => setIsOpen(true)} 
          className="p-2 -ml-2 text-gray-500 hover:text-teal-600 focus:outline-none transition-colors"
          aria-label="Open menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
            <img src="/logo.png" alt="PsychAI Logo" className="w-10 h-10 object-contain hover:scale-105 transition-transform duration-200" />
          </div>
          <div>
            <div className="font-display font-extrabold text-sm text-gray-900 leading-none">PsychAI</div>
          </div>
        </div>
        <div className="w-8 h-8" /> {/* Balance spacer */}
      </div>

      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)} 
          className="md:hidden fixed inset-0 bg-black/25 backdrop-blur-xs z-40 transition-opacity duration-300 animate-fade-in"
        />
      )}

      {/* Sidebar Content */}
      <aside className={clsx(
        "w-60 glass bg-white/80 border-r border-teal-100/50 h-screen flex flex-col fixed top-0 z-50 shadow-sm transition-all duration-300",
        isOpen ? "left-0" : "-left-60 md:left-0"
      )}>
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-teal-50/50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 flex items-center justify-center flex-shrink-0">
              <img src="/logo.png" alt="PsychAI Logo" className="w-12 h-12 object-contain hover:scale-105 transition-transform duration-200" />
            </div>
            <div>
              <div className="font-display font-extrabold text-base text-gray-900 leading-none">PsychAI</div>
              <div className="text-xs text-teal-600 font-bold leading-none mt-1">Companion</div>
            </div>
          </div>
          {/* Close button on mobile */}
          <button 
            onClick={() => setIsOpen(false)} 
            className="md:hidden p-1 text-gray-400 hover:text-red-500 focus:outline-none transition-colors"
            aria-label="Close menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = path === href || path.startsWith(href + '/');
            return (
              <Link 
                key={href} 
                href={href}
                onClick={() => setIsOpen(false)}
                className={clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 group',
                  active
                    ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-md shadow-teal-500/20'
                    : 'text-gray-500 hover:bg-teal-50 hover:text-teal-600 hover:translate-x-1'
                )}
              >
                <Icon active={active} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Live companion active indicator + sign out */}
        <div className="px-4 py-4 border-t border-teal-50/50 space-y-3">
          <div className="flex items-center gap-2.5 px-3 py-2.5 bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-100/60 rounded-xl shadow-sm">
            <div className="relative flex-shrink-0">
              {/* Outer pulse ring */}
              <div className="absolute inset-0 rounded-full bg-teal-400 opacity-30 status-dot-pulse" style={{ width: 10, height: 10 }} />
              {/* Inner solid dot */}
              <div className="w-2.5 h-2.5 rounded-full bg-teal-500 shadow-[0_0_6px_#0DA99E] relative z-10" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-extrabold text-teal-700 leading-none">Companion Active</div>
              <div className="text-[10px] text-teal-500 font-medium mt-0.5 leading-none">Monitoring your wellness</div>
            </div>
          </div>
          <button onClick={signOut}
            className="flex items-center gap-2 px-3 py-2 text-xs text-gray-400 hover:text-red-500 hover:bg-red-50/50 rounded-xl w-full transition-all duration-200 font-bold group"
          >
            <svg className="transition-transform duration-200 group-hover:-translate-x-0.5" width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              <polyline points="16 17 21 12 16 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}

function HomeIcon({ active }: { active: boolean }) {
  const c = active ? 'currentColor' : '#9CA3AF';
  return <svg className="transition-transform duration-300 group-hover:scale-110" width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke={c} strokeWidth="1.8"/><polyline points="9 22 9 12 15 12 15 22" stroke={c} strokeWidth="1.8"/></svg>;
}
function ChatIcon({ active }: { active: boolean }) {
  const c = active ? 'currentColor' : '#9CA3AF';
  return <svg className="transition-transform duration-300 group-hover:scale-110" width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke={c} strokeWidth="1.8"/></svg>;
}
function HeartIcon({ active }: { active: boolean }) {
  const c = active ? 'currentColor' : '#9CA3AF';
  return <svg className="transition-transform duration-300 group-hover:scale-110" width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" stroke={c} strokeWidth="1.8"/></svg>;
}
function BookIcon({ active }: { active: boolean }) {
  const c = active ? 'currentColor' : '#9CA3AF';
  return <svg className="transition-transform duration-300 group-hover:scale-110" width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke={c} strokeWidth="1.8"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" stroke={c} strokeWidth="1.8"/></svg>;
}
function WindIcon({ active }: { active: boolean }) {
  const c = active ? 'currentColor' : '#9CA3AF';
  return <svg className="transition-transform duration-300 group-hover:scale-110" width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9.59 4.59A2 2 0 1113 6H2" stroke={c} strokeWidth="1.8" strokeLinecap="round"/><path d="M11.37 17.59A2 2 0 1115 19H2" stroke={c} strokeWidth="1.8" strokeLinecap="round"/><path d="M14.59 10.59A2 2 0 1118 12H2" stroke={c} strokeWidth="1.8" strokeLinecap="round"/></svg>;
}
function AlertIcon({ active }: { active: boolean }) {
  const c = active ? 'currentColor' : '#9CA3AF';
  return <svg className="transition-transform duration-300 group-hover:scale-110" width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke={c} strokeWidth="1.8"/><line x1="12" y1="9" x2="12" y2="13" stroke={c} strokeWidth="1.8" strokeLinecap="round"/></svg>;
}
function MessageIcon({ active }: { active: boolean }) {
  const c = active ? 'currentColor' : '#9CA3AF';
  return <svg className="transition-transform duration-300 group-hover:scale-110" width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke={c} strokeWidth="1.8"/><line x1="9" y1="10" x2="15" y2="10" stroke={c} strokeWidth="1.8" strokeLinecap="round"/><line x1="9" y1="14" x2="12" y2="14" stroke={c} strokeWidth="1.8" strokeLinecap="round"/></svg>;
}
function UserIcon({ active }: { active: boolean }) {
  const c = active ? 'currentColor' : '#9CA3AF';
  return <svg className="transition-transform duration-300 group-hover:scale-110" width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke={c} strokeWidth="1.8"/><circle cx="12" cy="7" r="4" stroke={c} strokeWidth="1.8"/></svg>;
}
function CalendarIcon({ active }: { active: boolean }) {
  const c = active ? 'currentColor' : '#9CA3AF';
  return <svg className="transition-transform duration-300 group-hover:scale-110" width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="3" stroke={c} strokeWidth="1.8"/><path d="M16 2v4M8 2v4M3 10h18" stroke={c} strokeWidth="1.8" strokeLinecap="round"/></svg>;
}