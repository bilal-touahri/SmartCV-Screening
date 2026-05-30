import Link from 'next/link';
import { ArrowRight, ChevronDown } from 'lucide-react';

const STATS = [
  { value: '25+', label: 'Collaborateurs' },
  { value: '40+', label: 'Projets réalisés' },
  { value: '15+', label: 'Technologies maîtrisées' },
  { value: '98%', label: 'Satisfaction client' },
];

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col justify-center pt-16 overflow-hidden bg-[#0D3349]">

      {/* Grille de fond subtile */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
        backgroundSize: '80px 80px',
      }} />
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-[#FF6B6B] rounded-full opacity-[0.06] blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 right-0 w-96 h-96 bg-blue-400 rounded-full opacity-[0.06] blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">

        {/* Titre */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] tracking-tight mb-8">
          Construisons les solutions<br />
          <span className="text-[#FF6B6B]">digitales de demain</span>
        </h1>

        {/* Description */}
        <div className="max-w-2xl mx-auto space-y-4 mb-12">
          <p className="text-lg text-white/70 leading-relaxed">
            Chez DIGITELX, nous développons des plateformes web, des applications métier et des solutions
            d&apos;intelligence artificielle qui répondent à des problématiques réelles.
          </p>
          <p className="text-base text-white/55 leading-relaxed">
            Nous recherchons des développeurs, designers, data scientists et ingénieurs passionnés qui souhaitent
            participer à des projets innovants et évoluer au sein d&apos;une équipe ambitieuse.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20">
          <Link
            href="/offres"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#FF6B6B] text-white font-semibold rounded-xl hover:bg-[#ff5252] transition-colors shadow-lg shadow-[#FF6B6B]/20 text-[15px]"
          >
            Voir nos offres <ArrowRight size={17} />
          </Link>
          <a
            href="#culture"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white/8 border border-white/20 text-white font-semibold rounded-xl hover:bg-white/15 transition-colors text-[15px]"
          >
            Découvrir notre culture
          </a>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-white/10 rounded-2xl overflow-hidden border border-white/10">
          {STATS.map(s => (
            <div key={s.label} className="bg-white/5 px-6 py-5 text-center">
              <p className="text-3xl font-extrabold text-white">{s.value}</p>
              <p className="text-xs text-white/50 font-medium mt-1 uppercase tracking-wide">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/30 animate-bounce">
        <ChevronDown size={22} />
      </div>
    </section>
  );
}
