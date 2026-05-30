'use client';

import { useEffect, useState } from 'react';
import { Briefcase, Clock, GraduationCap, Users, Loader2 } from 'lucide-react';

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
  date_limite: string | null;
  date_creation: string;
  recruteur_id: number;
};

function getToken() { return localStorage.getItem('access_token'); }

const STATUT_CLS: Record<string, string> = {
  active:   'bg-emerald-50 text-emerald-700 border-emerald-200',
  inactive: 'bg-gray-100 text-gray-500 border-gray-200',
};

const TYPE_CLS: Record<string, string> = {
  CDI:        'bg-emerald-50 text-emerald-700 border-emerald-200',
  CDD:        'bg-blue-50 text-blue-700 border-blue-200',
  Stage:      'bg-purple-50 text-purple-700 border-purple-200',
  Freelance:  'bg-orange-50 text-orange-700 border-orange-200',
  Alternance: 'bg-indigo-50 text-indigo-700 border-indigo-200',
};

export default function AdminOffres() {
  const [offres, setOffres]   = useState<Offre[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [search, setSearch]   = useState('');
  const [filter, setFilter]   = useState<'Toutes' | 'active' | 'inactive'>('Toutes');

  useEffect(() => {
    fetch('http://localhost:8000/offres/', {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => setOffres(data))
      .catch(() => setError('Impossible de charger les offres.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = offres
    .filter(o => filter === 'Toutes' || o.statut === filter)
    .filter(o => {
      const q = search.toLowerCase();
      return !q || o.title.toLowerCase().includes(q) || o.competences.toLowerCase().includes(q);
    });

  return (
    <div className="p-6 space-y-5 bg-gradient-to-br from-slate-50 to-indigo-50/30 min-h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Offres</h1>
          <p className="text-gray-500 text-sm mt-0.5">{offres.length} offres publiées (lecture seule)</p>
        </div>
      </div>

      {/* Filtres + Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2">
          {(['Toutes', 'active', 'inactive'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition capitalize ${filter === f ? 'bg-[#0D3349] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
              {f}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Rechercher par titre ou compétence…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D3349]/30 bg-white"
        />
      </div>

      {error && <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{error}</div>}

      {loading ? (
        <div className="flex items-center justify-center py-16 text-gray-400 gap-2">
          <Loader2 size={18} className="animate-spin" /> Chargement…
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Briefcase size={40} className="mx-auto mb-3 opacity-20" />
          <p className="font-medium">Aucune offre trouvée</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                {['#', 'Titre', 'Compétences', 'Contrat', 'Postes', 'Expérience', 'Statut', 'Publié le'].map(h => (
                  <th key={h} className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(o => (
                <tr key={o.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-4 py-4 text-gray-400 text-xs font-mono">#{o.id}</td>
                  <td className="px-4 py-4">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm leading-tight">{o.title}</p>
                      {o.date_limite && (
                        <p className="text-gray-400 text-xs mt-0.5">Limite: {new Date(o.date_limite).toLocaleDateString('fr-FR')}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {o.competences.split(',').slice(0, 3).map((c, i) => (
                        <span key={i} className="px-1.5 py-0.5 bg-slate-100 text-slate-600 text-xs rounded">
                          {c.trim()}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    {o.type_contrat ? (
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${TYPE_CLS[o.type_contrat] ?? 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                        {o.type_contrat}
                      </span>
                    ) : <span className="text-gray-300 text-xs">—</span>}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1.5 text-gray-600 text-sm">
                      <Users size={13} className="text-gray-400" />
                      {o.nombre_postes}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1.5 text-gray-600 text-sm">
                      <Clock size={13} className="text-gray-400" />
                      {o.experience}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${STATUT_CLS[o.statut] ?? 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                      {o.statut}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-gray-400 text-xs">
                    {new Date(o.date_creation).toLocaleDateString('fr-FR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
