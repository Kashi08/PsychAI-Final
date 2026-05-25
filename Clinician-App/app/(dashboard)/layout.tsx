'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Sidebar from '@/components/Sidebar';

const THEMES: Record<string, Record<string, string>> = {
  purple: {
    '--psych-50': '#F0EDFB',
    '--psych-100': '#D8D0F5',
    '--psych-200': '#C2B5EF',
    '--psych-300': '#AA99E8',
    '--psych-400': '#937EE1',
    '--psych-500': '#7C6FCD',
    '--psych-600': '#5E51B5',
    '--psych-700': '#4A3E9E',
  },
  blue: {
    '--psych-50': '#EBF5FF',
    '--psych-100': '#C3E0FF',
    '--psych-200': '#93C5FD',
    '--psych-300': '#60A5FA',
    '--psych-400': '#3B82F6',
    '--psych-500': '#2563EB',
    '--psych-600': '#1D4ED8',
    '--psych-700': '#1E40AF',
  },
  rose: {
    '--psych-50': '#FFF1F2',
    '--psych-100': '#FFE4E6',
    '--psych-200': '#FECDD3',
    '--psych-300': '#FDA4AF',
    '--psych-400': '#FB7185',
    '--psych-500': '#F43F5E',
    '--psych-600': '#E11D48',
    '--psych-700': '#BE123C',
  },
  green: {
    '--psych-50': '#ECFDF5',
    '--psych-100': '#D1FAE5',
    '--psych-200': '#A7F3D0',
    '--psych-300': '#6EE7B7',
    '--psych-400': '#34D399',
    '--psych-500': '#10B981',
    '--psych-600': '#059669',
    '--psych-700': '#047857',
  }
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load theme
    const savedTheme = localStorage.getItem('psychai-theme') || 'purple';
    const themeColors = THEMES[savedTheme] || THEMES.purple;
    Object.entries(themeColors).forEach(([key, val]) => {
      document.documentElement.style.setProperty(key, val);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        router.push('/auth/login');
      }
    });

    const initSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error || !data.session) {
          supabase.auth.signOut();
          router.push('/auth/login');
          return;
        }
        const { data: p } = await supabase.from('psychologist_profiles').select('full_name').eq('user_id', data.session.user.id).single();
        setName(p?.full_name || data.session.user.email?.split('@')[0] || 'Doctor');
        setLoading(false);
      } catch (err) {
        console.error('Session error:', err);
        supabase.auth.signOut();
        router.push('/auth/login');
      }
    };
    initSession();

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-10 h-10 border-2 border-psych-500 border-t-transparent rounded-full animate-spin"/>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gradient-mesh">
      <Sidebar psychName={name} />
      <main className="flex-1 ml-56 min-h-screen">{children}</main>
    </div>
  );
}
