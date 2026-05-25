import Sidebar from '@/components/Sidebar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gradient-mesh">
      <Sidebar />
      <main className="flex-1 md:ml-60 ml-0 min-h-screen pt-16 md:pt-0">
        {children}
      </main>
    </div>
  );
}
