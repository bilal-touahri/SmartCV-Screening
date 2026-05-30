'use client';

import { useState, useEffect } from 'react';
import { BaseSidebar } from '@/components/layout/BaseSidebar';
import { DashboardHeader } from '@/components/layout/DashboardHeader';

export default function RecruteurLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userName, setUserName]       = useState('Recruteur');
  const [userInitial, setUserInitial] = useState('R');

  useEffect(() => {
    try {
      const raw = localStorage.getItem('user');
      if (raw) {
        const u = JSON.parse(raw);
        const name = u.full_name ?? u.name ?? 'Recruteur';
        setUserName(name);
        setUserInitial(name.charAt(0).toUpperCase());
      }
    } catch { /* ignore */ }
  }, []);

  return (
    <div className="flex h-screen bg-gray-50">
      <BaseSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        roleType="recruteur"
        userInitial={userInitial}
        userName={userName}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader
          title="Tableau de bord"
          subtitle="Gestion des offres et candidatures"
          userRole="recruteur"
          userName={userName}
          userInitial={userInitial}
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
