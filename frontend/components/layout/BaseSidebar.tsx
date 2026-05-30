'use client';

import { ChevronLeft, LogOut } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { SIDEBAR_ROUTES } from '@/lib/design-constants';
import * as LucideIcons from 'lucide-react';

interface BaseSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  roleType: 'candidat' | 'recruteur' | 'admin';
  userInitial: string;
  userName: string;
}

export function BaseSidebar({
  isOpen,
  onClose,
  roleType,
  userInitial,
  userName,
}: BaseSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const router   = useRouter();
  const routes   = SIDEBAR_ROUTES[roleType];

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    router.push('/auth/login');
  };

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 z-30 lg:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen z-40 flex flex-col
          bg-gradient-to-b from-[#0a2538] via-[#0D3349] to-[#0a2538]
          text-white shadow-2xl
          transition-all duration-300 ease-in-out
          lg:static lg:h-auto
          ${isCollapsed ? 'w-20' : 'w-64'}
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Decorative top glow */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#FF6B6B] to-transparent opacity-60" />

        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between shrink-0">
          <div
            className={`flex items-center gap-3 overflow-hidden transition-all duration-300 ${
              isCollapsed ? 'w-0 opacity-0' : 'w-full opacity-100'
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-digitelx.svg" alt="DIGITELX" width={36} height={36} className="shrink-0" />
            <span className="font-bold text-lg whitespace-nowrap">DIGITELX</span>
          </div>

          {isCollapsed && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src="/logo-digitelx.svg" alt="DIGITELX" width={36} height={36} className="mx-auto" />
          )}

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-1.5 rounded-lg hover:bg-white/10 transition-colors shrink-0 ml-2"
            aria-label="Toggle sidebar"
          >
            <ChevronLeft
              size={18}
              className={`transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}
            />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto overflow-x-hidden">
          {routes.map((route, index) => {
            const IconComponent = LucideIcons[route.icon as keyof typeof LucideIcons] as React.ComponentType<{ size?: number; className?: string }>;
            const active = isActive(route.href);

            return (
              <div
                key={route.href}
                className="relative group animate-slide-in-left"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <Link
                  href={route.href}
                  className={`
                    relative flex items-center gap-3 px-3 py-3 rounded-xl
                    transition-all duration-200 ease-out
                    ${active
                      ? 'bg-white/15 text-white shadow-inner'
                      : 'text-white/70 hover:bg-white/10 hover:text-white hover:translate-x-1'
                    }
                  `}
                >
                  {/* Active indicator bar */}
                  <span
                    className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 rounded-r-full bg-[#FF6B6B] transition-all duration-300 ${
                      active ? 'h-6 opacity-100' : 'h-0 opacity-0'
                    }`}
                  />

                  {/* Icon */}
                  <span className={`shrink-0 transition-transform duration-200 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>
                    <IconComponent
                      size={20}
                      className={active ? 'text-[#FF6B6B]' : ''}
                    />
                  </span>

                  {/* Label */}
                  <span
                    className={`text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                      isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
                    }`}
                  >
                    {route.label}
                  </span>

                  {/* Active dot */}
                  {active && !isCollapsed && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#FF6B6B] shrink-0" />
                  )}
                </Link>

                {/* Tooltip when collapsed */}
                {isCollapsed && (
                  <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 pointer-events-none">
                    <div className="bg-[#0D3349] border border-white/20 text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 -translate-x-2 group-hover:translate-x-0 transition-transform">
                      {route.label}
                      <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#0D3349]" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* User Footer */}
        <div className="p-3 border-t border-white/10 space-y-1 shrink-0">
          <div className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-300 ${isCollapsed ? 'justify-center' : ''}`}>
            {/* Avatar with pulse ring */}
            <div className="relative shrink-0">
              <div className="absolute inset-0 rounded-full bg-[#FF6B6B]/40 animate-ping opacity-75" style={{ animationDuration: '3s' }} />
              <div className="relative w-8 h-8 bg-gradient-to-br from-[#FF6B6B] to-[#ff8e53] rounded-full flex items-center justify-center font-bold text-sm shadow-lg">
                {userInitial}
              </div>
            </div>

            <div
              className={`flex-1 min-w-0 transition-all duration-300 ${
                isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
              }`}
            >
              <p className="text-sm font-semibold truncate">{userName}</p>
              <p className="text-xs text-white/50 capitalize">{roleType}</p>
            </div>
          </div>

          {/* Logout */}
          <div className="relative group">
            <button
              onClick={handleLogout}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                hover:bg-red-500/15 hover:text-red-400
                transition-all duration-200 text-sm text-white/60
                ${isCollapsed ? 'justify-center' : 'hover:translate-x-1'}
              `}
            >
              <LogOut size={18} className="shrink-0 transition-transform duration-200 group-hover:rotate-12" />
              <span className={`transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>
                Déconnexion
              </span>
            </button>

            {isCollapsed && (
              <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 pointer-events-none">
                <div className="bg-[#0D3349] border border-white/20 text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  Déconnexion
                  <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#0D3349]" />
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
