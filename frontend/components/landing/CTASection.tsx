import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function CTASection() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-[#0D3349] relative overflow-hidden">
      <div className="absolute -top-20 -right-20 w-80 h-80 bg-[#FF6B6B] rounded-full opacity-[0.07] blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-blue-400 rounded-full opacity-[0.06] blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-2xl mx-auto text-center">
        <p className="text-[#FF6B6B] font-semibold text-xs uppercase tracking-widest mb-6">Rejoignez l&apos;aventure</p>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-5 leading-tight">
          Votre prochain défi professionnel commence ici
        </h2>
        <p className="text-white/60 text-base mb-8 leading-relaxed">
          Nous recherchons des personnes curieuses, motivées et passionnées par la technologie
          pour construire les solutions de demain.
        </p>
        <p className="text-white/45 text-sm mb-10">
          Découvrez nos opportunités et rejoignez l&apos;aventure DIGITELX.
        </p>
        <Link
          href="/offres"
          className="inline-flex items-center gap-2 px-9 py-3.5 bg-[#FF6B6B] text-white font-semibold rounded-xl hover:bg-[#ff5252] transition-colors shadow-lg shadow-[#FF6B6B]/25 text-[15px]"
        >
          Voir les offres <ArrowRight size={17} />
        </Link>
      </div>
    </section>
  );
}
