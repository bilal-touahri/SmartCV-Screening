import Link from 'next/link';
import { LogoIcon } from './LandingNavbar';

const FOOTER_LINKS = {
  Candidats: [
    { label: 'Toutes les offres',  href: '/offres' },
    { label: 'Comment postuler',   href: '#comment-postuler' },
    { label: 'Créer un compte',    href: '/auth/register' },
    { label: 'Se connecter',       href: '/auth/login' },
  ],
  Recruteurs: [
    { label: 'Espace recruteur',   href: '/auth/login' },
    { label: 'Publier une offre',  href: '/auth/login' },
    { label: 'Gérer les candidatures', href: '/auth/login' },
  ],
  Entreprise: [
    { label: 'Notre culture',      href: '#culture' },
    { label: 'Notre stack tech',   href: '#stack' },
    { label: 'Contact',            href: '#contact' },
  ],
};

export function LandingFooter() {
  return (
    <footer className="bg-[#060f1a] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">

        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">

          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4 hover:opacity-90 transition">
              <LogoIcon size={32} />
              <span className="font-bold text-lg tracking-tight">
                DIGITEL<span className="text-[#FF6B6B]">X</span>
              </span>
            </Link>
            <p className="text-white/45 text-sm leading-relaxed max-w-xs">
              Entreprise tech marocaine. Nous recrutons des talents passionnés pour construire des produits digitaux ambitieux.
            </p>
            <div className="flex items-center gap-1.5 mt-5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-white/40 text-xs font-medium">On recrute · Maroc & Remote</span>
            </div>
          </div>

          {/* Links */}
          {Object.entries(FOOTER_LINKS).map(([section, links]) => (
            <div key={section}>
              <h4 className="text-white/80 font-semibold text-sm mb-4">{section}</h4>
              <ul className="space-y-2.5">
                {links.map(l => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-white/40 text-sm hover:text-white/80 transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/8 pt-8 flex items-center justify-end gap-5 text-sm text-white/30">
          <Link href="#" className="hover:text-white/60 transition-colors">Confidentialité</Link>
          <Link href="#" className="hover:text-white/60 transition-colors">CGU</Link>
        </div>
      </div>
    </footer>
  );
}
