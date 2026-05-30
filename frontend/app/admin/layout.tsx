'use client';

import { useState } from 'react';
import { BaseSidebar } from '@/components/layout/BaseSidebar';
import { DashboardHeader } from '@/components/layout/DashboardHeader';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50">
      <BaseSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        roleType="admin"
        userInitial="A"
        userName="Admin"
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader
          title="Tableau de bord"
          subtitle="Administration du portail"
          userRole="admin"
          userName="Admin"
          userInitial="A"
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
