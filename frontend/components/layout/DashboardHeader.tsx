'use client';

import { Bell, Menu, ChevronDown, LogOut, User, Settings } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  userRole: 'candidat' | 'recruteur' | 'admin';
  userName?: string;
  userInitial?: string;
  onMenuClick?: () => void;
}

const ROLE_CFG = {
  admin:     { label: 'Administrateur', gradient: 'from-red-500 to-rose-600',     badge: 'bg-red-50 text-red-600 border-red-200' },
  recruteur: { label: 'Recruteur',      gradient: 'from-violet-500 to-purple-600', badge: 'bg-violet-50 text-violet-600 border-violet-200' },
  candidat:  { label: 'Candidat',       gradient: 'from-blue-500 to-indigo-600',   badge: 'bg-blue-50 text-blue-600 border-blue-200' },
};

export function DashboardHeader({
  title,
  subtitle,
  userRole,
  userName = 'Utilisateur',
  userInitial = 'U',
  onMenuClick,
}: DashboardHeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [realName, setRealName]         = useState(userName);
  const [initial, setInitial]           = useState(userInitial);
  const dropdownRef                     = useRef<HTMLDivElement>(null);
  const router                          = useRouter();
  const cfg                             = ROLE_CFG[userRole];

  /* Load real user from localStorage */
  useEffect(() => {
    try {
      const raw = localStorage.getItem('user');
      if (raw) {
        const u = JSON.parse(raw);
        const name = u.full_name ?? u.name ?? userName;
        setRealName(name);
        setInitial(name.split(' ').map((w: string) => w[0] ?? '').join('').toUpperCase().slice(0, 2) || 'U');
      }
    } catch { /* ignore */ }
  }, [userName]);

  /* Close dropdown on outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    router.push('/auth/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-white backdrop-blur-md border-b border-gray-200 shadow-sm">

      {/* Accent line top */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#FF6B6B] to-transparent opacity-70" />

      <div className="px-5 h-16 flex items-center justify-between gap-4">

        {/* Left — menu + title */}
        <div className="flex items-center gap-4 min-w-0">
          <button
            onClick={onMenuClick}
            className="p-2 hover:bg-gray-100 rounded-xl lg:hidden text-gray-600 hover:text-gray-900 transition-colors"
          >
            <Menu size={20} />
          </button>

          <div className="min-w-0">
            <h1 className="text-base font-semibold text-gray-900 leading-tight truncate">{title}</h1>
            {subtitle && (
              <p className="text-xs text-gray-500 mt-0.5 hidden sm:block truncate">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Right — bell + user */}
        <div className="flex items-center gap-2 shrink-0">

          {/* Bell */}
          <button className="relative p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors">
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#FF6B6B] rounded-full" />
          </button>

          {/* Role badge */}
          <span className={`hidden md:flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${cfg.badge}`}>
            {cfg.label}
          </span>

          {/* User menu */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(v => !v)}
              className="flex items-center gap-2.5 pl-1 pr-2 py-1 hover:bg-gray-100 rounded-xl transition-colors group"
            >
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${cfg.gradient} flex items-center justify-center text-white text-xs font-bold shadow-md ring-2 ring-gray-200`}>
                {initial}
              </div>
              <span className="hidden sm:block text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors max-w-[120px] truncate">
                {realName}
              </span>
              <ChevronDown
                size={14}
                className={`text-gray-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {/* Dropdown */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-200 rounded-2xl shadow-lg py-1.5 overflow-hidden">
                {/* User info */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-900 truncate">{realName}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{cfg.label}</p>
                </div>

                <div className="py-1">
                  <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors">
                    <User size={15} /> Mon profil
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors">
                    <Settings size={15} /> Paramètres
                  </button>
                </div>

                <div className="border-t border-gray-100 pt-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={15} /> Déconnexion
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
