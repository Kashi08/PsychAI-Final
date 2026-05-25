import type { Metadata } from 'next';
import './globals.css';
import GlobalEffects from '@/components/GlobalEffects';
import { ThemeProvider } from '@/components/ThemeProvider';

export const metadata: Metadata = {
  title: 'PsychAI — Mental Wellness Companion',
  description: 'AI-powered mental health support for students and professionals.',
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className="antialiased bg-background text-foreground">
        <ThemeProvider>
          <GlobalEffects />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
