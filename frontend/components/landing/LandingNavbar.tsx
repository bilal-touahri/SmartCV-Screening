'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export function LogoIcon({ size = 36 }: { size?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo-digitelx.svg"
      alt="DIGITELX"
      width={size}
      height={size}
      style={{ display: 'block' }}
    />
  );
}

const NAV_LINKS = [
  { label: 'Accueil', href: '/' },
  { label: 'Offres',  href: '/offres' },
];

export function LandingNavbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-[#0D3349]/90 backdrop-blur-md border-b border-white/10">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 hover:opacity-90 transition">
          <LogoIcon />
          <span className="font-bold text-lg text-white tracking-tight leading-none">
            DIGITEL<span className="text-[#FF6B6B]">X</span>
          </span>
        </Link>

        {/* Desktop — centre */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(l => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-white/15 text-white'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </div>

        {/* Desktop — droite */}
        <div className="hidden md:flex items-center gap-2 flex-shrink-0">
          <Link
            href="/auth/login"
            className="px-4 py-2 text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            Se connecter
          </Link>
          <Link
            href="/auth/register"
            className="px-4 py-2 text-sm font-semibold bg-[#FF6B6B] text-white rounded-lg hover:bg-[#ff5252] transition-colors shadow-sm"
          >
            S&apos;inscrire
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 text-white/80 hover:text-white transition-colors"
          onClick={() => setOpen(v => !v)}
          aria-label="Menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-[#0D3349] border-t border-white/10 px-4 py-4 space-y-1">
          {NAV_LINKS.map(l => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block px-4 py-2.5 rounded-lg text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              {l.label}
            </Link>
          ))}
          <div className="border-t border-white/15 mt-3 pt-3 flex flex-col gap-2">
            <Link href="/auth/login" onClick={() => setOpen(false)}
              className="block px-4 py-2.5 rounded-lg text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors text-center">
              Se connecter
            </Link>
            <Link href="/auth/register" onClick={() => setOpen(false)}
              className="block px-4 py-2.5 rounded-lg text-sm font-semibold bg-[#FF6B6B] text-white hover:bg-[#ff5252] transition-colors text-center">
              S&apos;inscrire
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
