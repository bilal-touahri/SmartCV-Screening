import { Users2, Star, Lightbulb, BookOpen, Check } from 'lucide-react';

const VALEURS = [
  {
    icon: Users2,
    title: 'Collaboration',
    body: 'Nous croyons que les meilleurs résultats naissent de la communication et du travail d\'équipe.',
  },
  {
    icon: Star,
    title: 'Qualité',
    body: 'Revue de code, tests et amélioration continue font partie de notre quotidien.',
  },
  {
    icon: Lightbulb,
    title: 'Innovation',
    body: 'Nous encourageons l\'expérimentation et l\'adoption de nouvelles technologies lorsqu\'elles apportent une réelle valeur.',
  },
  {
    icon: BookOpen,
    title: 'Apprentissage',
    body: 'Chaque projet est une opportunité de progresser et d\'acquérir de nouvelles compétences.',
  },
];

const AVANTAGES = [
  'Horaires flexibles',
  'Télétravail partiel selon les postes',
  'Budget annuel de formation',
  'Certifications techniques',
  'Participation à des événements technologiques',
  'Équipement de travail moderne',
  'Opportunités d\'évolution professionnelle',
  'Environnement de travail collaboratif',
];

export function LifeAtCompany() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

          {/* Gauche — façon de travailler */}
          <div>
            <p className="text-[#FF6B6B] font-semibold text-xs uppercase tracking-widest mb-3">Notre façon de travailler</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-10 leading-tight">
              Comment nous fonctionnons
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {VALEURS.map((v, i) => {
                const Icon = v.icon;
                return (
                  <div key={i} className="p-5 bg-gray-50 border border-gray-100 rounded-2xl">
                    <div className="w-9 h-9 bg-[#0D3349]/8 rounded-lg flex items-center justify-center mb-3">
                      <Icon size={17} className="text-[#0D3349]" />
                    </div>
                    <h3 className="font-bold text-gray-900 text-sm mb-1.5">{v.title}</h3>
                    <p className="text-gray-500 text-xs leading-relaxed">{v.body}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Droite — avantages */}
          <div className="lg:sticky lg:top-24">
            <div className="bg-gradient-to-br from-[#0D3349] to-[#1a4a6b] rounded-2xl p-8 text-white">
              <p className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-2">Ce que nous offrons</p>
              <h3 className="text-xl font-bold mb-7">Les avantages DIGITELX</h3>

              <ul className="space-y-3.5">
                {AVANTAGES.map((a, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-[#FF6B6B]/20 border border-[#FF6B6B]/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check size={10} className="text-[#FF6B6B]" strokeWidth={3} />
                    </span>
                    <span className="text-white/80 text-sm">{a}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
