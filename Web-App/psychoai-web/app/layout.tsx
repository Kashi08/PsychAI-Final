import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PsychAI — Mental Wellness Companion',
  description: 'AI-powered mental health support for students and professionals.',
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
