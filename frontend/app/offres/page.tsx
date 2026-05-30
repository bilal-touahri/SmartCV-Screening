'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Briefcase, Clock, GraduationCap, Users, Calendar,
  Search, ArrowRight,
} from 'lucide-react';
import { LandingNavbar } from '@/components/landing/LandingNavbar';

const TYPE_CONTRAT_CLS: Record<string, string> = {
  CDI:        'bg-emerald-50 text-emerald-700 border-emerald-200',
  CDD:        'bg-blue-50 text-blue-700 border-blue-200',
  Stage:      'bg-purple-50 text-purple-700 border-purple-200',
  Freelance:  'bg-orange-50 text-orange-700 border-orange-200',
  Alternance: 'bg-indigo-50 text-indigo-700 border-indigo-200',
};

type Offre = {
  id: number;
  title: string;
  description: string;
  competences: string;
  experience: string;
  niveau_etudes: string;
  type_contrat: string | null;
  nombre_postes: number;
  date_limite: string | null;
  statut: string;
};

function OffreSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 animate-pulse space-y-3">
      <div className="h-5 bg-gray-200 rounded w-3/4" />
      <div className="h-3 bg-gray-100 rounded w-full" />
      <div className="h-3 bg-gray-100 rounded w-5/6" />
      <div className="flex gap-2 mt-2">
        <div className="h-5 bg-gray-100 rounded-full w-20" />
        <div className="h-5 bg-gray-100 rounded-full w-24" />
      </div>
      <div className="h-9 bg-gray-100 rounded-xl mt-2" />
    </div>
  );
}

function OffreCard({ offre }: { offre: Offre }) {
  return (
    <div className="group bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md hover:border-[#FF6B6B]/40 transition-all p-6 flex flex-col gap-4">
      {/* Titre + badges */}
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-bold text-gray-900 text-base leading-snug group-hover:text-[#FF6B6B] transition-colors">
          {offre.title}
        </h3>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          {offre.type_contrat && (
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${TYPE_CONTRAT_CLS[offre.type_contrat] ?? 'bg-gray-50 text-gray-600 border-gray-200'}`}>
              {offre.type_contrat}
            </span>
          )}
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
            {offre.statut}
          </span>
        </div>
      </div>

      {/* Description courte */}
      <p className="text-gray-500 text-sm leading-relaxed line-clamp-2">{offre.description}</p>

      {/* Compétences */}
      {offre.competences && (
        <div className="flex flex-wrap gap-1.5">
          {offre.competences.split(',').slice(0, 4).map((c, i) => (
            <span key={i} className="px-2 py-0.5 bg-[#0D3349]/6 text-[#0D3349] text-xs font-medium rounded-md border border-[#0D3349]/10">
              {c.trim()}
            </span>
          ))}
        </div>
      )}

      {/* Méta */}
      <div className="grid grid-cols-2 gap-1.5 text-xs text-gray-500">
        {offre.experience && (
          <div className="flex items-center gap-1.5">
            <Clock size={12} className="text-[#FF6B6B] flex-shrink-0" />
            <span className="truncate">{offre.experience}</span>
          </div>
        )}
        {offre.niveau_etudes && (
          <div className="flex items-center gap-1.5">
            <GraduationCap size={12} className="text-[#FF6B6B] flex-shrink-0" />
            <span className="truncate">{offre.niveau_etudes}</span>
          </div>
        )}
        {offre.nombre_postes > 0 && (
          <div className="flex items-center gap-1.5">
            <Users size={12} className="text-[#FF6B6B] flex-shrink-0" />
            <span>{offre.nombre_postes} poste{offre.nombre_postes > 1 ? 's' : ''}</span>
          </div>
        )}
        {offre.date_limite && (
          <div className="flex items-center gap-1.5">
            <Calendar size={12} className="text-[#FF6B6B] flex-shrink-0" />
            <span>{new Date(offre.date_limite).toLocaleDateString('fr-FR')}</span>
          </div>
        )}
      </div>

      {/* CTA */}
      <Link
        href={`/offres/${offre.id}`}
        className="mt-auto flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#0D3349] text-white text-sm font-semibold hover:bg-[#0D3349]/85 transition"
      >
        Voir le détail <ArrowRight size={14} />
      </Link>
    </div>
  );
}

export default function OffresPubliques() {
  const [offres, setOffres]   = useState<Offre[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [search, setSearch]   = useState('');

  useEffect(() => {
    fetch('http://localhost:8000/offres/')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then((data: Offre[]) => setOffres(data))
      .catch(() => setError('Impossible de charger les offres.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = offres.filter(o => {
    const q = search.toLowerCase();
    return (
      o.title.toLowerCase().includes(q) ||
      o.competences.toLowerCase().includes(q) ||
      o.description.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0D3349] to-slate-50">
      <LandingNavbar />

      {/* Hero */}
      <div className="pt-28 pb-12 px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Offres d&apos;emploi
        </h1>
        <p className="text-white/70 text-base max-w-xl mx-auto mb-8">
          Trouvez votre prochain poste parmi les meilleures opportunités tech au Maroc.
        </p>
        <div className="relative max-w-xl mx-auto">
          <Search size={16} className="absolute left-4 top-3.5 text-white/50 pointer-events-none" />
          <input
            type="text"
            placeholder="Titre, compétence, description…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/20 bg-white/10 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]/50 text-sm"
          />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">

        {!loading && !error && (
          <p className="text-sm text-gray-500 mb-6">
            {filtered.length} offre{filtered.length !== 1 ? 's' : ''}
            {search && ` pour « ${search} »`}
          </p>
        )}

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <OffreSkeleton key={i} />)}
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm max-w-lg mx-auto text-center">
            {error}
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="flex flex-col items-center py-20 gap-3 text-gray-400">
            <Briefcase size={48} className="opacity-20" />
            <p className="font-medium">Aucune offre trouvée</p>
            {search && (
              <button onClick={() => setSearch('')} className="text-[#FF6B6B] text-sm hover:underline">
                Effacer la recherche
              </button>
            )}
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filtered.map(offre => <OffreCard key={offre.id} offre={offre} />)}
          </div>
        )}
      </div>
    </div>
  );
}
