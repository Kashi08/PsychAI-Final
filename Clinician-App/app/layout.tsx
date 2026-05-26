import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PsychAI   Clinician Dashboard',
  description: 'Professional psychologist dashboard for patient monitoring and analytics.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased bg-gray-50 text-gray-900 min-h-screen" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
