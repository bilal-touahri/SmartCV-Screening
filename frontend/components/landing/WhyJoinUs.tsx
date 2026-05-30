import { Layers, TrendingUp, MessageCircle, Clock } from 'lucide-react';

const ITEMS = [
  {
    icon: Layers,
    title: 'Des projets concrets',
    body: 'Chaque membre de l\'équipe contribue à des solutions utilisées par des entreprises, des institutions et des milliers d\'utilisateurs.',
  },
  {
    icon: TrendingUp,
    title: 'Une progression basée sur les compétences',
    body: 'Nous valorisons l\'apprentissage continu, le partage des connaissances et la montée en compétences sur des technologies modernes.',
  },
  {
    icon: MessageCircle,
    title: 'Une équipe accessible',
    body: 'Chez DIGITELX, les échanges sont simples et directs. Les idées sont encouragées quel que soit le poste ou le niveau d\'expérience.',
  },
  {
    icon: Clock,
    title: 'Un environnement flexible',
    body: 'Nous privilégions l\'autonomie, la confiance et l\'organisation pour permettre à chacun de donner le meilleur de lui-même.',
  },
];

export function WhyJoinUs() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white" id="culture">
      <div className="max-w-7xl mx-auto">

        <div className="text-center max-w-xl mx-auto mb-16">
          <p className="text-[#FF6B6B] font-semibold text-xs uppercase tracking-widest mb-3">Ce qui nous caractérise</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
            Pourquoi rejoindre DIGITELX ?
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {ITEMS.map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className="flex gap-5 p-7 bg-gray-50 border border-gray-100 rounded-2xl hover:border-[#FF6B6B]/30 hover:shadow-sm transition-all">
                <div className="w-11 h-11 bg-[#FF6B6B]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon size={20} className="text-[#FF6B6B]" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{item.body}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
