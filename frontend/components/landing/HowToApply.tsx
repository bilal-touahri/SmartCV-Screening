import Link from 'next/link';
import { UserPlus, Search, Send, ArrowRight } from 'lucide-react';

const STEPS = [
  {
    number: '01',
    icon: UserPlus,
    title: 'Créez votre profil',
    body: 'Complétez votre profil et importez votre CV.',
  },
  {
    number: '02',
    icon: Search,
    title: 'Choisissez une offre',
    body: 'Consultez les postes disponibles et trouvez celui qui correspond à vos compétences.',
  },
  {
    number: '03',
    icon: Send,
    title: 'Postulez en quelques clics',
    body: 'Votre candidature est transmise directement à notre équipe de recrutement.',
  },
];

export function HowToApply() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50/80" id="comment-postuler">
      <div className="max-w-7xl mx-auto">

        <div className="text-center max-w-xl mx-auto mb-16">
          <p className="text-[#FF6B6B] font-semibold text-xs uppercase tracking-widest mb-3">Rejoindre DIGITELX</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Comment nous rejoindre ?
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={i} className="relative bg-white border border-gray-100 rounded-2xl shadow-sm p-7 text-center">
                {/* Numéro watermark */}
                <span className="absolute top-5 right-6 text-6xl font-black text-gray-50 select-none leading-none">
                  {step.number}
                </span>
                <div className="relative z-10">
                  <div className="w-14 h-14 bg-[#0D3349] rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-md">
                    <Icon size={24} className="text-white" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{step.body}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center">
          <Link
            href="/offres"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#FF6B6B] text-white font-semibold rounded-xl hover:bg-[#ff5252] transition-colors shadow-md text-sm"
          >
            Voir les offres disponibles <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
