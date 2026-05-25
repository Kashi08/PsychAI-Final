'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import clsx from 'clsx';

const NAV = [
  { href: '/dashboard',    label: 'Home',      icon: HomeIcon },
  { href: '/chat',         label: 'AI Chat',   icon: ChatIcon },
  { href: '/mood',         label: 'Mood',      icon: HeartIcon },
  { href: '/journal',      label: 'Journal',   icon: BookIcon },
  { href: '/mindfulness',  label: 'Breathe',   icon: WindIcon },
  { href: '/symptoms',     label: 'Symptoms',  icon: AlertIcon },
  { href: '/profile',      label: 'Profile',   icon: UserIcon },
];

export default function Sidebar() {
  const path = usePathname();
  const router = useRouter();

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  return (
    <aside className="w-60 bg-white border-r border-gray-100 h-screen flex flex-col fixed left-0 top-0 z-40">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-100">
        <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center flex-shrink-0">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M12 5C12 5 8 4 6 7C4 10 5 13 7 14C5 15 4 17 5 19C6 21 9 22 12 21" stroke="#0DA99E" strokeWidth="1.8" strokeLinecap="round"/>
            <path d="M12 5C12 5 16 4 18 7C20 10 19 13 17 14C19 15 20 17 19 19C18 21 15 22 12 21" stroke="#0DA99E" strokeWidth="1.8" strokeLinecap="round"/>
            <line x1="12" y1="5" x2="12" y2="21" stroke="#0DA99E" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </div>
        <div>
          <div className="font-display font-extrabold text-base text-gray-900 leading-none">PsychAI</div>
          <div className="text-xs text-gray-400 leading-none mt-0.5">Wellness companion</div>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = path === href || path.startsWith(href + '/');
          return (
            <Link key={href} href={href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                active
                  ? 'bg-teal-50 text-teal-700'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <Icon active={active} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Sign out */}
      <div className="px-3 py-4 border-t border-gray-100">
        <button onClick={signOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-red-500 hover:bg-red-50 w-full transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><polyline points="16 17 21 12 16 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
          Sign out
        </button>
      </div>
    </aside>
  );
}

function HomeIcon({ active }: { active: boolean }) {
  const c = active ? '#0DA99E' : '#9CA3AF';
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke={c} strokeWidth="1.8"/><polyline points="9 22 9 12 15 12 15 22" stroke={c} strokeWidth="1.8"/></svg>;
}
function ChatIcon({ active }: { active: boolean }) {
  const c = active ? '#0DA99E' : '#9CA3AF';
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke={c} strokeWidth="1.8"/></svg>;
}
function HeartIcon({ active }: { active: boolean }) {
  const c = active ? '#0DA99E' : '#9CA3AF';
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" stroke={c} strokeWidth="1.8"/></svg>;
}
function BookIcon({ active }: { active: boolean }) {
  const c = active ? '#0DA99E' : '#9CA3AF';
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke={c} strokeWidth="1.8"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" stroke={c} strokeWidth="1.8"/></svg>;
}
function WindIcon({ active }: { active: boolean }) {
  const c = active ? '#0DA99E' : '#9CA3AF';
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9.59 4.59A2 2 0 1113 6H2" stroke={c} strokeWidth="1.8" strokeLinecap="round"/><path d="M11.37 17.59A2 2 0 1015 19H2" stroke={c} strokeWidth="1.8" strokeLinecap="round"/><path d="M14.59 10.59A2 2 0 1118 12H2" stroke={c} strokeWidth="1.8" strokeLinecap="round"/></svg>;
}
function AlertIcon({ active }: { active: boolean }) {
  const c = active ? '#0DA99E' : '#9CA3AF';
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke={c} strokeWidth="1.8"/><line x1="12" y1="9" x2="12" y2="13" stroke={c} strokeWidth="1.8" strokeLinecap="round"/></svg>;
}
function UserIcon({ active }: { active: boolean }) {
  const c = active ? '#0DA99E' : '#9CA3AF';
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke={c} strokeWidth="1.8"/><circle cx="12" cy="7" r="4" stroke={c} strokeWidth="1.8"/></svg>;
}
