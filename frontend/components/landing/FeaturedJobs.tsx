'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MapPin, Clock, ArrowRight, Briefcase } from 'lucide-react';

type Offre = {
  id: number;
  title: string;
  description: string;
  competences: string;
  experience: string;
  niveau_etudes: string;
  type_contrat: string | null;
  nombre_postes: number;
  statut: string;
};

const TYPE_CLS: Record<string, string> = {
  CDI:        'bg-emerald-50 text-emerald-700 border-emerald-200',
  CDD:        'bg-blue-50 text-blue-700 border-blue-200',
  Stage:      'bg-purple-50 text-purple-700 border-purple-200',
  Freelance:  'bg-orange-50 text-orange-700 border-orange-200',
  Alternance: 'bg-indigo-50 text-indigo-700 border-indigo-200',
};

export function FeaturedJobs() {
  const [offres, setOffres]   = useState<Offre[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8000/offres/')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then((data: Offre[]) => {
        const actives = data
          .filter(o => o.statut === 'active')
          .slice(0, 3);
        setOffres(actives);
      })
      .catch(() => setOffres([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white" id="offres">
      <div className="max-w-7xl mx-auto">

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <p className="text-[#FF6B6B] font-semibold text-xs uppercase tracking-widest mb-3">Recrutement ouvert</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Postes actuellement ouverts
            </h2>
          </div>
          <Link href="/offres" className="flex items-center gap-2 text-[#FF6B6B] font-semibold text-sm hover:gap-3 transition-all whitespace-nowrap">
            Toutes les offres <ArrowRight size={15} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-gray-50 rounded-2xl p-6 animate-pulse h-52" />
            ))}
          </div>
        ) : offres.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Briefcase size={40} className="mx-auto mb-3 opacity-20" />
            <p className="font-medium">Aucun poste ouvert pour le moment</p>
            <p className="text-sm mt-1">Revenez prochainement</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {offres.map(offre => (
              <div key={offre.id} className="group bg-white border border-gray-200 rounded-2xl p-6 hover:border-[#FF6B6B]/50 hover:shadow-md transition-all flex flex-col gap-4">

                {/* Badges */}
                <div className="flex items-center gap-2 flex-wrap">
                  {offre.type_contrat && (
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${TYPE_CLS[offre.type_contrat] ?? 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                      {offre.type_contrat}
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <MapPin size={11} /> Tanger
                  </span>
                </div>

                {/* Titre */}
                <h3 className="font-bold text-gray-900 text-base leading-snug group-hover:text-[#FF6B6B] transition-colors">
                  {offre.title}
                </h3>

                {/* Expérience */}
                {offre.experience && (
                  <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                    <Clock size={12} className="text-[#FF6B6B]" />
                    {offre.experience}
                  </div>
                )}

                {/* Compétences */}
                {offre.competences && (
                  <div className="flex flex-wrap gap-1.5">
                    {offre.competences.split(',').slice(0, 4).map((c, i) => (
                      <span key={i} className="px-2 py-0.5 bg-slate-50 border border-slate-200 text-slate-600 text-xs rounded-md">
                        {c.trim()}
                      </span>
                    ))}
                  </div>
                )}

                {/* CTA */}
                <Link
                  href={`/offres/${offre.id}`}
                  className="mt-auto flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#0D3349] text-white text-sm font-semibold hover:bg-[#0D3349]/85 transition"
                >
                  Voir le poste <ArrowRight size={14} />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
